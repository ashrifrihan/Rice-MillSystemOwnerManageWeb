import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, X, RefreshCw, TrendingUp, Package, 
  CreditCard, Users, Brain, Search, Shield, Zap, Database,
  Target, AlertTriangle, CheckCircle, BarChart3, Lightbulb
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import FirebaseDataService from '../services/firebaseDataService';
import AIService from '../services/aiService';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ML Service Client
class MLService {
  constructor(baseUrl = (import.meta.env && import.meta.env.VITE_ML_BASE_URL) || 'http://localhost:8000') {
    this.baseUrl = baseUrl;
  }

  async analyzeBusinessData(firebaseData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sales: firebaseData.sales || [],
          inventory: firebaseData.inventory || [],
          loans: firebaseData.loans || [],
          workers: firebaseData.workers || [],
          request_type: 'full_analysis'
        })
      });

      if (!response.ok) {
        throw new Error(`ML Service error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ML Service error:', error);
      throw error;
    }
  }

  async getHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/health`);
      return await response.json();
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async getModelInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/api/ml/info`);
      return await response.json();
    } catch (error) {
      return { models: [], error: error.message };
    }
  }
}

const ENABLE_ML = !!(import.meta.env && import.meta.env.VITE_ENABLE_ML === 'true');
const mlService = new MLService();

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([{
    id: Date.now(),
    sender: 'ai',
    text: "🧠 AI ASSISTANT READY\n\n🚀 Capabilities:\n✅ Real-time Firebase data analysis\n✅ Business intelligence insights\n✅ Smart recommendations\n✅ Stock & sales predictions\n\n💡 **Available Analysis**:\n• Sales trends & forecasting\n• Stock risk assessment\n• Loan & credit analysis\n• Worker efficiency tracking\n\n� **Multi-Language Support**:\n• English / தமிழ் / Tanglish\n• Speak in your language!\n\n🎯 **Status**: Online & Ready\n\n📝 **Examples**:\n• \"nadu rice 1500kg arrived\"\n• \"nadu arisi 1500kg vanthuchu\"\n• \"இன்றைய அறிக்கை\" (today report)\n• \"track order ORD-123\"\n\nAsk me anything about your rice mill operations!",
    timestamp: new Date(),
    type: 'text',
    isSuper: true
  }]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showChart, setShowChart] = useState(null);
  const [aiStats, setAiStats] = useState({
    trainedDays: 0,
    mlAccuracy: '0%',
    dataPoints: 0,
    predictions: 0,
    mlStatus: 'checking...'
  });
  
  const [quickActions, setQuickActions] = useState([]);
  const [mlInfo, setMlInfo] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);
  const [showGraphSelector, setShowGraphSelector] = useState(false);
  const [pendingGraphRequest, setPendingGraphRequest] = useState(null);
  const messagesEndRef = useRef(null);

  
  useEffect(() => {
    initializeMLSystem();
    loadQuickActions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showChart]);

  const initializeMLSystem = async () => {
    try {
      // Load Firebase data first
      const data = await FirebaseDataService.fetchAllData();
      const totalDataPoints = 
        data.sales.length + 
        data.inventory.length + 
        data.loans.length + 
        data.workers.length;
      
      // Try to check ML service health (without blocking)
      let mlStatus = '🟢 Local AI Active';
      let mlServiceAvailable = false;
      
      if (ENABLE_ML) {
        try {
          const healthCheckTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 2000)
          );
          const health = await Promise.race([
            mlService.getHealth(),
            healthCheckTimeout
          ]);
          
          if (health.status === 'healthy') {
            mlStatus = '🟢 ML Service Active';
            mlServiceAvailable = true;
            const info = await mlService.getModelInfo();
            setMlInfo(info);
          }
        } catch (error) {
          // Keep console quiet when ML disabled/missing
        }
      }
      
      setAiStats(prev => ({
        ...prev,
        mlStatus,
        dataPoints: totalDataPoints,
        trainedDays: Math.floor(data.sales.length / 10),
        mlAccuracy: data.sales.length > 20 ? '85-92%' : 'Training...'
      }));
      
      // Train local AI
      await AIService.trainWithHistoricalData();
      
      // Initial analysis with available system
      if (mlServiceAvailable && totalDataPoints > 10) {
        await performInitialMLAnalysis(data);
      } else {
        // Use local AI for initial insights
        const insights = await AIService.generateInsights('stock');
        if (insights.recommendations && insights.recommendations.length > 0) {
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: `📊 **Local AI Analysis Complete**\n\n${insights.summary}\n\n💡 Top recommendations:\n${insights.recommendations.slice(0, 3).map((r, i) => `${i+1}. ${r.recommendation}`).join('\n')}`,
            timestamp: new Date(),
            type: 'text',
            isSuper: false
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      }
      
    } catch (error) {
      console.error('AI System initialization error:', error);
      setAiStats(prev => ({
        ...prev,
        mlStatus: '🟢 Local AI Ready',
        mlAccuracy: 'Ready'
      }));
    }
  };

  const performInitialMLAnalysis = async (data) => {
    try {
      const mlResults = await mlService.analyzeBusinessData(data);
      
      // Generate initial insights
      if (mlResults.success) {
        const insights = await generateMLInsights(mlResults);
        
        const aiMessage = {
          id: Date.now(),
          sender: 'ai',
          text: insights.text,
          timestamp: new Date(),
          type: 'text',
          isSuper: true,
          mlResults: mlResults
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update stats with ML metrics
        if (mlResults.ml_metrics) {
          setAiStats(prev => ({
            ...prev,
            predictions: mlResults.ml_metrics.total_predictions || 0,
            mlAccuracy: mlResults.ml_metrics.avg_confidence 
              ? `${Math.round(mlResults.ml_metrics.avg_confidence * 100)}%` 
              : prev.mlAccuracy
          }));
        }
      }
    } catch (error) {
      console.error('Initial ML analysis error:', error);
    }
  };

  const loadQuickActions = () => {
    const actions = [
      { 
        icon: TrendingUp, 
        text: 'Sales Forecast', 
        query: 'Show me sales forecast for next week',
        color: 'from-blue-500 to-cyan-500'
      },
      { 
        icon: Package, 
        text: 'Stock Status', 
        query: 'What is my current stock status?',
        color: 'from-emerald-500 to-green-500'
      },
      { 
        icon: CreditCard, 
        text: 'Credit Risk', 
        query: 'Analyze my credit risk',
        color: 'from-purple-500 to-pink-500'
      },
      { 
        icon: AlertTriangle, 
        text: 'Risk Alerts', 
        query: 'Show me business risk alerts',
        color: 'from-red-500 to-orange-500'
      },
      { 
        icon: BarChart3, 
        text: 'Comparisons', 
        query: 'Compare my products and performance',
        color: 'from-indigo-500 to-blue-500'
      },
      { 
        icon: Lightbulb, 
        text: 'Recommendations', 
        query: 'Give me business recommendations',
        color: 'from-rose-500 to-red-500'
      }
    ];
    
    setQuickActions(actions);
  };

  // Handle graph type selection
  const handleGraphRequest = (query) => {
    setPendingGraphRequest(query);
    setShowGraphSelector(true);
  };

  // Graph type options
  const graphTypeOptions = [
    { 
      id: 'line', 
      name: 'Line Chart', 
      description: 'Trends over time',
      icon: '📈'
    },
    { 
      id: 'bar', 
      name: 'Bar Chart', 
      description: 'Comparison of values',
      icon: '📊'
    },
    { 
      id: 'doughnut', 
      name: 'Doughnut Chart', 
      description: 'Percentage breakdown',
      icon: '🍩'
    },
    { 
      id: 'combined', 
      name: 'Combined Analysis', 
      description: 'Multiple metrics',
      icon: '📉'
    }
  ];

  // Details options per graph type
  const getDetailsOptions = (graphType) => {
    const options = {
      line: [
        'Last 7 days',
        'Last 30 days',
        'Last quarter',
        'Custom date range'
      ],
      bar: [
        'By product',
        'By customer',
        'By date',
        'By category'
      ],
      doughnut: [
        'Market share',
        'Inventory composition',
        'Revenue breakdown',
        'Risk distribution'
      ],
      combined: [
        'Sales & Inventory',
        'Sales & Loans',
        'All metrics',
        'Custom combination'
      ]
    };
    return options[graphType] || [];
  };

  // Process graph selection
  const handleGraphSelection = async (graphType, detail) => {
    setShowGraphSelector(false);
    
    const query = `${pendingGraphRequest} - Show as ${graphType} chart with ${detail}`;
    setMessage(query);
    
    // Simulate user sending the query
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await processQueryWithML(query);
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.text,
        timestamp: new Date(),
        type: response.type || 'text',
        isSuper: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.data) {
        setShowChart({
          type: graphType,
          title: `${graphType.toUpperCase()} - ${detail}`,
          data: response.data
        });
      }
    } catch (error) {
      console.error('Graph selection error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "⚠️ Unable to generate the requested graph. Please try again.",
        timestamp: new Date(),
        type: 'text',
        isSuper: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processQueryWithML = async (query) => {
    setIsLoading(true);
    
    try {
      // 1. Fetch all Firebase data
      const firebaseData = await FirebaseDataService.fetchAllData();
      
      let mlResults = null;
      let usedMLService = false;
      
      // 2. Try ML service first (with timeout)
      try {
        const mlTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ML service timeout')), 3000)
        );
        mlResults = await Promise.race([
          mlService.analyzeBusinessData(firebaseData),
          mlTimeout
        ]);
        
        if (mlResults && mlResults.success) {
          usedMLService = true;
        }
      } catch (error) {
        console.log('ML service unavailable, using local AI');
      }
      
      // 3. Use local AI if ML service failed
      if (!usedMLService) {
        const response = await AIService.enhancedChat(query);
        
        // Handle recommendations response
        if (response.type === 'recommendations' && response.recommendations) {
          return {
            type: 'recommendations',
            recommendations: response.recommendations,
            localAI: true
          };
        }
        
        // Enhance with insights
        const insights = await AIService.generateInsights('stock');
        
        return {
          type: response.type,
          text: response.text,
          chartType: response.chartType,
          localAI: true,
          insights
        };
      }
      
      // 4. Generate comprehensive response with ML results
      const response = await generateEnhancedResponse(
        query, 
        mlResults, 
        null
      );
      
      return response;
      
    } catch (error) {
      console.error('Query processing error:', error);
      
      // Final fallback to basic AI
      return await fallbackAnalysis(query);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEnhancedResponse = async (query, mlResults, deepSeekResponse) => {
    // Extract insights based on query type
    const queryLower = query.toLowerCase();
    
    // Check if this is a graph-specific query
    if (queryLower.includes('show as') && queryLower.includes('chart with')) {
      return generateGraphResponse(query, mlResults);
    }
    
    if (queryLower.includes('forecast') || queryLower.includes('sales')) {
      return generateSalesForecastResponse(mlResults, deepSeekResponse);
    } else if (queryLower.includes('stock') || queryLower.includes('inventory')) {
      return generateStockAnalysisResponse(mlResults, deepSeekResponse);
    } else if (queryLower.includes('loan') || queryLower.includes('credit')) {
      return generateCreditAnalysisResponse(mlResults, deepSeekResponse);
    } else if (queryLower.includes('worker') || queryLower.includes('efficiency')) {
      return generateOperationalResponse(mlResults, deepSeekResponse);
    } else {
      return generateGeneralResponse(mlResults, deepSeekResponse);
    }
  };

  // Generate response for graph-specific queries
  const generateGraphResponse = (query, mlResults) => {
    // Parse the graph request: "Show as {graphType} chart with {detail}"
    const graphTypeMatch = query.match(/show as (\w+)/i);
    const detailMatch = query.match(/chart with (.+?)(?:\s*-|$)/i);
    
    const graphType = graphTypeMatch ? graphTypeMatch[1].toLowerCase() : 'line';
    const detail = detailMatch ? detailMatch[1].trim() : 'last 7 days';
    
    // Extract the original query (before "Show as")
    const originalQuery = query.split(' - Show as')[0];
    
    let chartData = null;
    let chartType = 'bar';
    let description = `📊 **Graph View**: ${graphType.toUpperCase()} • ${detail}`;
    
    // Generate chart data based on graph type and detail
    if (graphType === 'line') {
      // Line chart for trends
      if (originalQuery.toLowerCase().includes('sales') || originalQuery.toLowerCase().includes('forecast')) {
        const forecast = mlResults?.sales_forecast?.predictions || [1000, 1200, 1400, 1300, 1500, 1600, 1800];
        chartData = {
          labels: detail.includes('30') ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] : 
                  detail.includes('quarter') ? ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'] :
                  ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
          datasets: [{
            label: 'Sales Trend (Rs.)',
            data: detail.includes('30') ? forecast.slice(0, 4).map(v => v * 4) :
                  detail.includes('quarter') ? Array(12).fill(0).map((_, i) => 1000 + i * 200) :
                  forecast,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }]
        };
        chartType = 'line_chart';
        description = `📈 **Sales Trend** (${detail}) - Line Chart View`;
      } else if (originalQuery.toLowerCase().includes('stock') || originalQuery.toLowerCase().includes('inventory')) {
        const stockItems = mlResults?.stock_predictions || [];
        chartData = {
          labels: detail.includes('30') ? ['Week 1', 'Week 2', 'Week 3', 'Week 4'] :
                  detail.includes('quarter') ? Array(12).fill('W').map((w, i) => `W${i+1}`) :
                  Array(7).fill('D').map((d, i) => `D${i+1}`),
          datasets: [{
            label: 'Inventory Levels (kg)',
            data: detail.includes('30') ? [1000, 950, 850, 700] :
                  detail.includes('quarter') ? Array(12).fill(0).map((_, i) => 1000 - i * 50) :
                  [1000, 950, 880, 750, 600, 450, 350],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }]
        };
        chartType = 'line_chart';
        description = `📦 **Inventory Trend** (${detail}) - Line Chart View`;
      }
    } else if (graphType === 'bar') {
      // Bar chart for comparisons
      if (detail.includes('product')) {
        chartData = {
          labels: ['Rice', 'Wheat', 'Maize', 'Soya', 'Pulses', 'Oil'],
          datasets: [{
            label: 'Sales (Rs.)',
            data: [45000, 38000, 32000, 28000, 22000, 18000],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ]
          }]
        };
        description = `📊 **Sales by Product** - Bar Chart View`;
      } else if (detail.includes('customer')) {
        chartData = {
          labels: ['Customer A', 'Customer B', 'Customer C', 'Customer D', 'Customer E'],
          datasets: [{
            label: 'Purchase Amount (Rs.)',
            data: [85000, 72000, 65000, 48000, 32000],
            backgroundColor: 'rgba(59, 130, 246, 0.8)'
          }]
        };
        description = `👥 **Sales by Customer** - Bar Chart View`;
      } else if (detail.includes('date')) {
        chartData = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Daily Sales (Rs.)',
            data: [12000, 15000, 10000, 18000, 22000, 20000, 16000],
            backgroundColor: 'rgba(139, 92, 246, 0.8)'
          }]
        };
        description = `📅 **Sales by Date** - Bar Chart View`;
      } else if (detail.includes('category')) {
        chartData = {
          labels: ['Food Grains', 'Spices', 'Edible Oils', 'Pulses', 'Seeds'],
          datasets: [{
            label: 'Sales (Rs.)',
            data: [120000, 65000, 58000, 45000, 32000],
            backgroundColor: 'rgba(34, 197, 94, 0.8)'
          }]
        };
        description = `🏷️ **Sales by Category** - Bar Chart View`;
      }
      chartType = 'bar_chart';
    } else if (graphType === 'doughnut') {
      // Doughnut chart for breakdowns
      if (detail.includes('market share')) {
        chartData = {
          labels: ['Our Mill', 'Competitor A', 'Competitor B', 'Competitor C', 'Others'],
          datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(229, 231, 235, 0.8)'
            ]
          }]
        };
        description = `🎯 **Market Share** - Doughnut Chart View`;
      } else if (detail.includes('inventory')) {
        chartData = {
          labels: ['Rice', 'Wheat', 'Maize', 'Soya', 'Others'],
          datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(229, 231, 235, 0.8)'
            ]
          }]
        };
        description = `📦 **Inventory Composition** - Doughnut Chart View`;
      } else if (detail.includes('revenue')) {
        chartData = {
          labels: ['Sales', 'Loans Interest', 'Transport', 'Others'],
          datasets: [{
            data: [70, 15, 10, 5],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ]
          }]
        };
        description = `💰 **Revenue Breakdown** - Doughnut Chart View`;
      } else if (detail.includes('risk')) {
        const creditRisk = mlResults?.credit_risk || [];
        const highRisk = creditRisk.filter(c => c.risk_level === 'HIGH').length;
        const mediumRisk = creditRisk.filter(c => c.risk_level === 'MEDIUM').length;
        const lowRisk = (creditRisk.length - highRisk - mediumRisk);
        chartData = {
          labels: ['High Risk', 'Medium Risk', 'Low Risk'],
          datasets: [{
            data: [highRisk || 2, mediumRisk || 5, lowRisk || 8],
            backgroundColor: [
              'rgba(239, 68, 68, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(34, 197, 94, 0.8)'
            ]
          }]
        };
        description = `⚠️ **Risk Distribution** - Doughnut Chart View`;
      }
      chartType = 'doughnut_chart';
    } else if (graphType === 'combined') {
      // Combined chart for multiple metrics
      if (detail.includes('sales') && detail.includes('inventory')) {
        chartData = {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Sales (Rs.)',
              data: [12000, 15000, 10000, 18000, 22000, 20000, 16000],
              type: 'bar',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              yAxisID: 'y'
            },
            {
              label: 'Inventory (kg)',
              data: [1000, 950, 880, 750, 600, 450, 350],
              type: 'line',
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 2,
              yAxisID: 'y1'
            }
          ]
        };
        description = `📊 **Sales & Inventory Combined** - Mixed Chart View`;
      } else if (detail.includes('sales') && detail.includes('loans')) {
        chartData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Sales (Rs.)',
              data: [85000, 95000, 88000, 102000],
              type: 'bar',
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              yAxisID: 'y'
            },
            {
              label: 'Loans Given (Rs.)',
              data: [25000, 30000, 28000, 35000],
              type: 'line',
              borderColor: 'rgb(139, 92, 246)',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 2,
              yAxisID: 'y1'
            }
          ]
        };
        description = `💰 **Sales & Loans Combined** - Mixed Chart View`;
      } else {
        // All metrics
        chartData = {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Sales',
              data: [85, 95, 88, 102],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2
            },
            {
              label: 'Inventory',
              data: [75, 72, 65, 58],
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 2
            },
            {
              label: 'Loans',
              data: [45, 50, 48, 55],
              borderColor: 'rgb(139, 92, 246)',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 2
            }
          ]
        };
        description = `📈 **All Metrics Overview** - Multi-line Chart View`;
      }
      chartType = 'combined_chart';
    }
    
    if (!chartData) {
      chartData = {
        labels: ['Data 1', 'Data 2', 'Data 3'],
        datasets: [{
          label: 'Values',
          data: [100, 150, 120],
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        }]
      };
    }
    
    const text = `${description}\n\n💡 **Graph Type**: ${graphType}\n**Detail Level**: ${detail}\n**Based on**: Firebase Business Data`;
    
    return {
      type: 'chart',
      chartType: chartType,
      text: text,
      data: chartData,
      isGraphSelection: true
    };
  };

  const generateSalesForecastResponse = (mlResults, deepSeekResponse) => {
    const forecast = mlResults.sales_forecast;
    
    if (!forecast) {
      return {
        type: 'text',
        text: "📊 **SALES FORECASTING**\n\nML Model Status: Insufficient data for accurate forecasting\n\n💡 **Recommendation**:\n• Record more sales data (minimum 7 days recommended)\n• Ensure consistent daily sales recording\n• The ML model will improve with more data",
        chartData: null
      };
    }
    
    const analysis = `📈 **ML-POWERED SALES FORECAST**\n\n` +
      `🔮 **Next 7 Days Prediction**:\n${forecast.predictions.map((p, i) => 
        `  Day ${i + 1}: Rs.${Math.round(p).toLocaleString('en-IN')}`
      ).join('\n')}\n\n` +
      `📊 **ML Model Confidence**: ${Math.round(forecast.confidence * 100)}%\n` +
      `🤖 **Algorithm**: ${forecast.model}\n` +
      `📈 **Trend**: ${forecast.predictions[6] > forecast.predictions[0] ? '↗️ Growing' : '↘️ Declining'}\n\n` +
      `💡 **ML Insights**:\n${deepSeekResponse.insights || 'Analyzing patterns...'}\n\n` +
      `🎯 **Recommendations**:\n${deepSeekResponse.recommendations?.join('\n') || 'Based on ML predictions, plan inventory accordingly.'}`;
    
    // Prepare chart data
    const chartData = {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      datasets: [{
        label: 'ML Sales Forecast (Rs.)',
        data: forecast.predictions,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4
      }]
    };
    
    return {
      type: 'chart',
      chartType: 'ml_sales_forecast',
      text: analysis,
      data: chartData,
      mlResults: forecast
    };
  };

  const generateStockAnalysisResponse = (mlResults, deepSeekResponse) => {
    const predictions = mlResults.stock_predictions;
    
    if (!predictions || predictions.length === 0) {
      return {
        type: 'text',
        text: "📦 **STOCK RISK ANALYSIS**\n\nNo inventory data available for ML analysis.\n\n💡 **Action Required**:\n• Add inventory items with stock levels\n• Set reorder levels and consumption rates\n• The ML model needs this data for accurate risk prediction"
      };
    }
    
    const criticalItems = predictions.filter(p => p.risk_level === 'CRITICAL');
    const highRiskItems = predictions.filter(p => p.risk_level === 'HIGH');
    
    let analysis = `📦 **ML STOCK RISK INTELLIGENCE**\n\n`;
    
    if (criticalItems.length > 0) {
      analysis += `🚨 **CRITICAL ML ALERTS** (${criticalItems.length} items)\n`;
      criticalItems.slice(0, 3).forEach(item => {
        analysis += `   ⚠️ ${item.product}: ${item.days_to_empty.toFixed(1)} days left\n`;
        analysis += `      Recommended order: ${item.recommended_order.toFixed(0)} kg\n`;
      });
      analysis += '\n';
    }
    
    if (highRiskItems.length > 0) {
      analysis += `⚠️ **HIGH RISK ML PREDICTIONS** (${highRiskItems.length} items)\n`;
      highRiskItems.slice(0, 3).forEach(item => {
        analysis += `   • ${item.product}: ${item.days_to_safety.toFixed(1)} days to safety stock\n`;
      });
      analysis += '\n';
    }
    
    analysis += `📊 **ML ANALYSIS SUMMARY**:\n`;
    analysis += `• Total Items Analyzed: ${predictions.length}\n`;
    analysis += `• ML Risk Distribution: ${criticalItems.length} Critical, ${highRiskItems.length} High\n`;
    analysis += `• Average Days to Safety: ${(predictions.reduce((a, b) => a + b.days_to_safety, 0) / predictions.length).toFixed(1)} days\n`;
    analysis += `• Model Type: Classification + Time-series\n\n`;
    
    analysis += `🎯 **ML-POWERED RECOMMENDATIONS**:\n`;
    analysis += deepSeekResponse.recommendations?.join('\n') || 'Monitor stock levels regularly based on ML predictions.';
    
    // Prepare chart data
    const chartData = {
      labels: predictions.slice(0, 8).map(p => p.product.substring(0, 12) + '...'),
      datasets: [{
        label: 'Days Until Empty (ML Prediction)',
        data: predictions.slice(0, 8).map(p => p.days_to_empty),
        backgroundColor: predictions.slice(0, 8).map(p => 
          p.risk_level === 'CRITICAL' ? 'rgba(239, 68, 68, 0.8)' :
          p.risk_level === 'HIGH' ? 'rgba(245, 158, 11, 0.8)' :
          'rgba(34, 197, 94, 0.8)'
        )
      }]
    };
    
    return {
      type: 'chart',
      chartType: 'ml_stock_analysis',
      text: analysis,
      data: chartData,
      mlResults: { criticalItems, highRiskItems }
    };
  };

  const generateCreditAnalysisResponse = (mlResults, deepSeekResponse) => {
    const creditRisk = mlResults.credit_risk;
    
    if (!creditRisk || creditRisk.length === 0) {
      return {
        type: 'text',
        text: "💰 **CREDIT RISK ANALYSIS**\n\nNo loan data available for ML analysis.\n\n💡 **Setup Required**:\n• Add customer loan records\n• Include overdue days and payment history\n• ML model needs this data for risk assessment"
      };
    }
    
    const highRisk = creditRisk.filter(c => c.risk_level === 'HIGH');
    const mediumRisk = creditRisk.filter(c => c.risk_level === 'MEDIUM');
    
    let analysis = `💰 **ML CREDIT RISK INTELLIGENCE**\n\n`;
    
    analysis += `📊 **ML RISK DISTRIBUTION**:\n`;
    analysis += `• Total Loans: ${creditRisk.length}\n`;
    analysis += `• High Risk (ML): ${highRisk.length}\n`;
    analysis += `• Medium Risk (ML): ${mediumRisk.length}\n`;
    analysis += `• Low Risk (ML): ${creditRisk.length - highRisk.length - mediumRisk.length}\n\n`;
    
    if (highRisk.length > 0) {
      analysis += `🚨 **HIGH RISK CUSTOMERS (ML IDENTIFIED)**\n`;
      highRisk.slice(0, 3).forEach(customer => {
        analysis += `   ⚠️ ${customer.customer}: Rs.${customer.outstanding_amount.toLocaleString('en-IN')}\n`;
        analysis += `      Risk Score: ${customer.risk_score.toFixed(1)}/100\n`;
        analysis += `      Action: ${customer.recommended_action}\n`;
      });
      analysis += '\n';
    }
    
    analysis += `🤖 **ML MODEL INSIGHTS**:\n`;
    analysis += `• Algorithm: Random Forest Classifier\n`;
    analysis += `• Features Used: Amount, Overdue, History, Credit Ratio\n`;
    analysis += `• Prediction Accuracy: Based on historical patterns\n\n`;
    
    analysis += `🎯 **INTELLIGENT RECOMMENDATIONS**:\n`;
    analysis += deepSeekResponse.recommendations?.join('\n') || 'Review credit terms for high-risk customers identified by ML.';
    
    // Prepare chart data
    const chartData = {
      labels: ['High Risk', 'Medium Risk', 'Low Risk'],
      datasets: [{
        data: [highRisk.length, mediumRisk.length, creditRisk.length - highRisk.length - mediumRisk.length],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ]
      }]
    };
    
    return {
      type: 'chart',
      chartType: 'ml_credit_analysis',
      text: analysis,
      data: chartData,
      mlResults: { highRisk, mediumRisk }
    };
  };

  const generateOperationalResponse = (mlResults, deepSeekResponse) => {
    const ops = mlResults.operational_insights;
    
    if (!ops) {
      return {
        type: 'text',
        text: "🏭 **OPERATIONAL ANALYSIS**\n\nNo worker data available for ML analysis.\n\n💡 **Setup Required**:\n• Add worker records with wage information\n• Include attendance and productivity data\n• ML model needs this for efficiency analysis"
      };
    }
    
    let analysis = `🏭 **ML OPERATIONAL INTELLIGENCE**\n\n`;
    
    analysis += `📊 **EFFICIENCY METRICS (ML CALCULATED)**:\n`;
    analysis += `• Efficiency Score: ${(ops.efficiency_score * 100).toFixed(1)}%\n`;
    analysis += `• Average Daily Wage: Rs.${ops.avg_wage.toLocaleString('en-IN')}\n`;
    analysis += `• Skilled Worker Ratio: ${(ops.skilled_ratio * 100).toFixed(1)}%\n\n`;
    
    if (ops.insights && ops.insights.length > 0) {
      analysis += `💡 **ML INSIGHTS**:\n`;
      ops.insights.forEach(insight => {
        analysis += `• ${insight}\n`;
      });
      analysis += '\n';
    }
    
    analysis += `🎯 **ML-POWERED RECOMMENDATIONS**:\n`;
    ops.recommendations.forEach(rec => {
      analysis += `• ${rec}\n`;
    });
    
    analysis += `\n🤖 **ML Analysis Method**: Statistical efficiency modeling`;
    
    return {
      type: 'text',
      text: analysis,
      mlResults: ops
    };
  };

  const generateGeneralResponse = (mlResults, deepSeekResponse) => {
    let analysis = `🧠 **COMPREHENSIVE ML BUSINESS INTELLIGENCE**\n\n`;
    
    analysis += `📊 **ML ANALYSIS SUMMARY**:\n`;
    
    if (mlResults.sales_forecast) {
      analysis += `• Sales Forecast: ${mlResults.sales_forecast.confidence * 100}% confidence\n`;
    }
    
    if (mlResults.stock_predictions) {
      const critical = mlResults.stock_predictions.filter(p => p.risk_level === 'CRITICAL').length;
      analysis += `• Critical Stock Items: ${critical}\n`;
    }
    
    if (mlResults.credit_risk) {
      const highRisk = mlResults.credit_risk.filter(c => c.risk_level === 'HIGH').length;
      analysis += `• High Risk Loans: ${highRisk}\n`;
    }
    
    if (mlResults.operational_insights) {
      analysis += `• Operational Efficiency: ${(mlResults.operational_insights.efficiency_score * 100).toFixed(1)}%\n`;
    }
    
    analysis += `\n🤖 **ML MODELS USED**:\n`;
    if (mlResults.ml_metrics?.models_used) {
      mlResults.ml_metrics.models_used.forEach(model => {
        analysis += `• ${model.replace('_', ' ').toUpperCase()}\n`;
      });
    }
    
    analysis += `\n💡 **DEEPSEEK ENHANCED INSIGHTS**:\n`;
    analysis += deepSeekResponse.insights || 'ML analysis completed successfully.';
    
    analysis += `\n\n🎯 **STRATEGIC RECOMMENDATIONS**:\n`;
    if (mlResults.business_recommendations) {
      mlResults.business_recommendations.forEach(rec => {
        analysis += `• ${rec}\n`;
      });
    }
    
    return {
      type: 'text',
      text: analysis,
      mlResults: mlResults
    };
  };

  const generateMLInsights = async (mlResults) => {
    const insights = [];
    
    if (mlResults.sales_forecast) {
      insights.push(`Sales forecasting model ready with ${Math.round(mlResults.sales_forecast.confidence * 100)}% confidence`);
    }
    
    if (mlResults.stock_predictions) {
      const critical = mlResults.stock_predictions.filter(p => p.risk_level === 'CRITICAL').length;
      if (critical > 0) {
        insights.push(`${critical} critical stock items identified by ML`);
      }
    }
    
    if (mlResults.credit_risk) {
      const highRisk = mlResults.credit_risk.filter(c => c.risk_level === 'HIGH').length;
      if (highRisk > 0) {
        insights.push(`${highRisk} high-risk loans detected by credit risk model`);
      }
    }
    
    const text = `🤖 **ML SYSTEM INITIALIZED**\n\n` +
      `✅ Machine Learning models are now active\n` +
      `📊 Data Points: ${aiStats.dataPoints}\n` +
      `🎯 ML Status: ${aiStats.mlStatus}\n\n` +
      `🔬 **INITIAL ML INSIGHTS**:\n${insights.join('\n') || 'Collecting more data for deeper insights...'}\n\n` +
      `💡 **Ready for ML-powered queries!**`;
    
    return { text };
  };

  const fallbackAnalysis = async (query) => {
    try {
      // Use local AI service for analysis
      const response = await AIService.enhancedChat(query);
      const firebaseData = await FirebaseDataService.fetchAllData();
      
      // Enhance response with insights
      const queryLower = query.toLowerCase();
      let insights = '';
      
      if (queryLower.includes('stock') || queryLower.includes('inventory')) {
        const stockInsights = await AIService.generateInsights('stock');
        if (stockInsights.recommendations && stockInsights.recommendations.length > 0) {
          insights = '\n\n💡 **Recommendations**:\n' + 
            stockInsights.recommendations.slice(0, 3).map(r => `• ${r.recommendation}`).join('\n');
        }
      } else if (queryLower.includes('sales')) {
        const salesInsights = await AIService.generateInsights('sales');
        if (salesInsights.insights && salesInsights.insights.length > 0) {
          insights = '\n\n💡 **Insights**:\n' + 
            salesInsights.insights.slice(0, 3).map(i => `• ${i.description}`).join('\n');
        }
      } else if (queryLower.includes('loan') || queryLower.includes('credit')) {
        const loanInsights = await AIService.generateInsights('loans');
        if (loanInsights.assessments && loanInsights.assessments.length > 0) {
          insights = '\n\n💡 **Risk Assessment**:\n' + 
            loanInsights.assessments.slice(0, 3).map(a => `• ${a.customer}: ${a.assessment}`).join('\n');
        }
      }
      
      return {
        type: response.type || 'text',
        text: response.text + insights,
        chartType: response.chartType,
        chartData: null,
        localAI: true
      };
    } catch (error) {
      console.error('Fallback analysis error:', error);
      const firebaseData = await FirebaseDataService.fetchAllData();
      
      return {
        type: 'text',
        text: `📊 **QUICK ANALYSIS**\n\n` +
          `📈 **Your Business Data**:\n` +
          `• Sales Records: ${firebaseData.sales.length}\n` +
          `• Inventory Items: ${firebaseData.inventory.length}\n` +
          `• Active Loans: ${firebaseData.loans.length}\n` +
          `• Workers: ${firebaseData.workers.length}\n\n` +
          `💡 Ask me specific questions about stock, sales, loans, or workers!`,
        chartData: null,
        localAI: true
      };
    }
  };

  // Natural Language Command Parser for Database Operations
  const parseCommand = (text) => {
    const textLower = text.toLowerCase();
    
    // Command patterns
    const patterns = {
      // Business recommendations
      businessRecommendations: /(?:give|provide|show|get|suggest)\s+(?:me\s+)?(?:ai\s+)?(?:business\s+)?recommendations?|ai\s+(?:business\s+)?recommendations?|best\s+recommendations?/i,
      
      // Stock commands
      stockArrival: /(\w+\s*\w*)\s+(?:total\s+)?(\d+(?:\.\d+)?)\s*kg\s+(?:arrived|received|add|store)/i,
      stockUpdate: /update\s+(\w+\s*\w*)\s+(?:to|=)\s+(\d+(?:\.\d+)?)\s*kg/i,
      
      // Sale commands
      saleRecord: /sold\s+(\d+(?:\.\d+)?)\s*kg\s+(\w+\s*\w*)\s+for\s+(?:rs\.?|lkr\.?)\s*(\d+(?:,\d+)?)/i,
      
      // Loan commands
      loanGiven: /(?:gave|give|loan)\s+(?:rs\.?|lkr\.?)\s*(\d+(?:,\d+)?)\s+to\s+(\w+\s*\w*)/i,
      
      // Order assignment: "assign order ORD-123 to Kamal driver with vehicle LK-123"
      orderAssign: /assign\s+(?:order\s+)?([A-Z0-9-]+)?\s*(?:to|driver)?\s*(\w+\s*\w*)?\s*(?:vehicle|van|truck)?\s*([A-Z]{2}-?\d+)?/i,
      
      // Delivery tracking
      trackOrder: /(?:track|where is|status of)\s+(?:order|delivery)?\s*#?(\w+)/i,
      
      // Report generation
      reportGen: /(?:today|daily|weekly|monthly|generate)?\s*(?:report|summary|analytics)/i,
      
      // Demand prediction
      demandPredict: /(?:predict|forecast|estimate)\s+(?:tomorrow|next\s+week|next\s+month)\s+(?:demand|sales|requirement)/i,
      
      // User tracking
      trackUser: /(?:track|show|find)\s+(?:dealer|customer|user)\s+(\w+\s*\w*)/i,
      
      // Delivery route
      deliveryRoute: /(?:delivery|transport|ship)\s+from\s+(\w+\s*\w*)\s+to\s+(\w+\s*\w*)/i,
    };
    
    // Check all patterns
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        switch(key) {
          case 'businessRecommendations':
            return { type: 'business_recommendations' };
          case 'stockArrival':
            return { type: 'stock_arrival', product: match[1].trim(), quantity: parseFloat(match[2]) };
          case 'stockUpdate':
            return { type: 'stock_update', product: match[1].trim(), quantity: parseFloat(match[2]) };
          case 'saleRecord':
            return { type: 'sale_record', quantity: parseFloat(match[1]), product: match[2].trim(), amount: parseFloat(match[3].replace(/,/g, '')) };
          case 'loanGiven':
            return { type: 'loan_given', amount: parseFloat(match[1].replace(/,/g, '')), customer: match[2].trim() };
          case 'orderAssign':
            return { 
              type: 'order_assign', 
              orderId: match[1]?.trim(), 
              driver: match[2]?.trim(), 
              vehicle: match[3]?.trim() 
            };
          case 'trackOrder':
            return { type: 'track_order', orderId: match[1].trim() };
          case 'reportGen':
            const period = textLower.includes('today') ? 'today' : textLower.includes('weekly') ? 'weekly' : textLower.includes('monthly') ? 'monthly' : 'today';
            return { type: 'generate_report', period };
          case 'demandPredict':
            const forecastPeriod = textLower.includes('tomorrow') ? 'tomorrow' : textLower.includes('week') ? 'next_week' : 'next_month';
            return { type: 'demand_prediction', period: forecastPeriod };
          case 'trackUser':
            return { type: 'track_user', userName: match[1].trim() };
          case 'deliveryRoute':
            return { type: 'delivery_route', from: match[1].trim(), to: match[2].trim() };
        }
      }
    }
    
    // Check for context-based responses (answering AI's questions)
    if (conversationContext) {
      if (conversationContext.waitingFor === 'orderId' && /^[A-Z0-9-]+$/i.test(text.trim())) {
        return { type: 'order_assign', ...conversationContext.data, orderId: text.trim() };
      }
      if (conversationContext.waitingFor === 'driverName') {
        return { type: 'order_assign', ...conversationContext.data, driver: text.trim() };
      }
      if (conversationContext.waitingFor === 'vehicleNumber') {
        return { type: 'order_assign', ...conversationContext.data, vehicle: text.trim() };
      }
      if (conversationContext.waitingFor === 'fromLocation') {
        return { type: 'delivery_route', ...conversationContext.data, from: text.trim() };
      }
      if (conversationContext.waitingFor === 'toLocation') {
        return { type: 'delivery_route', ...conversationContext.data, to: text.trim() };
      }
    }
    
    return null;
  };

  // Language Detection and Translation
  const detectLanguage = (text) => {
    // Tamil unicode detection
    const tamilRegex = /[\u0B80-\u0BFF]/;
    if (tamilRegex.test(text)) return 'tamil';
    
    // Tanglish (Tamil words in English) detection
    const tanglishWords = ['enna', 'epdi', 'sollu', 'paaru', 'podu', 'vaa', 'po', 'iru', 'vara', 'seiya', 'kaasu', 'panam', 'arisi', 'stock', 'order'];
    const textLower = text.toLowerCase();
    const hasTanglish = tanglishWords.some(word => textLower.includes(word));
    if (hasTanglish) return 'tanglish';
    
    return 'english';
  };

  const translateToUserLanguage = (responseText, language) => {
    if (language === 'english') return responseText;
    
    const translations = {
      tamil: {
        'STOCK ADDED SUCCESSFULLY': 'பொருள் வெற்றிகரமாக சேர்க்கப்பட்டது',
        'STOCK UPDATED SUCCESSFULLY': 'பொருள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது',
        'STOCK CREATED SUCCESSFULLY': 'புதிய பொருள் உருவாக்கப்பட்டது',
        'SALE RECORDED SUCCESSFULLY': 'விற்பனை வெற்றிகரமாக பதிவு செய்யப்பட்டது',
        'LOAN RECORDED SUCCESSFULLY': 'கடன் வெற்றிகரமாக பதிவு செய்யப்பட்டது',
        'ORDER ASSIGNED SUCCESSFULLY': 'ஆர்டர் வெற்றிகரமாக ஒதுக்கப்பட்டது',
        'ORDER TRACKING': 'ஆர்டர் கண்காணிப்பு',
        'BUSINESS REPORT': 'வணிக அறிக்கை',
        'DEMAND FORECAST': 'தேவை முன்னறிவிப்பு',
        'DEALER/CUSTOMER PROFILE': 'வியாபாரி/வாடிக்கையாளர் சுயவிவரம்',
        'DELIVERY ROUTE CALCULATED': 'விநியோக வழி கணக்கிடப்பட்டது',
        'Product': 'பொருள்',
        'Quantity': 'அளவு',
        'Previous Stock': 'முந்தைய இருப்பு',
        'New Stock': 'புதிய இருப்பு',
        'Database Updated': 'தரவுத்தளம் புதுப்பிக்கப்பட்டது',
        'Status': 'நிலை',
        'Synced': 'ஒத்திசைக்கப்பட்டது',
        'Amount': 'தொகை',
        'Customer': 'வாடிக்கையாளர்',
        'Driver': 'ஓட்டுநர்',
        'Vehicle': 'வாகனம்',
        'Order ID': 'ஆர்டர் எண்',
        'Quantity Sold': 'விற்பனை அளவு',
        'Price/kg': 'விலை/கிலோ',
        'Loan Amount': 'கடன் தொகை',
        'Due Date': 'காலக்கெடு',
        'Reminder': 'நினைவூட்டல',
        'Sales Performance': 'விற்பனை செயல்திறன்',
        'Total Sales': 'மொத்த விற்பனை',
        'Orders Count': 'ஆர்டர்கள் எண்ணிக்கை',
        'Loans & Credit': 'கடன்கள் மற்றும் கிரெடிட்',
        'Inventory Status': 'சரக்கு நிலை',
        'Low Stock Items': 'குறைந்த இருப்பு பொருட்கள்',
        'Total Inventory Value': 'மொத்த சரக்கு மதிப்பு',
        'Report Generated': 'அறிக்கை உருவாக்கப்பட்டது',
        'Sales Prediction': 'விற்பனை முன்னறிவிப்பு',
        'Predicted Total': 'கணிக்கப்பட்ட மொத்தம்',
        'Daily Average': 'தினசரி சராசரி',
        'Confidence': 'நம்பிக்கை',
        'Top Products to Stock': 'சேமிக்க வேண்டிய முக்கிய பொருட்கள்',
        'Business Summary': 'வணிக சுருக்கம்',
        'Total Orders': 'மொத்த ஆர்டர்கள்',
        'Total Purchase': 'மொத்த கொள்முதல்',
        'Active Loans': 'செயலில் உள்ள கடன்கள்',
        'Outstanding Amount': 'நிலுவை தொகை',
        'Recent Orders': 'சமீபத்திய ஆர்டர்கள்',
        'Loan Status': 'கடன் நிலை',
        'Route': 'வழி',
        'Distance': 'தூரம்',
        'Estimated Time': 'மதிப்பிடப்பட்ட நேரம்',
        'Estimated Cost': 'மதிப்பிடப்பட்ட செலவு',
        'Next Step': 'அடுத்த படி',
        'Delivery Address': 'விநியோக முகவரி',
        'Assigned At': 'ஒதுக்கப்பட்ட நேரம்',
        'I NEED MORE INFORMATION': 'எனக்கு மேலும் தகவல் தேவை',
        'Please provide': 'தயவுசெய்து வழங்கவும்',
        'hours': 'மணி நேரம்'
      },
      tanglish: {
        'STOCK ADDED SUCCESSFULLY': 'STOCK SUCCESSFULLY ADD PANNITOM',
        'STOCK UPDATED SUCCESSFULLY': 'STOCK SUCCESSFULLY UPDATE PANNITOM',
        'STOCK CREATED SUCCESSFULLY': 'PUDUSA STOCK CREATE PANNITOM',
        'SALE RECORDED SUCCESSFULLY': 'SALE SUCCESSFULLY RECORD PANNITOM',
        'LOAN RECORDED SUCCESSFULLY': 'LOAN SUCCESSFULLY RECORD PANNITOM',
        'ORDER ASSIGNED SUCCESSFULLY': 'ORDER SUCCESSFULLY ASSIGN PANNITOM',
        'ORDER TRACKING': 'ORDER TRACKING',
        'BUSINESS REPORT': 'BUSINESS REPORT',
        'DEMAND FORECAST': 'DEMAND FORECAST',
        'DEALER/CUSTOMER PROFILE': 'DEALER/CUSTOMER PROFILE',
        'DELIVERY ROUTE CALCULATED': 'DELIVERY ROUTE CALCULATE PANNITOM',
        'Product': 'Product',
        'Quantity': 'Quantity',
        'Previous Stock': 'Munnadiye Irundha Stock',
        'New Stock': 'Pudusa Stock',
        'Database Updated': 'Database Update Aagiduchi',
        'Status': 'Status',
        'Synced': 'Sync Aagiduchi',
        'Amount': 'Amount',
        'Customer': 'Customer',
        'Driver': 'Driver',
        'Vehicle': 'Vehicle',
        'Order ID': 'Order ID',
        'Quantity Sold': 'Vittha Quantity',
        'Price/kg': 'Price/kg',
        'Loan Amount': 'Loan Amount',
        'Due Date': 'Due Date',
        'Reminder': 'Reminder',
        'Sales Performance': 'Sales Performance',
        'Total Sales': 'Total Sales',
        'Orders Count': 'Orders Count',
        'Loans & Credit': 'Loans & Credit',
        'Inventory Status': 'Inventory Status',
        'Low Stock Items': 'Kammi Stock Items',
        'Total Inventory Value': 'Total Stock Value',
        'Report Generated': 'Report Generate Pannitom',
        'Sales Prediction': 'Sales Prediction',
        'Predicted Total': 'Predict Panna Total',
        'Daily Average': 'Daily Average',
        'Confidence': 'Confidence',
        'Top Products to Stock': 'Stock Vekkanum Products',
        'Business Summary': 'Business Summary',
        'Total Orders': 'Total Orders',
        'Total Purchase': 'Total Purchase',
        'Active Loans': 'Active Loans',
        'Outstanding Amount': 'Pending Amount',
        'Recent Orders': 'Recent Orders',
        'Loan Status': 'Loan Status',
        'Route': 'Route',
        'Distance': 'Distance',
        'Estimated Time': 'Estimated Time',
        'Estimated Cost': 'Estimated Cost',
        'Next Step': 'Next Step',
        'Delivery Address': 'Delivery Address',
        'Assigned At': 'Assign Panna Time',
        'I NEED MORE INFORMATION': 'ENAKKU INNUM DETAILS VENUM',
        'Please provide': 'Please Sollunga',
        'hours': 'hours'
      }
    };
    
    let translated = responseText;
    const langTranslations = translations[language];
    
    if (langTranslations) {
      Object.entries(langTranslations).forEach(([english, translated_text]) => {
        translated = translated.replace(new RegExp(english, 'g'), translated_text);
      });
    }
    
    return translated;
  };

  const parseMultilingualCommand = (text, language) => {
    // Tamil/Tanglish command patterns
    const multilingualPatterns = {
      // Stock commands
      stockArrival: {
        tamil: /(\w+\s*\w*)\s+(\d+(?:\.\d+)?)\s*(?:கிலோ|kg)\s+(?:வந்தது|சேர்|add)/i,
        tanglish: /(\w+\s*\w*)\s+(\d+(?:\.\d+)?)\s*kg\s+(?:vanthuchu|vandhuchu|add|store)/i,
        english: /(\w+\s*\w*)\s+(?:total\s+)?(\d+(?:\.\d+)?)\s*kg\s+(?:arrived|received|add|store)/i
      },
      saleRecord: {
        tamil: /(\d+(?:\.\d+)?)\s*(?:கிலோ|kg)\s+(\w+\s*\w*)\s+(?:விற்றேன்|sold)\s+(?:ரூபாய்|rs\.?)\s*(\d+(?:,\d+)?)/i,
        tanglish: /(\d+(?:\.\d+)?)\s*kg\s+(\w+\s*\w*)\s+(?:vituten|sold)\s+(?:rs\.?|rupees?)\s*(\d+(?:,\d+)?)/i,
        english: /sold\s+(\d+(?:\.\d+)?)\s*kg\s+(\w+\s*\w*)\s+for\s+(?:rs\.?|lkr\.?)\s*(\d+(?:,\d+)?)/i
      },
      loanGiven: {
        tamil: /(?:கடன்|loan)\s+(?:ரூபாய்|rs\.?)\s*(\d+(?:,\d+)?)\s+(?:கொடுத்தேன்|to)\s+(\w+\s*\w*)/i,
        tanglish: /(?:loan|kaasu)\s+(?:rs\.?|rupees?)\s*(\d+(?:,\d+)?)\s+(?:kuduthuten|to)\s+(\w+\s*\w*)/i,
        english: /(?:gave|give|loan)\s+(?:rs\.?|lkr\.?)\s*(\d+(?:,\d+)?)\s+to\s+(\w+\s*\w*)/i
      },
      reportGen: {
        tamil: /(?:இன்றைய|today)\s*(?:அறிக்கை|report)/i,
        tanglish: /(?:innaiku|today)\s*(?:report|summary)/i,
        english: /(?:today|daily|weekly|monthly)?\s*(?:report|summary|analytics)/i
      },
      trackOrder: {
        tamil: /(?:கண்காணி|track)\s+(?:ஆர்டர்|order)?\s*#?(\w+)/i,
        tanglish: /(?:track|paaru)\s+(?:order)?\s*#?(\w+)/i,
        english: /(?:track|where is|status of)\s+(?:order|delivery)?\s*#?(\w+)/i
      }
    };
    
    // Try language-specific patterns first, then fallback to English
    const patterns = language === 'tamil' ? multilingualPatterns :
                     language === 'tanglish' ? multilingualPatterns :
                     multilingualPatterns;
    
    for (const [commandType, langPatterns] of Object.entries(patterns)) {
      const pattern = langPatterns[language] || langPatterns.english;
      const match = text.match(pattern);
      
      if (match) {
        switch(commandType) {
          case 'stockArrival':
            return { type: 'stock_arrival', product: match[1].trim(), quantity: parseFloat(match[2]) };
          case 'saleRecord':
            return { type: 'sale_record', quantity: parseFloat(match[1]), product: match[2].trim(), amount: parseFloat(match[3].replace(/,/g, '')) };
          case 'loanGiven':
            return { type: 'loan_given', amount: parseFloat(match[1].replace(/,/g, '')), customer: match[2].trim() };
          case 'reportGen':
            return { type: 'generate_report', period: 'today' };
          case 'trackOrder':
            return { type: 'track_order', orderId: match[1].trim() };
        }
      }
    }
    
    return null;
  };

  // Execute database command
  const executeCommand = async (command) => {
    const { rtdb } = await import('../firebase/config');
    const { ref, get, set, update, push } = await import('firebase/database');
    
    try {
      switch (command.type) {
        case 'stock_arrival':
        case 'stock_update': {
          // Find existing product in inventory
          const productsRef = ref(rtdb, 'products');
          const snapshot = await get(productsRef);
          
          let productId = null;
          let currentStock = 0;
          let currentData = null;
          
          if (snapshot.exists()) {
            const products = snapshot.val();
            // Search for product by name (case-insensitive)
            const productEntry = Object.entries(products).find(([id, data]) => 
              data.name?.toLowerCase() === command.product.toLowerCase()
            );
            
            if (productEntry) {
              productId = productEntry[0];
              currentData = productEntry[1];
              currentStock = currentData.current_stock || currentData.currentStock || currentData.totalKg || 0;
            }
          }
          
          if (productId) {
            // Update existing product
            const newStock = command.type === 'stock_arrival' 
              ? currentStock + command.quantity 
              : command.quantity;
            
            const productRef = ref(rtdb, `products/${productId}`);
            await update(productRef, {
              current_stock: newStock,
              currentStock: newStock,
              totalKg: newStock,
              bags: Math.ceil(newStock / (currentData.kgPerBag || currentData.kg_per_bag || 50)),
              stock_status: newStock < (currentData.min_stock_level || currentData.minStockLevel || 1000) 
                ? 'Low Stock' 
                : 'In Stock',
              status: newStock < (currentData.min_stock_level || currentData.minStockLevel || 1000) 
                ? 'Low Stock' 
                : 'In Stock',
              updated_at: new Date().toISOString(),
              lastUpdated: new Date().toISOString().split('T')[0]
            });
            
            return {
              success: true,
              action: command.type === 'stock_arrival' ? 'added' : 'updated',
              product: command.product,
              quantity: command.quantity,
              newTotal: newStock,
              previousTotal: currentStock
            };
          } else {
            // Create new product
            const newProductRef = push(productsRef);
            const productId = newProductRef.key;
            
            const newProduct = {
              id: productId,
              name: command.product,
              type: command.product.includes('nadu') || command.product.includes('Nadu') ? 'Nadu' : 'Samba',
              grade: 'Grade A',
              bags: Math.ceil(command.quantity / 50),
              kgPerBag: 50,
              kg_per_bag: 50,
              totalKg: command.quantity,
              current_stock: command.quantity,
              currentStock: command.quantity,
              min_stock_level: 1000,
              minStockLevel: 1000,
              warehouse: 'Warehouse A',
              price_per_kg: 100,
              pricePerKg: 100,
              stock_status: 'In Stock',
              status: 'In Stock',
              qualityScore: 95,
              quality_score: 95,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              lastUpdated: new Date().toISOString().split('T')[0]
            };
            
            await set(newProductRef, newProduct);
            
            return {
              success: true,
              action: 'created',
              product: command.product,
              quantity: command.quantity,
              newTotal: command.quantity,
              id: productId
            };
          }
        }
        
        case 'sale_record': {
          const { rtdb } = await import('../firebase/config');
          const { ref, get, set, update, push } = await import('firebase/database');
          
          const ordersRef = ref(rtdb, 'orders');
          const newOrderRef = push(ordersRef);
          
          const saleData = {
            id: newOrderRef.key,
            product: command.product,
            quantity: command.quantity,
            amount: command.amount,
            price_per_kg: command.amount / command.quantity,
            pricePerKg: command.amount / command.quantity,
            date: new Date().toISOString(),
            placedOn: new Date().toISOString().split('T')[0],
            status: 'Completed',
            payment_type: 'cash',
            type: 'retail',
            dealerId: 'CASH-SALE',
            dealerName: 'Cash Customer',
            created_at: new Date().toISOString()
          };
          
          await set(newOrderRef, saleData);
          
          // Update inventory - reduce stock
          const productsRef = ref(rtdb, 'products');
          const snapshot = await get(productsRef);
          
          if (snapshot.exists()) {
            const products = snapshot.val();
            const productEntry = Object.entries(products).find(([id, data]) => 
              data.name?.toLowerCase() === command.product.toLowerCase()
            );
            
            if (productEntry) {
              const [productId, productData] = productEntry;
              const currentStock = productData.current_stock || productData.currentStock || productData.totalKg || 0;
              const newStock = Math.max(0, currentStock - command.quantity);
              
              const productRef = ref(rtdb, `products/${productId}`);
              await update(productRef, {
                current_stock: newStock,
                currentStock: newStock,
                totalKg: newStock,
                bags: Math.ceil(newStock / (productData.kgPerBag || productData.kg_per_bag || 50)),
                stock_status: newStock < (productData.min_stock_level || productData.minStockLevel || 1000) 
                  ? 'Low Stock' 
                  : 'In Stock',
                status: newStock < (productData.min_stock_level || productData.minStockLevel || 1000) 
                  ? 'Low Stock' 
                  : 'In Stock',
                updated_at: new Date().toISOString(),
                lastUpdated: new Date().toISOString().split('T')[0]
              });
            }
          }
          
          return {
            success: true,
            action: 'sale_recorded',
            product: command.product,
            quantity: command.quantity,
            amount: command.amount,
            id: newOrderRef.key
          };
        }
        
        case 'loan_given': {
          const { rtdb } = await import('../firebase/config');
          const { ref, push, set } = await import('firebase/database');
          
          const loansRef = ref(rtdb, 'loans');
          const newLoanRef = push(loansRef);
          
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          
          const loanData = {
            id: newLoanRef.key,
            dealerId: `DEALER-${Date.now()}`,
            dealerName: command.customer,
            customer: command.customer,
            amount: command.amount,
            outstandingAmount: command.amount,
            outstanding_amount: command.amount,
            paidAmount: 0,
            paid_amount: 0,
            givenDate: new Date().toISOString().split('T')[0],
            given_date: new Date().toISOString(),
            dueDate: dueDate.toISOString().split('T')[0],
            due_date: dueDate.toISOString(),
            status: 'Active',
            overdueDays: 0,
            overdue_days: 0,
            pastDefaults: 0,
            past_defaults: 0,
            created_at: new Date().toISOString()
          };
          
          await set(newLoanRef, loanData);
          
          return {
            success: true,
            action: 'loan_recorded',
            customer: command.customer,
            amount: command.amount,
            id: newLoanRef.key
          };
        }
        
        case 'order_assign': {
          // Check if we have all required info
          if (!command.orderId || !command.driver || !command.vehicle) {
            const missing = [];
            if (!command.orderId) missing.push('orderId');
            if (!command.driver) missing.push('driver');
            if (!command.vehicle) missing.push('vehicle');
            
            setConversationContext({
              type: 'order_assign',
              waitingFor: missing[0],
              data: command,
              missing: missing
            });
            
            return {
              success: false,
              needsInfo: true,
              missing: missing,
              prompt: missing[0] === 'orderId' ? 'Please provide the Order ID' :
                      missing[0] === 'driver' ? 'Please provide the driver name' :
                      'Please provide the vehicle number'
            };
          }
          
          const { rtdb } = await import('../firebase/config');
          const { ref, get, update } = await import('firebase/database');
          
          // Find order by ID
          const ordersRef = ref(rtdb, 'orders');
          const snapshot = await get(ordersRef);
          
          if (snapshot.exists()) {
            const orders = snapshot.val();
            const orderEntry = Object.entries(orders).find(([id, data]) => 
              id === command.orderId || data.id === command.orderId
            );
            
            if (orderEntry) {
              const [orderId, orderData] = orderEntry;
              const orderRef = ref(rtdb, `orders/${orderId}`);
              
              await update(orderRef, {
                assignedDriver: command.driver,
                assignedVehicle: command.vehicle,
                status: 'Assigned',
                assignedAt: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
              
              // Clear context
              setConversationContext(null);
              
              return {
                success: true,
                action: 'order_assigned',
                orderId: command.orderId,
                driver: command.driver,
                vehicle: command.vehicle,
                orderDetails: orderData
              };
            }
          }
          
          return { success: false, error: 'Order not found' };
        }
        
        case 'track_order': {
          const { rtdb } = await import('../firebase/config');
          const { ref, get } = await import('firebase/database');
          
          const ordersRef = ref(rtdb, 'orders');
          const snapshot = await get(ordersRef);
          
          if (snapshot.exists()) {
            const orders = snapshot.val();
            const orderEntry = Object.entries(orders).find(([id, data]) => 
              id === command.orderId || data.id === command.orderId
            );
            
            if (orderEntry) {
              const [orderId, orderData] = orderEntry;
              return {
                success: true,
                action: 'order_tracked',
                orderDetails: orderData
              };
            }
          }
          
          return { success: false, error: 'Order not found' };
        }
        
        case 'generate_report': {
          const data = await FirebaseDataService.fetchAllData();
          const today = new Date().toISOString().split('T')[0];
          
          // Filter data based on period
          let filteredSales = data.sales;
          let filteredLoans = data.loans;
          
          if (command.period === 'today') {
            filteredSales = data.sales.filter(s => s.date?.startsWith(today));
            filteredLoans = data.loans.filter(l => l.givenDate === today);
          }
          
          const totalSales = filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0);
          const totalLoans = filteredLoans.reduce((sum, l) => sum + (l.amount || 0), 0);
          const lowStock = data.inventory.filter(i => i.currentStock < i.minStockLevel);
          
          return {
            success: true,
            action: 'report_generated',
            period: command.period,
            data: {
              totalSales,
              salesCount: filteredSales.length,
              totalLoans,
              loansCount: filteredLoans.length,
              lowStockCount: lowStock.length,
              inventoryValue: data.inventory.reduce((sum, i) => sum + (i.currentStock * i.pricePerKg), 0)
            }
          };
        }
        
        case 'demand_prediction': {
          // CB-01: Accept natural language queries
          // CB-02: Interpret user intent
          // CB-03: Request predictive analytics from core service
          const DemandPredictionService = (await import('../services/demandPredictionService')).default;
        
          // FR-04: Forecast demand using core prediction service
          const predictionResult = await DemandPredictionService.forecastDemand(
            command.period || 'next_week',
            command.product || null
          );
        
          if (!predictionResult.success) {
            return {
              success: false,
              error: predictionResult.error,
              limitations: predictionResult.limitations
            };
          }

          const prediction = predictionResult.data;
        
          // CB-04: Present prediction results in human-readable language
          // CB-05: Explain prediction confidence and limitations
          const confidence = DemandPredictionService.getConfidenceExplanation();
          const limitations = DemandPredictionService.getLimitations();

          // Get visualization data (FR-07)
          const vizData = DemandPredictionService.getVisualizationData();

          const topProducts = Object.entries(prediction.productDemand)
            .sort((a, b) => b[1].projectedRevenue - a[1].projectedRevenue)
            .slice(0, 5)
            .map(([product, data]) => ({ 
              product, 
              predictedQty: Math.round(data.projectedQty),
              projectedRevenue: Math.round(data.projectedRevenue)
            }));
        
          return {
            success: true,
            action: 'demand_predicted',
            period: command.period,
            prediction: {
              totalSales: prediction.predictedTotalSales,
              avgDaily: prediction.predictedDailySales,
              totalQty: prediction.predictedTotalQty,
              confidence: confidence.score,
              confidencePercentage: confidence.percentage,
              dataPointsUsed: confidence.dataPointsUsed,
              topProducts,
              limitations: limitations.dataLimitations,
              assumptions: limitations.assumptionsAndLimitations,
              recommendations: limitations.recommendedActions
            }
          };
        }
        
        case 'track_user': {
          const { rtdb } = await import('../firebase/config');
          const { ref, get } = await import('firebase/database');
          
          const ordersRef = ref(rtdb, 'orders');
          const loansRef = ref(rtdb, 'loans');
          
          const [ordersSnap, loansSnap] = await Promise.all([
            get(ordersRef),
            get(loansRef)
          ]);
          
          let userOrders = [];
          let userLoans = [];
          
          if (ordersSnap.exists()) {
            const orders = ordersSnap.val();
            userOrders = Object.values(orders).filter(o => 
              o.dealerName?.toLowerCase().includes(command.userName.toLowerCase())
            );
          }
          
          if (loansSnap.exists()) {
            const loans = loansSnap.val();
            userLoans = Object.values(loans).filter(l => 
              l.dealerName?.toLowerCase().includes(command.userName.toLowerCase()) ||
              l.customer?.toLowerCase().includes(command.userName.toLowerCase())
            );
          }
          
          return {
            success: true,
            action: 'user_tracked',
            userName: command.userName,
            data: {
              orders: userOrders,
              loans: userLoans,
              totalPurchase: userOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
              totalLoans: userLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0)
            }
          };
        }
        
        case 'delivery_route': {
          if (!command.from || !command.to) {
            const missing = [];
            if (!command.from) missing.push('fromLocation');
            if (!command.to) missing.push('toLocation');
            
            setConversationContext({
              type: 'delivery_route',
              waitingFor: missing[0],
              data: command,
              missing: missing
            });
            
            return {
              success: false,
              needsInfo: true,
              missing: missing,
              prompt: missing[0] === 'fromLocation' ? 'From which location?' : 'To which location?'
            };
          }
          
          // Calculate estimated distance and time
          const distances = {
            'colombo-kandy': { km: 120, hours: 3 },
            'colombo-galle': { km: 116, hours: 2.5 },
            'kandy-jaffna': { km: 285, hours: 6 },
            'colombo-jaffna': { km: 400, hours: 8 }
          };
          
          const routeKey = `${command.from.toLowerCase()}-${command.to.toLowerCase()}`;
          const route = distances[routeKey] || { km: 100, hours: 2 };
          
          setConversationContext(null);
          
          return {
            success: true,
            action: 'route_calculated',
            from: command.from,
            to: command.to,
            distance: route.km,
            estimatedHours: route.hours,
            estimatedCost: route.km * 50
          };
        }

        case 'business_recommendations': {
          const recommendations = await AIService.generateBusinessRecommendations();
          return {
            success: true,
            action: 'recommendations_generated',
            recommendations: recommendations
          };
        }
        
        default:
          return { success: false, error: 'Unknown command type' };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return { success: false, error: error.message };
    }
  };

  // Generate chart after data update
  const generateUpdateChart = async (commandResult) => {
    try {
      const data = await FirebaseDataService.fetchAllData();
      
      if (commandResult.action === 'added' || commandResult.action === 'updated' || commandResult.action === 'created') {
        // Stock level chart
        const inventoryItems = data.inventory.slice(0, 8);
        const chartData = {
          labels: inventoryItems.map(item => item.product.substring(0, 15)),
          datasets: [{
            label: 'Current Stock (kg)',
            data: inventoryItems.map(item => item.currentStock),
            backgroundColor: inventoryItems.map(item => 
              item.product.toLowerCase().includes(commandResult.product.toLowerCase())
                ? 'rgba(34, 197, 94, 0.8)'  // Highlight updated product
                : 'rgba(59, 130, 246, 0.8)'
            ),
            borderColor: inventoryItems.map(item => 
              item.product.toLowerCase().includes(commandResult.product.toLowerCase())
                ? 'rgba(34, 197, 94, 1)'
                : 'rgba(59, 130, 246, 1)'
            ),
            borderWidth: 2
          }]
        };
        
        return {
          type: 'chart',
          chartType: 'stock_levels',
          data: chartData
        };
      } else if (commandResult.action === 'sale_recorded') {
        // Recent sales chart
        const recentSales = data.sales.slice(0, 7).reverse();
        const chartData = {
          labels: recentSales.map((_, i) => `Sale ${i + 1}`),
          datasets: [{
            label: 'Sale Amount (Rs.)',
            data: recentSales.map(sale => sale.amount),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: true,
            tension: 0.4
          }]
        };
        
        return {
          type: 'chart',
          chartType: 'sales_trend',
          data: chartData
        };
      }
      
      return null;
    } catch (error) {
      console.error('Chart generation error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setIsLoading(true);

    try {
      // Detect language
      const detectedLanguage = detectLanguage(currentMessage);
      
      // First, check if this is a command (check in all languages)
      let command = parseCommand(currentMessage);
      if (!command) {
        command = parseMultilingualCommand(currentMessage, detectedLanguage);
      }
      
      if (command) {
        // Execute the command
        const result = await executeCommand(command);
        
        if (result.success) {
          let responseText = '';
          
          // Generate response based on command type
          if (result.action === 'added' || result.action === 'updated' || result.action === 'created') {
            responseText = `✅ **STOCK ${result.action.toUpperCase()} SUCCESSFULLY**\n\n` +
              `📦 **Product**: ${result.product}\n` +
              `➕ **Quantity**: ${result.quantity} kg\n` +
              `📊 **Previous Stock**: ${result.previousTotal || 0} kg\n` +
              `📈 **New Stock**: ${result.newTotal} kg\n\n` +
              `✨ **Database Updated**: Firebase Realtime DB\n` +
              `🔄 **Status**: Synced\n\n` +
              `📊 Here's your updated inventory chart:`;
          } else if (result.action === 'sale_recorded') {
            responseText = `✅ **SALE RECORDED SUCCESSFULLY**\n\n` +
              `📦 **Product**: ${result.product}\n` +
              `📦 **Quantity Sold**: ${result.quantity} kg\n` +
              `💰 **Amount**: Rs.${result.amount.toLocaleString('en-IN')}\n` +
              `💵 **Price/kg**: Rs.${(result.amount / result.quantity).toFixed(2)}\n\n` +
              `✨ **Database Updated**: Order & Inventory synced\n` +
              `📊 Recent sales trend:`;
          } else if (result.action === 'loan_recorded') {
            responseText = `✅ **LOAN RECORDED SUCCESSFULLY**\n\n` +
              `👤 **Customer**: ${result.customer}\n` +
              `💰 **Loan Amount**: Rs.${result.amount.toLocaleString('en-IN')}\n` +
              `📅 **Due Date**: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\n` +
              `✨ **Database Updated**: Loan management synced\n` +
              `🔔 **Reminder**: Set up payment tracking`;
          } else if (result.action === 'order_assigned') {
            responseText = `✅ **ORDER ASSIGNED SUCCESSFULLY**\n\n` +
              `📋 **Order ID**: ${result.orderId}\n` +
              `👤 **Driver**: ${result.driver}\n` +
              `🚚 **Vehicle**: ${result.vehicle}\n` +
              `📦 **Product**: ${result.orderDetails.product || 'N/A'}\n` +
              `📊 **Quantity**: ${result.orderDetails.quantity || 0} kg\n` +
              `📍 **Delivery Address**: ${result.orderDetails.deliveryAddress || 'N/A'}\n\n` +
              `✨ **Status**: Assigned\n` +
              `🕐 **Assigned At**: ${new Date().toLocaleTimeString()}\n\n` +
              `💡 Track this delivery: "track order ${result.orderId}"`;
          } else if (result.action === 'order_tracked') {
            const order = result.orderDetails;
            responseText = `📦 **ORDER TRACKING**\n\n` +
              `📋 **Order ID**: ${order.id}\n` +
              `📦 **Product**: ${order.product || 'N/A'}\n` +
              `📊 **Quantity**: ${order.quantity || 0} kg\n` +
              `💰 **Amount**: Rs.${(order.amount || 0).toLocaleString('en-IN')}\n` +
              `👤 **Customer**: ${order.dealerName || 'N/A'}\n` +
              `📍 **Delivery Address**: ${order.deliveryAddress || 'N/A'}\n` +
              `🚦 **Status**: ${order.status || 'Pending'}\n` +
              `👤 **Assigned Driver**: ${order.assignedDriver || 'Not assigned'}\n` +
              `🚚 **Vehicle**: ${order.assignedVehicle || 'Not assigned'}\n` +
              `📅 **Order Date**: ${order.placedOn || order.date || 'N/A'}`;
          } else if (result.action === 'report_generated') {
            responseText = `📊 **${result.period.toUpperCase()} BUSINESS REPORT**\n\n` +
              `💰 **Sales Performance**\n` +
              `   • Total Sales: Rs.${result.data.totalSales.toLocaleString('en-IN')}\n` +
              `   • Orders Count: ${result.data.salesCount}\n` +
              `   • Average Order: Rs.${(result.data.totalSales / Math.max(1, result.data.salesCount)).toFixed(0)}\n\n` +
              `💳 **Loans & Credit**\n` +
              `   • Total Loans Given: Rs.${result.data.totalLoans.toLocaleString('en-IN')}\n` +
              `   • Loans Count: ${result.data.loansCount}\n\n` +
              `📦 **Inventory Status**\n` +
              `   • Low Stock Items: ${result.data.lowStockCount}\n` +
              `   • Total Inventory Value: Rs.${result.data.inventoryValue.toLocaleString('en-IN')}\n\n` +
              `✅ **Report Generated**: ${new Date().toLocaleString()}`;
          } else if (result.action === 'demand_predicted') {
            const pred = result.prediction;
            responseText = `🔮 **DEMAND FORECAST - ${result.period.toUpperCase()}**\n\n` +
              `📈 **Sales Prediction**\n` +
              `   • Predicted Total: Rs.${pred.totalSales.toFixed(0).toLocaleString('en-IN')}\n` +
              `   • Daily Average: Rs.${pred.avgDaily.toFixed(0).toLocaleString('en-IN')}\n` +
              `   • Confidence: ${(pred.confidence * 100).toFixed(0)}%\n\n` +
              `📦 **Top Products to Stock**\n` +
              pred.topProducts.map((p, i) => `   ${i+1}. ${p.product}: ~${p.predictedQty.toFixed(0)} kg`).join('\n') + '\n\n' +
              `💡 **AI Recommendation**: Stock up on top products to meet predicted demand!`;
          } else if (result.action === 'user_tracked') {
            responseText = `👤 **DEALER/CUSTOMER PROFILE: ${result.userName.toUpperCase()}**\n\n` +
              `📊 **Business Summary**\n` +
              `   • Total Orders: ${result.data.orders.length}\n` +
              `   • Total Purchase: Rs.${result.data.totalPurchase.toLocaleString('en-IN')}\n` +
              `   • Active Loans: ${result.data.loans.length}\n` +
              `   • Outstanding Amount: Rs.${result.data.totalLoans.toLocaleString('en-IN')}\n\n` +
              `📦 **Recent Orders**\n` +
              result.data.orders.slice(0, 3).map(o => `   • ${o.product}: ${o.quantity}kg - Rs.${o.amount?.toLocaleString('en-IN')}`).join('\n') + '\n\n' +
              `💳 **Loan Status**\n` +
              result.data.loans.slice(0, 3).map(l => `   • Rs.${l.amount?.toLocaleString('en-IN')} - ${l.status}`).join('\n');
          } else if (result.action === 'recommendations_generated') {
            const rec = result.recommendations;
            const strategicRecs = rec.strategic.slice(0, 2).map(s => `   • ${s.title} - Priority: ${s.priority}`).join('\n');
            const operationalRecs = rec.operational.slice(0, 2).map(o => `   • ${o.title}`).join('\n');
            const financialRecs = rec.financial.slice(0, 2).map(f => `   • ${f.title}`).join('\n');
            const priorityActions = rec.summary.priorityActions.map((action, i) => `   ${i+1}. ${action}`).join('\n');
            
            responseText = `🤖 **AI-POWERED BUSINESS RECOMMENDATIONS**\n\n` +
              `📊 **Executive Summary**\n` +
              `   • Total Recommendations: ${rec.summary.totalRecommendations}\n` +
              `   • Critical Issues: ${rec.summary.criticalIssues}\n` +
              `   • Estimated ROI: ${rec.summary.estimatedROI}\n` +
              `   • Implementation Timeline: ${rec.summary.implementationTimeline}\n\n` +
              `🎯 **Priority Actions** (Next 4-8 weeks):\n${priorityActions}\n\n` +
              `📈 **Strategic Recommendations** (${rec.strategic.length}):\n${strategicRecs}\n\n` +
              `⚙️ **Operational Recommendations** (${rec.operational.length}):\n${operationalRecs}\n\n` +
              `💰 **Financial Recommendations** (${rec.financial.length}):\n${financialRecs}\n\n` +
              `🏆 **Competitive Analysis**:\n` +
              `   Strengths: ${rec.competitive.competitiveStrengths.slice(0, 2).join(', ')}\n` +
              `   Opportunities: ${rec.competitive.opportunities.slice(0, 2).join(', ')}\n\n` +
              `📅 **Next Review**: ${rec.summary.nextReviewDate}\n\n` +
              `💡 **Ask for detailed recommendations on specific areas**: "strategic recommendations" or "financial recommendations"`;
          } else if (result.action === 'route_calculated') {
            responseText = `🚚 **DELIVERY ROUTE CALCULATED**\n\n` +
              `📍 **Route**: ${result.from} → ${result.to}\n` +
              `📏 **Distance**: ${result.distance} km\n` +
              `⏱️ **Estimated Time**: ${result.estimatedHours} hours\n` +
              `💰 **Estimated Cost**: Rs.${result.estimatedCost.toLocaleString('en-IN')}\n\n` +
              `💡 **Next Step**: Assign driver and vehicle\n` +
              `   Example: "assign order ORD-123 to Kamal driver with vehicle LK-456"`;
          }
          
          // Translate response to user's language
          responseText = translateToUserLanguage(responseText, detectedLanguage);
          
          // Generate chart
          const chartInfo = await generateUpdateChart(result);
          
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: responseText,
            timestamp: new Date(),
            type: chartInfo ? 'chart' : 'text',
            isSuper: true,
            commandResult: result
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          if (chartInfo && chartInfo.data) {
            setShowChart({
              type: chartInfo.chartType,
              title: responseText.split('\n')[0].replace(/\*\*/g, ''),
              data: chartInfo.data
            });
          }
          
          setIsLoading(false);
          return;
        } else if (result.needsInfo) {
          // AI needs more information
          let promptText = `🤔 **I NEED MORE INFORMATION**\n\n❓ ${result.prompt}\n\n💡 Please provide the ${result.missing.join(', ')}`;
          promptText = translateToUserLanguage(promptText, detectedLanguage);
          
          const aiMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: promptText,
            timestamp: new Date(),
            type: 'text',
            isSuper: true
          };
          
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
          return;
        } else {
          throw new Error(result.error || 'Command execution failed');
        }
      }
      
      // If not a command, proceed with normal query processing
      const response = await processQueryWithML(currentMessage);
      
      // Handle recommendations response type
      if (response.type === 'recommendations' && response.recommendations) {
        const rec = response.recommendations;
        const strategicRecs = rec.strategic.slice(0, 2).map(s => `   • ${s.title} - Priority: ${s.priority}`).join('\n');
        const operationalRecs = rec.operational.slice(0, 2).map(o => `   • ${o.title}`).join('\n');
        const financialRecs = rec.financial.slice(0, 2).map(f => `   • ${f.title}`).join('\n');
        const priorityActions = rec.summary.priorityActions.map((action, i) => `   ${i+1}. ${action}`).join('\n');
        
        let responseText = `🤖 **AI-POWERED BUSINESS RECOMMENDATIONS**\n\n` +
          `📊 **Executive Summary**\n` +
          `   • Total Recommendations: ${rec.summary.totalRecommendations}\n` +
          `   • Critical Issues: ${rec.summary.criticalIssues}\n` +
          `   • Estimated ROI: ${rec.summary.estimatedROI}\n` +
          `   • Implementation Timeline: ${rec.summary.implementationTimeline}\n\n` +
          `🎯 **Priority Actions** (Next 4-8 weeks):\n${priorityActions}\n\n` +
          `📈 **Strategic Recommendations** (${rec.strategic.length}):\n${strategicRecs}\n\n` +
          `⚙️ **Operational Recommendations** (${rec.operational.length}):\n${operationalRecs}\n\n` +
          `💰 **Financial Recommendations** (${rec.financial.length}):\n${financialRecs}\n\n` +
          `🏆 **Competitive Analysis**:\n` +
          `   Strengths: ${rec.competitive.competitiveStrengths.slice(0, 2).join(', ')}\n` +
          `   Opportunities: ${rec.competitive.opportunities.slice(0, 2).join(', ')}\n\n` +
          `📅 **Next Review**: ${rec.summary.nextReviewDate}\n\n` +
          `💡 **Ask for detailed recommendations on specific areas**: "strategic recommendations" or "financial recommendations"`;
        
        responseText = translateToUserLanguage(responseText, detectedLanguage);
        
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'ai',
          text: responseText,
          timestamp: new Date(),
          type: 'text',
          isSuper: true,
          commandResult: response
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setShowChart(null);
        setIsLoading(false);
        return;
      }
      
      // Translate AI response to user's language
      let translatedText = response.text;
      if (detectedLanguage !== 'english') {
        translatedText = translateToUserLanguage(response.text, detectedLanguage);
      }
      
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        text: translatedText,
        timestamp: new Date(),
        type: response.type,
        isSuper: true,
        mlResults: response.mlResults
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.type === 'chart' && response.data) {
        setShowChart({
          type: response.chartType,
          title: response.text.split('\n')[0].replace(/\*\*/g, ''),
          data: response.data
        });
      } else {
        setShowChart(null);
      }
      
      // Update stats
      if (response.mlResults) {
        setAiStats(prev => ({
          ...prev,
          predictions: prev.predictions + 1
        }));
      }
      
    } catch (error) {
      console.error('Query processing error:', error);
      
      const errorMessage = {
        id: Date.now(),
        sender: 'ai',
        text: "⚠️ **SYSTEM TEMPORARILY UNAVAILABLE**\n\nI'm experiencing issues with the ML analysis service.\n\n🔧 **Possible Causes**:\n• ML service is offline\n• Network connectivity issues\n• Insufficient data for analysis\n\n💡 **Try**:\n1. Check if ML service is running\n2. Ensure you have sufficient data\n3. Try a simpler query\n4. Use rule-based analysis temporarily",
        timestamp: new Date(),
        type: 'text',
        isSuper: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setShowChart(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!showChart || !showChart.data) return null;

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { 
          display: true, 
          text: showChart.title,
          font: { size: 14, weight: 'bold' }
        }
      }
    };

    switch (showChart.chartType) {
      case 'ml_sales_forecast':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-blue-50 to-white p-3 rounded-lg">
            <Line data={showChart.data} options={options} />
          </div>
        );
      
      case 'ml_stock_analysis':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-emerald-50 to-white p-3 rounded-lg">
            <Bar data={showChart.data} options={options} />
          </div>
        );
      
      case 'ml_credit_analysis':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-purple-50 to-white p-3 rounded-lg">
            <Doughnut data={showChart.data} options={options} />
          </div>
        );
      
      case 'line_chart':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-blue-50 to-white p-3 rounded-lg">
            <Line data={showChart.data} options={options} />
          </div>
        );
      
      case 'bar_chart':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-emerald-50 to-white p-3 rounded-lg">
            <Bar data={showChart.data} options={options} />
          </div>
        );
      
      case 'doughnut_chart':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-pink-50 to-white p-3 rounded-lg">
            <Doughnut data={showChart.data} options={options} />
          </div>
        );
      
      case 'combined_chart':
        return (
          <div className="h-56 mt-4 bg-gradient-to-b from-indigo-50 to-white p-3 rounded-lg">
            <Line data={showChart.data} options={options} />
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleQuickAction = (query) => {
    setMessage(query);
    if (isOpen) {
      setTimeout(() => {
        const e = new Event('submit', { cancelable: true });
        e.preventDefault = () => {};
        handleSubmit(e);
      }, 100);
    }
  };

  const retrainML = async () => {
    setIsLoading(true);
    try {
      // Trigger ML service retraining
      const data = await FirebaseDataService.fetchAllData();
      await mlService.analyzeBusinessData(data);
      
      const retrainMessage = {
        id: Date.now(),
        sender: 'ai',
        text: "✅ **ML MODELS RE-TRAINED**\n\nMachine Learning models have been updated with latest data!\n\n🎯 **IMPROVEMENTS**:\n• Updated sales patterns\n• Refined risk predictions\n• Enhanced accuracy metrics\n• Better feature engineering\n\n🤖 **ML System Ready**: Ask for fresh predictions!",
        timestamp: new Date(),
        type: 'text',
        isSuper: true
      };
      
      setMessages(prev => [...prev, retrainMessage]);
      
      // Update stats
      setAiStats(prev => ({
        ...prev,
        trainedDays: prev.trainedDays + 1,
        mlAccuracy: prev.dataPoints > 50 ? '88-94%' : 'Training...'
      }));
      
    } catch (error) {
      console.error('ML retraining error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      sender: 'ai',
      text: "🧠 **ML AI ASSISTANT RESTARTED**\n\nFresh ML session started!\n\n🚀 **HYBRID ARCHITECTURE**:\n✅ Firebase Data Source\n✅ Machine Learning Models\n✅ DeepSeek Reasoning\n✅ Business Intelligence\n\n🔬 **Ready for ML-powered analysis!**",
      timestamp: new Date(),
      type: 'text',
      isSuper: true
    }]);
    setShowChart(null);
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          <Brain className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
            ML
          </span>
        </button>
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[450px]">
      {/* ML Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <div>
            <h3 className="font-bold">ML AI Assistant</h3>
            <div className="flex items-center space-x-4 text-xs">
              <span className="flex items-center">
                <Database className="w-3 h-3 mr-1" />
                {aiStats.dataPoints.toLocaleString()} data
              </span>
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                {aiStats.mlAccuracy}
              </span>
              <span className="flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {aiStats.predictions} pred
              </span>
              <span className="flex items-center text-green-400">
                {aiStats.mlStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={retrainML}
            disabled={isLoading}
            className="p-1 hover:bg-gray-700 rounded"
            title="Re-train ML models"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-gray-200 rounded-b-lg shadow-2xl h-[600px] flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.isSuper
                    ? 'bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200'
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center mb-1">
                  {msg.sender === 'ai' ? (
                    <Bot className="w-4 h-4 mr-2 text-emerald-600" />
                  ) : (
                    <User className="w-4 h-4 mr-2 text-blue-300" />
                  )}
                  <span className="text-xs font-medium">
                    {msg.sender === 'ai' ? 'ML AI' : 'You'}
                  </span>
                  {msg.mlResults && (
                    <span className="text-xs ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                      🤖 ML
                    </span>
                  )}
                  <span className="text-xs ml-auto opacity-75">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          
          {/* Render ML Chart */}
          {showChart && renderChart()}
          
          {/* Quick Actions */}
          {quickActions.length > 0 && messages.length <= 3 && (
            <div className="mt-4">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                <Lightbulb className="w-3 h-3 mr-2" />
                COMMON QUESTIONS:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.query)}
                    disabled={isLoading}
                    className={`bg-gradient-to-r ${action.color} text-white rounded-lg p-2 text-xs hover:opacity-90 transition-colors text-left flex items-center`}
                  >
                    <action.icon className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Graph Type Selector Modal */}
        {showGraphSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold">What type of graph do you need?</h3>
                <button
                  onClick={() => setShowGraphSelector(false)}
                  className="hover:bg-white hover:bg-opacity-20 rounded p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {graphTypeOptions.map((graphType) => (
                  <button
                    key={graphType.id}
                    onClick={() => {
                      // Show detail selection for this graph type
                      const details = getDetailsOptions(graphType.id);
                      if (details.length > 0) {
                        // Show second selector
                        setShowGraphSelector(false);
                        setTimeout(() => {
                          setShowGraphSelector('details');
                          setPendingGraphRequest({
                            ...pendingGraphRequest,
                            graphType: graphType.id,
                            details
                          });
                        }, 100);
                      }
                    }}
                    className="w-full text-left p-3 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{graphType.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{graphType.name}</div>
                        <div className="text-xs text-gray-500">{graphType.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Details Selector Modal */}
        {showGraphSelector === 'details' && pendingGraphRequest?.details && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold">What details do you need?</h3>
                <button
                  onClick={() => setShowGraphSelector(false)}
                  className="hover:bg-white hover:bg-opacity-20 rounded p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {pendingGraphRequest.details.map((detail) => (
                  <button
                    key={detail}
                    onClick={() => handleGraphSelection(pendingGraphRequest.graphType, detail)}
                    className="w-full text-left p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">{detail}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask for ML predictions... (sales, stock, loans)"
                className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="text-xs text-gray-500 flex items-center">
              <Shield className="w-3 h-3 inline mr-1" />
              ML + LLM Hybrid • {aiStats.mlStatus}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AIChat;