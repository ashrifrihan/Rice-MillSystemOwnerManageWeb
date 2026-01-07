# Requirements Traceability Matrix (RTM)

**Document**: Rice Mill AI System - Functional Requirements  
**Version**: 2.0  
**Date**: December 25, 2025

---

## Executive Summary

This document maps each Functional Requirement (FR) and ChatBot Requirement (CB) to the specific code implementations that fulfill them. The system is designed with **strict separation of concerns**: Core business logic (FR) is independent from the ChatBot interface layer (CB).

---

## ⚡ ARCHITECTURE: Core vs Interface

```
┌─────────────────────────────────────────────────────────┐
│  CHATBOT INTERFACE LAYER (CB Requirements)              │
│  - CB-01: Accept natural language queries               │
│  - CB-02: Interpret user intent                         │
│  - CB-03: Call core services                            │
│  - CB-04: Present results in human-readable format      │
│  - CB-05: Explain confidence & limitations              │
└────────────────┬────────────────────────────────────────┘
                 │ (Calls core services)
┌────────────────▼────────────────────────────────────────┐
│  CORE BUSINESS LOGIC LAYER (FR Requirements)            │
│  - FR-01: Retrieve sales data from Firebase             │
│  - FR-02: Retrieve inventory data from Firebase         │
│  - FR-03: Preprocess data for ML                        │
│  - FR-04: Forecast demand                               │
│  - FR-05: Calculate revenue                             │
│  - FR-06: Store results temporarily                     │
│  - FR-07: Prepare data for visualization                │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 FUNCTIONAL REQUIREMENTS (FR) - Core Business Logic

### FR-01: Retrieve Historical Sales Data from Firebase

**Description**: The system shall retrieve historical sales data from Firebase.

| Aspect | Details |
|--------|---------|
| **Implementation** | `FirebaseDataService.fetchSales()` |
| **Location** | `src/services/firebaseDataService.js` (Lines 50-90) |
| **Code** | ```javascript`async fetchSales() {const q = query(this.salesRef, orderBy('placedOn', 'desc'), limit(1000));const docs = await getDocs(q);return docs.docs.map(doc => ({...doc.data(), id: doc.id}));}``` |
| **Called By** | `FirebaseDataService.fetchAllData()` |
| **Data Format** | Array of sale objects with: `amount`, `quantity`, `product`, `date`, `dealerName` |
| **Error Handling** | Try-catch with fallback empty array |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: System retrieves last 1000 sales records from Firebase

---

### FR-02: Retrieve Historical Inventory Data from Firebase

**Description**: The system shall retrieve historical inventory data from Firebase.

