# ml_service/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import json
import os

app = FastAPI(
    title="Rice Mill ML Intelligence Engine",
    description="Machine Learning models for business predictions",
    version="2.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for data validation
class SaleRecord(BaseModel):
    date: str
    amount: float
    product: Optional[str] = None
    quantity: Optional[float] = None
    customer: Optional[str] = None

class InventoryItem(BaseModel):
    product: str
    currentStock: float
    dailyConsumption: Optional[float] = None
    reorderLevel: Optional[float] = None
    minimumStock: Optional[float] = None
    pricePerKg: Optional[float] = None
    category: Optional[str] = None

class LoanRecord(BaseModel):
    customer: str
    outstandingAmount: float
    overdueDays: Optional[int] = 0
    loanDate: Optional[str] = None
    dueDate: Optional[str] = None
    interestRate: Optional[float] = None
    pastDefaults: Optional[int] = 0
    customerType: Optional[str] = "retail"

class WorkerRecord(BaseModel):
    name: str
    dailyWage: float
    attendance: Optional[float] = None
    productivity: Optional[float] = None
    skillLevel: Optional[str] = "medium"

class MLRequest(BaseModel):
    sales: List[SaleRecord] = []
    inventory: List[InventoryItem] = []
    loans: List[LoanRecord] = []
    workers: List[WorkerRecord] = []
    request_type: str = "full_analysis"

class MLResponse(BaseModel):
    success: bool
    message: str
    sales_forecast: Optional[Dict] = None
    stock_predictions: Optional[List] = None
    credit_risk: Optional[List] = None
    operational_insights: Optional[Dict] = None
    business_recommendations: Optional[List] = None
    ml_metrics: Optional[Dict] = None

# ML Models
class SalesForecaster:
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def prepare_features(self, sales_data):
        """Prepare time-series features from sales data"""
        if len(sales_data) < 7:
            return None, None
            
        df = pd.DataFrame([s.dict() for s in sales_data])
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df = df.set_index('date')
        
        # Resample to daily frequency
        daily_sales = df['amount'].resample('D').sum().fillna(0)
        
        # Create features
        features = []
        targets = []
        
        window_size = 7
        for i in range(len(daily_sales) - window_size):
            window = daily_sales[i:i+window_size].values
            target = daily_sales[i+window_size]
            
            # Basic features
            feature_vector = [
                window.mean(),  # mean sales
                window.std(),   # std sales
                window.max(),   # max sales
                window.min(),   # min sales
                i % 7,          # day of week
                len([x for x in window if x > 0])  # active days
            ]
            
            features.append(feature_vector)
            targets.append(target)
        
        return np.array(features), np.array(targets)
    
    def train(self, sales_data):
        """Train the sales forecasting model"""
        X, y = self.prepare_features(sales_data)
        if X is None or len(X) < 10:
            return False
            
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True
        return True
    
    def predict(self, sales_data, days=7):
        """Predict sales for next n days"""
        # Ensure model + scaler are fitted; if insufficient data, bail gracefully
        if not self.is_trained:
            trained = self.train(sales_data)
            if not trained:
                return None
            
        X, y = self.prepare_features(sales_data)
        if X is None or len(X) == 0:
            return None
        
        # Safety: if scaler/model somehow not fitted, fit on available window
        if not hasattr(self.scaler, 'mean_'):
            self.scaler.fit(X)
        if not hasattr(self.model, 'coef_'):
            self.model.fit(self.scaler.transform(X), y)
            self.is_trained = True
            
        last_features = X[-1].reshape(1, -1)
        last_features_scaled = self.scaler.transform(last_features)
        
        predictions = []
        for i in range(days):
            pred = self.model.predict(last_features_scaled)[0]
            predictions.append(max(0, pred))  # Ensure non-negative
            
            # Update features for next prediction
            new_features = last_features.copy()
            new_features[0][0] = (new_features[0][0] * 6 + pred) / 7  # Update mean
            new_features[0][4] = (new_features[0][4] + 1) % 7  # Update day of week
            last_features_scaled = self.scaler.transform(new_features)
        
        confidence = self.model.score(
            self.scaler.transform(X), 
            self.prepare_features(sales_data)[1][:len(X)]
        ) if len(X) > 10 else 0.75
        
        return {
            "predictions": [float(p) for p in predictions],
            "confidence": float(max(0, min(1, confidence))),
            "model": "LinearRegression",
            "features_used": 6
        }

class StockRiskPredictor:
    def __init__(self):
        self.consumption_model = RandomForestClassifier(n_estimators=50, random_state=42)
        self.risk_categories = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
        
    def calculate_consumption_pattern(self, sales_data, inventory_data):
        """Calculate daily consumption from sales data"""
        if not sales_data or not inventory_data:
            return {}
            
        df = pd.DataFrame([s.dict() for s in sales_data])
        df['date'] = pd.to_datetime(df['date'])
        
        consumption_by_product = {}
        for product in [i.product for i in inventory_data]:
            product_sales = df[df['product'] == product]
            if len(product_sales) > 0:
                daily_avg = product_sales.groupby('date')['quantity'].sum().mean()
                consumption_by_product[product] = max(1, daily_avg or 10)
        
        return consumption_by_product
    
    def predict_stock_risk(self, inventory_data, consumption_patterns):
        """Predict stock depletion risk"""
        predictions = []
        
        for item in inventory_data:
            item_dict = item.dict()
            product = item_dict['product']
            current_stock = item_dict['currentStock']
            
            # Calculate daily consumption
            daily_consumption = item_dict.get('dailyConsumption') or \
                            consumption_patterns.get(product) or \
                            10  # Default
            
            # Safety stock calculation
            safety_stock = item_dict.get('minimumStock') or \
                        item_dict.get('reorderLevel') or \
                        daily_consumption * 7
            
            # Lead time estimation (days)
            lead_time = 5  # Default lead time
            
            # Days until safety stock is reached
            if daily_consumption > 0:
                days_to_safety = (current_stock - safety_stock) / daily_consumption
            else:
                days_to_safety = float('inf')
            
            # Days until stockout
            days_to_empty = current_stock / daily_consumption if daily_consumption > 0 else float('inf')
            
            # Risk classification
            if days_to_empty < lead_time:
                risk_level = "CRITICAL"
            elif days_to_safety < lead_time * 1.5:
                risk_level = "HIGH"
            elif days_to_safety < lead_time * 3:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
            
            # Recommended order quantity
            if risk_level in ["CRITICAL", "HIGH"]:
                recommended_order = max(
                    safety_stock * 2 - current_stock,
                    daily_consumption * lead_time * 1.2
                )
            else:
                recommended_order = 0
            
            predictions.append({
                "product": product,
                "current_stock": float(current_stock),
                "daily_consumption": float(daily_consumption),
                "safety_stock": float(safety_stock),
                "days_to_safety": float(days_to_safety),
                "days_to_empty": float(days_to_empty),
                "risk_level": risk_level,
                "recommended_order": float(recommended_order),
                "urgency": "IMMEDIATE" if risk_level == "CRITICAL" else "PLAN" if risk_level == "HIGH" else "MONITOR"
            })
        
        return predictions

class CreditRiskAnalyzer:
    def __init__(self):
        self.risk_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        
    def prepare_loan_features(self, loan_data, sales_data):
        """Prepare features for credit risk analysis"""
        features = []
        labels = []
        customer_sales = {}
        
        # Calculate customer sales from sales data
        if sales_data:
            sales_df = pd.DataFrame([s.dict() for s in sales_data])
            customer_sales = sales_df.groupby('customer')['amount'].sum().to_dict()
        
        for loan in loan_data:
            loan_dict = loan.dict()
            
            # Feature engineering
            amount = loan_dict['outstandingAmount']
            overdue = loan_dict.get('overdueDays', 0)
            past_defaults = loan_dict.get('pastDefaults', 0)
            
            # Customer's total purchases
            customer_total = customer_sales.get(loan_dict['customer'], 0)
            
            # Credit utilization ratio
            credit_ratio = amount / max(1, customer_total)
            
            # Payment behavior score
            payment_score = 100 - min(100, overdue * 2 + past_defaults * 20)
            
            # Risk label (simulated - in real system this would be historical data)
            if overdue > 30 or past_defaults > 0 or credit_ratio > 2:
                risk_label = 1  # High risk
            else:
                risk_label = 0  # Low risk
            
            features.append([
                amount / 10000,  # Normalized amount
                overdue / 30,    # Normalized overdue days
                past_defaults,
                credit_ratio,
                payment_score / 100,
                1 if loan_dict.get('customerType') == 'wholesale' else 0
            ])
            labels.append(risk_label)
        
        return np.array(features), np.array(labels)
    
    def analyze_risk(self, loan_data, sales_data):
        """Analyze credit risk for all loans"""
        if len(loan_data) < 5:
            return self._basic_risk_analysis(loan_data)
        
        try:
            X, y = self.prepare_loan_features(loan_data, sales_data)
            if len(X) > 10:
                X_scaled = self.scaler.fit_transform(X)
                self.risk_model.fit(X_scaled, y)
                
                predictions = self.risk_model.predict_proba(X_scaled)
                feature_importance = self.risk_model.feature_importances_
            else:
                return self._basic_risk_analysis(loan_data)
        except:
            return self._basic_risk_analysis(loan_data)
        
        results = []
        for idx, loan in enumerate(loan_data):
            loan_dict = loan.dict()
            
            if idx < len(predictions):
                risk_prob = predictions[idx][1]  # Probability of high risk
            else:
                risk_prob = self._calculate_basic_risk(loan_dict)
            
            # Convert probability to risk level
            if risk_prob > 0.7:
                risk_level = "HIGH"
            elif risk_prob > 0.4:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
            
            results.append({
                "customer": loan_dict['customer'],
                "outstanding_amount": float(loan_dict['outstandingAmount']),
                "overdue_days": loan_dict.get('overdueDays', 0),
                "past_defaults": loan_dict.get('pastDefaults', 0),
                "risk_score": float(risk_prob * 100),
                "risk_level": risk_level,
                "recommended_action": self._get_recommended_action(risk_level, loan_dict)
            })
        
        return results
    
    def _basic_risk_analysis(self, loan_data):
        """Basic rule-based risk analysis for small datasets"""
        results = []
        for loan in loan_data:
            loan_dict = loan.dict()
            risk_score = self._calculate_basic_risk(loan_dict)
            
            if risk_score > 70:
                risk_level = "HIGH"
            elif risk_score > 40:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
            
            results.append({
                "customer": loan_dict['customer'],
                "outstanding_amount": float(loan_dict['outstandingAmount']),
                "overdue_days": loan_dict.get('overdueDays', 0),
                "past_defaults": loan_dict.get('pastDefaults', 0),
                "risk_score": float(risk_score),
                "risk_level": risk_level,
                "recommended_action": self._get_recommended_action(risk_level, loan_dict),
                "method": "rule_based"
            })
        
        return results
    
    def _calculate_basic_risk(self, loan_dict):
        """Calculate basic risk score using rules"""
        score = 0
        score += min(loan_dict.get('overdueDays', 0) * 2, 40)
        score += loan_dict.get('pastDefaults', 0) * 20
        if loan_dict['outstandingAmount'] > 50000:
            score += 20
        if loan_dict.get('customerType') == 'new':
            score += 10
        
        return min(100, score)
    
    def _get_recommended_action(self, risk_level, loan_dict):
        """Get recommended action based on risk level"""
        if risk_level == "HIGH":
            return "Immediate collection action required"
        elif risk_level == "MEDIUM":
            return "Schedule payment reminder and follow-up"
        else:
            return "Monitor regularly"

class OperationalAnalyzer:
    def analyze_efficiency(self, workers, sales_data):
        """Analyze operational efficiency"""
        if not workers:
            return {"efficiency_score": 0.75, "insights": []}
        
        total_wage = sum(w.dailyWage for w in workers)
        total_workers = len(workers)
        
        # Calculate average sales per worker
        total_sales = sum(s.amount for s in sales_data) if sales_data else 0
        avg_sales_per_worker = total_sales / max(1, total_workers)
        
        # Efficiency score (0-1)
        if total_wage > 0:
            efficiency = min(1, (avg_sales_per_worker / 1000) / (total_wage / 100))
        else:
            efficiency = 0.75
        
        insights = []
        
        # Skill analysis
        skilled_count = sum(1 for w in workers if w.skillLevel in ['high', 'expert'])
        if skilled_count / total_workers < 0.3:
            insights.append("Consider training programs to increase skilled workforce")
        
        # Wage analysis
        avg_wage = total_wage / total_workers
        if any(w.dailyWage > avg_wage * 1.5 for w in workers):
            insights.append("Review wage structure for consistency")
        
        return {
            "efficiency_score": float(efficiency),
            "avg_wage": float(avg_wage),
            "skilled_ratio": float(skilled_count / total_workers),
            "insights": insights,
            "recommendations": [
                "Cross-train workers for flexibility",
                "Implement performance-based incentives",
                "Regular skill assessment and training"
            ]
        }

# Initialize ML models
sales_forecaster = SalesForecaster()
stock_predictor = StockRiskPredictor()
credit_analyzer = CreditRiskAnalyzer()
operational_analyzer = OperationalAnalyzer()

@app.post("/api/ml/analyze", response_model=MLResponse)
async def analyze_data(request: MLRequest):
    """Main endpoint for ML analysis"""
    try:
        results = {}
        
        # 1. Sales Forecasting (ML Model)
        if request.sales and len(request.sales) >= 7:
            sales_forecast = sales_forecaster.predict(request.sales)
            if sales_forecast:
                results["sales_forecast"] = sales_forecast
        
        # 2. Stock Risk Prediction
        if request.inventory:
            consumption_patterns = stock_predictor.calculate_consumption_pattern(
                request.sales, request.inventory
            )
            stock_predictions = stock_predictor.predict_stock_risk(
                request.inventory, consumption_patterns
            )
            results["stock_predictions"] = stock_predictions
        
        # 3. Credit Risk Analysis
        if request.loans:
            credit_risk = credit_analyzer.analyze_risk(request.loans, request.sales)
            results["credit_risk"] = credit_risk
        
        # 4. Operational Efficiency
        if request.workers:
            operational_insights = operational_analyzer.analyze_efficiency(
                request.workers, request.sales
            )
            results["operational_insights"] = operational_insights
        
        # 5. Generate business recommendations
        recommendations = generate_recommendations(results)
        results["business_recommendations"] = recommendations
        
        # 6. Calculate ML metrics
        ml_metrics = calculate_ml_metrics(results)
        results["ml_metrics"] = ml_metrics
        
        return MLResponse(
            success=True,
            message="ML analysis completed successfully",
            **results
        )
        
    except Exception as e:
        return MLResponse(
            success=False,
            message=f"ML analysis failed: {str(e)}",
            sales_forecast=None,
            stock_predictions=None,
            credit_risk=None,
            operational_insights=None,
            business_recommendations=[],
            ml_metrics={"error": str(e)}
        )

def generate_recommendations(results):
    """Generate business recommendations based on ML results"""
    recommendations = []
    
    # Sales recommendations
    if results.get("sales_forecast"):
        forecast = results["sales_forecast"]
        if forecast["confidence"] > 0.8:
            avg_pred = sum(forecast["predictions"]) / len(forecast["predictions"])
            recommendations.append(
                f"High-confidence sales forecast suggests average daily sales of Rs.{avg_pred:,.0f}"
            )
    
    # Stock recommendations
    if results.get("stock_predictions"):
        critical_items = [p for p in results["stock_predictions"] if p["risk_level"] == "CRITICAL"]
        if critical_items:
            recommendations.append(
                f"Immediate attention required for {len(critical_items)} critical stock items"
            )
    
    # Credit risk recommendations
    if results.get("credit_risk"):
        high_risk_loans = [c for c in results["credit_risk"] if c["risk_level"] == "HIGH"]
        if high_risk_loans:
            recommendations.append(
                f"Review credit terms for {len(high_risk_loans)} high-risk customers"
            )
    
    # Operational recommendations
    if results.get("operational_insights"):
        ops = results["operational_insights"]
        if ops["efficiency_score"] < 0.7:
            recommendations.append(
                "Consider operational improvements to increase efficiency"
            )
    
    # Add general recommendations
    recommendations.extend([
        "Regularly review ML predictions and adjust business strategies accordingly",
        "Maintain sufficient data quality for accurate ML predictions",
        "Combine ML insights with human expertise for best decisions"
    ])
    
    return recommendations[:5]  # Return top 5 recommendations

def calculate_ml_metrics(results):
    """Calculate metrics for ML model performance"""
    metrics = {
        "models_used": [],
        "total_predictions": 0,
        "avg_confidence": 0,
        "data_quality": "good"
    }
    
    # Count predictions
    if results.get("sales_forecast"):
        metrics["models_used"].append("sales_forecasting")
        metrics["total_predictions"] += len(results["sales_forecast"]["predictions"])
        metrics["avg_confidence"] += results["sales_forecast"]["confidence"]
    
    if results.get("stock_predictions"):
        metrics["models_used"].append("stock_risk")
        metrics["total_predictions"] += len(results["stock_predictions"])
    
    if results.get("credit_risk"):
        metrics["models_used"].append("credit_risk")
        metrics["total_predictions"] += len(results["credit_risk"])
    
    if metrics["avg_confidence"] > 0:
        metrics["avg_confidence"] /= len([m for m in metrics["models_used"] if m == "sales_forecasting"])
    
    return metrics

@app.get("/api/ml/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Rice Mill ML Engine",
        "version": "2.0",
        "models_ready": True,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/ml/info")
async def get_model_info():
    """Get information about ML models"""
    return {
        "models": [
            {
                "name": "Sales Forecaster",
                "type": "Supervised Learning",
                "algorithm": "Linear Regression",
                "purpose": "Predict future sales trends"
            },
            {
                "name": "Stock Risk Predictor",
                "type": "Classification + Rules",
                "algorithm": "Random Forest + Heuristics",
                "purpose": "Predict stock depletion risks"
            },
            {
                "name": "Credit Risk Analyzer",
                "type": "Supervised Classification",
                "algorithm": "Random Forest Classifier",
                "purpose": "Assess credit default risk"
            },
            {
                "name": "Operational Analyzer",
                "type": "Analytical Engine",
                "algorithm": "Statistical Analysis",
                "purpose": "Analyze workforce efficiency"
            }
        ],
        "capabilities": [
            "Time-series forecasting",
            "Risk classification",
            "Pattern recognition",
            "Business intelligence"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
