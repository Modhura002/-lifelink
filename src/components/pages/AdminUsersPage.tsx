'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, ShieldCheck, ChevronLeft, ChevronRight, MoreHorizontal,
  Download, Upload, RefreshCw, Eye, UserMinus, Loader2, X, Mail, Phone,
  Calendar, MapPin, Heart, Activity, Building2, Truck, Shield, BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { Role, User } from '@/types';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

const roleColors: Record<string, string> = {
  PATIENT:       'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  DRIVER:        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  HOSPITAL_STAFF:'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  ADMIN:         'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};
const avatarColors: Record<string, string> = {
  PATIENT: 'bg-emerald-600', DRIVER: 'bg-amber-600',
  HOSPITAL_STAFF: 'bg-violet-600', ADMIN: 'bg-rose-600',
};
const ROLES: Role[] = ['PATIENT', 'DRIVER', 'HOSPITAL_STAFF', 'ADMIN'];
const ITEMS_PER_PAGE = 8;

// ── CSV helpers ────────────────────────────────────────────────────────────────
function exportUsersCSV(users: User[]) {
  const headers = ['Name', 'Email', 'Phone', 'Role', 'Blood Group', 'Gender', 'Date of Birth', 'Verified', 'Joined Date'];
  const rows = users.map((u) => [
    `"${u.name.replace(/"/g, '""')}"`,
    u.email,
    u.phone || '',
    u.role,
    BLOOD_GROUP_LABELS[u.bloodGroup || ''] || '',
    u.gender || '',
    u.dateOfBirth || '',
    u.isVerified ? 'Yes' : 'No',
    new Date(u.createdAt).toLocaleDateString('en-IN'),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifelink-users-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ImportRow { name: string; email: string; phone?: string; role?: string; bloodGroup?: string }

function parseUsersCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const obj: Record<string, string> = {};
    header.forEach((h, i) => { if (cols[i]) obj[h] = cols[i]; });
    return {
      name:       obj['name'] || '',
      email:      obj['email'] || '',
      phone:      obj['phone'] || '',
      role:       (obj['role'] || 'PATIENT').toUpperCase(),
      bloodGroup: obj['blood group'] || obj['bloodgroup'] || '',
    };
  }).filter((r) => r.name && r.email);
}

// ── User detail modal ──────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const parseExtra = (addr?: string | null) => {
    if (!addr) return {};
    try { const p = JSON.parse(addr); if (typeof p === 'object') return p as Record<string, string>; } catch {}
    return {};
  };
  const extra = parseExtra(user.address);
  const isJSONAddr = user.address ? (() => { try { JSON.parse(user.address!); return true; } catch { return false; } })() : false;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarFallback className={cn('text-white text-lg font-bold', avatarColors[user.role] || 'bg-primary/10')}>
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg">{user.name}</p>
                {user.isVerified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
              </div>
              <Badge className={cn('text-xs mt-0.5', roleColors[user.role] || '')}>{user.role.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" val={user.email} />
            <DetailRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" val={user.phone || '—'} />
            <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Date of Birth" val={user.dateOfBirth || '—'} />
            <DetailRow icon={<Activity className="h-3.5 w-3.5" />} label="Gender" val={user.gender || '—'} />
            {!isJSONAddr && <DetailRow icon={<MapPin className="h-3.5 w-3.5" />} label="Address" val={user.address || '—'} />}
            {user.bloodGroup && <DetailRow icon={<Heart className="h-3.5 w-3.5 text-red-500" />} label="Blood Group" val={BLOOD_GROUP_LABELS[user.bloodGroup] || user.bloodGroup} />}
            <DetailRow icon={<Calendar className="h-3.5 w-3.5" />} label="Joined" val={new Date(user.createdAt).toLocaleDateString('en-IN')} />
          </div>
          {user.role === 'DRIVER' && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 space-y-1.5 text-sm">
              <p className="font-semibold text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Driver Details</p>
              <DetailRow icon={null} label="License No." val={extra.licenseNumber || '—'} />
              <DetailRow icon={null} label="Experience" val={extra.experience ? `${extra.experience} years` : '—'} />
            </div>
          )}
          {user.role === 'HOSPITAL_STAFF' && (
            <div className="rounded-lg bg-sky-50 dark:bg-sky-950/20 p-3 space-y-1.5 text-sm">
              <p className="font-semibold text-xs text-sky-700 dark:text-sky-400 flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> Staff Details</p>
              <DetailRow icon={null} label="Department" val={extra.department || '—'} />
              <DetailRow icon={null} label="Employee ID" val={extra.employeeId || '—'} />
            </div>
          )}
          {user.role === 'PATIENT' && user.allergies?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Allergies</p>
              <div className="flex flex-wrap gap-1">{user.allergies.map((a) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}</div>
            </div>
          )}
          {user.emergencyContacts?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Emergency Contacts</p>
              {user.emergencyContacts.map((c) => (
                <p key={c.id} className="text-sm">{c.name} ({c.relationship}) — {c.phone}</p>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon, label, val }: { icon: React.ReactNode; label: string; val: string }) {
  return (
    <div className="flex items-start gap-1.5">
      {icon && <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>}
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="font-medium text-sm leading-tight break-all">{val}</p>
      </div>
    </div>
  );
}

// ── Import preview modal ────────────────────────────────────────────────────────
function ImportModal({ rows, onConfirm, onClose }: { rows: ImportRow[]; onConfirm: (rows: ImportRow[]) => void; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Users — Preview</DialogTitle>
          <DialogDescription>{rows.length} users found in CSV. They will be created with a temporary password.</DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto space-y-1 border rounded-lg p-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded text-sm hover:bg-muted/40">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className={cn('text-[10px] font-bold text-white', avatarColors[r.role || 'PATIENT'] || 'bg-primary/10')}>
                  {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.email}</p>
              </div>
              <Badge className={cn('text-[10px] shrink-0', roleColors[r.role || 'PATIENT'] || '')}>{(r.role || 'PATIENT').replace(/_/g, ' ')}</Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Temporary password: <code className="bg-muted px-1 rounded">TempPass@123</code> — users should change it on first login.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onConfirm(rows)}>Import {rows.length} Users</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [importRows, setImportRows] = useState<ImportRow[] | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load users from API ─────────────────────────────────────────────────────
  const loadUsers = async () => {
    setFetchLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // ── Filter + paginate ───────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => users.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone || '').includes(q);
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, searchQuery, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: users.length,
    patients: users.filter((u) => u.role === 'PATIENT').length,
    drivers: users.filter((u) => u.role === 'DRIVER').length,
    staff: users.filter((u) => u.role === 'HOSPITAL_STAFF').length,
    admins: users.filter((u) => u.role === 'ADMIN').length,
    verified: users.filter((u) => u.isVerified).length,
  }), [users]);

  // ── Select helpers ──────────────────────────────────────────────────────────
  const handleToggleSelect = (id: string) => setSelectedUsers((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const handleSelectAll = () => setSelectedUsers(selectedUsers.length === paginatedUsers.length ? [] : paginatedUsers.map((u) => u.id));

  // ── Role change ─────────────────────────────────────────────────────────────
  const handleRoleChange = async () => {
    if (!roleDialogUser || !newRole) return;
    try {
      await fetch(`/api/users/${roleDialogUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      setUsers((prev) => prev.map((u) => u.id === roleDialogUser.id ? { ...u, role: newRole as Role } : u));
      toast.success(`Role updated to ${newRole.replace(/_/g, ' ')}`);
    } catch {
      toast.error('Failed to update role');
    }
    setRoleDialogUser(null);
  };

  // ── Deactivate ──────────────────────────────────────────────────────────────
  const handleDeactivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map((id) => fetch(`/api/users/${id}`, { method: 'DELETE' })));
      setUsers((prev) => prev.map((u) => ids.includes(u.id) ? { ...u, isVerified: false } : u));
      setSelectedUsers([]);
      toast.success(`${ids.length} user${ids.length > 1 ? 's' : ''} deactivated`);
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  // ── CSV Export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const toExport = selectedUsers.length > 0 ? users.filter((u) => selectedUsers.includes(u.id)) : filteredUsers;
    exportUsersCSV(toExport);
    toast.success(`Exported ${toExport.length} users as CSV`);
  };

  // ── CSV Import ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseUsersCSV(text);
      if (rows.length === 0) { toast.error('No valid rows found in CSV'); return; }
      setImportRows(rows);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportConfirm = async (rows: ImportRow[]) => {
    setImportLoading(true);
    setImportRows(null);
    let success = 0; let failed = 0;
    for (const row of rows) {
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: row.name, email: row.email, phone: row.phone || '', password: 'TempPass@123', role: row.role || 'PATIENT', bloodGroup: row.bloodGroup || null }),
        });
        if (res.ok) success++; else failed++;
      } catch { failed++; }
    }
    setImportLoading(false);
    toast.success(`Import complete: ${success} created${failed > 0 ? `, ${failed} failed` : ''}`);
    loadUsers();
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      {/* ── Header ── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Users className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Management</h1>
              <p className="text-muted-foreground text-sm">
                {fetchLoading ? 'Loading…' : `${users.length} total users registered`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={loadUsers} disabled={fetchLoading}>
              <RefreshCw className={cn('h-3.5 w-3.5', fetchLoading && 'animate-spin')} /> Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileInputRef.current?.click()} disabled={importLoading}>
              {importLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Import CSV
            </Button>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <motion.div variants={stagger} className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-primary' },
          { label: 'Patients', value: stats.patients, color: 'text-emerald-600' },
          { label: 'Drivers', value: stats.drivers, color: 'text-amber-600' },
          { label: 'Staff', value: stats.staff, color: 'text-violet-600' },
          { label: 'Admins', value: stats.admins, color: 'text-rose-600' },
          { label: 'Verified', value: stats.verified, color: 'text-sky-600' },
        ].map((s) => (
          <motion.div key={s.label} variants={fadeUp} whileHover={{ scale: 1.04, y: -2 }}>
            <Card className="text-center">
              <CardContent className="p-3">
                <p className={`text-2xl font-bold ${s.color}`}>{fetchLoading ? '…' : s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">
                {roleFilter === 'all' ? 'All Users' : roleFilter.replace(/_/g, ' ')} ({filteredUsers.length})
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search by name, email, phone…"
                    value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-9 h-9 w-full sm:w-[220px]" />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-full sm:w-[150px]"><SelectValue placeholder="Filter role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bulk actions */}
            <AnimatePresence>
              {selectedUsers.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 pt-3 border-t flex-wrap">
                  <span className="text-sm text-muted-foreground">{selectedUsers.length} selected</span>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExport}>
                    <Download className="h-3.5 w-3.5" /> Export Selected
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs text-destructive hover:text-destructive gap-1.5"
                    onClick={() => handleDeactivate(selectedUsers)}>
                    <UserMinus className="h-3.5 w-3.5" /> Deactivate Selected
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedUsers([])}>
                    <X className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent className="p-4 pt-0">
            {fetchLoading ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-sm text-muted-foreground">Loading users from database…</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto scrollbar-thin">
                {/* Table header */}
                <div className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b">
                  <div className="w-5"><Checkbox checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0} onCheckedChange={handleSelectAll} className="size-4" /></div>
                  <div className="w-10">Avatar</div>
                  <div className="flex-1 min-w-0">User</div>
                  <div className="hidden sm:block w-24 text-right">Role</div>
                  <div className="hidden md:block w-24 text-right">Status</div>
                  <div className="w-8" />
                </div>

                {paginatedUsers.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-muted-foreground">
                    <Users className="size-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter</p>
                  </div>
                ) : (
                  paginatedUsers.map((user) => {
                    const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
                    const isSelected = selectedUsers.includes(user.id);
                    return (
                      <div key={user.id}
                        className={cn('flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group',
                          isSelected ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50')}>
                        <div className="w-5"><Checkbox checked={isSelected} onCheckedChange={() => handleToggleSelect(user.id)} className="size-4" /></div>
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className={cn('text-white text-sm font-bold', avatarColors[user.role] || 'bg-primary/10')}>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            {user.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{user.email} · {user.phone || 'No phone'}</p>
                        </div>
                        <button onClick={() => { setRoleDialogUser(user); setNewRole(user.role); }} className="hidden sm:block w-24 text-right">
                          <Badge className={cn('text-xs cursor-pointer hover:opacity-80 transition-opacity', roleColors[user.role] || '')}>{user.role.replace(/_/g, ' ')}</Badge>
                        </button>
                        <div className="hidden md:flex w-24 justify-end">
                          <Badge variant={user.isVerified ? 'default' : 'secondary'}
                            className={cn('text-xs', user.isVerified ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100' : 'bg-muted text-muted-foreground hover:bg-muted')}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        {/* Actions */}
                        <div className="w-14 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors" title="View profile" onClick={() => setViewUser(user)}>
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Deactivate" onClick={() => handleDeactivate([user.id])}>
                            <UserMinus className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Pagination */}
            {!fetchLoading && totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm"
                      className={cn('h-8 w-8 p-0 text-xs', currentPage === page && 'pointer-events-none')} onClick={() => setCurrentPage(page)}>
                      {page}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Role Change Dialog ── */}
      <Dialog open={!!roleDialogUser} onOpenChange={() => setRoleDialogUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Update the role for <span className="font-semibold text-foreground">{roleDialogUser?.name}</span></DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={cn('text-white text-sm font-bold', avatarColors[roleDialogUser?.role || 'PATIENT'] || '')}>
                  {roleDialogUser?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{roleDialogUser?.name}</p>
                <p className="text-xs text-muted-foreground">{roleDialogUser?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRoleDialogUser(null)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={newRole === roleDialogUser?.role}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User detail modal ── */}
      {viewUser && <UserDetailModal user={viewUser} onClose={() => setViewUser(null)} />}

      {/* ── Import preview modal ── */}
      {importRows && <ImportModal rows={importRows} onConfirm={handleImportConfirm} onClose={() => setImportRows(null)} />}
    </motion.div>
  );
}