| Aspect | Details |
|--------|---------|
| **Implementation** | `FirebaseDataService.fetchInventory()` |
| **Location** | `src/services/firebaseDataService.js` (Lines 92-130) |
| **Code** | ```javascript`async fetchInventory() {const docs = await getDocs(this.inventoryRef);return docs.docs.map(doc => ({...doc.data(), id: doc.id}));}``` |
| **Called By** | `FirebaseDataService.fetchAllData()` |
| **Data Format** | Array of inventory items with: `currentStock`, `product`, `pricePerKg`, `minimumStock` |
| **Error Handling** | Try-catch with fallback empty array |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: System retrieves all inventory items from Firebase

---

### FR-03: Preprocess Data for ML Prediction

**Description**: The system shall preprocess data for ML prediction.

| Aspect | Details |
|--------|---------|
| **Implementation** | `DemandPredictionService.preprocessHistoricalData()` |
| **Location** | `src/services/demandPredictionService.js` (Lines 30-90) |
| **Preprocessing Steps** | 1. Extract and parse dates<br/>2. Sort chronologically<br/>3. Filter by time window (default 90 days)<br/>4. Calculate confidence metrics |
| **Input Validation** | Checks if data has minimum 7 records |
| **Confidence Calculation** | <7 days: 50% | <30 days: 65% | <90 days: 78% | 90+ days: 85% |
| **Output** | Object containing: `sales`, `inventory`, `metrics`, `dataPoints` |
| **Limitations Set** | Automatically populates based on data availability |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Preprocesses varying data volumes and sets appropriate confidence scores

---

### FR-04: Forecast Rice Demand for Selected Future Period

**Description**: The system shall forecast rice demand for a selected future period.

| Aspect | Details |
|--------|---------|
| **Implementation** | `DemandPredictionService.forecastDemand(period, productFilter)` |
| **Location** | `src/services/demandPredictionService.js` (Lines 93-180) |
| **Algorithms Used** | <ul><li>**Algorithm 1**: Moving Average (last 14 days)</li><li>**Algorithm 2**: Overall Average (all data)</li><li>**Algorithm 3**: Trend Analysis</li><li>**Weighted**: 70% recent + 30% overall + trend factor</li></ul> |
| **Supported Periods** | today, tomorrow, next_week, next_two_weeks, next_month, next_quarter |
| **Trend Factor** | Capped between 0.8 to 1.2 (±20% max) |
| **Product Filtering** | Optional product filter to focus forecast |
| **Output** | `{predictedDailySales, predictedTotalSales, productDemand, confidence}` |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Forecasts demand for all supported periods with trend adjustment

---

### FR-05: Calculate Expected Revenue Based on Forecasted Demand

**Description**: The system shall calculate expected revenue based on forecasted demand.

| Aspect | Details |
|--------|---------|
| **Implementation** | Inside `DemandPredictionService.forecastDemand()` |
| **Location** | `src/services/demandPredictionService.js` (Lines 150-160) |
| **Calculation** | `predictedTotalSales = predictedDailySales × periodDays` |
| **Product-wise Revenue** | `projectedRevenue = (avgDailyRevenue / daysOfData) × periodDays` |
| **Data** | Uses actual selling prices from historical data |
| **Output** | `{predictedTotalSales, totalQty, productDemand[].projectedRevenue}` |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Revenue calculated matches demand × historical price rate

---

### FR-06: Store Prediction Results Temporarily for Visualization

**Description**: The system shall store prediction results temporarily for visualization.

| Aspect | Details |
|--------|---------|
| **Implementation** | `DemandPredictionService.lastPredictionResult` property |
| **Location** | `src/services/demandPredictionService.js` (Lines 162-175) |
| **Storage Method** | In-memory cache (cleared on new prediction) |
| **Stored Data** | Complete prediction object with all metrics, confidence, limitations |
| **Access Method** | `DemandPredictionService.getStoredPredictionResults()` |
| **Lifetime** | Until next prediction request or cache clear |
| **Retrieval** | `DemandPredictionService.getStoredPredictionResults()` |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Results stored and retrievable before new prediction made

---

### FR-07: Display Forecasts Using Charts and Numerical Values

**Description**: The system shall display forecasts using charts and numerical values.

| Aspect | Details |
|--------|---------|
| **Implementation** | `DemandPredictionService.getVisualizationData()` |
| **Location** | `src/services/demandPredictionService.js` (Lines 188-230) |
| **Chart Data Generation** | Generates daily breakdown with labels for all periods |
| **Variation** | Adds ±10% random variation to daily predictions for realism |
| **Data Output** | `{daily: [], total: {}, products: {}, labels: []}` |
| **Visualization Support** | Formats data for Chart.js (Line, Bar, Doughnut, Combined) |
| **UI Implementation** | `AIChat.jsx` renderChart() function (Lines 2290-2370) |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Charts render with correct daily breakdowns and labels

---

## 💬 CHATBOT REQUIREMENTS (CB) - Interface Layer

### CB-01: Accept Natural Language Queries Related to Sales/Demand Prediction

**Description**: The chatbot shall accept natural language queries related to sales and demand prediction.

| Aspect | Details |
|--------|---------|
| **Implementation** | `AIChat.jsx` - `handleSubmit()` function |
| **Location** | `src/components/AIChat.jsx` (Lines 1749-1810) |
| **Query Parsing** | `parseCommand()` and `parseMultilingualCommand()` |
| **Detection Keywords** | "demand", "forecast", "next week", "sales prediction", etc. |
| **Language Support** | English, Tamil, Tanglish |
| **Input Handler** | Text input field with submit button |
| **Example Queries** | <ul><li>"Show demand for next week"</li><li>"Forecast sales for next 30 days"</li><li>"How much rice should I stock?"</li></ul> |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: System accepts and processes natural language demand queries

---

### CB-02: Interpret User Intent Related to Forecasting

**Description**: The chatbot shall interpret user intent related to forecasting.

| Aspect | Details |
|--------|---------|
| **Implementation** | Command parser + intent detection |
| **Location** | `src/services/mlService.js` or `parseCommand()` in AIChat.jsx |
| **Intent Types** | `demand_prediction` (as command type) |
| **Period Extraction** | Regex patterns to extract period keywords |
| **Product Extraction** | Optional product filter from user query |
| **Confidence** | System recognizes forecasting intent with keyword matching |
| **Fallback** | Routes to general AI if intent unclear |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: System correctly identifies forecasting intent from various query phrasings

---

### CB-03: Request Predictive Analytics Results from AI Engine

**Description**: The chatbot shall request predictive analytics results from the AI engine.

| Aspect | Details |
|--------|---------|
| **Implementation** | Chatbot calls `DemandPredictionService.forecastDemand()` |
| **Location** | `src/components/AIChat.jsx` - Case `'demand_prediction'` (Lines 1791-1820) |
| **Service Call** | ```javascript`const predictionResult = await DemandPredictionService.forecastDemand(command.period, command.product);``` |
| **Data Flow** | Chatbot → Service → Firebase Data → Prediction → Return Results |
| **Error Handling** | Catches errors and returns error object |
| **Service Independence** | Service is completely independent of chatbot |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Chatbot successfully requests and receives prediction from service

