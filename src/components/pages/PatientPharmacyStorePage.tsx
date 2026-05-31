'use client';
import { useSession } from 'next-auth/react';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShoppingCart, Plus, Minus, X, CheckCircle,
  Star, Truck, Shield, Clock, Package, ChevronRight, ChevronLeft,
  Pill, Heart, Zap, Leaf, Bandage, Beaker, Filter,
  MapPin, CreditCard, Wallet, Tag, AlertCircle, Eye,
  ArrowRight, Gift, Percent, Info, Building2, Phone,
  Check, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useUIStore, useLiveFeedStore, useNavigationStore } from '@/store';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  description: string;
  uses: string;
  sideEffects: string;
  dosage: string;
  requiresRx: boolean;
  inStock: boolean;
  rating: number;
  reviews: number;
  pack: string;
  emoji: string;
  fastDelivery?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
  tags?: string[];
}

interface CartItem { medicine: Medicine; qty: number; }

type CheckoutStep = 'address' | 'payment' | 'processing' | 'confirmed';

// ── Catalogue ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: Pill },
  { id: 'pain-relief', label: 'Pain Relief', icon: Zap },
  { id: 'diabetes', label: 'Diabetes', icon: Heart },
  { id: 'cardiac', label: 'Heart & BP', icon: Heart },
  { id: 'vitamins', label: 'Vitamins & Nutrition', icon: Leaf },
  { id: 'antibiotics', label: 'Antibiotics', icon: Beaker },
  { id: 'gastro', label: 'Digestive Health', icon: Leaf },
  { id: 'respiratory', label: 'Respiratory', icon: Leaf },
  { id: 'skin', label: 'Skin & Hair', icon: Leaf },
  { id: 'eye-ear', label: 'Eye & Ear', icon: Eye },
  { id: 'first-aid', label: 'First Aid', icon: Bandage },
  { id: 'devices', label: 'Devices', icon: Heart },
];

