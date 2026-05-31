'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Route,
  Star,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  Ambulance,
  Activity,
  Users,
  BadgePercent,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ─────────────────────────────────────────
   Animation variants
───────────────────────────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
type TripStatus = 'COMPLETED' | 'CANCELLED';
type Severity  = 1 | 2 | 3 | 4 | 5;

interface Trip {
  id: string;
  tripNum: string;
  patient: string;
  pickup: string;
  hospital: string;
  km: number;
  duration: string;
  fare: number;
  severity: Severity;
  type: 'Emergency' | 'Transfer';
  status: TripStatus;
  timeAgo: string;
}

/* ─────────────────────────────────────────
   Static trip data
───────────────────────────────────────── */
const TRIPS: Trip[] = [
  { id: 't-001', tripNum: 'ER-A3F2K1', patient: 'Aanya Sharma',    pickup: 'Lajpat Nagar, New Delhi',        hospital: 'AIIMS Delhi',              km: 6.2,  duration: '18 min', fare: 580, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: '2 hours ago'   },
  { id: 't-002', tripNum: 'ER-B8J4M2', patient: 'Rohan Mehta',     pickup: 'Connaught Place, New Delhi',      hospital: 'Fortis Healthcare',         km: 4.8,  duration: '14 min', fare: 440, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: '4 hours ago'   },
  { id: 't-003', tripNum: 'ER-C1P7N3', patient: 'Priya Patel',     pickup: 'Saket, New Delhi',               hospital: 'Max Super Speciality',      km: 3.4,  duration: '11 min', fare: 320, severity: 2, type: 'Emergency', status: 'COMPLETED', timeAgo: '6 hours ago'   },
  { id: 't-004', tripNum: 'ER-D5Q2R4', patient: 'Vikram Singh',    pickup: 'Dwarka Sector 12, New Delhi',    hospital: 'Apollo Hospitals',          km: 8.9,  duration: '24 min', fare: 620, severity: 5, type: 'Emergency', status: 'COMPLETED', timeAgo: '8 hours ago'   },
  { id: 't-005', tripNum: 'ER-E9T6S5', patient: 'Sunita Verma',    pickup: 'Pitampura, New Delhi',           hospital: 'AIIMS Delhi',              km: 11.3, duration: '31 min', fare: 590, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: 'Yesterday'     },
  { id: 't-006', tripNum: 'ER-F2W8U6', patient: 'Arjun Kapoor',    pickup: 'Rohini Sector 8, New Delhi',     hospital: 'Fortis Healthcare',         km: 5.7,  duration: '17 min', fare: 480, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: 'Yesterday'     },
  { id: 't-007', tripNum: 'ER-G6X1V7', patient: 'Meera Nair',      pickup: 'Vasant Kunj, New Delhi',         hospital: 'Max Super Speciality',      km: 4.1,  duration: '13 min', fare: 380, severity: 2, type: 'Transfer',  status: 'COMPLETED', timeAgo: 'Yesterday'     },
  { id: 't-008', tripNum: 'ER-H4Y3W8', patient: 'Karan Malhotra',  pickup: 'Karol Bagh, New Delhi',          hospital: 'Apollo Hospitals',          km: 7.6,  duration: '22 min', fare: 540, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: '2 days ago'    },
  { id: 't-009', tripNum: 'ER-I7Z5X9', patient: 'Deepa Iyer',      pickup: 'Greater Kailash I, New Delhi',   hospital: 'AIIMS Delhi',              km: 3.8,  duration: '12 min', fare: 360, severity: 3, type: 'Emergency', status: 'CANCELLED', timeAgo: '2 days ago'    },
  { id: 't-010', tripNum: 'ER-J1A7Y0', patient: 'Rahul Gupta',     pickup: 'Shahdara, New Delhi',            hospital: 'Fortis Healthcare',         km: 9.4,  duration: '27 min', fare: 560, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: '2 days ago'    },
  { id: 't-011', tripNum: 'ER-K3B9Z1', patient: 'Anjali Sharma',   pickup: 'Mayur Vihar Phase 1, New Delhi', hospital: 'Max Super Speciality',      km: 6.8,  duration: '20 min', fare: 500, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: '3 days ago'    },
  { id: 't-012', tripNum: 'ER-L5C2A2', patient: 'Suresh Pillai',   pickup: 'Janakpuri, New Delhi',           hospital: 'Apollo Hospitals',          km: 5.2,  duration: '16 min', fare: 430, severity: 2, type: 'Transfer',  status: 'COMPLETED', timeAgo: '3 days ago'    },
  { id: 't-013', tripNum: 'ER-M8D4B3', patient: 'Nisha Rajput',    pickup: 'Uttam Nagar, New Delhi',         hospital: 'AIIMS Delhi',              km: 10.1, duration: '29 min', fare: 600, severity: 5, type: 'Emergency', status: 'COMPLETED', timeAgo: '3 days ago'    },
  { id: 't-014', tripNum: 'ER-N2E6C4', patient: 'Aditya Khanna',   pickup: 'Patel Nagar, New Delhi',         hospital: 'Fortis Healthcare',         km: 4.5,  duration: '14 min', fare: 390, severity: 3, type: 'Emergency', status: 'CANCELLED', timeAgo: '4 days ago'    },
  { id: 't-015', tripNum: 'ER-O6F8D5', patient: 'Pooja Mishra',    pickup: 'Tilak Nagar, New Delhi',         hospital: 'Max Super Speciality',      km: 7.3,  duration: '21 min', fare: 520, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: '4 days ago'    },
  { id: 't-016', tripNum: 'ER-P9G1E6', patient: 'Ravi Shankar',    pickup: 'Rajouri Garden, New Delhi',      hospital: 'Apollo Hospitals',          km: 3.1,  duration: '10 min', fare: 280, severity: 2, type: 'Transfer',  status: 'COMPLETED', timeAgo: '5 days ago'    },
  { id: 't-017', tripNum: 'ER-Q3H3F7', patient: 'Kavita Joshi',    pickup: 'Patparganj, New Delhi',          hospital: 'AIIMS Delhi',              km: 8.4,  duration: '24 min', fare: 570, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: '5 days ago'    },
  { id: 't-018', tripNum: 'ER-R7I5G8', patient: 'Sudhir Yadav',    pickup: 'Narela, New Delhi',              hospital: 'Fortis Healthcare',         km: 13.2, duration: '37 min', fare: 610, severity: 4, type: 'Emergency', status: 'COMPLETED', timeAgo: '6 days ago'    },
  { id: 't-019', tripNum: 'ER-S1J7H9', patient: 'Rekha Choudhary', pickup: 'Moti Nagar, New Delhi',          hospital: 'Max Super Speciality',      km: 5.9,  duration: '18 min', fare: 460, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: '6 days ago'    },
  { id: 't-020', tripNum: 'ER-T4K9I0', patient: 'Mohit Bhardwaj',  pickup: 'Hauz Khas, New Delhi',           hospital: 'Apollo Hospitals',          km: 6.5,  duration: '19 min', fare: 510, severity: 3, type: 'Emergency', status: 'COMPLETED', timeAgo: '7 days ago'    },
];

