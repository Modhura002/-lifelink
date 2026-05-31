'use client';
import { useSession } from 'next-auth/react';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, CheckCircle, Truck, Navigation, ShoppingBag,
  IndianRupee, Phone, Star, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLiveFeedStore, useNavigationStore, type PharmacyOrder } from '@/store';
import MapWrapper from '@/components/ui/MapWrapper';
import type { MapMarker } from '@/components/ui/DynamicMap';

// ─── Constants ────────────────────────────────────────────────────────────────

const WAREHOUSE: [number, number] = [28.6315, 77.2167];

type OStatus = PharmacyOrder['status'];

const STEPS: OStatus[] = ['placed', 'confirmed', 'preparing', 'shipped', 'out-for-delivery', 'delivered'];

const CFG: Record<OStatus, { label: string; desc: string; icon: React.ElementType; color: string; bg: string }> = {
  placed:            { label: 'Order Placed',      desc: 'Your order has been received',          icon: ShoppingBag,  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30' },
  confirmed:         { label: 'Confirmed',          desc: 'Pharmacy confirmed your order',         icon: CheckCircle,  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  preparing:         { label: 'Preparing',          desc: 'Medicines are being packed',            icon: Package,      color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
  shipped:           { label: 'Shipped',            desc: 'Out with delivery partner',             icon: Truck,        color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  'out-for-delivery':{ label: 'Out for Delivery',   desc: 'Agent is on the way to you!',           icon: Navigation,   color: 'text-primary',                         bg: 'bg-primary/10' },
  delivered:         { label: 'Delivered',          desc: 'Successfully delivered',                icon: CheckCircle,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const ADVANCE: Partial<Record<OStatus, number>> = {
  placed: 4000, confirmed: 7000, preparing: 11000, shipped: 14000, 'out-for-delivery': 22000,
};

const AGENTS = [
  { name: 'Ramesh Kumar',  phone: '+91 98765 43210', vehicle: 'Bike · DL-4S-AH-2341', rating: 4.8, trips: 2134 },
  { name: 'Suresh Yadav',  phone: '+91 87654 32109', vehicle: 'Bike · DL-8P-BC-7612', rating: 4.7, trips: 1876 },
  { name: 'Mohan Singh',   phone: '+91 76543 21098', vehicle: 'Scooter · DL-2R-KK-9023', rating: 4.9, trips: 3201 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OrderTrackingPage() {
  const { pharmacyOrders, updateOrderStatus } = useLiveFeedStore();
  const { data: session } = useSession();
  const user = session?.user;
  const { setCurrentPage } = useNavigationStore();

  const activeOrder = useMemo(() => {
    if (!user?.email) return null;
    return pharmacyOrders
      .filter(o => o.patientEmail === user.email)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
  }, [pharmacyOrders, user?.email]);

  const agent = useMemo(() => {
    if (!activeOrder) return AGENTS[0];
    const n = parseInt(activeOrder.id, 10);
    return AGENTS[isNaN(n) ? 0 : n % AGENTS.length];
  }, [activeOrder?.id]);

  // Animate delivery agent position
  const [progress, setProgress] = useState(0);
  const [agentPos, setAgentPos] = useState<[number, number]>(WAREHOUSE);

  // Auto-advance status
  useEffect(() => {
    if (!activeOrder || !ADVANCE[activeOrder.status]) return;
    const t = setTimeout(() => {
      const idx = STEPS.indexOf(activeOrder.status);
      if (idx < STEPS.length - 1) updateOrderStatus(activeOrder.orderId, STEPS[idx + 1]);
    }, ADVANCE[activeOrder.status]);
    return () => clearTimeout(t);
  }, [activeOrder?.status, activeOrder?.orderId, updateOrderStatus]);

  // Animate agent
  useEffect(() => {
    if (!activeOrder) return;
    setProgress(0);
    const iv = setInterval(() => setProgress(p => {
      const n = p + 0.007;
      if (n >= 1) { clearInterval(iv); return 1; }
      return n;
    }), 350);
    return () => clearInterval(iv);
  }, [activeOrder?.id]);

  useEffect(() => {
    if (!activeOrder) return;
    const t = progress;
    setAgentPos([
      WAREHOUSE[0] + (activeOrder.deliveryLat - WAREHOUSE[0]) * t,
      WAREHOUSE[1] + (activeOrder.deliveryLng - WAREHOUSE[1]) * t,
    ]);
  }, [progress, activeOrder]);

  if (!activeOrder) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <div className="size-24 rounded-3xl bg-muted/60 flex items-center justify-center mx-auto">
            <Package className="size-12 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">No Active Order</h2>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              You don't have any active pharmacy order being tracked right now.
            </p>
          </div>
          <Button onClick={() => setCurrentPage('pharmacy-store')} className="gap-2">
            <ShoppingBag className="size-4" />Shop Medicines
          </Button>
        </motion.div>
      </div>
    );
  }

  const statusIdx = STEPS.indexOf(activeOrder.status);
  const pct = ((statusIdx + 1) / STEPS.length) * 100;
  const cfg = CFG[activeOrder.status];
  const StatusIcon = cfg.icon;
  const isDelivered = activeOrder.status === 'delivered';

  const eta = (() => {
    if (isDelivered) return 'Delivered';
    const rem = Math.max(0, new Date(activeOrder.estimatedDelivery).getTime() - Date.now());
    const m = Math.ceil(rem / 60000);
    if (m <= 0) return 'Arriving soon';
    return m < 60 ? `~${m} min` : `~${Math.ceil(m / 60)}h ${m % 60}m`;
  })();

  const markers: MapMarker[] = [
    { id: 'wh',   position: WAREHOUSE,                                                      type: 'hospital',  label: 'Warehouse',     popup: 'LifeLink Pharmacy Hub' },
    { id: 'ag',   position: agentPos,                                                        type: 'ambulance', label: 'Delivery Agent', popup: agent.name },
    { id: 'dst',  position: [activeOrder.deliveryLat, activeOrder.deliveryLng],              type: 'patient',   label: 'Your Location',  popup: activeOrder.address },
  ];
  const route: [number, number][] = [WAREHOUSE, agentPos, [activeOrder.deliveryLat, activeOrder.deliveryLng]];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl mx-auto">

      {/* Header card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn('size-12 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
              <StatusIcon className={cn('size-6', cfg.color)} />
            </div>
            <div>
              <p className="font-bold">{cfg.label}</p>
              <p className="text-xs text-muted-foreground">{cfg.desc}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-xs text-muted-foreground">{activeOrder.orderId}</p>
            <p className={cn('text-sm font-bold mt-0.5', cfg.color)}>ETA: {eta}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 text-right">{Math.round(pct)}% complete</p>
        </div>
      </motion.div>

      {/* Map */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Navigation className="size-4 text-primary" />
            <span className="text-sm font-semibold">Live Tracking</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />Live
          </div>
        </div>
        <MapWrapper center={agentPos} zoom={13} markers={markers} route={route} className="h-64 md:h-80" autoCenter={false} />
        <div className="px-4 py-3 flex items-center gap-4 text-xs text-muted-foreground border-t flex-wrap">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-red-500" />Warehouse</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-500" />Delivery Agent</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-green-500" />Your Location</span>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-5">Order Journey</h3>
        <div className="space-y-0">
          {STEPS.map((s, i) => {
            const c = CFG[s];
            const Icon = c.icon;
            const done = i <= statusIdx;
            const current = i === statusIdx;
            const last = i === STEPS.length - 1;
            return (
              <div key={s} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <motion.div animate={{ backgroundColor: done ? 'rgb(16,185,129)' : 'transparent' }}
                    className={cn('size-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                      done && 'border-emerald-500 bg-emerald-500',
                      current && !done && 'border-primary bg-primary/10',
                      !done && !current && 'border-muted')}>
                    {done ? <CheckCircle className="size-4 text-white" />
                      : current ? <Loader2 className="size-4 text-primary animate-spin" />
                      : <Icon className="size-4 text-muted-foreground/40" />}
                  </motion.div>
                  {!last && <div className={cn('w-0.5 flex-1 min-h-[24px] my-1 rounded-full transition-colors', i < statusIdx ? 'bg-emerald-500' : 'bg-muted')} />}
                </div>
                <div className={cn('pb-4', last && 'pb-0', 'pt-1')}>
                  <p className={cn('text-sm font-semibold', done ? 'text-foreground' : 'text-muted-foreground')}>{c.label}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Agent card */}
      <AnimatePresence>
        {(activeOrder.status === 'shipped' || activeOrder.status === 'out-for-delivery' || isDelivered) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card border rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4">Your Delivery Agent</h3>
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {agent.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="font-bold">{agent.name}</p>
                <p className="text-xs text-muted-foreground">{agent.vehicle}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{agent.rating}</span>
                  <span className="text-xs text-muted-foreground">· {agent.trips.toLocaleString()} trips</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 shrink-0">
                <Phone className="size-3.5" />Call
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order items */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Order Items</h3>
          <span className="text-xs text-muted-foreground">{activeOrder.items.length} item{activeOrder.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="space-y-3">
          {activeOrder.items.slice(0, 5).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="size-6 rounded-lg bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">{item.qty}x</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="font-semibold flex items-center gap-0.5 shrink-0">
                <IndianRupee className="size-3" />{item.price.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
          {activeOrder.items.length > 5 && <p className="text-xs text-muted-foreground">+{activeOrder.items.length - 5} more items</p>}
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <span className="font-bold">Total Paid</span>
          <span className="font-black text-lg flex items-center gap-1"><IndianRupee className="size-4" />{activeOrder.total.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
          <Navigation className="size-3 shrink-0 mt-0.5" />{activeOrder.address}
        </p>
      </motion.div>

      {/* Delivered CTA */}
      {isDelivered && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-3">
          <div className="size-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
            <CheckCircle className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-300">Order Delivered!</h3>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70 mt-1">Your medicines have been delivered successfully.</p>
          </div>
          <Button onClick={() => setCurrentPage('pharmacy-store')} className="gap-2">
            <ShoppingBag className="size-4" />Order Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
