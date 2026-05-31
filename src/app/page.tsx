'use client';

import { useNavigationStore } from '@/store';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import LandingPage from '@/components/pages/LandingPage';
import LoginPage from '@/components/pages/LoginPage';
import SignupPage from '@/components/pages/SignupPage';
import PatientDashboard from '@/components/pages/PatientDashboard';
import SOSPage from '@/components/pages/SOSPage';
import TrackingPage from '@/components/pages/TrackingPage';
import HospitalsPage from '@/components/pages/HospitalsPage';
import MedicalRecordsPage from '@/components/pages/MedicalRecordsPage';
import QRCardPage from '@/components/pages/QRCardPage';
import NotificationsPage from '@/components/pages/NotificationsPage';
import FeedbackPage from '@/components/pages/FeedbackPage';
import ProfilePage from '@/components/pages/ProfilePage';
import AdminDashboard from '@/components/pages/AdminDashboard';
import AdminUsersPage from '@/components/pages/AdminUsersPage';
import AdminHospitalsPage from '@/components/pages/AdminHospitalsPage';
import AdminAmbulancesPage from '@/components/pages/AdminAmbulancesPage';
import AdminEmergenciesPage from '@/components/pages/AdminEmergenciesPage';
import HospitalDashboard from '@/components/pages/HospitalDashboard';
import HospitalBedsPage from '@/components/pages/HospitalBedsPage';
import HospitalPatientsPage from '@/components/pages/HospitalPatientsPage';
import DriverDashboardPage from '@/components/pages/DriverDashboardPage';
import DriverNavigationPage from '@/components/pages/DriverNavigationPage';
import EmergencyProfilePage from '@/components/pages/EmergencyProfilePage';
import AIChatPage from '@/components/pages/AIChatPage';
import DriverEarningsPage from '@/components/pages/DriverEarningsPage';
import DriverHistoryPage from '@/components/pages/DriverHistoryPage';
import DriverVehiclePage from '@/components/pages/DriverVehiclePage';
import HospitalDoctorsPage from '@/components/pages/HospitalDoctorsPage';
import HospitalPharmacyPage from '@/components/pages/HospitalPharmacyPage';
import HospitalAnalyticsPage from '@/components/pages/HospitalAnalyticsPage';
import AdminAnalyticsPage from '@/components/pages/AdminAnalyticsPage';
import AdminSettingsPage from '@/components/pages/AdminSettingsPage';
import AdminReportsPage from '@/components/pages/AdminReportsPage';
import DoctorAppointmentsPage from '@/components/pages/DoctorAppointmentsPage';
import HelpPage from '@/components/pages/HelpPage';
import PatientPharmacyStorePage from '@/components/pages/PatientPharmacyStorePage';
import HospitalInventoryPage from '@/components/pages/HospitalInventoryPage';
import AdminAppointmentsPage from '@/components/pages/AdminAppointmentsPage';
import AdminPharmacyOrdersPage from '@/components/pages/AdminPharmacyOrdersPage';
import DoctorBookingsPage from '@/components/pages/DoctorBookingsPage';
import OrderTrackingPage from '@/components/pages/OrderTrackingPage';
import InsurancePage from '@/components/pages/InsurancePage';
import LoansPage from '@/components/pages/LoansPage';
import AdminInsurancePage from '@/components/pages/AdminInsurancePage';
import AdminLoansPage from '@/components/pages/AdminLoansPage';
import HospitalScannerPage from '@/components/pages/HospitalScannerPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { type PageRoute } from '@/types';

