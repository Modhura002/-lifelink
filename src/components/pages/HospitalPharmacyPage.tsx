'use client';

import { motion } from 'framer-motion';
import {
  Pill,
  AlertTriangle,
  Package,
  ClipboardList,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// ── Animation variants ──────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// ── Types ───────────────────────────────────────────────────────────────────
type StockStatus = 'IN_STOCK' | 'LOW' | 'CRITICAL';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minLevel: number;
  expiry: string;
  supplier: string;
  status: StockStatus;
}

interface CriticalItem {
  name: string;
  stock: number;
  unit: string;
  min: number;
  supplier: string;
}

interface DispensingEntry {
  id: number;
  medication: string;
  qty: string;
  patientOrWard: string;
  dispensedBy: string;
  time: string;
}

// ── Static data ─────────────────────────────────────────────────────────────
const CRITICAL_ITEMS: CriticalItem[] = [
  { name: 'Adrenaline 1mg/ml Injection', stock: 12, unit: 'vials', min: 50,  supplier: 'Sun Pharma' },
  { name: 'Atropine 0.6mg Injection',    stock: 8,  unit: 'vials', min: 30,  supplier: 'Cipla'      },
  { name: 'Dopamine 200mg/5ml',          stock: 6,  unit: 'vials', min: 20,  supplier: 'Abbott'     },
];

const INVENTORY: InventoryItem[] = [
  { id: 1,  name: 'Morphine 10mg/ml',          category: 'Analgesic',       stock: 45,  unit: 'ampoules', minLevel: 30,  expiry: 'Dec 2026', supplier: 'Sun Pharma',  status: 'IN_STOCK' },
  { id: 2,  name: 'Midazolam 5mg/ml',          category: 'Sedative',        stock: 28,  unit: 'vials',    minLevel: 20,  expiry: 'Sep 2026', supplier: 'Cipla',       status: 'IN_STOCK' },
  { id: 3,  name: 'Propofol 10mg/ml',          category: 'Anaesthetic',     stock: 18,  unit: 'vials',    minLevel: 25,  expiry: 'Jun 2026', supplier: 'Abbott',      status: 'LOW'      },
  { id: 4,  name: 'Normal Saline 500ml',        category: 'IV Fluid',        stock: 320, unit: 'bags',     minLevel: 100, expiry: 'Mar 2027', supplier: 'Baxter',      status: 'IN_STOCK' },
  { id: 5,  name: "Ringer's Lactate 500ml",    category: 'IV Fluid',        stock: 210, unit: 'bags',     minLevel: 80,  expiry: 'Mar 2027', supplier: 'Baxter',      status: 'IN_STOCK' },
  { id: 6,  name: 'Blood Glucose Strips',       category: 'Diagnostics',     stock: 850, unit: 'strips',   minLevel: 500, expiry: 'Nov 2026', supplier: 'Roche',       status: 'IN_STOCK' },
  { id: 7,  name: 'Nitroglycerin 0.4mg Patch',  category: 'Cardiac',         stock: 65,  unit: 'patches',  minLevel: 40,  expiry: 'Aug 2026', supplier: 'Sun Pharma',  status: 'IN_STOCK' },
  { id: 8,  name: 'Heparin 5000IU/ml',          category: 'Anticoagulant',   stock: 34,  unit: 'vials',    minLevel: 30,  expiry: 'Oct 2026', supplier: 'Pfizer',      status: 'IN_STOCK' },
  { id: 9,  name: 'Warfarin 5mg Tablets',       category: 'Anticoagulant',   stock: 180, unit: 'tablets',  minLevel: 100, expiry: 'Jan 2027', supplier: 'Cipla',       status: 'IN_STOCK' },
  { id: 10, name: 'Paracetamol IV 1g/100ml',    category: 'Analgesic',       stock: 22,  unit: 'bottles',  minLevel: 40,  expiry: 'Jul 2026', supplier: 'Fresenius',   status: 'LOW'      },
  { id: 11, name: 'Amoxicillin 500mg',          category: 'Antibiotic',      stock: 540, unit: 'capsules', minLevel: 200, expiry: 'Feb 2027', supplier: 'Alkem',       status: 'IN_STOCK' },
  { id: 12, name: 'Metronidazole IV 500mg',     category: 'Antibiotic',      stock: 48,  unit: 'bottles',  minLevel: 30,  expiry: 'May 2026', supplier: 'Abbott',      status: 'IN_STOCK' },
  { id: 13, name: 'Dexamethasone 8mg/2ml',      category: 'Corticosteroid',  stock: 14,  unit: 'ampoules', minLevel: 25,  expiry: 'Sep 2026', supplier: 'Cipla',       status: 'LOW'      },
  { id: 14, name: 'Fentanyl 25mcg/hr Patch',    category: 'Analgesic',       stock: 32,  unit: 'patches',  minLevel: 20,  expiry: 'Dec 2026', supplier: 'Janssen',     status: 'IN_STOCK' },
  { id: 15, name: 'Cefazolin 1g Injection',     category: 'Antibiotic',      stock: 17,  unit: 'vials',    minLevel: 30,  expiry: 'Oct 2026', supplier: 'Sun Pharma',  status: 'LOW'      },
  { id: 16, name: 'Ondansetron 4mg/2ml',        category: 'Antiemetic',      stock: 120, unit: 'ampoules', minLevel: 60,  expiry: 'Jan 2027', supplier: 'Cipla',       status: 'IN_STOCK' },
  { id: 17, name: 'Furosemide 20mg/2ml',        category: 'Diuretic',        stock: 88,  unit: 'ampoules', minLevel: 50,  expiry: 'Nov 2026', supplier: 'Alkem',       status: 'IN_STOCK' },
  { id: 18, name: 'Insulin Regular 100IU/ml',   category: 'Hormone',         stock: 11,  unit: 'vials',    minLevel: 20,  expiry: 'Jun 2026', supplier: 'Novo Nordisk',status: 'LOW'      },
  { id: 19, name: 'Oxytocin 10IU/ml',           category: 'Obstetric',       stock: 62,  unit: 'ampoules', minLevel: 30,  expiry: 'Aug 2026', supplier: 'Sun Pharma',  status: 'IN_STOCK' },
  { id: 20, name: 'Epinephrine Auto-injector',  category: 'Emergency',       stock: 9,   unit: 'devices',  minLevel: 15,  expiry: 'Apr 2026', supplier: 'Mylan',       status: 'LOW'      },
];

