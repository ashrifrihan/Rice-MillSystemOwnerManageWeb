import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  PackageIcon,
  BarChartIcon,
  SettingsIcon,
  BanknoteIcon,
  TruckIcon,
  UsersIcon,
  LightbulbIcon,
  FileTextIcon,
  MenuIcon,
  XIcon,
  UserIcon,
  MapIcon,
  ChevronDownIcon,
  IndianRupeeIcon,
  ShieldIcon,
  DatabaseIcon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon
} from "lucide-react";

// Custom icon components
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const currentPath = location.pathname;
    const newExpandedItems = { ...expandedItems };
    
    navItems.forEach(item => {
      if (item.subItems) {
        const isActiveSubItem = item.subItems.some(subItem => 
          currentPath.startsWith(subItem.path)
        );
        if (isActiveSubItem) {
          newExpandedItems[item.name] = true;
        }
      }
    });
    
    setExpandedItems(newExpandedItems);
  }, [location.pathname]);

  const navItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: HomeIcon,
      description: "Overview & Analytics"
    },
    { 
      name: "Rice Stock", 
      path: "/inventory", 
      icon: PackageIcon,
      badge: 3,
      description: "Inventory Management",
      subItems: [
        { name: "View Stock", path: "/inventory", icon: DatabaseIcon },
        { name: "Add / Update Stock", path: "/update", icon: TrendingUpIcon },
        { name: "Stock History", path: "/history", icon: CalendarIcon }
      ]
    },
    { 
      name: "Sales & Orders", 
      path: "/orders", 
      icon: ShoppingCartIcon, 
      badge: 5,
      description: "Customer Orders",
      subItems: [
        { name: "New Sale", path: "/new", icon: PlusIcon },
        { name: "Sales Records", path: "/orders", icon: FileTextIcon },
        { name: "Customer List", path: "/customers", icon: UsersIcon }
      ]
    },
    { 
      name: "Loan Management", 
      path: "/loan-management", 
      icon: BanknoteIcon,
      badge: 2,
      description: "Rice Loans & Recovery",
      subItems: [
        { name: "Loan Request", path: "/loan-management/customers", icon: UsersIcon },
        { name: "Loan Given", path: "/loan-management/given", icon: BanknoteIcon },
        { name: "Loan Collection", path: "/loan-management/collection", icon: IndianRupeeIcon },
        { name: "Settled Loans", path: "/loan-management/settled", icon: CheckCircleIcon }
      ]
    },
    { 
      name: "Transport & GPS", 
      path: "/transport-gps", 
      icon: TruckIcon, 
      badge: 3,
      description: "Delivery Tracking",
      subItems: [
        { name: "Vehicles List", path: "/vehicles", icon: TruckIcon },
        { name: "Assign Transport", path: "/assign", icon: MapPinIcon },
        { name: "Live Vehicle Map", path: "/transport-gps", icon: MapIcon },
        { name: "Transport History", path: "/transport-history", icon: CalendarIcon }
      ]
    },
    { 
      name: "Worker Management", 
      path: "/worker-management", 
      icon: UsersIcon,
      description: "Staff & Attendance",
      subItems: [
        { name: "Worker Attendance", path: "/attendance", icon: CalendarIcon },
        { name: "Salary Management", path: "/salary", icon: IndianRupeeIcon },
        { name: "Work Logs", path: "/logs", icon: FileTextIcon }
      ]
    },
    { 
      name: "AI Analysis", 
      path: "/ai-insights", 
      icon: LightbulbIcon, 
      badge: 2,
      description: "Smart Insights",
      subItems: [
        { name: "Stock Prediction", path: "/stock", icon: TrendingUpIcon },
        { name: "AI Recommendations", path: "sales", icon: BarChartIcon },
        { name: "Risk Alerts", path: "/transport-risk", icon: ShieldIcon }
      ]
    },
    { 
      name: "Reports", 
      path: "/reports", 
      icon: BarChartIcon,
      description: "Analytics & Export",
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: SettingsIcon,
      description: "System Configuration",
      subItems: [
        { name: "Profile", path: "/profile", icon: UserIcon },
        { name: "Mill Configuration", path: "/settings/configuration", icon: SettingsIcon },
      ]
    },
  ];

  const toggleSubMenu = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#16A34A] text-white rounded-lg shadow-lg hover:bg-[#15803D] transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col h-full bg-gradient-to-b from-[#16A34A] to-[#15803D] text-white shadow-2xl`}
      >
        {/* Logo Section */}
        <div className="flex items-center h-20 px-6 border-b border-green-600/50 bg-green-800/20">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="font-bold text-2xl text-[#16A34A]">🌾</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Rice Mill</h1>
              <p className="text-green-100 text-sm">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <div key={item.name} className="group">
                {item.subItems ? (
                  <div className="rounded-lg transition-all duration-200 hover:bg-green-700/30">
                    <button
                      onClick={() => toggleSubMenu(item.name)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        expandedItems[item.name] 
                          ? "bg-green-800/60 text-white shadow-inner" 
                          : "text-green-100 hover:text-white hover:bg-green-700/40"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg transition-colors ${
                          expandedItems[item.name] 
                            ? "bg-white/20" 
                            : "bg-white/10 group-hover:bg-white/20"
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-green-200/70 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-800 bg-white rounded-full min-w-6">
                            {item.badge}
                          </span>
                        )}
                        <ChevronDownIcon 
                          className={`h-4 w-4 transition-transform duration-200 ${
                            expandedItems[item.name] ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-300 ${
                      expandedItems[item.name] ? 'max-h-96' : 'max-h-0'
                    }`}>
                      <div className="ml-4 mt-2 space-y-1 border-l-2 border-green-500/30 pl-3 py-1">
                        {item.subItems.map((subItem) => (
                          <NavLink
                            key={subItem.name}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 group ${
                                isActive
                                  ? "bg-white/20 text-white shadow-sm border-l-2 border-white"
                                  : "text-green-100 hover:text-white hover:bg-green-700/30"
                              }`
                            }
                            onClick={closeSidebar}
                          >
                            <div className={`p-1.5 rounded ${
                              location.pathname === subItem.path 
                                ? "bg-white/30" 
                                : "bg-white/10 group-hover:bg-white/20"
                            }`}>
                              {subItem.icon && <subItem.icon className="h-3.5 w-3.5" />}
                            </div>
                            <span className="font-medium">{subItem.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-white/20 text-white shadow-inner border-l-2 border-white"
                          : "text-green-100 hover:text-white hover:bg-green-700/30"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      location.pathname === item.path 
                        ? "bg-white/20" 
                        : "bg-white/10 group-hover:bg-white/20"
                    }`}>
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-green-200/70 mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-800 bg-white rounded-full min-w-6">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;