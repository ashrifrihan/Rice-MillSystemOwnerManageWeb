import React, { useEffect, useState, useRef } from 'react'; // <-- Make sure useState is imported
import { Menu, Bell, LogOut, Settings, UserCircle, Search, ChevronDown, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { mockNotificationsData } from '../../data/mockData';
import { signOut } from '../../firebase/auth';

export function Header({ onMenuButtonClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const unreadCount = mockNotificationsData.filter(notification => !notification.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      signOut().then(() => {
        console.log('Signed out successfully');
      }).catch(error => {
        console.error('Sign out error:', error);
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Menu Button */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            type="button" 
            className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={onMenuButtonClick}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right Section - Search & User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search Bar - Desktop only */}
          <div className="hidden md:block relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, products, dealers..."
              className="pl-12 pr-4 py-3 bg-gray-100 rounded-2xl w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              className="p-2 md:p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="fixed inset-0 z-[9999] md:absolute md:inset-auto md:right-0 md:top-full md:mt-2">
                <div 
                  className="fixed inset-0 bg-black/20 md:hidden"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-2 top-16 md:right-0 md:top-0 md:relative">
                  <NotificationDropdown 
                    notifications={mockNotificationsData} 
                    onClose={() => setShowNotifications(false)} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Report Button - Desktop only */}
          <button className="hidden md:block px-4 lg:px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-2xl font-semibold hover:shadow-lg transition">
            Generate Report
          </button>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button 
              className="flex items-center space-x-2 md:space-x-3 p-2 rounded-2xl hover:bg-gray-100 transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm md:text-lg">
                RO
              </div>
              <div className="hidden lg:block text-left">
                <div className="font-semibold text-gray-900">Rice Owner</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-500 hidden lg:block" />
            </button>

            {showProfileMenu && (
              <div className="fixed inset-0 z-[9999] md:absolute md:inset-auto md:right-0 md:top-full md:mt-2">
                {/* Mobile overlay */}
                <div 
                  className="fixed inset-0 bg-black/20 md:hidden"
                  onClick={() => setShowProfileMenu(false)}
                />
                {/* Dropdown */}
                <div className="absolute right-2 top-16 md:right-0 md:top-0 md:relative">
                  <div className="w-56 bg-white rounded-2xl shadow-2xl py-2 border border-gray-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Rice Owner</p>
                      <p className="text-xs text-gray-500">admin@ricemill.com</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <UserCircle className="h-4 w-4 mr-3 text-gray-500" />
                      View Profile
                    </Link>

                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button 
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 transition-colors rounded-b-2xl"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}