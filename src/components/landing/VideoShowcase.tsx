'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Clock, Heart, Truck, Shield } from 'lucide-react';

interface VideoCard {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  iconColor: string;
}

const VIDEOS: VideoCard[] = [
  {
    id: 'v1',
    title: 'How Emergency Response Works',
    description: 'See how LifeLink connects patients with ambulances and hospitals in real-time during a medical emergency.',
    duration: '3:42',
    thumbnail: 'https://img.youtube.com/vi/NmM9HA2MQGI/maxresdefault.jpg',
    youtubeId: 'NmM9HA2MQGI',
    tag: 'How It Works',
    tagColor: 'bg-red-500',
    icon: Heart,
    iconColor: 'text-red-400',
  },
  {
    id: 'v2',
    title: 'Ambulance Dispatch Technology',
    description: 'Explore the AI-powered dispatch system that assigns the nearest ambulance within seconds.',
    duration: '5:14',
    thumbnail: 'https://img.youtube.com/vi/CqoV0YBIJQA/maxresdefault.jpg',
    youtubeId: 'CqoV0YBIJQA',
    tag: 'Technology',
    tagColor: 'bg-blue-500',
    icon: Truck,
    iconColor: 'text-blue-400',
  },
  {
    id: 'v3',
    title: 'Patient Safety & Privacy',
    description: 'Your medical data is encrypted and only shared with authorized healthcare providers.',
    duration: '2:58',
    thumbnail: 'https://img.youtube.com/vi/YjPFGJMNFj8/maxresdefault.jpg',
    youtubeId: 'YjPFGJMNFj8',
    tag: 'Security',
    tagColor: 'bg-emerald-500',
    icon: Shield,
    iconColor: 'text-emerald-400',
  },
];

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="LifeLink Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function VideoShowcase() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-slate-950/40 to-background" />
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-5">
            <Play className="size-3 fill-current" /> See It In Action
          </span>
          <h2
            className="font-black text-white tracking-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', lineHeight: 1.1 }}
          >
            Watch how we&apos;re{' '}
            <span style={{ background: 'linear-gradient(135deg, #ef4444, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              saving lives
            </span>
          </h2>
          <p className="mt-4 text-lg text-white/40 max-w-xl mx-auto">
            Real stories. Real technology. See how LifeLink works from first tap to hospital admission.
          </p>
        </motion.div>

        {/* Video Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VIDEOS.map((video, i) => {
            const Icon = video.icon;
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="group cursor-pointer"
                onClick={() => setActiveVideo(video.youtubeId)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                  {/* Thumbnail image */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      // Fallback to gradient if image fails
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Fallback gradient bg */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" style={{ zIndex: -1 }} />

                  {/* Play button */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors"
                    >
                      <Play className="size-7 text-white fill-white ml-1" />
                    </motion.div>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                    <Clock className="size-3 text-white/70" />
                    <span className="text-xs text-white/70 font-medium">{video.duration}</span>
                  </div>

                  {/* Tag */}
                  <div className={`absolute top-3 left-3 z-20 ${video.tagColor} rounded-lg px-2.5 py-1`}>
                    <span className="text-xs text-white font-semibold">{video.tag}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`size-4 ${video.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm group-hover:text-white/90 transition-colors">{video.title}</h3>
                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{video.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && <VideoModal videoId={activeVideo} onClose={() => setActiveVideo(null)} />}
    </section>
  );
}
