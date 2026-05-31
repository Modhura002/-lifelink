'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileHeart,
  Heart,
  Pill,
  Bug,
  AlertTriangle,
  FileText,
  FlaskConical,
  Scan,
  Download,
  Eye,
  Upload,
  Plus,
  X,
  Ruler,
  Weight,
  Activity,
  Stethoscope,
  ClipboardList,
  Share2,
  Clock,
  CalendarCheck,
  Sun,
  Moon,
  CloudSun,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

import { BLOOD_GROUP_LABELS } from '@/lib/constants';
import type { MedicalRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

// Mock documents
const MOCK_DOCUMENTS: MedicalRecord[] = [];

const DOC_ICONS: Record<string, typeof FileText> = {
  PRESCRIPTION: ClipboardList,
  LAB_REPORT: FlaskConical,
  SCAN: Scan,
  DISCHARGE_SUMMARY: FileText,
};

const DOC_TYPE_LABELS: Record<string, string> = {
  PRESCRIPTION: 'PDF',
  LAB_REPORT: 'Lab Report',
  SCAN: 'Image',
  DISCHARGE_SUMMARY: 'PDF',
};

const DOC_COLORS: Record<string, string> = {
  PRESCRIPTION: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
  LAB_REPORT: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  SCAN: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400',
  DISCHARGE_SUMMARY: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const DOC_FILE_SIZES: Record<string, string> = {
  'doc-1': '2.4 MB',
  'doc-2': '156 KB',
  'doc-3': '8.1 MB',
  'doc-4': '1.8 MB',
  'doc-5': '420 KB',
};

const MED_BORDER_COLORS: Record<string, string> = {
  'Metformin 500mg': 'border-l-emerald-500',
  'Lisinopril 10mg': 'border-l-amber-500',
  'Aspirin 75mg': 'border-l-violet-500',
};

const ALLERGY_SEVERITY: Record<string, { color: string; border: string; label: string }> = {
  Severe: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    border: 'border-l-red-500',
    label: 'SEVERE',
  },
  Moderate: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    border: 'border-l-orange-500',
    label: 'MODERATE',
  },
  Mild: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    border: 'border-l-amber-500',
    label: 'MILD',
  },
};

// Mock timeline visits
const RECENT_VISITS: any[] = [];

const UPCOMING_APPOINTMENTS: any[] = [];

// Mock extended medications
const MEDICATIONS: any[] = [];

function HealthScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const strokeColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="130" height="130" className="-rotate-90">
        <circle cx="65" cy="65" r={radius} fill="none" strokeWidth="10" className="stroke-muted/30" />
        <motion.circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke={strokeColor}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Health Score</span>
      </div>
    </div>
  );
}

function TimeOfDayIcon({ time }: { time: 'morning' | 'afternoon' | 'night' }) {
  if (time === 'morning') return <Sun className="h-3.5 w-3.5 text-amber-500" />;
  if (time === 'afternoon') return <CloudSun className="h-3.5 w-3.5 text-orange-500" />;
  return <Moon className="h-3.5 w-3.5 text-violet-500" />;
}

