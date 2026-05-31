'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PageRoute, User } from '@/types';

interface NavigationState {
  currentPage: PageRoute;
  previousPage: PageRoute | null;
  sidebarOpen: boolean;
  setCurrentPage: (page: PageRoute) => void;
  goBack: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      currentPage: 'landing' as PageRoute,
      previousPage: null,
      sidebarOpen: true,
      setCurrentPage: (page) => set({ previousPage: get().currentPage, currentPage: page }),
      goBack: () => {
        const { previousPage } = get();
        if (previousPage) {
          set({ currentPage: previousPage, previousPage: null });
        }
      },
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'lifelink-navigation',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ currentPage: state.currentPage, sidebarOpen: state.sidebarOpen }),
    }
  )
);

// Auth Store


// Emergency Store
interface EmergencyState {
  activeEmergency: {
    requestId: string;
    status: string;
    severity: number;
    description?: string;
    ambulanceId?: string;
    hospitalId?: string;
    patientName?: string;
    patientBloodGroup?: string;
    patientLatitude: number;
    patientLongitude: number;
    timeline: { id: string; event: string; description?: string; timestamp: string }[];
    startedAt: string;
    dbEmergencyId?: string;
  } | null;
  trackingData: {
    latitude: number;
    longitude: number;
    bearing: number;
    speed: number;
    eta: number;
    distanceRemaining: number;
  } | null;
  sosActivated: boolean;
  activateSOS: (severity: number, description?: string, patientName?: string, patientBloodGroup?: string) => void;
  acceptEmergency: (ambulanceId: string) => void;
  rejectEmergency: () => void;
  markArrived: () => void;
  completeEmergency: () => void;
  updateTracking: (data: EmergencyState['trackingData']) => void;
  cancelEmergency: () => void;
  setDbEmergencyId: (id: string) => void;
  addTimelineEvent: (event: string, description?: string) => void;
}

const EMERGENCY_STORAGE_KEY = 'lifelink-emergency';

export const useEmergencyStore = create<EmergencyState>()(
  persist(
    (set, get) => ({
      activeEmergency: null,
      trackingData: null,
      sosActivated: false,

      activateSOS: (severity, description, patientNameStr, patientBloodGroupStr) => {
        const requestId = `ER-${Date.now().toString(36).toUpperCase()}`;
        const now = new Date().toISOString();
        // Use Delhi coordinates for demo
        const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
        const lng = 77.2090 + (Math.random() - 0.5) * 0.01;

        const patientName = patientNameStr ?? 'Unknown Patient';
        const patientBloodGroup = patientBloodGroupStr ?? 'O_POS';

        set({
          sosActivated: true,
          activeEmergency: {
            requestId,
            status: 'WAITING_FOR_DRIVER',
            severity,
            description,
            patientName,
            patientBloodGroup,
            patientLatitude: lat,
            patientLongitude: lng,
            timeline: [
              { id: '1', event: 'SOS Triggered', description: `Severity Level ${severity}`, timestamp: now },
              { id: '2', event: 'Alert Broadcast', description: 'Notifying nearby drivers...', timestamp: now },
            ],
            startedAt: now,
          },
        });
      },

      acceptEmergency: (ambulanceId: string) => {
        const { activeEmergency } = get();
        if (!activeEmergency || activeEmergency.status !== 'WAITING_FOR_DRIVER') return;

        get().addTimelineEvent('Ambulance Assigned', 'DL-01-EM-0012 dispatched to your location');
        set((s) => ({
          activeEmergency: s.activeEmergency
            ? { ...s.activeEmergency, status: 'AMBULANCE_ASSIGNED', ambulanceId }
            : null,
        }));

        // Simulate en_route after 2 seconds
        setTimeout(() => {
          const current = get().activeEmergency;
          if (current && current.status === 'AMBULANCE_ASSIGNED') {
            get().addTimelineEvent('Ambulance En Route', 'Rajesh Kumar is heading to your location');
            set((s) => ({
              activeEmergency: s.activeEmergency
                ? { ...s.activeEmergency, status: 'EN_ROUTE' }
                : null,
            }));
          }
        }, 2000);
      },

      rejectEmergency: () => {
        const { activeEmergency } = get();
        if (!activeEmergency || activeEmergency.status !== 'WAITING_FOR_DRIVER') return;
        get().addTimelineEvent('Driver Declined', 'Searching for another driver...');
        // In a real app this would find another driver; for demo just reset
        set({ activeEmergency: null, trackingData: null, sosActivated: false });
      },

      markArrived: () => {
        const { activeEmergency } = get();
        if (!activeEmergency) return;
        get().addTimelineEvent('Ambulance Arrived', 'Ambulance has reached the patient location');
        set((s) => ({
          activeEmergency: s.activeEmergency
            ? { ...s.activeEmergency, status: 'ARRIVED' }
            : null,
        }));
      },

      completeEmergency: () => {
        const { activeEmergency } = get();
        if (!activeEmergency) return;
        get().addTimelineEvent('Emergency Completed', 'Patient has been successfully dropped off at the hospital');
        set({ activeEmergency: null, trackingData: null, sosActivated: false });
      },

      updateTracking: (data) => set({ trackingData: data }),
      cancelEmergency: () => set({ activeEmergency: null, trackingData: null, sosActivated: false }),
      setDbEmergencyId: (id) => {
        const { activeEmergency } = get();
        if (activeEmergency) {
          set({
            activeEmergency: {
              ...activeEmergency,
              dbEmergencyId: id,
            },
          });
        }
      },

      addTimelineEvent: (event, description) => {
        const { activeEmergency } = get();
        if (activeEmergency) {
          set({
            activeEmergency: {
              ...activeEmergency,
              timeline: [
                ...activeEmergency.timeline,
                { id: `${activeEmergency.timeline.length + 1}`, event, description, timestamp: new Date().toISOString() },
              ],
            },
          });
        }
      },
    }),
    {
      name: EMERGENCY_STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        activeEmergency: state.activeEmergency,
        sosActivated: state.sosActivated,
        trackingData: state.trackingData,
      }),
    }
  )
);