const MEDICINES: Medicine[] = [
  // Pain Relief
  { id: 'm1', name: 'Paracetamol 500mg', brand: 'Crocin', category: 'pain-relief', price: 32, mrp: 38, description: 'Trusted paracetamol tablets for fast relief from fever and mild-to-moderate pain including headaches, toothaches, and body aches.', uses: 'Fever, Headache, Body Pain, Toothache', sideEffects: 'Rare: nausea, rash. Do not exceed 4g/day.', dosage: '1–2 tablets every 4–6 hours. Max 8 tablets/day.', requiresRx: false, inStock: true, rating: 4.8, reviews: 12341, pack: 'Strip of 10 tablets', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Popular', 'OTC'] },
  { id: 'm2', name: 'Ibuprofen 400mg', brand: 'Brufen', category: 'pain-relief', price: 48, mrp: 55, description: 'NSAID for moderate-to-severe pain and inflammation. Works by blocking prostaglandin production.', uses: 'Arthritis, Muscle Pain, Toothache, Menstrual Cramps', sideEffects: 'Stomach upset, heartburn. Take with food.', dosage: '1 tablet 3 times/day after meals.', requiresRx: false, inStock: true, rating: 4.6, reviews: 8234, pack: 'Strip of 15 tablets', emoji: '💊', tags: ['Anti-Inflammatory'] },
  { id: 'm3', name: 'Diclofenac Gel 1%', brand: 'Voveran', category: 'pain-relief', price: 95, mrp: 115, description: 'Topical NSAID gel for direct application on painful joints and muscles. Fast acting, minimal systemic effects.', uses: 'Joint Pain, Sprains, Sports Injuries, Back Pain', sideEffects: 'Skin redness at application site.', dosage: 'Apply 2–4g on affected area 3–4 times/day.', requiresRx: false, inStock: true, rating: 4.5, reviews: 5123, pack: '30g tube', emoji: '🧴', tags: ['Topical'] },
  { id: 'm4', name: 'Aspirin 75mg', brand: 'Ecosprin', category: 'pain-relief', price: 22, mrp: 28, description: 'Low-dose aspirin for cardiovascular prevention. Anti-platelet action prevents blood clot formation.', uses: 'Heart Attack Prevention, Blood Thinning, Stroke Prevention', sideEffects: 'GI irritation, increased bleeding risk.', dosage: '1 tablet once daily after meals.', requiresRx: true, inStock: true, rating: 4.7, reviews: 9870, pack: 'Strip of 14 tablets', emoji: '💊', fastDelivery: true, tags: ['Cardiac', 'Rx'] },
  { id: 'm5', name: 'Combiflam Tablet', brand: 'Combiflam', category: 'pain-relief', price: 55, mrp: 65, description: 'Combination of Ibuprofen + Paracetamol for dual-action pain relief and fever reduction.', uses: 'Acute Pain, Fever, Dental Pain', sideEffects: 'GI upset, dizziness.', dosage: '1 tablet 3 times/day.', requiresRx: false, inStock: true, rating: 4.7, reviews: 11200, pack: 'Strip of 20 tablets', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Combination', 'Popular'] },
  { id: 'm6', name: 'Naproxen 250mg', brand: 'Naprosyn', category: 'pain-relief', price: 72, mrp: 88, description: 'Long-acting NSAID that provides sustained pain relief for up to 12 hours.', uses: 'Osteoarthritis, Gout, Menstrual Pain', sideEffects: 'Stomach irritation. Take with antacid if needed.', dosage: '1 tablet twice daily.', requiresRx: false, inStock: true, rating: 4.4, reviews: 3400, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Long-acting'] },
  // Diabetes
  { id: 'm7', name: 'Metformin 500mg', brand: 'Glycomet', category: 'diabetes', price: 45, mrp: 52, description: 'First-line oral antidiabetic medication. Reduces hepatic glucose production and improves insulin sensitivity.', uses: 'Type 2 Diabetes, Blood Sugar Control, PCOS', sideEffects: 'Nausea, diarrhea initially. Take with meals.', dosage: '1 tablet twice daily with meals.', requiresRx: true, inStock: true, rating: 4.7, reviews: 9876, pack: 'Strip of 10 tablets', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Rx', 'Diabetes Essential'] },
  { id: 'm8', name: 'Glimepiride 2mg', brand: 'Amaryl', category: 'diabetes', price: 88, mrp: 105, description: 'Sulfonylurea that stimulates insulin secretion from pancreatic beta cells.', uses: 'Type 2 Diabetes, Insulin Resistance', sideEffects: 'Hypoglycemia, weight gain.', dosage: '1 tablet once daily before breakfast.', requiresRx: true, inStock: true, rating: 4.5, reviews: 4321, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx'] },
  { id: 'm9', name: 'Glucometer Strips', brand: 'Accu-Chek', category: 'diabetes', price: 450, mrp: 520, description: 'Highly accurate blood glucose test strips compatible with Accu-Chek Active and Performa glucometers.', uses: 'Blood Glucose Monitoring, Diabetes Management', sideEffects: 'None', dosage: 'As required for blood sugar testing.', requiresRx: false, inStock: true, rating: 4.9, reviews: 15234, pack: 'Pack of 25 strips', emoji: '🩸', fastDelivery: true, bestseller: true, tags: ['Device Accessory'] },
  { id: 'm10', name: 'Insulin Syringes 1ml', brand: 'BD Micro-Fine', category: 'diabetes', price: 180, mrp: 220, description: 'Ultra-fine 31G needles for virtually pain-free insulin injections. Sterile and individually packaged.', uses: 'Insulin Administration, Type 1 & 2 Diabetes', sideEffects: 'Injection site reaction.', dosage: 'As prescribed by physician.', requiresRx: true, inStock: true, rating: 4.8, reviews: 6780, pack: 'Pack of 10 syringes', emoji: '💉', tags: ['Rx', 'Injection'] },
  { id: 'm11', name: 'Sitagliptin 100mg', brand: 'Januvia', category: 'diabetes', price: 245, mrp: 295, description: 'DPP-4 inhibitor that increases insulin release and decreases glucagon after meals.', uses: 'Type 2 Diabetes (adjunct therapy)', sideEffects: 'Nasopharyngitis, headache.', dosage: '1 tablet once daily.', requiresRx: true, inStock: true, rating: 4.6, reviews: 3200, pack: 'Strip of 7 tablets', emoji: '💊', tags: ['Rx', 'DPP-4'] },
  // Heart & BP
  { id: 'm12', name: 'Amlodipine 5mg', brand: 'Norvasc', category: 'cardiac', price: 65, mrp: 78, description: 'Calcium channel blocker for long-term hypertension management. Once-daily dosing ensures steady blood pressure control.', uses: 'High Blood Pressure, Angina, Coronary Artery Disease', sideEffects: 'Ankle swelling, flushing, dizziness.', dosage: '1 tablet once daily, same time each day.', requiresRx: true, inStock: true, rating: 4.7, reviews: 7654, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'BP'] },
  { id: 'm13', name: 'Atorvastatin 10mg', brand: 'Lipitor', category: 'cardiac', price: 112, mrp: 135, description: 'HMG-CoA reductase inhibitor (statin) that significantly reduces LDL cholesterol and cardiovascular risk.', uses: 'High Cholesterol, Heart Disease Prevention, Post-MI', sideEffects: 'Muscle aches, liver enzyme elevation (rare).', dosage: '1 tablet once daily at bedtime.', requiresRx: true, inStock: true, rating: 4.8, reviews: 6543, pack: 'Strip of 10 tablets', emoji: '💊', fastDelivery: true, tags: ['Rx', 'Statin'] },
  { id: 'm14', name: 'Losartan 50mg', brand: 'Cozaar', category: 'cardiac', price: 78, mrp: 95, description: 'Angiotensin II receptor blocker (ARB) for blood pressure control with added kidney-protective effects.', uses: 'Hypertension, Diabetic Nephropathy, Heart Failure', sideEffects: 'Dizziness, elevated potassium.', dosage: '1 tablet once daily.', requiresRx: true, inStock: true, rating: 4.6, reviews: 5432, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'ARB'] },
  { id: 'm15', name: 'Clopidogrel 75mg', brand: 'Plavix', category: 'cardiac', price: 148, mrp: 178, description: 'Antiplatelet agent that prevents blood clots. Essential after heart attack, stent, or stroke.', uses: 'Post-MI, Post-Stent, Stroke Prevention, ACS', sideEffects: 'Increased bleeding, bruising.', dosage: '1 tablet once daily.', requiresRx: true, inStock: true, rating: 4.8, reviews: 4890, pack: 'Strip of 10 tablets', emoji: '💊', fastDelivery: true, tags: ['Rx', 'Critical Cardiac'] },
  // Vitamins
  { id: 'm16', name: 'Vitamin D3 60000 IU', brand: 'D-Rise', category: 'vitamins', price: 89, mrp: 105, description: 'Weekly high-dose Vitamin D3 supplement for rapid correction of deficiency. Each sachet provides 60,000 IU.', uses: 'Vitamin D Deficiency, Bone Health, Immunity, Calcium Absorption', sideEffects: 'Hypercalcemia at excessive doses.', dosage: '1 sachet per week for 8 weeks, then monthly.', requiresRx: false, inStock: true, rating: 4.9, reviews: 15234, pack: 'Pack of 8 sachets', emoji: '☀️', fastDelivery: true, bestseller: true, tags: ['Vitamin', 'Popular'] },
  { id: 'm17', name: 'Vitamin B12 1500mcg', brand: 'Neurobion', category: 'vitamins', price: 145, mrp: 172, description: 'High-potency methylcobalamin supplement for nerve repair and energy metabolism.', uses: 'Neuropathy, Fatigue, B12 Deficiency, Anemia', sideEffects: 'Extremely rare.', dosage: '1 tablet daily.', requiresRx: false, inStock: true, rating: 4.7, reviews: 8765, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['B-Vitamin'] },
  { id: 'm18', name: 'Revital H Multivitamin', brand: 'Revital H', category: 'vitamins', price: 285, mrp: 350, description: 'Complete daily multivitamin with 25 nutrients including ginseng and zinc for sustained energy and immunity.', uses: 'General Health, Fatigue, Immunity Boost, Active Lifestyle', sideEffects: 'Urine may turn yellow (riboflavin). Normal.', dosage: '1 capsule once daily after breakfast.', requiresRx: false, inStock: true, rating: 4.6, reviews: 12890, pack: 'Pack of 30 capsules', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Multivitamin', 'Popular'] },
  { id: 'm19', name: 'Calcium + D3 500mg', brand: 'Shelcal', category: 'vitamins', price: 168, mrp: 200, description: 'Combined calcium carbonate and Vitamin D3 for optimal bone density and calcium absorption.', uses: 'Osteoporosis, Bone Health, Pregnancy Supplement, Menopause', sideEffects: 'Constipation at high doses.', dosage: '1 tablet twice daily after meals.', requiresRx: false, inStock: true, rating: 4.8, reviews: 9234, pack: 'Strip of 15 tablets', emoji: '🦴', tags: ['Bone Health'] },
  { id: 'm20', name: 'Omega-3 Fish Oil 1000mg', brand: 'Seven Seas', category: 'vitamins', price: 320, mrp: 395, description: 'High-purity EPA and DHA omega-3 fatty acids for cardiovascular, brain, and joint health.', uses: 'Heart Health, Brain Function, Joint Pain, Dry Eyes', sideEffects: 'Fishy aftertaste. Take with meals.', dosage: '2 capsules daily with food.', requiresRx: false, inStock: true, rating: 4.7, reviews: 7654, pack: 'Pack of 60 capsules', emoji: '🐟', fastDelivery: true, tags: ['Omega-3', 'Heart Health'] },
  { id: 'm21', name: 'Zinc 50mg', brand: 'Zincovit', category: 'vitamins', price: 95, mrp: 115, description: 'High-strength zinc supplement that boosts immunity, wound healing, and testosterone levels.', uses: 'Immunity, Wound Healing, Hair Loss, Male Fertility', sideEffects: 'Nausea at high doses. Take with food.', dosage: '1 tablet daily.', requiresRx: false, inStock: true, rating: 4.5, reviews: 5430, pack: 'Strip of 15 tablets', emoji: '💊', tags: ['Mineral', 'Immunity'] },
  // Antibiotics
  { id: 'm22', name: 'Amoxicillin 500mg', brand: 'Mox', category: 'antibiotics', price: 95, mrp: 112, description: 'Broad-spectrum beta-lactam antibiotic effective against most common bacterial infections.', uses: 'Ear Infection, Pneumonia, UTI, Strep Throat', sideEffects: 'Diarrhea, rash. Complete full course.', dosage: '1 capsule 3 times/day for 7–10 days.', requiresRx: true, inStock: true, rating: 4.6, reviews: 5432, pack: 'Strip of 10 capsules', emoji: '💊', tags: ['Rx', 'Antibiotic'] },
  { id: 'm23', name: 'Azithromycin 500mg', brand: 'Azithral', category: 'antibiotics', price: 125, mrp: 148, description: 'Macrolide antibiotic with convenient 3-day course. Excellent tissue penetration for respiratory infections.', uses: 'Throat Infection, Bronchitis, Sinusitis, Pneumonia', sideEffects: 'GI upset, QT prolongation (rare).', dosage: '1 tablet once daily for 3 days.', requiresRx: true, inStock: true, rating: 4.7, reviews: 7890, pack: 'Strip of 3 tablets', emoji: '💊', fastDelivery: true, tags: ['Rx', 'Short Course'] },
  { id: 'm24', name: 'Ciprofloxacin 500mg', brand: 'Ciplox', category: 'antibiotics', price: 82, mrp: 98, description: 'Fluoroquinolone antibiotic for urinary, GI, and skin infections. Broad gram-negative coverage.', uses: 'UTI, Typhoid, Traveller\'s Diarrhea, Skin Infections', sideEffects: 'Nausea, tendon risk, avoid sun exposure.', dosage: '1 tablet twice daily for 5–7 days.', requiresRx: true, inStock: true, rating: 4.5, reviews: 4560, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'UTI'] },
  // Gastro
  { id: 'm25', name: 'Omeprazole 20mg', brand: 'Omez', category: 'gastro', price: 55, mrp: 65, description: 'Proton pump inhibitor that dramatically reduces stomach acid production for lasting acidity relief.', uses: 'Acidity, GERD, Gastric Ulcer, H. pylori', sideEffects: 'Headache, diarrhea with long-term use.', dosage: '1 capsule 30 min before breakfast.', requiresRx: false, inStock: true, rating: 4.8, reviews: 11234, pack: 'Strip of 10 capsules', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Acidity', 'Popular'] },
  { id: 'm26', name: 'ORS Electrolyte Sachet', brand: 'Electral', category: 'gastro', price: 28, mrp: 32, description: 'WHO-formulated oral rehydration therapy with glucose and electrolytes for rapid rehydration.', uses: 'Dehydration, Diarrhea, Vomiting, Sports Recovery', sideEffects: 'None when used as directed.', dosage: '1 sachet dissolved in 1L water. Sip throughout day.', requiresRx: false, inStock: true, rating: 4.9, reviews: 18756, pack: 'Pack of 6 sachets', emoji: '🧂', fastDelivery: true, bestseller: true, tags: ['Essential', 'OTC'] },
  { id: 'm27', name: 'Domperidone 10mg', brand: 'Domstal', category: 'gastro', price: 38, mrp: 45, description: 'Prokinetic agent that improves stomach emptying and relieves bloating and nausea.', uses: 'Nausea, Vomiting, Bloating, Gastroparesis', sideEffects: 'Drowsiness, dry mouth.', dosage: '1 tablet 3 times/day before meals.', requiresRx: false, inStock: true, rating: 4.5, reviews: 6234, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Nausea'] },
  { id: 'm28', name: 'Loperamide 2mg', brand: 'Lopamide', category: 'gastro', price: 42, mrp: 50, description: 'Fast-acting anti-diarrheal that slows bowel movements and reduces stool frequency.', uses: 'Acute Diarrhea, Traveller\'s Diarrhea, IBS-D', sideEffects: 'Constipation, bloating.', dosage: '2 tablets initially, then 1 after each loose stool. Max 8/day.', requiresRx: false, inStock: true, rating: 4.6, reviews: 4320, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Diarrhea', 'OTC'] },
  { id: 'm29', name: 'Antacid Suspension 200ml', brand: 'Digene', category: 'gastro', price: 88, mrp: 105, description: 'Mint-flavored antacid with simethicone for instant relief from acidity, heartburn and gas.', uses: 'Acidity, Heartburn, Gas, Bloating', sideEffects: 'Constipation with aluminum-containing antacids.', dosage: '2 tsp after meals and at bedtime.', requiresRx: false, inStock: true, rating: 4.7, reviews: 8900, pack: '200ml bottle', emoji: '🍶', fastDelivery: true, tags: ['Instant Relief'] },
  { id: 'm30', name: 'Probiotics 10B CFU', brand: 'Sporlac', category: 'gastro', price: 195, mrp: 235, description: 'Multi-strain probiotic with 10 billion CFU per capsule for gut microbiome balance.', uses: 'IBS, Post-Antibiotic Recovery, Bloating, Immunity', sideEffects: 'Mild bloating initially.', dosage: '1 capsule daily with meals.', requiresRx: false, inStock: true, rating: 4.6, reviews: 5670, pack: 'Pack of 15 capsules', emoji: '🦠', newArrival: true, tags: ['Probiotic', 'Gut Health'] },
  // Respiratory
  { id: 'm31', name: 'Levocetrizine 5mg', brand: 'Xyzal', category: 'respiratory', price: 65, mrp: 78, description: 'Non-drowsy antihistamine for 24-hour allergy relief. Second-generation H1 blocker.', uses: 'Allergic Rhinitis, Urticaria, Hay Fever, Skin Allergy', sideEffects: 'Minimal drowsiness, dry mouth.', dosage: '1 tablet once daily at bedtime.', requiresRx: false, inStock: true, rating: 4.7, reviews: 9870, pack: 'Strip of 10 tablets', emoji: '💊', fastDelivery: true, bestseller: true, tags: ['Allergy', 'Non-Drowsy'] },
  { id: 'm32', name: 'Salbutamol Inhaler 100mcg', brand: 'Asthalin', category: 'respiratory', price: 142, mrp: 168, description: 'Short-acting bronchodilator for immediate relief from acute asthma attacks and bronchospasm.', uses: 'Asthma, COPD, Bronchospasm, Exercise-Induced Wheezing', sideEffects: 'Tremor, tachycardia, hypokalemia.', dosage: '1–2 puffs as needed. Max 8 puffs/day.', requiresRx: true, inStock: true, rating: 4.8, reviews: 7650, pack: '200 doses inhaler', emoji: '💨', fastDelivery: true, tags: ['Rx', 'Asthma Essential'] },
  { id: 'm33', name: 'Montelukast 10mg', brand: 'Singulair', category: 'respiratory', price: 185, mrp: 225, description: 'Leukotriene receptor antagonist for long-term asthma and allergic rhinitis management.', uses: 'Asthma Maintenance, Allergic Rhinitis, Exercise Asthma', sideEffects: 'Headache, mood changes (rare).', dosage: '1 tablet once daily in the evening.', requiresRx: true, inStock: true, rating: 4.7, reviews: 4560, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'Asthma'] },
  { id: 'm34', name: 'Mucinex DM 600mg', brand: 'Mucinex', category: 'respiratory', price: 220, mrp: 265, description: 'Extended-release guaifenesin + dextromethorphan for 12-hour chest congestion and cough relief.', uses: 'Chest Congestion, Productive Cough, Bronchitis', sideEffects: 'Dizziness, nausea.', dosage: '1 tablet every 12 hours. Stay hydrated.', requiresRx: false, inStock: true, rating: 4.5, reviews: 3400, pack: 'Pack of 14 tablets', emoji: '💊', newArrival: true, tags: ['Cough', 'Decongestant'] },
  // Skin & Hair
  { id: 'm35', name: 'Clotrimazole Cream 1%', brand: 'Canesten', category: 'skin', price: 78, mrp: 92, description: 'Antifungal cream that kills dermatophytes and Candida. Effective for ringworm, athlete\'s foot, and jock itch.', uses: 'Ringworm, Athlete\'s Foot, Candidiasis, Tinea', sideEffects: 'Mild burning or itching initially.', dosage: 'Apply thin layer twice daily for 2–4 weeks.', requiresRx: false, inStock: true, rating: 4.7, reviews: 8900, pack: '15g tube', emoji: '🧴', fastDelivery: true, tags: ['Antifungal', 'OTC'] },
  { id: 'm36', name: 'Minoxidil 5% Topical', brand: 'Tugain', category: 'skin', price: 385, mrp: 450, description: 'Clinically proven hair regrowth solution for male pattern baldness. Increases hair follicle size.', uses: 'Male Pattern Baldness, Hair Loss, Alopecia', sideEffects: 'Scalp irritation, initial shedding (normal).', dosage: 'Apply 1ml twice daily on dry scalp.', requiresRx: false, inStock: true, rating: 4.5, reviews: 12340, pack: '60ml bottle (3-month supply)', emoji: '🧴', bestseller: true, tags: ['Hair Growth', 'Popular'] },
  { id: 'm37', name: 'Tretinoin 0.025% Cream', brand: 'Retino-A', category: 'skin', price: 145, mrp: 175, description: 'Vitamin A derivative for acne treatment and anti-aging. Increases skin cell turnover.', uses: 'Acne Vulgaris, Anti-Aging, Fine Lines, Hyperpigmentation', sideEffects: 'Dryness, peeling, sun sensitivity. Use SPF.', dosage: 'Apply pea-sized amount at night. Start with alternate nights.', requiresRx: true, inStock: true, rating: 4.8, reviews: 9870, pack: '20g tube', emoji: '🧴', fastDelivery: true, tags: ['Rx', 'Acne', 'Anti-Aging'] },
  { id: 'm38', name: 'Hydrocortisone Cream 1%', brand: 'Dermacort', category: 'skin', price: 65, mrp: 78, description: 'Mild topical corticosteroid for short-term relief of skin inflammation, itching, and redness.', uses: 'Eczema, Contact Dermatitis, Insect Bites, Rash', sideEffects: 'Skin thinning with prolonged use.', dosage: 'Apply twice daily. Do not use more than 7 days.', requiresRx: false, inStock: true, rating: 4.5, reviews: 5430, pack: '15g tube', emoji: '🧴', tags: ['Steroid', 'Derma'] },
  // Eye & Ear
  { id: 'm39', name: 'Ciprofloxacin Eye Drops 0.3%', brand: 'Ciplox-D', category: 'eye-ear', price: 85, mrp: 102, description: 'Fluoroquinolone antibiotic eye drops for bacterial conjunctivitis and corneal ulcers.', uses: 'Bacterial Conjunctivitis, Corneal Ulcer, Blepharitis', sideEffects: 'Temporary burning, blurred vision.', dosage: '1–2 drops every 4–6 hours.', requiresRx: true, inStock: true, rating: 4.7, reviews: 6540, pack: '5ml bottle', emoji: '👁️', fastDelivery: true, tags: ['Rx', 'Eye Infection'] },
  { id: 'm40', name: 'Lubricating Eye Drops', brand: 'Refresh Tears', category: 'eye-ear', price: 175, mrp: 210, description: 'Preservative-free artificial tears that mimic natural tear composition. Safe for contact lens users.', uses: 'Dry Eyes, Screen Fatigue, Contact Lens Discomfort', sideEffects: 'None.', dosage: '1–2 drops as needed, up to 6 times/day.', requiresRx: false, inStock: true, rating: 4.8, reviews: 11230, pack: '15ml bottle', emoji: '💧', fastDelivery: true, bestseller: true, tags: ['OTC', 'Screen Time'] },
  { id: 'm41', name: 'Otrivin Nasal Spray', brand: 'Otrivin', category: 'eye-ear', price: 98, mrp: 118, description: 'Xylometazoline nasal decongestant for fast nasal congestion relief. Lasts up to 12 hours.', uses: 'Nasal Congestion, Sinusitis, Cold, Allergic Rhinitis', sideEffects: 'Rebound congestion if used > 3 days.', dosage: '1–2 sprays per nostril twice daily. Max 3 days.', requiresRx: false, inStock: true, rating: 4.6, reviews: 7890, pack: '10ml spray bottle', emoji: '👃', fastDelivery: true, tags: ['Decongestant'] },
  // First Aid
  { id: 'm42', name: 'Povidone Iodine 5%', brand: 'Betadine', category: 'first-aid', price: 65, mrp: 78, description: 'Broad-spectrum antiseptic solution effective against bacteria, fungi, viruses, and spores.', uses: 'Wound Cleaning, Cuts, Surgical Site Prep, Burns', sideEffects: 'Staining, rare iodine allergy.', dosage: 'Apply to clean wound with cotton. Allow to dry.', requiresRx: false, inStock: true, rating: 4.7, reviews: 9876, pack: '30mL bottle', emoji: '🧴', fastDelivery: true, tags: ['Antiseptic', 'Essential'] },
  { id: 'm43', name: 'Waterproof Bandages 10pk', brand: '3M Nexcare', category: 'first-aid', price: 85, mrp: 100, description: 'Flexible waterproof bandages that stay on even during hand washing. Latex-free and gentle on skin.', uses: 'Cuts, Blisters, Scrapes, Minor Wounds', sideEffects: 'None.', dosage: 'Clean wound, apply bandage, replace daily.', requiresRx: false, inStock: true, rating: 4.6, reviews: 4560, pack: 'Pack of 10 assorted sizes', emoji: '🩹', fastDelivery: true, tags: ['First Aid', 'Waterproof'] },
  { id: 'm44', name: 'Burnol Antiseptic Cream', brand: 'Burnol', category: 'first-aid', price: 45, mrp: 52, description: 'Antiseptic cream with benzalkonium chloride for minor burns, scalds, and skin abrasions.', uses: 'Burns, Scalds, Abrasions, Sunburn', sideEffects: 'Rare sensitization.', dosage: 'Apply thin layer on affected area 2–3 times daily.', requiresRx: false, inStock: true, rating: 4.6, reviews: 7234, pack: '20g tube', emoji: '🧴', fastDelivery: true, tags: ['Burns', 'OTC'] },
  { id: 'm45', name: 'Digital Thermometer', brand: 'Omron', category: 'first-aid', price: 245, mrp: 290, description: 'Clinical-grade digital thermometer with 1-second fast reading and fever alarm. Memory for last 20 readings.', uses: 'Fever Measurement, Body Temperature Monitoring', sideEffects: 'None.', dosage: 'Place under tongue or armpit for 1 second.', requiresRx: false, inStock: true, rating: 4.9, reviews: 22340, pack: '1 thermometer + battery', emoji: '🌡️', fastDelivery: true, bestseller: true, tags: ['Device', 'Fever'] },
  // Devices
  { id: 'm46', name: 'Blood Pressure Monitor', brand: 'Omron M3', category: 'devices', price: 2450, mrp: 2950, description: 'Clinically validated upper arm BP monitor with Intellisense technology. Detects irregular heartbeat.', uses: 'Hypertension Monitoring, Cardiac Patient Home Use', sideEffects: 'None.', dosage: 'Measure at same time daily. Rest 5 min before.', requiresRx: false, inStock: true, rating: 4.8, reviews: 18970, pack: '1 monitor + cuff + batteries', emoji: '🩺', fastDelivery: true, bestseller: true, tags: ['Device', 'BP', 'Best Seller'] },
  { id: 'm47', name: 'Pulse Oximeter', brand: 'Dr Trust', category: 'devices', price: 895, mrp: 1050, description: 'Fingertip pulse oximeter with OLED display showing SpO2, pulse rate, and perfusion index instantly.', uses: 'Oxygen Saturation Monitoring, COVID Recovery, Fitness', sideEffects: 'None.', dosage: 'Place on fingertip and wait 10 seconds.', requiresRx: false, inStock: true, rating: 4.7, reviews: 15670, pack: '1 device + batteries + carry pouch', emoji: '📊', fastDelivery: true, bestseller: true, tags: ['Device', 'SpO2'] },
  { id: 'm48', name: 'Glucometer Complete Kit', brand: 'Accu-Chek Active', category: 'devices', price: 1250, mrp: 1500, description: 'Complete blood glucose monitoring kit with glucometer, 10 test strips, lancets, and lancing device.', uses: 'Diabetes Monitoring, Blood Sugar Testing', sideEffects: 'None.', dosage: 'Test as prescribed. Typically fasting + post-meal.', requiresRx: false, inStock: true, rating: 4.9, reviews: 21340, pack: 'Glucometer + 10 strips + 10 lancets', emoji: '🩸', fastDelivery: true, bestseller: true, tags: ['Device', 'Diabetes'] },
  // Additional Pain Relief
  { id: 'm49', name: 'Tramadol 50mg', brand: 'Tramazac', category: 'pain-relief', price: 95, mrp: 115, description: 'Opioid-like analgesic for moderate-to-severe acute pain. Dual mechanism of action.', uses: 'Post-Surgical Pain, Severe Injury, Cancer Pain', sideEffects: 'Nausea, dizziness, drowsiness, dependence risk.', dosage: 'As prescribed. Typically 50–100mg every 4–6h.', requiresRx: true, inStock: true, rating: 4.4, reviews: 2340, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'Controlled', 'Severe Pain'] },
  { id: 'm50', name: 'Pregabalin 75mg', brand: 'Lyrica', category: 'pain-relief', price: 285, mrp: 340, description: 'Anticonvulsant for neuropathic pain. Also used for fibromyalgia and generalized anxiety disorder.', uses: 'Diabetic Neuropathy, Post-Herpetic Neuralgia, Fibromyalgia', sideEffects: 'Dizziness, somnolence, weight gain.', dosage: '75mg twice daily. May increase to 150mg twice daily.', requiresRx: true, inStock: true, rating: 4.6, reviews: 4230, pack: 'Strip of 10 capsules', emoji: '💊', tags: ['Rx', 'Neuropathic Pain'] },
  // Additional Vitamins
  { id: 'm51', name: 'Iron + Folic Acid', brand: 'Ferrous Sulphate', category: 'vitamins', price: 45, mrp: 55, description: 'Iron supplement with folic acid for iron-deficiency anemia. Each tablet provides 60mg elemental iron.', uses: 'Iron Deficiency Anemia, Pregnancy, Fatigue', sideEffects: 'Black stools, constipation, nausea.', dosage: '1 tablet daily on empty stomach. Or with Vitamin C.', requiresRx: false, inStock: true, rating: 4.6, reviews: 6780, pack: 'Strip of 30 tablets', emoji: '🔴', fastDelivery: true, tags: ['Iron', 'Pregnancy Safe'] },
  { id: 'm52', name: 'Biotin 10000mcg', brand: 'HealthVit', category: 'vitamins', price: 185, mrp: 225, description: 'High-strength biotin (Vitamin B7) for hair, skin, and nail health. Supports keratin production.', uses: 'Hair Loss, Brittle Nails, Skin Health, Glucose Metabolism', sideEffects: 'Very rare. May interfere with some lab tests.', dosage: '1 tablet daily with breakfast.', requiresRx: false, inStock: true, rating: 4.6, reviews: 8900, pack: 'Pack of 60 tablets', emoji: '💊', newArrival: true, tags: ['Hair Health', 'Biotin'] },
  // Additional Gastro
  { id: 'm53', name: 'Lactulose 3.35g Syrup', brand: 'Duphalac', category: 'gastro', price: 145, mrp: 172, description: 'Osmotic laxative that softens stools and promotes bowel movement. Safe for long-term use.', uses: 'Chronic Constipation, Hepatic Encephalopathy', sideEffects: 'Bloating, flatulence initially.', dosage: '15–30ml once daily. Adjust as needed.', requiresRx: false, inStock: true, rating: 4.5, reviews: 4560, pack: '200ml bottle', emoji: '🍬', tags: ['Laxative', 'OTC'] },
  { id: 'm54', name: 'Ondansetron 4mg', brand: 'Emeset', category: 'gastro', price: 68, mrp: 82, description: '5-HT3 antagonist antiemetic for severe nausea and vomiting, including chemotherapy-induced.', uses: 'Chemotherapy-Induced Nausea, Post-Op Nausea, Severe Vomiting', sideEffects: 'Headache, constipation, QT prolongation (rare).', dosage: '1 tablet 30 min before chemotherapy. For nausea: 1 tab as needed.', requiresRx: true, inStock: true, rating: 4.8, reviews: 5670, pack: 'Strip of 4 tablets', emoji: '💊', fastDelivery: true, tags: ['Rx', 'Antiemetic'] },
  // Additional Skin
  { id: 'm55', name: 'Sunscreen SPF 50+ PA+++', brand: 'La Shield', category: 'skin', price: 320, mrp: 385, description: 'Broad-spectrum mineral sunscreen with zinc oxide and titanium dioxide. Non-comedogenic, dermatologist tested.', uses: 'Sun Protection, Anti-Aging, Post-Procedure Care, Daily Use', sideEffects: 'None for mineral formula.', dosage: 'Apply 30 min before sun exposure. Reapply every 2h.', requiresRx: false, inStock: true, rating: 4.8, reviews: 14560, pack: '75g tube', emoji: '☀️', fastDelivery: true, bestseller: true, tags: ['Sun Protection', 'Derma-tested'] },
  { id: 'm56', name: 'Salicylic Acid Face Wash 2%', brand: 'Neutrogena', category: 'skin', price: 285, mrp: 340, description: 'BHA face wash that unclogs pores, reduces blackheads, and prevents acne breakouts.', uses: 'Acne, Oily Skin, Blackheads, Enlarged Pores', sideEffects: 'Dryness, initial purging.', dosage: 'Use twice daily. Follow with moisturizer.', requiresRx: false, inStock: true, rating: 4.7, reviews: 17890, pack: '175ml bottle', emoji: '🫧', fastDelivery: true, bestseller: true, newArrival: false, tags: ['Acne', 'BHA'] },
  // Additional devices/cardiac
  { id: 'm57', name: 'Nitroglycerin 0.5mg SL', brand: 'Nitrocontin', category: 'cardiac', price: 55, mrp: 65, description: 'Sublingual nitrate for immediate angina relief. Works within 2–3 minutes.', uses: 'Acute Angina, Chest Pain Relief, Heart Failure', sideEffects: 'Headache, hypotension, flushing.', dosage: '1 tablet under tongue at onset of angina. Repeat after 5 min if needed. Call 112 if no relief after 3 tablets.', requiresRx: true, inStock: true, rating: 4.9, reviews: 3210, pack: 'Bottle of 25 tablets', emoji: '💊', fastDelivery: true, tags: ['Rx', 'Cardiac Emergency'] },
  { id: 'm58', name: 'Furosemide 40mg', brand: 'Lasix', category: 'cardiac', price: 35, mrp: 42, description: 'Loop diuretic for fluid retention in heart failure, liver disease, and kidney disorders.', uses: 'Edema, Heart Failure, Hypertension, Renal Disease', sideEffects: 'Frequent urination, hypokalemia.', dosage: '1 tablet once daily in the morning.', requiresRx: true, inStock: true, rating: 4.6, reviews: 4500, pack: 'Strip of 10 tablets', emoji: '💊', tags: ['Rx', 'Diuretic'] },
  // More vitamins
  { id: 'm59', name: 'Ashwagandha 500mg Extract', brand: 'Himalaya', category: 'vitamins', price: 195, mrp: 240, description: 'Standardized KSM-66 ashwagandha for stress reduction, energy, and testosterone support.', uses: 'Stress, Anxiety, Low Energy, Muscle Recovery, Fertility', sideEffects: 'Avoid in thyroid disorders.', dosage: '1 capsule twice daily with meals.', requiresRx: false, inStock: true, rating: 4.7, reviews: 19870, pack: 'Pack of 60 capsules', emoji: '🌿', fastDelivery: true, bestseller: true, newArrival: false, tags: ['Ayurvedic', 'Adaptogen', 'Popular'] },
  { id: 'm60', name: 'Collagen Peptides 10g', brand: 'WellBeing Nutrition', category: 'vitamins', price: 890, mrp: 1050, description: 'Hydrolyzed marine collagen peptides Type I & III for skin elasticity, joints, and hair.', uses: 'Skin Health, Joint Support, Hair & Nails, Anti-Aging', sideEffects: 'None. Avoid if seafood allergy.', dosage: '1 sachet dissolved in water daily.', requiresRx: false, inStock: true, rating: 4.5, reviews: 6780, pack: 'Pack of 30 sachets', emoji: '✨', newArrival: true, tags: ['Collagen', 'Skin', 'Premium'] },
  // More first aid / misc
  { id: 'm61', name: 'N95 Respirator Masks', brand: '3M', category: 'first-aid', price: 195, mrp: 240, description: 'NIOSH-approved N95 respirators with 95% filtration efficiency for airborne particles and viruses.', uses: 'Air Pollution, Viral Protection, Healthcare, Dust', sideEffects: 'None.', dosage: 'Fit test before each use. Replace every 8 hours.', requiresRx: false, inStock: true, rating: 4.8, reviews: 32100, pack: 'Pack of 5 masks', emoji: '😷', fastDelivery: true, bestseller: true, tags: ['Protection', 'COVID', 'Pollution'] },
  { id: 'm62', name: 'Disposable Gloves Medium', brand: 'Ansell', category: 'first-aid', price: 145, mrp: 172, description: 'Powder-free nitrile examination gloves with textured fingertips for superior grip. Latex-free.', uses: 'Medical Examination, First Aid, Food Handling, Cleaning', sideEffects: 'None. Latex-free.', dosage: 'Single use only.', requiresRx: false, inStock: true, rating: 4.5, reviews: 8900, pack: 'Box of 100 gloves', emoji: '🧤', fastDelivery: true, tags: ['PPE', 'Single Use'] },
];

// ── Deals / Banners ────────────────────────────────────────────────────────────

const DEALS = [
  { id: 'd1', title: 'Diabetes Care Combo', subtitle: 'Save up to 30% on diabetes essentials', bg: 'from-blue-600 to-indigo-700', emoji: '🩸', cta: 'Shop Now', category: 'diabetes' },
  { id: 'd2', title: 'Vitamin Megasale', subtitle: 'Buy 2 vitamins & get 15% extra off', bg: 'from-amber-500 to-orange-600', emoji: '☀️', cta: 'Explore', category: 'vitamins' },
  { id: 'd3', title: 'Free Next-Day Delivery', subtitle: 'On all orders above ₹499 today only', bg: 'from-emerald-600 to-teal-700', emoji: '🚚', cta: 'Order Now', category: 'all' },
  { id: 'd4', title: 'Heart Health Pack', subtitle: 'Cardiac essentials at unbeatable prices', bg: 'from-rose-600 to-red-700', emoji: '❤️', cta: 'View Pack', category: 'cardiac' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const discount = (m: Medicine) => Math.round(((m.mrp - m.price) / m.mrp) * 100);

// ── Banner Carousel ───────────────────────────────────────────────────────────

function BannerCarousel({ onCategoryClick }: { onCategoryClick: (cat: string) => void }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % DEALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden h-36 select-none">
      <AnimatePresence mode="wait">
        {DEALS.map((d, i) =>
          i === active ? (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r ${d.bg} p-6 flex items-center justify-between cursor-pointer`}
              onClick={() => onCategoryClick(d.category)}
            >
              <div>
                <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">Limited Offer</p>
                <h3 className="text-white font-black text-xl leading-tight">{d.title}</h3>
                <p className="text-white/70 text-sm mt-1">{d.subtitle}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-white text-xs font-bold">
                  {d.cta} <ArrowRight className="size-3" />
                </div>
              </div>
              <span className="text-7xl opacity-80">{d.emoji}</span>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>
      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {DEALS.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} className={cn('w-5 h-1.5 rounded-full transition-all', i === active ? 'bg-white' : 'bg-white/40')} />
        ))}
      </div>
      {/* Arrows */}
      <button onClick={() => setActive((a) => (a - 1 + DEALS.length) % DEALS.length)} className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors">
        <ChevronLeft className="size-4" />
      </button>
      <button onClick={() => setActive((a) => (a + 1) % DEALS.length)} className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors">
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

// ── Medicine Card ─────────────────────────────────────────────────────────────

function MedicineCard({
  medicine, cartQty, onAdd, onInc, onDec, onViewDetail,
}: {
  medicine: Medicine; cartQty: number;
  onAdd: () => void; onInc: () => void; onDec: () => void; onViewDetail: () => void;
}) {
  const disc = discount(medicine);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      className="bg-card rounded-2xl border border-border/60 overflow-hidden flex flex-col group"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary/8 to-primary/3 p-4 flex items-center justify-between">
        <span className="text-3xl">{medicine.emoji}</span>
        <div className="flex flex-col items-end gap-1">
          {disc > 0 && <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">{disc}% OFF</span>}
          {medicine.bestseller && <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">Bestseller</span>}
          {medicine.newArrival && <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full">New</span>}
          {medicine.fastDelivery && !medicine.bestseller && <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1"><Zap className="size-2.5" /> Fast</span>}
        </div>
        {medicine.requiresRx && (
          <div className="absolute bottom-2 left-3">
            <Badge variant="outline" className="text-[9px] border-blue-300 text-blue-600 bg-blue-50 dark:bg-blue-950/30">Rx</Badge>
          </div>
        )}
        {/* Quick view */}
        <button onClick={onViewDetail} className="absolute top-2 right-2 size-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
          <Eye className="size-3 text-muted-foreground" />
        </button>
      </div>
      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{medicine.brand}</p>
          <h3 className="font-semibold text-sm leading-tight mt-0.5 cursor-pointer hover:text-primary transition-colors" onClick={onViewDetail}>{medicine.name}</h3>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{medicine.uses}</p>
        </div>
        <div className="text-[10px] text-muted-foreground">{medicine.pack}</div>
        <div className="flex items-center gap-1">
          <Star className="size-3 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold">{medicine.rating}</span>
          <span className="text-[10px] text-muted-foreground">({medicine.reviews.toLocaleString()})</span>
        </div>
        <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold">₹{medicine.price}</span>
            {medicine.mrp > medicine.price && <span className="text-xs text-muted-foreground line-through ml-1.5">₹{medicine.mrp}</span>}
          </div>
          {!medicine.inStock ? (
            <span className="text-xs text-muted-foreground">Out of stock</span>
          ) : cartQty === 0 ? (
            <Button size="sm" className="h-8 px-3 text-xs gap-1" onClick={onAdd}><Plus className="size-3" /> Add</Button>
          ) : (
            <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1">
              <button onClick={onDec} className="size-6 rounded-md bg-background flex items-center justify-center hover:bg-muted transition-colors"><Minus className="size-3" /></button>
              <span className="text-sm font-bold w-5 text-center">{cartQty}</span>
              <button onClick={onInc} className="size-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"><Plus className="size-3" /></button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Product Detail Modal ──────────────────────────────────────────────────────

function ProductDetailModal({ medicine, cartQty, onAdd, onInc, onDec, onClose }: {
  medicine: Medicine; cartQty: number;
  onAdd: () => void; onInc: () => void; onDec: () => void; onClose: () => void;
}) {
  const disc = discount(medicine);
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-3xl border shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 flex items-start gap-4">
            <span className="text-5xl">{medicine.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{medicine.brand}</p>
              <h2 className="font-black text-lg leading-tight mt-0.5">{medicine.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{medicine.pack}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {medicine.bestseller && <Badge className="bg-amber-500/20 text-amber-600 border-amber-300 text-[10px]">Bestseller</Badge>}
                {medicine.newArrival && <Badge className="bg-blue-500/20 text-blue-600 border-blue-300 text-[10px]">New Arrival</Badge>}
                {medicine.fastDelivery && <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300"><Zap className="size-2.5 mr-0.5" />Fast Delivery</Badge>}
                {medicine.requiresRx && <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-300">Rx Required</Badge>}
              </div>
            </div>
            <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center shrink-0"><X className="size-4" /></button>
          </div>
          {/* Body */}
          <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black">₹{medicine.price}</span>
              {medicine.mrp > medicine.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{medicine.mrp}</span>
                  <Badge className="bg-emerald-500 text-white text-xs">{disc}% OFF</Badge>
                </>
              )}
            </div>
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={cn('size-4', s <= Math.round(medicine.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted')} />)}</div>
              <span className="font-bold">{medicine.rating}</span>
              <span className="text-sm text-muted-foreground">({medicine.reviews.toLocaleString()} reviews)</span>
            </div>
            {/* Description */}
            <div>
              <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5"><Info className="size-3.5 text-primary" /> About</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{medicine.description}</p>
            </div>
            {/* Uses */}
            <div>
              <h4 className="font-bold text-sm mb-2 flex items-center gap-1.5"><Pill className="size-3.5 text-primary" /> Uses</h4>
              <div className="flex flex-wrap gap-1.5">
                {medicine.uses.split(', ').map((u) => <span key={u} className="text-xs bg-primary/10 text-primary rounded-lg px-2.5 py-1 font-medium">{u}</span>)}
              </div>
            </div>
            {/* Dosage */}
            <div className="bg-muted/50 rounded-xl p-4">
              <h4 className="font-bold text-sm mb-1.5">Dosage & Administration</h4>
              <p className="text-sm text-muted-foreground">{medicine.dosage}</p>
            </div>
            {/* Side effects */}
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4">
              <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5 text-amber-700 dark:text-amber-400"><AlertCircle className="size-3.5" /> Side Effects & Warnings</h4>
              <p className="text-sm text-amber-700/80 dark:text-amber-400/80">{medicine.sideEffects}</p>
            </div>
            {/* Tags */}
            {medicine.tags && (
              <div className="flex flex-wrap gap-1.5">
                {medicine.tags.map((t) => <span key={t} className="text-[10px] bg-muted rounded-full px-2.5 py-1 text-muted-foreground font-medium">{t}</span>)}
              </div>
            )}
          </div>
          {/* Footer */}
          <div className="px-6 pb-6 pt-3 border-t">
            {!medicine.inStock ? (
              <Button disabled className="w-full">Out of Stock</Button>
            ) : cartQty === 0 ? (
              <Button className="w-full h-12 text-base font-bold gap-2" onClick={onAdd}><ShoppingCart className="size-4" /> Add to Cart · ₹{medicine.price}</Button>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-primary/10 rounded-xl p-2">
                  <button onClick={onDec} className="size-8 rounded-lg bg-background border flex items-center justify-center hover:bg-muted"><Minus className="size-4" /></button>
                  <span className="text-lg font-black w-8 text-center">{cartQty}</span>
                  <button onClick={onInc} className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"><Plus className="size-4" /></button>
                </div>
                <span className="text-xl font-black text-primary">₹{medicine.price * cartQty}</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Cart Sheet ─────────────────────────────────────────────────────────────────

function CartSheet({ open, onClose, items, onInc, onDec, onRemove, onCheckout }: {
  open: boolean; onClose: () => void; items: CartItem[];
  onInc: (id: string) => void; onDec: (id: string) => void;
  onRemove: (id: string) => void; onCheckout: () => void;
}) {
  const total = items.reduce((s, i) => s + i.medicine.price * i.qty, 0);
  const savings = items.reduce((s, i) => s + (i.medicine.mrp - i.medicine.price) * i.qty, 0);
  const delivery = total >= 499 ? 0 : 40;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-primary" />
                <h2 className="font-bold text-lg">Cart</h2>
                <Badge className="text-xs">{items.reduce((s, i) => s + i.qty, 0)}</Badge>
              </div>
              <button onClick={onClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <ShoppingCart className="size-12 opacity-20" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item.medicine.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                      <span className="text-2xl">{item.medicine.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.medicine.name}</p>
                        <p className="text-xs text-muted-foreground">{item.medicine.pack}</p>
                        <p className="text-sm font-bold text-primary mt-0.5">₹{item.medicine.price * item.qty}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => onDec(item.medicine.id)} className="size-7 rounded-lg bg-background border flex items-center justify-center hover:bg-muted"><Minus className="size-3" /></button>
                        <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                        <button onClick={() => onInc(item.medicine.id)} className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"><Plus className="size-3" /></button>
                        <button onClick={() => onRemove(item.medicine.id)} className="size-7 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors ml-1"><X className="size-3" /></button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            {items.length > 0 && (
              <div className="px-5 py-4 border-t space-y-3">
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-1.5"><Tag className="size-3.5" /> You save</span>
                    <span className="font-bold">₹{savings}</span>
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">₹{total}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="size-3.5" /> Delivery</span><span className={cn('font-semibold', delivery === 0 ? 'text-emerald-600' : '')}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
                  {total < 499 && <p className="text-[11px] text-muted-foreground text-center bg-amber-50 dark:bg-amber-950/20 rounded-lg py-1.5">Add ₹{499 - total} more for free delivery</p>}
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-bold text-base">Total</span>
                  <span className="text-2xl font-black text-primary">₹{total + delivery}</span>
                </div>
                <Button className="w-full h-12 text-base font-bold gap-2" onClick={onCheckout}><CreditCard className="size-4" /> Proceed to Checkout</Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Checkout Flow ─────────────────────────────────────────────────────────────

function CheckoutFlow({ open, total, items, onClose, onDone }: {
  open: boolean; total: number; items: CartItem[];
  onClose: () => void; onDone: (orderId: string) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [step, setStep] = useState<CheckoutStep>('address');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [bank, setBank] = useState('');
  const [wallet, setWallet] = useState('');
  const [orderId, setOrderId] = useState('');
  const [progress, setProgress] = useState(0);

  const canPayProceed = () => {
    if (payMethod === 'upi') return upiId.includes('@');
    if (payMethod === 'card') return cardNum.replace(/\s/g, '').length === 16 && cardExpiry.length === 5 && cardCvv.length >= 3 && cardName.trim().length > 2;
    if (payMethod === 'netbanking') return bank !== '';
    if (payMethod === 'wallet') return wallet !== '';
    return false;
  };

  const handlePay = async () => {
    setStep('processing');
    setProgress(0);
    const id = `LLORD-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    for (let i = 0; i <= 100; i += 2) {
      await new Promise((r) => setTimeout(r, 40));
      setProgress(i);
    }
    setOrderId(id);
    // Notify admin
    useUIStore.getState().addNotification({
      title: 'New Pharmacy Order',
      message: `${user?.name ?? 'A patient'} placed an order for ${items.reduce((s, i) => s + i.qty, 0)} item(s) worth ₹${total.toLocaleString('en-IN')}. Order ID: ${id}`,
      type: 'SYSTEM',
    });
    // Add to live feed for tracking
    const deliveryLat = 28.6139 + (Math.random() - 0.5) * 0.09;
    const deliveryLng = 77.2090 + (Math.random() - 0.5) * 0.09;
    useLiveFeedStore.getState().addPharmacyOrder({
      orderId: id,
      patientEmail: user?.email ?? '',
      patientName: user?.name ?? 'Customer',
      items: items.map(i => ({ name: i.medicine.name, qty: i.qty, price: i.medicine.price * i.qty })),
      total,
      address: address ? `${address}, ${pincode}` : 'Delivery address',
      status: 'placed',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      deliveryLat,
      deliveryLng,
    });
    setStep('confirmed');
  };

  const handleClose = () => {
    setStep('address');
    setAddress(''); setPincode(''); setUpiId(''); setCardNum(''); setCardExpiry(''); setCardCvv(''); setCardName(''); setBank(''); setWallet('');
    onClose();
  };

  const deliveryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const deliveryStr = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={step !== 'processing' && step !== 'confirmed' ? handleClose : undefined}>
        <motion.div initial={{ opacity: 0, scale: 0.92, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="bg-card rounded-3xl border shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>

          {/* ── PROCESSING ── */}
          {step === 'processing' && (
            <div className="p-10 flex flex-col items-center gap-6">
              <div className="relative size-24">
                <svg className="size-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                  <motion.circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" className="text-primary" strokeDasharray={251} strokeDashoffset={251 - (251 * progress) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="size-8 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black mb-2">Processing Payment</h3>
                <p className="text-muted-foreground text-sm">Please wait while we securely process your payment...</p>
                <div className="mt-4 flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="size-2 rounded-full bg-primary" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                  ))}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Shield className="size-3.5 text-emerald-500" /> 256-bit SSL Encrypted · Secured by Razorpay</p>
            </div>
          )}

          {/* ── CONFIRMED ── */}
          {step === 'confirmed' && (
            <div className="p-8 text-center space-y-5">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 250, delay: 0.1 }} className="mx-auto size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="size-10 text-emerald-500" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-2xl font-black text-emerald-600 mb-1">Payment Confirmed! 🎉</h2>
                <p className="text-muted-foreground text-sm">Your order has been placed successfully.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-muted/50 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Order ID</span><span className="font-black text-primary">{orderId}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount Paid</span><span className="font-bold">₹{total}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment Method</span><span className="font-semibold capitalize">{payMethod === 'upi' ? `UPI (${upiId})` : payMethod}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items</span><span className="font-semibold">{items.reduce((s, i) => s + i.qty, 0)} items</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated Delivery</span><span className="font-bold text-emerald-600">{deliveryStr}</span></div>
              </motion.div>
              {/* Tracker */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-2">
                {[
                  { icon: CheckCircle, label: 'Order Placed', done: true },
                  { icon: Package, label: 'Packing', done: true },
                  { icon: Truck, label: 'Out for Delivery', done: false },
                ].map(({ icon: Icon, label, done }) => (
                  <div key={label} className={cn('flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-xs', done ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted/40')}>
                    <Icon className={cn('size-5', done ? 'text-emerald-500' : 'text-muted-foreground')} />
                    <span className={cn('font-semibold text-center leading-tight', done ? 'text-emerald-600' : 'text-muted-foreground')}>{label}</span>
                  </div>
                ))}
              </motion.div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
                <Phone className="size-3.5 text-blue-500 shrink-0" />
                You will receive an SMS & email confirmation at {user?.email || 'your registered email'}.
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => { onDone(orderId); handleClose(); }}>Continue Shopping</Button>
                <Button className="flex-1 h-12 font-bold gap-2" onClick={() => { onDone(orderId); handleClose(); useNavigationStore.getState().setCurrentPage('order-tracking'); }}>
                  <Truck className="size-4" />Track Order
                </Button>
              </div>
            </div>
          )}

          {/* ── ADDRESS ── */}
          {step === 'address' && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <h2 className="text-lg font-bold">Delivery Address</h2>
                  <p className="text-xs text-muted-foreground">Step 1 of 2 · Where should we deliver?</p>
                </div>
                <button onClick={handleClose} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><MapPin className="size-4 text-primary" /> Full Address</label>
                  <textarea placeholder="House/Flat No., Street Name, Landmark..." value={address} onChange={(e) => setAddress(e.target.value)} className="flex w-full min-h-[90px] rounded-xl border border-input bg-muted/40 px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">City</label>
                    <Input placeholder="Mumbai" className="bg-muted/40 border-input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pincode</label>
                    <Input placeholder="400001" value={pincode} onChange={(e) => setPincode(e.target.value.slice(0, 6))} className="bg-muted/40 border-input" />
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400">
                  <Truck className="size-4 shrink-0 mt-0.5" />
                  <div><p className="font-bold">Free delivery on this order!</p><p className="opacity-80 mt-0.5">Estimated arrival: <strong>{deliveryStr}</strong></p></div>
                </div>
                <Button className="w-full h-12 font-bold gap-2" disabled={!address.trim() || pincode.length < 6} onClick={() => setStep('payment')}>
                  Proceed to Payment <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === 'payment' && (
            <div className="flex flex-col">
              <div className="flex items-center gap-3 px-6 py-4 border-b">
                <button onClick={() => setStep('address')} className="size-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronLeft className="size-4" /></button>
                <div>
                  <h2 className="text-lg font-bold">Payment</h2>
                  <p className="text-xs text-muted-foreground">Step 2 of 2 · Choose payment method</p>
                </div>
                <button onClick={handleClose} className="ml-auto size-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
              </div>
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
                    { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                    { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                    { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, Amazon Pay' },
                  ].map((p) => (
                    <button key={p.id} onClick={() => setPayMethod(p.id as typeof payMethod)} className={cn('flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-xs font-semibold transition-all', payMethod === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                      <span className="text-2xl">{p.icon}</span>
                      <span className="font-bold">{p.label}</span>
                      <span className="font-normal text-muted-foreground">{p.desc}</span>
                    </button>
                  ))}
                </div>
                {/* UPI */}
                {payMethod === 'upi' && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Enter UPI ID</label>
                    <Input placeholder="name@upi / 9876543210@paytm" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-muted/40" />
                    <div className="flex gap-2 flex-wrap">
                      {['@okaxis', '@ybl', '@paytm', '@oksbi'].map((s) => (
                        <button key={s} onClick={() => setUpiId((v) => v.split('@')[0] + s)} className="text-xs bg-muted rounded-lg px-2.5 py-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-medium">{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Card */}
                {payMethod === 'card' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Card Number</label>
                      <Input placeholder="1234 5678 9012 3456" value={cardNum} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 16); setCardNum(v.replace(/(.{4})/g, '$1 ').trim()); }} className="bg-muted/40 font-mono tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold">Expiry (MM/YY)</label>
                        <Input placeholder="12/27" value={cardExpiry} onChange={(e) => { let v = e.target.value.replace(/\D/g, ''); if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4); setCardExpiry(v); }} maxLength={5} className="bg-muted/40" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold">CVV</label>
                        <Input type="password" placeholder="•••" value={cardCvv} onChange={(e) => setCardCvv(e.target.value.slice(0, 4))} className="bg-muted/40" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold">Name on Card</label>
                      <Input placeholder="RAHUL SHARMA" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} className="bg-muted/40 uppercase" />
                    </div>
                  </div>
                )}
                {/* Net Banking */}
                {payMethod === 'netbanking' && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Select Bank</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'BOB'].map((b) => (
                        <button key={b} onClick={() => setBank(b)} className={cn('rounded-xl border-2 p-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1', bank === b ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                          <Building2 className="size-4" />{b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Wallet */}
                {payMethod === 'wallet' && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Select Wallet</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[{ id: 'paytm', label: 'Paytm', e: '📱' }, { id: 'amazon', label: 'Amazon Pay', e: '📦' }, { id: 'mobikwik', label: 'MobiKwik', e: '💜' }].map((w) => (
                        <button key={w.id} onClick={() => setWallet(w.id)} className={cn('rounded-xl border-2 p-2.5 text-xs font-bold transition-all flex flex-col items-center gap-1', wallet === w.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40')}>
                          <span className="text-xl">{w.e}</span>{w.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Summary */}
                <div className="bg-muted/50 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-sm mb-2">Order Summary</p>
                  {items.slice(0, 3).map((item) => (
                    <div key={item.medicine.id} className="flex justify-between text-xs text-muted-foreground">
                      <span className="truncate mr-2">{item.medicine.name} × {item.qty}</span>
                      <span className="font-semibold shrink-0">₹{item.medicine.price * item.qty}</span>
                    </div>
                  ))}
                  {items.length > 3 && <p className="text-xs text-muted-foreground">+{items.length - 3} more items...</p>}
                  <div className="flex justify-between border-t pt-2 font-bold"><span>Total Amount</span><span className="text-primary text-lg">₹{total}</span></div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3">
                  <Shield className="size-4 text-blue-500 shrink-0" /> 100% secure payment. SSL encrypted.
                </div>
                <Button className="w-full h-12 text-base font-bold gap-2" disabled={!canPayProceed()} onClick={handlePay}>
                  <Check className="size-4" /> Pay ₹{total} Now
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PatientPharmacyStorePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [detailMed, setDetailMed] = useState<Medicine | null>(null);
  const [lastOrderId, setLastOrderId] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'rating'>('relevance');

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.medicine.price * i.qty, 0);
  const deliveryCharge = cartTotal >= 499 ? 0 : 40;

  const filtered = useMemo(() => {
    let list = MEDICINES.filter((m) => {
      const matchCat = category === 'all' || m.category === category;
      const q = search.toLowerCase();
      const matchSearch = !q || m.name.toLowerCase().includes(q) || m.brand.toLowerCase().includes(q) || m.uses.toLowerCase().includes(q) || (m.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
    if (sortBy === 'price-low') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, category, sortBy]);

  const cartQty = useCallback((id: string) => cart.find((c) => c.medicine.id === id)?.qty ?? 0, [cart]);

  const addToCart = (m: Medicine) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.medicine.id === m.id);
      if (ex) return prev.map((c) => c.medicine.id === m.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { medicine: m, qty: 1 }];
    });
    toast.success(`Added to cart`, { description: `${m.name} · ₹${m.price}` });
  };

  const incQty = (id: string) => setCart((prev) => prev.map((c) => c.medicine.id === id ? { ...c, qty: c.qty + 1 } : c));
  const decQty = (id: string) => setCart((prev) => {
    const item = prev.find((c) => c.medicine.id === id);
    if (!item) return prev;
    if (item.qty <= 1) return prev.filter((c) => c.medicine.id !== id);
    return prev.map((c) => c.medicine.id === id ? { ...c, qty: c.qty - 1 } : c);
  });
  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.medicine.id !== id));

  const bestsellers = useMemo(() => MEDICINES.filter((m) => m.bestseller).slice(0, 6), []);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b px-4 md:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Pill className="size-4 text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm leading-none">LifeLink Pharmacy</h1>
              <p className="text-[9px] text-muted-foreground">100% Genuine · Free Delivery above ₹499</p>
            </div>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search medicines, brands, conditions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20"><X className="size-3" /></button>}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 text-sm font-semibold shrink-0">
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 size-5 bg-red-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 space-y-6">
        {/* ── Deal Banner ── */}
        <BannerCarousel onCategoryClick={(cat) => { setCategory(cat); setSearch(''); }} />

        {/* ── Trust Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: Truck, label: 'Free delivery above ₹499', color: 'text-emerald-500' },
            { icon: Shield, label: '100% genuine medicines', color: 'text-blue-500' },
            { icon: Clock, label: 'Delivery in 24 hours', color: 'text-amber-500' },
            { icon: Gift, label: 'Earn reward points', color: 'text-purple-500' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 bg-muted/40 rounded-xl px-3 py-2.5">
              <Icon className={cn('size-4 shrink-0', color)} />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(({ id, label }) => (
            <button key={id} onClick={() => setCategory(id)} className={cn('flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all shrink-0', category === id ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Bestsellers row (when on All) ── */}
        {category === 'all' && !search && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Percent className="size-4 text-amber-500" />
              <h2 className="font-bold text-base">Bestsellers</h2>
              <span className="text-xs text-muted-foreground">Most ordered medicines</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {bestsellers.map((m) => (
                <motion.div key={m.id} whileHover={{ y: -3 }} onClick={() => setDetailMed(m)} className="shrink-0 w-36 bg-card border border-border/60 rounded-2xl p-3 cursor-pointer hover:border-primary/40 transition-colors">
                  <span className="text-2xl">{m.emoji}</span>
                  <p className="text-xs font-bold mt-1.5 leading-tight truncate">{m.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.brand}</p>
                  <p className="text-sm font-black text-primary mt-1.5">₹{m.price}</p>
                  {m.mrp > m.price && <p className="text-[10px] text-emerald-600 font-semibold">{discount(m)}% off</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sort + Count ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span> products
            {search && <span> for "<strong>{search}</strong>"</span>}
          </p>
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="text-xs bg-muted/50 border-0 rounded-lg px-2 py-1.5 outline-none">
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Best Rated</option>
            </select>
          </div>
        </div>

        {/* ── Medicine Grid ── */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 text-muted-foreground">
              <Pill className="size-12 mx-auto mb-3 opacity-20" />
              <p className="font-bold">No medicines found</p>
              <p className="text-sm">Try a different search or category</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setCategory('all'); }}>Clear Filters</Button>
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filtered.map((m) => (
                <MedicineCard key={m.id} medicine={m} cartQty={cartQty(m.id)} onAdd={() => addToCart(m)} onInc={() => incQty(m.id)} onDec={() => decQty(m.id)} onViewDetail={() => setDetailMed(m)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer Info ── */}
        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2.5">
            <Shield className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <div><p className="font-semibold text-foreground">100% Genuine Products</p><p>All medicines sourced from licensed distributors and verified for authenticity.</p></div>
          </div>
          <div className="flex items-start gap-2.5">
            <Phone className="size-4 text-blue-500 shrink-0 mt-0.5" />
            <div><p className="font-semibold text-foreground">Pharmacist Support 24/7</p><p>Call 1800-123-4567 for prescription verification and medicine queries.</p></div>
          </div>
          <div className="flex items-start gap-2.5">
            <ArrowRight className="size-4 text-amber-500 shrink-0 mt-0.5" />
            <div><p className="font-semibold text-foreground">Easy Returns</p><p>7-day hassle-free returns on all non-opened and non-Rx medicines.</p></div>
          </div>
        </div>
      </div>

      {/* ── Sticky Cart Bar ── */}
      <AnimatePresence>
        {cartCount > 0 && !cartOpen && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
            <button onClick={() => setCartOpen(true)} className="w-full flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-3.5 shadow-2xl shadow-primary/30">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-black">{cartCount}</span>
                <span className="font-semibold text-sm">items in cart</span>
              </div>
              <div className="flex items-center gap-2 font-black">
                <span>₹{cartTotal + deliveryCharge}</span>
                <ChevronRight className="size-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Last order banner ── */}
      <AnimatePresence>
        {lastOrderId && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3 text-sm font-semibold">
            <CheckCircle className="size-5" />
            Order {lastOrderId} placed successfully!
            <button onClick={() => setLastOrderId('')} className="ml-2 opacity-70 hover:opacity-100"><X className="size-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product Detail Modal ── */}
      {detailMed && (
        <ProductDetailModal
          medicine={detailMed}
          cartQty={cartQty(detailMed.id)}
          onAdd={() => { addToCart(detailMed); }}
          onInc={() => incQty(detailMed.id)}
          onDec={() => decQty(detailMed.id)}
          onClose={() => setDetailMed(null)}
        />
      )}

      {/* ── Cart Sheet ── */}
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} items={cart} onInc={incQty} onDec={decQty} onRemove={removeFromCart} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />

      {/* ── Checkout Flow ── */}
      <CheckoutFlow
        open={checkoutOpen}
        total={cartTotal + deliveryCharge}
        items={cart}
        onClose={() => setCheckoutOpen(false)}
        onDone={(id) => { setCart([]); setLastOrderId(id); }}
      />
    </div>
  );
}
