'use client';

import { useMemo } from 'react';
import {
  LayoutDashboard,
  Siren,
  Navigation,
  Building2,
  FileHeart,
  QrCode,
  Bell,
  MessageSquare,
  UserCircle,
  ClipboardList,
  Map,
  AlertTriangle,
  BedDouble,
  UserPlus,
  BarChart3,
  Users,
  Truck,
  LogOut,
  Heart,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useUIStore } from '@/store';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { NAVIGATION_ITEMS } from '@/lib/constants';
import type { NavItem, PageRoute, Role } from '@/types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Siren,
  Navigation,
  Building2,
  FileHeart,
  QrCode,
  Bell,
  MessageSquare,
  UserCircle,
  ClipboardList,
  Map,
  AlertTriangle,
  BedDouble,
  UserPlus,
  BarChart3,
  Users,
  Truck,
};

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  PATIENT: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  DRIVER: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  HOSPITAL_STAFF: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' },
  ADMIN: { bg: 'bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  UNASSIGNED: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const ROLE_LABELS: Record<Role, string> = {
  PATIENT: 'Patient',
  DRIVER: 'Driver',
  HOSPITAL_STAFF: 'Staff',
  ADMIN: 'Admin',
  UNASSIGNED: 'Unassigned',
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

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { data: session } = useSession();
  const user = session?.user;
  const unreadCount = useUIStore((s) => s.unreadCount);
  const router = useRouter();

  const navItems: NavItem[] = useMemo(() => {
    if (!user) return [];
    return NAVIGATION_ITEMS[user.role] ?? [];
  }, [user]);

  const handleNavClick = (route: PageRoute) => {
    setCurrentPage(route);
    router.push(`/?page=${route}`);
    onOpenChange(false);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    useNavigationStore.getState().setCurrentPage('landing');
    router.push('/');
    onOpenChange(false);
  };

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role];
  const avatarColor = getAvatarColor(user.name || 'User');
  const initials = getInitials(user.name || 'U');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0">
        <SheetHeader className="px-4 pt-4 pb-0">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <Heart className="size-5 text-primary-foreground" fill="currentColor" />
            </div>
            <SheetTitle className="text-base font-bold">LifeLink</SheetTitle>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 pb-4">
            <div
              className={cn(
                'flex items-center justify-center rounded-full shrink-0 text-white text-sm font-bold size-11',
                avatarColor,
              )}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <span
                className={cn(
                  'inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full',
                  roleColor.bg,
                  roleColor.text,
                )}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-thin">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
              const isActive = currentPage === item.route;
              const isEmergency = item.emergency;
              const isNotifications = item.route === 'notifications';

              return (
                <li key={item.route}>
                  <button
                    onClick={() => handleNavClick(item.route)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative',
                      isActive
                        ? isEmergency
                          ? 'bg-destructive/10 text-destructive font-bold border-l-2 border-destructive'
                          : 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                        : isEmergency
                          ? 'text-destructive/80 hover:bg-destructive/5 hover:text-destructive'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'size-5 shrink-0',
                        isActive && (isEmergency ? 'text-destructive' : 'text-primary'),
                        isEmergency && !isActive && 'text-destructive/70',
                      )}
                    />

                    <span className="truncate">{item.label}</span>

                    {/* Notification Badge */}
                    {isNotifications && unreadCount > 0 && (
                      <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[10px] font-bold shrink-0">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}

                    {/* Badge count for other items */}
                    {!isNotifications && item.badge && item.badge > 0 && (
                      <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold px-1.5">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator />

        {/* Bottom Section */}
        <div className="p-2 pb-4 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all"
          >
            <LogOut className="size-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
