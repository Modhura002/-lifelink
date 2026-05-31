'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Truck, Building2, Shield, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import PatientOnboarding from '@/components/dashboard/onboarding/PatientOnboarding';
import DriverOnboarding from '@/components/dashboard/onboarding/DriverOnboarding';
import StaffOnboarding from '@/components/dashboard/onboarding/StaffOnboarding';
import AdminOnboarding from '@/components/dashboard/onboarding/AdminOnboarding';

export default function OnboardingPage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  useEffect(() => {
    // If user is somehow already onboarded, redirect away
    if (status === 'authenticated' && session?.user?.role !== 'UNASSIGNED') {
       if (session?.user?.role === 'PATIENT') router.push('/?page=dashboard');
       else if (session?.user?.role === 'DRIVER') router.push('/?page=driver-dashboard');
       else if (session?.user?.role === 'HOSPITAL_STAFF') router.push('/?page=hospital-dashboard');
       else if (session?.user?.role === 'ADMIN') router.push('/?page=admin');
       else router.push('/?page=dashboard');
    }
  }, [session, status, router]);

  const handleComplete = async () => {
    await update({ role: selectedRole }); // refresh session from JWT
    
    // Redirect based on selectedRole
    if (selectedRole === 'PATIENT') router.push('/?page=dashboard');
    else if (selectedRole === 'DRIVER') router.push('/?page=driver-dashboard');
    else if (selectedRole === 'HOSPITAL_STAFF') router.push('/?page=hospital-dashboard');
    else if (selectedRole === 'ADMIN') router.push('/?page=admin');
    else router.push('/?page=dashboard');
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const renderForm = () => {
    switch (selectedRole) {
      case 'PATIENT': return <PatientOnboarding onComplete={handleComplete} />;
      case 'DRIVER': return <DriverOnboarding onComplete={handleComplete} />;
      case 'HOSPITAL_STAFF': return <StaffOnboarding onComplete={handleComplete} />;
      case 'ADMIN': return <AdminOnboarding onComplete={handleComplete} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg">
              <HeartPulse className="size-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome to LifeLink</h1>
          <p className="text-muted-foreground mt-2">
            {!selectedRole ? 'How would you like to use LifeLink?' : 'Let\'s get your profile set up'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!selectedRole ? (
            <motion.div
              key="role-selection"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <RoleCard
                title="Patient"
                description="Access emergency services, store medical records, and generate SOS alerts."
                icon={<HeartPulse className="size-6 text-red-500" />}
                onClick={() => setSelectedRole('PATIENT')}
              />
              <RoleCard
                title="Ambulance Driver"
                description="Receive emergency dispatch requests and navigate to patients."
                icon={<Truck className="size-6 text-emerald-500" />}
                onClick={() => setSelectedRole('DRIVER')}
              />
              <RoleCard
                title="Hospital Staff"
                description="Manage incoming emergencies, beds, and ambulance coordination."
                icon={<Building2 className="size-6 text-sky-500" />}
                onClick={() => setSelectedRole('HOSPITAL_STAFF')}
              />
              <RoleCard
                title="Administrator"
                description="System administration and oversight (Authorized personnel only)."
                icon={<Shield className="size-6 text-violet-500" />}
                onClick={() => setSelectedRole('ADMIN')}
              />
            </motion.div>
          ) : (
            <motion.div
              key="role-form"
              className="bg-card border rounded-xl p-6 shadow-sm relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedRole(null)}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <div className="pt-8">
                {renderForm()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function RoleCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
  return (
    <Card 
      className="cursor-pointer hover:border-primary transition-all hover:shadow-md group"
      onClick={onClick}
    >
      <CardContent className="p-6 flex items-start gap-4">
        <div className="p-3 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
