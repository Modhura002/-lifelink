// ============================================================
// LifeLink - App Constants
// ============================================================

export const APP_NAME = 'LifeLink';
export const APP_TAGLINE = 'Every Second Matters';
export const APP_DESCRIPTION = 'Smart Emergency Medical Response System — connecting patients with hospitals and ambulances in real-time.';

export const DEMO_PASSWORD = 'Demo@12345';

export const NAVIGATION_ITEMS = {
  PATIENT: [
    { label: 'Dashboard', route: 'dashboard' as const, icon: 'LayoutDashboard' },
    { label: 'SOS Emergency', route: 'sos' as const, icon: 'Siren', emergency: true },
    { label: 'Track Ambulance', route: 'tracking' as const, icon: 'Navigation' },
    { label: 'Hospitals', route: 'hospitals' as const, icon: 'Building2' },
    { label: 'Medical Records', route: 'medical-records' as const, icon: 'FileHeart' },
    { label: 'AI Medical Chat', route: 'ai-chat' as const, icon: 'Bot' },
    { label: 'Order Medicines', route: 'pharmacy-store' as const, icon: 'ShoppingBag' },
    { label: 'Book Appointment', route: 'doctor-appointments' as const, icon: 'Calendar' },
    { label: 'Track Order', route: 'order-tracking' as const, icon: 'MapPin' },
    { label: 'Insurance', route: 'insurance' as const, icon: 'ShieldCheck' },
    { label: 'Health Loans', route: 'loans' as const, icon: 'Banknote' },
    { label: 'QR Card', route: 'qr-card' as const, icon: 'QrCode' },
    { label: 'Notifications', route: 'notifications' as const, icon: 'Bell' },
    { label: 'Feedback', route: 'feedback' as const, icon: 'MessageSquare' },
    { label: 'Help', route: 'help' as const, icon: 'HelpCircle' },
    { label: 'Profile', route: 'profile' as const, icon: 'UserCircle' },
  ],
  DRIVER: [
    { label: 'My Assignments', route: 'driver-dashboard' as const, icon: 'ClipboardList' },
    { label: 'Navigation', route: 'driver-navigation' as const, icon: 'Map' },
    { label: 'Earnings', route: 'driver-earnings' as const, icon: 'IndianRupee' },
    { label: 'Trip History', route: 'driver-history' as const, icon: 'History' },
    { label: 'My Vehicle', route: 'driver-vehicle' as const, icon: 'Car' },
    { label: 'AI Medical Chat', route: 'ai-chat' as const, icon: 'Bot' },
  ],
  HOSPITAL_STAFF: [
    { label: 'Emergency Queue', route: 'hospital-dashboard' as const, icon: 'AlertTriangle', emergency: true },
    { label: 'Patient Scanner', route: 'hospital-scanner' as const, icon: 'ScanLine' },
    { label: 'Bed Management', route: 'hospital-beds' as const, icon: 'BedDouble' },
    { label: 'Patient Intake', route: 'hospital-patients' as const, icon: 'UserPlus' },
    { label: 'Doctors', route: 'hospital-doctors' as const, icon: 'Stethoscope' },
    { label: 'Patient Bookings', route: 'doctor-bookings' as const, icon: 'CalendarClock' },
    { label: 'Inventory', route: 'hospital-inventory' as const, icon: 'PackageOpen' },
    { label: 'Pharmacy', route: 'hospital-pharmacy' as const, icon: 'Pill' },
    { label: 'Analytics', route: 'hospital-analytics' as const, icon: 'TrendingUp' },
    { label: 'AI Medical Chat', route: 'ai-chat' as const, icon: 'Bot' },
  ],
  ADMIN: [
    { label: 'Overview', route: 'admin' as const, icon: 'BarChart3' },
    { label: 'Users', route: 'admin-users' as const, icon: 'Users' },
    { label: 'Hospitals', route: 'admin-hospitals' as const, icon: 'Building2' },
    { label: 'Ambulances', route: 'admin-ambulances' as const, icon: 'Truck' },
    { label: 'Emergencies', route: 'admin-emergencies' as const, icon: 'Siren' },
    { label: 'Appointments', route: 'admin-appointments' as const, icon: 'CalendarCheck' },
    { label: 'Pharmacy Orders', route: 'admin-orders' as const, icon: 'ShoppingBag' },
    { label: 'Insurance', route: 'admin-insurance' as const, icon: 'ShieldCheck' },
    { label: 'Health Loans', route: 'admin-loans' as const, icon: 'Banknote' },
    { label: 'Analytics', route: 'admin-analytics' as const, icon: 'TrendingUp' },
    { label: 'Reports', route: 'admin-reports' as const, icon: 'FileBarChart' },
    { label: 'Settings', route: 'admin-settings' as const, icon: 'Settings' },
    { label: 'AI Medical Chat', route: 'ai-chat' as const, icon: 'Bot' },
  ],
};

export const EMERGENCY_HOTLINE = '108';
export const SUPPORT_PHONE = '+91-1800-200-1080';
export const SUPPORT_EMAIL = 'support@lifelink.app';

export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: 'A+',
  A_NEG: 'A−',
  B_POS: 'B+',
  B_NEG: 'B−',
  AB_POS: 'AB+',
  AB_NEG: 'AB−',
  O_POS: 'O+',
  O_NEG: 'O−',
};

export const MEDICAL_RECORD_TYPES = [
  { value: 'PRESCRIPTION', label: 'Prescription', icon: 'Prescription' },
  { value: 'LAB_REPORT', label: 'Lab Report', icon: 'FlaskConical' },
  { value: 'SCAN', label: 'Scan / Imaging', icon: 'Scan' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary', icon: 'FileText' },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  AMBULANCE_ASSIGNED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  EN_ROUTE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  ARRIVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  ADMITTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export const AMBULANCE_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  BUSY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  EN_ROUTE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  RETURNING: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  OFFLINE: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

// Haversine formula for distance calculation
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format time duration in minutes and seconds
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

// Get relative time string
export function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  return `${Math.floor(diffDay / 30)}mo ago`;
}