---

### CB-04: Present Prediction Results in Human-Readable Language

**Description**: The chatbot shall present prediction results in human-readable language.

| Aspect | Details |
|--------|---------|
| **Implementation** | Response formatting in handleSubmit() |
| **Location** | `src/components/AIChat.jsx` (Lines 2121-2150) |
| **Response Format** | Markdown-formatted message with: |
| | - Revenue forecast in local currency |
| | - Daily/total quantities |
| | - Top products with quantities |
| | - Confidence score and data quality |
| | - Limitations and caveats |
| **Emojis** | 💰💵📈📦 for visual emphasis |
| **Translations** | `translateToUserLanguage()` for all supported languages |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: Responses are clear, formatted, and easily understood

---

### CB-05: Explain Prediction Confidence and Limitations

**Description**: The chatbot shall explain prediction confidence and limitations.

| Aspect | Details |
|--------|---------|
| **Implementation** | Three methods: |
| | 1. `getConfidenceExplanation()` - Score + explanation |
| | 2. `getLimitations()` - Data + assumptions + recommendations |
| | 3. Response formatting with detailed caveats |
| **Location** | `src/services/demandPredictionService.js` (Lines 233-280) |
| **Confidence Explanation** | <ul><li>50%: "Very Low - Less than 7 days"</li><li>65%: "Low - Less than 30 days"</li><li>78%: "Moderate - 30-90 days"</li><li>85%: "High - 90+ days"</li></ul> |
| **Data Quality Metrics** | - Number of historical days used<br/>- Algorithm details<br/>- Weighted factors |
| **Limitations Shown** | <ul><li>Data availability</li><li>Seasonality assumptions</li><li>External factors not considered</li><li>Dealer preferences may change</li></ul> |
| **Recommendations** | <ul><li>Use as guidance, not absolute</li><li>Combine with human judgment</li><li>Monitor vs actual weekly</li><li>Adjust as new data arrives</li></ul> |

✅ **Status**: IMPLEMENTED  
📊 **Test Case**: All predictions include confidence explanation and limitations

---

## 🔗 Integration Points

### Service Dependencies

```
AIChat.jsx (CB Layer)
    ↓
DemandPredictionService (Core FR Layer)
    ↓
FirebaseDataService (Data Access)
    ↓
Firebase (Data Source)
```

### Data Flow for Demand Forecast

