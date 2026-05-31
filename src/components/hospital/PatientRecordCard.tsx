import { Printer, Copy, Check, HeartPulse, User, Phone, AlertTriangle, Pill, Activity, Stethoscope, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { BLOOD_GROUP_LABELS } from '@/lib/constants';

interface PatientRecordCardProps {
  data: any; // The structure returned from /api/patient/qr-profile
  onDone: () => void;
}

export function PatientRecordCard({ data, onDone }: PatientRecordCardProps) {
  const { patient } = data;
  const { medicalProfile, emergencyContacts, recentEmergencies } = patient;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const summary = `
PATIENT MEDICAL SUMMARY
-----------------------
Name: ${patient.name}
DOB: ${patient.dateOfBirth || 'Unknown'} | Gender: ${patient.gender || 'Unknown'}
Blood Type: ${patient.bloodType ? BLOOD_GROUP_LABELS[patient.bloodType] : 'Unknown'}

Allergies: ${medicalProfile.allergies.length > 0 ? medicalProfile.allergies.join(', ') : 'None recorded'}
Medications: ${medicalProfile.currentMedications.length > 0 ? medicalProfile.currentMedications.join(', ') : 'None recorded'}
Conditions: ${medicalProfile.chronicConditions.length > 0 ? medicalProfile.chronicConditions.join(', ') : 'None recorded'}
Surgeries: ${medicalProfile.pastSurgeries.length > 0 ? medicalProfile.pastSurgeries.join(', ') : 'None recorded'}

Emergency Contacts:
${emergencyContacts.map((c: any) => `- ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(summary);
    toast.success('Summary copied to clipboard');
  };

  // Check if allergies exist for warning styling
  const hasAllergies = medicalProfile.allergies && medicalProfile.allergies.length > 0;

  return (
    <Card className="w-full shadow-lg border-2 border-primary/20 bg-background scanner-print-container">
      {/* 
        For printing:
        We will add a global print style in globals.css or handle it via a class
        that hides everything except `.scanner-print-container`.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .scanner-print-container, .scanner-print-container * {
            visibility: visible;
          }
          .scanner-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <CardHeader className="bg-primary/5 pb-4 border-b">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={patient.photoUrl || ''} alt={patient.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              <User className="h-8 w-8 opacity-50" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{patient.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>{patient.gender || 'Unknown Gender'}</span>
                  <span>•</span>
                  <span>DOB: {patient.dateOfBirth || 'Unknown'}</span>
                </div>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 font-bold text-xl px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                {patient.bloodType ? BLOOD_GROUP_LABELS[patient.bloodType] : 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* ALLERGIES */}
        <div className={`p-4 border-b ${hasAllergies ? 'bg-red-50 dark:bg-red-950/20' : ''}`}>
          <h3 className={`text-sm font-semibold flex items-center gap-2 mb-3 ${hasAllergies ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
            <AlertTriangle className="h-4 w-4" /> ALLERGIES
          </h3>
          {hasAllergies ? (
            <div className="flex flex-wrap gap-2">
              {medicalProfile.allergies.map((a: string, i: number) => (
                <Badge key={i} variant="destructive" className="px-3 py-1 text-sm">{a}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>

        {/* MEDICATIONS */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <Pill className="h-4 w-4" /> CURRENT MEDICATIONS
          </h3>
          {medicalProfile.currentMedications.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {medicalProfile.currentMedications.map((m: string, i: number) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>

        {/* CONDITIONS */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <Activity className="h-4 w-4" /> CHRONIC CONDITIONS
          </h3>
          {medicalProfile.chronicConditions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {medicalProfile.chronicConditions.map((c: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1">{c}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>

        {/* SURGERIES */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <Scissors className="h-4 w-4" /> PAST SURGERIES
          </h3>
          {medicalProfile.pastSurgeries.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {medicalProfile.pastSurgeries.map((s: string, i: number) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>

        {/* EMERGENCY CONTACTS */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <Phone className="h-4 w-4" /> EMERGENCY CONTACTS
          </h3>
          {emergencyContacts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {emergencyContacts.map((c: any, i: number) => (
                <div key={i} className="bg-muted/30 p-3 rounded-lg border">
                  <p className="font-semibold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground mb-1">{c.relationship}</p>
                  <a href={`tel:${c.phone}`} className="text-sm text-primary font-mono hover:underline">{c.phone}</a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>

        {/* RECENT EMERGENCIES */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" /> RECENT EMERGENCIES
          </h3>
          {recentEmergencies.length > 0 ? (
            <div className="space-y-3">
              {recentEmergencies.map((e: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-l-2 border-primary pl-3">
                  <div>
                    <p className="font-medium">{new Date(e.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Status: {e.status}</p>
                  </div>
                  <Badge variant="outline">{e.severity > 3 ? 'Critical' : 'Moderate'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No recent emergencies</p>
          )}
        </div>

        {/* DOCTOR NOTES */}
        <div className="p-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3 text-muted-foreground">
            <Stethoscope className="h-4 w-4" /> DOCTOR'S NOTES
          </h3>
          {medicalProfile.notes ? (
            <p className="text-sm whitespace-pre-wrap bg-muted/20 p-3 rounded-lg border">{medicalProfile.notes}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 p-4 border-t flex justify-end gap-3 no-print">
        <Button variant="outline" className="gap-2" onClick={handlePrint}>
          <Printer className="h-4 w-4" /> Print Record
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleCopySummary}>
          <Copy className="h-4 w-4" /> Copy Summary
        </Button>
        <Button onClick={onDone} className="gap-2">
          <Check className="h-4 w-4" /> Done
        </Button>
      </CardFooter>
    </Card>
  );
}
