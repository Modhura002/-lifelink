'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageOpen, Plus, Search, Filter, AlertTriangle, CheckCircle2,
  Edit2, Trash2, X, ChevronDown, RefreshCw, Download, Upload,
  Package, Pill, Syringe, ShieldAlert, Beaker, Bandage,
  TrendingDown, Clock, ArrowUpCircle, BarChart3, Truck,
  Save, AlertCircle,
} from 'lucide-react';
import { motion as m } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

type StockStatus = 'IN_STOCK' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
type ItemCategory = 'Medicine' | 'Equipment' | 'Consumable' | 'PPE' | 'Blood Bank' | 'Surgical';

interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  sku: string;
  stock: number;
  unit: string;
  minLevel: number;
  maxLevel: number;
  price: number;
  expiry: string;
  supplier: string;
  location: string;
  status: StockStatus;
  lastRestocked: string;
  batchNo: string;
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const SEED: InventoryItem[] = [
  { id: 'i1',  name: 'Paracetamol 500mg', category: 'Medicine',    sku: 'MED-001', stock: 2400, unit: 'Tablets',   minLevel: 500,  maxLevel: 5000, price: 2.8,   expiry: '2027-06-30', supplier: 'Sun Pharma',       location: 'Rack A1',  status: 'IN_STOCK',   lastRestocked: '2026-04-10', batchNo: 'SP240610' },
  { id: 'i2',  name: 'Amoxicillin 500mg', category: 'Medicine',    sku: 'MED-002', stock: 180,  unit: 'Capsules',  minLevel: 200,  maxLevel: 2000, price: 9.5,   expiry: '2026-12-31', supplier: 'Cipla',            location: 'Rack A2',  status: 'LOW',        lastRestocked: '2026-03-22', batchNo: 'CP240322' },
  { id: 'i3',  name: 'Metformin 500mg',   category: 'Medicine',    sku: 'MED-003', stock: 900,  unit: 'Tablets',   minLevel: 300,  maxLevel: 3000, price: 4.5,   expiry: '2027-03-31', supplier: 'USV Ltd',          location: 'Rack A3',  status: 'IN_STOCK',   lastRestocked: '2026-04-01', batchNo: 'USV240401' },
  { id: 'i4',  name: 'Atorvastatin 10mg', category: 'Medicine',    sku: 'MED-004', stock: 40,   unit: 'Tablets',   minLevel: 200,  maxLevel: 2000, price: 11.2,  expiry: '2026-09-30', supplier: 'Pfizer India',     location: 'Rack A4',  status: 'CRITICAL',   lastRestocked: '2026-02-15', batchNo: 'PF240215' },
  { id: 'i5',  name: 'Amlodipine 5mg',    category: 'Medicine',    sku: 'MED-005', stock: 650,  unit: 'Tablets',   minLevel: 200,  maxLevel: 2000, price: 6.5,   expiry: '2027-08-31', supplier: 'Torrent Pharma',   location: 'Rack A5',  status: 'IN_STOCK',   lastRestocked: '2026-04-05', batchNo: 'TP240405' },
  { id: 'i6',  name: 'Morphine 10mg/mL',  category: 'Medicine',    sku: 'MED-006', stock: 25,   unit: 'Ampoules',  minLevel: 50,   maxLevel: 200,  price: 85,    expiry: '2026-11-30', supplier: 'Hameln Pharma',    location: 'Safe C1',  status: 'CRITICAL',   lastRestocked: '2026-01-20', batchNo: 'HP240120' },
  { id: 'i7',  name: 'Normal Saline 500mL', category: 'Medicine',  sku: 'MED-007', stock: 320,  unit: 'Bottles',   minLevel: 100,  maxLevel: 1000, price: 45,    expiry: '2027-01-31', supplier: 'Baxter India',     location: 'Store B1', status: 'IN_STOCK',   lastRestocked: '2026-04-08', batchNo: 'BX240408' },
  { id: 'i8',  name: 'Dextrose 5% 500mL', category: 'Medicine',    sku: 'MED-008', stock: 0,    unit: 'Bottles',   minLevel: 100,  maxLevel: 800,  price: 48,    expiry: '2026-10-31', supplier: 'Fresenius Kabi',   location: 'Store B2', status: 'OUT_OF_STOCK', lastRestocked: '2026-01-10', batchNo: 'FK240110' },
  { id: 'i9',  name: 'Insulin (Regular) 100IU', category: 'Medicine', sku: 'MED-009', stock: 85, unit: 'Vials',  minLevel: 50,   maxLevel: 300,  price: 145,   expiry: '2026-08-31', supplier: 'Novo Nordisk',     location: 'Fridge F1', status: 'IN_STOCK',  lastRestocked: '2026-03-30', batchNo: 'NN240330' },
  { id: 'i10', name: 'Epinephrine 1mg/mL', category: 'Medicine',   sku: 'MED-010', stock: 12,   unit: 'Ampoules',  minLevel: 30,   maxLevel: 150,  price: 95,    expiry: '2026-07-31', supplier: 'Neon Labs',        location: 'ICU Store', status: 'CRITICAL',  lastRestocked: '2026-02-05', batchNo: 'NL240205' },
  { id: 'i11', name: 'Surgical Gloves L',  category: 'PPE',         sku: 'PPE-001', stock: 2200, unit: 'Pairs',     minLevel: 500,  maxLevel: 5000, price: 18,    expiry: '2028-12-31', supplier: 'Ansell',           location: 'Store C1', status: 'IN_STOCK',   lastRestocked: '2026-04-12', batchNo: 'AN240412' },
  { id: 'i12', name: 'N95 Respirators',    category: 'PPE',         sku: 'PPE-002', stock: 145,  unit: 'Pieces',    minLevel: 200,  maxLevel: 1000, price: 42,    expiry: '2027-06-30', supplier: '3M India',         location: 'Store C2', status: 'LOW',        lastRestocked: '2026-03-01', batchNo: '3M240301' },
  { id: 'i13', name: 'Isolation Gowns',    category: 'PPE',         sku: 'PPE-003', stock: 380,  unit: 'Pieces',    minLevel: 100,  maxLevel: 500,  price: 65,    expiry: '2028-12-31', supplier: 'Kimberly-Clark',   location: 'Store C3', status: 'IN_STOCK',   lastRestocked: '2026-03-20', batchNo: 'KC240320' },
  { id: 'i14', name: 'Syringes 5mL',       category: 'Consumable',  sku: 'CON-001', stock: 4800, unit: 'Pieces',    minLevel: 1000, maxLevel: 10000, price: 4.2,  expiry: '2029-12-31', supplier: 'HMD',              location: 'Store D1', status: 'IN_STOCK',   lastRestocked: '2026-04-10', batchNo: 'HM240410' },
  { id: 'i15', name: 'IV Cannula 18G',     category: 'Consumable',  sku: 'CON-002', stock: 220,  unit: 'Pieces',    minLevel: 100,  maxLevel: 1000, price: 28,    expiry: '2028-06-30', supplier: 'BD',               location: 'Store D2', status: 'IN_STOCK',   lastRestocked: '2026-04-02', batchNo: 'BD240402' },
  { id: 'i16', name: 'Nasogastric Tube 16FR', category: 'Consumable', sku: 'CON-003', stock: 45, unit: 'Pieces',   minLevel: 50,   maxLevel: 200,  price: 85,    expiry: '2028-12-31', supplier: 'Romsons',          location: 'Store D3', status: 'LOW',        lastRestocked: '2026-02-28', batchNo: 'RS240228' },
  { id: 'i17', name: 'Cardiac Monitor',    category: 'Equipment',   sku: 'EQP-001', stock: 8,    unit: 'Units',     minLevel: 5,    maxLevel: 20,   price: 85000, expiry: 'N/A',        supplier: 'Philips India',    location: 'ICU Ward', status: 'IN_STOCK',   lastRestocked: '2025-12-01', batchNo: 'PH251201' },
  { id: 'i18', name: 'Pulse Oximeter',     category: 'Equipment',   sku: 'EQP-002', stock: 22,   unit: 'Units',     minLevel: 10,   maxLevel: 40,   price: 4500,  expiry: 'N/A',        supplier: 'Nellcor',          location: 'Gen Ward', status: 'IN_STOCK',   lastRestocked: '2026-01-15', batchNo: 'NC260115' },
  { id: 'i19', name: 'Defibrillator AED',  category: 'Equipment',   sku: 'EQP-003', stock: 3,    unit: 'Units',     minLevel: 4,    maxLevel: 10,   price: 120000, expiry: 'N/A',       supplier: 'ZOLL Medical',     location: 'Emergency', status: 'CRITICAL',  lastRestocked: '2025-10-10', batchNo: 'ZL251010' },
  { id: 'i20', name: 'Blood A+ (Packed RBC)', category: 'Blood Bank', sku: 'BB-001', stock: 18, unit: 'Units',     minLevel: 10,   maxLevel: 50,   price: 0,     expiry: '2026-06-20', supplier: 'Blood Bank',       location: 'Blood Bank', status: 'IN_STOCK',  lastRestocked: '2026-05-20', batchNo: 'BB240520' },
  { id: 'i21', name: 'Blood O- (Universal Donor)', category: 'Blood Bank', sku: 'BB-002', stock: 4, unit: 'Units', minLevel: 8,    maxLevel: 30,   price: 0,     expiry: '2026-06-25', supplier: 'Blood Bank',       location: 'Blood Bank', status: 'CRITICAL',  lastRestocked: '2026-05-25', batchNo: 'BB240525' },
  { id: 'i22', name: 'Suture 3-0 Vicryl',  category: 'Surgical',    sku: 'SUR-001', stock: 320,  unit: 'Boxes',     minLevel: 100,  maxLevel: 500,  price: 125,   expiry: '2028-03-31', supplier: 'Ethicon',          location: 'OT Store', status: 'IN_STOCK',   lastRestocked: '2026-03-15', batchNo: 'ET240315' },
  { id: 'i23', name: 'Betadine Solution',   category: 'Surgical',    sku: 'SUR-002', stock: 90,   unit: 'Bottles',   minLevel: 100,  maxLevel: 500,  price: 68,    expiry: '2027-09-30', supplier: 'Win-Medicare',     location: 'OT Store', status: 'LOW',        lastRestocked: '2026-02-20', batchNo: 'WM240220' },
  { id: 'i24', name: 'Sterile Drape Set',   category: 'Surgical',    sku: 'SUR-003', stock: 55,   unit: 'Sets',      minLevel: 30,   maxLevel: 150,  price: 340,   expiry: '2028-12-31', supplier: 'Mölnlycke',        location: 'OT Store', status: 'IN_STOCK',   lastRestocked: '2026-04-01', batchNo: 'ML240401' },
  { id: 'i25', name: 'Oxygen Cylinder 10L', category: 'Equipment',   sku: 'EQP-004', stock: 14,   unit: 'Cylinders', minLevel: 10,   maxLevel: 40,   price: 2200,  expiry: 'N/A',        supplier: 'Linde India',      location: 'Gas Store', status: 'IN_STOCK',  lastRestocked: '2026-04-14', batchNo: 'LI240414' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; bg: string; dot: string }> = {
  IN_STOCK:     { label: 'In Stock',     color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  LOW:          { label: 'Low Stock',    color: 'text-amber-700 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30',     dot: 'bg-amber-500'   },
  CRITICAL:     { label: 'Critical',     color: 'text-red-700 dark:text-red-400',         bg: 'bg-red-100 dark:bg-red-900/30',         dot: 'bg-red-500'     },
  OUT_OF_STOCK: { label: 'Out of Stock', color: 'text-gray-700 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-900/30',       dot: 'bg-gray-400'    },
};

const CAT_ICON: Record<ItemCategory, React.ElementType> = {
  Medicine: Pill, Equipment: BarChart3, Consumable: Package,
  PPE: ShieldAlert, 'Blood Bank': Beaker, Surgical: Bandage,
};

const CAT_COLOR: Record<ItemCategory, string> = {
  Medicine: 'text-blue-500', Equipment: 'text-violet-500', Consumable: 'text-orange-500',
  PPE: 'text-teal-500', 'Blood Bank': 'text-red-500', Surgical: 'text-emerald-500',
};

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

// ── Add/Edit Modal ────────────────────────────────────────────────────────────

type ModalMode = 'add' | 'edit' | 'restock';

function ItemModal({
  mode, item, onClose, onSave,
}: {
  mode: ModalMode;
  item?: InventoryItem;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>) => void;
}) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category: item?.category || 'Medicine' as ItemCategory,
    sku: item?.sku || '',
    stock: item?.stock ?? 0,
    unit: item?.unit || 'Tablets',
    minLevel: item?.minLevel ?? 100,
    maxLevel: item?.maxLevel ?? 1000,
    price: item?.price ?? 0,
    expiry: item?.expiry || '',
    supplier: item?.supplier || '',
    location: item?.location || '',
    batchNo: item?.batchNo || '',
    restockQty: 0,
  });

  const set = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  const isRestock = mode === 'restock';

  const titles = { add: 'Add New Item', edit: 'Edit Item', restock: 'Restock Item' };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-2xl border shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              {isRestock ? <ArrowUpCircle className="size-5 text-emerald-500" /> : <PackageOpen className="size-5 text-primary" />}
              <h2 className="font-bold text-lg">{titles[mode]}</h2>
              {item && <span className="text-xs text-muted-foreground font-mono">{item.sku}</span>}
            </div>
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {isRestock ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="font-bold">{item?.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Current stock: <span className="font-bold text-foreground">{item?.stock} {item?.unit}</span></p>
                  <p className="text-sm text-muted-foreground">Min level: {item?.minLevel} | Max: {item?.maxLevel}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Quantity to Restock</label>
                  <Input type="number" placeholder="Enter quantity" value={form.restockQty || ''} onChange={(e) => set('restockQty', parseInt(e.target.value) || 0)} className="bg-muted/40" />
                  <p className="text-xs text-muted-foreground">New stock will be: {(item?.stock || 0) + (form.restockQty || 0)} {item?.unit}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Batch Number</label>
                  <Input placeholder="e.g. SP260520" value={form.batchNo} onChange={(e) => set('batchNo', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">New Expiry Date</label>
                  <Input type="date" value={form.expiry} onChange={(e) => set('expiry', e.target.value)} className="bg-muted/40" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold">Item Name *</label>
                  <Input placeholder="e.g. Paracetamol 500mg" value={form.name} onChange={(e) => set('name', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full text-sm bg-muted/40 border border-input rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-ring">
                    {(['Medicine', 'Equipment', 'Consumable', 'PPE', 'Blood Bank', 'Surgical'] as ItemCategory[]).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">SKU</label>
                  <Input placeholder="MED-XXX" value={form.sku} onChange={(e) => set('sku', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Current Stock</label>
                  <Input type="number" placeholder="0" value={form.stock || ''} onChange={(e) => set('stock', parseInt(e.target.value) || 0)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Unit</label>
                  <Input placeholder="Tablets / Vials / Units" value={form.unit} onChange={(e) => set('unit', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Min Level</label>
                  <Input type="number" value={form.minLevel || ''} onChange={(e) => set('minLevel', parseInt(e.target.value) || 0)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Max Level</label>
                  <Input type="number" value={form.maxLevel || ''} onChange={(e) => set('maxLevel', parseInt(e.target.value) || 0)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Unit Price (₹)</label>
                  <Input type="number" value={form.price || ''} onChange={(e) => set('price', parseFloat(e.target.value) || 0)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Expiry Date</label>
                  <Input type="date" value={form.expiry === 'N/A' ? '' : form.expiry} onChange={(e) => set('expiry', e.target.value || 'N/A')} className="bg-muted/40" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-sm font-semibold">Supplier</label>
                  <Input placeholder="Supplier name" value={form.supplier} onChange={(e) => set('supplier', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Location</label>
                  <Input placeholder="Rack A1 / ICU Store" value={form.location} onChange={(e) => set('location', e.target.value)} className="bg-muted/40" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Batch No.</label>
                  <Input placeholder="Batch number" value={form.batchNo} onChange={(e) => set('batchNo', e.target.value)} className="bg-muted/40" />
                </div>
              </div>
            )}
          </div>
          <div className="px-6 pb-6 pt-2 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 gap-2" onClick={() => {
              if (isRestock) {
                onSave({ stock: (item?.stock || 0) + form.restockQty, batchNo: form.batchNo, expiry: form.expiry || item?.expiry, lastRestocked: new Date().toISOString().slice(0, 10) });
              } else {
                const s = form.stock <= 0 ? 'OUT_OF_STOCK' : form.stock <= form.minLevel * 0.5 ? 'CRITICAL' : form.stock <= form.minLevel ? 'LOW' : 'IN_STOCK';
                onSave({ ...form, status: s as StockStatus });
              }
              onClose();
            }}>
              <Save className="size-4" /> {isRestock ? 'Confirm Restock' : mode === 'add' ? 'Add Item' : 'Save Changes'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HospitalInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(SEED);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<ItemCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<StockStatus | 'All'>('All');
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'expiry' | 'status'>('status');

  const filtered = useMemo(() => {
    let list = items.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q);
      const matchCat = catFilter === 'All' || i.category === catFilter;
      const matchStatus = statusFilter === 'All' || i.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'stock') list = [...list].sort((a, b) => a.stock - b.stock);
    else if (sortBy === 'expiry') list = [...list].sort((a, b) => a.expiry.localeCompare(b.expiry));
    else list = [...list].sort((a, b) => { const o: StockStatus[] = ['OUT_OF_STOCK', 'CRITICAL', 'LOW', 'IN_STOCK']; return o.indexOf(a.status) - o.indexOf(b.status); });
    return list;
  }, [items, search, catFilter, statusFilter, sortBy]);

  const stats = useMemo(() => ({
    total: items.length,
    inStock: items.filter((i) => i.status === 'IN_STOCK').length,
    low: items.filter((i) => i.status === 'LOW').length,
    critical: items.filter((i) => i.status === 'CRITICAL').length,
    outOfStock: items.filter((i) => i.status === 'OUT_OF_STOCK').length,
  }), [items]);

  const saveItem = (data: Partial<InventoryItem>) => {
    if (modalMode === 'add') {
      const newItem: InventoryItem = {
        id: `i${Date.now()}`, name: '', category: 'Medicine', sku: '', stock: 0,
        unit: '', minLevel: 0, maxLevel: 0, price: 0, expiry: 'N/A',
        supplier: '', location: '', status: 'IN_STOCK', lastRestocked: new Date().toISOString().slice(0, 10), batchNo: '',
        ...data,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success('Item added to inventory', { description: newItem.name });
    } else if (selectedItem) {
      setItems((prev) => prev.map((i) => {
        if (i.id !== selectedItem.id) return i;
        const updated = { ...i, ...data };
        if (modalMode === 'restock') {
          const s = updated.stock <= 0 ? 'OUT_OF_STOCK' : updated.stock <= updated.minLevel * 0.5 ? 'CRITICAL' : updated.stock <= updated.minLevel ? 'LOW' : 'IN_STOCK';
          updated.status = s as StockStatus;
        }
        return updated;
      }));
      toast.success(modalMode === 'restock' ? 'Stock updated' : 'Item updated', { description: selectedItem.name });
    }
  };

  const deleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success('Item removed', { description: item?.name });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-10">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><PackageOpen className="size-6 text-primary" /> Inventory Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage hospital stock — medicines, equipment, consumables & more</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Download className="size-3.5" /> Export</Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs"><Upload className="size-3.5" /> Import</Button>
          <Button size="sm" className="gap-1.5" onClick={() => { setSelectedItem(null); setModalMode('add'); }}>
            <Plus className="size-4" /> Add Item
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Items', value: stats.total, icon: PackageOpen, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'In Stock', value: stats.inStock, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Low Stock', value: stats.low, icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/30' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="card-hover cursor-pointer" onClick={() => setStatusFilter(label === 'Total Items' ? 'All' : label.replace(' ', '_').toUpperCase() as StockStatus)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('size-9 rounded-xl flex items-center justify-center', bg)}>
                <Icon className={cn('size-4', color)} />
              </div>
              <div>
                <p className="text-2xl font-black leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Alerts */}
      {(stats.critical > 0 || stats.outOfStock > 0) && (
        <motion.div variants={fadeUp} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Urgent Action Required</p>
            <p className="text-xs text-red-600 dark:text-red-400/80 mt-0.5">
              {stats.critical} items are critically low and {stats.outOfStock} items are out of stock. Please place restock orders immediately.
            </p>
            <div className="flex gap-2 mt-2">
              {items.filter((i) => i.status === 'CRITICAL' || i.status === 'OUT_OF_STOCK').slice(0, 4).map((i) => (
                <span key={i.id} className="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg px-2 py-0.5 font-semibold">{i.name}</span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name, SKU, supplier..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-muted/40 border-0" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="size-3.5 text-muted-foreground" /></button>}
        </div>
        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['All', 'Medicine', 'Equipment', 'Consumable', 'PPE', 'Blood Bank', 'Surgical'] as const).map((c) => (
            <button key={c} onClick={() => setCatFilter(c)} className={cn('text-xs px-3 py-1.5 rounded-lg font-semibold transition-all', catFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="size-3.5" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="bg-muted/40 rounded-lg px-2 py-1.5 outline-none border-0 text-xs">
            <option value="status">Sort: Alert Priority</option>
            <option value="name">Sort: Name</option>
            <option value="stock">Sort: Stock Level</option>
            <option value="expiry">Sort: Expiry</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground ml-auto">{filtered.length} items</p>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">Item</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Expiry</th>
                  <th className="px-4 py-3 text-left font-semibold">Supplier</th>
                  <th className="px-4 py-3 text-left font-semibold">Location</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filtered.map((item, idx) => {
                    const sc = STATUS_CONFIG[item.status];
                    const CatIcon = CAT_ICON[item.category];
                    const stockPct = Math.min((item.stock / item.maxLevel) * 100, 100);
                    const isExpiringSoon = item.expiry !== 'N/A' && new Date(item.expiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: idx * 0.02 }} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{item.sku} · {item.batchNo}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <CatIcon className={cn('size-3.5', CAT_COLOR[item.category])} />
                            <span className="text-xs">{item.category}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div>
                            <p className="font-bold">{item.stock.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span></p>
                            <div className="mt-1 w-20 h-1.5 bg-muted rounded-full overflow-hidden ml-auto">
                              <div className={cn('h-full rounded-full transition-all', item.status === 'IN_STOCK' ? 'bg-emerald-500' : item.status === 'LOW' ? 'bg-amber-500' : item.status === 'CRITICAL' ? 'bg-red-500' : 'bg-gray-400')} style={{ width: `${stockPct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.color)}>
                            <span className={cn('size-1.5 rounded-full', sc.dot)} />
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className={cn('text-xs font-medium', isExpiringSoon && item.expiry !== 'N/A' ? 'text-amber-600 font-bold' : '')}>{item.expiry}</p>
                          {isExpiringSoon && item.expiry !== 'N/A' && <p className="text-[10px] text-amber-600"><Clock className="size-2.5 inline mr-0.5" />Expiring soon</p>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Truck className="size-3" />{item.supplier}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{item.location}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedItem(item); setModalMode('restock'); }} className="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center hover:scale-110 transition-transform" title="Restock">
                              <RefreshCw className="size-3.5" />
                            </button>
                            <button onClick={() => { setSelectedItem(item); setModalMode('edit'); }} className="size-7 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center hover:scale-110 transition-transform" title="Edit">
                              <Edit2 className="size-3.5" />
                            </button>
                            <button onClick={() => deleteItem(item.id)} className="size-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center hover:scale-110 transition-transform" title="Delete">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-16 text-muted-foreground">
                    <PackageOpen className="size-10 mx-auto mb-2 opacity-20" />
                    <p className="font-medium">No items found</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Modal */}
      {modalMode && (
        <ItemModal mode={modalMode} item={selectedItem || undefined} onClose={() => { setModalMode(null); setSelectedItem(null); }} onSave={saveItem} />
      )}
    </motion.div>
  );
}