export default function MedicalRecordsPage() {
  const patient = { bloodGroup: 'O+', chronicConditions: [] };
  const [docFilter, setDocFilter] = useState<string>('all');
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const { toast } = useToast();

  const filteredDocs = docFilter === 'all'
    ? MOCK_DOCUMENTS
    : MOCK_DOCUMENTS.filter((d) => d.type === docFilter);

  const bmi = (72 / (1.75 * 1.75)).toFixed(1);

  const allergyData: any[] = [];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Medical Records</h1>
        <p className="text-muted-foreground mt-1">Manage your health information</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm gap-1.5">
              <Stethoscope className="h-4 w-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm gap-1.5">
              <FileText className="h-4 w-4 hidden sm:block" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="medications" className="text-xs sm:text-sm gap-1.5">
              <Pill className="h-4 w-4 hidden sm:block" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="allergies" className="text-xs sm:text-sm gap-1.5">
              <Bug className="h-4 w-4 hidden sm:block" />
              Allergies
            </TabsTrigger>
          </TabsList>

          {/* ========================================= */}
          {/* OVERVIEW TAB                              */}
          {/* ========================================= */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Health Score Ring */}
              <motion.div variants={fadeUp}>
                <Card className="card-hover">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <HealthScoreRing score={78} />
                    <div className="mt-3 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">+3 from last checkup</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Based on latest vitals &amp; lab results</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats Grid */}
              <motion.div variants={fadeUp}>
                <Card className="card-hover h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Vitals Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Blood Pressure</p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">120/80</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Normal</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                        <p className="text-lg font-bold text-rose-600 dark:text-rose-400">72 bpm</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Normal</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Blood Sugar</p>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">142 mg/dL</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Slightly High</p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                        <p className="text-xs text-muted-foreground mb-1">BMI</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{bmi}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">Normal</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">175 cm</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">72 kg</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          {BLOOD_GROUP_LABELS[patient.bloodGroup || 'O_POS']}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Visits Timeline */}
              <motion.div variants={fadeUp}>
                <Card className="card-hover h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      Recent Visits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      {RECENT_VISITS.map((visit, i) => (
                        <div key={visit.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1" />
                            {i < RECENT_VISITS.length - 1 && (
                              <div className="w-px flex-1 bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-3">
                            <p className="text-sm font-medium truncate">{visit.title}</p>
                            <p className="text-[11px] text-muted-foreground">{visit.specialty} &middot; {visit.date}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{visit.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5 text-emerald-500" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {UPCOMING_APPOINTMENTS.map((apt) => (
                      <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                          <CalendarCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">{apt.doctor}</p>
                          <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium">{apt.date}</p>
                          <p className="text-xs text-muted-foreground">{apt.time}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chronic Conditions */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Chronic Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.length > 0 ? (
                      patient.chronicConditions.map((c) => (
                        <Badge key={c} variant="outline" className="text-sm py-1 px-3">
                          <Heart className="h-3 w-3 mr-1 text-red-500" />
                          {c}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No chronic conditions recorded</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Notes */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileHeart className="h-5 w-5 text-red-500" />
                    Emergency Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Patient has Type 2 Diabetes and Hypertension — monitor blood sugar levels</p>
                    <p>• Severe allergy to Penicillin — avoid all penicillin-class antibiotics</p>
                    <p>• Currently on Metformin 500mg and Lisinopril 10mg</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ========================================= */}
          {/* DOCUMENTS TAB                             */}
          {/* ========================================= */}
          <TabsContent value="documents" className="space-y-4">
            {/* Drag-and-drop Upload Zone */}
            <motion.div variants={fadeUp} initial="hidden" animate="show">
              <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group bg-muted/20">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-7 w-7 text-primary" />
                </div>
                <p className="text-sm font-medium">Drag &amp; drop files here</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => toast({ title: 'Browse Files', description: 'Opening file picker...' })}>
                  Browse Files
                </Button>
              </div>
            </motion.div>

            {/* Filter */}
            <div className="flex items-center gap-3">
              <Select value={docFilter} onValueChange={setDocFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="PRESCRIPTION">Prescriptions</SelectItem>
                  <SelectItem value="LAB_REPORT">Lab Reports</SelectItem>
                  <SelectItem value="SCAN">Scans</SelectItem>
                  <SelectItem value="DISCHARGE_SUMMARY">Discharge Summaries</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{filteredDocs.length} document(s)</p>
            </div>

            {/* Document Cards */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredDocs.map((doc) => {
                const Icon = DOC_ICONS[doc.type] || FileText;
                const color = DOC_COLORS[doc.type] || '';
                const typeLabel = DOC_TYPE_LABELS[doc.type] || 'File';
                const fileSize = DOC_FILE_SIZES[doc.id] || '1.2 MB';

                return (
                  <motion.div key={doc.id} variants={fadeUp}>
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${color} shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground">{doc.date}</span>
                              <span className="text-[10px] text-muted-foreground">•</span>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                {typeLabel}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{fileSize}</span>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => toast({ title: 'Downloading', description: `Downloading ${doc.title}...` })}>
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5" onClick={() => toast({ title: 'Share Document', description: 'Opening share menu...' })}>
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* ========================================= */}
          {/* MEDICATIONS TAB                           */}
          {/* ========================================= */}
          <TabsContent value="medications" className="space-y-4">
            <motion.div variants={stagger} initial="hidden" animate="show">
              {MEDICATIONS.map((med) => {
                const borderColor = MED_BORDER_COLORS[med.name] || 'border-l-primary';
                return (
                  <motion.div key={med.name} variants={fadeUp}>
                    <Card className={`card-hover border-l-4 ${borderColor}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                              <Pill className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{med.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {med.dosage} &middot; {med.frequency}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              med.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px]'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400 border-0 text-[10px]'
                            }
                          >
                            {med.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Stethoscope className="h-3.5 w-3.5" />
                            <span>{med.doctor}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {med.times.map((t) => (
                              <div key={t} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60">
                                <TimeOfDayIcon time={t} />
                                <span className="text-[10px] capitalize text-muted-foreground">{t}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Add Medication Form */}
              <motion.div variants={fadeUp}>
                {showAddMedication ? (
                  <Card className="mt-2 border-l-4 border-l-primary">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Add Medication</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddMedication(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Medication Name</Label>
                          <Input placeholder="e.g., Aspirin 100mg" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Dosage</Label>
                            <Input placeholder="e.g., 500mg" className="mt-1" />
                          </div>
                          <div>
                            <Label className="text-xs">Frequency</Label>
                            <Input placeholder="e.g., Twice daily" className="mt-1" />
                          </div>
                        </div>
                        <Button size="sm" className="w-full" onClick={() => { setShowAddMedication(false); toast({ title: 'Medication Added', description: 'New medication has been saved.' }); }}>Add Medication</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2"
                    onClick={() => setShowAddMedication(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Medication
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ========================================= */}
          {/* ALLERGIES TAB                             */}
          {/* ========================================= */}
          <TabsContent value="allergies" className="space-y-4">
            <motion.div variants={stagger} initial="hidden" animate="show">
              {allergyData.map((allergy) => {
                const sev = ALLERGY_SEVERITY[allergy.severity];
                const isSevere = allergy.severity === 'Severe';
                return (
                  <motion.div key={allergy.name} variants={fadeUp}>
                    <Card className={`card-hover border-l-4 ${sev.border}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-lg ${sev.color} shrink-0`}>
                            {isSevere ? (
                              <ShieldAlert className="h-5 w-5" />
                            ) : (
                              <Bug className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-sm font-semibold">{allergy.name}</p>
                              {isSevere && (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0 text-[10px] gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {sev.label}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Reaction: {allergy.reaction}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Onset: {allergy.onset}
                            </p>
                          </div>
                          <Badge className={`${sev.color} border-0 text-[10px] shrink-0`}>
                            {sev.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {/* Add Allergy Form */}
              <motion.div variants={fadeUp}>
                {showAddAllergy ? (
                  <Card className="mt-2 border-l-4 border-l-primary">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Add Allergy</h3>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAddAllergy(false)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Allergen</Label>
                          <Input placeholder="e.g., Peanuts" className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Severity</Label>
                            <Select>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Mild">Mild</SelectItem>
                                <SelectItem value="Moderate">Moderate</SelectItem>
                                <SelectItem value="Severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Reaction</Label>
                            <Input placeholder="e.g., Rash" className="mt-1" />
                          </div>
                        </div>
                        <Button size="sm" className="w-full" onClick={() => { setShowAddAllergy(false); toast({ title: 'Allergy Added', description: 'New allergy has been saved.' }); }}>Add Allergy</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full mt-2 gap-2"
                    onClick={() => setShowAddAllergy(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Add Allergy
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
