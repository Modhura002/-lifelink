'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, X, Eye, Truck, Package, CheckCircle2,
  Clock, AlertCircle, MapPin, Phone, CreditCard, ArrowUpDown,
  Download, RefreshCw, Ban, ChevronRight, Filter,
  Star, TrendingUp, IndianRupee, User,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PACKING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

interface OrderItem { name: string; qty: number; price: number; }

interface PharmacyOrder {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: OrderStatus;
  placedAt: string;
  estimatedDelivery: string;
  trackingId?: string;
  notes?: string;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const ORDERS: PharmacyOrder[] = [
  { id: 'o1',  orderId: 'LLORD-A3F2B1', customerName: 'Arjun Sharma',   customerPhone: '9876543210', customerEmail: 'arjun@email.com',   address: '14, Lodi Colony, Near Khan Market', city: 'New Delhi',   pincode: '110003', items: [{ name: 'Paracetamol 500mg', qty: 3, price: 32 }, { name: 'Vitamin D3 60000IU', qty: 2, price: 89 }, { name: 'ORS Electrolyte', qty: 4, price: 28 }], subtotal: 458, delivery: 0,  total: 458,  paymentMethod: 'UPI',         paymentStatus: 'PAID',    status: 'DELIVERED',         placedAt: '2026-05-25 09:12', estimatedDelivery: '2026-05-26', trackingId: 'TRK-A3F2B1' },
  { id: 'o2',  orderId: 'LLORD-B5C3D2', customerName: 'Priya Patel',    customerPhone: '9765432109', customerEmail: 'priya@email.com',   address: '7, Satellite Road, Bodakdev',       city: 'Ahmedabad',   pincode: '380015', items: [{ name: 'Metformin 500mg', qty: 2, price: 45 }, { name: 'Glucometer Strips', qty: 1, price: 450 }, { name: 'Insulin Syringes', qty: 1, price: 180 }], subtotal: 720, delivery: 0,  total: 720,  paymentMethod: 'Card',        paymentStatus: 'PAID',    status: 'OUT_FOR_DELIVERY',  placedAt: '2026-05-27 14:30', estimatedDelivery: '2026-05-28', trackingId: 'TRK-B5C3D2' },
  { id: 'o3',  orderId: 'LLORD-C7E4F3', customerName: 'Vikram Singh',   customerPhone: '9654321098', customerEmail: 'vikram@email.com',  address: '32A, Sector 14, Gurugram',          city: 'Gurugram',    pincode: '122001', items: [{ name: 'Omeprazole 20mg', qty: 2, price: 55 }, { name: 'Domperidone 10mg', qty: 1, price: 38 }, { name: 'Probiotics 10B CFU', qty: 1, price: 195 }], subtotal: 343, delivery: 0, total: 343, paymentMethod: 'NetBanking', paymentStatus: 'PAID',    status: 'SHIPPED',           placedAt: '2026-05-27 11:45', estimatedDelivery: '2026-05-29', trackingId: 'TRK-C7E4F3' },
  { id: 'o4',  orderId: 'LLORD-D9G5H4', customerName: 'Sneha Gupta',   customerPhone: '9543210987', customerEmail: 'sneha@email.com',   address: '56, Koramangala 5th Block',          city: 'Bengaluru',   pincode: '560095', items: [{ name: 'Revital H Multivitamin', qty: 1, price: 285 }, { name: 'Biotin 10000mcg', qty: 1, price: 185 }, { name: 'Omega-3 Fish Oil', qty: 1, price: 320 }], subtotal: 790, delivery: 0, total: 790, paymentMethod: 'UPI',       paymentStatus: 'PAID',    status: 'PACKING',           placedAt: '2026-05-28 08:00', estimatedDelivery: '2026-05-29', trackingId: undefined },
  { id: 'o5',  orderId: 'LLORD-E2I6J5', customerName: 'Ravi Nair',     customerPhone: '9432109876', customerEmail: 'ravi@email.com',    address: '12, Marine Lines, Charni Road',      city: 'Mumbai',      pincode: '400002', items: [{ name: 'Clotrimazole Cream 1%', qty: 2, price: 78 }, { name: 'Hydrocortisone Cream', qty: 1, price: 65 }, { name: 'Sunscreen SPF50+', qty: 1, price: 320 }], subtotal: 541, delivery: 0, total: 541, paymentMethod: 'Card',      paymentStatus: 'PAID',    status: 'CONFIRMED',         placedAt: '2026-05-28 10:22', estimatedDelivery: '2026-05-29', trackingId: undefined },
  { id: 'o6',  orderId: 'LLORD-F4K7L6', customerName: 'Kavitha Menon', customerPhone: '9321098765', customerEmail: 'kavitha@email.com', address: '8, Anna Nagar, 2nd Avenue',          city: 'Chennai',     pincode: '600040', items: [{ name: 'Levocetrizine 5mg', qty: 2, price: 65 }, { name: 'Otrivin Nasal Spray', qty: 1, price: 98 }, { name: 'Mucinex DM 600mg', qty: 1, price: 220 }], subtotal: 448, delivery: 0, total: 448, paymentMethod: 'Wallet',    paymentStatus: 'PAID',    status: 'PLACED',            placedAt: '2026-05-28 12:10', estimatedDelivery: '2026-05-29', trackingId: undefined },
  { id: 'o7',  orderId: 'LLORD-G6M8N7', customerName: 'Deepak Joshi',  customerPhone: '9210987654', customerEmail: 'deepak@email.com',  address: '3, Banjara Hills, Road No. 12',      city: 'Hyderabad',   pincode: '500034', items: [{ name: 'Atorvastatin 10mg', qty: 3, price: 112 }, { name: 'Amlodipine 5mg', qty: 2, price: 65 }, { name: 'Aspirin 75mg', qty: 2, price: 22 }], subtotal: 510, delivery: 0, total: 510, paymentMethod: 'UPI',      paymentStatus: 'REFUNDED', status: 'CANCELLED',         placedAt: '2026-05-24 16:45', estimatedDelivery: '2026-05-25', trackingId: undefined },
  { id: 'o8',  orderId: 'LLORD-H8O9P8', customerName: 'Anjali Rao',    customerPhone: '9109876543', customerEmail: 'anjali@email.com',  address: '22, Civil Lines, Prayagraj',         city: 'Prayagraj',   pincode: '211001', items: [{ name: 'Blood Pressure Monitor', qty: 1, price: 2450 }, { name: 'Pulse Oximeter', qty: 1, price: 895 }], subtotal: 3345, delivery: 0, total: 3345, paymentMethod: 'EMI/Card', paymentStatus: 'PAID', status: 'DELIVERED',        placedAt: '2026-05-22 09:30', estimatedDelivery: '2026-05-23', trackingId: 'TRK-H8O9P8' },
  { id: 'o9',  orderId: 'LLORD-I9Q0R9', customerName: 'Suresh Pillai', customerPhone: '9098765432', customerEmail: 'suresh@email.com',  address: '45, MG Road, Ernakulam',             city: 'Kochi',       pincode: '682016', items: [{ name: 'Glucometer Complete Kit', qty: 1, price: 1250 }, { name: 'Insulin Syringes', qty: 2, price: 180 }], subtotal: 1610, delivery: 0, total: 1610, paymentMethod: 'UPI',    paymentStatus: 'PAID',    status: 'SHIPPED',           placedAt: '2026-05-27 17:20', estimatedDelivery: '2026-05-29', trackingId: 'TRK-I9Q0R9' },
  { id: 'o10', orderId: 'LLORD-J1S2T0', customerName: 'Meena Iyer',    customerPhone: '8987654321', customerEmail: 'meena@email.com',   address: '9, Adyar, Kasturbai Nagar',          city: 'Chennai',     pincode: '600020', items: [{ name: 'N95 Respirators', qty: 2, price: 195 }, { name: 'Surgical Gloves L', qty: 1, price: 18 }], subtotal: 408, delivery: 0, total: 408, paymentMethod: 'Card',  paymentStatus: 'PAID',    status: 'OUT_FOR_DELIVERY',  placedAt: '2026-05-27 13:55', estimatedDelivery: '2026-05-28', trackingId: 'TRK-J1S2T0' },
  { id: 'o11', orderId: 'LLORD-K3U4V1', customerName: 'Rahul Verma',   customerPhone: '8876543210', customerEmail: 'rahul@email.com',   address: '17, Rajpur Road, Civil Lines',       city: 'Dehradun',    pincode: '248001', items: [{ name: 'Salbutamol Inhaler', qty: 2, price: 142 }, { name: 'Montelukast 10mg', qty: 1, price: 185 }, { name: 'Levocetrizine 5mg', qty: 1, price: 65 }], subtotal: 534, delivery: 0, total: 534, paymentMethod: 'UPI',  paymentStatus: 'PAID',    status: 'PACKING',           placedAt: '2026-05-28 07:50', estimatedDelivery: '2026-05-29', trackingId: undefined },
  { id: 'o12', orderId: 'LLORD-L5W6X2', customerName: 'Pooja Singh',   customerPhone: '8765432109', customerEmail: 'pooja@email.com',   address: '5, Cantonment Road, Lucknow',        city: 'Lucknow',     pincode: '226001', items: [{ name: 'Minoxidil 5% Topical', qty: 1, price: 385 }, { name: 'Biotin 10000mcg', qty: 1, price: 185 }], subtotal: 570, delivery: 0, total: 570, paymentMethod: 'Wallet', paymentStatus: 'PAID',    status: 'PLACED',            placedAt: '2026-05-28 11:30', estimatedDelivery: '2026-05-29', trackingId: undefined },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STEPS: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; dot: string; icon: React.ElementType }> = {
  PLACED:           { label: 'Order Placed',      color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/30',     dot: 'bg-blue-500',    icon: ShoppingBag },
  CONFIRMED:        { label: 'Confirmed',          color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30', dot: 'bg-indigo-500',  icon: CheckCircle2 },
  PACKING:          { label: 'Packing',            color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/30',   dot: 'bg-amber-500',   icon: Package },
  SHIPPED:          { label: 'Shipped',            color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30', dot: 'bg-violet-500',  icon: Truck },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery',   color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', dot: 'bg-orange-500',  icon: Truck },
  DELIVERED:        { label: 'Delivered',          color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500', icon: CheckCircle2 },
  CANCELLED:        { label: 'Cancelled',          color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-900/30',       dot: 'bg-red-500',     icon: Ban },
  RETURNED:         { label: 'Returned',           color: 'text-gray-700 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-gray-900/30',     dot: 'bg-gray-400',    icon: RefreshCw },
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Order Detail Modal ────────────────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onStatusChange }: {
  order: PharmacyOrder; onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const sc = STATUS_CONFIG[order.status];
  const StatusIcon = sc.icon;
  const stepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-3xl border shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="font-bold text-lg">Order Details</h2>
              <p className="text-xs text-muted-foreground font-mono">{order.orderId}</p>
            </div>
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Status & Tracker */}
            <div>
              <span className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold', sc.bg, sc.color)}>
                <StatusIcon className="size-4" /> {sc.label}
              </span>
              {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                <div className="mt-4 flex items-center gap-0">
                  {STATUS_STEPS.map((s, i) => {
                    const done = i <= stepIdx;
                    const SIcon = STATUS_CONFIG[s].icon;
                    return (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0 transition-all', done ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          <SIcon className="size-3.5" />
                        </div>
                        {i < STATUS_STEPS.length - 1 && <div className={cn('flex-1 h-0.5', done && i < stepIdx ? 'bg-primary' : 'bg-muted')} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Customer & Delivery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">{order.customerName.split(' ').map((n) => n[0]).join('')}</div>
                  <div>
                    <p className="font-bold text-sm">{order.customerName}</p>
                    <p className="text-[10px] text-muted-foreground">{order.customerEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="size-3" />{order.customerPhone}</div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery Address</p>
                <div className="flex items-start gap-1.5 text-xs">
                  <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{order.address}</p>
                    <p className="text-muted-foreground">{order.city} - {order.pincode}</p>
                  </div>
                </div>
                {order.trackingId && (
                  <div className="flex items-center gap-1 text-xs text-primary font-mono"><Truck className="size-3" /> {order.trackingId}</div>
                )}
              </div>
            </div>
            {/* Items */}
            <div>
              <p className="text-sm font-bold mb-3">Order Items ({order.items.length})</p>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                    </div>
                    <span className="font-bold">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="text-emerald-600 font-semibold">{order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
                <div className="flex justify-between font-black text-base border-t pt-2"><span>Total</span><span className="text-primary">₹{order.total}</span></div>
              </div>
            </div>
            {/* Payment */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Payment Method', value: order.paymentMethod },
                { label: 'Payment Status', value: order.paymentStatus },
                { label: 'Estimated Delivery', value: new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/40 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {/* Update Status */}
            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Advance Order Status</p>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_STEPS.slice(stepIdx + 1).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const SIcon = cfg.icon;
                    return (
                      <button key={s} onClick={() => { onStatusChange(order.id, s); onClose(); }} className={cn('flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border-2 transition-all hover:scale-105', cfg.bg, cfg.color, 'border-current/20')}>
                        <SIcon className="size-3.5" /> Mark as {cfg.label}
                      </button>
                    );
                  })}
                  <button onClick={() => { onStatusChange(order.id, 'CANCELLED'); onClose(); }} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border-2 border-red-300 text-red-600 bg-red-50 dark:bg-red-950/20 transition-all hover:scale-105">
                    <Ban className="size-3.5" /> Cancel Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPharmacyOrdersPage() {
  const [orders, setOrders] = useState<PharmacyOrder[]>(ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [sortField, setSortField] = useState<'date' | 'total'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let list = orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch = !q || o.customerName.toLowerCase().includes(q) || o.orderId.toLowerCase().includes(q) || o.city.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
    list = [...list].sort((a, b) => {
      const v = sortField === 'date' ? a.placedAt.localeCompare(b.placedAt) : a.total - b.total;
      return sortDir === 'asc' ? v : -v;
    });
    return list;
  }, [orders, search, statusFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => ['PLACED', 'CONFIRMED', 'PACKING'].includes(o.status)).length,
    inTransit: orders.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
    cancelled: orders.filter((o) => o.status === 'CANCELLED').length,
    revenue: orders.filter((o) => o.paymentStatus === 'PAID' && o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0),
  }), [orders]);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status, trackingId: ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(status) ? (o.trackingId || `TRK-${Date.now().toString(36).toUpperCase().slice(-6)}`) : o.trackingId } : o));
    toast.success(`Order ${STATUS_CONFIG[status].label}`, { description: orders.find((o) => o.id === id)?.orderId });
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><ShoppingBag className="size-6 text-primary" /> Pharmacy Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and track all medicine orders placed through LifeLink Pharmacy</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="size-3.5" /> Export</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Processing', value: stats.pending, icon: Package, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'In Transit', value: stats.inTransit, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Cancelled', value: stats.cancelled, icon: Ban, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Revenue', value: `₹${(stats.revenue / 1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="card-hover cursor-pointer">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={cn('size-9 rounded-xl flex items-center justify-center shrink-0', bg)}><Icon className={cn('size-4', color)} /></div>
              <div>
                <p className={cn('text-xl font-black leading-none', color)}>{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search customer, order ID, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/40 border-0" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="size-3.5 text-muted-foreground" /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['ALL', 'PLACED', 'CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap', statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} orders</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Order ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-foreground" onClick={() => toggleSort('date')}>
                    Placed At <ArrowUpDown className="size-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Delivery Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right font-semibold cursor-pointer hover:text-foreground" onClick={() => toggleSort('total')}>
                    Total <ArrowUpDown className="size-3 inline ml-0.5" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filtered.map((order, idx) => {
                    const sc = STATUS_CONFIG[order.status];
                    const StatusIcon = sc.icon;
                    const stepIdx = STATUS_STEPS.indexOf(order.status);
                    const nextStatus = stepIdx >= 0 && stepIdx < STATUS_STEPS.length - 1 ? STATUS_STEPS[stepIdx + 1] : null;
                    return (
                      <motion.tr key={order.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <td className="px-4 py-3 font-mono text-xs text-primary font-bold">{order.orderId}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold text-xs">{order.customerName}</p>
                            <p className="text-[10px] text-muted-foreground">{order.city} - {order.pincode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium">{order.items.length} items</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-32">{order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.placedAt}</td>
                        <td className="px-4 py-3 text-xs font-medium">
                          {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.color)}>
                            <StatusIcon className="size-3" />{sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-xs font-medium">{order.paymentMethod}</p>
                            <Badge className={cn('text-[9px] mt-0.5', order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : order.paymentStatus === 'REFUNDED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700')}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-black">₹{order.total.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} className="size-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform">
                              <Eye className="size-3.5" />
                            </button>
                            {nextStatus && (
                              <button onClick={(e) => { e.stopPropagation(); updateStatus(order.id, nextStatus); }} className="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform" title={`Mark as ${STATUS_CONFIG[nextStatus].label}`}>
                                <ChevronRight className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-16 text-muted-foreground">
                    <ShoppingBag className="size-10 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No orders found</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={updateStatus} />
      )}
    </motion.div>
  );
}