// Cross-tab sync: rehydrate when another tab writes to localStorage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === EMERGENCY_STORAGE_KEY) {
      useEmergencyStore.persist.rehydrate();
    }
  });
}

// ─── Driver Assignment Store (real SSE broadcast flow) ───────────────────────
export interface DriverAssignment {
  emergencyId: string;
  status: string;
  severity: number;
  city: string;
  description: string | null;
  latitude: number;
  longitude: number;
  assignedAt: string;
  patient: {
    id: string;
    name: string | null;
    phone: string | null;
    city: string | null;
    patientProfile: {
      bloodGroup: string | null;
      allergies: string | null;
      chronicConditions: string | null;
      currentMedications: string | null;
    } | null;
    emergencyContacts: { name: string; relationship: string; phone: string }[];
  };
  timeline: { id: string; event: string; description?: string | null; timestamp: string }[];
}

interface DriverAssignmentState {
  assignment: DriverAssignment | null;
  setAssignment: (data: DriverAssignment) => void;
  clearAssignment: () => void;
}

export const useDriverAssignmentStore = create<DriverAssignmentState>()(
  persist(
    (set) => ({
      assignment: null,
      setAssignment: (data) => set({ assignment: data }),
      clearAssignment: () => set({ assignment: null }),
    }),
    {
      name: 'lifelink-driver-assignment',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
      }),
    }
  )
);

// ─── Live Feed Store ─────────────────────────────────────────────────────────

export interface BookingRequest {
  id: string;
  bookingId: string;
  patientName: string;
  patientEmail: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  fee: number;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface PharmacyOrder {
  id: string;
  orderId: string;
  patientEmail: string;
  patientName: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  address: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'shipped' | 'out-for-delivery' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
  deliveryLat: number;
  deliveryLng: number;
}

interface LiveFeedState {
  bookingRequests: BookingRequest[];
  pharmacyOrders: PharmacyOrder[];
  addBookingRequest: (req: Omit<BookingRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateBookingStatus: (id: string, status: 'accepted' | 'rejected') => void;
  addPharmacyOrder: (order: Omit<PharmacyOrder, 'id'>) => void;
  updateOrderStatus: (orderId: string, status: PharmacyOrder['status']) => void;
}

export const useLiveFeedStore = create<LiveFeedState>((set) => ({
  bookingRequests: [],
  pharmacyOrders: [],
  addBookingRequest: (req) =>
    set((s) => ({
      bookingRequests: [{
        id: Date.now().toString(),
        ...req,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }, ...s.bookingRequests],
    })),
  updateBookingStatus: (id, status) =>
    set((s) => ({
      bookingRequests: s.bookingRequests.map((r) => r.id === id ? { ...r, status } : r),
    })),
  addPharmacyOrder: (order) =>
    set((s) => ({
      pharmacyOrders: [{ id: Date.now().toString(), ...order }, ...s.pharmacyOrders],
    })),
  updateOrderStatus: (orderId, status) =>
    set((s) => ({
      pharmacyOrders: s.pharmacyOrders.map((o) => o.orderId === orderId ? { ...o, status } : o),
    })),
}));

// UI Store
interface UIState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  notifications: { id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: { title: string; message: string; type: string }) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  notifications: [],
  unreadCount: 0,
  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    })),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  addNotification: (notification) =>
    set((s) => {
      const n = { id: Date.now().toString(), ...notification, isRead: false, createdAt: new Date().toISOString() };
      return { notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 };
    }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}));
