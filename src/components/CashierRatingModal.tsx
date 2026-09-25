import React, { useState } from 'react';
import {
  Flame,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Smartphone,
  Gift,
  ThumbsUp,
  Heart,
  RefreshCw,
  Clock,
  Car,
  Ticket,
  Utensils,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PigIcon } from './PigIcon';
import { CashierRating, CategoryRatingScores, Member } from '../types';

interface CashierRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRating: (rating: CashierRating) => void;
  members: Member[];
  initialTable?: string;
  initialBill?: number;
  initialCashier?: string;
}

// 3 Sub-questions for each of the 5 categories (15 questions total)
export const RATING_SUB_QUESTIONS = {
  parking: [
    { id: 'p1', text: 'ทางเข้า-ออกสะดวก ชัดเจน ไม่ต้องขับรถวน' },
    { id: 'p2', text: 'พื้นที่จอดรถกว้างขวาง ร่มรื่น และมีความปลอดภัย' },
    { id: 'p3', text: 'มีระบบ “Park Easy” และคำแนะนำจุดจอดที่แม่นยำ' },
  ],
  booking: [
    { id: 'b1', text: 'ขั้นตอนการกดจองคิวสะดวกรวดเร็ว ไม่ซับซ้อน' },
    { id: 'b2', text: 'ข้อมูลบัตรคิวระบุชัดเจน (คิว, คิวก่อนหน้า, เวลารอ, จำนวนคน)' },
    { id: 'b3', text: 'ระบบบันทึกและคำนวณคิวแม่นยำ ไม่ตกหล่น' },
  ],
  waiting: [
    { id: 'w1', text: 'ระยะเวลารอโต๊ะตรงตามที่ระบบประมาณการไว้' },
    { id: 'w2', text: 'จุดนั่งรอรับรองหน้าร้านสะดวกสบาย เพียงพอ' },
    { id: 'w3', text: 'พนักงานเรียกคิวและแจ้งเตือนเข้าโต๊ะทันเวลา' },
  ],
  service: [
    { id: 's1', text: 'พนักงานบริการสุภาพ อัธยาศัยดี ยิ้มแย้มใส่ใจ' },
    { id: 's2', text: 'บาร์อาหารสดสะอาด มีการเติมวัตถุดิบสม่ำเสมอ' },
    { id: 's3', text: 'ความสะอาดของโต๊ะ อุปกรณ์ และบรรยากาศในร้าน' },
  ],
  payment: [
    { id: 'pay1', text: 'คิดเงินและตรวจสอบรายการบิลได้อย่างถูกต้อง รวดเร็ว' },
    { id: 'pay2', text: 'ช่องทางชำระเงินสะดวก สแกน QR Code ได้รวดเร็ว' },
    { id: 'pay3', text: 'บันทึกแต้มสะสมสมาชิก (1 หัว = 1 แต้ม) ถูกต้องทันใจ' },
  ],
};

