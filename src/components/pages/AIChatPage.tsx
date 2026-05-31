'use client';
import { useSession } from 'next-auth/react';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Bot, Send, Siren, Sparkles, Brain, Heart, Thermometer, Pill,
  Activity, AlertTriangle, ChevronRight, Mic, MicOff, X, Clock,
  Zap, Shield, RefreshCw, MessageCircle, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/store';
import { cn } from '@/lib/utils';

// ─── Medical knowledge base ──────────────────────────────────────────────────
interface QA { q: string; a: string; severity: number; tags: string[] }

const MEDICAL_QA: QA[] = [
  {
    q: 'chest pain',
    a: '🚨 **Chest pain can be life-threatening.** Possible causes include heart attack, angina, or pulmonary embolism.\n\n**Immediate steps:**\n• Call emergency services (108) NOW if pain is severe, crushing, or spreads to your arm/jaw\n• Chew aspirin (325mg) if not allergic and no contraindications\n• Rest in a comfortable position\n• Loosen tight clothing\n\n⚠️ Do NOT wait to see if it improves — seek emergency care immediately.',
    severity: 5, tags: ['heart', 'emergency', 'chest'],
  },
  {
    q: 'breathlessness shortness of breath difficulty breathing',
    a: '⚠️ **Breathing difficulty requires immediate attention.**\n\nPossible causes: asthma, COPD, pneumonia, heart failure, anxiety attack, or COVID-19.\n\n**What to do:**\n• Sit upright — don\'t lie flat\n• Use your inhaler if you have asthma\n• If severe or sudden: call 108 immediately\n• Avoid over-exertion\n\nMonitor oxygen saturation if you have a pulse oximeter. Below 94% is a warning sign.',
    severity: 4, tags: ['respiratory', 'emergency'],
  },
  {
    q: 'fever high temperature',
    a: '🌡️ **Fever (temperature above 38°C/100.4°F)** is your body fighting an infection.\n\n**Management:**\n• Take paracetamol (500–1000mg) or ibuprofen to reduce fever\n• Stay hydrated — drink plenty of fluids\n• Rest and avoid strenuous activity\n• Wear light clothing; use a cool compress\n\n**Seek emergency care if:**\n• Temperature > 39.5°C (103°F)\n• Fever with stiff neck, rash, or confusion\n• Infant under 3 months with any fever\n• Lasts more than 3 days without improvement',
    severity: 2, tags: ['fever', 'infection'],
  },
  {
    q: 'headache migraine head pain',
    a: '🧠 **Headache types and what they mean:**\n\n• **Tension headache**: Tight band around head — rest, hydrate, paracetamol\n• **Migraine**: Throbbing, nausea, light sensitivity — dark quiet room, prescribed medication\n• **Cluster headache**: Severe, around one eye — requires medical treatment\n\n**⚠️ Seek immediate care if:**\n• Sudden "thunderclap" headache (worst of your life)\n• Headache with fever + stiff neck\n• Headache after head injury\n• With visual changes, weakness, or confusion',
    severity: 2, tags: ['head', 'neurology'],
  },
  {
    q: 'stomach pain abdominal pain belly ache',
    a: '🫁 **Abdominal pain assessment:**\n\nLocation matters:\n• **Upper right**: Could be gallbladder or liver\n• **Lower right**: Possible appendicitis — seek care if severe\n• **Central**: Possible stomach ulcer or gastritis\n• **Lower left**: IBS, constipation, or diverticulitis\n\n**Home remedies for mild pain:**\n• Rest and avoid solid food temporarily\n• Peppermint tea for gas/bloating\n• Heating pad for cramps\n\n**Go to ER if:** Severe, sudden, or with fever, vomiting blood, or rigid abdomen.',
    severity: 2, tags: ['abdomen', 'stomach', 'digestion'],
  },
  {
    q: 'dizziness vertigo spinning',
    a: '💫 **Dizziness / Vertigo:**\n\nCommon causes:\n• Benign positional vertigo (BPPV)\n• Low blood pressure (dehydration)\n• Inner ear infection\n• Anemia or low blood sugar\n\n**Self-care:**\n• Sit or lie down immediately\n• Move slowly when changing position\n• Stay hydrated and eat something\n\n**Seek care if:** Dizziness with chest pain, severe headache, double vision, or falls.',
    severity: 2, tags: ['dizziness', 'balance', 'vertigo'],
  },
  {
    q: 'heart attack stroke signs symptoms',
    a: '🆘 **CRITICAL — CALL 108 NOW**\n\n**Heart Attack signs (FAST):**\n• Chest pressure/pain spreading to arm or jaw\n• Shortness of breath\n• Nausea, cold sweat\n• Pain can start mild and worsen\n\n**Stroke signs (BE-FAST):**\n• **B**alance loss\n• **E**yes: sudden vision change\n• **F**ace drooping\n• **A**rm weakness\n• **S**peech difficulty\n• **T**ime — call 108 immediately\n\nEvery minute counts. Do not drive yourself — call an ambulance.',
    severity: 5, tags: ['heart', 'stroke', 'emergency'],
  },
  {
    q: 'bleeding wound cut injury',
    a: '🩹 **First aid for bleeding:**\n\n**Immediate steps:**\n1. Apply direct pressure with a clean cloth\n2. Elevate the injured limb above heart level\n3. Do NOT remove embedded objects\n4. If blood soaks through, add more cloth — don\'t remove the original\n\n**Seek emergency care if:**\n• Bleeding doesn\'t stop after 10–15 minutes of pressure\n• Deep wound or wound from puncture/bite\n• Signs of infection: redness, warmth, pus after 24hrs\n• Large or gaping wound needing stitches',
    severity: 3, tags: ['wound', 'injury', 'first aid'],
  },
  {
    q: 'allergy allergic reaction rash hives',
    a: '⚠️ **Allergic reactions — watch severity:**\n\n**Mild (local rash, itching):**\n• Antihistamine (cetirizine or loratadine)\n• Cool compress on rash\n• Avoid the allergen\n\n**🚨 Anaphylaxis (severe — CALL 108):**\n• Throat swelling, difficulty breathing\n• Dizziness, rapid heartbeat\n• Widespread hives + vomiting\n• If you have an EpiPen: USE IT NOW\n• Lie flat with legs elevated',
    severity: 4, tags: ['allergy', 'rash', 'anaphylaxis'],
  },
  {
    q: 'diabetes blood sugar low high',
    a: '💉 **Diabetes emergencies:**\n\n**Hypoglycemia (low sugar < 70 mg/dL):**\n• Shakiness, sweating, confusion, rapid heartbeat\n• **Action**: 15g fast sugar (glucose tablets, 4oz juice, regular soda)\n• Recheck in 15 minutes\n• If unconscious: call 108\n\n**Hyperglycemia (high sugar > 180 mg/dL):**\n• Excessive thirst, frequent urination, fatigue, blurred vision\n• **Action**: Stay hydrated, take prescribed insulin if instructed\n• If > 300 mg/dL or ketones present: seek emergency care',
    severity: 3, tags: ['diabetes', 'blood sugar', 'endocrine'],
  },
  {
    q: 'fracture broken bone injury',
    a: '🦴 **Suspected fracture — first aid:**\n\n1. **Immobilize**: Don\'t try to straighten or move the limb\n2. **Splint**: Use firm material (board, folded magazine) padded with cloth\n3. **Ice**: Apply ice pack (wrapped in cloth) to reduce swelling\n4. **Elevate**: If possible, raise the limb\n\n**Go to ER immediately if:**\n• Bone is visible through skin (open fracture)\n• Loss of sensation or circulation below fracture\n• Suspected spinal or skull fracture\n• Joint fractures (hip, knee, shoulder)\n\nDo not eat or drink in case surgery is needed.',
    severity: 3, tags: ['fracture', 'bone', 'injury'],
  },
  {
    q: 'burn scalding fire heat injury',
    a: '🔥 **Burn treatment:**\n\n**Minor burns (1st degree — red, painful, no blisters):**\n• Cool under running cold water for 10–20 minutes\n• Do NOT use ice, butter, or toothpaste\n• Cover loosely with clean bandage\n• Aloe vera gel or burn cream\n\n**🚨 Seek emergency care if:**\n• Burn larger than palm size\n• Chemical, electrical, or inhalation burns\n• Burns on face, hands, genitals, or joints\n• White/charred skin (3rd degree — may be painless)\n• Child or elderly patient',
    severity: 3, tags: ['burn', 'injury', 'first aid'],
  },
  {
    q: 'anxiety panic attack stress mental health',
    a: '🧘 **Panic Attack vs Medical Emergency:**\n\nPanic attack symptoms (usually peak in 10 min):\n• Racing heart, chest tightness (not crushing)\n• Shortness of breath, tingling hands/face\n• Feeling of doom or unreality\n\n**Coping strategies:**\n• **4-7-8 breathing**: Inhale 4s, hold 7s, exhale 8s\n• Ground yourself: Name 5 things you see, 4 you hear, 3 you touch\n• Sit in a safe, quiet space\n• Reassure yourself: "This will pass"\n\n**Seek help if:** First-time episode (rule out cardiac causes), attacks are frequent, or affecting daily life.',
    severity: 2, tags: ['anxiety', 'mental health', 'panic'],
  },
  {
    q: 'dehydration heat stroke sun',
    a: '☀️ **Dehydration & Heat-related illness:**\n\n**Mild dehydration:**\n• Drink water or ORS (oral rehydration solution)\n• Rest in a cool place\n• Avoid caffeinated/alcoholic beverages\n\n**Heat Exhaustion (heavy sweating, weakness, cool pale skin):**\n• Move to cool area\n• Loosen clothing, apply cool wet cloths\n• Sip cool water\n\n**🚨 Heat Stroke (medical emergency):**\n• Hot, red, DRY skin — NO sweating\n• Temp above 40°C (104°F)\n• Confusion, seizures, unconsciousness\n• **CALL 108** — cool with ice/water while waiting',
    severity: 4, tags: ['heat', 'dehydration', 'summer'],
  },
  {
    q: 'cough cold flu respiratory infection',
    a: '🤧 **Cold vs Flu vs COVID:**\n\n| Feature | Cold | Flu | COVID |\n|---------|------|-----|-------|\n| Onset | Gradual | Sudden | Gradual |\n| Fever | Rare | Common | Common |\n| Body aches | Mild | Severe | Moderate |\n| Loss of smell | No | Sometimes | Classic sign |\n\n**Self-care:**\n• Rest and fluids\n• Honey-ginger-lemon tea\n• Steam inhalation\n• Paracetamol for fever/aches\n\n**Seek care if:** Fever > 39.5°C, breathing difficulty, lasts > 10 days, or in high-risk group.',
    severity: 1, tags: ['cold', 'flu', 'respiratory'],
  },
  {
    q: 'vomiting nausea throwing up',
    a: '🤢 **Nausea & Vomiting management:**\n\n**Immediate relief:**\n• Sip small amounts of clear fluids (water, ginger ale, broth)\n• Avoid solid food until nausea passes\n• BRAT diet when reintroducing food: Bananas, Rice, Applesauce, Toast\n• Ginger tea or ginger candies\n\n**⚠️ Seek care if:**\n• Vomiting blood or coffee-ground material\n• Severe abdominal pain with vomiting\n• Signs of dehydration: dry mouth, dark urine, no urine in 8hrs\n• Vomiting after head injury\n• Cannot keep fluids down > 24 hours',
    severity: 2, tags: ['vomiting', 'nausea', 'digestion'],
  },
  {
    q: 'blood pressure hypertension low high',
    a: '💊 **Blood Pressure guide:**\n\n**Normal**: < 120/80 mmHg\n**Elevated**: 120-129/< 80\n**Stage 1 High**: 130-139/80-89\n**Stage 2 High**: ≥ 140/90\n**Crisis**: > 180/120 — **CALL 108**\n\n**Managing high BP at home:**\n• Take prescribed medications consistently\n• Low sodium diet\n• Reduce stress\n• Avoid caffeine and alcohol\n\n**Hypertensive crisis symptoms:** Severe headache, vision changes, chest pain, difficulty breathing — emergency care immediately.',
    severity: 3, tags: ['blood pressure', 'heart', 'hypertension'],
  },
  {
    q: 'first aid cpr resuscitation unconscious',
    a: '⚡ **CPR - Quick Guide:**\n\n**Check scene safety, then:**\n\n1. **Check response**: Tap shoulders, shout "Are you OK?"\n2. **Call 108** immediately\n3. **30 chest compressions**:\n   - Heel of hand on center of chest\n   - 2 inches deep, 100-120/min\n   - "Stayin\' Alive" beat\n4. **2 rescue breaths** (if trained):\n   - Tilt head, lift chin\n   - Seal lips, breathe until chest rises\n5. **Repeat** 30:2 until help arrives or AED is used\n\n**AED**: Turn on, follow voice instructions — safe to use.',
    severity: 5, tags: ['cpr', 'emergency', 'first aid'],
  },
  {
    q: 'food poisoning stomach food',
    a: '🍕 **Food Poisoning:**\n\nSymptoms usually start 30 min – 8 hrs after eating. Nausea, vomiting, diarrhea, cramps, sometimes fever.\n\n**Home management:**\n• Stay hydrated — ORS or sports drinks\n• Rest the gut — clear liquids for first 4-6 hours\n• BRAT diet as you recover\n• Avoid dairy, caffeine, alcohol, fatty foods\n\n**Seek care if:**\n• Blood in stool or vomit\n• High fever (> 38.5°C)\n• Can\'t keep fluids down\n• Symptoms > 3 days\n• Neurological symptoms (blurred vision, muscle weakness)',
    severity: 2, tags: ['food poisoning', 'digestion', 'diarrhea'],
  },
];