const pageComponents: Record<PageRoute, React.ComponentType> = {
  'landing': LandingPage,
  'login': LoginPage,
  'signup': SignupPage,
  'dashboard': PatientDashboard,
  'sos': SOSPage,
  'tracking': TrackingPage,
  'hospitals': HospitalsPage,
  'medical-records': MedicalRecordsPage,
  'qr-card': QRCardPage,
  'notifications': NotificationsPage,
  'feedback': FeedbackPage,
  'profile': ProfilePage,
  'admin': AdminDashboard,
  'admin-users': AdminUsersPage,
  'admin-hospitals': AdminHospitalsPage,
  'admin-ambulances': AdminAmbulancesPage,
  'admin-emergencies': AdminEmergenciesPage,
  'hospital-dashboard': HospitalDashboard,
  'hospital-beds': HospitalBedsPage,
  'hospital-patients': HospitalPatientsPage,
  'driver-dashboard': DriverDashboardPage,
  'driver-navigation': DriverNavigationPage,
  'driver-earnings': DriverEarningsPage,
  'driver-history': DriverHistoryPage,
  'driver-vehicle': DriverVehiclePage,
  'hospital-doctors': HospitalDoctorsPage,
  'hospital-pharmacy': HospitalPharmacyPage,
  'hospital-analytics': HospitalAnalyticsPage,
  'admin-analytics': AdminAnalyticsPage,
  'admin-settings': AdminSettingsPage,
  'admin-reports': AdminReportsPage,
  'doctor-appointments': DoctorAppointmentsPage,
  'help': HelpPage,
  'emergency-profile': EmergencyProfilePage,
  'ai-chat': AIChatPage,
  'pharmacy-store': PatientPharmacyStorePage,
  'hospital-inventory': HospitalInventoryPage,
  'admin-appointments': AdminAppointmentsPage,
  'admin-orders': AdminPharmacyOrdersPage,
  'doctor-bookings': DoctorBookingsPage,
  'order-tracking': OrderTrackingPage,
  'insurance': InsurancePage,
  'loans': LoansPage,
  'admin-insurance': AdminInsurancePage,
  'admin-loans': AdminLoansPage,
  'hospital-scanner': HospitalScannerPage,
};


const publicPages: PageRoute[] = ['landing', 'login', 'signup', 'emergency-profile'];

function HomeContent() {
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Derive the page to show directly from the URL — no setState during render
  const pageParam = searchParams.get('page') as PageRoute | null;
  const resolvedPage: PageRoute =
    pageParam && pageComponents[pageParam] ? pageParam : currentPage;

  // Enforce role-based routing and redirect away from auth pages
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'UNASSIGNED') {
        router.push('/onboarding');
        return;
      }

      let targetPage: PageRoute = 'dashboard';
      if (session.user.role === 'DRIVER') targetPage = 'driver-dashboard';
      else if (session.user.role === 'HOSPITAL_STAFF') targetPage = 'hospital-dashboard';
      else if (session.user.role === 'ADMIN') targetPage = 'admin';

      const isAuthPage = ['login', 'signup', 'landing'].includes(resolvedPage);
      
      // Prevent drivers/staff/admins from sitting on the default patient dashboard
      const isWrongDashboard =
        resolvedPage === 'dashboard' && session.user.role !== 'PATIENT';

      if (isAuthPage || isWrongDashboard) {
        setCurrentPage(targetPage);
        router.push(`/?page=${targetPage}`);
      }
    }
  }, [status, session, resolvedPage, setCurrentPage, router]);

  // Sync the Zustand store in the background (for nav highlighting etc.)
  // This runs AFTER render, so it never causes a crash
  useEffect(() => {
    if (pageParam && pageComponents[pageParam] && pageParam !== currentPage) {
      setCurrentPage(pageParam);
    }
  }, [pageParam, currentPage, setCurrentPage]);

  const isPublic = publicPages.includes(resolvedPage);
  const PageComponent = pageComponents[resolvedPage] || LandingPage;

  if (isPublic) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return <LoginPage />;
  }

  // DashboardLayout already contains SOSFloatingButton, MedicalChatbot, SOSAlertBanner
  return (
    <DashboardLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="h-full"
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </DashboardLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-background animate-pulse" />}>
      <HomeContent />
    </Suspense>
  );
}
