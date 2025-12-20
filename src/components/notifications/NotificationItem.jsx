import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, DollarSign, Lightbulb, X, Clock, ExternalLink } from 'lucide-react';

export function NotificationItem({ notification, onClose }) {
  const getIcon = () => {
    const iconClass = "w-8 h-8 transition-transform group-hover:scale-110";
    switch (notification.type) {
      case 'inventory':
        return <Package className={`${iconClass} text-blue-600`} />;
      case 'delivery':
        return <Truck className={`${iconClass} text-emerald-600`} />;
      case 'loan':
        return <DollarSign className={`${iconClass} text-amber-600`} />;
      case 'ai':
        return <Lightbulb className={`${iconClass} text-purple-600`} />;
      default:
        return <Package className={`${iconClass} text-gray-500`} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-rose-600';
      case 'medium': return 'bg-gradient-to-r from-amber-500 to-orange-600';
      case 'low': return 'bg-gradient-to-r from-emerald-500 to-teal-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const isUnread = !notification.read;
  const hasPriority = notification.priority && notification.priority !== 'low';

  return (
    <div
      className={`
        group relative overflow-hidden border-b border-gray-200/50 last:border-b-0
        transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50/80 hover:to-white/80
        ${isUnread ? 'bg-gradient-to-br from-green-50/70 to-indigo-50/50' : 'bg-white/60'}
        backdrop-blur-xl
      `}
    >
      {/* Priority indicator */}
      {hasPriority && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getPriorityColor(notification.priority)}`} />
      )}

      {/* Subtle glow line on left for unread */}
      {isUnread && !hasPriority && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-green-300 to-green-400 animate-pulse" />
      )}

      <div className="p-5 flex items-start gap-5">
        {/* Icon with glass bubble */}
        <div className={`
          flex-shrink-0 p-4 rounded-2xl shadow-lg transition-all duration-300
          ${isUnread 
            ? 'bg-gradient-to-br from-green-500/20 to-indigo-500/20 ring-2 ring-green-300/50' 
            : 'bg-white/70 ring-1 ring-gray-200'
          }
        `}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <Link
                  to={notification.link}
                  className="block transition-colors group/title"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className={`
                    font-bold text-lg leading-tight transition-colors
                    ${isUnread ? 'text-gray-900' : 'text-gray-800'}
                    group-hover/title:text-green-600
                  `}>
                    {notification.title}
                  </h4>
                </Link>
                
                {/* Priority badge */}
                {hasPriority && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed pr-10">
                {notification.message}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {notification.time}
              </span>
              
              {/* Action button */}
              {notification.action && (
                <Link
                  to={notification.link}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition"
                  onClick={(e) => e.stopPropagation()}
                >
                  {notification.action}
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* Category and unread indicator */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              {notification.category && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                  {notification.category}
                </span>
              )}
              
              {/* Unread dot */}
              {isUnread && (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-600">New</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose(notification.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 -mr-2 hover:bg-gray-100 rounded-xl hover:scale-110"
            title="Dismiss notification"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Hover shine effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover:translate-x-full duration-1000 pointer-events-none" />
    </div>
  );
}