const SEVERITY_META: Record<Severity, { label: string; bg: string; color: string }> = {
  1: { label: 'Low',      bg: 'bg-slate-100 dark:bg-slate-800',    color: 'text-slate-700 dark:text-slate-300'  },
  2: { label: 'Minor',    bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-700 dark:text-green-400'  },
  3: { label: 'Moderate', bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-700 dark:text-amber-400'  },
  4: { label: 'Serious',  bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-700 dark:text-orange-400' },
  5: { label: 'Critical', bg: 'bg-red-100 dark:bg-red-900/30',     color: 'text-red-700 dark:text-red-400'     },
};

type FilterTab = 'All' | 'Emergency' | 'Completed' | 'Cancelled';
const FILTER_TABS: FilterTab[] = ['All', 'Emergency', 'Completed', 'Cancelled'];

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function DriverHistoryPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [search, setSearch]       = useState('');

  const filtered = TRIPS.filter((t) => {
    const matchesTab =
      activeTab === 'All'       ? true :
      activeTab === 'Emergency' ? t.type === 'Emergency' :
      activeTab === 'Completed' ? t.status === 'COMPLETED' :
                                  t.status === 'CANCELLED';

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.patient.toLowerCase().includes(q) ||
      t.hospital.toLowerCase().includes(q) ||
      t.tripNum.toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-12">

      {/* ── Page Header ── */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Trip History</h1>
        <p className="text-muted-foreground mt-1 text-sm">All past emergency and transfer assignments</p>
      </motion.div>

      {/* ── Top Stats ── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <Route className="h-4 w-4" />,       label: 'Total Trips',    value: '312',    sub: 'Since Apr 2024',   iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',        vColor: 'text-sky-600 dark:text-sky-400'     },
          { icon: <Ambulance className="h-4 w-4" />,   label: 'Distance',       value: '4,820 km', sub: 'Total covered',  iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', vColor: 'text-violet-600 dark:text-violet-400' },
          { icon: <BadgePercent className="h-4 w-4" />,label: 'Completion',     value: '98.2%',  sub: '6 cancellations',  iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', vColor: 'text-emerald-600 dark:text-emerald-400' },
          { icon: <Star className="h-4 w-4" />,        label: 'Rating',         value: '4.8 ★',  sub: '298 ratings',      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500',                       vColor: 'text-amber-500'                     },
        ].map((s) => (
          <motion.div
            key={s.label}
            whileHover={{
              scale: 1.04,
              rotateX: -3,
              rotateY: 4,
              z: 20,
              transition: { type: 'spring', stiffness: 400, damping: 22 },
            }}
            style={{ perspective: 900, transformStyle: 'preserve-3d' }}
          >
            <Card className="shadow-sm hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                  {s.icon}
                </div>
                <p className={`text-2xl font-bold tracking-tight mt-3 ${s.vColor}`}>{s.value}</p>
                <p className="text-xs font-semibold mt-0.5">{s.label}</p>
                <p className="text-[11px] text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Filter tabs + Search ── */}
      <motion.div variants={fadeUp} className="space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`gap-1.5 text-xs rounded-full px-4 ${activeTab === tab ? 'shadow-md' : ''}`}
            >
              {tab === 'Emergency'  && <Activity className="h-3 w-3" />}
              {tab === 'Completed'  && <CheckCircle2 className="h-3 w-3" />}
              {tab === 'Cancelled'  && <XCircle className="h-3 w-3" />}
              {tab}
              {tab === 'All' && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-0.5">{TRIPS.length}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, hospital, or trip ID..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> trips
        </p>
      </motion.div>

      {/* ── Trip Cards ── */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-3">
          {filtered.map((trip, idx) => {
            const sev = SEVERITY_META[trip.severity];
            const isCompleted = trip.status === 'COMPLETED';
            return (
              <motion.div
                key={trip.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ delay: idx * 0.03, duration: 0.35 }}
                whileHover={{ y: -2, transition: { duration: 0.18 } }}
              >
                <Card className={`border-l-4 ${isCompleted ? 'border-l-emerald-500' : 'border-l-red-500'} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                      {/* Left: trip number + patient */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${isCompleted ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          {trip.patient.split(' ').map((n) => n[0]).join('')}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{trip.patient}</span>
                            <Badge className={`${sev.bg} ${sev.color} border-0 text-[9px] font-bold px-1.5`}>
                              SEV {trip.severity} · {sev.label}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] px-1.5">
                              {trip.type}
                            </Badge>
                          </div>

                          {/* Route */}
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground min-w-0">
                            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{trip.pickup}</span>
                            <ChevronRight className="h-3 w-3 shrink-0" />
                            <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                            <span className="truncate max-w-[140px] font-medium text-foreground">{trip.hospital}</span>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-0.5">
                              <Route className="h-3 w-3" />
                              <span>{trip.km} km</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{trip.duration}</span>
                            </div>
                            <span className="font-mono text-[10px]">{trip.tripNum}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: fare + status + time */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:gap-1 shrink-0">
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{trip.fare}
                        </p>
                        {isCompleted ? (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px] gap-0.5">
                            <XCircle className="h-2.5 w-2.5" />
                            Cancelled
                          </Badge>
                        )}
                        <p className="text-[10px] text-muted-foreground">{trip.timeAgo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <motion.div variants={fadeUp} className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-muted-foreground text-sm">No trips found for this filter.</p>
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => { setActiveTab('All'); setSearch(''); }}>
            Clear filters
          </Button>
        </motion.div>
      )}

      {/* ── Load More ── */}
      {filtered.length > 0 && (
        <motion.div variants={fadeUp} className="flex justify-center pt-2">
          <Button variant="outline" className="gap-2 text-sm px-8">
            <Filter className="h-4 w-4" />
            Load More Trips
          </Button>
        </motion.div>
      )}

    </motion.div>
  );
}
