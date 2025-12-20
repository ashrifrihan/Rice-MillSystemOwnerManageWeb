import React from 'react';
import { Link } from 'react-router-dom';
import { SettingsIcon, FileTextIcon, DownloadIcon, UserIcon, BellIcon, HelpCircleIcon } from 'lucide-react';
export function SystemShortcuts() {
  const shortcuts = [{
    name: 'Profile Settings',
    icon: UserIcon,
    link: '/profile',
    color: 'bg-blue-100 text-blue-600'
  }, {
    name: 'Notification Settings',
    icon: BellIcon,
    link: '/settings',
    color: 'bg-purple-100 text-purple-600'
  }, {
    name: 'Export Reports',
    icon: DownloadIcon,
    link: '/reports',
    color: 'bg-green-100 text-green-600'
  }, {
    name: 'System Settings',
    icon: SettingsIcon,
    link: '/settings',
    color: 'bg-gray-100 text-gray-600'
  }, {
    name: 'Documentation',
    icon: FileTextIcon,
    link: '#',
    color: 'bg-yellow-100 text-yellow-600'
  }, {
    name: 'Help & Support',
    icon: HelpCircleIcon,
    link: '#',
    color: 'bg-red-100 text-red-600'
  }];
  return <div className="bg-white rounded-lg shadow p-5 h-full">
      <h2 className="text-lg font-medium text-gray-900 mb-4">System Shortcuts</h2>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((shortcut, index) => <Link key={index} to={shortcut.link} className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-full mr-3 ${shortcut.color}`}>
              <shortcut.icon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-gray-700">{shortcut.name}</span>
          </Link>)}
      </div>
    </div>;
}