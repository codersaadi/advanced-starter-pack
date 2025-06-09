import {
  BarChart3,
  Calendar,
  Camera,
  Cloud,
  CreditCard,
  Database,
  FileText,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Users,
  X,
  Zap,
} from 'lucide-react';
import type { SVGProps } from 'react';
import { useState } from 'react';
const AppLauncherIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      fill="#000000"
      viewBox="0 0 16 16"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0" />
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g id="SVGRepo_iconCarrier">
        <path
          d="M0 0h4v4H0V0zm0 6h4v4H0V6zm0 6h4v4H0v-4zM6 0h4v4H6V0zm0 6h4v4H6V6zm0 6h4v4H6v-4zm6-12h4v4h-4V0zm0 6h4v4h-4V6zm0 6h4v4h-4v-4z"
          fillRule="evenodd"
        />
      </g>
    </svg>
  );
};

const AppLauncherPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const apps = [
    {
      id: 1,
      name: 'Analytics',
      icon: BarChart3,
      color: 'bg-blue-500',
      description: 'Business Intelligence & Reports',
    },
    {
      id: 2,
      name: 'CRM',
      icon: Users,
      color: 'bg-green-500',
      description: 'Customer Relationship Management',
    },
    {
      id: 3,
      name: 'Calendar',
      icon: Calendar,
      color: 'bg-red-500',
      description: 'Schedule & Events',
    },
    {
      id: 4,
      name: 'Mail',
      icon: Mail,
      color: 'bg-yellow-500',
      description: 'Email Management',
    },
    {
      id: 5,
      name: 'Documents',
      icon: FileText,
      color: 'bg-purple-500',
      description: 'File Management System',
    },
    {
      id: 6,
      name: 'Database',
      icon: Database,
      color: 'bg-indigo-500',
      description: 'Data Management',
    },
    {
      id: 7,
      name: 'Security',
      icon: Shield,
      color: 'bg-orange-500',
      description: 'Security & Compliance',
    },
    {
      id: 8,
      name: 'Automation',
      icon: Zap,
      color: 'bg-pink-500',
      description: 'Workflow Automation',
    },
    {
      id: 9,
      name: 'Chat',
      icon: MessageSquare,
      color: 'bg-teal-500',
      description: 'Team Communication',
    },
    {
      id: 10,
      name: 'Media',
      icon: Camera,
      color: 'bg-cyan-500',
      description: 'Digital Asset Management',
    },
    {
      id: 11,
      name: 'Cloud',
      icon: Cloud,
      color: 'bg-slate-500',
      description: 'Cloud Services',
    },
    {
      id: 12,
      name: 'Billing',
      icon: CreditCard,
      color: 'bg-emerald-500',
      description: 'Financial Management',
    },
  ];

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePanel = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* App Launcher Button */}
      <button
        type="button"
        onClick={togglePanel}
        className="group flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
      >
        <AppLauncherIcon className="h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-800" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        // biome-ignore lint/nursery/noStaticElementInteractions: <explanation>
        // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* App Panel */}
      <div
        className={`fixed top-16 left-4 z-50 w-96 transform rounded-xl border border-gray-200 bg-white shadow-2xl transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 pointer-events-none scale-95 opacity-0'}
      `}
      >
        {/* Header */}
        <div className="border-gray-100 border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-lg">
              Applications
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Apps Grid */}
        <div className="max-h-96 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const IconComponent = app.icon;
              return (
                <button
                  type="button"
                  key={app.id}
                  className="group flex flex-col items-center rounded-lg p-4 transition-all duration-200 hover:bg-gray-50"
                  onClick={() => {
                    // Handle app click
                    console.log(`Opening ${app.name}`);
                    setIsOpen(false);
                  }}
                >
                  <div
                    className={`h-12 w-12 rounded-xl ${app.color} mb-3 flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-110 `}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-center font-medium text-gray-900 text-sm leading-tight">
                    {app.name}
                  </span>
                  <span className="mt-1 text-center text-gray-500 text-xs leading-tight">
                    {app.description}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No applications found</p>
              <p className="mt-1 text-gray-400 text-xs">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="rounded-b-xl border-gray-100 border-t bg-gray-50 px-6 py-4">
          <button
            type="button"
            className="flex w-full items-center rounded-lg px-3 py-2 text-gray-600 text-sm transition-all hover:bg-white hover:text-gray-900"
          >
            <Settings className="mr-2 h-4 w-4" />
            Manage Applications
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppLauncherPanel;
