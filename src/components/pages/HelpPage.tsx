'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Search,
  BookOpen,
  Siren,
  Navigation,
  FileHeart,
  QrCode,
  Shield,
  ChevronDown,
  MessageCircle,
  Mail,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

// ─── Data ─────────────────────────────────────────────────────────────────────
const categories = [
  { icon: BookOpen, label: 'Getting Started', count: 8, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { icon: Siren, label: 'SOS & Emergency', count: 12, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  { icon: Navigation, label: 'Ambulance Tracking', count: 7, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: FileHeart, label: 'Medical Records', count: 10, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { icon: QrCode, label: 'QR Card', count: 6, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { icon: Shield, label: 'Account & Privacy', count: 9, color: 'text-sky-500', bg: 'bg-sky-500/10' },
];

const faqs = [
  {
    q: 'How do I trigger an SOS?',
    a: 'Open the LifeLink app and tap the large red SOS button on your dashboard. Alternatively, press the physical volume-down button 3 times quickly if the app is running in the background. Your GPS location is captured instantly and shared with the nearest dispatch centre.',
  },
  {
    q: 'What happens after I press SOS?',
    a: 'Immediately: (1) Your GPS coordinates are sent to the nearest dispatch centre. (2) Our system locates the closest available ambulance. (3) The ambulance is assigned and dispatched within seconds. (4) You receive a confirmation with the driver\'s name, vehicle number, and live ETA. (5) Your emergency contacts are notified via SMS.',
  },
  {
    q: 'How accurate is the GPS tracking?',
    a: 'LifeLink uses a combination of GPS, Wi-Fi triangulation, and cell-tower data to achieve location accuracy within 5–15 metres in open areas. Indoors, accuracy may reduce to 30–50 metres. We continuously update your location every 3 seconds during an active emergency.',
  },
  {
    q: 'Can I add emergency contacts?',
    a: 'Yes. Go to Profile → Emergency Contacts and add up to 5 people. They will receive an SMS with your location and ambulance details the moment an SOS is triggered. You can set a priority order and specify relationship types (family, friend, doctor).',
  },
  {
    q: 'What medical info should I store?',
    a: 'We recommend storing: blood type, known allergies (especially drug allergies), chronic conditions (diabetes, hypertension, epilepsy), current medications with dosages, and your primary physician\'s contact. This information is embedded in your Medical QR Card and shared with paramedics on arrival.',
  },
  {
    q: 'How do I track my ambulance?',
    a: 'After an SOS is confirmed, a live tracking screen appears automatically. You can also open it via Home → Track Ambulance. The map shows the ambulance\'s real-time position, the optimised route, and a precise ETA that updates every few seconds.',
  },
  {
    q: 'What is a Medical QR Card?',
    a: 'A Medical QR Card is a digital card unique to your profile. When scanned by any smartphone camera or QR reader, it instantly displays your critical medical information — blood type, allergies, conditions, and emergency contacts — without requiring the rescuer to log in or have the app installed.',
  },
  {
    q: 'Is my data secure?',
    a: 'Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). LifeLink is HIPAA and DPDP Act 2023 compliant. Medical data is stored on India-located servers, never sold to third parties, and access is logged for every query. You can export or delete your data at any time from Settings → Privacy.',
  },
  {
    q: 'What if I press SOS by mistake?',
    a: 'A 10-second countdown screen appears immediately after pressing SOS. Tap "Cancel" to abort. If the dispatch is already confirmed, call the support line at 1800-200-1080 — our team can call off the ambulance within the first 2 minutes at no charge. Repeated false alarms may result in a review of your account.',
  },
  {
    q: 'How do I update my medical profile?',
    a: 'Go to Profile → Medical Information. Tap any field to edit. Changes are saved in real time and automatically reflected in your QR Card. We recommend reviewing your medical profile every 6 months or after any change in medication or health status.',
  },
  {
    q: 'What areas does LifeLink cover?',
    a: 'LifeLink currently operates in 200+ cities across India, including all Tier-1 and major Tier-2 cities. We are expanding to Tier-3 cities monthly. Check Home → Coverage Map for the full list. If your area isn\'t listed, you can join the waitlist — we prioritise expansion based on demand.',
  },
  {
    q: 'How can I give feedback?',
    a: 'After each emergency, a feedback prompt appears automatically. You can also rate any past trip from History → [Trip] → Rate. For general feedback, go to Profile → Feedback or email feedback@lifelink.in. We read every response — your input directly shapes our service improvements.',
  },
];

const tutorials = [
  { title: 'Getting Started with LifeLink', duration: '3:42', thumb: 'from-blue-500 to-violet-500' },
  { title: 'How to Use SOS in an Emergency', duration: '2:18', thumb: 'from-rose-500 to-orange-500' },
  { title: 'Setting Up Your Medical QR Card', duration: '4:05', thumb: 'from-emerald-500 to-teal-500' },
];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6">

      {/* ── Gradient Header ── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-700 p-6 md:p-8 text-white"
      >
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-6 h-6 opacity-80" />
            <Badge className="bg-white/20 text-white border-white/30 text-xs">24/7 Support</Badge>
          </div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-white/80 mt-1 text-sm">We're here 24/7 to keep you safe and informed.</p>
        </div>
      </motion.div>

      {/* ── Emergency Box ── */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 md:p-5">
          <div>
            <p className="text-rose-600 dark:text-rose-400 font-bold text-base">In an emergency? Call 108 immediately.</p>
            <p className="text-sm text-muted-foreground mt-0.5">Free emergency ambulance service · Available 24/7 · All across India</p>
          </div>
          <a href="tel:108">
            <Button className="gap-2 bg-rose-600 hover:bg-rose-700 text-white shrink-0 text-base px-6 h-11">
              <Phone className="w-5 h-5" />
              Call 108
            </Button>
          </a>
        </div>
      </motion.div>

      {/* ── Search bar ── */}
      <motion.div variants={fadeUp}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles, guides, FAQs…"
            className="w-full bg-background border rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </motion.div>

      {/* ── Category Grid ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.label}
                whileHover={{ y: -3, scale: 1.03 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border bg-card hover:shadow-md transition-shadow text-center cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                </div>
                <p className="text-xs font-semibold leading-snug">{cat.label}</p>
                <p className="text-[10px] text-muted-foreground">{cat.count} articles</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── FAQ Accordion ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border rounded-xl overflow-hidden transition-colors bg-card hover:bg-muted/20"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3.5 text-left gap-3"
                onClick={() => toggleFaq(i)}
              >
                <span className="text-sm font-medium flex-1">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Contact Support ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold">Live Chat</p>
                <p className="text-xs text-muted-foreground mt-0.5">Connect instantly with a support agent</p>
              </div>
              <Badge className="w-fit bg-emerald-500/10 text-emerald-600 border-emerald-500/20 border text-xs">24/7 Available</Badge>
              <Button size="sm" className="w-full gap-2">
                <MessageCircle className="w-3.5 h-3.5" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-bold">Email Support</p>
                <p className="text-xs text-muted-foreground mt-0.5">support@lifelink.in</p>
              </div>
              <Badge variant="secondary" className="w-fit text-xs">Response within 2 hours</Badge>
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Mail className="w-3.5 h-3.5" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold">Phone</p>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Emergency: <span className="text-rose-600 font-bold">108</span>
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  Support: <span className="font-semibold text-foreground">1800-200-1080</span>
                </p>
              </div>
              <Badge variant="secondary" className="w-fit text-xs">Toll-free · 24/7</Badge>
              <a href="tel:18002001080">
                <Button size="sm" variant="outline" className="w-full gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  Call Now
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ── Video Tutorials ── */}
      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Video Tutorials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tutorials.map((vid, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              {/* Thumbnail */}
              <div className={`relative h-40 bg-gradient-to-br ${vid.thumb} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="relative z-10 w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-gray-800" />
                </div>
                <Badge className="absolute bottom-3 right-3 bg-black/60 text-white border-0 text-xs">
                  {vid.duration}
                </Badge>
              </div>
              <CardContent className="p-3">
                <p className="text-sm font-semibold leading-snug">{vid.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">LifeLink Official</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}
