'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  Phone,
  Clock,
  Filter,
  UserCheck,
  Scissors,
  PhoneCall,
  UserX,
  Search,
  Star,
  GraduationCap,
  Award,
  Languages,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Mail,
  Radio,
  Plus,
  X,
  ChevronDown,
  Activity,
  Heart,
  TrendingUp,
  Users,
  BookOpen,
  Shield,
  Zap,
  AlarmClock,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: 'easeOut' as const } },
};
const slideIn = {
  hidden: { opacity: 0, x: 40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

type DoctorStatus = 'On Duty' | 'Off Duty' | 'In Surgery' | 'On Call';

interface Education {
  degree: string;
  institution: string;
  year: number;
}
interface Publication {
  title: string;
  journal: string;
  year: number;
}
interface WeeklyShift {
  day: string;
  shift: string | null;
}
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  subspecialty: string;
  status: DoctorStatus;
  department: string;
  experience: number;
  ext: string;
  email: string;
  pager: string;
  shift: string;
  avatarColor: string;
  rating: number;
  patientsThisMonth: number;
  totalPatients: number;
  successRate: number;
  satisfactionScore: number;
  proceduresDone: number;
  bio: string;
  education: Education[];
  certifications: string[];
  languages: string[];
  awards: string[];
  publications: Publication[];
  weeklySchedule: WeeklyShift[];
  isOnCall: boolean;
  nextAvailable: string;
  roomNo: string;
  joinedYear: number;
}

const DOCTORS: Doctor[] = [
  {
    id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiology', subspecialty: 'Interventional Cardiology',
    status: 'On Duty', department: 'Cardio ICU', experience: 14, ext: '2301', email: 'p.sharma@lifelink.in',
    pager: 'PG-2301', shift: '08:00–20:00', avatarColor: 'bg-rose-500', rating: 4.9,
    patientsThisMonth: 87, totalPatients: 4200, successRate: 97.3, satisfactionScore: 98,
    proceduresDone: 1840, bio: 'Pioneering interventional cardiologist with expertise in complex coronary interventions and structural heart disease. Former fellow at AIIMS Delhi and visiting faculty at Johns Hopkins.',
    education: [
      { degree: 'MBBS', institution: 'AIIMS Delhi', year: 2008 },
      { degree: 'MD (Cardiology)', institution: 'PGIMER Chandigarh', year: 2012 },
      { degree: 'Fellowship (Interventional)', institution: 'Johns Hopkins, USA', year: 2014 },
    ],
    certifications: ['DM Cardiology', 'FACC', 'FSCAI', 'BLS/ACLS Instructor'],
    languages: ['Hindi', 'English', 'Tamil'],
    awards: ['Best Cardiologist Award 2022', 'AIIMS Gold Medal', 'National Heart Foundation Excellence'],
    publications: [
      { title: 'Outcomes of TAVI in High-Risk Patients', journal: 'Indian Heart Journal', year: 2021 },
      { title: 'Novel Approach to CTO Recanalization', journal: 'JACC', year: 2019 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–20:00' }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: null }, { day: 'Thu', shift: '08:00–20:00' },
      { day: 'Fri', shift: '08:00–20:00' }, { day: 'Sat', shift: '10:00–14:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'CCU-04', joinedYear: 2014,
  },
  {
    id: 2, name: 'Dr. Arjun Mehta', specialty: 'Emergency Medicine', subspecialty: 'Trauma & Critical Care',
    status: 'On Duty', department: 'Emergency', experience: 9, ext: '2112', email: 'a.mehta@lifelink.in',
    pager: 'PG-2112', shift: '06:00–18:00', avatarColor: 'bg-orange-500', rating: 4.7,
    patientsThisMonth: 210, totalPatients: 9800, successRate: 94.1, satisfactionScore: 92,
    proceduresDone: 3200, bio: 'High-energy emergency medicine specialist trained in mass casualty management and disaster medicine. Certified ATLS instructor and EMS medical director.',
    education: [
      { degree: 'MBBS', institution: 'Grant Medical College, Mumbai', year: 2013 },
      { degree: 'DNB (Emergency Medicine)', institution: 'ACME Hyderabad', year: 2017 },
    ],
    certifications: ['ATLS Instructor', 'PHTLS', 'FCCS', 'Disaster Medicine Cert.'],
    languages: ['Hindi', 'English', 'Marathi'],
    awards: ['Emergency Physician of the Year 2023', 'Life Saver Award – Lifelink 2022'],
    publications: [
      { title: 'Triage Protocols in Mass Casualty Events', journal: 'Emergency Medicine Journal', year: 2022 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '06:00–18:00' }, { day: 'Tue', shift: '06:00–18:00' },
      { day: 'Wed', shift: '06:00–18:00' }, { day: 'Thu', shift: null },
      { day: 'Fri', shift: '06:00–18:00' }, { day: 'Sat', shift: '06:00–18:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'ER-01', joinedYear: 2017,
  },
  {
    id: 3, name: 'Dr. Sunita Rao', specialty: 'Neurology', subspecialty: 'Neuro-Oncology & Epilepsy',
    status: 'In Surgery', department: 'Neurology Ward', experience: 18, ext: '2445', email: 's.rao@lifelink.in',
    pager: 'PG-2445', shift: '08:00–20:00', avatarColor: 'bg-violet-500', rating: 4.95,
    patientsThisMonth: 63, totalPatients: 5100, successRate: 96.8, satisfactionScore: 99,
    proceduresDone: 980, bio: 'Internationally acclaimed neurologist specialising in epilepsy management and brain tumour care. Published over 30 peer-reviewed papers and recipient of the Padma Shri nomination.',
    education: [
      { degree: 'MBBS', institution: 'Madras Medical College', year: 2004 },
      { degree: 'MD (Neurology)', institution: 'NIMHANS Bangalore', year: 2009 },
      { degree: 'Fellowship (Neuro-Oncology)', institution: 'Mayo Clinic, USA', year: 2011 },
    ],
    certifications: ['DM Neurology', 'AAN Member', 'EEG Certification', 'ABPN Board Certified'],
    languages: ['Tamil', 'English', 'Kannada', 'Hindi'],
    awards: ['Padma Shri Nominee 2023', 'NIMHANS Gold Medal', 'Best Neurologist – South India 2021'],
    publications: [
      { title: 'Drug-Resistant Epilepsy: A Multi-Centre Study', journal: 'Epilepsia', year: 2020 },
      { title: 'Immunotherapy in Glioblastoma', journal: 'Neuro-Oncology', year: 2022 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–20:00' }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: '08:00–20:00' }, { day: 'Thu', shift: '08:00–20:00' },
      { day: 'Fri', shift: null }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Post-surgery ~17:00', roomNo: 'OT-3', joinedYear: 2011,
  },
  {
    id: 4, name: 'Dr. Vikram Singh', specialty: 'Orthopedics', subspecialty: 'Joint Replacement & Sports Medicine',
    status: 'Off Duty', department: 'Ortho Ward', experience: 12, ext: '2330', email: 'v.singh@lifelink.in',
    pager: 'PG-2330', shift: 'Tomorrow 08:00', avatarColor: 'bg-sky-500', rating: 4.8,
    patientsThisMonth: 54, totalPatients: 3300, successRate: 98.1, satisfactionScore: 96,
    proceduresDone: 1450, bio: 'Expert joint replacement surgeon with special interest in minimally invasive techniques and sports injury rehabilitation. Official orthopaedic consultant for the Delhi Premier League.',
    education: [
      { degree: 'MBBS', institution: 'MAMC Delhi', year: 2010 },
      { degree: 'MS (Orthopaedics)', institution: 'AIIMS Delhi', year: 2014 },
      { degree: 'Fellowship (Arthroplasty)', institution: 'Hospital for Special Surgery, NY', year: 2016 },
    ],
    certifications: ['MCh Orthopaedics', 'FRCS (Edinburgh)', 'Sports Medicine Diploma'],
    languages: ['Hindi', 'English', 'Punjabi'],
    awards: ['Young Surgeon Award – IOA 2020', 'Sports Medicine Excellence 2022'],
    publications: [
      { title: 'Outcomes of Robotic-Assisted TKR', journal: 'JBJS', year: 2021 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: null }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: '08:00–20:00' }, { day: 'Thu', shift: '08:00–20:00' },
      { day: 'Fri', shift: '08:00–20:00' }, { day: 'Sat', shift: '10:00–14:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Tomorrow 08:00', roomNo: 'OW-12', joinedYear: 2016,
  },
  {
    id: 5, name: 'Dr. Kavya Nair', specialty: 'Pediatrics', subspecialty: 'Neonatal & Pediatric Intensivist',
    status: 'On Duty', department: 'PICU', experience: 7, ext: '2520', email: 'k.nair@lifelink.in',
    pager: 'PG-2520', shift: '08:00–20:00', avatarColor: 'bg-pink-500', rating: 4.85,
    patientsThisMonth: 72, totalPatients: 2100, successRate: 95.4, satisfactionScore: 97,
    proceduresDone: 640, bio: 'Passionate pediatric intensivist dedicated to improving neonatal outcomes in resource-limited settings. Recipient of the RCPCH fellowship and author of the PICU protocol adopted across 6 hospitals.',
    education: [
      { degree: 'MBBS', institution: 'KMC Manipal', year: 2015 },
      { degree: 'MD (Paediatrics)', institution: 'CMC Vellore', year: 2019 },
      { degree: 'Fellowship (PICU)', institution: 'Great Ormond Street, UK', year: 2021 },
    ],
    certifications: ['IAP Diplomat', 'NRP Instructor', 'PALS', 'RCPCH Fellow'],
    languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    awards: ['Best Young Paediatrician – NNF 2023', 'RCPCH Innovation Award 2021'],
    publications: [
      { title: 'PICU Outcomes in Tier-2 Cities', journal: 'Archives of Disease in Childhood', year: 2022 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–20:00' }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: null }, { day: 'Thu', shift: '08:00–20:00' },
      { day: 'Fri', shift: '08:00–20:00' }, { day: 'Sat', shift: '08:00–14:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'PICU-02', joinedYear: 2021,
  },
  {
    id: 6, name: 'Dr. Rajan Patel', specialty: 'General Surgery', subspecialty: 'Laparoscopic & GI Surgery',
    status: 'In Surgery', department: 'OT Complex', experience: 22, ext: '2100', email: 'r.patel@lifelink.in',
    pager: 'PG-2100', shift: '07:00–19:00', avatarColor: 'bg-indigo-500', rating: 4.92,
    patientsThisMonth: 48, totalPatients: 7600, successRate: 99.1, satisfactionScore: 98,
    proceduresDone: 5200, bio: 'Master laparoscopic surgeon with over 5000 minimally-invasive procedures. Pioneer in robotic-assisted colorectal surgery in India. Department Head and Professor of Surgery.',
    education: [
      { degree: 'MBBS', institution: 'BJ Medical College, Ahmedabad', year: 2000 },
      { degree: 'MS (General Surgery)', institution: 'AIIMS Delhi', year: 2004 },
      { degree: 'MCh (GI Surgery)', institution: 'SGPGIMS Lucknow', year: 2007 },
      { degree: 'Fellowship (Robotic Surgery)', institution: 'Cleveland Clinic, USA', year: 2009 },
    ],
    certifications: ['FRCS', 'FICS', 'FIAGES', 'Robotic Surgery Certified – da Vinci'],
    languages: ['Gujarati', 'Hindi', 'English'],
    awards: ['IAGES President 2023', 'Association of Surgeons Gold Medal', 'Lifetime Achievement – ICS 2024'],
    publications: [
      { title: 'Robotic Colectomy – 500 Case Series', journal: 'Annals of Surgery', year: 2020 },
      { title: 'Single-Port Laparoscopy: Technique and Outcomes', journal: 'Surgical Endoscopy', year: 2018 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '07:00–19:00' }, { day: 'Tue', shift: '07:00–19:00' },
      { day: 'Wed', shift: '07:00–19:00' }, { day: 'Thu', shift: '07:00–19:00' },
      { day: 'Fri', shift: '07:00–15:00' }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Post-surgery ~16:30', roomNo: 'OT-1', joinedYear: 2009,
  },
  {
    id: 7, name: 'Dr. Meera Iyer', specialty: 'Radiology', subspecialty: 'Interventional & Neuro-Radiology',
    status: 'On Duty', department: 'Radiology', experience: 11, ext: '2680', email: 'm.iyer@lifelink.in',
    pager: 'PG-2680', shift: '09:00–21:00', avatarColor: 'bg-teal-500', rating: 4.75,
    patientsThisMonth: 130, totalPatients: 4900, successRate: 96.5, satisfactionScore: 94,
    proceduresDone: 2100, bio: 'Dual-trained interventional and neuro-radiologist. Expert in CT/MRI-guided biopsies, embolisation procedures and advanced neuroimaging. AI radiology research lead at Lifelink.',
    education: [
      { degree: 'MBBS', institution: 'Coimbatore Medical College', year: 2011 },
      { degree: 'MD (Radiodiagnosis)', institution: 'AIIMS Delhi', year: 2015 },
      { degree: 'Fellowship (Interventional Radiology)', institution: 'Karolinska, Sweden', year: 2017 },
    ],
    certifications: ['FRCR', 'EDIR', 'ACR Member', 'CBNC Certified'],
    languages: ['Tamil', 'English', 'Hindi', 'Swedish (basic)'],
    awards: ['IRIA Young Scientist Award 2021', 'Best Research Paper – RSNA 2020'],
    publications: [
      { title: 'AI-Assisted Lung Nodule Detection', journal: 'Radiology', year: 2022 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '09:00–21:00' }, { day: 'Tue', shift: null },
      { day: 'Wed', shift: '09:00–21:00' }, { day: 'Thu', shift: '09:00–21:00' },
      { day: 'Fri', shift: '09:00–21:00' }, { day: 'Sat', shift: '10:00–16:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'RAD-B1', joinedYear: 2017,
  },
  {
    id: 8, name: 'Dr. Ankit Sharma', specialty: 'Anesthesiology', subspecialty: 'Cardiac & Neuro-Anesthesia',
    status: 'In Surgery', department: 'OT Support', experience: 8, ext: '2190', email: 'an.sharma@lifelink.in',
    pager: 'PG-2190', shift: '07:00–19:00', avatarColor: 'bg-amber-500', rating: 4.7,
    patientsThisMonth: 91, totalPatients: 3100, successRate: 99.6, satisfactionScore: 93,
    proceduresDone: 3900, bio: "Specialised anaesthesiologist for complex cardiac and neurosurgical cases. TEE-certified and expert in total intravenous anaesthesia (TIVA). Co-authored the hospital's pain management protocol.",
    education: [
      { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: 2014 },
      { degree: 'MD (Anaesthesiology)', institution: 'PGIMER Chandigarh', year: 2018 },
    ],
    certifications: ['DA (RCP London)', 'TEE Certification', 'EDRA', 'Pain Management Diploma'],
    languages: ['Hindi', 'English'],
    awards: ['Best Anaesthesiologist – Lifelink 2023', 'Young Faculty Award – ISA 2022'],
    publications: [
      { title: 'TIVA vs Inhalational Anesthesia in Cardiac Surgery', journal: 'BJA', year: 2021 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '07:00–19:00' }, { day: 'Tue', shift: '07:00–19:00' },
      { day: 'Wed', shift: '07:00–19:00' }, { day: 'Thu', shift: '07:00–19:00' },
      { day: 'Fri', shift: '07:00–15:00' }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Post-surgery ~17:00', roomNo: 'OT-Support', joinedYear: 2018,
  },
  {
    id: 9, name: 'Dr. Deepa Krishnan', specialty: 'Gynecology', subspecialty: 'Maternal-Fetal Medicine & Laparoscopy',
    status: 'Off Duty', department: 'Gynae Ward', experience: 16, ext: '2410', email: 'd.krishnan@lifelink.in',
    pager: 'PG-2410', shift: 'Tomorrow 06:00', avatarColor: 'bg-fuchsia-500', rating: 4.88,
    patientsThisMonth: 58, totalPatients: 4600, successRate: 97.9, satisfactionScore: 97,
    proceduresDone: 2800, bio: 'High-risk obstetrician and advanced laparoscopic surgeon. Expert in managing complex pregnancies, PCOS, and uterine anomalies. State-level trainer for obstetric emergency protocols.',
    education: [
      { degree: 'MBBS', institution: 'Trivandrum Medical College', year: 2006 },
      { degree: 'MS (Obs & Gynae)', institution: 'CMC Vellore', year: 2011 },
      { degree: 'Fellowship (MFM)', institution: "King's College London", year: 2013 },
    ],
    certifications: ['FRCOG', 'MRCOG', 'Advanced Laparoscopy Cert.', 'Fetal Medicine Foundation Cert.'],
    languages: ['Malayalam', 'Tamil', 'English', 'Hindi'],
    awards: ['FOGSI National Award 2022', "King's Alumni Excellence 2021"],
    publications: [
      { title: 'Cerclage Outcomes in Cervical Incompetence', journal: 'BJOG', year: 2020 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '06:00–18:00' }, { day: 'Tue', shift: null },
      { day: 'Wed', shift: '06:00–18:00' }, { day: 'Thu', shift: '06:00–18:00' },
      { day: 'Fri', shift: '06:00–18:00' }, { day: 'Sat', shift: '08:00–12:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Tomorrow 06:00', roomNo: 'GW-05', joinedYear: 2013,
  },
  {
    id: 10, name: 'Dr. Suresh Kumar', specialty: 'Internal Medicine', subspecialty: 'Diabetes & Endocrinology',
    status: 'On Duty', department: 'General Ward A', experience: 20, ext: '2201', email: 'su.kumar@lifelink.in',
    pager: 'PG-2201', shift: '08:00–20:00', avatarColor: 'bg-emerald-500', rating: 4.82,
    patientsThisMonth: 105, totalPatients: 8200, successRate: 95.7, satisfactionScore: 96,
    proceduresDone: 820, bio: 'Senior internist with two decades of experience managing complex multi-system diseases. Diabetes programme director and WHO-affiliated trainer for diabetes management in primary care.',
    education: [
      { degree: 'MBBS', institution: 'Stanley Medical College, Chennai', year: 2002 },
      { degree: 'MD (Medicine)', institution: 'CMC Vellore', year: 2006 },
      { degree: 'DM (Endocrinology)', institution: 'AIIMS Delhi', year: 2010 },
    ],
    certifications: ['FACP', 'FRCP (Glasgow)', 'Diabetes Educator Cert.', 'CPED'],
    languages: ['Tamil', 'Hindi', 'English', 'Telugu'],
    awards: ['API Fellowship 2022', 'Best Teacher Award – Lifelink 2021', 'WHO Collaborator 2019'],
    publications: [
      { title: 'Insulin Management in ICU Patients – Indian Protocol', journal: 'JAPI', year: 2019 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–20:00' }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: '08:00–20:00' }, { day: 'Thu', shift: '08:00–20:00' },
      { day: 'Fri', shift: '08:00–20:00' }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'GW-A10', joinedYear: 2010,
  },
  {
    id: 11, name: 'Dr. Pooja Agarwal', specialty: 'Dermatology', subspecialty: 'Cosmetic & Laser Dermatology',
    status: 'Off Duty', department: 'OPD Block', experience: 6, ext: '2750', email: 'p.agarwal@lifelink.in',
    pager: 'PG-2750', shift: 'Tomorrow 09:00', avatarColor: 'bg-lime-500', rating: 4.65,
    patientsThisMonth: 78, totalPatients: 1800, successRate: 94.2, satisfactionScore: 95,
    proceduresDone: 1200, bio: 'Dynamic dermatologist combining evidence-based medicine with advanced aesthetic procedures. Expert in laser treatments, chemical peels and managing complex dermatological conditions.',
    education: [
      { degree: 'MBBS', institution: 'Lady Hardinge Medical College', year: 2016 },
      { degree: 'MD (Dermatology)', institution: 'PGIMER Chandigarh', year: 2020 },
    ],
    certifications: ['FRCP (Dermatology)', 'Laser Therapy Cert.', 'Trichology Diploma'],
    languages: ['Hindi', 'English'],
    awards: ['IADVL Young Dermatoligst Award 2023'],
    publications: [],
    weeklySchedule: [
      { day: 'Mon', shift: null }, { day: 'Tue', shift: '09:00–17:00' },
      { day: 'Wed', shift: '09:00–17:00' }, { day: 'Thu', shift: '09:00–17:00' },
      { day: 'Fri', shift: '09:00–17:00' }, { day: 'Sat', shift: '09:00–13:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Tomorrow 09:00', roomNo: 'OPD-D3', joinedYear: 2020,
  },
  {
    id: 12, name: 'Dr. Rahul Gupta', specialty: 'Urology', subspecialty: 'Uro-Oncology & Endourology',
    status: 'On Duty', department: 'Urology', experience: 13, ext: '2360', email: 'r.gupta@lifelink.in',
    pager: 'PG-2360', shift: '10:00–22:00', avatarColor: 'bg-cyan-500', rating: 4.78,
    patientsThisMonth: 61, totalPatients: 3800, successRate: 97.0, satisfactionScore: 95,
    proceduresDone: 2400, bio: 'Uro-oncologist and endourology specialist with extensive experience in robotic prostatectomy, RIRS, PCNL and laparoscopic urology. Trained at Memorial Sloan Kettering, New York.',
    education: [
      { degree: 'MBBS', institution: 'MAMC Delhi', year: 2009 },
      { degree: 'MS (General Surgery)', institution: 'AIIMS Delhi', year: 2013 },
      { degree: 'MCh (Urology)', institution: 'SGPGI Lucknow', year: 2016 },
      { degree: 'Fellowship (Uro-Oncology)', institution: 'MSK Cancer Center, NY', year: 2018 },
    ],
    certifications: ['FRCS (Urol)', 'EBU Certified', 'Robotic Urology – da Vinci', 'AUA Member'],
    languages: ['Hindi', 'English'],
    awards: ['USI Young Urologist 2021', 'Best Paper – AUA Annual Meeting 2020'],
    publications: [
      { title: 'Robotic Radical Prostatectomy: 300-case Outcomes', journal: 'European Urology', year: 2021 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '10:00–22:00' }, { day: 'Tue', shift: '10:00–22:00' },
      { day: 'Wed', shift: null }, { day: 'Thu', shift: '10:00–22:00' },
      { day: 'Fri', shift: '10:00–22:00' }, { day: 'Sat', shift: '10:00–16:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'URO-07', joinedYear: 2018,
  },
  {
    id: 13, name: 'Dr. Nisha Verma', specialty: 'Psychiatry', subspecialty: 'Child & Adolescent Psychiatry',
    status: 'Off Duty', department: 'Psych Ward', experience: 9, ext: '2830', email: 'n.verma@lifelink.in',
    pager: 'PG-2830', shift: 'Tomorrow 09:00', avatarColor: 'bg-purple-500', rating: 4.83,
    patientsThisMonth: 44, totalPatients: 2200, successRate: 91.8, satisfactionScore: 96,
    proceduresDone: 110, bio: 'Compassionate psychiatrist specialising in paediatric mental health, ADHD, autism spectrum disorders and adolescent depression. Champion of de-stigmatisation campaigns across Delhi NCR.',
    education: [
      { degree: 'MBBS', institution: 'Maulana Azad Medical College', year: 2013 },
      { degree: 'MD (Psychiatry)', institution: 'NIMHANS Bangalore', year: 2017 },
      { degree: 'Fellowship (Child Psychiatry)', institution: 'Maudsley Hospital, London', year: 2019 },
    ],
    certifications: ['MRCPsych', 'CAP Board Certified', 'CBT Level 3', 'DBT Trained'],
    languages: ['Hindi', 'English', 'Urdu'],
    awards: ['WHO Mental Health Champion 2022', 'Maudsley Prize 2018'],
    publications: [
      { title: 'ADHD Misdiagnosis in Indian Schools', journal: 'Lancet Psychiatry', year: 2021 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: null }, { day: 'Tue', shift: '09:00–17:00' },
      { day: 'Wed', shift: '09:00–17:00' }, { day: 'Thu', shift: '09:00–17:00' },
      { day: 'Fri', shift: '09:00–17:00' }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Tomorrow 09:00', roomNo: 'PSY-12', joinedYear: 2019,
  },
  {
    id: 14, name: 'Dr. Aditya Chopra', specialty: 'Gastroenterology', subspecialty: 'Advanced Therapeutic Endoscopy',
    status: 'On Duty', department: 'GI Unit', experience: 15, ext: '2470', email: 'ad.chopra@lifelink.in',
    pager: 'PG-2470', shift: '08:00–20:00', avatarColor: 'bg-red-500', rating: 4.86,
    patientsThisMonth: 68, totalPatients: 4400, successRate: 96.3, satisfactionScore: 95,
    proceduresDone: 3600, bio: "Advanced endoscopist with expertise in EUS, ERCP, and capsule endoscopy. Founder of the hospital's IBD clinic. Internationally trained in Chicago and Singapore.",
    education: [
      { degree: 'MBBS', institution: 'Kasturba Medical College', year: 2007 },
      { degree: 'MD (Medicine)', institution: 'PGIMER Chandigarh', year: 2011 },
      { degree: 'DM (Gastroenterology)', institution: 'AIIMS Delhi', year: 2014 },
      { degree: 'Fellowship (Therapeutic Endoscopy)', institution: 'University of Chicago', year: 2016 },
    ],
    certifications: ['DM Gastroenterology', 'FACG', 'AGA Member', 'EUS Certified'],
    languages: ['Hindi', 'English', 'Punjabi'],
    awards: ['ISGCON Young GI Award 2021', 'Best Teacher – Lifelink 2020'],
    publications: [
      { title: 'EUS-Guided Celiac Plexus Block: Efficacy in Pancreatic Cancer', journal: 'GIE', year: 2019 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–20:00' }, { day: 'Tue', shift: '08:00–20:00' },
      { day: 'Wed', shift: '08:00–20:00' }, { day: 'Thu', shift: null },
      { day: 'Fri', shift: '08:00–20:00' }, { day: 'Sat', shift: '10:00–14:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'GI-03', joinedYear: 2016,
  },
  {
    id: 15, name: 'Dr. Sneha Pillai', specialty: 'Oncology', subspecialty: 'Medical Oncology & Haematology',
    status: 'Off Duty', department: 'Cancer Centre', experience: 11, ext: '2910', email: 'sn.pillai@lifelink.in',
    pager: 'PG-2910', shift: 'Tomorrow 08:00', avatarColor: 'bg-yellow-500', rating: 4.91,
    patientsThisMonth: 39, totalPatients: 2900, successRate: 88.4, satisfactionScore: 97,
    proceduresDone: 560, bio: 'Dedicated oncologist blending cutting-edge immunotherapy and targeted therapy with compassionate patient care. Principal investigator for 4 Phase III trials. ESMO faculty member.',
    education: [
      { degree: 'MBBS', institution: 'Trivandrum Medical College', year: 2011 },
      { degree: 'MD (Medicine)', institution: 'CMC Vellore', year: 2015 },
      { degree: 'DM (Medical Oncology)', institution: 'Tata Memorial Hospital', year: 2018 },
      { degree: 'Fellowship (Haemato-Oncology)', institution: 'Royal Marsden, London', year: 2020 },
    ],
    certifications: ['ESMO Certified', 'ASCO Member', 'CAR-T Therapy Trained', 'Bone Marrow Transplant Cert.'],
    languages: ['Malayalam', 'English', 'Tamil', 'Hindi'],
    awards: ['ESMO Young Oncologist Award 2022', 'Tata Memorial Gold Medal 2018'],
    publications: [
      { title: 'CAR-T Outcomes in Relapsed ALL – Indian Cohort', journal: 'Blood', year: 2022 },
      { title: 'Checkpoint Inhibitors in TNBC', journal: 'Annals of Oncology', year: 2021 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '08:00–18:00' }, { day: 'Tue', shift: '08:00–18:00' },
      { day: 'Wed', shift: null }, { day: 'Thu', shift: '08:00–18:00' },
      { day: 'Fri', shift: '08:00–18:00' }, { day: 'Sat', shift: null }, { day: 'Sun', shift: null },
    ],
    isOnCall: false, nextAvailable: 'Tomorrow 08:00', roomNo: 'CC-15', joinedYear: 2020,
  },
  {
    id: 16, name: 'Dr. Manish Tiwari', specialty: 'Nephrology', subspecialty: 'Transplant Nephrology & Dialysis',
    status: 'On Duty', department: 'Dialysis Unit', experience: 17, ext: '2540', email: 'ma.tiwari@lifelink.in',
    pager: 'PG-2540', shift: '09:00–21:00', avatarColor: 'bg-blue-500', rating: 4.84,
    patientsThisMonth: 82, totalPatients: 5700, successRate: 96.1, satisfactionScore: 94,
    proceduresDone: 1680, bio: 'Transplant nephrologist with an outstanding track record in managing renal allograft recipients. Heads the kidney transplant program and has performed over 400 successful transplants.',
    education: [
      { degree: 'MBBS', institution: 'KGMU Lucknow', year: 2005 },
      { degree: 'MD (Medicine)', institution: 'BHU Varanasi', year: 2009 },
      { degree: 'DM (Nephrology)', institution: 'AIIMS Delhi', year: 2013 },
      { degree: 'Fellowship (Transplant)', institution: 'Cleveland Clinic, USA', year: 2015 },
    ],
    certifications: ['DM Nephrology', 'FASN', 'Transplant Certified', 'HD/CRRT Cert.'],
    languages: ['Hindi', 'English', 'Bhojpuri'],
    awards: ['ISN Fellowship 2015', 'Best Nephrologist – North India 2023', 'Research Excellence – AIIMS 2012'],
    publications: [
      { title: 'Tacrolimus Pharmacokinetics in Indian Renal Transplant Recipients', journal: 'NDT', year: 2018 },
    ],
    weeklySchedule: [
      { day: 'Mon', shift: '09:00–21:00' }, { day: 'Tue', shift: null },
      { day: 'Wed', shift: '09:00–21:00' }, { day: 'Thu', shift: '09:00–21:00' },
      { day: 'Fri', shift: '09:00–21:00' }, { day: 'Sat', shift: '10:00–16:00' }, { day: 'Sun', shift: null },
    ],
    isOnCall: true, nextAvailable: 'Now', roomNo: 'DIA-01', joinedYear: 2015,
  },
];

const DEPARTMENTS = ['All Departments', ...Array.from(new Set(DOCTORS.map((d) => d.department)))];
const SPECIALTIES = ['All Specialties', ...Array.from(new Set(DOCTORS.map((d) => d.specialty)))];
const STATUSES: (DoctorStatus | 'All')[] = ['All', 'On Duty', 'In Surgery', 'On Call', 'Off Duty'];

const STATS = [
  { label: 'On Duty Now', value: DOCTORS.filter((d) => d.status === 'On Duty').length, icon: UserCheck, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400', border: 'border-l-emerald-500' },
  { label: 'In Surgery', value: DOCTORS.filter((d) => d.status === 'In Surgery').length, icon: Scissors, color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400', border: 'border-l-orange-500' },
  { label: 'On Call', value: DOCTORS.filter((d) => d.isOnCall).length, icon: PhoneCall, color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400', border: 'border-l-sky-500' },
  { label: 'Off Duty', value: DOCTORS.filter((d) => d.status === 'Off Duty').length, icon: UserX, color: 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400', border: 'border-l-slate-400' },
];

function getInitials(name: string) {
  return name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function StatusBadge({ status }: { status: DoctorStatus }) {
  const map: Record<DoctorStatus, { cls: string; dot: string }> = {
    'On Duty':   { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
    'In Surgery':{ cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',   dot: 'bg-orange-500' },
    'On Call':   { cls: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',               dot: 'bg-sky-500' },
    'Off Duty':  { cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',       dot: 'bg-slate-400' },
  };
  const { cls, dot } = map[status];
  return (
    <Badge className={`${cls} border-0 text-[10px] flex items-center gap-1`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </Badge>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Doctor Profile Modal ──────────────────────────────────────────────────────
type ModalTab = 'profile' | 'schedule' | 'stats' | 'contact';

function DoctorModal({ doc, onClose }: { doc: Doctor; onClose: () => void }) {
  const [tab, setTab] = useState<ModalTab>('profile');

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${doc.avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {getInitials(doc.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{doc.name}</h2>
                {doc.isOnCall && (
                  <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-0 text-[10px]">
                    <Zap className="h-2.5 w-2.5 mr-1" /> On Call
                  </Badge>
                )}
                <BadgeCheck className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-primary font-semibold mt-0.5">{doc.specialty}</p>
              <p className="text-xs text-muted-foreground">{doc.subspecialty}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StatusBadge status={doc.status} />
                <StarRating rating={doc.rating} />
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" /> {doc.department}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {doc.experience} yrs
                </span>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {(['profile', 'schedule', 'stats', 'contact'] as ModalTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {tab === 'profile' && (
              <motion.div key="profile" variants={slideIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-5">
                <p className="text-sm text-muted-foreground leading-relaxed">{doc.bio}</p>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Education
                  </h3>
                  <div className="space-y-2">
                    {doc.education.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <span className="font-medium">{e.degree}</span>
                          <span className="text-muted-foreground"> · {e.institution} · {e.year}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" /> Certifications
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.certifications.map((c) => (
                      <Badge key={c} variant="outline" className="text-[11px] font-normal">{c}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Languages className="h-3.5 w-3.5" /> Languages
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.languages.map((l) => (
                      <Badge key={l} className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-0 text-[11px]">{l}</Badge>
                    ))}
                  </div>
                </div>

                {doc.awards.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Award className="h-3.5 w-3.5" /> Awards & Recognitions
                    </h3>
                    <ul className="space-y-1">
                      {doc.awards.map((a) => (
                        <li key={a} className="text-sm flex items-start gap-2">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 mt-0.5 shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {doc.publications.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Publications
                    </h3>
                    <div className="space-y-2">
                      {doc.publications.map((p, i) => (
                        <div key={i} className="text-sm p-2.5 rounded-lg bg-muted/40 border">
                          <p className="font-medium text-xs leading-snug">{p.title}</p>
                          <p className="text-muted-foreground text-xs mt-0.5">{p.journal} · {p.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'schedule' && (
              <motion.div key="schedule" variants={slideIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" /> Weekly Schedule
                  </h3>
                  <div className="grid grid-cols-7 gap-1.5">
                    {doc.weeklySchedule.map((ws) => (
                      <div key={ws.day} className={`rounded-xl p-2 text-center ${ws.shift ? 'bg-primary/10 border border-primary/20' : 'bg-muted/30'}`}>
                        <p className="text-[10px] font-bold text-muted-foreground">{ws.day}</p>
                        {ws.shift ? (
                          <p className="text-[9px] mt-1 text-primary font-medium leading-tight">{ws.shift.replace('–', '\n–\n')}</p>
                        ) : (
                          <p className="text-[10px] mt-1 text-muted-foreground/50">—</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Room / Location</span>
                    <span className="font-semibold">{doc.roomNo}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current Shift</span>
                    <span className="font-semibold">{doc.shift}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Next Available</span>
                    <span className="font-semibold text-emerald-600">{doc.nextAvailable}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">On-Call Status</span>
                    <span className={`font-semibold ${doc.isOnCall ? 'text-sky-600' : 'text-muted-foreground'}`}>
                      {doc.isOnCall ? 'Active On Call' : 'Not On Call'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Joined Lifelink</span>
                    <span className="font-semibold">{doc.joinedYear}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'stats' && (
              <motion.div key="stats" variants={slideIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Users, label: 'This Month', value: doc.patientsThisMonth.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                    { icon: Heart, label: 'Total Patients', value: doc.totalPatients.toLocaleString(), color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/30' },
                    { icon: TrendingUp, label: 'Success Rate', value: `${doc.successRate}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
                    { icon: Star, label: 'Satisfaction', value: `${doc.satisfactionScore}%`, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
                    { icon: Activity, label: 'Procedures', value: doc.proceduresDone.toLocaleString(), color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
                    { icon: BarChart3, label: 'Rating', value: `${doc.rating}/5`, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/30' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.bg} rounded-xl p-3 flex items-center gap-3`}>
                      <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20`}>
                        <s.icon className={`h-4 w-4 ${s.color}`} />
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">{s.label}</p>
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Performance Metrics</h3>
                  {[
                    { label: 'Patient Satisfaction', value: doc.satisfactionScore },
                    { label: 'Treatment Success', value: doc.successRate },
                    { label: 'Peer Rating', value: doc.rating * 20 },
                  ].map((m) => (
                    <div key={m.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold">{m.value.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${m.value}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === 'contact' && (
              <motion.div key="contact" variants={slideIn} initial="hidden" animate="show" exit={{ opacity: 0 }} className="space-y-4">
                <div className="space-y-3">
                  {[
                    { icon: Phone, label: 'Extension', value: `Ext. ${doc.ext}`, action: () => toast.success(`Calling ${doc.name} on Ext. ${doc.ext}…`) },
                    { icon: Radio, label: 'Radio ID', value: doc.pager, action: () => toast.success(`Paging ${doc.name} (${doc.pager})…`) },
                    { icon: Mail, label: 'Email', value: doc.email, action: () => toast.success(`Opening email to ${doc.email}`) },
                    { icon: MessageSquare, label: 'Internal Message', value: 'Send secure message', action: () => toast.success(`Message sent to ${doc.name}`) },
                  ].map((c) => (
                    <div
                      key={c.label}
                      onClick={c.action}
                      className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 cursor-pointer transition-all hover:border-primary/40 hover:shadow-sm group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <c.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="text-sm font-medium">{c.value}</p>
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-muted-foreground">
                    <AlarmClock className="h-3.5 w-3.5" /> Emergency Protocol
                  </p>
                  <p className="text-sm">For emergencies, call <span className="font-bold text-red-500">Ext. 9999</span> or use the SOS system. This will simultaneously alert all on-call specialists.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HospitalDoctorsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | 'All'>('All');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [specFilter, setSpecFilter] = useState('All Specialties');
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);

  const filtered = useMemo(() => {
    return DOCTORS.filter((doc) => {
      const q = search.toLowerCase();
      const matchSearch = !q || doc.name.toLowerCase().includes(q) || doc.specialty.toLowerCase().includes(q) || doc.department.toLowerCase().includes(q) || doc.subspecialty.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || doc.status === statusFilter;
      const matchDept = deptFilter === 'All Departments' || doc.department === deptFilter;
      const matchSpec = specFilter === 'All Specialties' || doc.specialty === specFilter;
      return matchSearch && matchStatus && matchDept && matchSpec;
    });
  }, [search, statusFilter, deptFilter, specFilter]);

  const onCallDoctors = DOCTORS.filter((d) => d.isOnCall);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Doctor Directory</h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {DOCTORS.length} doctors on staff · {DOCTORS.filter((d) => d.status === 'On Duty').length} currently on duty
              </p>
            </div>
          </div>
          <Button className="gap-1.5" size="sm" onClick={() => toast.success('Add Doctor form coming soon')}>
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <motion.div
            key={stat.label} variants={fadeUp}
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

      {/* On-Call Roster */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PhoneCall className="h-4 w-4 text-sky-500" />
              On-Call Roster
              <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-0 ml-1">{onCallDoctors.length} active</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {onCallDoctors.map((doc) => (
                <motion.div
                  key={doc.id}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => setSelectedDoc(doc)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className={`w-6 h-6 rounded-full ${doc.avatarColor} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {getInitials(doc.name)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-none">{doc.name}</p>
                    <p className="text-[10px] text-muted-foreground">{doc.specialty}</p>
                  </div>
                  <Zap className="h-3 w-3 text-sky-500 ml-1" />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & Filters */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, department…"
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <Button
                key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'}
                className="text-xs h-8" onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Dept & Specialty selects */}
      <motion.div variants={fadeUp} className="flex gap-3 flex-wrap">
        <select
          value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs h-8 px-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}
          className="text-xs h-8 px-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(search || statusFilter !== 'All' || deptFilter !== 'All Departments' || specFilter !== 'All Specialties') && (
          <Button
            variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground"
            onClick={() => { setSearch(''); setStatusFilter('All'); setDeptFilter('All Departments'); setSpecFilter('All Specialties'); }}
          >
            <X className="h-3 w-3 mr-1" /> Clear filters
          </Button>
        )}
      </motion.div>

      {/* Doctor Grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <motion.div
            key={doc.id} variants={fadeUp}
            whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => setSelectedDoc(doc)}
            className="rounded-xl border bg-card p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={`w-12 h-12 rounded-xl ${doc.avatarColor} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md`}>
                {getInitials(doc.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-0.5">
                  <div>
                    <h3 className="text-sm font-bold truncate group-hover:text-primary transition-colors">{doc.name}</h3>
                    <p className="text-xs text-primary font-medium">{doc.specialty}</p>
                    <p className="text-[11px] text-muted-foreground">{doc.subspecialty}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <StarRating rating={doc.rating} />
                  <span className="text-[11px] text-muted-foreground">{doc.patientsThisMonth} pts/mo</span>
                  {doc.isOnCall && (
                    <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-0 text-[10px]">
                      <Zap className="h-2.5 w-2.5 mr-0.5" /> On Call
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-0.5"><Building2 className="h-3 w-3" /> {doc.department}</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {doc.shift}</span>
                </div>

                <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px]">
                  <span className="text-muted-foreground">Next available:</span>
                  <span className={`font-semibold ${doc.nextAvailable === 'Now' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {doc.nextAvailable}
                  </span>
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5"><Stethoscope className="h-3 w-3" /> {doc.experience} yrs exp</span>
                <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" /> Ext {doc.ext}</span>
                <span className="flex items-center gap-0.5"><Activity className="h-3 w-3" /> {doc.successRate}% success</span>
              </div>
              <Button
                variant="outline" size="sm"
                className="h-7 text-[11px] shrink-0 gap-1 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                onClick={(e) => { e.stopPropagation(); toast.success(`Paging ${doc.name} (${doc.pager})…`); }}
              >
                <Radio className="h-3 w-3" /> Page
              </Button>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <motion.div variants={fadeUp} className="col-span-full py-16 text-center">
            <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-lg font-semibold text-muted-foreground">No doctors found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>

      {/* Doctor Detail Modal */}
      <AnimatePresence>
        {selectedDoc && <DoctorModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
