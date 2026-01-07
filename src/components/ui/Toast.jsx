// src/components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
  message,
  type = 'info',
  onClose,
  duration = 5000,
  className = '',
  ...props
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start p-4 rounded-lg border shadow-lg max-w-md ${config.bgColor} ${config.borderColor} ${className}`}
      {...props}
    >
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="ml-3 flex-1">
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`ml-3 flex-shrink-0 ${config.iconColor} hover:opacity-75 focus:outline-none`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Toast;