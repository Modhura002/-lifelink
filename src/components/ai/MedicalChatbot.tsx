'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, MessageCircle, Minimize2, Stethoscope, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigationStore } from '@/store';
import { TRIAGE_RULES, SEVERITY_LABELS } from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  severity?: number;
}

const MEDICAL_QA: Array<{ keywords: string[]; answer: string; severity?: number }> = [
  {
    keywords: ['blood pressure', 'bp', 'hypertension', 'hypotension'],
    answer:
      'Normal blood pressure is below 120/80 mmHg. High blood pressure (hypertension) is 130/80 or above. Low blood pressure (hypotension) is below 90/60. If you have consistently high readings, consult a doctor.',
  },
  {
    keywords: ['heart rate', 'pulse', 'bpm', 'heartbeat'],
    answer:
      'A normal resting heart rate for adults is 60–100 beats per minute (bpm). Athletes may have lower rates (40–60 bpm). If your heart rate is consistently above 100 or below 60 at rest, see a doctor.',
  },
  {
    keywords: ['fever', 'temperature', 'hot', 'chills'],
    answer:
      'Normal body temperature is around 37°C (98.6°F). A fever is defined as 38°C (100.4°F) or above. Drink plenty of fluids, rest, and take paracetamol/ibuprofen as directed. Seek emergency care if fever exceeds 40°C or is accompanied by stiff neck, rash, or confusion.',
  },
  {
    keywords: ['diabetes', 'blood sugar', 'glucose', 'insulin'],
    answer:
      'Normal fasting blood sugar is 70–100 mg/dL. Diabetes is typically diagnosed when fasting blood sugar is 126 mg/dL or higher on two separate tests. Common symptoms include frequent urination, excessive thirst, and fatigue. Regular monitoring and lifestyle changes are key.',
  },
  {
    keywords: ['headache', 'migraine', 'head pain', 'head ache'],
    answer:
      'Most headaches are tension or migraine types. For tension headaches, rest and OTC pain relievers help. Migraines may need specific medication. Seek emergency care for sudden severe headache (thunderclap), headache with fever/stiff neck, or headache after head injury.',
  },
  {
    keywords: ['cold', 'flu', 'cough', 'runny nose', 'sore throat'],
    answer:
      'Common cold symptoms include runny nose, sore throat, and mild cough. Flu is more severe with sudden fever, body aches, and fatigue. Rest, fluids, and OTC medications help. See a doctor if symptoms persist beyond 10 days or you have difficulty breathing.',
  },
  {
    keywords: ['dehydration', 'thirsty', 'dry mouth', 'dizzy'],
    answer:
      'Signs of dehydration include dry mouth, dark urine, dizziness, and fatigue. Adults should drink 8–10 glasses of water daily. For mild dehydration, drink water or electrolyte drinks. Severe dehydration (very dark urine, confusion, rapid heartbeat) requires medical attention.',
  },
  {
    keywords: ['asthma', 'wheezing', 'inhaler', 'breathing', 'shortness of breath'],
    answer:
      'Asthma causes airway inflammation and breathing difficulty. Use your prescribed rescue inhaler during an attack. Stay away from triggers (dust, smoke, allergens). Seek emergency care if your inhaler isn\'t helping or you\'re struggling to breathe or speak.',
  },
  {
    keywords: ['allergies', 'allergy', 'allergic', 'anaphylaxis', 'hives'],
    answer:
      'Common allergy symptoms include sneezing, itchy eyes, and skin rashes. Antihistamines help mild reactions. Anaphylaxis (severe allergic reaction) with throat swelling, difficulty breathing, or low blood pressure is a medical emergency — use an EpiPen and call 108 immediately.',
  },
  {
    keywords: ['stomach', 'abdominal', 'nausea', 'vomiting', 'diarrhea', 'gastro'],
    answer:
      'Stomach issues often resolve with rest, bland foods, and fluids. Avoid dairy and fatty foods. ORS (Oral Rehydration Solution) helps with diarrhea. Seek care for severe pain, bloody stools, vomiting for more than 24 hours, or signs of dehydration.',
  },
  {
    keywords: ['fracture', 'broken bone', 'sprain', 'bone'],
    answer:
      'For suspected fractures, immobilize the area, apply ice (wrapped in cloth), and seek medical care. Do not try to realign bones. For sprains, use RICE: Rest, Ice, Compression, Elevation. X-rays are needed to confirm fractures.',
  },
  {
    keywords: ['burn', 'scalded', 'fire', 'hot water'],
    answer:
      'For minor burns (small, superficial): cool under running water for 10–20 min, cover with a clean bandage. Do NOT use ice, butter, or toothpaste. For major burns (large area, blistering, or involving face/hands), call 108 immediately.',
  },
  {
    keywords: ['stroke', 'face drooping', 'arm weakness', 'speech', 'fast'],
    answer:
      'Use the FAST test: Face drooping, Arm weakness, Speech difficulty, Time to call emergency. Stroke is a medical emergency. Call 108 immediately. Every minute counts — early treatment can save brain cells.',
  },
  {
    keywords: ['heart attack', 'chest pain', 'chest tightness', 'left arm'],
    answer:
      'Signs of a heart attack: chest pain/pressure, pain spreading to arm/jaw/back, shortness of breath, sweating, nausea. Call 108 immediately. Chew aspirin (if not allergic and advised). Do not drive yourself to the hospital.',
  },
  {
    keywords: ['covid', 'coronavirus', 'covid-19', 'corona'],
    answer:
      'COVID-19 symptoms: fever, cough, fatigue, loss of smell/taste. Isolate immediately and get tested. Most cases recover at home with rest and fluids. Seek emergency care for difficulty breathing, persistent chest pain, or confusion.',
  },
  {
    keywords: ['medication', 'medicine', 'drug', 'dosage', 'side effect'],
    answer:
      'Always follow prescription instructions for medications. Never exceed recommended dosages. Common OTC medications: paracetamol for pain/fever, antacids for indigestion, antihistamines for allergies. Consult a pharmacist or doctor for drug interactions.',
  },
  {
    keywords: ['pregnancy', 'pregnant', 'prenatal', 'maternal'],
    answer:
      'During pregnancy, regular prenatal check-ups are essential. Avoid alcohol, smoking, and certain medications. Take folic acid supplements. Seek emergency care for heavy bleeding, severe abdominal pain, or reduced fetal movement.',
  },
  {
    keywords: ['anxiety', 'stress', 'panic attack', 'mental health', 'depression'],
    answer:
      'Mental health is as important as physical health. For anxiety/panic attacks: slow your breathing (4 sec in, 4 sec hold, 4 sec out). Practice mindfulness and regular exercise. Seek professional help from a psychologist or psychiatrist for persistent symptoms.',
  },
  {
    keywords: ['first aid', 'cpr', 'resuscitation', 'unconscious'],
    answer:
      'Basic CPR: Check responsiveness, call 108, then do 30 chest compressions (hard and fast, 100–120/min) followed by 2 rescue breaths. Repeat until help arrives. If untrained, do hands-only CPR (compressions without breaths).',
  },
];

