import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';
// Pages
import  Dashboard from './pages/Dashboard';
import Orders  from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { LoanManagement } from './pages/LoanManagement';
import { DeliveryTracking } from './pages/DeliveryTracking';
import { WorkerManagement } from './pages/WorkerManagement';
import { AIInsights } from './pages/AIInsights';
import { Proposals } from './pages/Proposals';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { LoanGiven } from './pages/LoanGiven';
import { LoanCollection} from './pages/LoanCollection';
import { SettledLoans } from './pages/SettledLoans';
import { TransportGPS } from './pages/TransportGPS';
import { VehiclesList } from './pages/VehiclesList';
import { AssignTransport } from './pages/AssignTransport';
// NEW PAGES - Add these imports
import  InventoryUpdate  from './pages/InventoryUpdate';
import InventoryHistory from './pages/InventoryHistory';
import NewSale from './pages/NewSale';
import { CustomerList } from './pages/CustomerList';
import {TransportHistory} from './pages/TransportHistory'
import {StaffAttendance} from './pages/StaffAttendance';
// Placeholder pages for other sub-routes (create these files or use main pages)
import { LoanRequests  } from './pages/LoanRequests ';
import { MillConfiguration } from './pages/MillConfiguration';
import { PaymentSettings } from './pages/PaymentSettings';
import { AppSettings } from './pages/AppSettings';
import {SalaryManagement} from './pages/SalaryManagement';
import {WorkLogs} from './pages/WorkLogs';
import { StockPrediction } from './pages/StockPrediction';
import {RiskAlerts} from './pages/RiskAlerts'

import './index.css'; 
// Components
import { AIChat } from './components/AIChat';
// Firebase
import { onAuthStateChanged } from './firebase/auth';
import { useEffect, useState } from 'react';

export function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(authUser => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            {/* Main Routes */}
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="loan-management" element={<LoanManagement />} />
            <Route path="delivery-tracking" element={<DeliveryTracking />} />
            <Route path="worker-management" element={<WorkerManagement />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            
            {/* NEW ROUTES - Add these */}
            
            {/* Rice Stock Sub-routes */}
            <Route path="update" element={<InventoryUpdate />} />
            <Route path="history" element={<InventoryHistory />} />
            
            {/* Sales & Orders Sub-routes */}
            <Route path="new" element={<NewSale />} />
            <Route path="customers" element={<CustomerList />} />
            
            {/* Loan Management Sub-routes */}
           <Route path="loan-management/customers" element={<LoanRequests  />} />
           <Route path="loan-management/given" element={<LoanGiven />} />
           <Route path="loan-management/collection" element={<LoanCollection />} />
           <Route path="loan-management/settled" element={<SettledLoans />} />
                      
            {/* Transport & GPS Sub-routes */}
           <Route path="transport-gps" element={<TransportGPS />} />
          <Route path="transport-gps/vehicles" element={<VehiclesList />} />
          <Route path="transport-gps" element={<TransportGPS />} />
            <Route path="vehicles" element={<VehiclesList />} />
            <Route path="assign" element={<AssignTransport />} />
            <Route path="TransportHistory" element={<TransportHistory />} />
            
            {/* Worker Management Sub-routes */}
            <Route path="attendance" element={<StaffAttendance />} />
            <Route path="salary" element={<SalaryManagement />} />
            <Route path="logs" element={<WorkLogs />} />

            
            {/* AI Analysis Sub-routes */}
            <Route path="stock" element={<StockPrediction />} />
            <Route path="sales" element={<AIInsights />} />
            <Route path="transport-risk" element={<RiskAlerts />} />
            
            {/* Reports Sub-routes */}
            <Route path="reports/daily" element={<Reports />} />
            <Route path="reports/weekly" element={<Reports />} />
            <Route path="reports/monthly" element={<Reports />} />
            <Route path="reports/export" element={<Reports />} />
            
            {/* Settings Sub-routes */}
            <Route path="settings/configuration" element={<MillConfiguration />} />
            <Route path="settings/payments" element={<PaymentSettings />} />
            <Route path="settings/app" element={<AppSettings />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>
          
          {/* Auth Route */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
      <AIChat />
    </>
  );
}

export default App;