'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Send,
  ClipboardCheck,
  Truck,
  Building2,
  Clock,
  CheckCircle2,
  MessageCircle,
  Mic,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DEMO_EMERGENCIES, DEMO_AMBULANCES, DEMO_HOSPITALS } from '@/lib/mock-data';
import { getRelativeTime } from '@/lib/constants';
import { toast } from 'sonner';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

type FeedbackType = 'complaint' | 'suggestion' | 'compliment';

const FEEDBACK_TYPES: { key: FeedbackType; label: string; color: string; bgColor: string; activeBg: string; icon: typeof AlertCircle }[] = [
  { key: 'complaint', label: 'Complaint', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950/40', activeBg: 'bg-red-100 dark:bg-red-900/60 ring-2 ring-red-500/50', icon: AlertCircle },
  { key: 'suggestion', label: 'Suggestion', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-950/40', activeBg: 'bg-amber-100 dark:bg-amber-900/60 ring-2 ring-amber-500/50', icon: Lightbulb },
  { key: 'compliment', label: 'Compliment', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-950/40', activeBg: 'bg-emerald-100 dark:bg-emerald-900/60 ring-2 ring-emerald-500/50', icon: ThumbsUp },
];

interface CategoryRating {
  key: string;
  label: string;
  icon: typeof Star;
  value: number;
  hoverValue: number;
}

const INITIAL_CATEGORY_RATINGS: CategoryRating[] = [
  { key: 'responseTime', label: 'Response Time', icon: Clock, value: 0, hoverValue: 0 },
  { key: 'ambulanceDriver', label: 'Ambulance Driver', icon: Truck, value: 0, hoverValue: 0 },
  { key: 'hospitalStaff', label: 'Hospital Staff', icon: Building2, value: 0, hoverValue: 0 },
  { key: 'overallExperience', label: 'Overall Experience', icon: Star, value: 0, hoverValue: 0 },
];

// Mock past feedback entries
const PAST_FEEDBACK = [
  { id: 'fb-1', date: '2024-11-15T10:00:00Z', overallRating: 5, category: 'Compliment', preview: 'Excellent response time and very professional ambulance driver. Hospital staff was incredibly caring.', status: 'Reviewed' as const },
  { id: 'fb-2', date: '2024-10-08T14:30:00Z', overallRating: 3, category: 'Suggestion', preview: 'The ambulance took a bit longer than expected. Suggest improving GPS routing for faster response.', status: 'Reviewed' as const },
  { id: 'fb-3', date: '2024-09-22T09:15:00Z', overallRating: 4, category: 'Compliment', preview: 'Great experience overall. The hospital bed reservation system worked perfectly.', status: 'Pending' as const },
  { id: 'fb-4', date: '2024-08-30T16:45:00Z', overallRating: 2, category: 'Complaint', preview: 'Communication could be better between ambulance dispatch and hospital.', status: 'Reviewed' as const },
];

// Confetti particles for thank you animation
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{ left: `${x}%`, top: '40%', backgroundColor: color }}
      initial={{ opacity: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [0, -40, -80, -120],
        x: [0, (Math.random() - 0.5) * 60],
        scale: [0, 1.2, 1, 0.5],
        rotate: [0, 180, 360],
      }}
      transition={{ duration: 1.2, delay, ease: 'easeOut' }}
    />
  );
}