const INITIAL_MSG: Message = {
  id: 'init',
  role: 'ai',
  content:
    "Hi! I'm your LifeLink Medical Assistant. Ask me anything about symptoms, conditions, first aid, or general health questions. For emergencies, please use the SOS button immediately.",
  timestamp: new Date(),
};

function getAnswer(question: string): { content: string; severity?: number } {
  const lower = question.toLowerCase();

  for (const qa of MEDICAL_QA) {
    if (qa.keywords.some((kw) => lower.includes(kw))) {
      return { content: qa.answer, severity: qa.severity };
    }
  }

  for (const rule of TRIAGE_RULES) {
    const matchCount = rule.keywords.filter((kw) => lower.includes(kw.toLowerCase())).length;
    if (matchCount >= 1) {
      const label = ['LOW', 'MODERATE', 'SERIOUS', 'CRITICAL', 'EXTREME'][rule.severity - 1];
      return {
        content: `Based on your description, this sounds like a **${label}** severity concern.\n\nPossible conditions: ${rule.conditions.join(', ')}.\n\nImmediate actions:\n${rule.actions.map((a) => `• ${a}`).join('\n')}\n\n${
          rule.severity >= 4
            ? 'This requires IMMEDIATE medical attention. Please use the SOS button or call 108 now.'
            : rule.severity === 3
            ? 'Please seek medical attention soon.'
            : 'Monitor your condition and consult a doctor if symptoms worsen.'
        }`,
        severity: rule.severity,
      };
    }
  }

  return {
    content:
      "I'm not sure about that specific question. For medical emergencies, always call 108 or use the SOS button. For general health queries, I recommend consulting a licensed healthcare professional. You can also ask me about: symptoms, first aid, blood pressure, heart rate, diabetes, fever, and more.",
  };
}

export default function MedicalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { setCurrentPage, currentPage } = useNavigationStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Always-current ref so sendMessage never reads stale messages state
  const messagesRef = useRef<Message[]>([INITIAL_MSG]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;
      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      try {
        const history = [...messagesRef.current, userMsg].map((m) => ({ role: m.role === 'ai' ? 'assistant' : m.role, content: m.content }));
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const content: string = data.message ?? 'Sorry, I could not get a response.';
        const severity: number | undefined = data.severity;
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'ai', content, timestamp: new Date(), severity },
        ]);
      } catch {
        const { content, severity } = getAnswer(text);
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'ai', content, timestamp: new Date(), severity },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [isTyping]
  );

  // Hide floating chatbot on the dedicated AI chat page — after all hooks
  if (currentPage === 'ai-chat') return null;

  const QUICK_QUESTIONS = [
    'Normal blood pressure?',
    'Fever treatment',
    'Signs of stroke',
    'CPR steps',
    'Dehydration symptoms',
  ];

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Medical Assistant"
        aria-label="Open medical chatbot"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Stethoscope className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-40 right-4 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border border-border bg-card flex flex-col"
            style={{ maxHeight: 'min(520px, calc(100vh - 200px))' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">Medical Assistant</p>
                <p className="text-[10px] opacity-70">AI-powered health guidance</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-hidden" ref={scrollRef}>
              <ScrollArea className="h-full">
                <div className="p-3 space-y-3">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                          msg.role === 'ai' ? 'bg-primary/10' : 'bg-muted'
                        }`}
                      >
                        {msg.role === 'ai' ? (
                          <Bot className="w-3 h-3 text-primary" />
                        ) : (
                          <User className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className={`max-w-[82%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-muted text-foreground rounded-tl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        {msg.severity && msg.severity >= 4 && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => { setCurrentPage('sos'); setIsOpen(false); }}
                            className="mt-1.5 w-full flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Go to SOS Emergency
                          </motion.button>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-1 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-primary/10">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <div className="bg-muted rounded-xl rounded-tl-sm px-3 py-2 flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Quick questions */}
            <div className="px-3 py-2 border-t border-border/50">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground border border-border"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-1">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a health question..."
                  disabled={isTyping}
                  className="flex-1 h-9 text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!input.trim() || isTyping}
                  className="h-9 w-9 p-0 flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
