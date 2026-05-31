'use client';

import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, User, Settings, LogOut, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigationStore, useUIStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/components/layout/ThemeProvider';
import { useRouter } from 'next/navigation';
import type { PageRoute } from '@/types';
import { cn } from '@/lib/utils';
import NotificationPanel from '@/components/dashboard/NotificationPanel';
import SearchDialog from '@/components/dashboard/SearchDialog';

const PAGE_TITLES: Record<PageRoute, string> = {
  landing: 'Welcome',
  login: 'Sign In',
  signup: 'Create Account',
  dashboard: 'Dashboard',
  sos: 'SOS Emergency',
  tracking: 'Track Ambulance',
  hospitals: 'Hospitals',
  'medical-records': 'Medical Records',
  'qr-card': 'QR Medical Card',
  notifications: 'Notifications',
  feedback: 'Feedback',
  profile: 'My Profile',
  admin: 'Admin Overview',
  'admin-users': 'User Management',
  'admin-hospitals': 'Hospital Management',
  'admin-ambulances': 'Ambulance Management',
  'admin-emergencies': 'Emergency Requests',
  'hospital-dashboard': 'Emergency Queue',
  'hospital-beds': 'Bed Management',
  'hospital-patients': 'Patient Intake',
  'driver-dashboard': 'My Assignments',
  'driver-navigation': 'Navigation',
  'driver-earnings': 'Earnings',
  'driver-history': 'Trip History',
  'driver-vehicle': 'My Vehicle',
  'hospital-doctors': 'Doctors',
  'hospital-pharmacy': 'Pharmacy',
  'hospital-analytics': 'Hospital Analytics',
  'admin-analytics': 'Analytics',
  'admin-settings': 'System Settings',
  'admin-reports': 'Reports',
  'doctor-appointments': 'Book Appointment',
  'help': 'Help Center',
  'emergency-profile': 'Emergency Profile',
  'ai-chat': 'AI Medical Assistant',
  'pharmacy-store': 'Order Medicines',
  'hospital-inventory': 'Inventory Management',
  'admin-appointments': 'Appointments Manager',
  'admin-orders': 'Pharmacy Orders',
  'doctor-bookings': 'Patient Bookings',
  'order-tracking': 'Track Your Order',
  'insurance': 'Health Insurance',
  'loans': 'Health Loans',
  'admin-insurance': 'Manage Insurance',
  'admin-loans': 'Manage Loans',
  'hospital-scanner': 'Patient Scanner',
};

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-amber-600',
  'bg-violet-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-orange-600',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { data: session } = useSession();
  const user = session?.user;
  const { theme, setTheme } = useTheme();
  const unreadCount = useUIStore((s) => s.unreadCount);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const router = useRouter();

  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const pageTitle = PAGE_TITLES[currentPage] ?? 'LifeLink';
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const navigate = (page: PageRoute) => {
    setCurrentPage(page);
    router.push(`/?page=${page}`);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setCurrentPage('landing');
    router.push('/');
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  if (!user) return null;

  const avatarColor = getAvatarColor(user.name || 'User');
  const initials = getInitials(user.name || 'U');

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" />
          </Button>

          {/* Page Title */}
          <h1 className="text-lg font-semibold tracking-tight">{pageTitle}</h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground h-9 px-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-accent/50"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="size-3.5" />
            <span className="text-xs">Search...</span>
            <kbd className="ml-1 pointer-events-none select-none text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5 font-mono">
              ⌘K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
          >
            <Search className="size-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationPanelOpen(true)}
            className={cn(
              'relative text-muted-foreground hover:text-foreground transition-colors',
              unreadCount > 0 && 'hover:text-primary',
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[9px] font-bold leading-none px-1 ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors cursor-pointer"
                aria-label="User menu"
              >
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full text-white text-xs font-bold size-8',
                    avatarColor,
                  )}
                >
                  {initials}
                </div>
                <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('profile')}>
                  <User className="size-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('profile')}>
                  <Settings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="size-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Notification Slide-out Panel */}
      <NotificationPanel
        open={notificationPanelOpen}
        onOpenChange={setNotificationPanelOpen}
      />

      {/* Search Dialog */}
      <SearchDialog />
    </>
  );
}
