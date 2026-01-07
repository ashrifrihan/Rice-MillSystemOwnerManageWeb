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
import { ref, onValue, get, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb as db } from '../firebase/config';
import toast from 'react-hot-toast';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('month');
  const [drillDownData, setDrillDownData] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  
  // Real data from Firebase
  const [dashboardData, setDashboardData] = useState({
    financial: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      outstandingLoans: 0,
      revenueGrowth: 0,
      expenseGrowth: 0,
      profitMargin: 0,
      cashFlow: 0,
      yoyGrowth: 0,
      momGrowth: 0
    },
    operational: {
      currentStock: 0,
      stockValue: 0,
      activeDeliveries: 0,
      riskAlerts: 0,
      stockRiskLevel: 'safe',
      productionEfficiency: 0,
      wastageRate: 0,
      orderAccuracy: 0,
      deliveryOnTime: 0
    },
    charts: {
      revenueExpense: {
        labels: [],
        revenue: [],
        expenses: [],
        profit: []
      },
      salesBreakdown: {
        labels: [],
        values: [],
        percentages: []
      },
      loanAnalytics: {
        given: 0,
        recovered: 0,
        pending: 0
      },
      stockLevels: {
        labels: [],
        samba: [],
        nadu: [],
        redRice: []
      },
      deliveryPerformance: {
        onTime: 0,
        delayed: 0
      },
      comparisonData: {
        currentMonth: 0,
        previousMonth: 0,
        currentYear: 0,
        previousYear: 0
      }
    },
    tables: {
      dealerRisk: [],
      stockRisk: [],
      topCustomers: []
    },
    aiInsights: [],
    alerts: {
      stockShortage: 0,
      loanDefault: 0,
      deliveryDelay: 0,
      attendanceIssue: 0,
      qualityIssues: 0
    }
  });

  // Fetch real data from Firebase
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribers = [];

    try {
      // Fetch Orders for revenue calculation
      const ordersRef = ref(db, 'orders');
      const unsubOrders = onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const orders = Object.values(snapshot.val());
          const startDate = dateRange[0].startDate.getTime();
          const endDate = dateRange[0].endDate.getTime();
          
          const filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.placedOn || order.orderDate || order.createdAt).getTime();
            return !isNaN(orderDate) && orderDate >= startDate && orderDate <= endDate;
          });

          // Apply product filter
          const productFiltered = selectedProduct === 'all' 
            ? filteredOrders 
            : filteredOrders.filter(o => {
                const items = o.items || [];
                return items.some(item => 
                  (item.product || '').toLowerCase().includes(selectedProduct.toLowerCase())
                );
              });

          const totalRevenue = productFiltered.reduce((sum, order) => 
            sum + (parseFloat(order.totalAmount) || 0), 0
          );

          const deliveredOrders = productFiltered.filter(o => o.status === 'Delivered');
          const delayedOrders = productFiltered.filter(o => o.status === 'Delayed');
          const activeDeliveries = productFiltered.filter(o => 
            o.status === 'In Transit' || o.status === 'Confirmed'
          ).length;

          // Build weekly revenue chart for selected date range
          const weeklyData = {};
          productFiltered.forEach(order => {
            const orderDate = new Date(order.placedOn || order.orderDate || order.createdAt);
            if (!isNaN(orderDate.getTime())) {
              const weekStart = new Date(orderDate);
              weekStart.setDate(orderDate.getDate() - orderDate.getDay());
              const weekKey = weekStart.toISOString().split('T')[0];
              
              if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { revenue: 0, expenses: 0, profit: 0 };
              }
              const amount = parseFloat(order.totalAmount) || 0;
              weeklyData[weekKey].revenue += amount;
              weeklyData[weekKey].expenses += amount * 0.7; // 70% cost estimate
              weeklyData[weekKey].profit += amount * 0.3; // 30% margin
            }
          });

          const sortedWeeks = Object.keys(weeklyData).sort();
          const weekLabels = sortedWeeks.map(w => new Date(w).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
          const revenueData = sortedWeeks.map(w => weeklyData[w].revenue);
          const expensesData = sortedWeeks.map(w => weeklyData[w].expenses);
          const profitData = sortedWeeks.map(w => weeklyData[w].profit);

          const totalExpenses = expensesData.reduce((a, b) => a + b, 0);
          const totalProfit = revenueData.reduce((a, b) => a + b, 0) - totalExpenses;

          setDashboardData(prev => ({
            ...prev,
            financial: {
              ...prev.financial,
              totalRevenue,
              totalExpenses,
              netProfit: totalProfit,
              profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
            },
            operational: {
              ...prev.operational,
              activeDeliveries,
              deliveryOnTime: deliveredOrders.length > 0 
                ? ((deliveredOrders.length / (deliveredOrders.length + delayedOrders.length)) * 100).toFixed(1)
                : 100
            },
            charts: {
              ...prev.charts,
              revenueExpense: {
                labels: weekLabels.length > 0 ? weekLabels : ['No Data'],
                revenue: revenueData.length > 0 ? revenueData : [0],
                expenses: expensesData.length > 0 ? expensesData : [0],
                profit: profitData.length > 0 ? profitData : [0]
              },
              deliveryPerformance: {
                onTime: deliveredOrders.length,
                delayed: delayedOrders.length
              }
            }
          }));
        } else {
          console.warn('No orders found in Firebase');
        }
      }, (error) => {
        console.error('Orders fetch error:', error);
        toast.error('Failed to load orders data');
      });
      unsubscribers.push(unsubOrders);

      // Fetch Products/Inventory for stock data
      const productsRef = ref(db, 'products');
      const unsubProducts = onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
          const products = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
          
          // Apply product filter
          const filteredProducts = selectedProduct === 'all'
            ? products
            : products.filter(p => 
                (p.category || '').toLowerCase().includes(selectedProduct.toLowerCase()) ||
                (p.name || '').toLowerCase().includes(selectedProduct.toLowerCase())
              );

          const currentStock = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.stock_quantity) || 0), 0);
          const stockValue = filteredProducts.reduce((sum, p) => 
            sum + ((parseFloat(p.stock_quantity) || 0) * (parseFloat(p.price_per_kg) || 0)), 0
          );

          const stockRisk = filteredProducts.map(p => {
            const stock = parseFloat(p.stock_quantity) || 0;
            const minStock = parseFloat(p.min_order_kg) || 100;
            let risk = 'safe';
            if (stock < minStock * 0.5) risk = 'high';
            else if (stock < minStock) risk = 'medium';

            return {
              product: p.name,
              currentStock: stock,
              minimum: minStock,
              risk,
              category: p.category || 'Rice',
              unit: 'kg'
            };
          });

          const salesBreakdown = filteredProducts.reduce((acc, p) => {
            const category = p.category || 'Other';
            if (!acc[category]) acc[category] = 0;
            acc[category] += (parseFloat(p.stock_quantity) || 0) * (parseFloat(p.price_per_kg) || 0);
            return acc;
          }, {});

          const breakdownLabels = Object.keys(salesBreakdown);
          const breakdownValues = Object.values(salesBreakdown);
          const totalValue = breakdownValues.reduce((a, b) => a + b, 0);

          setDashboardData(prev => ({
            ...prev,
            operational: {
              ...prev.operational,
              currentStock,
              stockValue,
              stockRiskLevel: stockRisk.some(s => s.risk === 'high') ? 'high' : 
                             stockRisk.some(s => s.risk === 'medium') ? 'medium' : 'safe'
            },
            charts: {
              ...prev.charts,
              salesBreakdown: {
                labels: breakdownLabels.length > 0 ? breakdownLabels : ['No Data'],
                values: breakdownValues.length > 0 ? breakdownValues : [0],
                percentages: totalValue > 0 
                  ? breakdownValues.map(v => ((v / totalValue) * 100).toFixed(1))
                  : [100]
              }
            },
            tables: {
              ...prev.tables,
              stockRisk
            },
            alerts: {
              ...prev.alerts,
              stockShortage: stockRisk.filter(s => s.risk === 'high').length
            }
          }));
        } else {
          console.warn('No products found in Firebase');
        }
      }, (error) => {
        console.error('Products fetch error:', error);
        toast.error('Failed to load inventory data');
      });
      unsubscribers.push(unsubProducts);

      // Fetch Loans data
      const loansRef = ref(db, 'loans');
      const unsubLoans = onValue(loansRef, (snapshot) => {
        if (snapshot.exists()) {
          const loans = Object.values(snapshot.val());
          const startDate = dateRange[0].startDate.getTime();
          const endDate = dateRange[0].endDate.getTime();
          
          // Filter loans by date range
          const filteredLoans = loans.filter(loan => {
            const loanDate = new Date(loan.date || loan.createdAt || loan.givenDate).getTime();
            return !isNaN(loanDate) && loanDate >= startDate && loanDate <= endDate;
          });
          
          const given = filteredLoans.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
          const recovered = filteredLoans.reduce((sum, l) => sum + (parseFloat(l.paidAmount) || 0), 0);
          const pending = given - recovered;

          const dealerRisk = filteredLoans.reduce((acc, loan) => {
            const dealerName = loan.dealerName || loan.borrowerName || 'Unknown';
            if (!acc[dealerName]) {
              acc[dealerName] = {
                name: dealerName,
                totalLoan: 0,
                recovered: 0,
                pending: 0,
                delayDays: 0,
                risk: 'low'
              };
            }
            acc[dealerName].totalLoan += parseFloat(loan.amount) || 0;
            acc[dealerName].recovered += parseFloat(loan.paidAmount) || 0;
            acc[dealerName].pending += (parseFloat(loan.amount) || 0) - (parseFloat(loan.paidAmount) || 0);
            
            // Calculate delay days
            if (loan.dueDate && acc[dealerName].pending > 0) {
              const dueDate = new Date(loan.dueDate).getTime();
              const today = Date.now();
              if (today > dueDate) {
                acc[dealerName].delayDays = Math.max(
                  acc[dealerName].delayDays,
                  Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
                );
              }
            }
            
            // Calculate risk based on pending amount and delay
            const pendingRatio = acc[dealerName].totalLoan > 0 
              ? acc[dealerName].pending / acc[dealerName].totalLoan 
              : 0;
            if (pendingRatio > 0.5 || acc[dealerName].delayDays > 30) acc[dealerName].risk = 'high';
            else if (pendingRatio > 0.3 || acc[dealerName].delayDays > 15) acc[dealerName].risk = 'medium';
            else acc[dealerName].risk = 'low';
            
            return acc;
          }, {});

          setDashboardData(prev => ({
            ...prev,
            financial: {
              ...prev.financial,
              outstandingLoans: pending
            },
            charts: {
              ...prev.charts,
              loanAnalytics: { given, recovered, pending }
            },
            tables: {
              ...prev.tables,
              dealerRisk: Object.values(dealerRisk)
            },
            alerts: {
              ...prev.alerts,
              loanDefault: Object.values(dealerRisk).filter(d => d.risk === 'high').length
            }
          }));
        } else {
          console.warn('No loans found in Firebase');
        }
      }, (error) => {
        console.error('Loans fetch error:', error);
        toast.error('Failed to load loans data');
      });
      unsubscribers.push(unsubLoans);

      // Fetch trips/vehicles data
      const tripsRef = ref(db, 'trips');
      const unsubTrips = onValue(tripsRef, (snapshot) => {
        if (snapshot.exists()) {
          const trips = Object.values(snapshot.val());
          const startDate = dateRange[0].startDate.getTime();
          const endDate = dateRange[0].endDate.getTime();
          
          const filteredTrips = trips.filter(trip => {
            const tripDate = new Date(trip.startedAt || trip.createdAt).getTime();
            return !isNaN(tripDate) && tripDate >= startDate && tripDate <= endDate;
          });
          
          const delayedTrips = filteredTrips.filter(t => 
            t.status === 'delayed' || t.status === 'Delayed'
          ).length;

          // Calculate route efficiency from trips
          const routeMap = {};
          filteredTrips.forEach(trip => {
            const routeName = trip.route || 'Unknown Route';
            if (!routeMap[routeName]) {
              routeMap[routeName] = {
                route: routeName,
                distance: trip.distance || 0,
                cost: trip.deliveryCost || 0,
                deliveryTime: trip.estimatedTime || 0,
                totalTrips: 0,
                delayedCount: 0
              };
            }
            routeMap[routeName].totalTrips += 1;
            if (trip.status === 'delayed' || trip.status === 'Delayed') {
              routeMap[routeName].delayedCount += 1;
            }
          });

          const routeEfficiency = Object.values(routeMap).map(route => ({
            ...route,
            efficiency: route.totalTrips > 0 
              ? ((route.totalTrips - route.delayedCount) / route.totalTrips) * 100
              : 0
          }));
          
          setDashboardData(prev => ({
            ...prev,
            alerts: {
              ...prev.alerts,
              deliveryDelay: delayedTrips
            },
            tables: {
              ...prev.tables,
              routeEfficiency
            }
          }));
        } else {
          console.warn('No trips found in Firebase');
          setDashboardData(prev => ({
            ...prev,
            tables: {
              ...prev.tables,
              routeEfficiency: []
            }
          }));
        }
      }, (error) => {
        console.error('Trips fetch error:', error);
        toast.error('Failed to load trips data');
      });
      unsubscribers.push(unsubTrips);

      // Fetch workers/attendance data
      const workersRef = ref(db, 'workers');
      const unsubWorkers = onValue(workersRef, (snapshot) => {
        if (snapshot.exists()) {
          const workers = Object.values(snapshot.val());
          const inactiveWorkers = workers.filter(w => w.status !== 'active').length;
          
          setDashboardData(prev => ({
            ...prev,
            alerts: {
              ...prev.alerts,
              attendanceIssue: inactiveWorkers
            }
          }));
        } else {
          console.warn('No workers data found');
        }
      }, (error) => {
        console.error('Workers fetch error:', error);
      });
      unsubscribers.push(unsubWorkers);

      // Fetch real attendance data
      const attendanceRef = ref(db, 'attendance');
      const unsubAttendance = onValue(attendanceRef, (snapshot) => {
        if (snapshot.exists()) {
          const attendanceData = snapshot.val();
          const startDate = dateRange[0].startDate.getTime();
          const endDate = dateRange[0].endDate.getTime();
          
          // Build heatmap: last 7 days x workers
          const last7Days = [];
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(dateStr);
          }
          
          const heatmap = last7Days.map(dateStr => {
            const dayData = attendanceData[dateStr] || {};
            const workerStatuses = Object.values(dayData);
            return workerStatuses.map(status => status === 'present' ? 1 : 0);
          });
          
          setAttendanceHeatmapData(heatmap.length > 0 ? heatmap : [[]]);
        } else {
          setAttendanceHeatmapData([[]]);
        }
      }, (error) => {
        console.error('Attendance fetch error:', error);
        setAttendanceHeatmapData([[]]);
      });
      unsubscribers.push(unsubAttendance);

      setLoading(false);

    } catch (err) {
      console.error('Firebase fetch error:', err);
      setError('Failed to fetch data from Firebase');
      toast.error('Failed to load reports data');
      setLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
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

  // Real attendance heatmap data from Firebase
  const [attendanceHeatmapData, setAttendanceHeatmapData] = useState([]);

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
          
          {/* Real Delivery Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-gray-500" />
              Delivery Performance Summary
            </h4>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <p className="text-xl font-bold text-emerald-700">{dashboardData.operational.deliveryOnTime}%</p>
                <p className="text-xs font-medium text-emerald-800">On-time Delivery</p>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-100">
                <p className="text-xl font-bold text-rose-700">{dashboardData.charts.deliveryPerformance.delayed}</p>
                <p className="text-xs font-medium text-rose-800">Delayed Deliveries</p>
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
          </div>
          <div className="space-y-4">
            {dashboardData.tables.routeEfficiency && dashboardData.tables.routeEfficiency.length > 0 ? (
              dashboardData.tables.routeEfficiency.map((route, index) => {
                const distance = Number(route.distance) || 0;
                const deliveryTime = Number(route.deliveryTime) || 0;
                const efficiency = Number(route.efficiency) || 0;
                const cost = Number(route.cost) || 0;
                const costPerKm = distance > 0 ? cost / distance : 0;
                return (
                  <div 
                    key={index} 
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-sm transition cursor-pointer"
                    onClick={() => handleDrillDown('route', route)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{route.route}</p>
                        <p className="text-xs text-gray-500">{distance}km • {deliveryTime.toFixed(1)} hrs</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        efficiency >= 80 ? 'bg-emerald-100 text-emerald-800' :
                        efficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {efficiency.toFixed(0)}% Efficiency
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Cost per km</p>
                        <p className="text-sm font-medium text-gray-900">Rs. {costPerKm.toFixed(0)}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-gray-200 rounded-full mr-3">
                          <div 
                            className={`h-full rounded-full ${
                              efficiency >= 80 ? 'bg-emerald-500' :
                              efficiency >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(efficiency, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          efficiency >= 80 ? 'text-emerald-600' :
                          efficiency >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {efficiency.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-gray-500">No trip data available</div>
            )}
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