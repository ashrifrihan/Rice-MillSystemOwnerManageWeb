// src/components/ui/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  color = 'green',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  };

  const classes = [
    'animate-spin rounded-full border-2 border-current border-t-transparent',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;