const DISPENSING_LOG: DispensingEntry[] = [
  { id: 1,  medication: 'Morphine 10mg/ml',       qty: '2 ampoules', patientOrWard: 'ICU-01',        dispensedBy: 'Pharm. R. Kaur',  time: '14:32' },
  { id: 2,  medication: 'Normal Saline 500ml',    qty: '4 bags',     patientOrWard: 'Ward A (Bulk)', dispensedBy: 'Pharm. S. Nair',  time: '14:18' },
  { id: 3,  medication: 'Ondansetron 4mg/2ml',    qty: '1 ampoule',  patientOrWard: 'PT-20389',      dispensedBy: 'Pharm. R. Kaur',  time: '14:05' },
  { id: 4,  medication: 'Heparin 5000IU/ml',      qty: '1 vial',     patientOrWard: 'PT-20401',      dispensedBy: 'Pharm. M. Das',   time: '13:51' },
  { id: 5,  medication: 'Amoxicillin 500mg',      qty: '21 capsules',patientOrWard: 'OPD Disp.',     dispensedBy: 'Pharm. S. Nair',  time: '13:44' },
  { id: 6,  medication: 'Paracetamol IV 1g/100ml',qty: '3 bottles',  patientOrWard: 'Emergency',     dispensedBy: 'Pharm. A. Bose',  time: '13:30' },
  { id: 7,  medication: 'Furosemide 20mg/2ml',    qty: '2 ampoules', patientOrWard: 'PT-20355',      dispensedBy: 'Pharm. M. Das',   time: '13:11' },
  { id: 8,  medication: 'Dexamethasone 8mg/2ml',  qty: '1 ampoule',  patientOrWard: 'PT-20412',      dispensedBy: 'Pharm. R. Kaur',  time: '12:58' },
  { id: 9,  medication: 'Midazolam 5mg/ml',       qty: '2 vials',    patientOrWard: 'OT-3',          dispensedBy: 'Pharm. A. Bose',  time: '12:40' },
  { id: 10, medication: 'Warfarin 5mg Tablets',   qty: '30 tablets', patientOrWard: 'OPD Disp.',     dispensedBy: 'Pharm. S. Nair',  time: '12:22' },
];

