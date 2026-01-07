// src/components/ui/Checkbox.jsx
import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div className={`w-5 h-5 border-2 rounded transition-colors ${
          checked
            ? 'bg-green-600 border-green-600'
            : 'border-gray-300 bg-white'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
          {checked && (
            <Check size={16} className="text-white absolute top-0 left-0" />
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </label>
  );
};

export default Checkbox;