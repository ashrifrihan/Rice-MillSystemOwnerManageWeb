import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarIcon, 
  DownloadIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  AlertTriangleIcon,
  UsersIcon,
  PackageIcon,
  TruckIcon,
  DollarSignIcon,
  CreditCardIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  ClockIcon,
  MapPinIcon,
  FilterIcon,
  PrinterIcon,
  SaveIcon,
  EyeIcon,
  RefreshCwIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ZoomInIcon,
  TargetIcon,
  ShieldAlertIcon,
  PercentIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { 
  Bar, 
  Line, 
  Pie, 
  Doughnut 
} from 'react-chartjs-2';
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
  Filler,
  RadialLinearScale
} from 'chart.js';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

// Enhanced KPI Card Component with better design
const KpiCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  unit = "", 
  isLoading = false,
  onDrillDown
}) => (
  <div 
    className="group relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    onClick={onDrillDown}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} shadow-md transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {unit === "LKR" && "Rs. "}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit === "tons" && " Tons"}
            {unit === "kg" && " kg"}
            {unit === "%" && "%"}
          </h3>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status, size = "md" }) => {
  const config = {
    high: "bg-red-100 text-red-800 border border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    low: "bg-green-100 text-green-800 border border-green-200",
    safe: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    profitable: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    loss: "bg-rose-100 text-rose-800 border border-rose-200",
    critical: "bg-red-100 text-red-800 border border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200"
  };
  
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${config[status] || "bg-gray-100 text-gray-800"} ${sizeClasses[size]}`}>
      {status === 'high' && <AlertCircleIcon className="w-3 h-3 mr-1" />}
      {status === 'medium' && <AlertTriangleIcon className="w-3 h-3 mr-1" />}
      {status === 'safe' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function Reports() {
  // Global Filters State
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('month');
  const [drillDownData, setDrillDownData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  
  // Mock data - In production, this would come from API
  const [dashboardData, setDashboardData] = useState({
    financial: {
      totalRevenue: 24567890,
      totalExpenses: 15678900,
      netProfit: 8888990,
      outstandingLoans: 4567890,
      revenueGrowth: 12.5,
      expenseGrowth: -3.2,
      profitMargin: 36.2,
      cashFlow: 4321000,
      yoyGrowth: 18.7,
      momGrowth: 4.2
    },
    operational: {
      currentStock: 280500,
      stockValue: 18764500,
      activeDeliveries: 12,
      riskAlerts: 7,
      stockRiskLevel: 'medium',
      productionEfficiency: 84.5,
      wastageRate: 2.8,
      orderAccuracy: 98.2,
      deliveryOnTime: 85.5
    },
    charts: {
      revenueExpense: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        revenue: [5200000, 5800000, 6100000, 5900000, 6300000],
        expenses: [3200000, 3500000, 3800000, 3600000, 3700000],
        profit: [2000000, 2300000, 2300000, 2300000, 2600000]
      },
      salesBreakdown: {
        labels: ['Samba', 'Nadu', 'Red Rice', 'Basmati', 'Paddy'],
        values: [4500000, 3800000, 2900000, 5600000, 3200000],
        percentages: [22.5, 19, 14.5, 28, 16]
      },
      loanAnalytics: {
        given: 15678900,
        recovered: 11111010,
        pending: 4567890
      },
      stockLevels: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        samba: [1200, 1100, 900, 800, 750, 700],
        nadu: [2500, 2300, 2100, 2200, 2150, 2100],
        redRice: [1800, 1700, 1650, 1600, 1550, 1500]
      },
      deliveryPerformance: {
        onTime: 85,
        delayed: 15
      },
      comparisonData: {
        currentMonth: 24567890,
        previousMonth: 21000000,
        currentYear: 125678900,
        previousYear: 105000000
      }
    },
    tables: {
      dealerRisk: [
        { name: 'Dealer A', totalLoan: 1250000, recovered: 850000, pending: 400000, delayDays: 15, risk: 'high' },
        { name: 'Dealer B', totalLoan: 980000, recovered: 750000, pending: 230000, delayDays: 8, risk: 'medium' },
        { name: 'Dealer C', totalLoan: 1560000, recovered: 1250000, pending: 310000, delayDays: 3, risk: 'low' },
        { name: 'Dealer D', totalLoan: 750000, recovered: 650000, pending: 100000, delayDays: 25, risk: 'high' }
      ],
      stockRisk: [
        { product: 'Samba', currentStock: 120, minimum: 300, risk: 'high', category: 'Rice', unit: 'kg' },
        { product: 'Nadu', currentStock: 600, minimum: 400, risk: 'safe', category: 'Rice', unit: 'kg' },
        { product: 'Red Rice', currentStock: 350, minimum: 300, risk: 'medium', category: 'Rice', unit: 'kg' },
        { product: 'Basmati', currentStock: 280, minimum: 200, risk: 'safe', category: 'Rice', unit: 'kg' }
      ],
      topCustomers: [
        { name: 'Customer A', orders: 45, totalSpend: 2450000, creditUsed: 450000, region: 'Colombo' },
        { name: 'Customer B', orders: 32, totalSpend: 1890000, creditUsed: 320000, region: 'Kandy' },
        { name: 'Customer C', orders: 28, totalSpend: 1560000, creditUsed: 280000, region: 'Galle' },
        { name: 'Customer D', orders: 25, totalSpend: 1320000, creditUsed: 250000, region: 'Jaffna' }
      ]
    },
    aiInsights: [
      { type: 'production', message: 'Reduce Samba production by 15% next month', priority: 'high', confidence: 92 },
      { type: 'inventory', message: 'Increase stock reorder frequency for Samba', priority: 'medium', confidence: 78 },
      { type: 'loan', message: 'High loan exposure with Dealer A - review terms', priority: 'high', confidence: 95 },
      { type: 'delivery', message: 'Route optimization needed for Southern deliveries', priority: 'medium', confidence: 82 }
    ],
    alerts: {
      stockShortage: 3,
      loanDefault: 2,
      deliveryDelay: 1,
      attendanceIssue: 4,
      qualityIssues: 2
    }
  });

  // Real-time data fetching simulation
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // In production, replace with actual API call
        // const response = await fetch(`/api/reports?start=${dateRange[0].startDate.toISOString()}&end=${dateRange[0].endDate.toISOString()}&product=${selectedProduct}&branch=${selectedBranch}`);
        // const data = await response.json();
        // setDashboardData(data);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update mock data with filter effects
        const filteredData = {
          ...dashboardData,
          financial: {
            ...dashboardData.financial,
            totalRevenue: selectedProduct === 'all' ? 24567890 : 18000000,
            revenueGrowth: selectedProduct === 'all' ? 12.5 : 8.2
          }
        };
        setDashboardData(filteredData);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, selectedProduct, selectedBranch]);

  // Memoized chart configurations for performance
  const chartConfigs = useMemo(() => {
    const revenueExpenseChart = {
      labels: dashboardData.charts.revenueExpense.labels,
      datasets: [
        {
          label: 'Revenue',
          data: dashboardData.charts.revenueExpense.revenue,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Expenses',
          data: dashboardData.charts.revenueExpense.expenses,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Profit',
          data: dashboardData.charts.revenueExpense.profit,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };

    const salesBreakdownChart = {
      labels: dashboardData.charts.salesBreakdown.labels,
      datasets: [
        {
          data: dashboardData.charts.salesBreakdown.values,
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#8B5CF6',
            '#EF4444'
          ],
          borderWidth: 1,
          borderColor: '#fff'
        }
      ]
    };

    const loanFlowChart = {
      labels: ['Loans Given', 'Loans Recovered', 'Pending Loans'],
      datasets: [
        {
          data: [
            dashboardData.charts.loanAnalytics.given,
            dashboardData.charts.loanAnalytics.recovered,
            dashboardData.charts.loanAnalytics.pending
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
          borderWidth: 1,
          borderColor: '#fff'
        }
      ]
    };

    const stockLevelChart = {
      labels: dashboardData.charts.stockLevels.labels,
      datasets: [
        {
          label: 'Samba',
          data: dashboardData.charts.stockLevels.samba,
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'Nadu',
          data: dashboardData.charts.stockLevels.nadu,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.2
        },
        {
          label: 'Red Rice',
          data: dashboardData.charts.stockLevels.redRice,
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true,
          tension: 0.2
        }
      ]
    };

    const deliveryPerformanceChart = {
      labels: ['On Time', 'Delayed'],
      datasets: [
        {
          data: [
            dashboardData.charts.deliveryPerformance.onTime,
            dashboardData.charts.deliveryPerformance.delayed
          ],
          backgroundColor: ['#10B981', '#EF4444'],
          borderWidth: 1,
          borderColor: '#fff'
        }
      ]
    };

    return {
      revenueExpenseChart,
      salesBreakdownChart,
      loanFlowChart,
      stockLevelChart,
      deliveryPerformanceChart
    };
  }, [dashboardData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== undefined) {
              label += new Intl.NumberFormat('en-LK', {
                style: 'currency',
                currency: 'LKR',
                minimumFractionDigits: 0
              }).format(context.parsed.y);
            } else {
              label += new Intl.NumberFormat('en-LK', {
                style: 'currency',
                currency: 'LKR',
                minimumFractionDigits: 0
              }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          callback: function(value) {
            return 'Rs. ' + (value / 1000000).toFixed(1) + 'M';
          },
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          drawBorder: false,
          color: 'rgba(229, 231, 235, 0.5)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-LK').format(number);
  };

  const handleExport = (type) => {
    console.log(`Exporting ${type} data`);
    alert(`Exporting ${type} report...`);
    // Add actual export logic here
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveReport = () => {
    const reportName = prompt('Enter report name:');
    if (reportName) {
      const newReport = {
        id: Date.now(),
        name: reportName,
        date: new Date().toISOString(),
        filters: {
          dateRange,
          selectedProduct,
          selectedBranch
        }
      };
      setSavedReports([...savedReports, newReport]);
      alert(`Report "${reportName}" saved successfully!`);
    }
  };

  const handleDrillDown = (type, data) => {
    setDrillDownData({ type, data });
    // In a real app, you would navigate to a detailed view or show a modal
    console.log('Drill down:', type, data);
  };

  const calculateComparison = () => {
    const current = dashboardData.charts.comparisonData.currentMonth;
    const previous = dashboardData.charts.comparisonData.previousMonth;
    const change = ((current - previous) / previous) * 100;
    return {
      change,
      isPositive: change > 0,
      current,
      previous
    };
  };

  const comparison = calculateComparison();

  // Mock attendance heatmap data
  const attendanceHeatmapData = Array.from({ length: 7 }, (_, day) => 
    Array.from({ length: 20 }, (_, worker) => 
      Math.random() > 0.15 ? 1 : 0 // 85% attendance rate
    )
  );

  // Enhanced product categories for filtering
  const productCategories = [
    { id: 'all', name: 'All Products' },
    { id: 'rice', name: 'Rice Products', subcategories: ['Samba', 'Nadu', 'Red Rice', 'Basmati'] },
    { id: 'paddy', name: 'Paddy' },
    { id: 'byproducts', name: 'By-products', subcategories: ['Bran', 'Husk', 'Broken Rice'] }
  ];

  // Enhanced dealer regions for filtering
  const dealerRegions = [
    { id: 'all', name: 'All Regions' },
    { id: 'colombo', name: 'Colombo' },
    { id: 'kandy', name: 'Kandy' },
    { id: 'galle', name: 'Galle' },
    { id: 'jaffna', name: 'Jaffna' },
    { id: 'other', name: 'Other Regions' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md text-center">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4 md:p-6">
      {/* 🔴 ENHANCED GLOBAL FILTER BAR */}
      <div className="mb-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FilterIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Advanced Analytics Dashboard</h2>
              <p className="text-sm text-gray-600">Apply filters to customize your reports</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Range with Enhanced Picker */}
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {dateRange[0].startDate.toLocaleDateString()} - {dateRange[0].endDate.toLocaleDateString()}
                <ChevronDownIcon className="h-4 w-4 ml-2" />
              </button>
              {showDatePicker && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Select Date Range</h3>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={item => {
                      setDateRange([item.selection]);
                      setShowDatePicker(false);
                    }}
                    className="rounded-lg"
                  />
                  <div className="flex gap-2 mt-4">
                    {['Today', 'This Week', 'This Month', 'Last Month'].map((period) => (
                      <button
                        key={period}
                        className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                        onClick={() => {
                          // Set date range logic for presets
                          setShowDatePicker(false);
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Product Filter with Categories */}
            <div className="relative group">
              <select
                className="block w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-10"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {productCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Enhanced Branch/Location Filter */}
            <div className="relative group">
              <select
                className="block w-full sm:w-auto px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none pr-10"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="main">Main Mill</option>
                <option value="warehouse1">Sub Warehouse 1</option>
                <option value="warehouse2">Sub Warehouse 2</option>
                <option value="all">All Locations</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveReport}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                title="Save Current Report"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                title="Print Report"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={() => handleExport('full')}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all shadow-md"
              >
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </button>
              {loading && (
                <button className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white">
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Filter Options */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Dealer Region:</span>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
              {dealerRegions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Risk Level:</span>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
              <option value="all">All</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Sort By:</span>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
              <option value="revenue">Revenue</option>
              <option value="profit">Profit</option>
              <option value="growth">Growth</option>
              <option value="risk">Risk Level</option>
            </select>
          </div>
        </div>
      </div>

      {/* 📊 ENHANCED EXECUTIVE KPI DASHBOARD */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
            <p className="text-gray-600 mt-2">Real-time insights and predictive analytics for strategic decisions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Data as of</p>
              <p className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200"
              title="Refresh Data"
            >
              <RefreshCwIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Comparison Period Selector */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
          <div className="flex gap-2">
            {['Day', 'Week', 'Month', 'Quarter', 'Year'].map((period) => (
              <button
                key={period}
                onClick={() => setComparisonPeriod(period.toLowerCase())}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  comparisonPeriod === period.toLowerCase()
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <KpiCard 
            title="Total Revenue" 
            value={dashboardData.financial.totalRevenue} 
            subtitle={`${comparison.isPositive ? '↑' : '↓'} ${Math.abs(comparison.change).toFixed(1)}% vs last ${comparisonPeriod}`}
            icon={DollarSignIcon} 
            color="bg-gradient-to-br from-emerald-500 to-teal-600" 
            trend={dashboardData.financial.revenueGrowth} 
            unit="LKR"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('revenue', dashboardData.financial)}
          />
          
          <KpiCard 
            title="Net Profit" 
            value={dashboardData.financial.netProfit} 
            subtitle={`${dashboardData.financial.profitMargin}% margin • Cash flow: ${formatCurrency(dashboardData.financial.cashFlow)}`}
            icon={BarChart3Icon} 
            color="bg-gradient-to-br from-blue-500 to-indigo-600" 
            trend={dashboardData.financial.netProfit > 0 ? 8.5 : -3.2} 
            unit="LKR"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('profit', dashboardData.financial)}
          />
          
          <KpiCard 
            title="Outstanding Loans" 
            value={dashboardData.financial.outstandingLoans} 
            subtitle="High risk exposure • 2 critical alerts"
            icon={CreditCardIcon} 
            color="bg-gradient-to-br from-red-500 to-rose-600" 
            trend={-12.3} 
            unit="LKR"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('loans', dashboardData.financial)}
          />
          
          <KpiCard 
            title="Production Efficiency" 
            value={dashboardData.operational.productionEfficiency} 
            subtitle={`${dashboardData.operational.wastageRate}% wastage • ${dashboardData.operational.orderAccuracy}% accuracy`}
            icon={ActivityIcon} 
            color="bg-gradient-to-br from-purple-500 to-pink-600" 
            trend={+2.4} 
            unit="%"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('efficiency', dashboardData.operational)}
          />
        </div>

        {/* Secondary Operational KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Current Stock" 
            value={(dashboardData.operational.currentStock / 1000).toFixed(1)} 
            subtitle={`Valued at ${formatCurrency(dashboardData.operational.stockValue)} • ${dashboardData.operational.stockRiskLevel} risk`}
            icon={PackageIcon} 
            color="bg-gradient-to-br from-amber-500 to-orange-600" 
            trend={-5.2} 
            unit="tons"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('stock', dashboardData.operational)}
          />
          
          <KpiCard 
            title="Active Deliveries" 
            value={dashboardData.operational.activeDeliveries} 
            subtitle={`${dashboardData.operational.deliveryOnTime}% on-time rate • 3 in transit`}
            icon={TruckIcon} 
            color="bg-gradient-to-br from-cyan-500 to-blue-600" 
            trend={+15.4} 
            unit=""
            isLoading={loading}
            onDrillDown={() => handleDrillDown('deliveries', dashboardData.operational)}
          />
          
          <KpiCard 
            title="Risk Alerts" 
            value={dashboardData.operational.riskAlerts} 
            subtitle="Requires immediate attention • 2 critical"
            icon={AlertTriangleIcon} 
            color="bg-gradient-to-br from-rose-500 to-pink-600" 
            trend={+28.6} 
            unit=""
            isLoading={loading}
            onDrillDown={() => handleDrillDown('alerts', dashboardData.alerts)}
          />
          
          <KpiCard 
            title="YoY Growth" 
            value={dashboardData.financial.yoyGrowth} 
            subtitle={`${dashboardData.financial.momGrowth}% MoM growth • Market leader`}
            icon={TrendingUp} 
            color="bg-gradient-to-br from-green-500 to-emerald-600" 
            trend={dashboardData.financial.yoyGrowth} 
            unit="%"
            isLoading={loading}
            onDrillDown={() => handleDrillDown('growth', dashboardData.financial)}
          />
        </div>
      </div>

      {/* 📈 ENHANCED FINANCIAL ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue vs Expenses Chart with Drill Down */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                  <BarChart3Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Revenue vs Expenses Trend</h3>
              </div>
              <p className="text-sm text-gray-600">Monthly comparison with profit margin analysis</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDrillDown('revenueChart', chartConfigs.revenueExpenseChart)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="View Details"
              >
                <ZoomInIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Line data={chartConfigs.revenueExpenseChart} options={chartOptions} />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-lg font-bold text-emerald-700">{formatCurrency(dashboardData.financial.totalRevenue)}</p>
              <p className="text-xs text-emerald-600">Total Revenue</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-xl">
              <p className="text-lg font-bold text-red-700">{formatCurrency(dashboardData.financial.totalExpenses)}</p>
              <p className="text-xs text-red-600">Total Expenses</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-blue-700">{formatCurrency(dashboardData.financial.netProfit)}</p>
              <p className="text-xs text-blue-600">Net Profit</p>
            </div>
          </div>
        </div>

        {/* Enhanced Sales Breakdown */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <PieChartIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Sales Breakdown by Product</h3>
              </div>
              <p className="text-sm text-gray-600">Revenue contribution with market share analysis</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white">
                <option value="revenue">By Revenue</option>
                <option value="quantity">By Quantity</option>
                <option value="margin">By Profit Margin</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="flex h-full">
                <div className="w-1/2">
                  <Pie data={chartConfigs.salesBreakdownChart} options={chartOptions} />
                </div>
                <div className="w-1/2 pl-6 overflow-y-auto max-h-80">
                  <div className="space-y-3">
                    {dashboardData.charts.salesBreakdown.labels.map((product, index) => {
                      const percentage = dashboardData.charts.salesBreakdown.percentages[index];
                      return (
                        <div 
                          key={product} 
                          className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition"
                          onClick={() => handleDrillDown('product', { product, data: dashboardData.charts.salesBreakdown.values[index] })}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: chartConfigs.salesBreakdownChart.datasets[0].backgroundColor[index] }}
                              />
                              <span className="text-sm font-medium text-gray-900">{product}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="h-1.5 rounded-full"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: chartConfigs.salesBreakdownChart.datasets[0].backgroundColor[index]
                              }}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {formatCurrency(dashboardData.charts.salesBreakdown.values[index])}
                            </span>
                            <div className={`text-xs font-medium ${index === 3 ? 'text-emerald-600' : 'text-gray-600'}`}>
                              {index === 3 ? 'Top Seller' : 'Average'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 💳 ENHANCED LOAN ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enhanced Loan Flow Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                  <CreditCardIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Loan Flow Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">Given, Recovered, and Pending amounts with recovery rate</p>
            </div>
            <button
              onClick={() => handleDrillDown('loanAnalysis', chartConfigs.loanFlowChart)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="View Loan Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Doughnut data={chartConfigs.loanFlowChart} options={chartOptions} />
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-blue-50 rounded-xl">
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(dashboardData.charts.loanAnalytics.given)}
              </p>
              <p className="text-xs text-blue-600">Given</p>
              <div className="mt-1">
                <StatusBadge status="high" size="sm" />
              </div>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-lg font-bold text-emerald-700">
                {formatCurrency(dashboardData.charts.loanAnalytics.recovered)}
              </p>
              <p className="text-xs text-emerald-600">Recovered</p>
              <div className="mt-1">
                <StatusBadge status="safe" size="sm" />
              </div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-xl">
              <p className="text-lg font-bold text-yellow-700">
                {formatCurrency(dashboardData.charts.loanAnalytics.pending)}
              </p>
              <p className="text-xs text-yellow-600">Pending</p>
              <div className="mt-1">
                <StatusBadge status="medium" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Dealer Risk Table with Sorting */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl">
                  <ShieldAlertIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Dealer Risk Ranking</h3>
              </div>
              <p className="text-sm text-gray-600">Sorted by outstanding amount and delay days with action items</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100">
                Send Reminders
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dealer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Loan</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pending</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Delay Days</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Risk</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.tables.dealerRisk.map((dealer, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleDrillDown('dealer', dealer)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <UsersIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dealer.name}</p>
                          <p className="text-xs text-gray-500">Dealer ID: DL-{1000 + index}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-900">{formatCurrency(dealer.totalLoan)}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(dealer.pending)}</p>
                      <p className="text-xs text-gray-500">
                        {((dealer.pending / dealer.totalLoan) * 100).toFixed(1)}% of total
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dealer.delayDays > 20 ? 'bg-red-100 text-red-800' : 
                          dealer.delayDays > 10 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {dealer.delayDays > 10 && <AlertTriangleIcon className="w-3 h-3 mr-1" />}
                          {dealer.delayDays} days
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={dealer.risk} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Outstanding Loans</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(dashboardData.tables.dealerRisk.reduce((sum, dealer) => sum + dealer.pending, 0))}
                </p>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg">
                Generate Collection Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📦 ENHANCED INVENTORY ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enhanced Stock Level Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                  <ActivityIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Stock Level Trends</h3>
              </div>
              <p className="text-sm text-gray-600">Monthly stock variations with reorder point indicators</p>
            </div>
            <div className="flex items-center gap-2">
              <select className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white">
                <option value="all">All Products</option>
                <option value="critical">Critical Only</option>
                <option value="rice">Rice Products</option>
                <option value="paddy">Paddy Stock</option>
              </select>
            </div>
          </div>
          <div className="h-80">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : (
              <Line data={chartConfigs.stockLevelChart} options={chartOptions} />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Critical Items</p>
                <span className="text-xs font-bold text-red-600">2</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Below minimum stock</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Reorder Needed</p>
                <span className="text-xs font-bold text-yellow-600">1</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Within 7 days</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Healthy Stock</p>
                <span className="text-xs font-bold text-emerald-600">2</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Above minimum</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stock Risk & Wastage */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl">
                  <AlertTriangleIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Stock Risk Assessment</h3>
              </div>
              <p className="text-sm text-gray-600">Current stock vs minimum required levels with action timeline</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-lg">
              Bulk Reorder
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.tables.stockRisk.map((item, index) => {
              const stockPercentage = (item.currentStock / item.minimum) * 100;
              return (
                <div 
                  key={index} 
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition cursor-pointer"
                  onClick={() => handleDrillDown('stockItem', item)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        item.risk === 'high' ? 'bg-red-500' : 
                        item.risk === 'medium' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.product}</p>
                        <p className="text-xs text-gray-500">{item.category} • {item.unit}</p>
                      </div>
                    </div>
                    <StatusBadge status={item.risk} size="sm" />
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Current: {item.currentStock.toLocaleString()} {item.unit}</span>
                      <span>Min: {item.minimum.toLocaleString()} {item.unit}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stockPercentage >= 100 ? 'bg-emerald-500' :
                          stockPercentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-xs font-medium ${
                      stockPercentage >= 100 ? 'text-emerald-600' :
                      stockPercentage >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {stockPercentage >= 100 ? 'Adequate Stock' :
                       stockPercentage >= 50 ? `Reorder in ${Math.floor((item.currentStock - item.minimum/2) / 50)} days` :
                       'Reorder Now!'}
                    </p>
                    <button className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Enhanced Wastage Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PercentIcon className="h-4 w-4 text-gray-500" />
              Wastage & Quality Control Summary
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                <p className="text-xl font-bold text-yellow-700">2.5%</p>
                <p className="text-xs font-medium text-yellow-800">Broken Rice</p>
                <p className="text-xs text-yellow-600 mt-1">↓ 0.3% from last month</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <p className="text-xl font-bold text-blue-700">1.2%</p>
                <p className="text-xs font-medium text-blue-800">Moisture Loss</p>
                <p className="text-xs text-blue-600 mt-1">Optimal range: 1-1.5%</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
                <p className="text-xl font-bold text-red-700">0.8%</p>
                <p className="text-xs font-medium text-red-800">Other Losses</p>
                <p className="text-xs text-red-600 mt-1">Theft, spillage, quality reject</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚚 ENHANCED TRANSPORT ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Enhanced Delivery Performance */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delivery Performance</h3>
              </div>
              <p className="text-sm text-gray-600">On-time vs delayed deliveries with SLA compliance</p>
            </div>
            <div className="flex items-center gap-2">
              <TargetIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600">SLA: 90%</span>
            </div>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <Doughnut data={chartConfigs.deliveryPerformanceChart} options={chartOptions} />
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <p className="text-2xl font-bold text-emerald-700">{dashboardData.charts.deliveryPerformance.onTime}%</p>
              <p className="text-sm font-medium text-emerald-800">On Time Rate</p>
              <div className="mt-2">
                <StatusBadge status="safe" size="sm" />
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-100">
              <p className="text-2xl font-bold text-red-700">{dashboardData.charts.deliveryPerformance.delayed}%</p>
              <p className="text-sm font-medium text-red-800">Delayed Rate</p>
              <div className="mt-2">
                <StatusBadge status="high" size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Route Efficiency */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <MapPinIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Route Efficiency Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">Distance vs cost per delivery with optimization suggestions</p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg">
              Optimize Routes
            </button>
          </div>
          <div className="space-y-4">
            {[
              { route: 'Colombo City', distance: 50, cost: 12500, efficiency: 85, deliveryTime: '2.5 hrs', suggestions: 2 },
              { route: 'Kandy Suburbs', distance: 120, cost: 28000, efficiency: 72, deliveryTime: '4 hrs', suggestions: 3 },
              { route: 'Galle Coastal', distance: 180, cost: 42000, efficiency: 65, deliveryTime: '6 hrs', suggestions: 1 },
              { route: 'Jaffna North', distance: 400, cost: 95000, efficiency: 45, deliveryTime: '12 hrs', suggestions: 4 },
            ].map((route, index) => (
              <div 
                key={index} 
                className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition cursor-pointer"
                onClick={() => handleDrillDown('route', route)}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{route.route}</p>
                    <p className="text-xs text-gray-500">{route.distance}km • {route.deliveryTime} • {route.suggestions} optimizations</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    route.efficiency >= 80 ? 'bg-emerald-100 text-emerald-800' :
                    route.efficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {route.efficiency}% Efficiency
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Cost per delivery</p>
                    <p className="text-sm font-medium text-gray-900">Rs. {route.cost.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                      <div 
                        className={`h-full rounded-full ${
                          route.efficiency >= 80 ? 'bg-emerald-500' :
                          route.efficiency >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${route.efficiency}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      route.efficiency >= 80 ? 'text-emerald-600' :
                      route.efficiency >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {route.efficiency}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 👷 ENHANCED WORKER ANALYTICS */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Worker Analytics Dashboard</h3>
            </div>
            <p className="text-sm text-gray-600">Attendance, productivity, and workforce optimization insights</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg">
              Manage Staff
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-4">
            <div className="text-3xl font-bold">94.2%</div>
            <div className="text-sm opacity-90">Average Attendance</div>
            <div className="text-xs opacity-75 mt-1">↑ 1.5% from last month</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4">
            <div className="text-3xl font-bold">Rs. 5,420</div>
            <div className="text-sm opacity-90">Cost per Ton Processed</div>
            <div className="text-xs opacity-75 mt-1">↓ Rs. 320 from last month</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-4">
            <div className="text-3xl font-bold">18.5</div>
            <div className="text-sm opacity-90">Tons/Worker/Month</div>
            <div className="text-xs opacity-75 mt-1">↑ 0.8 from last month</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-4">
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm opacity-90">Absent Today</div>
            <div className="text-xs opacity-75 mt-1">Out of 24 total workers</div>
          </div>
        </div>

        {/* Attendance Heatmap */}
        <div className="mb-8">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            Weekly Attendance Heatmap
          </h4>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="overflow-x-auto">
              <div className="flex">
                {/* Days header */}
                <div className="w-24 pr-4">
                  <div className="h-8"></div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className="h-10 flex items-center text-xs font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Heatmap grid */}
                <div className="flex-1">
                  <div className="flex mb-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="w-6 text-center text-xs font-medium text-gray-500">
                        W{i+1}
                      </div>
                    ))}
                  </div>
                  {attendanceHeatmapData.map((day, dayIndex) => (
                    <div key={dayIndex} className="flex">
                      {day.map((present, workerIndex) => (
                        <div
                          key={`${dayIndex}-${workerIndex}`}
                          className={`w-6 h-10 m-px rounded transition-all ${
                            present 
                              ? 'bg-emerald-500 hover:bg-emerald-600' 
                              : 'bg-red-100 hover:bg-red-200'
                          }`}
                          title={`Worker ${workerIndex+1}, Day ${dayIndex+1}: ${present ? 'Present' : 'Absent'}`}
                          onClick={() => handleDrillDown('attendance', { worker: workerIndex+1, day: dayIndex+1, present })}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                  <span className="text-xs text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span className="text-xs text-gray-600">Absent</span>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                View Detailed Report →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🤖 ENHANCED AI INSIGHTS & RECOMMENDATIONS */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <ActivityIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">AI Business Intelligence</h3>
                <p className="text-sm text-gray-600">Predictive insights and automated recommendations</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Real-time Analysis
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dashboardData.aiInsights.map((insight, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-xl border ${
                insight.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200' :
                'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
              } hover:shadow-md transition`}
            >
              <div className="flex items-start">
                <div className={`p-2 rounded-lg ${
                  insight.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
                }`}>
                  <AlertTriangleIcon className={`h-5 w-5 ${
                    insight.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        insight.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {insight.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                      </span>
                      <span className="text-xs text-gray-500">{insight.type.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-24 h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className="h-1.5 rounded-full bg-blue-500"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Risk Alerts Summary */}
        <div className="pt-6 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlertIcon className="h-4 w-4 text-red-500" />
            Active Risk Alerts Dashboard
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
              <p className="text-2xl font-bold text-red-600">{dashboardData.alerts.stockShortage}</p>
              <p className="text-sm font-medium text-red-700">Stock Shortage</p>
              <p className="text-xs text-red-600 mt-1">Critical items low</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
              <p className="text-2xl font-bold text-red-600">{dashboardData.alerts.loanDefault}</p>
              <p className="text-sm font-medium text-red-700">Loan Default</p>
              <p className="text-xs text-red-600 mt-1">High risk dealers</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.alerts.deliveryDelay}</p>
              <p className="text-sm font-medium text-yellow-700">Delivery Delay</p>
              <p className="text-xs text-yellow-600 mt-1">Routes affected</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
              <p className="text-2xl font-bold text-yellow-600">{dashboardData.alerts.attendanceIssue}</p>
              <p className="text-sm font-medium text-yellow-700">Attendance Issue</p>
              <p className="text-xs text-yellow-600 mt-1">Workers affected</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{dashboardData.alerts.qualityIssues}</p>
              <p className="text-sm font-medium text-blue-700">Quality Issues</p>
              <p className="text-xs text-blue-600 mt-1">Batches affected</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Last updated:</span> {new Date().toLocaleTimeString()}
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg flex items-center gap-2">
            View All Insights
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 📑 ENHANCED DETAILED REPORT TABLES */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-gray-800 to-black rounded-xl">
                <BarChart3Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Detailed Business Reports</h3>
            </div>
            <p className="text-sm text-gray-600">Filterable, searchable, and exportable data tables</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
              CSV Export
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg hover:shadow-lg">
              Excel Export
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
              PDF Report
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:shadow-lg">
              Print Report
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Top Customers Table with Enhanced Features */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Top Customers by Revenue</h4>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search customers..."
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-48"
                />
                <select className="text-sm border border-gray-200 rounded-lg px-2 py-1.5">
                  <option value="revenue">Sort by Revenue</option>
                  <option value="orders">Sort by Orders</option>
                  <option value="credit">Sort by Credit Used</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Region</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Orders</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Spend</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Credit Used</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.tables.topCustomers.map((customer, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleDrillDown('customer', customer)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-blue-700">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-500">ID: CUST-{1000 + index}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {customer.region}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{customer.orders}</p>
                        <p className="text-xs text-gray-500">This month</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(customer.totalSpend)}</p>
                        <p className="text-xs text-gray-500">Avg: {formatCurrency(customer.totalSpend / customer.orders)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="h-1.5 rounded-full bg-blue-500"
                              style={{ width: `${(customer.creditUsed / 500000) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {formatCurrency(customer.creditUsed)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.orders > 30 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {customer.orders > 30 ? 'VIP' : 'Regular'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Report Summary Footer */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Report generated on</p>
              <p className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Data accuracy</p>
                <p className="text-sm font-medium text-gray-900">99.8%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Last sync</p>
                <p className="text-sm font-medium text-gray-900">Just now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 RESPONSIVE DESIGN NOTE */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <div className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>Desktop: 3-column layout</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Tablet: 2-column</span>
          </div>
          <div className="w-px h-4 bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Mobile: Stacked cards</span>
          </div>
        </div>
        <p className="mt-3">🔐 Access restricted to Admin/Owner roles • Automatic data refresh every 5 minutes</p>
      </div>
    </div>
  );
}