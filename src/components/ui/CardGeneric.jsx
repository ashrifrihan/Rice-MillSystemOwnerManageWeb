// src/components/ui/CardGeneric.jsx
import React from 'react';

const CardGeneric = ({
  children,
  className = '',
  padding = 'normal',
  shadow = 'normal',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    normal: 'shadow-md',
    large: 'shadow-lg'
  };

  const classes = [
    'bg-white rounded-lg border border-gray-200',
    paddingClasses[padding],
    shadowClasses[shadow],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default CardGeneric;