```
1. User Query (Natural Language)
   ↓
2. CB-01: Query accepted
   ↓
3. CB-02: Intent interpreted as demand_prediction
   ↓
4. Command executed (Lines 1791-1820)
   ↓
5. CB-03: DemandPredictionService.forecastDemand() called
   ↓
6. FR-01/02: Firebase data retrieved
   ↓
7. FR-03: Data preprocessed (confidence calculated)
   ↓
8. FR-04: Demand forecasted (3-algorithm weighted)
   ↓
9. FR-05: Revenue calculated
   ↓
10. FR-06: Results stored in lastPredictionResult
   ↓
11. FR-07: Visualization data prepared
   ↓
12. CB-04: Results formatted for human reading
   ↓
13. CB-05: Confidence & limitations explained
   ↓
14. User sees complete prediction with full transparency
```

---

## 📋 Test Cases & Acceptance Criteria

### Test Case: FR-01 to FR-03
**Title**: Data Retrieval and Preprocessing  
**Steps**:
1. Call `FirebaseDataService.fetchAllData()`
2. Verify sales array contains ≥1 records
3. Verify inventory array contains ≥1 records
4. Call `preprocessHistoricalData()`
5. Check confidence score is set
6. Check limitations array is populated

**Expected Results**: ✅ Data retrieved, preprocessed, confidence calculated

---

### Test Case: FR-04 & FR-05
**Title**: Demand Forecast and Revenue Calculation  
**Steps**:
1. Call `forecastDemand('next_week')`
2. Verify `predictedTotalSales` > 0
3. Verify `predictedTotalQty` > 0
4. Verify `productDemand` has entries
5. Check calculations: `daily × 7 = total`

**Expected Results**: ✅ Forecast generated with correct revenue calculations

---

### Test Case: FR-06 & FR-07
**Title**: Storage and Visualization  
**Steps**:
1. Call `forecastDemand()`
2. Call `getStoredPredictionResults()`
3. Call `getVisualizationData()`
4. Verify daily array has period length entries
5. Verify labels match period

**Expected Results**: ✅ Results stored and visualization data formatted

---

### Test Case: CB-01 to CB-05
**Title**: Complete Chatbot Flow  
**Steps**:
1. User types: "Show demand for next week"
2. System recognizes as demand_prediction
3. System calls prediction service
4. System returns formatted message with:
   - Revenue forecast
   - Top products
   - Confidence (e.g., "78%")
   - Data limitations
   - Recommendations

**Expected Results**: ✅ User sees complete, explained prediction

---

## ✅ Compliance Checklist

| ID | Requirement | Implemented | Location | Status |
|----|-------------|------------|----------|--------|
| FR-01 | Retrieve sales data | ✅ | firebaseDataService.js | COMPLETE |
| FR-02 | Retrieve inventory data | ✅ | firebaseDataService.js | COMPLETE |
| FR-03 | Preprocess data | ✅ | demandPredictionService.js | COMPLETE |
| FR-04 | Forecast demand | ✅ | demandPredictionService.js | COMPLETE |
| FR-05 | Calculate revenue | ✅ | demandPredictionService.js | COMPLETE |
| FR-06 | Store results | ✅ | demandPredictionService.js | COMPLETE |
| FR-07 | Display with charts | ✅ | AIChat.jsx (renderChart) | COMPLETE |
| CB-01 | Accept NL queries | ✅ | AIChat.jsx (handleSubmit) | COMPLETE |
| CB-02 | Interpret intent | ✅ | parseCommand() | COMPLETE |
| CB-03 | Request analytics | ✅ | AIChat.jsx (case demand_prediction) | COMPLETE |
| CB-04 | Present results | ✅ | Response formatting (Lines 2121-2150) | COMPLETE |
| CB-05 | Explain confidence | ✅ | demandPredictionService.js (CB-05 methods) | COMPLETE |

---

## 🚀 How to Use This Traceability Matrix

1. **For Testing**: Use the test cases section to verify each requirement
2. **For Development**: Reference locations show where to make changes
3. **For Documentation**: This matrix is the single source of truth for requirements
4. **For Auditing**: Every FR/CB is mapped to code with line numbers
5. **For Maintenance**: Future changes should update this matrix

---

## 📞 Requirement Change Process

If requirements change:
1. Update this matrix with new/modified requirement
2. Update implementation code
3. Update line numbers and code references
4. Update test cases
5. Mark new status (IMPLEMENTED, IN-PROGRESS, PENDING)

---

**Document Owner**: AI System Lead  
**Last Updated**: December 25, 2025  
**Next Review**: When requirements change or quarterly
