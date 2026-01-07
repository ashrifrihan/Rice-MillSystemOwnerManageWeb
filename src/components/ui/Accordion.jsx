// src/components/ui/Accordion.jsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const Accordion = ({
  items = [],
  allowMultiple = false,
  defaultExpanded = [],
  className = '',
  ...props
}) => {
  const [expandedItems, setExpandedItems] = useState(defaultExpanded);

  const toggleItem = (index) => {
    if (allowMultiple) {
      setExpandedItems(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setExpandedItems(prev =>
        prev.includes(index) ? [] : [index]
      );
    }
  };

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      {items.map((item, index) => {
        const isExpanded = expandedItems.includes(index);

        return (
          <div key={index} className="border border-gray-200 rounded-lg">
            {/* Header */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-t-lg"
            >
              <span className="font-medium text-gray-900">{item.title}</span>
              <ChevronDown
                size={20}
                className={`text-gray-500 transition-transform ${
                  isExpanded ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Content */}
            {isExpanded && (
              <div className="px-4 py-3 border-t border-gray-200 bg-white">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;