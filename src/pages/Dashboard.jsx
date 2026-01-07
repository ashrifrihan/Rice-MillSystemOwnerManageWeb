import React, { useState, useEffect } from "react";
import AIChat from '../components/AIChat';
import FirebaseDataService from '../services/firebaseDataService';
import toast from 'react-hot-toast';
import {
  ShoppingBag,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Truck,
  Thermometer,
  BarChart3,
  Activity,
  Home,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
  AlertCircle,
  PieChart,
  Clock,
  UserCheck,
  Scale,
  TrendingUp as TrendingUpIcon,
  Coffee,
  Wheat,
  Factory,
  CreditCard,
  Users as UsersIcon,
  Calendar,
} from "lucide-react";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const mockData = {
  todaySales: 152500,
  todaySalesReturn: 0,
  todayPurchase: 245000,
  todayPurchaseReturn: 0,
  totalStock: 12500,
  totalSuppliers: 12,
  totalOrdersToday: 15,
  activeVehicles: 6,
  totalVehicles: 10,
  qualityAlerts: 3,
  dispatchesToday: 8,
  lowStockProducts: [
    { id: "1", name: "Brown Rice", stock: 2300, minStock: 3000, variant: "ID #001" },
    { id: "2", name: "25kg Packaging Bags", stock: 4500, minStock: 5000, variant: "ID #002" },
    { id: "3", name: "Rice Bran", stock: 1800, minStock: 2000, variant: "ID #003" },
    { id: "4", name: "Premium Basmati", stock: 5600, minStock: 6000, variant: "ID #004" },
  ],
  topSelling: [
    { name: "Premium Basmati", sales: 85600, qty: 800, trend: +28.7 },
    { name: "Sona Masoori", sales: 63200, qty: 900, trend: +15.4 },
    { name: "Brown Rice", sales: 32450, qty: 500, trend: -4.1 },
    { name: "Jasmine Rice", sales: 12750, qty: 150, trend: +7.7 },
  ],
  recentSales: [
    { id: "Sharma Foods Ltd", amount: 45600, time: "14 minutes ago", category: "Premium Basmati - 50 Bags" },
    { id: "Patel Grocery Chain", amount: 32450, time: "25 minutes ago", category: "Brown Rice - 30 Bags" },
    { id: "Singh Exports", amount: 78900, category: "Premium Basmati - 80 Bags" },
    { id: "Kumar Restaurants", amount: 12750, time: "1 hour ago", category: "Jasmine Rice - 15 Bags" },
    { id: "Gupta Wholesalers", amount: 56200, time: "2 hours ago", category: "Sona Masoori - 40 Bags" },
  ],
  recentTransactions: [
    { date: "20 Nov 2025", customer: "Sharma Foods Ltd", status: "Paid", total: 45600 },
    { date: "20 Nov 2025", customer: "Patel Grocery Chain", status: "Pending", total: 32450 },
    { date: "19 Nov 2025", customer: "Singh Exports", status: "Paid", total: 78900 },
    { date: "19 Nov 2025", customer: "Kumar Restaurants", status: "Paid", total: 12750 },
    { date: "18 Nov 2025", customer: "Gupta Wholesalers", status: "Partial", total: 56200 },
  ],
  stockOverview: [
    { type: "Premium Basmati", quantity: 5600, status: "Good" },
    { type: "Brown Rice", quantity: 2300, status: "Low" },
    { type: "Sona Masoori", quantity: 4200, status: "Good" },
    { type: "Jasmine Rice", quantity: 3450, status: "Good" },
    { type: "Raw Paddy", quantity: 12500, status: "Good" },
  ],
  // New data for additional sections
  productionVsSales: [
    { day: "Mon", paddyProcessed: 8500, riceSold: 7200 },
    { day: "Tue", paddyProcessed: 9200, riceSold: 8100 },
    { day: "Wed", paddyProcessed: 7800, riceSold: 8500 },
    { day: "Thu", paddyProcessed: 9500, riceSold: 8900 },
    { day: "Fri", paddyProcessed: 8800, riceSold: 9200 },
    { day: "Sat", paddyProcessed: 7500, riceSold: 7800 },
    { day: "Sun", paddyProcessed: 6500, riceSold: 6800 },
  ],
  inventoryDistribution: [
    { category: "Paddy", value: 45, quantity: "12,500 kg", color: "bg-amber-500" },
    { category: "Rice", value: 30, quantity: "8,300 kg", color: "bg-emerald-500" },
    { category: "Bran", value: 15, quantity: "4,200 kg", color: "bg-orange-500" },
    { category: "Husk", value: 8, quantity: "2,200 kg", color: "bg-stone-500" },
    { category: "Broken Rice", value: 2, quantity: "550 kg", color: "bg-rose-500" },
  ],
  topRiceProducts: [
    { name: "Nadu Rice", salesQty: 1200, revenue: 120000, trend: +14 },
    { name: "Samba Rice", salesQty: 980, revenue: 98000, trend: +8 },
    { name: "Keeri Samba", salesQty: 420, revenue: 63000, trend: -2 },
    { name: "Basmati", salesQty: 800, revenue: 85600, trend: +28 },
    { name: "Sona Masoori", salesQty: 900, revenue: 63200, trend: +15 },
  ],
  lowStockAlerts: [
    { item: "Samba Paddy", current: 400, min: 1000, unit: "kg", status: "LOW" },
    { item: "Nadu Rice", current: 180, min: 500, unit: "kg", status: "CRITICAL" },
    { item: "50kg Bags", current: 0, min: 100, unit: "pieces", status: "OUT OF STOCK" },
    { item: "Packaging Material", current: 120, min: 300, unit: "rolls", status: "LOW" },
  ],
  recentTransportActivity: [
    { vehicle: "Lorry 05", destination: "Mannar", quantity: "1200 kg", status: "In-Transit", time: "15 min ago" },
    { vehicle: "Lorry 02", destination: "Vavuniya", quantity: "800 kg", status: "Delivered", time: "1 hr ago" },
    { vehicle: "Van 07", destination: "Colombo", quantity: "600 kg", status: "Loading", time: "30 min ago" },
    { vehicle: "Truck 12", destination: "Kandy", quantity: "1500 kg", status: "Delivered", time: "2 hrs ago" },
    { vehicle: "Lorry 09", destination: "Galle", quantity: "900 kg", status: "In-Transit", time: "45 min ago" },
  ],
  loanSummary: [
    { dealer: "Dealer Ramesh", amount: 85000, dueDate: "Today", risk: "Medium" },
    { dealer: "Dealer Abdul", amount: 125000, dueDate: "Overdue", risk: "High" },
    { dealer: "Dealer Suren", amount: 45000, dueDate: "Tomorrow", risk: "Low" },
    { dealer: "Dealer Kamal", amount: 92000, dueDate: "In 3 days", risk: "Medium" },
  ],
  workerAttendance: {
    present: 14,
    absent: 3,
    pendingLogs: 7,
    activeShift: "Morning Shift (7 AM – 3 PM)",
    totalWorkers: 20,
  },
  aiInsights: [
    "Stock-out risk for Nadu Rice within 3 days.",
    "Peak demand predicted on upcoming weekend.",
    "Dealer Suren likely to delay payment again.",
    "Production efficiency down by 8% this week.",
  ],
  monthlyOverview: {
    totalSales: 1850000,
    totalProduction: 2450000,
    transportRuns: 156,
    salariesPaid: 425000,
    avgDailyOutput: 78500,
  },
};

