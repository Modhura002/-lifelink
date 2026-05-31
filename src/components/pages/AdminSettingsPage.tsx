'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  AlertTriangle,
  Bell,
  Link2,
  Database,
  Shield,
  CheckCircle2,
  XCircle,
  Check,
  Minus,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// ─── Sub-components ───────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        on ? 'bg-emerald-500' : 'bg-muted-foreground/30'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
          on ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const integrations = [
  { name: 'Government Health API', desc: 'MoHFW patient & hospital data feed', connected: true },
  { name: 'NHAI Traffic Data', desc: 'Real-time highway congestion & routing', connected: true },
  { name: 'Weather Service', desc: 'Hyperlocal weather for ETA adjustments', connected: true },
  { name: 'Insurance Verification', desc: 'Instant cashless claim pre-authorisation', connected: false },
];

const retentionRows = [
  { label: 'Emergency Records', value: '7 years' },
  { label: 'Patient Data', value: 'Permanent' },
  { label: 'Audit Logs', value: '2 years' },
  { label: 'Analytics Data', value: '3 years' },
];

export default function AdminSettingsPage() {
  // General
  const [appName, setAppName] = useState('LifeLink');
  const [hotline, setHotline] = useState('108');
  const [radius, setRadius] = useState(25);
  const [autoAssign, setAutoAssign] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  // Thresholds
  const [minSeverity, setMinSeverity] = useState(3);
  const [criticalTarget, setCriticalTarget] = useState(4);
  const [maxConcurrent, setMaxConcurrent] = useState(1);
  const [autoEscalation, setAutoEscalation] = useState(8);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  // Save state
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const numStepper = (
    val: number,
    setVal: (v: number) => void,
    min: number,
    max: number,
    suffix = ''
  ) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setVal(Math.max(min, val - 1))}
        className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="min-w-[3rem] text-center text-sm font-semibold">
        {val}{suffix}
      </span>
      <button
        onClick={() => setVal(Math.min(max, val + 1))}
        className="w-7 h-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Configure LifeLink network parameters</p>
        </div>
        <Button onClick={handleSave} className="gap-2 self-start sm:self-auto" variant={saved ? 'outline' : 'default'}>
          {saved ? <Check className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </motion.div>

      {/* ── 1. General Settings ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            <SettingRow label="Application Name" description="Displayed across the platform UI">
              <input
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring w-36 text-right"
              />
            </SettingRow>
            <SettingRow label="Support Hotline" description="Emergency contact number displayed to users">
              <input
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring w-28 text-right font-mono"
              />
            </SettingRow>
            <SettingRow label="Max Dispatch Radius" description="Maximum distance to search for available ambulances">
              {numStepper(radius, setRadius, 5, 100, ' km')}
            </SettingRow>
            <SettingRow label="Auto-assign Ambulance" description="Automatically assign the nearest available unit to an emergency">
              <Toggle on={autoAssign} onChange={setAutoAssign} />
            </SettingRow>
            <SettingRow label="SMS Alerts" description="Send SMS notifications to patients and contacts">
              <Toggle on={smsAlerts} onChange={setSmsAlerts} />
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 2. Emergency Thresholds ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Emergency Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            <SettingRow label="Min Severity for Immediate Dispatch" description="Scale of 1–5; emergencies at or above this level dispatch instantly">
              {numStepper(minSeverity, setMinSeverity, 1, 5, '/5')}
            </SettingRow>
            <SettingRow label="Critical Response Target" description="Target time (minutes) for responding to critical emergencies">
              {numStepper(criticalTarget, setCriticalTarget, 1, 15, ' min')}
            </SettingRow>
            <SettingRow label="Max Concurrent Emergencies per Ambulance" description="Number of active emergencies a single unit handles at once">
              {numStepper(maxConcurrent, setMaxConcurrent, 1, 5)}
            </SettingRow>
            <SettingRow label="Auto-escalation After" description="Escalate to supervisor if emergency is unresolved past this time">
              {numStepper(autoEscalation, setAutoEscalation, 2, 30, ' min')}
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 3. Notification Settings ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-500" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            <SettingRow label="Email Alerts" description="Receive email summaries for critical events and daily reports">
              <Toggle on={emailAlerts} onChange={setEmailAlerts} />
            </SettingRow>
            <SettingRow label="SMS Alerts" description="Get real-time SMS for high-priority emergencies">
              <Toggle on={smsNotif} onChange={setSmsNotif} />
            </SettingRow>
            <SettingRow label="Push Notifications" description="Browser and mobile app push notifications">
              <Toggle on={pushNotif} onChange={setPushNotif} />
            </SettingRow>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 4. API & Integrations ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Link2 className="w-4 h-4 text-sky-500" />
              API &amp; Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {integrations.map((intg) => (
              <div
                key={intg.name}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${
                  intg.connected
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-muted/40 border-border'
                }`}
              >
                <div className="mt-0.5">
                  {intg.connected ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{intg.name}</p>
                    {intg.connected ? (
                      <Badge className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border">Connected</Badge>
                    ) : (
                      <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                        Connect
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{intg.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 5. Data Retention ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-500" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border px-4">
            {retentionRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3.5">
                <p className="text-sm font-medium">{row.label}</p>
                <Badge variant="secondary" className="font-mono text-xs">{row.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── 6. Danger Zone ── */}
      <motion.div variants={fadeUp}>
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <Shield className="w-4 h-4" />
              Danger Zone
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Irreversible actions. Proceed with extreme caution.
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => alert('Network statistics have been reset.')}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Network Statistics
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => alert('Cache cleared successfully.')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Cache
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
              onClick={() => alert('Data export initiated. You will receive a download link via email.')}
            >
              <Download className="w-3.5 h-3.5" />
              Export Full Data
            </Button>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