const STATS = [
  { label: 'Total SKUs',        value: '847',  icon: Package,     color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',           border: 'border-l-sky-500'     },
  { label: 'Critical Low',      value: '3',    icon: XCircle,     color: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',            border: 'border-l-red-500'     },
  { label: 'Low Stock',         value: '8',    icon: AlertCircle, color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400', border: 'border-l-orange-500'  },
  { label: "Today's Dispensed", value: '342',  icon: TrendingDown,color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', border: 'border-l-emerald-500' },
];

function StatusIcon({ status }: { status: StockStatus }) {
  if (status === 'IN_STOCK') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (status === 'LOW')      return <AlertCircle  className="h-4 w-4 text-orange-500" />;
  return                            <XCircle      className="h-4 w-4 text-red-500"    />;
}

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === 'IN_STOCK') {
    return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]">IN STOCK</Badge>;
  }
  if (status === 'LOW') {
    return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-0 text-[10px]">LOW</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px]">CRITICAL</Badge>;
}

export default function HospitalPharmacyPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pharmacy &amp; Inventory</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Critical stock monitoring · 847 SKUs tracked
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alert banner */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/40 shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            3 items critically low · 8 items low stock · Action required
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400"
          >
            View All Alerts
          </Button>
        </div>
      </motion.div>

      {/* Stats cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            whileHover={{ scale: 1.04, rotateX: -3, rotateY: 3 }}
            style={{ perspective: 800, transformStyle: 'preserve-3d' }}
          >
            <Card className={`shadow-sm hover:shadow-lg transition-shadow border-l-4 ${stat.border}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Critical items */}
      <motion.div variants={fadeUp}>
        <Card className="border-red-200 dark:border-red-900/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Critical Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50/60 dark:bg-red-950/20 border-y border-red-100 dark:border-red-900/40">
                    <th className="text-left text-xs font-medium text-red-700 dark:text-red-400 px-4 py-2.5">Item Name</th>
                    <th className="text-left text-xs font-medium text-red-700 dark:text-red-400 px-4 py-2.5">Current Stock</th>
                    <th className="text-left text-xs font-medium text-red-700 dark:text-red-400 px-4 py-2.5">Min Level</th>
                    <th className="text-left text-xs font-medium text-red-700 dark:text-red-400 px-4 py-2.5">Status</th>
                    <th className="text-left text-xs font-medium text-red-700 dark:text-red-400 px-4 py-2.5">Supplier</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {CRITICAL_ITEMS.map((item) => (
                    <tr key={item.name} className="border-b border-red-100/60 dark:border-red-900/20 hover:bg-red-50/40 dark:hover:bg-red-950/10">
                      <td className="px-4 py-3 font-medium text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-red-600 dark:text-red-400 font-semibold">{item.stock} {item.unit}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{item.min} {item.unit}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px]">CRITICAL</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{item.supplier}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="h-7 text-[11px] border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main inventory table */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Full Inventory ({INVENTORY.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-background">
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Item Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Category</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Stock</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Unit</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Min</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Expiry</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Supplier</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {INVENTORY.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b hover:bg-muted/30 transition-colors ${
                        item.status === 'CRITICAL' ? 'bg-red-50/30 dark:bg-red-950/10' :
                        item.status === 'LOW'      ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <StatusIcon status={item.status} />
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{item.category}</td>
                      <td className={`px-4 py-2.5 font-semibold ${
                        item.status === 'CRITICAL' ? 'text-red-600 dark:text-red-400' :
                        item.status === 'LOW'      ? 'text-orange-600 dark:text-orange-400' :
                        'text-emerald-600 dark:text-emerald-400'
                      }`}>{item.stock}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.unit}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{item.minLevel}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{item.expiry}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{item.supplier}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dispensing log */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              Dispensing Log — Last 10 Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Medication</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Qty</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Patient / Ward</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Dispensed By</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {DISPENSING_LOG.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2.5 font-medium whitespace-nowrap">{entry.medication}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{entry.qty}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted-foreground">{entry.patientOrWard}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{entry.dispensedBy}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="outline" className="text-[10px] font-mono">{entry.time}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