// ─── Suggested quick prompts ─────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { icon: Heart, label: 'Chest Pain', query: 'I have chest pain', color: 'text-red-500 bg-red-500/10' },
  { icon: Thermometer, label: 'High Fever', query: 'I have a high fever', color: 'text-orange-500 bg-orange-500/10' },
  { icon: Brain, label: 'Headache', query: 'I have a severe headache', color: 'text-violet-500 bg-violet-500/10' },
  { icon: Activity, label: 'Breathing Issues', query: 'I have difficulty breathing', color: 'text-blue-500 bg-blue-500/10' },
  { icon: Pill, label: 'CPR Guide', query: 'Show me CPR instructions', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: Zap, label: 'First Aid', query: 'I have a bleeding wound', color: 'text-amber-500 bg-amber-500/10' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  severity?: number;
  timestamp: Date;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function getAnswer(query: string): { answer: string; severity: number } {
  const q = query.toLowerCase();
  for (const item of MEDICAL_QA) {
    if (item.tags.some((t) => q.includes(t)) || item.q.split(' ').some((w) => q.includes(w))) {
      return { answer: item.a, severity: item.severity };
    }
  }
  return {
    answer: `I understand you're asking about: **"${query}"**\n\nI'm an AI medical assistant and can help with general health information. For a precise assessment of your condition, please consult a qualified healthcare professional.\n\n**General advice:**\n• Monitor your symptoms carefully\n• Stay hydrated and rest\n• Seek emergency care (call 108) if symptoms are severe, sudden, or worsening\n\nFeel free to describe your symptoms in more detail — I can provide more targeted guidance.`,
    severity: 1,
  };
}

const SEVERITY_MAP: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: 'Mild', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800' },
  2: { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800' },
  3: { label: 'Serious', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800' },
  4: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800' },
  5: { label: 'Emergency', color: 'text-red-700', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-400 dark:border-red-700' },
};

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
          return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-1 shrink-0 w-1.5 h-1.5 rounded-full bg-current opacity-60 mt-2" />
              <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </div>
          );
        }
        if (line.startsWith('🚨') || line.startsWith('⚠️') || line.startsWith('🆘')) {
          return <p key={i} className="font-semibold" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
        }
        if (line.trim() === '') return <div key={i} className="h-1" />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
      })}
    </div>
  );
}

