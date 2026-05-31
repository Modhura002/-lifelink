// ============================================================
// LifeLink - TypeScript Type Definitions
// ============================================================

export type Role = 'PATIENT' | 'DRIVER' | 'HOSPITAL_STAFF' | 'ADMIN' | 'UNASSIGNED';
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
export type EmergencyStatusType = 'PENDING' | 'AMBULANCE_ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'ADMITTED' | 'COMPLETED' | 'CANCELLED';
export type AmbulanceStatusType = 'AVAILABLE' | 'BUSY' | 'EN_ROUTE' | 'RETURNING' | 'OFFLINE';
export type NotificationType = 'EMERGENCY' | 'AMBULANCE' | 'HOSPITAL' | 'SYSTEM';

export type PageRoute =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'sos'
  | 'tracking'
  | 'hospitals'
  | 'medical-records'
  | 'qr-card'
  | 'notifications'
  | 'feedback'
  | 'profile'
  | 'admin'
  | 'admin-users'
  | 'admin-hospitals'
  | 'admin-ambulances'
  | 'admin-emergencies'
  | 'hospital-dashboard'
  | 'hospital-beds'
  | 'hospital-patients'
  | 'driver-dashboard'
  | 'driver-navigation'
  | 'driver-earnings'
  | 'driver-history'
  | 'driver-vehicle'
  | 'hospital-doctors'
  | 'hospital-pharmacy'
  | 'hospital-analytics'
  | 'admin-analytics'
  | 'admin-settings'
  | 'admin-reports'
  | 'doctor-appointments'
  | 'help'
  | 'emergency-profile'
  | 'ai-chat'
  | 'pharmacy-store'
  | 'hospital-inventory'
  | 'admin-appointments'
  | 'admin-orders'
  | 'doctor-bookings'
  | 'order-tracking'
  | 'insurance'
  | 'loans'
  | 'admin-insurance'
  | 'admin-loans'
  | 'hospital-scanner';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  bloodGroup?: BloodGroup;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  pinCode?: string;
  country?: string;
  profileImageUrl?: string;
  isVerified: boolean;
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  emergencyContacts: EmergencyContact[];
  createdAt: string;
  hospitalId?: string;
  // Populated by GET /api/users/[id] — not stored in auth store
  ambulance?: { id: string; vehicleNumber: string; status: string } | null;
  hospital?: { id: string; name: string; city: string } | null;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
}

export interface InsuranceInfo {
  id: string;
  userId: string;
  provider: string;
  policyNumber: string;
  validUntil: string;
  coverageType: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  type: 'PRESCRIPTION' | 'LAB_REPORT' | 'SCAN' | 'DISCHARGE_SUMMARY';
  fileUrl: string;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
  emergencyRating: number;
  isActive: boolean;
  specializations: string[];
}

export interface Ambulance {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverImageUrl?: string;
  status: AmbulanceStatusType;
  currentLatitude: number;
  currentLongitude: number;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  ambulanceId?: string;
  hospitalId?: string;
  status: EmergencyStatusType;
  severity: number;
  description?: string;
  patientLatitude: number;
  patientLongitude: number;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  requestId: string;
  event: string;
  description?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  requestId: string;
  ambulanceRating: number;
  hospitalRating: number;
  overallRating: number;
  responseTimeScore: number;
  comment?: string;
  createdAt: string;
}

export interface TrackingData {
  latitude: number;
  longitude: number;
  bearing: number;
  speed: number;
  eta: number;
  status: string;
  distanceRemaining: number;
}

export interface HospitalWithDistance extends Hospital {
  distanceKm: number;
}

export interface TriageResult {
  severity: number;
  severityLabel: 'LOW' | 'MODERATE' | 'SERIOUS' | 'CRITICAL' | 'EXTREME';
  possibleConditions: string[];
  immediateActions: string[];
  callToAction: string;
}

export interface TriageRule {
  keywords: string[];
  severity: number;
  conditions: string[];
  actions: string[];
}

export interface NavItem {
  label: string;
  route: PageRoute;
  icon: string;
  badge?: number;
  emergency?: boolean;
}

export interface DashboardStats {
  activeEmergencies: number;
  hospitalsOnline: number;
  avgResponseTime: number;
  patientSatisfaction: number;
  totalLivesSaved: number;
  ambulancesOnline: number;
}

export interface BedInfo {
  id: string;
  number: string;
  type: 'GENERAL' | 'ICU' | 'EMERGENCY' | 'PEDIATRIC';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  patientName?: string;
}
