import React from 'react';
import { XIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
export function MobileMenu({
  isOpen,
  onClose
}) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 flex z-40 md:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      {/* Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={onClose}>
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-6 w-6 text-white" />
          </button>
        </div>
        <Sidebar />
      </div>
    </div>;
}