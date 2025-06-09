import { DEFAULT_USER_AVATAR_URL } from '@repo/shared/const/branding';
import { useThemeSwitch } from '@repo/ui/hooks/use-theme-switch';
import {
  Bell,
  Briefcase,
  ChevronDown,
  CreditCard,
  Crown,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Shield,
  Sun,
  UserCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// Panel Navigation Configuration
const PANEL_NAVIGATIONS = [
  {
    id: 'profile',
    icon: 'UserCircle',
    label: 'My Profile',
    description: 'View and edit your profile',
    color: 'blue',
  },
  {
    id: 'professional',
    icon: 'Briefcase',
    label: 'Professional Management',
    description: 'Manage your professional settings',
    color: 'emerald',
  },
  {
    id: 'premium',
    icon: 'Crown',
    label: 'Account Premium',
    description: 'Upgrade your experience',
    color: 'amber',
  },
  {
    id: 'billing',
    icon: 'CreditCard',
    label: 'Billing & Payments',
    description: 'Manage your subscriptions',
    color: 'purple',
  },
  {
    id: 'notifications',
    icon: 'Bell',
    label: 'Notifications',
    description: 'Customize your alerts',
    color: 'red',
  },
  {
    id: 'security',
    icon: 'Shield',
    label: 'Privacy & Security',
    description: 'Protect your account',
    color: 'indigo',
  },
  {
    id: 'settings',
    icon: 'Settings',
    label: 'Settings',
    description: 'Configure your preferences',
    color: 'gray',
  },
];

// Theme Options
const THEME_OPTIONS = [
  { icon: 'Sun', label: 'Light', value: 'light' },
  { icon: 'Moon', label: 'Dark', value: 'dark' },
  { icon: 'Monitor', label: 'System', value: 'system' },
];

// User Data
const USER_DATA = {
  name: 'Sarah Chen',
  email: 'sarah.chen@company.com',
  avatar: DEFAULT_USER_AVATAR_URL,
  tier: 'Premium',
};

// Helper Functions
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const getPanelItemIcon = (iconName: any) => {
  const iconMap = {
    UserCircle,
    Briefcase,
    Crown,
    CreditCard,
    Bell,
    Shield,
    Settings,
    Sun,
    Moon,
    Monitor,
  };
  return iconMap[iconName as keyof typeof iconMap] || Settings;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const getColorClasses = (color: any) => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
    red: 'text-red-600 dark:text-red-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    gray: 'text-muted-foreground',
  };
  return colors[color as 'gray'] || 'text-muted-foreground';
};

const UserPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { setTheme } = useThemeSwitch();

  useEffect(() => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const handleClickOutside = (event: any) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleMenuClick = (item: any) => {
    console.log(`Clicked: ${item.label}`);
    // Navigation logic here
    setIsOpen(false);
  };

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };

  return (
    <div className="relative">
      <button
        type="button"
        ref={buttonRef}
        onClick={togglePanel}
        className="flex items-center space-x-3 rounded-2xl border border-border bg-card p-2 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <div className="relative">
          <img
            src={USER_DATA.avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400"
          />
          <div className="-bottom-1 -right-1 absolute h-4 w-4 rounded-full border-2 border-card bg-green-500" />
        </div>
        <div className="hidden text-left md:block">
          <p className="font-semibold text-foreground text-sm">
            {USER_DATA.name}
          </p>
          <p className="text-muted-foreground text-xs">
            {USER_DATA.tier} Member
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="slide-in-from-top-2 fade-in absolute right-0 z-50 mt-3 w-80 animate-in overflow-hidden rounded-3xl border border-border bg-card shadow-2xl duration-200"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={USER_DATA.avatar}
                  alt="User Avatar"
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-white/30"
                />
                <div className="-bottom-1 -right-1 absolute h-5 w-5 rounded-full border-3 border-white bg-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{USER_DATA.name}</h3>
                <p className="text-blue-100 text-sm">{USER_DATA.email}</p>
                <div className="mt-1 flex items-center space-x-1">
                  <Crown className="h-4 w-4 text-yellow-300" />
                  <span className="text-xs text-yellow-300">
                    {USER_DATA.tier} Member
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {PANEL_NAVIGATIONS.map((item) => {
              const IconComponent = getPanelItemIcon(item.icon);
              const colorClass = getColorClasses(item.color);

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleMenuClick(item)}
                  className="group flex w-full items-center space-x-3 rounded-2xl p-3 transition-all duration-200 hover:bg-accent"
                >
                  <div
                    className={`rounded-xl bg-muted p-2 ${colorClass} transition-transform duration-200 group-hover:scale-110`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground text-sm">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Theme Selector */}
          <div className="border-border border-t p-4">
            <p className="mb-3 font-medium text-foreground text-sm">Theme</p>
            <div className="flex space-x-2">
              {THEME_OPTIONS.map((theme) => {
                const IconComponent = getPanelItemIcon(theme.icon);
                return (
                  <button
                    type="button"
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className="flex flex-1 items-center justify-center space-x-2 rounded-xl bg-muted p-2 transition-all duration-200 hover:bg-accent"
                  >
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-xs">
                      {theme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-border border-t p-4">
            <button
              type="button"
              onClick={() => console.log('Sign out')}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-destructive/10 p-3 text-destructive transition-all duration-200 hover:bg-destructive/20"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPanel;
