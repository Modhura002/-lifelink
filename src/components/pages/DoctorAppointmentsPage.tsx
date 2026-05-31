'use client';
import { useSession } from 'next-auth/react';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Star, MapPin, Clock, Calendar, ChevronRight, X,
  Video, User, GraduationCap, Award, CheckCircle, CreditCard,
  Smartphone, Building, Wallet, ArrowLeft, ChevronDown,
  Languages, Briefcase, ThumbsUp, Filter, RefreshCw, Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUIStore, useLiveFeedStore } from '@/store';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Doctor {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  specialty: string;
  specialtyIcon: string;
  hospital: string;
  city: string;
  experience: number;
  rating: number;
  reviews: number;
  fee: number;
  videoFee: number;
  languages: string[];
  education: string[];
  about: string;
  expertise: string[];
  nextSlot: string;
  isOnline: boolean;
  hasVideo: boolean;
  hasInPerson: boolean;
  patientsSeen: number;
  reviews_list: { name: string; rating: number; comment: string; date: string }[];
}

interface BookedAppointment {
  id: string;
  bookingId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  type: 'video' | 'in-person';
  fee: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  reason: string;
}

// ─── Doctor Data (25 doctors) ─────────────────────────────────────────────────

const DOCTORS: Doctor[] = [
  {
    id: 'd1', name: 'Dr. Priya Sharma', initials: 'PS', avatarColor: 'from-rose-500 to-pink-600',
    specialty: 'Cardiology', specialtyIcon: '❤️',
    hospital: 'Apollo Hospitals', city: 'Delhi',
    experience: 14, rating: 4.9, reviews: 3182, fee: 1200, videoFee: 900,
    languages: ['Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 4:30 PM', patientsSeen: 12400,
    education: ['MBBS – AIIMS Delhi', 'MD Cardiology – PGIMER Chandigarh', 'Fellowship – Cleveland Clinic, USA'],
    about: 'Dr. Priya Sharma is a highly acclaimed interventional cardiologist with 14+ years of experience treating complex heart conditions. She specializes in angioplasty, stenting, and management of heart failure. She has performed over 3,000 interventional procedures and is a recipient of the National Excellence in Cardiology Award.',
    expertise: ['Coronary Angioplasty', 'Heart Failure', 'Arrhythmia', 'Echocardiography', 'Preventive Cardiology'],
    reviews_list: [
      { name: 'Ramesh K.', rating: 5, comment: 'Excellent doctor. Diagnosed my condition accurately and explained everything clearly. Highly recommend.', date: '12 May 2026' },
      { name: 'Anita S.', rating: 5, comment: 'Very thorough and compassionate. She took time to answer all my questions.', date: '03 May 2026' },
      { name: 'Vinod M.', rating: 4, comment: 'Great consultation. The video call quality was very good. Will definitely revisit.', date: '22 Apr 2026' },
    ],
  },
  {
    id: 'd2', name: 'Dr. Arjun Mehta', initials: 'AM', avatarColor: 'from-violet-500 to-purple-600',
    specialty: 'Neurology', specialtyIcon: '🧠',
    hospital: 'AIIMS', city: 'Delhi',
    experience: 18, rating: 4.8, reviews: 2741, fee: 1500, videoFee: 1200,
    languages: ['Hindi', 'English', 'Gujarati'], isOnline: false, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 10:00 AM', patientsSeen: 18700,
    education: ['MBBS – AIIMS New Delhi', 'MD Neurology – NIMHANS Bangalore', 'DM – AIIMS New Delhi'],
    about: 'Dr. Arjun Mehta is a senior neurologist specializing in epilepsy, stroke management, and movement disorders. He leads the Stroke Unit at AIIMS Delhi and has published 45+ research papers in international journals. He is a visiting faculty at several premier medical colleges.',
    expertise: ['Epilepsy & Seizures', 'Stroke Management', "Parkinson's Disease", 'Migraine', 'Dementia & Memory Disorders'],
    reviews_list: [
      { name: 'Sanjay P.', rating: 5, comment: 'World-class doctor. Diagnosed my epilepsy correctly after years of misdiagnosis.', date: '18 May 2026' },
      { name: 'Kavita R.', rating: 5, comment: 'Very knowledgeable and patient. Explained my MRI report in detail.', date: '10 May 2026' },
      { name: 'Mohan L.', rating: 4, comment: 'Long wait time but worth it. Excellent diagnosis and treatment plan.', date: '28 Apr 2026' },
    ],
  },
  {
    id: 'd3', name: 'Dr. Sunita Rao', initials: 'SR', avatarColor: 'from-emerald-500 to-teal-600',
    specialty: 'Orthopedics', specialtyIcon: '🦴',
    hospital: 'Fortis Hospital', city: 'Gurugram',
    experience: 12, rating: 4.7, reviews: 1963, fee: 900, videoFee: 700,
    languages: ['Hindi', 'English', 'Telugu'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 6:00 PM', patientsSeen: 9800,
    education: ['MBBS – Osmania Medical College', 'MS Orthopedics – AIIMS Delhi', 'Fellowship in Joint Replacement – UK'],
    about: 'Dr. Sunita Rao is an orthopedic surgeon specializing in joint replacement surgeries, sports medicine, and spine disorders. She has performed over 2,500 joint replacements and is known for her minimally invasive surgical techniques that ensure faster recovery.',
    expertise: ['Knee Replacement', 'Hip Replacement', 'Spine Surgery', 'Sports Injuries', 'Arthroscopy'],
    reviews_list: [
      { name: 'Prakash T.', rating: 5, comment: 'My knee replacement was flawless. Recovery was much faster than expected.', date: '08 May 2026' },
      { name: 'Lalitha G.', rating: 5, comment: 'Very skilled surgeon. My hip surgery went perfectly well.', date: '30 Apr 2026' },
      { name: 'Suresh N.', rating: 4, comment: 'Good doctor but consultation is brief. Surgery outcome was excellent.', date: '15 Apr 2026' },
    ],
  },
  {
    id: 'd4', name: 'Dr. Kavya Nair', initials: 'KN', avatarColor: 'from-sky-500 to-blue-600',
    specialty: 'Pediatrics', specialtyIcon: '👶',
    hospital: 'Max Super Speciality', city: 'Delhi',
    experience: 9, rating: 4.9, reviews: 4127, fee: 800, videoFee: 600,
    languages: ['Hindi', 'English', 'Malayalam'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 3:00 PM', patientsSeen: 22000,
    education: ['MBBS – Maulana Azad Medical College', 'MD Pediatrics – PGIMER Chandigarh', 'Fellowship in Neonatology – Singapore'],
    about: 'Dr. Kavya Nair is a beloved pediatrician and neonatologist with 9 years of experience caring for newborns, infants, and children. She is known for her gentle approach and ability to put both children and parents at ease. Her specialization in neonatology has helped hundreds of premature babies thrive.',
    expertise: ['Neonatology', 'Child Development', 'Vaccination', 'Childhood Nutrition', 'Pediatric Infectious Disease'],
    reviews_list: [
      { name: 'Preethi V.', rating: 5, comment: 'Amazing doctor. My baby was in NICU and Dr. Kavya was incredibly supportive.', date: '20 May 2026' },
      { name: 'Deepak S.', rating: 5, comment: 'Best pediatrician we have ever visited. Kids love her!', date: '11 May 2026' },
      { name: 'Asha B.', rating: 5, comment: 'Very thorough, explains everything clearly to parents.', date: '02 May 2026' },
    ],
  },
  {
    id: 'd5', name: 'Dr. Rajan Patel', initials: 'RP', avatarColor: 'from-amber-500 to-orange-600',
    specialty: 'General Medicine', specialtyIcon: '🩺',
    hospital: 'Columbia Asia', city: 'Bengaluru',
    experience: 20, rating: 4.6, reviews: 5318, fee: 600, videoFee: 400,
    languages: ['Hindi', 'English', 'Gujarati', 'Kannada'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 5:15 PM', patientsSeen: 35000,
    education: ['MBBS – BJ Medical College, Pune', 'MD Internal Medicine – PGI Chandigarh'],
    about: 'Dr. Rajan Patel is a highly experienced general physician with 20 years of practice. He is known for his holistic approach to patient care, thorough examinations, and accurate diagnoses. Trusted by thousands of families as their primary care physician.',
    expertise: ['Diabetes Management', 'Hypertension', 'Fever & Infections', 'Thyroid Disorders', 'Preventive Health Checkups'],
    reviews_list: [
      { name: 'Meena K.', rating: 5, comment: 'Been visiting Dr. Patel for 10 years. Always accurate diagnosis.', date: '25 May 2026' },
      { name: 'Aditya R.', rating: 4, comment: 'Very experienced and affordable. Great for routine consultations.', date: '14 May 2026' },
      { name: 'Sunanda P.', rating: 5, comment: 'Trusted family doctor. Always available for follow-ups.', date: '05 May 2026' },
    ],
  },
  {
    id: 'd6', name: 'Dr. Meera Iyer', initials: 'MI', avatarColor: 'from-pink-500 to-rose-600',
    specialty: 'Dermatology', specialtyIcon: '✨',
    hospital: 'Manipal Hospitals', city: 'Bengaluru',
    experience: 11, rating: 4.8, reviews: 2879, fee: 1100, videoFee: 850,
    languages: ['English', 'Kannada', 'Tamil', 'Hindi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 11:30 AM', patientsSeen: 14600,
    education: ['MBBS – Kasturba Medical College', 'MD Dermatology – KMC Manipal', 'Fellowship in Cosmetic Dermatology – USA'],
    about: 'Dr. Meera Iyer is a renowned dermatologist and cosmetic skin specialist. She has expertise in managing chronic skin conditions like psoriasis, eczema, and vitiligo, as well as advanced cosmetic procedures including laser treatments and chemical peels.',
    expertise: ['Acne & Scars', 'Psoriasis', 'Eczema', 'Hair Loss (Alopecia)', 'Laser Skin Treatments', 'Vitiligo'],
    reviews_list: [
      { name: 'Ramya S.', rating: 5, comment: 'Cleared my severe acne in just 3 months. Absolutely brilliant!', date: '22 May 2026' },
      { name: 'Vijay K.', rating: 5, comment: 'Excellent for hair loss treatment. Significant improvement in 2 months.', date: '13 May 2026' },
      { name: 'Pooja M.', rating: 4, comment: 'Good doctor. Laser treatment was done professionally.', date: '04 May 2026' },
    ],
  },
  {
    id: 'd7', name: 'Dr. Rohit Kapoor', initials: 'RK', avatarColor: 'from-indigo-500 to-blue-700',
    specialty: 'ENT', specialtyIcon: '👂',
    hospital: 'Medanta', city: 'Gurugram',
    experience: 15, rating: 4.7, reviews: 1654, fee: 950, videoFee: 750,
    languages: ['Hindi', 'English', 'Punjabi'], isOnline: false, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 2:00 PM', patientsSeen: 11200,
    education: ['MBBS – LHMC Delhi', 'MS ENT – PGIMER Chandigarh', 'Fellowship in Cochlear Implant – Germany'],
    about: 'Dr. Rohit Kapoor is a senior ENT surgeon with subspecialty training in cochlear implants and advanced endoscopic sinus surgery. He has performed over 1,800 cochlear implant surgeries and heads the cochlear implant program at Medanta.',
    expertise: ['Cochlear Implants', 'Sinus Surgery', 'Tonsillectomy', 'Hearing Loss', 'Nasal Polyps'],
    reviews_list: [
      { name: 'Harbhajan S.', rating: 5, comment: 'My son got a cochlear implant done by Dr. Kapoor. Life-changing!', date: '19 May 2026' },
      { name: 'Nisha A.', rating: 4, comment: 'Very skilled for sinus surgery. Minimal post-op discomfort.', date: '09 May 2026' },
      { name: 'Gurpreet K.', rating: 5, comment: 'Highly recommend for any hearing-related issues.', date: '01 May 2026' },
    ],
  },
  {
    id: 'd8', name: 'Dr. Ananya Krishnan', initials: 'AK', avatarColor: 'from-teal-500 to-emerald-700',
    specialty: 'Gynecology', specialtyIcon: '🌸',
    hospital: 'Cloudnine Hospitals', city: 'Chennai',
    experience: 16, rating: 4.9, reviews: 6234, fee: 1000, videoFee: 800,
    languages: ['Tamil', 'English', 'Hindi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 2:30 PM', patientsSeen: 28000,
    education: ['MBBS – Stanley Medical College', 'MS OBG – Madras Medical College', 'Fellowship in Laparoscopic Surgery – France'],
    about: 'Dr. Ananya Krishnan is an obstetrician and gynecologist known for her expertise in high-risk pregnancies and laparoscopic gynecological surgeries. She has delivered over 5,000 babies and is a passionate advocate for women\'s health and wellness.',
    expertise: ['High-Risk Pregnancy', 'Laparoscopic Surgery', 'PCOS', 'Endometriosis', 'Infertility', 'Normal & C-Section Delivery'],
    reviews_list: [
      { name: 'Saranya P.', rating: 5, comment: 'Dr. Ananya handled my high-risk pregnancy beautifully. Forever grateful.', date: '24 May 2026' },
      { name: 'Deepa K.', rating: 5, comment: 'The best gynecologist in Chennai. Very caring and professional.', date: '15 May 2026' },
      { name: 'Aarthi V.', rating: 5, comment: 'My PCOS is finally under control after 2 months with her.', date: '06 May 2026' },
    ],
  },
  {
    id: 'd9', name: 'Dr. Sanjay Gupta', initials: 'SG', avatarColor: 'from-cyan-500 to-sky-700',
    specialty: 'Psychiatry', specialtyIcon: '🧘',
    hospital: 'Nimhans', city: 'Bengaluru',
    experience: 22, rating: 4.8, reviews: 2130, fee: 1800, videoFee: 1500,
    languages: ['Hindi', 'English', 'Kannada'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 4:00 PM', patientsSeen: 16400,
    education: ['MBBS – JIPMER Puducherry', 'MD Psychiatry – NIMHANS Bangalore', 'DPM – Royal College London'],
    about: 'Dr. Sanjay Gupta is one of India\'s leading psychiatrists with 22 years of experience treating depression, anxiety, schizophrenia, and addiction. He is a faculty member at NIMHANS and runs one of India\'s largest mental health awareness campaigns.',
    expertise: ['Depression & Anxiety', 'Schizophrenia', 'Bipolar Disorder', 'Addiction & De-addiction', 'OCD', 'PTSD'],
    reviews_list: [
      { name: 'Anjali R.', rating: 5, comment: 'Changed my life. Dr. Gupta truly understands mental health with empathy.', date: '21 May 2026' },
      { name: 'Kiran T.', rating: 5, comment: 'Very non-judgmental and professional. Helped me through severe depression.', date: '12 May 2026' },
      { name: 'Pratik N.', rating: 4, comment: 'Great therapist. Online sessions are equally effective.', date: '02 May 2026' },
    ],
  },
  {
    id: 'd10', name: 'Dr. Lakshmi Venkat', initials: 'LV', avatarColor: 'from-orange-500 to-red-600',
    specialty: 'Ophthalmology', specialtyIcon: '👁️',
    hospital: 'Sankara Nethralaya', city: 'Chennai',
    experience: 17, rating: 4.9, reviews: 4891, fee: 700, videoFee: 500,
    languages: ['Tamil', 'Telugu', 'English'], isOnline: true, hasVideo: false, hasInPerson: true,
    nextSlot: 'Today 5:00 PM', patientsSeen: 31000,
    education: ['MBBS – Madurai Medical College', 'MS Ophthalmology – JIPMER', 'Fellowship in Cornea – Aravind Eye Hospital'],
    about: 'Dr. Lakshmi Venkat is a renowned ophthalmologist with expertise in corneal transplants, cataract surgery, and LASIK. She has restored vision to thousands of patients and has been instrumental in several community eye camps across rural Tamil Nadu.',
    expertise: ['Cataract Surgery', 'LASIK & Refractive Surgery', 'Corneal Transplant', 'Glaucoma', 'Diabetic Retinopathy'],
    reviews_list: [
      { name: 'Murugan P.', rating: 5, comment: 'My father\'s cataract surgery was done perfectly. Vision restored at 78!', date: '23 May 2026' },
      { name: 'Nithya S.', rating: 5, comment: 'Best LASIK experience. Zero complications, crystal clear vision now.', date: '14 May 2026' },
      { name: 'Babu R.', rating: 5, comment: 'Very gentle with elderly patients. Highly skilled surgeon.', date: '05 May 2026' },
    ],
  },
  {
    id: 'd11', name: 'Dr. Vivek Sharma', initials: 'VS', avatarColor: 'from-lime-500 to-green-700',
    specialty: 'Endocrinology', specialtyIcon: '⚗️',
    hospital: 'Kokilaben Hospital', city: 'Mumbai',
    experience: 13, rating: 4.7, reviews: 1890, fee: 1300, videoFee: 1000,
    languages: ['Hindi', 'English', 'Marathi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 9:30 AM', patientsSeen: 10200,
    education: ['MBBS – Seth GS Medical College Mumbai', 'MD Medicine – KEM Hospital', 'DM Endocrinology – PGI Chandigarh'],
    about: 'Dr. Vivek Sharma is an endocrinologist with expertise in managing complex diabetes, thyroid disorders, and hormonal imbalances. He leads the Diabetes Clinic at Kokilaben Hospital and is known for his evidence-based approach to metabolic disorders.',
    expertise: ['Type 1 & 2 Diabetes', 'Thyroid Disorders', 'PCOD/PCOS', 'Adrenal Disorders', 'Obesity Management'],
    reviews_list: [
      { name: 'Rekha J.', rating: 5, comment: 'My HbA1c went from 11.2 to 6.8 in 4 months under Dr. Vivek.', date: '17 May 2026' },
      { name: 'Sunil K.', rating: 4, comment: 'Very thorough with thyroid investigations. Accurate diagnosis.', date: '08 May 2026' },
      { name: 'Priya N.', rating: 5, comment: 'Excellent for PCOS management. Holistic approach to treatment.', date: '29 Apr 2026' },
    ],
  },
  {
    id: 'd12', name: 'Dr. Preeti Singh', initials: 'PS', avatarColor: 'from-fuchsia-500 to-pink-700',
    specialty: 'Pulmonology', specialtyIcon: '🫁',
    hospital: 'PD Hinduja Hospital', city: 'Mumbai',
    experience: 10, rating: 4.6, reviews: 1230, fee: 1100, videoFee: 850,
    languages: ['Hindi', 'English', 'Marathi'], isOnline: false, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 1:00 PM', patientsSeen: 7800,
    education: ['MBBS – Grant Medical College Mumbai', 'MD Pulmonology – Lokmanya Tilak Hospital', 'Fellowship – Mayo Clinic USA'],
    about: 'Dr. Preeti Singh is a pulmonologist specializing in asthma, COPD, and sleep disorders. She has expertise in bronchoscopy and interventional pulmonology. She is passionate about improving air quality awareness and lung health education.',
    expertise: ['Asthma & COPD', 'Sleep Apnea', 'Lung Infections', 'Interstitial Lung Disease', 'Bronchoscopy'],
    reviews_list: [
      { name: 'Anil M.', rating: 5, comment: 'My chronic cough of 3 years was diagnosed correctly by Dr. Preeti.', date: '16 May 2026' },
      { name: 'Sujata R.', rating: 4, comment: 'Very knowledgeable about sleep apnea. CPAP therapy has changed my life.', date: '07 May 2026' },
      { name: 'Hemant S.', rating: 5, comment: 'Excellent diagnosis of my asthma type. Right medication immediately.', date: '28 Apr 2026' },
    ],
  },
  {
    id: 'd13', name: 'Dr. Ashok Kumar', initials: 'AK', avatarColor: 'from-yellow-500 to-amber-700',
    specialty: 'Gastroenterology', specialtyIcon: '🫄',
    hospital: 'Asian Institute of Gastroenterology', city: 'Hyderabad',
    experience: 19, rating: 4.8, reviews: 3400, fee: 1400, videoFee: 1100,
    languages: ['Telugu', 'Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 4:00 PM', patientsSeen: 20500,
    education: ['MBBS – Osmania Medical College', 'MD Internal Medicine – JIPMER', 'DM Gastroenterology – AIIMS'],
    about: 'Dr. Ashok Kumar is one of Hyderabad\'s leading gastroenterologists with 19 years of experience in diagnosing and treating digestive disorders. He is an expert in endoscopic procedures and has performed over 15,000 endoscopies.',
    expertise: ['Endoscopy & Colonoscopy', 'IBS & IBD', 'Liver Disease', 'GERD & Acidity', 'Colon Cancer Screening'],
    reviews_list: [
      { name: 'Venkat R.', rating: 5, comment: 'Best gastroenterologist in Hyderabad. My IBD is now well-controlled.', date: '20 May 2026' },
      { name: 'Swapna T.', rating: 5, comment: 'Very professional endoscopy. No discomfort, very skilled hands.', date: '11 May 2026' },
      { name: 'Ravi K.', rating: 4, comment: 'Diagnosed my liver issue accurately. Follow-up care is excellent.', date: '02 May 2026' },
    ],
  },
  {
    id: 'd14', name: 'Dr. Neha Banerjee', initials: 'NB', avatarColor: 'from-red-500 to-rose-700',
    specialty: 'Oncology', specialtyIcon: '🎗️',
    hospital: 'Tata Memorial Hospital', city: 'Mumbai',
    experience: 21, rating: 4.9, reviews: 1876, fee: 2000, videoFee: 1600,
    languages: ['Bengali', 'Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 11:00 AM', patientsSeen: 8900,
    education: ['MBBS – NRS Medical College Kolkata', 'MD Oncology – Tata Memorial Centre', 'Fellowship – MD Anderson Cancer Center USA'],
    about: 'Dr. Neha Banerjee is a distinguished medical oncologist specializing in breast cancer, lung cancer, and gastrointestinal cancers. She is part of the multidisciplinary tumor board at Tata Memorial and has published extensively on immunotherapy.',
    expertise: ['Breast Cancer', 'Lung Cancer', 'Immunotherapy', 'Targeted Therapy', 'Palliative Care', 'Clinical Trials'],
    reviews_list: [
      { name: 'Bimal R.', rating: 5, comment: 'Dr. Neha gave my mother hope when others didn\'t. She is exceptional.', date: '26 May 2026' },
      { name: 'Suparna G.', rating: 5, comment: 'Very knowledgeable about latest cancer treatments. My stage 3 is now in remission.', date: '17 May 2026' },
      { name: 'Prosenjit C.', rating: 5, comment: 'Compassionate and brilliant. Best cancer doctor I have met.', date: '08 May 2026' },
    ],
  },
  {
    id: 'd15', name: 'Dr. Rajesh Nair', initials: 'RN', avatarColor: 'from-blue-500 to-indigo-700',
    specialty: 'Urology', specialtyIcon: '🔬',
    hospital: 'Amrita Hospital', city: 'Kochi',
    experience: 16, rating: 4.7, reviews: 2145, fee: 1200, videoFee: 950,
    languages: ['Malayalam', 'English', 'Hindi'], isOnline: false, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 3:30 PM', patientsSeen: 13700,
    education: ['MBBS – Trivandrum Medical College', 'MS Urology – PGIMER', 'Fellowship in Robotic Surgery – Germany'],
    about: 'Dr. Rajesh Nair is a urologist specializing in robotic and laparoscopic surgeries for kidney stones, prostate conditions, and bladder disorders. He was the first surgeon in Kerala to perform robotic prostatectomy.',
    expertise: ['Kidney Stones', 'Prostate Cancer', 'Robotic Urology', 'Bladder Cancer', 'Male Infertility'],
    reviews_list: [
      { name: 'Suresh M.', rating: 5, comment: 'Dr. Rajesh removed my kidney stone laparoscopically. No pain, quick recovery.', date: '19 May 2026' },
      { name: 'George P.', rating: 5, comment: 'Robotic prostatectomy done perfectly. Minimal side effects.', date: '10 May 2026' },
      { name: 'Krishnan V.', rating: 4, comment: 'Very skilled surgeon. Takes time to explain procedures clearly.', date: '01 May 2026' },
    ],
  },
  {
    id: 'd16', name: 'Dr. Pallavi Joshi', initials: 'PJ', avatarColor: 'from-green-500 to-emerald-700',
    specialty: 'Cardiology', specialtyIcon: '❤️',
    hospital: 'Narayana Health', city: 'Bengaluru',
    experience: 8, rating: 4.7, reviews: 1350, fee: 950, videoFee: 750,
    languages: ['Kannada', 'Hindi', 'English', 'Marathi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 6:30 PM', patientsSeen: 6800,
    education: ['MBBS – KMC Manipal', 'MD Cardiology – Narayana Hrudayalaya', 'Fellowship in Echo – Cleveland Clinic India'],
    about: 'Dr. Pallavi Joshi is a cardiologist with a focus on echocardiography, valvular heart disease, and cardiac rehabilitation. She is passionate about preventive cardiology and runs regular cardiac health camps in Bengaluru.',
    expertise: ['Echocardiography', 'Valvular Heart Disease', 'Cardiac Rehabilitation', 'Preventive Cardiology', 'Heart Attack Management'],
    reviews_list: [
      { name: 'Shiva P.', rating: 5, comment: 'Caught my heart condition early. Very thorough echo examination.', date: '23 May 2026' },
      { name: 'Uma K.', rating: 4, comment: 'Very professional. Explains reports very clearly.', date: '14 May 2026' },
      { name: 'Dilip R.', rating: 5, comment: 'My cardiac rehab with Dr. Pallavi has been amazing.', date: '04 May 2026' },
    ],
  },
  {
    id: 'd17', name: 'Dr. Santosh Mishra', initials: 'SM', avatarColor: 'from-purple-500 to-violet-700',
    specialty: 'Neurology', specialtyIcon: '🧠',
    hospital: 'Sree Chitra Tirunal Hospital', city: 'Thiruvananthapuram',
    experience: 25, rating: 4.9, reviews: 3782, fee: 1600, videoFee: 1300,
    languages: ['Malayalam', 'Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 10:30 AM', patientsSeen: 22000,
    education: ['MBBS – Trivandrum Medical College', 'MD Neurology – NIMHANS', 'PhD – Harvard Medical School'],
    about: 'Dr. Santosh Mishra is a veteran neurologist with 25 years of experience and a PhD from Harvard. He specializes in deep brain stimulation for Parkinson\'s disease and has pioneered several neurosurgical techniques adopted across Asia.',
    expertise: ["Parkinson's Disease", 'Deep Brain Stimulation', 'Movement Disorders', 'Epilepsy Surgery', 'Neurodegenerative Diseases'],
    reviews_list: [
      { name: 'Thomas A.', rating: 5, comment: 'Dr. Mishra\'s deep brain stimulation changed my father\'s life with Parkinson\'s.', date: '25 May 2026' },
      { name: 'Devika S.', rating: 5, comment: 'World-class neurologist right here in Kerala. Truly exceptional.', date: '16 May 2026' },
      { name: 'Rajiv M.', rating: 5, comment: 'Diagnosed and treated my rare movement disorder correctly.', date: '07 May 2026' },
    ],
  },
  {
    id: 'd18', name: 'Dr. Savitha Reddy', initials: 'SR', avatarColor: 'from-red-400 to-orange-600',
    specialty: 'General Medicine', specialtyIcon: '🩺',
    hospital: 'Yashoda Hospitals', city: 'Hyderabad',
    experience: 12, rating: 4.6, reviews: 2890, fee: 500, videoFee: 350,
    languages: ['Telugu', 'Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 4:00 PM', patientsSeen: 28500,
    education: ['MBBS – Gandhi Medical College Hyderabad', 'MD General Medicine – Nizam\'s Institute'],
    about: 'Dr. Savitha Reddy is a general physician with 12 years of experience managing a wide range of acute and chronic medical conditions. She is particularly skilled at managing multi-morbidity in elderly patients and is known for her accessible and affordable care.',
    expertise: ['Fever & Infections', 'Hypertension', 'Diabetes', 'Elderly Care', 'Preventive Health'],
    reviews_list: [
      { name: 'Ramaiah K.', rating: 5, comment: 'Very affordable and excellent care. Our family GP for 8 years.', date: '22 May 2026' },
      { name: 'Bharathi D.', rating: 4, comment: 'Always available, very knowledgeable. Affordable fees.', date: '13 May 2026' },
      { name: 'Narasimha T.', rating: 5, comment: 'Diagnosed my rare fever correctly when others failed.', date: '03 May 2026' },
    ],
  },
  {
    id: 'd19', name: 'Dr. Aarav Singh', initials: 'AS', avatarColor: 'from-slate-500 to-gray-700',
    specialty: 'Orthopedics', specialtyIcon: '🦴',
    hospital: 'Sir Ganga Ram Hospital', city: 'Delhi',
    experience: 20, rating: 4.8, reviews: 3120, fee: 1200, videoFee: 950,
    languages: ['Hindi', 'English', 'Punjabi'], isOnline: false, hasVideo: false, hasInPerson: true,
    nextSlot: 'Tomorrow 9:00 AM', patientsSeen: 17800,
    education: ['MBBS – Maulana Azad Medical College', 'MS Orthopedics – PGIMER', 'Fellowship in Spine Surgery – Korea'],
    about: 'Dr. Aarav Singh is a senior orthopedic surgeon specializing in complex spine surgeries and trauma care. He has performed over 4,000 surgeries including over 1,200 complex spinal fusion procedures. He is a visiting consultant at several premier Delhi hospitals.',
    expertise: ['Spine Surgery', 'Disc Prolapse (Slip Disc)', 'Scoliosis', 'Trauma & Fractures', 'Spinal Cord Injury'],
    reviews_list: [
      { name: 'Jaspreet S.', rating: 5, comment: 'My chronic back pain of 8 years resolved after spinal surgery by Dr. Aarav.', date: '27 May 2026' },
      { name: 'Rani A.', rating: 5, comment: 'Slip disc surgery done perfectly. Walking normally within 2 weeks.', date: '18 May 2026' },
      { name: 'Tejinder G.', rating: 4, comment: 'Very experienced spine surgeon. Pre-surgery explanations are very clear.', date: '09 May 2026' },
    ],
  },
  {
    id: 'd20', name: 'Dr. Divya Menon', initials: 'DM', avatarColor: 'from-teal-400 to-cyan-600',
    specialty: 'Pediatrics', specialtyIcon: '👶',
    hospital: 'Rainbow Children\'s Hospital', city: 'Hyderabad',
    experience: 11, rating: 4.8, reviews: 3675, fee: 700, videoFee: 550,
    languages: ['Telugu', 'Malayalam', 'English', 'Hindi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 3:30 PM', patientsSeen: 19500,
    education: ['MBBS – Kilpauk Medical College', 'MD Pediatrics – CMC Vellore', 'Fellowship in Pediatric Neurology – Toronto'],
    about: 'Dr. Divya Menon is a pediatrician and pediatric neurologist caring for children with developmental disorders, epilepsy, and learning disabilities. Her child-friendly approach and thorough assessments have made her a favourite among children and parents alike.',
    expertise: ['Pediatric Neurology', 'Developmental Disorders', 'ADHD & Autism', 'Epilepsy in Children', 'Vaccination Programs'],
    reviews_list: [
      { name: 'Sudha L.', rating: 5, comment: 'Dr. Divya diagnosed my son\'s ADHD when no one else could. Now on the right track.', date: '24 May 2026' },
      { name: 'Kishore M.', rating: 5, comment: 'Amazing with children. My daughter loves her visits!', date: '15 May 2026' },
      { name: 'Nandini T.', rating: 5, comment: 'Very detailed approach to autism management. Truly exceptional.', date: '06 May 2026' },
    ],
  },
  {
    id: 'd21', name: 'Dr. Harish Chandra', initials: 'HC', avatarColor: 'from-amber-400 to-yellow-600',
    specialty: 'Gastroenterology', specialtyIcon: '🫄',
    hospital: 'PGIMER', city: 'Chandigarh',
    experience: 23, rating: 4.9, reviews: 2560, fee: 1500, videoFee: 1200,
    languages: ['Hindi', 'English', 'Punjabi'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 3:00 PM', patientsSeen: 21000,
    education: ['MBBS – GMC Patiala', 'MD Internal Medicine – PGIMER', 'DM Gastroenterology – PGIMER', 'Fellowship – Mayo Clinic USA'],
    about: 'Dr. Harish Chandra is a Professor of Gastroenterology at PGIMER with 23 years of clinical and academic experience. He is a national expert in inflammatory bowel disease and liver transplantation, having guided over 200 liver transplants.',
    expertise: ['Liver Transplantation', 'Inflammatory Bowel Disease', 'Hepatitis B & C', 'Cirrhosis', 'ERCP Procedures'],
    reviews_list: [
      { name: 'Gurdeep S.', rating: 5, comment: 'Dr. Harish saved my liver. Forever grateful.', date: '21 May 2026' },
      { name: 'Suman C.', rating: 5, comment: 'My IBD treatment has been exceptional under Dr. Harish.', date: '12 May 2026' },
      { name: 'Amarjit K.', rating: 5, comment: 'The best gastro in North India. No exaggeration.', date: '03 May 2026' },
    ],
  },
  {
    id: 'd22', name: 'Dr. Rashmi Verma', initials: 'RV', avatarColor: 'from-rose-400 to-red-600',
    specialty: 'Dermatology', specialtyIcon: '✨',
    hospital: 'Fortis Memorial', city: 'Gurugram',
    experience: 9, rating: 4.7, reviews: 1820, fee: 900, videoFee: 700,
    languages: ['Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 5:30 PM', patientsSeen: 10600,
    education: ['MBBS – Maulana Azad Medical College', 'MD Dermatology – AIIMS', 'Fellowship in Trichology – UK'],
    about: 'Dr. Rashmi Verma is a clinical and cosmetic dermatologist with special interest in hair disorders and aesthetic procedures. She is trained in advanced laser technologies and has expertise in managing hair fall, alopecia, and scalp conditions.',
    expertise: ['Hair Fall & Alopecia', 'PRP Hair Treatment', 'Botox & Fillers', 'Acne Treatment', 'Skin Pigmentation'],
    reviews_list: [
      { name: 'Vandana M.', rating: 5, comment: 'My hair fall has reduced 80% after PRP treatment with Dr. Rashmi.', date: '20 May 2026' },
      { name: 'Suresh K.', rating: 4, comment: 'Excellent for cosmetic procedures. Very precise with fillers.', date: '11 May 2026' },
      { name: 'Pooja A.', rating: 5, comment: 'Acne scars are 70% gone after 4 laser sessions. Highly recommend.', date: '01 May 2026' },
    ],
  },
  {
    id: 'd23', name: 'Dr. Vinod Mathur', initials: 'VM', avatarColor: 'from-sky-400 to-blue-600',
    specialty: 'Ophthalmology', specialtyIcon: '👁️',
    hospital: 'L V Prasad Eye Institute', city: 'Hyderabad',
    experience: 24, rating: 4.9, reviews: 5670, fee: 800, videoFee: 600,
    languages: ['Telugu', 'Hindi', 'English'], isOnline: false, hasVideo: false, hasInPerson: true,
    nextSlot: 'Tomorrow 8:30 AM', patientsSeen: 42000,
    education: ['MBBS – Gandhi Medical College', 'MS Ophthalmology – LV Prasad Eye Institute', 'Fellowship in Retina – Moorfields Eye Hospital London'],
    about: 'Dr. Vinod Mathur is a world-renowned retinal specialist with 24 years of experience. He has treated patients from 40 countries and has published landmark studies on age-related macular degeneration. He is a visiting consultant at several international eye hospitals.',
    expertise: ['Retinal Detachment', 'Macular Degeneration', 'Diabetic Retinopathy', 'Vitreoretinal Surgery', 'ARMD'],
    reviews_list: [
      { name: 'Satya P.', rating: 5, comment: 'Dr. Vinod saved my father\'s vision. He is a maestro.', date: '26 May 2026' },
      { name: 'Radha M.', rating: 5, comment: 'My diabetic retinopathy is being managed beautifully.', date: '17 May 2026' },
      { name: 'Arun T.', rating: 5, comment: 'Retinal detachment surgery done flawlessly. Vision restored.', date: '08 May 2026' },
    ],
  },
  {
    id: 'd24', name: 'Dr. Sudha Krishnamurthy', initials: 'SK', avatarColor: 'from-violet-400 to-purple-700',
    specialty: 'Endocrinology', specialtyIcon: '⚗️',
    hospital: 'Sri Ramachandra Medical Centre', city: 'Chennai',
    experience: 14, rating: 4.8, reviews: 2340, fee: 1100, videoFee: 900,
    languages: ['Tamil', 'Telugu', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Today 7:00 PM', patientsSeen: 12300,
    education: ['MBBS – Madras Medical College', 'MD Internal Medicine – PGIMER', 'DM Endocrinology – AIIMS'],
    about: 'Dr. Sudha Krishnamurthy is an endocrinologist specializing in insulin pump therapy, gestational diabetes, and complex thyroid cancers. She is a member of several national diabetes associations and conducts regular diabetes education programs.',
    expertise: ['Insulin Pump Therapy', 'Gestational Diabetes', 'Thyroid Cancer', 'Adrenal Tumors', 'Metabolic Syndrome'],
    reviews_list: [
      { name: 'Chitra R.', rating: 5, comment: 'My gestational diabetes was managed perfectly. Healthy baby delivery!', date: '25 May 2026' },
      { name: 'Parthasarathy V.', rating: 5, comment: 'Insulin pump therapy has transformed my diabetes management.', date: '16 May 2026' },
      { name: 'Geetha S.', rating: 4, comment: 'Thyroid cancer detected early and treated successfully.', date: '07 May 2026' },
    ],
  },
  {
    id: 'd25', name: 'Dr. Manish Agarwal', initials: 'MA', avatarColor: 'from-emerald-400 to-green-700',
    specialty: 'Psychiatry', specialtyIcon: '🧘',
    hospital: 'Fortis Hospital', city: 'Delhi',
    experience: 15, rating: 4.7, reviews: 1678, fee: 1500, videoFee: 1200,
    languages: ['Hindi', 'English'], isOnline: true, hasVideo: true, hasInPerson: true,
    nextSlot: 'Tomorrow 5:00 PM', patientsSeen: 9800,
    education: ['MBBS – Safdarjung Hospital Delhi', 'MD Psychiatry – AIIMS Delhi', 'Fellowship in CBT – University of London'],
    about: 'Dr. Manish Agarwal is a psychiatrist and certified CBT therapist specializing in anxiety disorders, depression, and work-related burnout. He runs Delhi\'s leading executive mental wellness program and is known for his result-oriented short-term therapy approach.',
    expertise: ['Anxiety & Panic Attacks', 'Depression', 'Burnout & Stress', 'CBT Therapy', 'Insomnia', 'Workplace Mental Health'],
    reviews_list: [
      { name: 'Ashish P.', rating: 5, comment: 'My work burnout resolved in 3 months of CBT with Dr. Manish.', date: '28 May 2026' },
      { name: 'Nidhi S.', rating: 5, comment: 'Changed my relationship with anxiety. Truly life-changing.', date: '19 May 2026' },
      { name: 'Kartik R.', rating: 4, comment: 'Very structured therapy approach. Seeing real improvements.', date: '10 May 2026' },
    ],
  },
];

const SPECIALTIES = ['All', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Dermatology', 'ENT', 'Gynecology', 'Psychiatry', 'Ophthalmology', 'Endocrinology', 'Pulmonology', 'Gastroenterology', 'Oncology', 'Urology'];

const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM'];

// Generate next 7 days
function getNext7Days() {
  const days: { date: Date; label: string; sublabel: string; full: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      date: d,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      sublabel: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      full: d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    });
  }
  return days;
}

function generateBookedSlots(doctorId: string, dateIndex: number): Set<string> {
  const seed = doctorId.charCodeAt(1) + dateIndex;
  const booked = new Set<string>();
  TIME_SLOTS.forEach((slot, i) => {
    if ((seed * (i + 1)) % 3 === 0) booked.add(slot);
  });
  return booked;
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────

function DoctorCard({ doctor, onViewProfile, onBookNow }: {
  doctor: Doctor;
  onViewProfile: (d: Doctor) => void;
  onBookNow: (d: Doctor) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all"
    >
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${doctor.avatarColor} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg`}>
          {doctor.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base">{doctor.name}</h3>
              <p className="text-sm text-primary font-semibold">{doctor.specialty}</p>
            </div>
            {doctor.isOnline && (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{doctor.hospital}, {doctor.city}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-3 grid grid-cols-3 gap-2 text-center">
        {[
          { value: `${doctor.experience}y`, label: 'Exp' },
          { value: `${doctor.rating}⭐`, label: `${(doctor.reviews / 1000).toFixed(1)}k reviews` },
          { value: `₹${doctor.fee}`, label: 'Consult' },
        ].map(({ value, label }) => (
          <div key={label} className="bg-muted/50 rounded-xl py-2 px-1">
            <p className="text-xs font-bold">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="px-5 pb-3 flex items-center gap-1.5 flex-wrap">
        <Languages className="size-3 text-muted-foreground shrink-0" />
        {doctor.languages.map((l) => (
          <span key={l} className="text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-md">{l}</span>
        ))}
      </div>

      {/* Slots & type */}
      <div className="px-5 pb-4 space-y-2">
        <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/20 rounded-xl px-3 py-2 border border-emerald-500/20">
          <Clock className="size-3.5 text-emerald-500" />
          <span>Next: <strong className="text-emerald-600 dark:text-emerald-400">{doctor.nextSlot}</strong></span>
        </div>
        <div className="flex gap-2">
          {doctor.hasVideo && (
            <span className="flex items-center gap-1 text-[10px] font-medium bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              <Video className="size-2.5" /> Video ₹{doctor.videoFee}
            </span>
          )}
          {doctor.hasInPerson && (
            <span className="flex items-center gap-1 text-[10px] font-medium bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 px-2 py-1 rounded-lg border border-violet-200 dark:border-violet-800">
              <User className="size-2.5" /> In-person ₹{doctor.fee}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => onViewProfile(doctor)}>
          View Profile
        </Button>
        <Button size="sm" className="flex-1 text-xs gap-1" onClick={() => onBookNow(doctor)}>
          <Calendar className="size-3" /> Book Now
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Doctor Detail Modal ───────────────────────────────────────────────────────

function DoctorDetailModal({ doctor, onClose, onBook }: { doctor: Doctor; onClose: () => void; onBook: (d: Doctor) => void }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-card rounded-2xl border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
            <span className="font-bold text-lg">Doctor Profile</span>
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="size-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Doctor info */}
            <div className="flex items-start gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${doctor.avatarColor} flex items-center justify-center text-white font-black text-2xl shadow-xl flex-shrink-0`}>
                {doctor.initials}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black">{doctor.name}</h2>
                <p className="text-primary font-semibold">{doctor.specialty} · {doctor.specialtyIcon}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {doctor.hospital}, {doctor.city}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs"><Star className="size-3 text-amber-400 fill-amber-400" /> {doctor.rating} ({doctor.reviews.toLocaleString()} reviews)</span>
                  <span className="flex items-center gap-1 text-xs"><Briefcase className="size-3 text-muted-foreground" /> {doctor.experience} years experience</span>
                  <span className="flex items-center gap-1 text-xs"><ThumbsUp className="size-3 text-muted-foreground" /> {doctor.patientsSeen.toLocaleString()}+ patients seen</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><User className="size-4 text-primary" /> About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{doctor.about}</p>
            </div>

            {/* Expertise */}
            <div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><Award className="size-4 text-primary" /> Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.expertise.map((e) => (
                  <span key={e} className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">{e}</span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2"><GraduationCap className="size-4 text-primary" /> Education & Training</h3>
              <ul className="space-y-1.5">
                {doctor.education.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5 shrink-0">▸</span> {e}
                  </li>
                ))}
              </ul>
            </div>

            {/* Consultation fees */}
            <div className="grid grid-cols-2 gap-3">
              {doctor.hasVideo && (
                <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-center">
                  <Video className="size-5 text-blue-500 mx-auto mb-1" />
                  <p className="font-black text-lg text-blue-600 dark:text-blue-400">₹{doctor.videoFee}</p>
                  <p className="text-xs text-muted-foreground">Video Consultation</p>
                </div>
              )}
              {doctor.hasInPerson && (
                <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-4 border border-violet-200 dark:border-violet-800 text-center">
                  <User className="size-5 text-violet-500 mx-auto mb-1" />
                  <p className="font-black text-lg text-violet-600 dark:text-violet-400">₹{doctor.fee}</p>
                  <p className="text-xs text-muted-foreground">In-Person Visit</p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Star className="size-4 text-amber-500 fill-amber-400" /> Patient Reviews</h3>
              <div className="space-y-3">
                {doctor.reviews_list.map((r, i) => (
                  <div key={i} className="bg-muted/40 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, j) => (
                          <Star key={j} className="size-3 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">&ldquo;{r.comment}&rdquo;</p>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{r.date}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full h-12 text-base font-bold gap-2" onClick={() => { onClose(); onBook(doctor); }}>
              <Calendar className="size-4" /> Book Appointment
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Booking Modal ─────────────────────────────────────────────────────────────

type BookStep = 'datetime' | 'slot' | 'details' | 'payment' | 'processing' | 'confirmed';
type ConsultType = 'video' | 'in-person';
type PayMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

function BookingModal({ doctor, onClose, onBooked }: {
  doctor: Doctor;
  onClose: () => void;
  onBooked: (apt: BookedAppointment) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const DAYS = useMemo(() => getNext7Days(), []);

  const [step, setStep] = useState<BookStep>('datetime');
  const [consultType, setConsultType] = useState<ConsultType>(doctor.hasVideo ? 'video' : 'in-person');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bankSelected, setBankSelected] = useState('');

  const bookedSlots = useMemo(() => generateBookedSlots(doctor.id, selectedDay), [doctor.id, selectedDay]);
  const fee = consultType === 'video' ? doctor.videoFee : doctor.fee;
  const gst = Math.round(fee * 0.18);
  const total = fee + gst;

  const canProceedPayment = () => {
    if (payMethod === 'upi') return upiId.includes('@');
    if (payMethod === 'card') return cardNumber.length >= 16 && cardExpiry.length === 5 && cardCvv.length >= 3 && cardName.trim().length > 0;
    if (payMethod === 'netbanking') return bankSelected.length > 0;
    return true; // wallet
  };

  const handlePay = async () => {
    setStep('processing');
    await new Promise((r) => setTimeout(r, 2200));
    const bookingId = `LLK-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const apt: BookedAppointment = {
      id: `a${Date.now()}`,
      bookingId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospital: `${doctor.hospital}, ${doctor.city}`,
      date: DAYS[selectedDay].full,
      time: selectedSlot,
      type: consultType,
      fee: total,
      status: 'Confirmed',
      reason,
    };
    onBooked(apt);
    // Notify admin + add to doctor bookings queue
    useUIStore.getState().addNotification({
      title: 'New Appointment Booked',
      message: `${user?.name ?? 'A patient'} booked a ${consultType === 'video' ? 'video' : 'in-person'} appointment with ${doctor.name} (${doctor.specialty}) for ${DAYS[selectedDay].full} at ${selectedSlot}. ID: ${bookingId}`,
      type: 'SYSTEM',
    });
    useLiveFeedStore.getState().addBookingRequest({
      bookingId,
      patientName: user?.name ?? 'Unknown',
      patientEmail: user?.email ?? '',
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      hospital: `${doctor.hospital}, ${doctor.city}`,
      date: DAYS[selectedDay].full,
      time: selectedSlot,
      type: consultType,
      fee: total,
      reason,
    });
    setStep('confirmed');
  };

  const STEP_LABELS: Record<BookStep, string> = {
    datetime: 'Date & Type', slot: 'Time Slot', details: 'Your Details',
    payment: 'Payment', processing: 'Processing', confirmed: 'Confirmed',
  };
  const ORDERED_STEPS: BookStep[] = ['datetime', 'slot', 'details', 'payment'];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={step !== 'confirmed' ? onClose : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="bg-card rounded-2xl border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {step !== 'processing' && step !== 'confirmed' && (
            <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {step !== 'datetime' && (
                  <button onClick={() => {
                    const idx = ORDERED_STEPS.indexOf(step);
                    if (idx > 0) setStep(ORDERED_STEPS[idx - 1]);
                  }} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
                    <ArrowLeft className="size-4" />
                  </button>
                )}
                <div>
                  <p className="font-bold text-sm">{STEP_LABELS[step]}</p>
                  <p className="text-[11px] text-muted-foreground">{doctor.name} · {doctor.specialty}</p>
                </div>
              </div>
              <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Step indicator */}
          {!['processing', 'confirmed'].includes(step) && (
            <div className="flex px-6 pt-4 gap-1.5">
              {ORDERED_STEPS.map((s, i) => (
                <div key={s} className={cn('h-1 flex-1 rounded-full transition-all', ORDERED_STEPS.indexOf(step) >= i ? 'bg-primary' : 'bg-muted')} />
              ))}
            </div>
          )}

          <div className="p-6">
            {/* ── Step 1: Date & Consult Type ── */}
            {step === 'datetime' && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-semibold text-sm mb-3">Consultation Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {doctor.hasVideo && (
                      <button onClick={() => setConsultType('video')} className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all', consultType === 'video' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                        <Video className={cn('size-5', consultType === 'video' ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="text-left">
                          <p className={cn('text-sm font-bold', consultType === 'video' ? 'text-primary' : '')}>Video Call</p>
                          <p className="text-xs text-muted-foreground">₹{doctor.videoFee}</p>
                        </div>
                      </button>
                    )}
                    {doctor.hasInPerson && (
                      <button onClick={() => setConsultType('in-person')} className={cn('flex items-center gap-3 p-4 rounded-xl border-2 transition-all', consultType === 'in-person' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40')}>
                        <User className={cn('size-5', consultType === 'in-person' ? 'text-primary' : 'text-muted-foreground')} />
                        <div className="text-left">
                          <p className={cn('text-sm font-bold', consultType === 'in-person' ? 'text-primary' : '')}>In-Person</p>
                          <p className="text-xs text-muted-foreground">₹{doctor.fee}</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-3">Select Date</h3>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {DAYS.map((day, i) => (
                      <button key={i} onClick={() => setSelectedDay(i)}
                        className={cn('flex flex-col items-center p-3 rounded-xl border-2 min-w-[60px] transition-all shrink-0',
                          selectedDay === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30')}>
                        <span className={cn('text-[10px] font-bold uppercase', selectedDay === i ? 'text-primary' : 'text-muted-foreground')}>{day.label}</span>
                        <span className={cn('text-base font-black mt-0.5', selectedDay === i ? 'text-primary' : '')}>{day.date.getDate()}</span>
                        <span className={cn('text-[10px]', selectedDay === i ? 'text-primary/70' : 'text-muted-foreground')}>{day.date.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-11" onClick={() => setStep('slot')}>
                  Continue <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ── Step 2: Time Slot ── */}
            {step === 'slot' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm mb-1">Select Time Slot</h3>
                  <p className="text-xs text-muted-foreground mb-4">{DAYS[selectedDay].full}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.has(slot);
                      const isSelected = selectedSlot === slot;
                      return (
                        <button key={slot} disabled={isBooked}
                          onClick={() => setSelectedSlot(slot)}
                          className={cn('py-2.5 px-2 rounded-xl text-xs font-semibold border-2 transition-all',
                            isBooked && 'opacity-40 cursor-not-allowed bg-muted border-border',
                            isSelected && !isBooked && 'border-primary bg-primary/10 text-primary',
                            !isSelected && !isBooked && 'border-border hover:border-primary/40',
                          )}>
                          {isBooked ? <span className="line-through">{slot}</span> : slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/20 border-2 border-primary" /> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted border-2 border-border opacity-40" /> Booked</span>
                </div>
                <Button className="w-full h-11" disabled={!selectedSlot} onClick={() => setStep('details')}>
                  Continue with {selectedSlot} <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ── Step 3: Details ── */}
            {step === 'details' && (
              <div className="space-y-4">
                <div className="bg-muted/40 rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span className="font-semibold">{doctor.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-semibold">{DAYS[selectedDay].full}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-semibold">{selectedSlot}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-semibold capitalize">{consultType}</span></div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Patient Name</label>
                    <Input defaultValue={user?.name || ''} className="bg-muted/40" readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Phone Number</label>
                    <Input defaultValue={(user as any)?.phone || ''} className="bg-muted/40" readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1.5">Reason for Visit <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Briefly describe your symptoms or reason for consultation..."
                      className="w-full min-h-[80px] rounded-xl border border-input bg-muted/40 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <Button className="w-full h-11" onClick={() => setStep('payment')}>
                  Proceed to Payment <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            )}

            {/* ── Step 4: Payment ── */}
            {step === 'payment' && (
              <div className="space-y-4">
                {/* Order summary */}
                <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Order Summary</h4>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Consultation ({consultType})</span><span>₹{fee}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">GST (18%)</span><span>₹{gst}</span></div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total</span><span className="text-primary">₹{total}</span>
                  </div>
                </div>

                {/* Payment methods */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Select Payment Method</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'upi', label: 'UPI', icon: '📱', sub: 'GPay, PhonePe, Paytm' },
                      { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
                      { id: 'netbanking', label: 'Net Banking', icon: '🏦', sub: 'All major banks' },
                      { id: 'wallet', label: 'Paytm Wallet', icon: '👛', sub: 'Balance: ₹2,340' },
                    ].map((p) => (
                      <button key={p.id} onClick={() => setPayMethod(p.id as PayMethod)}
                        className={cn('flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all',
                          payMethod === p.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30')}>
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <p className={cn('text-xs font-bold', payMethod === p.id ? 'text-primary' : '')}>{p.label}</p>
                          <p className="text-[10px] text-muted-foreground">{p.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment details */}
                {payMethod === 'upi' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">UPI ID</label>
                    <Input placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                    <p className="text-[11px] text-muted-foreground">e.g. 9876543210@okaxis or name@ybl</p>
                  </div>
                )}

                {payMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Card Number</label>
                      <Input placeholder="1234 5678 9012 3456" maxLength={19}
                        value={cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold block mb-1.5">Expiry</label>
                        <Input placeholder="MM/YY" maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                            setCardExpiry(v.slice(0, 5));
                          }} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-1.5">CVV</label>
                        <Input placeholder="***" type="password" maxLength={4}
                          value={cardCvv} onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-1.5">Name on Card</label>
                      <Input placeholder="As printed on card" value={cardName} onChange={(e) => setCardName(e.target.value)} />
                    </div>
                  </div>
                )}

                {payMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Select Bank</label>
                    <div className="relative">
                      <select value={bankSelected} onChange={(e) => setBankSelected(e.target.value)}
                        className="w-full bg-background border rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                        <option value="">-- Select Bank --</option>
                        {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank', 'Yes Bank'].map((b) => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}

                {payMethod === 'wallet' && (
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 flex items-center justify-between border border-amber-200 dark:border-amber-800">
                    <div>
                      <p className="text-sm font-semibold">Paytm Wallet</p>
                      <p className="text-xs text-muted-foreground">Available balance: ₹2,340</p>
                    </div>
                    <span className="text-emerald-600 font-bold text-sm">Sufficient ✓</span>
                  </div>
                )}

                <Button className="w-full h-12 text-base font-bold gap-2" disabled={!canProceedPayment()} onClick={handlePay}>
                  <CreditCard className="size-4" /> Pay ₹{total}
                </Button>
              </div>
            )}

            {/* ── Processing ── */}
            {step === 'processing' && (
              <div className="flex flex-col items-center justify-center py-16 gap-6">
                <div className="relative size-20">
                  <svg className="size-20 -rotate-90 absolute" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                    <motion.circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary"
                      strokeDasharray="106.8" initial={{ strokeDashoffset: 106.8 }} animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: 2, ease: 'easeInOut' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wallet className="size-8 text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">Processing Payment</p>
                  <p className="text-sm text-muted-foreground mt-1">Please wait, do not close this window...</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="size-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.25 }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Confirmed ── */}
            {step === 'confirmed' && (
              <div className="flex flex-col items-center py-6 gap-4 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle className="size-10 text-emerald-500" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-1">
                  <h2 className="text-2xl font-black">Appointment Confirmed! 🎉</h2>
                  <p className="text-muted-foreground text-sm">Payment successful · A confirmation has been sent</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="w-full bg-muted/40 rounded-2xl p-5 text-left space-y-2.5">
                  {[
                    { label: 'Booking ID', value: `LLK-${Date.now().toString(36).toUpperCase().slice(-6)}` },
                    { label: 'Doctor', value: doctor.name },
                    { label: 'Specialty', value: doctor.specialty },
                    { label: 'Hospital', value: `${doctor.hospital}, ${doctor.city}` },
                    { label: 'Date', value: DAYS[selectedDay].full },
                    { label: 'Time', value: selectedSlot },
                    { label: 'Type', value: consultType === 'video' ? '📹 Video Consultation' : '🏥 In-Person Visit' },
                    { label: 'Amount Paid', value: `₹${total}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-right max-w-[200px]">{value}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="w-full space-y-2">
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                    <Bell className="size-4 shrink-0" />
                    You will receive a reminder 30 minutes before your appointment.
                  </div>
                  <Button className="w-full" onClick={onClose}>Done</Button>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } } };

export default function DoctorAppointmentsPage() {
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [sortBy, setSortBy] = useState<'rating' | 'fee-low' | 'fee-high' | 'experience'>('rating');
  const [profileDoctor, setProfileDoctor] = useState<Doctor | null>(null);
  const [bookDoctor, setBookDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<BookedAppointment[]>([
    { id: 'a-existing-1', bookingId: 'LLK-AB3X9K', doctorId: 'd1', doctorName: 'Dr. Priya Sharma', specialty: 'Cardiology', hospital: 'Apollo Hospitals, Delhi', date: 'Thursday, 29 May 2026', time: '04:30 PM', type: 'in-person', fee: 1416, status: 'Confirmed', reason: 'Chest discomfort checkup' },
    { id: 'a-existing-2', bookingId: 'LLK-ZQ8M2R', doctorId: 'd2', doctorName: 'Dr. Arjun Mehta', specialty: 'Neurology', hospital: 'AIIMS, Delhi', date: 'Friday, 30 May 2026', time: '10:00 AM', type: 'video', fee: 1416, status: 'Pending', reason: 'Persistent headaches' },
  ]);

  const filtered = useMemo(() => {
    let list = DOCTORS.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || d.hospital.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
      const matchSpec = specialty === 'All' || d.specialty === specialty;
      return matchSearch && matchSpec;
    });
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'fee-low') list = [...list].sort((a, b) => a.fee - b.fee);
    else if (sortBy === 'fee-high') list = [...list].sort((a, b) => b.fee - a.fee);
    else if (sortBy === 'experience') list = [...list].sort((a, b) => b.experience - a.experience);
    return list;
  }, [search, specialty, sortBy]);

  const handleBooked = useCallback((apt: BookedAppointment) => {
    setAppointments((prev) => [apt, ...prev]);
    toast.success('Appointment booked!', { description: `${apt.doctorName} · ${apt.date} at ${apt.time}` });
  }, []);

  const cancelAppointment = (id: string) => {
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: 'Cancelled' as const } : a));
    toast.info('Appointment cancelled');
  };

  const upcomingApts = appointments.filter((a) => a.status !== 'Cancelled' && a.status !== 'Completed');
  const pastApts = appointments.filter((a) => a.status === 'Completed' || a.status === 'Cancelled');

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 p-4 md:p-6 pb-16">
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-black">Book an Appointment</h1>
        <p className="text-muted-foreground text-sm mt-0.5">25 verified specialists · Same-day & video consultations available</p>
      </motion.div>

      {/* Search + filters */}
      <motion.div variants={fadeUp} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search doctor name, specialty, hospital, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SPECIALTIES.map((s) => (
            <button key={s} onClick={() => setSpecialty(s)}
              className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 border',
                specialty === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-muted/40 hover:border-primary/40')}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground"><span className="font-bold text-foreground">{filtered.length}</span> doctors found</p>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs bg-muted/50 border-0 rounded-lg px-2 py-1.5 outline-none">
              <option value="rating">Best Rated</option>
              <option value="fee-low">Fee: Low to High</option>
              <option value="fee-high">Fee: High to Low</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Doctor grid */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((d) => (
              <DoctorCard key={d.id} doctor={d} onViewProfile={setProfileDoctor} onBookNow={setBookDoctor} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <p className="font-medium">No doctors found</p>
              <p className="text-sm">Try a different specialty or search term</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upcoming appointments */}
      {upcomingApts.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2"><Calendar className="size-4 text-primary" /> My Upcoming Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {upcomingApts.map((apt) => (
              <div key={apt.id} className="bg-card border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm">{apt.doctorName}</p>
                    <p className="text-xs text-muted-foreground">{apt.specialty} · {apt.hospital}</p>
                  </div>
                  <Badge className={cn('text-[10px] shrink-0', apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20')}>
                    {apt.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="size-3" />{apt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{apt.time}</span>
                  <span className="flex items-center gap-1">{apt.type === 'video' ? <Video className="size-3" /> : <User className="size-3" />}{apt.type === 'video' ? 'Video Call' : 'In-Person'}</span>
                  <span className="flex items-center gap-1 font-semibold text-foreground">Booking: {apt.bookingId}</span>
                </div>
                {apt.reason && <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">&ldquo;{apt.reason}&rdquo;</p>}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => cancelAppointment(apt.id)}>
                    <X className="size-3" /> Cancel
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => setBookDoctor(DOCTORS.find((d) => d.id === apt.doctorId) || null)}>
                    <RefreshCw className="size-3" /> Reschedule
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Doctor Detail Modal */}
      {profileDoctor && (
        <DoctorDetailModal doctor={profileDoctor} onClose={() => setProfileDoctor(null)} onBook={(d) => { setProfileDoctor(null); setBookDoctor(d); }} />
      )}

      {/* Booking Modal */}
      {bookDoctor && (
        <BookingModal doctor={bookDoctor} onClose={() => setBookDoctor(null)} onBooked={handleBooked} />
      )}
    </motion.div>
  );
}