// ─── Animated typing indicator ────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// ─── Animated neural background orbs ─────────────────────────────────────────
function NeuralBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        { cx: '10%', cy: '20%', r: 200, color: '#6366f1', delay: 0 },
        { cx: '85%', cy: '15%', r: 180, color: '#ec4899', delay: 1 },
        { cx: '70%', cy: '80%', r: 220, color: '#3b82f6', delay: 2 },
        { cx: '20%', cy: '75%', r: 160, color: '#10b981', delay: 1.5 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-[0.06] dark:opacity-[0.08]"
          style={{ left: orb.cx, top: orb.cy, width: orb.r * 2, height: orb.r * 2, backgroundColor: orb.color, transform: 'translate(-50%,-50%)' }}
          animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, delay: orb.delay }}
        />
      ))}
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]">
        <defs>
          <pattern id="neural-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AIChatPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { setCurrentPage } = useNavigationStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionSeverity, setSessionSeverity] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Always-current ref so sendMessage never captures stale state
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setShowWelcome(false);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = [...messagesRef.current, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const answer: string = data.message ?? 'Sorry, I could not get a response. Please try again.';
      const severity: number = data.severity ?? 1;
      setSessionSeverity((prev) => Math.max(prev, severity));
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, severity, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const { answer, severity } = getAnswer(text);
      setSessionSeverity((prev) => Math.max(prev, severity));
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer, severity, timestamp: new Date() };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleQuickPrompt = (query: string) => { sendMessage(query); };
  const handleClear = () => { setMessages([]); setSessionSeverity(0); setShowWelcome(true); };

  const maxSev = SEVERITY_MAP[sessionSeverity] ?? null;

  return (
    <div className="relative flex flex-col h-full min-h-screen overflow-hidden bg-background">
      <NeuralBackground />

      {/* ── Header ── */}
      <div className="relative z-10 shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
                animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.3)', '0 0 40px rgba(139,92,246,0.5)', '0 0 20px rgba(139,92,246,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">AI Medical Assistant</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                Powered by LifeLink Medical AI · Always online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {maxSev && sessionSeverity >= 4 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => setCurrentPage('sos')}
                >
                  <Siren className="w-3.5 h-3.5" />
                  SOS Emergency
                </Button>
              </motion.div>
            )}
            {messages.length > 0 && (
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs h-8" onClick={handleClear}>
                <RefreshCw className="w-3.5 h-3.5" />
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Severity bar */}
        <AnimatePresence>
          {maxSev && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={cn('px-4 py-2 border-t text-xs font-medium flex items-center gap-2', maxSev.bg, maxSev.border, maxSev.color)}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Session severity: <span className="font-bold">{maxSev.label}</span>
              {sessionSeverity >= 4 && ' — Emergency services may be needed. Tap "SOS Emergency" above.'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Messages area ── */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Welcome screen */}
          <AnimatePresence>
            {showWelcome && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8 space-y-8"
              >
                <motion.div
                  className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/30"
                  animate={{ rotateY: [0, 10, 0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  style={{ perspective: 800, transformStyle: 'preserve-3d' }}
                >
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    Hello{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    I'm your AI Medical Assistant. Describe your symptoms or health concerns and I'll provide guidance, triage assessment, and first-aid advice.
                  </p>
                  <Badge variant="outline" className="gap-1 text-xs mt-1">
                    <Shield className="w-3 h-3" />
                    For emergencies always call 108
                  </Badge>
                </div>

                {/* Quick prompts */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                  {QUICK_PROMPTS.map((p, i) => (
                    <motion.button
                      key={p.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.08 }}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleQuickPrompt(p.query)}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/60 bg-card/60 hover:bg-card hover:border-border hover:shadow-md backdrop-blur-sm transition-all duration-200 text-left group"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', p.color)}>
                        <p.icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-center leading-tight">{p.label}</span>
                    </motion.button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Or type your question below to get started
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message bubbles */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div className={cn(
                  'shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gradient-to-br from-violet-600 to-blue-600 text-white',
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={cn('max-w-[85%] sm:max-w-[75%] space-y-1', msg.role === 'user' && 'items-end flex flex-col')}>
                  {msg.role === 'assistant' && msg.severity && msg.severity >= 2 && (
                    <div className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', SEVERITY_MAP[msg.severity]?.bg, SEVERITY_MAP[msg.severity]?.color, SEVERITY_MAP[msg.severity]?.border)}>
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {SEVERITY_MAP[msg.severity]?.label}
                    </div>
                  )}
                  <div className={cn(
                    'rounded-2xl px-4 py-3 shadow-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card border border-border/60 rounded-tl-sm',
                    msg.severity === 5 && msg.role === 'assistant' && 'border-red-300 dark:border-red-800',
                  )}>
                    {msg.role === 'user'
                      ? <p className="text-sm">{msg.content}</p>
                      : <RenderMarkdown text={msg.content} />}
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {/* SOS CTA for high severity */}
                  {msg.role === 'assistant' && msg.severity && msg.severity >= 4 && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-2 h-8 text-xs mt-1 shadow-sm shadow-red-500/20"
                        onClick={() => setCurrentPage('sos')}
                      >
                        <Siren className="w-3.5 h-3.5" />
                        Trigger SOS Emergency
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex gap-3"
              >
                <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="relative z-10 shrink-0 border-t border-border/60 bg-background/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a medical question…"
                className="w-full h-12 px-5 pr-12 rounded-2xl border border-border/80 bg-card/80 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 backdrop-blur-sm transition-all duration-200"
                disabled={isTyping}
                autoFocus
              />
              {input && (
                <button
                  type="button"
                  onClick={() => setInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={!input.trim() || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200',
                input.trim() && !isTyping
                  ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
            >
              {isTyping
                ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><RefreshCw className="w-5 h-5" /></motion.div>
                : <Send className="w-5 h-5" />}
            </motion.button>
          </form>

          <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
            AI responses are for informational purposes only. Always consult a licensed medical professional for diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
}