export default function FeedbackPage() {
  const completedEmergencies = DEMO_EMERGENCIES.filter((e) => e.status === 'COMPLETED');

  const [selectedEmergency, setSelectedEmergency] = useState<string>(
    completedEmergencies[0]?.id || ''
  );
  const [overallRating, setOverallRating] = useState(0);
  const [overallHover, setOverallHover] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>(INITIAL_CATEGORY_RATINGS);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('compliment');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const currentEmergency = completedEmergencies.find((e) => e.id === selectedEmergency);
  const ambulance = DEMO_AMBULANCES.find((a) => a.id === currentEmergency?.ambulanceId);
  const hospital = DEMO_HOSPITALS.find((h) => h.id === currentEmergency?.hospitalId);

  const handleRateCategory = (key: string, value: number) => {
    setCategoryRatings((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value } : r))
    );
  };

  const handleHoverCategory = (key: string, value: number) => {
    setCategoryRatings((prev) =>
      prev.map((r) => (r.key === key ? { ...r, hoverValue: value } : r))
    );
  };

  const handleSubmit = () => {
    if (overallRating === 0) return;
    setSubmitted(true);
  };

  const handleSelectAnother = () => {
    setSubmitted(false);
    setOverallRating(0);
    setOverallHover(0);
    setCategoryRatings(INITIAL_CATEGORY_RATINGS);
    setComment('');
    setFeedbackType('compliment');
    setIsAnonymous(false);
  };

  const confettiColors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];

  if (completedEmergencies.length === 0) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center min-h-[calc(100dvh-64px)] p-6"
      >
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ClipboardCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No emergencies to review</h2>
            <p className="text-muted-foreground text-sm">
              Completed emergencies will appear here for you to provide feedback.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 p-4 md:p-6 max-w-2xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-1">Rate your emergency experience</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {submitted ? (
          /* Thank You Animation */
          <motion.div
            key="thank-you"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <Card className="overflow-hidden relative">
              <CardContent className="p-10 text-center space-y-6 relative z-10">
                {/* Confetti particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {confettiColors.map((color, i) => (
                    <ConfettiParticle key={i} delay={0.1 + i * 0.08} x={15 + i * 14} color={color} />
                  ))}
                  {confettiColors.map((color, i) => (
                    <ConfettiParticle key={`b-${i}`} delay={0.3 + i * 0.08} x={20 + i * 12} color={color} />
                  ))}
                </div>

                {/* Animated Checkmark */}
                <motion.div
                  className="mx-auto w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.5 }}
                  >
                    <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <h2 className="text-2xl font-bold">Thank you for your feedback!</h2>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Your response helps us improve emergency services for everyone.
                    {overallRating >= 4 && " We're thrilled you had a great experience!"}
                  </p>
                </motion.div>

                {/* Rating Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex items-center justify-center gap-1"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${star <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-2 text-muted-foreground">
                    {STAR_LABELS[overallRating]}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <Button variant="outline" onClick={handleSelectAnother} className="gap-2">
                    Submit Another Review
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Feedback Form */
          <motion.div key="form" variants={stagger} initial="hidden" animate="show" className="space-y-5">
            {/* Emergency Selection */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                    Select Emergency
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {completedEmergencies.map((em) => (
                    <button
                      key={em.id}
                      onClick={() => {
                        setSelectedEmergency(em.id);
                        setSubmitted(false);
                        setOverallRating(0);
                        setOverallHover(0);
                        setCategoryRatings(INITIAL_CATEGORY_RATINGS);
                        setComment('');
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedEmergency === em.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{em.id}</p>
                          <p className="text-xs text-muted-foreground">{em.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{getRelativeTime(em.createdAt)}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Emergency Summary */}
            {currentEmergency && (
              <motion.div variants={fadeUp}>
                <Card className="card-hover">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Emergency Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Truck className="h-4 w-4 text-sky-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Ambulance</p>
                          <p className="font-medium text-xs">{ambulance?.vehicleNumber || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Building2 className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Hospital</p>
                          <p className="font-medium text-xs truncate">{hospital?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p className="font-medium text-xs">
                            {new Date(currentEmergency.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 1: Overall Rating */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardContent className="p-5 space-y-4">
                  <div className="text-center space-y-2">
                    <Label className="text-base font-semibold">How was your overall experience?</Label>
                    <p className="text-xs text-muted-foreground">Select a rating that best describes your experience</p>
                  </div>

                  {/* Star Rating */}
                  <div
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl transition-all duration-500 ${
                      overallRating >= 4
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-[0_0_40px_rgba(251,191,36,0.15)]'
                        : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const displayRating = overallHover || overallRating;
                        return (
                          <motion.button
                            key={star}
                            onClick={() => setOverallRating(star)}
                            onMouseEnter={() => setOverallHover(star)}
                            onMouseLeave={() => setOverallHover(0)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-10 w-10 transition-colors duration-150 ${
                                star <= displayRating
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                    <motion.p
                      key={overallHover || overallRating}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-sm font-semibold ${
                        overallRating >= 4
                          ? 'text-amber-600 dark:text-amber-400'
                          : overallRating >= 3
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : overallRating > 0
                              ? 'text-red-500 dark:text-red-400'
                              : 'text-muted-foreground'
                      }`}
                    >
                      {STAR_LABELS[overallHover || overallRating] || 'Select a rating'}
                    </motion.p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Category Ratings */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Rate Each Category
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {categoryRatings.map((rating) => {
                    const displayVal = rating.hoverValue || rating.value;
                    return (
                      <div key={rating.key} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <rating.icon className="h-4 w-4 text-muted-foreground" />
                            <Label className="text-sm font-medium">{rating.label}</Label>
                          </div>
                          {rating.value > 0 && (
                            <motion.span
                              initial={{ opacity: 0, x: 4 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`text-xs font-medium ${
                                rating.value >= 4 ? 'text-amber-600' : rating.value >= 3 ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {STAR_LABELS[rating.value]}
                            </motion.span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRateCategory(rating.key, star)}
                              onMouseEnter={() => handleHoverCategory(rating.key, star)}
                              onMouseLeave={() => handleHoverCategory(rating.key, 0)}
                              className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 transition-colors duration-150 ${
                                  star <= displayVal
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3: Feedback Type */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-sm font-medium">Feedback Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FEEDBACK_TYPES.map((ft) => {
                      const Icon = ft.icon;
                      return (
                        <button
                          key={ft.key}
                          onClick={() => setFeedbackType(ft.key)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                            feedbackType === ft.key
                              ? `${ft.activeBg} ${ft.color}`
                              : 'border-transparent bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs font-medium">{ft.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 4: Detailed Feedback */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      Detailed Feedback
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 text-xs h-8 ${isRecording ? 'text-red-500' : ''}`}
                      onClick={() => {
                        setIsRecording(!isRecording);
                        if (!isRecording) {
                          toast.info('Voice recording UI placeholder — no real recording');
                        }
                      }}
                    >
                      <Mic className={`h-3.5 w-3.5 ${isRecording ? 'animate-pulse' : ''}`} />
                      {isRecording ? 'Stop' : 'Voice Note'}
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      placeholder="Tell us more about your experience..."
                      value={comment}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) setComment(e.target.value);
                      }}
                      rows={4}
                      className="resize-none pr-16"
                    />
                    <span className={`absolute bottom-3 right-3 text-xs ${comment.length >= 450 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {comment.length}/500
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Anonymous Toggle */}
            <motion.div variants={fadeUp}>
              <Card className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Submit Anonymously</Label>
                        <p className="text-xs text-muted-foreground">Your name won&apos;t be shown with this feedback</p>
                      </div>
                    </div>
                    <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Submit */}
            <motion.div variants={fadeUp}>
              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleSubmit}
                disabled={overallRating === 0}
              >
                <Send className="h-4 w-4" />
                Submit Feedback
              </Button>
              {overallRating === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Please provide an overall rating before submitting
                </p>
              )}
            </motion.div>

            <Separator />

            {/* Previous Feedback History */}
            <motion.div variants={fadeUp}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Previous Feedback</h2>
                <Badge variant="secondary" className="text-xs">{PAST_FEEDBACK.length} entries</Badge>
              </div>
              <div className="space-y-2">
                {PAST_FEEDBACK.map((fb, i) => (
                  <motion.div
                    key={fb.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= fb.overallRating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  fb.category === 'Complaint'
                                    ? 'text-red-500 border-red-200 dark:border-red-800'
                                    : fb.category === 'Suggestion'
                                      ? 'text-amber-500 border-amber-200 dark:border-amber-800'
                                      : 'text-emerald-500 border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {fb.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{fb.preview}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1.5">{getRelativeTime(fb.date)}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] shrink-0 ${
                              fb.status === 'Reviewed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}
                          >
                            {fb.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
