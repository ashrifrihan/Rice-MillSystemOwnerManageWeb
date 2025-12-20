import React from 'react';
import { NotificationItem } from './NotificationItem';
import { Link } from 'react-router-dom';
import { Bell, Settings, CheckCircle } from 'lucide-react';

export function NotificationDropdown({ notifications, onClose, markAllAsRead }) {
  const handleClose = (id) => {
    // In a real app, mark notification as read
    console.log(`Closing notification ${id}`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-3 w-[500px] bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-200/50 shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">Stay updated with your activities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Unread count badge */}
      {unreadCount > 0 && (
        <div className="px-5 pt-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* List */}
      <div className="max-h-[500px] overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} onClose={handleClose} />
          ))
        ) : (
          <div className="py-16 px-5 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">All caught up!</h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              You don't have any notifications right now. Check back later for updates.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <Link
            to="/notifications"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-xl text-sm font-medium hover:from-blue-100 hover:to-indigo-100 transition group"
            onClick={onClose}
          >
            View all notifications
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          
          <div className="text-xs text-gray-500">
            {notifications.length} total • {unreadCount} unread
          </div>
        </div>
      </div>
    </div>
  );
}