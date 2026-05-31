'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  LayoutDashboard,
  Siren,
  Navigation,
  Building2,
  FileText,
  QrCode,
  Bell,
  MessageSquare,
  User,
  FileHeart,
  Phone,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigationStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import type { PageRoute } from '@/types';

interface SearchItem {
  category: string;
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  action: PageRoute;
  roles?: string[];
}

const SEARCH_ITEMS: SearchItem[] = [
  { category: 'Pages', icon: LayoutDashboard, title: 'Dashboard', description: 'View your health overview', action: 'dashboard' },
  { category: 'Pages', icon: Siren, title: 'SOS Emergency', description: 'Trigger emergency alert', action: 'sos', roles: ['PATIENT'] },
  { category: 'Pages', icon: Navigation, title: 'Track Ambulance', description: 'Live ambulance tracking', action: 'tracking', roles: ['PATIENT'] },
  { category: 'Pages', icon: Building2, title: 'Hospitals', description: 'Find nearby hospitals', action: 'hospitals' },
  { category: 'Pages', icon: FileHeart, title: 'Medical Records', description: 'View your health records', action: 'medical-records', roles: ['PATIENT'] },
  { category: 'Pages', icon: QrCode, title: 'QR Card', description: 'Your emergency QR card', action: 'qr-card', roles: ['PATIENT'] },
  { category: 'Pages', icon: Bell, title: 'Notifications', description: 'View all notifications', action: 'notifications' },
  { category: 'Pages', icon: MessageSquare, title: 'Feedback', description: 'Share your experience', action: 'feedback', roles: ['PATIENT'] },
  { category: 'Pages', icon: User, title: 'Profile', description: 'Manage your profile', action: 'profile' },
  { category: 'Pages', icon: FileText, title: 'Admin Overview', description: 'System administration', action: 'admin', roles: ['ADMIN'] },
  { category: 'Pages', icon: Building2, title: 'Emergency Queue', description: 'Hospital emergency queue', action: 'hospital-dashboard', roles: ['HOSPITAL_STAFF'] },
  { category: 'Pages', icon: Navigation, title: 'My Assignments', description: 'Driver assignments', action: 'driver-dashboard', roles: ['DRIVER'] },
  { category: 'Actions', icon: Siren, title: 'Start SOS Emergency', description: 'Activate emergency alert', action: 'sos', roles: ['PATIENT'] },
  { category: 'Actions', icon: Building2, title: 'Find Nearest Hospital', description: 'Search nearby hospitals', action: 'hospitals' },
  { category: 'Actions', icon: FileHeart, title: 'View Medical Records', description: 'Access health documents', action: 'medical-records', roles: ['PATIENT'] },
  { category: 'Actions', icon: Phone, title: 'Contact Emergency Services', description: 'Call emergency hotline', action: 'sos', roles: ['PATIENT'] },
];

export default function SearchDialog() {
  const searchOpen = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const setCurrentPage = useNavigationStore((s) => s.setCurrentPage);
  const { data: session } = useSession();
  const user = session?.user;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const roleFilteredItems = useMemo(() => {
    if (!user) return [];
    return SEARCH_ITEMS.filter(
      (item) => !item.roles || item.roles.includes(user.role),
    );
  }, [user]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return roleFilteredItems;
    const q = query.toLowerCase().trim();
    return roleFilteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [query, roleFilteredItems]);

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchItem[]> = {};
    for (const item of filteredResults) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredResults]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === 'k'
      ) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const handleSelect = (item: SearchItem) => {
    setCurrentPage(item.action);
    setSearchOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const handleOpenChange = (open: boolean) => {
    setSearchOpen(open);
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredResults.length - 1,
      );
    } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredResults[selectedIndex]);
    }
  };

  // Track global index for grouped display
  let globalIdx = 0;

  return (
    <Dialog open={searchOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[560px] p-0 gap-0 overflow-hidden [&>button]:top-3.5 [&>button]:right-3.5"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search pages and actions across LifeLink
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="size-4.5 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            placeholder="Search pages and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:border-0 h-12 px-3 text-sm shadow-none rounded-none"
          />
          <kbd className="hidden sm:flex items-center gap-0.5 pointer-events-none select-none text-[11px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5 font-mono shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[340px]">
          <div className="py-2 px-2">
            {!query.trim() && filteredResults.length > 0 && (
              <p className="px-2 pb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Quick navigation
              </p>
            )}

            {query.trim() && filteredResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="size-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">
                  Try searching for &quot;hospital&quot;, &quot;SOS&quot;, or &quot;profile&quot;
                </p>
              </div>
            )}

            {Object.entries(groupedResults).map(([category, items]) => {
              const categoryStartIdx = globalIdx;
              globalIdx += items.length;

              return (
                <div key={category}>
                  {query.trim() && (
                    <p className="px-2 pt-3 pb-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </p>
                  )}
                  {items.map((item, itemIdx) => {
                    const flatIdx = categoryStartIdx + itemIdx;
                    const isSelected = flatIdx === selectedIndex;
                    const IconComp = item.icon;

                    return (
                      <button
                        key={`${item.category}-${item.action}-${itemIdx}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-left transition-colors',
                          isSelected
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50',
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center rounded-md size-9 shrink-0',
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          <IconComp className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm',
                              isSelected ? 'font-semibold' : 'font-medium',
                            )}
                          >
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        {isSelected && (
                          <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 bg-muted/30">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-4 min-w-4 rounded border border-border bg-background px-1 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="inline-flex items-center justify-center h-4 min-w-4 rounded border border-border bg-background px-1 font-mono text-[10px]">
                ↓
              </kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-4 min-w-4 rounded border border-border bg-background px-1 font-mono text-[10px]">
                ↵
              </kbd>
              <span className="ml-0.5">Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-4 min-w-4 rounded border border-border bg-background px-1 font-mono text-[10px]">
                esc
              </kbd>
              <span className="ml-0.5">Close</span>
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <CornerDownLeft className="size-3" />
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
