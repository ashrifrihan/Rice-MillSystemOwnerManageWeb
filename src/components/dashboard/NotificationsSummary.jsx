import React from 'react';
import { BellIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NotificationItem } from '../notifications/NotificationItem';
export function NotificationsSummary({
  notifications
}) {
  const unreadCount = notifications.filter(notification => !notification.read).length;
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Recent Notifications
        </h2>
        <div className="relative">
          <BellIcon className="h-5 w-5 text-gray-500" />
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>}
        </div>
      </div>
      <div className="space-y-0 rounded-lg border border-gray-200 overflow-hidden">
        {notifications.map(notification => <NotificationItem key={notification.id} notification={notification} onClose={() => {}} />)}
      </div>
      <div className="mt-3 text-center">
        <Link to="#" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all notifications
        </Link>
      </div>
    </div>;
}