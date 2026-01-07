// src/components/ui/Skeleton.jsx
import React from 'react';

const Skeleton = ({
  width,
  height,
  className = '',
  variant = 'rectangle',
  ...props
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    rectangle: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : 'auto'),
    height: height || (variant === 'text' ? '1rem' : 'auto')
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={style}
      {...props}
    />
  );
};

export default Skeleton;