function Dashboard() {
  const [dateRange, setDateRange] = useState("Today");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await FirebaseDataService.fetchAllData();
      
      // Transform Firebase data to match dashboard structure
      const transformedData = {
        todaySales: data.metrics?.totalSales30Days || 0,
        todaySalesReturn: 0,
        todayPurchase: Math.round(data.metrics?.totalSales30Days * 1.6) || 0,
        todayPurchaseReturn: 0,
        totalStock: data.metrics?.totalStockValue || 0,
        totalSuppliers: 12,
        totalOrdersToday: data.sales?.length || 0,
        activeVehicles: data.transport?.filter(t => t.status === 'In-Transit')?.length || 0,
        totalVehicles: data.transport?.length || 10,
        qualityAlerts: 3,
        dispatchesToday: data.transport?.filter(t => t.deliveryDate && new Date(t.deliveryDate).toDateString() === new Date().toDateString())?.length || 0,
        lowStockProducts: data.inventory?.filter(item => item.currentStock < (item.minimumStock || 0)).slice(0, 4).map(item => ({
          id: item.id,
          name: item.name || item.product,
          stock: item.currentStock,
          minStock: item.minimumStock || 100,
          variant: `ID #${item.id}`
        })) || [],
        topSelling: data.sales?.slice(0, 4).map((sale, idx) => ({
          name: sale.product,
          sales: sale.amount || 0,
          qty: sale.quantity || 0,
          trend: ((idx % 2 === 0) ? 1 : -1) * (Math.random() * 30)
        })) || [],
        recentSales: (data.sales && data.sales.length > 0) ? data.sales.slice(0, 5).map(sale => ({
          id: sale.customer || 'Unknown Customer',
          amount: sale.amount || 0,
          time: sale.date ? new Date(sale.date).toLocaleString() : 'Today',
          category: `${sale.product} - ${sale.quantity || 0} kg`
        })) : [
          { id: "Sharma Foods Ltd", amount: 45600, time: "14 minutes ago", category: "Premium Basmati - 50 Bags" },
          { id: "Patel Grocery Chain", amount: 32450, time: "25 minutes ago", category: "Brown Rice - 30 Bags" },
          { id: "Singh Exports", amount: 78900, time: "1 hour ago", category: "Premium Basmati - 80 Bags" },
          { id: "Kumar Restaurants", amount: 12750, time: "1 hour ago", category: "Jasmine Rice - 15 Bags" },
          { id: "Gupta Wholesalers", amount: 56200, time: "2 hours ago", category: "Sona Masoori - 40 Bags" },
        ],
        recentTransactions: data.sales?.slice(0, 5).map(sale => ({
          date: sale.date ? new Date(sale.date).toLocaleDateString() : new Date().toLocaleDateString(),
          customer: sale.customer || 'Walk-in Customer',
          status: ['Paid', 'Pending', 'Partial'][Math.floor(Math.random() * 3)],
          total: sale.amount || 0
        })) || [],
        stockOverview: data.inventory?.slice(0, 5).map(item => ({
          type: item.name || item.product,
          quantity: item.currentStock,
          status: item.currentStock >= (item.minimumStock || 0) ? 'Good' : 'Low'
        })) || [],
        productionVsSales: [
          { day: "Mon", paddyProcessed: 8500, riceSold: 7200 },
          { day: "Tue", paddyProcessed: 9200, riceSold: 8100 },
          { day: "Wed", paddyProcessed: 7800, riceSold: 8500 },
          { day: "Thu", paddyProcessed: 9500, riceSold: 8900 },
          { day: "Fri", paddyProcessed: 8800, riceSold: 9200 },
          { day: "Sat", paddyProcessed: 7500, riceSold: 7800 },
          { day: "Sun", paddyProcessed: 6500, riceSold: 6800 },
        ],
        inventoryDistribution: [
          { category: "Paddy", value: 45, quantity: `${Math.round(data.metrics?.totalStockValue * 0.45 || 0)} kg`, color: "bg-amber-500" },
          { category: "Rice", value: 30, quantity: `${Math.round(data.metrics?.totalStockValue * 0.30 || 0)} kg`, color: "bg-emerald-500" },
          { category: "Bran", value: 15, quantity: `${Math.round(data.metrics?.totalStockValue * 0.15 || 0)} kg`, color: "bg-orange-500" },
          { category: "Husk", value: 8, quantity: `${Math.round(data.metrics?.totalStockValue * 0.08 || 0)} kg`, color: "bg-stone-500" },
          { category: "Broken Rice", value: 2, quantity: `${Math.round(data.metrics?.totalStockValue * 0.02 || 0)} kg`, color: "bg-rose-500" },
        ],
        topRiceProducts: (data.sales && data.sales.length > 0) ? data.sales.slice(0, 5).map((sale, idx) => ({
          name: sale.product,
          salesQty: sale.quantity || 0,
          revenue: sale.amount || 0,
          trend: ((idx % 2 === 0) ? 1 : -1) * (Math.random() * 30)
        })) : [
          { name: "Nadu Rice", salesQty: 1200, revenue: 120000, trend: +14 },
          { name: "Samba Rice", salesQty: 980, revenue: 98000, trend: +8 },
          { name: "Keeri Samba", salesQty: 420, revenue: 63000, trend: -2 },
          { name: "Basmati", salesQty: 800, revenue: 85600, trend: +28 },
          { name: "Sona Masoori", salesQty: 900, revenue: 63200, trend: +15 },
        ],
        lowStockAlerts: data.inventory?.filter(item => item.currentStock < (item.minimumStock || 0)).slice(0, 4).map(item => ({
          item: item.name || item.product,
          current: item.currentStock,
          min: item.minimumStock || 100,
          unit: "kg",
          status: item.currentStock === 0 ? "OUT OF STOCK" : item.currentStock < (item.minimumStock * 0.3) ? "CRITICAL" : "LOW"
        })) || [],
        recentTransportActivity: (data.transport && data.transport.length > 0) ? data.transport.slice(0, 5).map(t => ({
          vehicle: t.vehicleNumber || 'Vehicle',
          destination: t.destination || 'Unknown',
          quantity: `${t.quantity || 0} kg`,
          status: t.status || 'In-Transit',
          time: t.deliveryDate ? new Date(t.deliveryDate).toLocaleString() : 'Today'
        })) : [
          { vehicle: "Lorry 05", destination: "Mannar", quantity: "1200 kg", status: "In-Transit", time: "15 min ago" },
          { vehicle: "Lorry 02", destination: "Vavuniya", quantity: "800 kg", status: "Delivered", time: "1 hr ago" },
          { vehicle: "Van 07", destination: "Colombo", quantity: "600 kg", status: "Loading", time: "30 min ago" },
          { vehicle: "Truck 12", destination: "Kandy", quantity: "1500 kg", status: "Delivered", time: "2 hrs ago" },
          { vehicle: "Lorry 09", destination: "Galle", quantity: "900 kg", status: "In-Transit", time: "45 min ago" },
        ],
        loanSummary: data.loans?.slice(0, 4).map(loan => ({
          dealer: loan.customer || 'Dealer',
          amount: loan.outstandingAmount || 0,
          dueDate: loan.overdueDays > 0 ? 'Overdue' : loan.overdueDays === 0 ? 'Today' : `In ${Math.abs(loan.overdueDays)} days`,
          risk: loan.overdueDays > 30 ? 'High' : loan.overdueDays > 0 ? 'Medium' : 'Low'
        })) || [],
        workerAttendance: {
          present: data.workers?.filter(w => w.status === 'active')?.length || 14,
          absent: data.workers?.filter(w => w.status === 'absent')?.length || 3,
          pendingLogs: 7,
          activeShift: "Morning Shift (7 AM – 3 PM)",
          totalWorkers: data.workers?.length || 20,
        },
        aiInsights: [
          `${data.inventory?.filter(i => i.currentStock < i.minimumStock).length || 0} products have stock-out risk.`,
          "Peak demand predicted based on historical patterns.",
          `${data.loans?.filter(l => l.overdueDays > 0).length || 0} loans are overdue.`,
          "Production efficiency tracking from inventory data.",
        ],
        monthlyOverview: {
          totalSales: data.metrics?.totalSales30Days || 0,
          totalProduction: Math.round((data.metrics?.totalSales30Days || 0) * 1.3),
          transportRuns: data.transport?.length || 0,
          salariesPaid: 425000,
          avgDailyOutput: Math.round((data.metrics?.totalSales30Days || 0) / 30),
        },
      };
      
      setDashboardData(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  const KpiCard = ({ title, value, subtitle, icon: Icon, color, trend, unit = "" }) => (
    <div className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color} shadow-lg transform group-hover:scale-110 transition-transform`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900">
          {unit === "Rs," && "Rs."}
          {value.toLocaleString()}
          {unit === "kg" && " kg"}
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </div>
    </div>
  );

  const AlertBanner = ({ children, type = "warning" }) => (
    <div className={`rounded-2xl px-6 py-4 flex items-center justify-between backdrop-blur-xl border ${
      type === "warning" 
        ? "bg-orange-50/80 border-orange-200" 
        : "bg-red-50/80 border-red-200"
    }`}>
      <div className="flex items-center gap-3">
        <AlertTriangle className={`w-6 h-6 ${type === "warning" ? "text-orange-600" : "text-red-600"}`} />
        <p className="font-semibold text-gray-800">{children}</p>
      </div>
      <button className="px-5 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition">
        Add Stock →
      </button>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const config = {
      Paid: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Pending: "bg-amber-100 text-amber-700 border border-amber-200",
      Partial: "bg-blue-100 text-blue-700 border border-blue-200",
      Good: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Low: "bg-red-100 text-red-700 border border-red-200",
      "In-Transit": "bg-blue-100 text-blue-700 border border-blue-200",
      Delivered: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      Loading: "bg-amber-100 text-amber-700 border border-amber-200",
      CRITICAL: "bg-red-100 text-red-700 border border-red-200",
      "OUT OF STOCK": "bg-rose-100 text-rose-700 border border-rose-200",
      Medium: "bg-amber-100 text-amber-700 border border-amber-200",
      High: "bg-red-100 text-red-700 border border-red-200",
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${config[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg font-medium">No data available</p>
          <button onClick={loadDashboardData} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const mockData = dashboardData;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
       

        <div className="p-8 space-y-8">
         <AIChat />

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Total Stock" value={mockData.totalStock} subtitle="12,500 kg across all variants" icon={Package} color="bg-gradient-to-br from-amber-500 to-orange-600" trend={+8.2} unit="kg" />
            <KpiCard title="Today's Sales" value={mockData.todaySales} subtitle="15 orders • ↑ 12% vs yesterday" icon={DollarSign} color="bg-gradient-to-br from-emerald-500 to-teal-600" trend={+12.4} unit="Rs." />
            <KpiCard title="Today's Purchase" value={mockData.todayPurchase} subtitle="From 8 suppliers" icon={Truck} color="bg-gradient-to-br from-blue-500 to-indigo-600" trend={+5.2} unit="Rs." />
            <KpiCard title="Active Vehicles" value={`${mockData.activeVehicles}/${mockData.totalVehicles}`} subtitle="On route or loading" icon={Truck} color="bg-gradient-to-br from-purple-500 to-pink-600" />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KpiCard title="Pending Payments" value={89000} subtitle="8 suppliers" icon={AlertCircle} color="bg-gradient-to-br from-red-500 to-rose-600" trend={-3.1} unit="Rs." />
            <KpiCard title="Quality Alerts" value={mockData.qualityAlerts} subtitle="Requires immediate attention" icon={Thermometer} color="bg-gradient-to-br from-orange-500 to-red-600" trend={+300} />
            <KpiCard title="Dispatches Today" value={mockData.dispatchesToday} subtitle="On schedule" icon={Truck} color="bg-gradient-to-br from-cyan-500 to-blue-600" trend={+25} />
            <KpiCard title="Low Stock Items" value={mockData.lowStockProducts.length} subtitle="Reorder recommended" icon={AlertTriangle} color="bg-gradient-to-br from-rose-500 to-pink-600" trend={-15} />
          </div>

          {/* Production vs Sales Chart + Stock Pie Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    Production vs Sales Trend
                  </h2>
                  <div className="flex gap-2">
                    {["Week", "Month", "Year"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setDateRange(t)}
                        className={`px-4 py-2 rounded-xl font-medium text-sm transition ${
                          dateRange === t
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 hover:bg-blue-100"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm font-medium">Daily Paddy Processed (kg)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                        <span className="text-sm font-medium">Daily Rice Sold (kg)</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      Efficiency Ratio: {(7800 / 8500 * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between space-x-4">
                    {mockData.productionVsSales.map((dayData, index) => (
                      <div key={dayData.day} className="flex flex-col items-center flex-1">
                        <div className="text-center text-sm font-medium text-gray-600 mb-2">
                          {dayData.day}
                        </div>
                        <div className="relative w-full h-48 flex items-end justify-center">
                          <div className="absolute bottom-0 w-6 bg-blue-500/80 rounded-t-lg" 
                            style={{ height: `${(dayData.paddyProcessed / 10000) * 100}%` }}>
                          </div>
                          <div className="absolute bottom-0 w-6 bg-emerald-500/80 rounded-t-lg ml-8" 
                            style={{ height: `${(dayData.riceSold / 10000) * 100}%` }}>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {dayData.paddyProcessed.toLocaleString()} kg
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">📈 Insight</p>
                      <p className="text-sm text-gray-600">Sales consistently at 85-95% of production - optimal efficiency</p>
                    </div>
                    <div className="text-emerald-600 font-bold">↑ 8.5% better than last week</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Distribution Pie Chart */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <PieChart className="w-7 h-7 text-purple-600" />
                Inventory Distribution
              </h3>
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 mb-6">
                  {/* Simplified pie chart representation */}
                  <div className="absolute inset-0 rounded-full border-8 border-amber-500"></div>
                  <div className="absolute inset-8 rounded-full border-8 border-emerald-500"></div>
                  <div className="absolute inset-16 rounded-full border-8 border-orange-500"></div>
                  <div className="absolute inset-24 rounded-full border-8 border-stone-500"></div>
                  <div className="absolute inset-32 rounded-full border-8 border-rose-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">28,550</div>
                      <div className="text-sm text-gray-600">Total kg</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {mockData.inventoryDistribution.map((item) => (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`}></div>
                      <span className="font-medium text-gray-900">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.value}%</div>
                      <div className="text-sm text-gray-600">{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
                Detailed Inventory Report
              </button>
            </div>
          </div>

          {/* Top Products + Low Stock + ales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Selling Rice Products */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <TrendingUpIcon className="w-7 h-7 text-emerald-600" />
                Top Selling Rice Products (Today)
              </h3>
              <div className="space-y-4">
                {mockData.topRiceProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        index === 0 ? "bg-amber-100" : 
                        index === 1 ? "bg-emerald-100" : 
                        index === 2 ? "bg-blue-100" : "bg-purple-100"
                      }`}>
                        <span className="font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.salesQty.toLocaleString()} kg sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">Rs.{product.revenue.toLocaleString()}</div>
                      <div className={`text-sm font-semibold ${product.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {product.trend > 0 ? '↑' : '↓'} {Math.abs(product.trend)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-orange-50/80 border-2 border-orange-200 rounded-3xl p-8 shadow-xl">
              <h3 className="text-xl font-bold mb-6 text-orange-800 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7" />
                Critical Low Stock Alerts
              </h3>
              <div className="space-y-4">
                {mockData.lowStockAlerts.map((item) => (
                  <div key={item.item} className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-gray-900">{item.item}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {item.current === 0 ? "Out of stock" : `${item.current.toLocaleString()} ${item.unit} left`}
                      </p>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Min: {item.min.toLocaleString()} {item.unit}</p>
                        <p className={`text-lg font-bold ${
                          item.status === "CRITICAL" ? "text-red-600" :
                          item.status === "OUT OF STOCK" ? "text-rose-600" : "text-orange-600"
                        }`}>
                          {item.current === 0 ? "REORDER NOW" : `${Math.round((item.current / item.min) * 100)}% of min`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700">
                Reorder All Now
              </button>
            </div>

            {/* Recent Sales Activity */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-7 h-7 text-blue-600" />
                Recent Sales Activity
              </h3>
              <div className="space-y-4">
                {mockData.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{sale.id}</p>
                          <p className="text-sm text-gray-600">{sale.category}</p>
                        </div>
                        <span className="text-xs text-gray-500">{sale.time || "Today"}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <StatusBadge status="Paid" />
                        <span className="font-bold text-gray-900">Rs.{sale.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
                View All Sales
              </button>
            </div>
          </div>

          {/* Recent Transport + Loan Summary + Worker Attendance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Transport Activity */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Truck className="w-7 h-7 text-green-600" />
                Recent Transport Activity
              </h3>
              <div className="space-y-4">
                {mockData.recentTransportActivity.map((transport) => (
                  <div key={transport.vehicle} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                          <Truck className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{transport.vehicle}</p>
                          <p className="text-sm text-gray-600">To: {transport.destination}</p>
                        </div>
                      </div>
                      <StatusBadge status={transport.status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{transport.quantity}</span>
                      <span className="text-xs text-gray-500">{transport.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Loan & Payment Summary */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <CreditCard className="w-7 h-7 text-purple-600" />
                Loan & Payment Summary
              </h3>
              <div className="space-y-4">
                {mockData.loanSummary.map((loan) => (
                  <div key={loan.dealer} className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl hover:from-purple-50 transition">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-gray-900">{loan.dealer}</p>
                      <StatusBadge status={loan.risk} />
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">Rs.{loan.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Due: {loan.dueDate}</p>
                      </div>
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">
                        Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-900">Total Active Loans</p>
                    <p className="text-2xl font-bold text-amber-700">Rs.347,000</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Due Today</p>
                    <p className="text-xl font-bold text-red-600">Rs.85,000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Worker & Attendance Snapshot */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <UserCheck className="w-7 h-7 text-cyan-600" />
                Worker Attendance
              </h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6">
                  <div className="text-4xl font-bold">{mockData.workerAttendance.present}</div>
                  <div className="text-sm opacity-90">Present Today</div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-6">
                  <div className="text-4xl font-bold">{mockData.workerAttendance.absent}</div>
                  <div className="text-sm opacity-90">Absent Today</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900">Active Shift</p>
                    <p className="text-sm text-gray-600">{mockData.workerAttendance.activeShift}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{mockData.workerAttendance.pendingLogs}</p>
                    <p className="text-sm text-gray-600">Pending Logs</p>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-cyan-50 rounded-2xl">
                  <div>
                    <p className="font-medium text-gray-900">Total Workforce</p>
                    <p className="text-sm text-gray-600">{mockData.workerAttendance.totalWorkers} workers</p>
                  </div>
                  <button className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700">
                    Manage Staff
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-100 p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Activity className="w-7 h-7 text-indigo-600" />
              AI Insights & Predictions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockData.aiInsights.map((insight, index) => (
                <div key={index} className="bg-white/80 rounded-2xl p-6 hover:shadow-lg transition">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${
                      index === 0 ? "bg-rose-100" :
                      index === 1 ? "bg-amber-100" :
                      index === 2 ? "bg-blue-100" : "bg-emerald-100"
                    }`}>
                      {index === 0 && <AlertTriangle className="w-6 h-6 text-rose-600" />}
                      {index === 1 && <TrendingUp className="w-6 h-6 text-amber-600" />}
                      {index === 2 && <Clock className="w-6 h-6 text-blue-600" />}
                      {index === 3 && <Factory className="w-6 h-6 text-emerald-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{insight}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {index === 0 && "Prediction confidence: 92%"}
                        {index === 1 && "Based on historical sales data"}
                        {index === 2 && "Payment pattern analysis"}
                        {index === 3 && "Machine efficiency metrics"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition">
              View All Insights →
            </button>
          </div>

          {/* Monthly Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { 
                label: "Monthly Sales", 
                value: `Rs.${(mockData.monthlyOverview.totalSales / 100000).toFixed(1)}L`,
                icon: DollarSign,
                color: "from-emerald-500 to-teal-600"
              },
              { 
                label: "Monthly Production", 
                value: `${(mockData.monthlyOverview.totalProduction / 1000).toFixed(1)}k kg`,
                icon: Factory,
                color: "from-blue-500 to-indigo-600"
              },
              { 
                label: "Transport Runs", 
                value: mockData.monthlyOverview.transportRuns,
                icon: Truck,
                color: "from-orange-500 to-red-600"
              },
              { 
                label: "Salaries Paid", 
                value: `Rs.${(mockData.monthlyOverview.salariesPaid / 1000).toFixed(1)}k`,
                icon: UsersIcon,
                color: "from-purple-500 to-pink-600"
              },
              { 
                label: "Avg Daily Output", 
                value: `${(mockData.monthlyOverview.avgDailyOutput / 1000).toFixed(1)}k kg`,
                icon: TrendingUp,
                color: "from-cyan-500 to-blue-600"
              },
            ].map((stat) => (
              <div key={stat.label} className="group bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl transition-all">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Active Suppliers", value: "12" },
              { label: "Available Drivers", value: "8" },
              { label: "Order Accuracy", value: "98.2%" },
              { label: "Avg Delivery Time", value: "4.8 hrs" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-lg border border-gray-100">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;