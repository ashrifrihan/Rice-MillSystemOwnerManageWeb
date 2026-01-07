// src/components/ui/Breadcrumb.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({
  items = [],
  separator = <ChevronRight size={16} className="text-gray-400" />,
  className = '',
  ...props
}) => {
  return (
    <nav className={`flex ${className}`} {...props}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2">{separator}</span>
            )}
            {item.href ? (
              <a
                href={item.href}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-sm text-gray-900 font-medium">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;