export const CashierRatingModal: React.FC<CashierRatingModalProps> = ({
  isOpen,
  onClose,
  onSubmitRating,
  members,
  initialTable = 'โต๊ะ 08',
  initialBill = 596,
  initialCashier = 'พนักงานบริการประจำจุด',
}) => {
  // Sub-question scores map: Record<questionId, number (1-5)>
  const [subScores, setSubScores] = useState<Record<string, number>>({
    p1: 5, p2: 5, p3: 5,
    b1: 5, b2: 5, b3: 5,
    w1: 5, w2: 5, w3: 5,
    s1: 5, s2: 5, s3: 5,
    pay1: 5, pay2: 5, pay3: 5,
  });

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    parking: true,
    booking: true,
    waiting: true,
    service: true,
    payment: true,
  });

  const [tableId, setTableId] = useState<string>(initialTable);
  const [billAmount, setBillAmount] = useState<number>(initialBill);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'บริการรวดเร็ว',
    'พนักงานยิ้มแย้ม',
    'ที่จอดรถสะดวก',
  ]);
  const [comment, setComment] = useState<string>('');
  const [memberPhone, setMemberPhone] = useState<string>('089-123-4567');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedRating, setSubmittedRating] = useState<CashierRating | null>(null);

  if (!isOpen) return null;

  // Compute category scores from their 3 sub-questions
  const calcCatScore = (catKey: keyof typeof RATING_SUB_QUESTIONS): number => {
    const qList = RATING_SUB_QUESTIONS[catKey];
    const sum = qList.reduce((acc, q) => acc + (subScores[q.id] || 5), 0);
    return Math.round(sum / qList.length);
  };

  const categoryRatings: CategoryRatingScores = {
    parking: calcCatScore('parking'),
    booking: calcCatScore('booking'),
    waiting: calcCatScore('waiting'),
    service: calcCatScore('service'),
    payment: calcCatScore('payment'),
  };

  const catValues = Object.values(categoryRatings);
  const overallAvg = catValues.reduce((a, b) => a + b, 0) / catValues.length;
  const overallStars = Math.round(overallAvg);

  const starDetails: Record<
    number,
    { label: string; emoji: string; color: string; desc: string }
  > = {
    5: {
      label: 'ประทับใจยอดเยี่ยมที่สุด!',
      emoji: '🤩',
      color: 'text-amber-400',
      desc: 'บริการรวดเร็ว ครบทุกด้าน คุ้มค่าเกินราคา 149.-',
    },
    4: {
      label: 'พึงพอใจมาก',
      emoji: '😊',
      color: 'text-emerald-400',
      desc: 'บริการดีเยี่ยมทุกจุด มีข้อแนะนำเพิ่มเติมเล็กน้อย',
    },
    3: {
      label: 'ปานกลาง / พอใช้',
      emoji: '😐',
      color: 'text-yellow-400',
      desc: 'มาตรฐานทั่วไป อยากให้พัฒนาบริการในบางหัวข้อ',
    },
    2: {
      label: 'ควรปรับปรุงการบริการ',
      emoji: '🙁',
      color: 'text-orange-400',
      desc: 'มีจุดที่ติดขัดหรือไม่ได้รับความสะดวกในมื้อนี้',
    },
    1: {
      label: 'ไม่ประทับใจอย่างยิ่ง',
      emoji: '😡',
      color: 'text-red-500',
      desc: 'บริการไม่ตรงตามมาตรฐาน ต้องการให้ผู้จัดการแก้ไขด่วน',
    },
  };

  const currentDetail = starDetails[overallStars] || starDetails[5];

  const categoriesConfig = [
    {
      key: 'parking' as const,
      title: 'การจอดรถ',
      enTitle: 'Parking & Park Easy',
      desc: 'ความสะดวก ที่จอดรถกว้างขวาง ปลอดภัย และระบบนำทาง Park Easy',
      icon: Car,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
      activeColor: 'fill-sky-400 text-sky-400',
    },
    {
      key: 'booking' as const,
      title: 'การจองคิว',
      enTitle: 'Queue Booking System',
      desc: 'ความสะดวกรวดเร็วในการกดจองคิว ไม่ซับซ้อน ได้คิวทันที',
      icon: Ticket,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      activeColor: 'fill-amber-400 text-amber-400',
    },
    {
      key: 'waiting' as const,
      title: 'การรอคิว',
      enTitle: 'Queue Waiting & Time',
      desc: 'เวลารอตรงตามที่คาดหมาย จุดนั่งรอสะดวกสบาย เรียกคิวชัดเจน',
      icon: Clock,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      activeColor: 'fill-indigo-400 text-indigo-400',
    },
    {
      key: 'service' as const,
      title: 'บริการภายในร้าน',
      enTitle: 'In-Store Dining Service',
      desc: 'พนักงานสุภาพ เอาใจใส่ เติมอาหารสดสม่ำเสมอ แอร์เย็น สะอาด',
      icon: Utensils,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      activeColor: 'fill-emerald-400 text-emerald-400',
    },
    {
      key: 'payment' as const,
      title: 'การชำระเงิน',
      enTitle: 'Checkout & Payment',
      desc: 'คิดเงินถูกต้อง สแกนจ่ายไว ได้แต้มสะสม LINE OA (1 หัว = 1 แต้ม) ทันใจ',
      icon: CreditCard,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
      activeColor: 'fill-rose-400 text-rose-400',
    },
  ];

  const handleSetSubScore = (qId: string, val: number) => {
    setSubScores((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const handleSetCategoryAllSub = (catKey: keyof typeof RATING_SUB_QUESTIONS, val: number) => {
    const qList = RATING_SUB_QUESTIONS[catKey];
    setSubScores((prev) => {
      const updated = { ...prev };
      qList.forEach((q) => {
        updated[q.id] = val;
      });
      return updated;
    });
  };

  const handleSetAllSubQuestions = (val: number) => {
    const updated: Record<string, number> = {};
    Object.values(RATING_SUB_QUESTIONS).forEach((list) => {
      list.forEach((q) => {
        updated[q.id] = val;
      });
    });
    setSubScores(updated);
  };

  const toggleCategoryExpand = (catKey: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const positiveTagOptions = [
    'ที่จอดรถสะดวก กว้างขวาง 🚗',
    'จองคิวง่าย ไม่ซับซ้อน 🎫',
    'รอคิวไม่นาน ตรงเวลา ⏳',
    'บริการสุภาพ เติมของสดไว 🍲',
    'คิดเงินรวดเร็ว สแกนจ่ายไว 💳',
    'พนักงานยิ้มแย้มใส่ใจ 😊',
    'น้ำจิ้มรสเด็ด จัดจ้าน 🥣',
    'คุ้มค่า 149.- อิ่มไม่อั้น 💯',
  ];

  const constructiveTagOptions = [
    'ที่จอดรถเต็ม / หายาก 🚗',
    'ระบบจองคิวติดขัด 🎫',
    'คิวยาว รอนานเกินคาด ⏳',
    'อาหาร/บาร์ของสดเติมช้า 🍲',
    'คิดเงินหรือตัดแต้มช้า 💳',
    'เรียกพนักงานยาก 🙋',
    'กระทะไหม้เร็ว ขอเปลี่ยนช้า 🍳',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedMember = members.find(
      (m) => m.phone.replace(/[-\s]/g, '') === memberPhone.replace(/[-\s]/g, '')
    );

    const isLowRating = overallStars <= 2 || Object.values(categoryRatings).some((v) => v <= 2);

    const newRating: CashierRating = {
      id: `RAT-${Date.now().toString().slice(-4)}`,
      stars: overallStars,
      ratingLabel: currentDetail.label,
      categoryRatings: { ...categoryRatings },
      tableId,
      billAmount,
      cashierStaff: initialCashier,
      customerName: matchedMember?.name || 'ลูกค้าหน้าร้าน (สวนดอก)',
      phone: memberPhone.trim() || undefined,
      categoryTags: selectedTags.map((t) =>
        t.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s/.-]/g, '').trim()
      ),
      comment: comment.trim() || undefined,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      createdAt: new Date().toISOString(),
      bonusPointsAwarded: memberPhone ? 1 : 0,
      status: isLowRating ? 'urgent_recovery' : 'normal',
      managerNotified: isLowRating,
    };

    onSubmitRating(newRating);
    setSubmittedRating(newRating);
    setIsSubmitted(true);
  };

  const handleResetForNext = () => {
    setIsSubmitted(false);
    setSubmittedRating(null);
    handleSetAllSubQuestions(5);
    setComment('');
    setSelectedTags(['บริการรวดเร็ว', 'พนักงานยิ้มแย้ม', 'ที่จอดรถสะดวก']);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative text-stone-100 my-auto">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 px-5 py-3.5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md">
              <img
                src="/logo.jpg"
                alt="โลโก้ร้าน มันนี่หมูกระทะ"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-white tracking-wide">
                  มันนี่หมูกระทะ <span className="text-amber-400 font-normal">สวนดอก</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ระบบประเมินความพึงพอใจ
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                ให้คะแนนความพึงพอใจ 5 ด้านหลัก (พร้อมคำถามย่อย 3 ข้อต่อด้าน)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="ปิดหน้าจอ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Context Meta Ribbon */}
        <div className="bg-stone-950/70 border-b border-stone-800/80 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-stone-300">
            <span className="flex items-center gap-1 font-semibold text-amber-300">
              📍 ประเมินสำหรับ:
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="bg-stone-900 border border-stone-700 text-white rounded-lg px-2 py-0.5 text-xs font-bold focus:outline-none"
              >
                {Array.from({ length: 28 }, (_, i) => `โต๊ะ ${String(i + 1).padStart(2, '0')}`).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
                <option value="ลูกค้า Walk-in หน้าร้าน">ลูกค้า Walk-in หน้าร้าน</option>
              </select>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-400">ยอดบิล:</span>
            <span className="font-mono font-black text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
              {billAmount.toLocaleString()} ฿
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Question Headline & Quick 5-Pig CTA */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-stone-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                    CUSTOMER SATISFACTION EVALUATION
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span className="text-xl">🐷</span>
                    <span>ให้คะแนนความพึงพอใจการบริการ (เรทเต็ม 5 น้องหมู 🐷)</span>
                  </h3>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetAllSubQuestions(5)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <span>🐷 ให้ 5 หมูเต็มทุกข้อ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetAllSubQuestions(4)}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    🐷 4 หมูทุกข้อ
                  </button>
                </div>
              </div>

              {/* OVERALL SCORE DISPLAY SUMMARY */}
              <div className="bg-stone-950/90 rounded-2xl p-3.5 border border-stone-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentDetail.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-black ${currentDetail.color}`}>
                        คะแนนความพึงพอใจรวม: {overallAvg.toFixed(1)} / 5.0 น้องหมู 🐷
                      </span>
                      <span className="text-xs text-stone-400 font-normal">
                        ({currentDetail.label})
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      คำนวณจากคะแนนคำถามย่อย 3 ข้อในแต่ละด้าน (รวม 15 ข้อประเมิน)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-2xl sm:text-3xl transition-all ${
                        s <= overallStars ? 'scale-110 drop-shadow-[0_2px_8px_rgba(244,114,182,0.6)] filter-none' : 'opacity-25 grayscale'
                      }`}
                    >
                      🐷
                    </span>
                  ))}
                </div>
              </div>

              {/* 5 CATEGORIES WITH 3 SUB-QUESTIONS EACH */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-stone-300 block">
                  ประเมินคะแนนแยกตาม 5 หัวข้อ (หัวข้อละ 3 คำถามย่อย):
                </span>

                <div className="space-y-3">
                  {categoriesConfig.map((cat, idx) => {
                    const currentScore = categoryRatings[cat.key];
                    const subList = RATING_SUB_QUESTIONS[cat.key];
                    const isExpanded = expandedCategories[cat.key] !== false;
                    const IconComp = cat.icon;

                    return (
                      <div
                        key={cat.key}
                        className="bg-stone-950/80 border border-stone-800 rounded-2xl p-3.5 transition-all space-y-3"
                      >
                        {/* Category Header Row */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${cat.bgColor} flex items-center justify-center shrink-0`}>
                              <IconComp className={`w-4 h-4 ${cat.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">
                                  {idx + 1}. {cat.title}
                                </span>
                                <span className="text-[10px] text-stone-500 font-mono">
                                  ({cat.enTitle})
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 mt-0.5">
                                {cat.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Fast set all 3 sub-questions for this category */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleSetCategoryAllSub(cat.key, s)}
                                  className={`p-0.5 cursor-pointer transition-all hover:scale-125 ${
                                    s <= currentScore ? 'scale-105' : 'opacity-30 grayscale hover:opacity-75'
                                  }`}
                                  title={`ตั้งค่า ${cat.title} ทุกข้อเป็น ${s} หมู`}
                                >
                                  <span className="text-base select-none">🐷</span>
                                </button>
                              ))}
                            </div>

                            <span className="font-mono font-bold text-xs text-pink-300 bg-stone-900 px-2 py-0.5 rounded-lg border border-stone-800 flex items-center gap-1">
                              <span>{currentScore}/5</span>
                              <span className="text-xs">🐷</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleCategoryExpand(cat.key)}
                              className="text-stone-400 hover:text-white p-1"
                              title={isExpanded ? 'ย่อคำถามย่อย' : 'ขยายคำถามย่อย'}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 3 Sub-Questions Container */}
                        {isExpanded && (
                          <div className="bg-stone-900/60 rounded-xl p-2.5 border border-stone-855 space-y-2 text-xs">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-pink-400 block pb-1 border-b border-stone-800">
                              3 คำถามย่อยประเมิน{cat.title} (แตะ 🐷 เพื่อให้คะแนน):
                            </span>

                            {subList.map((q, qIdx) => {
                              const qScore = subScores[q.id] || 5;
                              return (
                                <div
                                  key={q.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded-lg bg-stone-950/60 hover:bg-stone-950 transition-colors"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-mono text-stone-500 mt-0.5">
                                      {idx + 1}.{qIdx + 1}
                                    </span>
                                    <span className="text-stone-300 text-xs leading-snug">
                                      {q.text}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pl-4 sm:pl-0">
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => handleSetSubScore(q.id, s)}
                                          className={`p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none ${
                                            s <= qScore ? 'scale-110 drop-shadow-sm' : 'opacity-30 grayscale hover:opacity-80'
                                          }`}
                                          title={`ให้ ${s} หมู`}
                                        >
                                          <span className="text-lg sm:text-xl inline-block select-none">
                                            🐷
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-pink-300 w-9 text-right flex items-center justify-end gap-0.5">
                                      <span>{qScore}</span>
                                      <span className="text-[11px]">🐷</span>
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC FEEDBACK TAGS */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-stone-300 flex items-center justify-between">
                  <span>
                    {overallStars >= 4 ? '✨ จุดเด่นที่คุณลูกค้าประทับใจ:' : '⚠️ จุดที่ต้องการให้ทางร้านปรับปรุง:'}
                  </span>
                  <span className="text-[11px] text-stone-500 font-normal">
                    (แตะเลือกเพิ่มเติมได้)
                  </span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {(overallStars >= 4 ? positiveTagOptions : constructiveTagOptions).map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? overallStars >= 4
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold shadow-sm'
                              : 'bg-red-500/20 border-red-500 text-red-200 font-bold shadow-sm'
                            : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CUSTOM COMMENT BOX */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-300 block">
                  ข้อเสนอแนะเพิ่มเติมถึงผู้จัดการร้าน (ไม่ระบุก็ได้):
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    overallStars >= 4
                      ? 'บอกเล่าความประทับใจในบริการ หรือเมนูที่ชื่นชอบในมื้อนี้...'
                      : 'ระบุจุดที่ต้องการให้ปรับปรุง เช่น ที่จอดรถ, เวลาจองคิว, หรือการบริการ...'
                  }
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-stone-600 outline-none resize-none transition-colors"
                />
              </div>

              {/* BONUS LOYALTY POINTS / MEMBER PHONE PROMPT */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-stone-950 to-stone-950 border border-emerald-500/40 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5">
                      <span>รับโบนัสสะสมแต้ม LINE OA +1 แต้ม ทันที!</span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded font-black">
                        FREE
                      </span>
                    </span>
                    <p className="text-[11px] text-stone-400">
                      กรอกเบอร์โทรสมาชิกเพื่อรับแต้มขอบคุณสำหรับคำประเมินความพึงพอใจ
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="08x-xxx-xxxx"
                    className="w-full sm:w-36 bg-stone-900 border border-stone-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  ข้าม / ปิดหน้าจอ
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>บันทึกคะแนนความพึงพอใจ (เฉลี่ย {overallAvg.toFixed(1)} หมู 🐷)</span>
                </button>
              </div>
            </form>
          ) : (
            /* SUBMITTED CONFIRMATION SCREEN */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              {submittedRating && submittedRating.stars >= 4 ? (
                /* HIGH RATING APPRECIATION */
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-emerald-950/60 animate-bounce">
                    🐷
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      THANK YOU VERY MUCH
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center gap-2">
                      <span>ขอบพระคุณสำหรับคะแนนความพึงพอใจ {submittedRating.stars} น้องหมู 🐷 ค่ะ!</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                      กำลังใจของท่านมีค่ายิ่งต่อทีมงานมันนี่หมูกระทะ สาขาสวนดอก ทุกคน เราจะรักษามาตรฐานความสะอาด และบริการที่อบอุ่นตลอดไปค่ะ
                    </p>
                  </div>

                  {/* 5-Category Breakdown Display */}
                  <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 max-w-md mx-auto space-y-2 text-left">
                    <span className="text-xs font-bold text-stone-300 block border-b border-stone-800 pb-1.5">
                      📊 สรุปคะแนนการประเมิน 5 ด้านของคุณ:
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-sky-400" />
                          <span>การจอดรถ:</span>
                        </span>
                        <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                          <span className="text-xs">🐷</span>
                          <span>{submittedRating.categoryRatings?.parking ?? submittedRating.stars}/5</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <Ticket className="w-3.5 h-3.5 text-amber-400" />
                          <span>การจองคิว:</span>
                        </span>
                        <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                          <span className="text-xs">🐷</span>
                          <span>{submittedRating.categoryRatings?.booking ?? submittedRating.stars}/5</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>การรอคิว:</span>
                        </span>
                        <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                          <span className="text-xs">🐷</span>
                          <span>{submittedRating.categoryRatings?.waiting ?? submittedRating.stars}/5</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                          <span>บริการในร้าน:</span>
                        </span>
                        <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                          <span className="text-xs">🐷</span>
                          <span>{submittedRating.categoryRatings?.service ?? submittedRating.stars}/5</span>
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-between p-2 rounded-xl bg-stone-900">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                          <span>การชำระเงิน:</span>
                        </span>
                        <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                          <span className="text-xs">🐷</span>
                          <span>{submittedRating.categoryRatings?.payment ?? submittedRating.stars}/5</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {submittedRating.bonusPointsAwarded ? (
                    <div className="inline-flex items-center gap-2 bg-emerald-950/70 border border-emerald-500/60 px-4 py-2 rounded-2xl text-xs text-emerald-200 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      <span>โอนโบนัส +1 แต้ม เข้า LINE OA (เบอร์ {submittedRating.phone}) เรียบร้อยแล้วค่ะ</span>
                    </div>
                  ) : null}

                  <div className="p-3 bg-stone-950/70 rounded-2xl border border-stone-800 text-xs text-stone-400 max-w-sm mx-auto space-y-1">
                    <div className="flex justify-between">
                      <span>ตำแหน่ง:</span>
                      <span className="text-stone-200 font-bold">
                        {submittedRating.tableId} • {submittedRating.billAmount?.toLocaleString()} ฿
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>เวลาบันทึก:</span>
                      <span className="text-stone-300">{submittedRating.timestamp}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* LOW RATING APOLOGY */
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 mx-auto flex items-center justify-center text-3xl">
                    🙇‍♀️
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-red-400 font-bold">
                      SERVICE RECOVERY PROTOCOL
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      กราบขออภัยคุณลูกค้าเป็นอย่างยิ่งค่ะ
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto">
                      ทางร้านน้อมรับคะแนน {submittedRating?.stars} หมู และคำติชมเพื่อการพัฒนาปรับปรุงในแต่ละด้านอย่างจริงจัง ระบบได้ส่งเรื่องด่วนไปยัง <strong>ผู้จัดการนุ่น</strong> และ <strong>หัวหน้ากะบอย</strong> ทันทีค่ะ
                    </p>
                  </div>

                  <div className="bg-red-950/50 border border-red-500/60 p-4 rounded-2xl text-xs text-red-200 text-left max-w-md mx-auto space-y-2">
                    <div className="font-bold flex items-center gap-1.5 text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>มาตรการชดเชยและขออภัยทันที:</span>
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed">
                      • มอบคูปองส่วนลดพิเศษผ่าน LINE OA สำหรับการมารับประทานครั้งต่อไป<br />
                      • ผู้จัดการร้านเข้าตรวจสอบสาเหตุที่เกิดขึ้น ณ {submittedRating?.tableId} โดยทันที<br />
                      • บันทึกลงใน Incident Protocol เพื่อป้องกันไม่ให้เกิดซ้ำ
                    </p>
                  </div>
                </div>
              )}

              {/* RESET BUTTON */}
              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>เริ่มประเมินท่านถัดไป (Next Customer)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  เสร็จสิ้น / ปิดหน้าจอ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
