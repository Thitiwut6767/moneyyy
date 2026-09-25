import React, { useState } from 'react';
import {
  Flame,
  Clock,
  MapPin,
  Phone,
  Ticket,
  Users,
  Award,
  Gift,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertOctagon,
  Search,
  ExternalLink,
  ShieldCheck,
  Utensils,
  Coffee,
  Heart,
  Car,
  Wifi,
  CreditCard,
  GraduationCap,
  Stethoscope,
  Send,
  MessageCircle,
  HelpCircle,
  ThumbsUp,
  Tag,
  Plus,
  Minus,
  Layers,
  ShoppingBag,
  Trash2,
  X,
  Eye,
  Bell,
  RefreshCw,
  Thermometer,
  Info,
  QrCode,
  Copy,
  Check,
  ShieldAlert,
  AlertTriangle,
  Radio,
  Zap,
  MessageSquare,
  Smartphone,
  UserPlus,
  Coins,
  History,
  Navigation,
  Compass,
} from 'lucide-react';
import {
  QueueData,
  Member,
  QueueTicket,
  Incident,
  IncidentCategory,
  ApologyLevel,
  CashierRating,
  BuffetItem,
  ParkingSlot,
} from '../types';
import {
  calculateCashierRatingStats,
  BUFFET_ITEMS,
  INITIAL_PARKING_SLOTS,
} from '../data/store';
import { RATING_SUB_QUESTIONS } from './CashierRatingModal';
import { PigIcon } from './PigIcon';

interface CustomerWebsiteProps {
  queueData: QueueData;
  members: Member[];
  incidents?: Incident[];
  onAddIncident?: (incident: Incident) => void;
  onAddQueueTicket: (ticket: QueueTicket) => void;
  onOpenStaffPortal: () => void;
  onOpenAiChat: (prefillPrompt?: string) => void;
  onAddMemberPoints?: (memberId: string, addedPoints: number, newBill: number, desc?: string) => void;
  onRegisterMember?: (newMember: Member) => void;
  onRedeemReward?: (memberId: string, rewardTitle: string, pointsCost: number) => string;
  cashierRatings?: CashierRating[];
  onOpenCashierRating?: () => void;
}

export const CustomerWebsite: React.FC<CustomerWebsiteProps> = ({
  queueData,
  members,
  incidents = [],
  onAddIncident,
  onAddQueueTicket,
  onOpenStaffPortal,
  onOpenAiChat,
  onAddMemberPoints,
  onRegisterMember,
  onRedeemReward,
  cashierRatings = [],
  onOpenCashierRating,
}) => {
  // Table Service Call & Issue Reporting State
  const [selectedTable, setSelectedTable] = useState('โต๊ะ 08');
  const [serviceIssueType, setServiceIssueType] = useState<IncidentCategory>('เตาแก๊ส/แก๊สกระป๋องมีปัญหา');
  const [serviceDetail, setServiceDetail] = useState('');
  const [serviceRepeatCalls, setServiceRepeatCalls] = useState(1);
  const [serviceSubmittedNotice, setServiceSubmittedNotice] = useState<string | null>(null);
  const [lastDispatchedIncident, setLastDispatchedIncident] = useState<Incident | null>(null);

  // Cashier CSAT Statistics
  const ratingStats = calculateCashierRatingStats(cashierRatings);
  const [activeCouponVoucher, setActiveCouponVoucher] = useState<{
    code: string;
    title: string;
    discount: string;
    table: string;
    validUntil: string;
  } | null>(null);

  // LINE OA state
  const [copiedLineId, setCopiedLineId] = useState(false);
  const [copiedCouponCode, setCopiedCouponCode] = useState<string | null>(null);

  // Queue booking form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pax, setPax] = useState(4);
  const [category, setCategory] = useState<'Normal' | 'Student' | 'MedicalStaff'>('Student');
  const [bookedTicket, setBookedTicket] = useState<QueueTicket | null>(null);

  // Member points search state & Web Dashboard
  const [searchPhone, setSearchPhone] = useState('');
  const [searchedMember, setSearchedMember] = useState<Member | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Web Member Dashboard State (No self-earn bill tab)
  const [activeMemberId, setActiveMemberId] = useState<string>(members[0]?.id || '');
  const [dashboardTab, setDashboardTab] = useState<'card' | 'rewards' | 'history' | 'simulator'>('card');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regType, setRegType] = useState<'นักศึกษา มช.' | 'บุคลากรทางการแพทย์ (สวนดอก)' | 'ลูกค้าทั่วไป'>('ลูกค้าทั่วไป');
  const [regLineId, setRegLineId] = useState('');

  // Food Menu & Seasonal Drop State
  const [foodCategory, setFoodCategory] = useState<'all' | 'seasonal' | 'pork' | 'seafood' | 'veggie' | 'sauce' | 'dessert'>('all');
  const [foodSearch, setFoodSearch] = useState('');

  // Park Easy @ Money State
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>(INITIAL_PARKING_SLOTS);
  const [myParkedSlotId, setMyParkedSlotId] = useState<string | null>('A04');
  const [selectedVehicleType, setSelectedVehicleType] = useState<'car' | 'motorcycle'>('car');
  const [smartRouteNotice, setSmartRouteNotice] = useState<string | null>(
    '🧭 แนะนำเข้า “ทางเข้า 1 (ถ.สุเทพ)” เลี้ยวขวาเข้า Zone A ช่อง A-03 ว่างทันที ห่างประตูร้าน 12 ม. ไม่ต้องขับรถวน!'
  );

  // Simulated LINE Push Toast
  const [linePushToast, setLinePushToast] = useState<{
    title: string;
    body: string;
    pointsDelta?: string;
  } | null>(null);

  // LINE Simulator Chat State
  const [simChatMessages, setSimChatMessages] = useState<
    Array<{
      id: string;
      sender: 'user' | 'bot';
      text?: string;
      cardType?: 'card' | 'rewards' | 'queue' | 'promo' | 'earn';
      time: string;
    }>
  >([
    {
      id: 'm1',
      sender: 'bot',
      text: 'สวัสดีค่ะคุณลูกค้า ยินดีต้อนรับสู่ LINE Official Account มันนี่หมูกระทะ สวนดอก (@moneymookata) 🐷✨ เลือกกดปุ่มเมนูด้านล่างเพื่อเช็คแต้ม สะสมแต้ม หรือแลกสิทธิ์ทานฟรีได้เลยค่ะ!',
      time: '17:30 น.',
    },
  ]);

  // Derived current member
  const currentMember: Member =
    members.find((m) => m.id === activeMemberId) ||
    searchedMember ||
    members[0] || {
      id: 'MEM-TEMP',
      name: 'ผู้เยี่ยมชม (ยังไม่ได้ล็อกอิน)',
      phone: '08x-xxx-xxxx',
      type: 'ลูกค้าทั่วไป',
      points: 0,
      totalVisits: 0,
      lastVisit: '-',
      memberCode: 'MMK-GUEST',
      coupons: [],
      transactions: [],
    };

  const showLineToast = (title: string, body: string, pointsDelta?: string) => {
    setLinePushToast({ title, body, pointsDelta });
    setTimeout(() => setLinePushToast(null), 5500);
  };

  const handleWebRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) return;

    const newCode = `MMK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newMember: Member = {
      id: `MEM-${Date.now().toString().slice(-4)}`,
      name: regName.trim(),
      phone: regPhone.trim(),
      type: regType,
      points: 10,
      totalVisits: 1,
      lastVisit: 'วันนี้',
      lineId: regLineId.trim() || `@line_${regPhone.slice(-4)}`,
      lineConnected: true,
      memberCode: newCode,
      coupons: [
        {
          id: `CPN-WELCOME-${Date.now()}`,
          code: `WELCOME-${Math.floor(100 + Math.random() * 900)}`,
          title: 'ฟรีน้ำแข็งถังแรก (ต้อนรับสมาชิกใหม่)',
          pointsCost: 0,
          redeemedAt: 'วันนี้',
          expiresAt: '30 วันนับจากนี้',
          status: 'active',
        },
      ],
      transactions: [
        {
          id: `TX-WELCOME-${Date.now()}`,
          type: 'bonus',
          points: 10,
          title: 'โบนัสแต้มต้อนรับสมาชิกใหม่ (ผ่านหน้าเว็บ LINE OA)',
          timestamp: 'เมื่อสักครู่',
        },
      ],
    };

    if (onRegisterMember) {
      onRegisterMember(newMember);
    }
    setActiveMemberId(newMember.id);
    setSearchedMember(newMember);
    setIsRegisterModalOpen(false);
    setRegName('');
    setRegPhone('');
    setRegLineId('');

    showLineToast(
      '🎉 สมัครสมาชิกผ่าน LINE OA สำเร็จ!',
      `ยินดีต้อนรับคุณ ${newMember.name} (รหัส ${newCode}) ได้รับฟรี +10 แต้มต้อนรับทันที!`,
      '+10 แต้ม'
    );
  };

  const handleWebRedeem = (rewardTitle: string, pointsCost: number) => {
    if (currentMember.points < pointsCost) {
      alert(`แต้มของคุณไม่เพียงพอ (ต้องการ ${pointsCost} แต้ม แต่มี ${currentMember.points} แต้ม)`);
      return;
    }

    if (onRedeemReward) {
      const code = onRedeemReward(currentMember.id, rewardTitle, pointsCost);
      showLineToast(
        '🎉 แลกของรางวัลสำเร็จ!',
        `ตัด ${pointsCost} แต้ม รหัสคูปอง ${code} (${rewardTitle}) พร้อมใช้งานแล้ว สามารถแสดงหน้าร้านได้ทันที`,
        `-${pointsCost} แต้ม`
      );
    }
  };

  const handleSimLineAction = (actionKey: 'card' | 'earn' | 'rewards' | 'queue' | 'promo') => {
    const timeNow = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const actionTitles = {
      card: '🪪 ขอดูบัตรสมาชิก & แต้มสะสม',
      earn: '⚡ สะสมแต้มจากใบเสร็จล่าสุด',
      rewards: '🎁 สิทธิ์แลกของรางวัล E-Coupon',
      queue: '🎫 เช็คคิวสด & จองคิวออนไลน์',
      promo: '🔥 โปรโมชันนักศึกษา มช. & แพทย์สวนดอก',
    };

    setSimChatMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        text: actionTitles[actionKey],
        time: timeNow,
      },
      {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        cardType: actionKey,
        time: timeNow,
      },
    ]);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    // Calculate remaining queues waiting ahead
    const waitingTicketsAhead = queueData.tickets.filter((t) => t.status === 'Waiting').length;
    const openTables = Math.max(queueData.openTablesPerRound, 1);
    const calculatedWait = waitingTicketsAhead > 0
      ? Math.round((waitingTicketsAhead * 45) / openTables)
      : Math.max(queueData.estimatedWaitTime, 5);

    const newTicket: QueueTicket = {
      id: `Q-WEB-${Date.now()}`,
      ticketNo: `B${String(queueData.tickets.length + 1).padStart(2, '0')}`,
      customerName: customerName.trim(),
      pax,
      status: 'Waiting',
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      estimatedWaitMin: calculatedWait,
      queuesAhead: waitingTicketsAhead,
    };

    onAddQueueTicket(newTicket);
    setBookedTicket(newTicket);
    setCustomerName('');
  };

  const handleMemberSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleanSearch = searchPhone.trim().replace(/[-\s]/g, '');
    const found = members.find((m) =>
      m.phone.replace(/[-\s]/g, '').includes(cleanSearch) ||
      m.name.toLowerCase().includes(searchPhone.toLowerCase())
    );
    setSearchedMember(found || null);
    if (found) {
      setActiveMemberId(found.id);
    }
  };

  // Table Service Call & Gas Stove Incident Handler (Robinson 2019 + LINE OA)
  const handleCustomerServiceSubmit = (presetType?: IncidentCategory, customDetail?: string, tableOverride?: string) => {
    const chosenType = presetType || serviceIssueType;
    const chosenTable = tableOverride || selectedTable;
    const chosenDetail = customDetail !== undefined ? customDetail : serviceDetail;
    const calls = serviceRepeatCalls;

    const isFoodSafety =
      chosenType === 'ความปลอดภัยอาหาร' ||
      chosenDetail.toLowerCase().includes('สิ่งแปลกปลอม') ||
      chosenDetail.toLowerCase().includes('เน่า') ||
      chosenDetail.toLowerCase().includes('บูด');

    const isRepeatCall = calls > 2 || chosenType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง';
    const isGasStove = chosenType === 'เตาแก๊ส/แก๊สกระป๋องมีปัญหา' || chosenDetail.includes('แก๊ส');
    const isPan = chosenType === 'ขอเปลี่ยนกระทะ';

    let level: ApologyLevel = 'Level 3';
    let responsible = 'พนักงานบริการ & สโตร์แก๊ส';
    let apologyScript = '';
    let serviceRecovery = '';
    let needN8n = false;
    let couponText = '';
    let couponCode = '';

    if (isFoodSafety) {
      level = 'Level 1';
      responsible = 'ผู้จัดการนุ่น (081-445-5678)';
      apologyScript = `(ผู้จัดการนุ่นเข้าพบลูกค้าทันที): "กราบขออภัยคุณลูกค้า${chosenTable}อย่างสูงยิ่งค่ะ ทางร้านมันนี่หมูกระทะให้ความสำคัญสูงสุดกับความสะอาด ทางเราขอนำจานนี้ไปตรวจสอบทันที พร้อมเปลี่ยนชุดอาหารใหม่ให้ทั้งโต๊ะ และขอดูแลบิลนี้ให้คุณลูกค้าฟรีเป็นกรณีพิเศษค่ะ"`;
      serviceRecovery = 'ยกเว้นค่าอาหารทั้งโต๊ะทันที + มอบบัตรรับประทานฟรี 149.- มื้อถัดไป + ตรวจสอบครัว';
      needN8n = true;
      couponText = 'บัตรรับประทานบุฟเฟต์ฟรี 1 ท่าน (149.-)';
      couponCode = `MMK-FREE-VIP${Math.floor(100 + Math.random() * 900)}`;
    } else if (isRepeatCall) {
      level = 'Level 2';
      responsible = 'หัวหน้ากะบอย (089-998-8123)';
      apologyScript = `(หัวหน้ากะเข้าพบลูกค้าที่ ${chosenTable}): "ขออภัยคุณลูกค้า${chosenTable}เป็นอย่างยิ่งเลยนะคะ/ครับที่ทำให้ต้องรอนานและเรียกซ้ำ ทางร้านกำลังเร่งดูแลให้เดี๋ยวนี้เลยค่ะ ขออนุญาตมอบชีสดิป 1 ถ้วยฟรีมื้อนี้ และคูปองส่วนลดพิเศษ 50 บาทผ่าน LINE OA สำหรับรอบหน้านะคะ"`;
      serviceRecovery = 'ฟรีชีสดิป 1 ถ้วยทันที + ยิงคูปองส่วนลด 50 บาทเข้า LINE OA อัตโนมัติ + หัวหน้ากะบริการประกบ';
      needN8n = true;
      couponText = 'คูปองส่วนลดพิเศษ 50 บาท (รอบถัดไป)';
      couponCode = `MMK-DISC50-${Math.floor(100 + Math.random() * 900)}`;
    } else if (isGasStove) {
      level = 'Level 3';
      responsible = 'พนักงานบริการ & ตรวจระบบเตาแก๊ส';
      apologyScript = `"ขออภัยคุณลูกค้า ${chosenTable} ในความไม่สะดวกด้วยนะคะ พนักงานกำลังนำกระป๋องแก๊สใหม่และตรวจเช็คระบบวาล์วเตาแก๊สให้ทันทีภายใน 1 นาทีนี้ค่ะ"`;
      serviceRecovery = 'เปลี่ยนกระป๋องแก๊ส/เตาแก๊สตัวใหม่ทันที พร้อมตรวจระบบความปลอดภัย มอก.';
      needN8n = true;
      couponText = 'คูปองส่วนลดเครื่องดื่ม 15 บาท ผ่าน LINE OA';
      couponCode = `MMK-GAS15-${Math.floor(100 + Math.random() * 900)}`;
    } else if (isPan) {
      level = 'Level 4';
      responsible = 'พนักงานหน้างาน';
      apologyScript = `"ขออภัยที่ให้รอนะคะ ทางร้านเร่งนำกระทะหมูกระทะใบใหม่และน้ำซุปกระดูกหมูมาเปลี่ยนให้โต๊ะ ${chosenTable} เดี๋ยวนี้เลยค่ะ"`;
      serviceRecovery = 'เปลี่ยนกระทะทองเหลืองใหม่ + เติมน้ำซุปกระดูกหมูร้อนๆ';
    } else {
      level = 'Level 4';
      responsible = 'พนักงานหน้างานกะบ่าย/ดึก';
      apologyScript = `"รับเรื่องเรียบร้อยค่ะ ทางพนักงานกำลังรีบเข้าไปดูแลคุณลูกค้าที่โต๊ะ ${chosenTable} ทันทีนะคะ"`;
      serviceRecovery = 'พนักงานหน้างานเข้าให้บริการที่โต๊ะทันทีด้วยรอยยิ้ม';
    }

    const newInc: Incident = {
      id: `INC-WEB-${Date.now()}`,
      tableId: chosenTable,
      issueType: chosenType,
      severityLevel: level,
      detail:
        chosenDetail.trim() ||
        `ลูกค้ากดแจ้ง${chosenType} ที่ ${chosenTable} (กดเรียกพนักงาน ${calls} ครั้ง)`,
      responsible,
      status: level === 'Level 1' || level === 'Level 2' ? 'Escalated' : 'Pending',
      timestamp:
        new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      repeatCalls: calls,
      n8nDispatched: needN8n,
      lineCouponSent: needN8n,
      apologyScript,
      serviceRecovery,
      n8nPayload: needN8n
        ? {
            table_id: chosenTable,
            issue_type: chosenType,
            severity_level: level,
            timestamp: new Date().toISOString(),
            action_required: `ส่งคูปอง ${couponText} ผ่าน LINE OA ทันที`,
          }
        : null,
    };

    if (onAddIncident) {
      onAddIncident(newInc);
    }

    setLastDispatchedIncident(newInc);

    if (needN8n && couponCode) {
      setActiveCouponVoucher({
        code: couponCode,
        title: couponText,
        discount: isFoodSafety ? 'ทานฟรี 149.-' : isRepeatCall ? 'ลด 50 บาท' : 'ลด 15 บาท',
        table: chosenTable,
        validUntil: 'ใช้งานได้ 30 วันที่สาขาสวนดอก',
      });
    }

    setServiceSubmittedNotice(
      `🔔 ส่งเรื่อง "${chosenType}" ของ ${chosenTable} เข้าสู่ระบบพนักงานเรียบร้อย! (${responsible})`
    );
    setTimeout(() => {
      setServiceSubmittedNotice(null);
    }, 6000);
    setServiceDetail('');
  };

  const handleCopyLineId = () => {
    navigator.clipboard.writeText('@moneymookata');
    setCopiedLineId(true);
    setTimeout(() => setCopiedLineId(false), 2500);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCouponCode(code);
    setTimeout(() => setCopiedCouponCode(null), 2500);
  };

  return (
    <div className="space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-red-100 shadow-md">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
                <img
                  src="/logo.jpg"
                  alt="โลโก้ มันนี่หมูกระทะ"
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                เปิดทุกวัน 16:00 - 23:00 น.
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-xs">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                สาขาสวนดอก เชียงใหม่
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 leading-tight">
                มันนี่หมูกระทะ <br />
                <span className="text-red-600">
                  บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น
                </span>
              </h1>
            </div>

            {/* Price Highlight pill */}
            <div className="inline-flex items-center gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="text-center border-r border-stone-200 pr-4">
                <span className="text-[11px] text-stone-500 block font-medium">ราคาบุฟเฟต์</span>
                <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">149.-</span>
                <span className="text-[10px] text-stone-500 block">ท่าน (อิ่มได้ไม่อั้น)</span>
              </div>
              <div className="text-center border-r border-stone-200 pr-4">
                <span className="text-[11px] text-stone-500 block font-medium">เวลาทาน</span>
                <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">ไม่อั้น</span>
                <span className="text-[10px] text-stone-500 block">ไม่จำกัดเวลา</span>
              </div>
              <div className="pl-1">
                <span className="text-xs text-red-700 font-bold block">🎉 สิทธิพิเศษประจำสาขาสวนดอก</span>
                <span className="text-[11px] text-stone-600">
                  นักศึกษา มช. & บุคลากรแพทย์สวนดอก แสดงบัตรรับฟรีน้ำแข็งถังแรก!
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#member-dashboard"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-white" />
                <span>สะสมแต้ม LINE OA / บัตรสมาชิก</span>
              </a>

              <a
                href="#live-queue"
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <Ticket className="w-4 h-4 text-red-400" />
                <span>จองคิวออนไลน์</span>
              </a>

              <a
                href="#table-service"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>แจ้งปัญหาโต๊ะ/บริการ</span>
              </a>

              <a
                href="#line-oa"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>LINE OA</span>
              </a>

              <a
                href="#cashier-rating"
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>🐷 คะแนนความพึงพอใจ</span>
              </a>

              <a
                href="#food-menu"
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4 text-red-500" />
                <span>เมนูอาหาร & seasonal drop</span>
              </a>

              <a
                href="#park-easy"
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm border border-stone-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Car className="w-4 h-4 text-red-500" />
                <span>🅿️ Park Easy @ Money</span>
              </a>

              <button
                onClick={() =>
                  onOpenAiChat(
                    'น้องมันนี่คะ ขอทราบเมนูบาร์อาหารสดที่ร้าน วิธีเดินทางไปร้านมันนี่หมูกระทะสวนดอก และโปรโมชันล่าสุดหน่อยค่ะ'
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs sm:text-sm border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-red-600" />
                <span>ถามน้องมันนี่ AI</span>
              </button>
            </div>
          </div>

          {/* Right: Live Queue Fast Card + Photography Showcase */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Queue Status Banner */}
            <div
              className={`p-5 rounded-2xl border shadow-sm transition-all ${
                queueData.shouldStopWalkIn
                  ? 'bg-red-50/70 border-red-300'
                  : 'bg-white border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  สถานะคิวสดหน้าร้าน (Live Queue)
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    queueData.shouldStopWalkIn
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {queueData.shouldStopWalkIn ? '🛑 คิวหนาแน่น' : '✅ คิวปกติ'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 text-center">
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">โต๊ะที่กำลังรอ</span>
                  <span className="text-2xl sm:text-3xl font-black text-red-600 font-mono">
                    {queueData.waitingTables} <span className="text-xs font-normal text-stone-500">โต๊ะ</span>
                  </span>
                </div>
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                  <span className="text-[11px] text-stone-500 block">เวลารอโดยประมาณ</span>
                  <span className="text-2xl sm:text-3xl font-black text-stone-900 font-mono">
                    {queueData.estimatedWaitTime} <span className="text-xs font-normal text-stone-500">นาที</span>
                  </span>
                </div>
              </div>

              <div className="text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                {queueData.shouldStopWalkIn ? (
                  <p className="text-red-700 font-medium flex items-start gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    เวลารอเกิน 30 นาที แนะนำกดจองคิวออนไลน์ด้านล่าง หรือจองผ่าน LINE OA ล่วงหน้าค่ะ
                  </p>
                ) : (
                  <p className="text-emerald-700 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    เวลารอไม่เกิน 30 นาที สามารถ Walk-in มาที่ร้านได้ทันทีค่ะ
                  </p>
                )}
              </div>
            </div>

            {/* Live Buffet Bar & Service Status Card (Text-only, No images) */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-600" />
                  เตาแก๊สกระทะร้อน & บาร์อาหารสด 149.-
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  บาร์สดพร้อมเสิร์ฟ
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                เตาแก๊สปรับไฟได้ตามใจ ร้อนไว ไร้ควันแสบตา อิ่มอร่อยไม่อั้น 149.- ไม่จำกัดเวลา เติมของสดใหม่ตลอดเวลา พร้อมน้ำจิ้ม 3 สูตรเด็ด
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-stone-700">
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                  <span className="text-red-600 font-bold">🥩 บาร์หมู & ซีฟู้ด:</span>
                  <span>เติมเต็ม 85%</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✨ seasonal drop:</span>
                  <span>พร้อมเสิร์ฟ 4 เมนู</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOOD MENU & SEASONAL DROP (บอกแค่รายชื่ออาหาร ไม่เอารูปภาพ และบอกสัดส่วนที่เหลือ) */}
      <section id="food-menu" className="space-y-6 scroll-mt-6">
        <div className="border-b border-stone-200 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-red-600" />
                BUFFET FOOD MENU & LIVE PROPORTIONS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                149.- อิ่มไม่อั้น ไม่จำกัดเวลา
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              เมนูอาหาร & seasonal drop
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              รายชื่ออาหารสดทั้งหมดในบาร์ อัปเดตสัดส่วนคงเหลือแบบเรียลไทม์ พร้อมปุ่มกดดูเมนูดรอปพิเศษประจำฤดูกาล
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFoodCategory(foodCategory === 'seasonal' ? 'all' : 'seasonal')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                foodCategory === 'seasonal'
                  ? 'bg-red-600 text-white ring-2 ring-red-400 shadow-md'
                  : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>🔥 ดูเมนู seasonal drop</span>
            </button>
          </div>
        </div>

        {/* Dedicated "seasonal drop" Feature Heading & Spotlight (ขึ้นในฝั่งลูกค้า) */}
        <div className="bg-gradient-to-r from-red-50/80 via-white to-red-50/80 border-2 border-red-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-red-200 shadow-sm shrink-0">
                <img
                  src="/logo.jpg"
                  alt="โลโก้ร้าน มันนี่หมูกระทะ x ชาบู"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <span>seasonal drop</span>
                  <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                    Special Limited Edition
                  </span>
                </h3>
                <p className="text-xs text-stone-600 font-medium">
                  เมนูดรอปพิเศษประจำฤดูกาล คัดสรรวัตถุดิบพรีเมียม เสิร์ฟไม่อั้นรวมในราคา 149.-
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFoodCategory('seasonal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  foodCategory === 'seasonal'
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                }`}
              >
                แสดงเฉพาะ seasonal drop
              </button>
              <button
                onClick={() => setFoodCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  foodCategory === 'all'
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                ดูทั้งหมด ({BUFFET_ITEMS.length})
              </button>
            </div>
          </div>

          {/* Seasonal Drop Preview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {BUFFET_ITEMS.filter((item) => item.isSeasonalDrop).map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-xl border border-red-100 hover:border-red-300 transition-all space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                    seasonal drop
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      item.stockRemainingPercent >= 50
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    เหลือ {item.stockRemainingPercent}%
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-stone-900 text-sm leading-snug">{item.name}</h4>
                  <span className="text-[10px] text-stone-500 font-mono block">{item.enName}</span>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                  {item.desc}
                </p>

                {item.seasonalNote && (
                  <div className="text-[10px] text-red-700 italic bg-red-50 p-1.5 rounded border border-red-200">
                    ✨ {item.seasonalNote}
                  </div>
                )}

                {/* Remaining Stock Proportion Progress Bar */}
                <div className="space-y-1 pt-1 border-t border-stone-100">
                  <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                    <span>สัดส่วนคงเหลือในบาร์:</span>
                    <strong className="text-stone-900">{item.stockRemainingPercent}%</strong>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.stockRemainingPercent >= 60
                          ? 'bg-emerald-500'
                          : item.stockRemainingPercent >= 30
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.stockRemainingPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {[
            { id: 'all', label: 'ทั้งหมด', count: BUFFET_ITEMS.length },
            { id: 'seasonal', label: '🔥 seasonal drop', count: BUFFET_ITEMS.filter((i) => i.isSeasonalDrop).length },
            { id: 'pork', label: 'หมู & เนื้อสไลด์', count: BUFFET_ITEMS.filter((i) => i.category === 'pork').length },
            { id: 'seafood', label: 'ซีฟู้ด & ชีส', count: BUFFET_ITEMS.filter((i) => i.category === 'seafood').length },
            { id: 'veggie', label: 'ผักสด & เส้น', count: BUFFET_ITEMS.filter((i) => i.category === 'veggie').length },
            { id: 'sauce', label: 'น้ำจิ้ม 3 สูตร', count: BUFFET_ITEMS.filter((i) => i.category === 'sauce').length },
            { id: 'dessert', label: 'ของหวาน & ผลไม้', count: BUFFET_ITEMS.filter((i) => i.category === 'dessert').length },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFoodCategory(cat.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                foodCategory === cat.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Food List - Text only, NO IMAGES, showing remaining proportion */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUFFET_ITEMS.filter((item) => {
            if (foodCategory === 'seasonal') return item.isSeasonalDrop;
            if (foodCategory !== 'all') return item.category === foodCategory;
            return true;
          }).map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                item.isSeasonalDrop
                  ? 'bg-white border-red-200 hover:border-red-400 shadow-sm'
                  : 'bg-white border-stone-200 hover:border-red-300 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {item.isSeasonalDrop ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        ✨ seasonal drop
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                        {item.station}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-500 font-mono">{item.temp}</span>
                  </div>

                  {/* Stock proportion status badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      item.stockRemainingPercent >= 70
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.stockRemainingPercent >= 35
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    สัดส่วนเหลือ {item.stockRemainingPercent}%
                  </span>
                </div>

                {/* Food Name (Thai + English) */}
                <div>
                  <h4 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                    {item.name}
                  </h4>
                  <span className="text-[11px] text-stone-500 font-mono">{item.enName}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.desc}
                </p>

                {/* Dipping and Cook tip */}
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-[11px] space-y-1">
                  <div className="text-stone-700">
                    <span className="text-red-600 font-bold">💡 เคล็ดลับการทาน:</span> {item.cookTip}
                  </div>
                  <div className="text-stone-600">
                    <span className="text-emerald-700 font-bold">🥣 น้ำจิ้มแนะนำ:</span> {item.dip}
                  </div>
                </div>
              </div>

              {/* Remaining Proportion Visualizer */}
              <div className="pt-2 border-t border-stone-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">สัดส่วนคงเหลือในบาร์:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.stockRemainingPercent >= 60
                          ? 'bg-emerald-500 animate-pulse'
                          : item.stockRemainingPercent >= 30
                          ? 'bg-amber-500'
                          : 'bg-rose-500 animate-ping'
                      }`}
                    />
                    <strong className="font-mono text-stone-900">
                      {item.stockRemainingPercent}%{' '}
                      <span className="text-[10px] font-normal text-stone-500">
                        {item.stockRemainingPercent >= 70
                          ? '(เต็มบาร์พร้อมตัก)'
                          : item.stockRemainingPercent >= 35
                          ? '(พร้อมเสิร์ฟ)'
                          : '(เริ่มพร่อง-กำลังเติม)'}
                      </span>
                    </strong>
                  </div>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      item.stockRemainingPercent >= 60
                        ? 'bg-emerald-500'
                        : item.stockRemainingPercent >= 30
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.stockRemainingPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. LIVE QUEUE & ONLINE RESERVATION SECTION */}
      <section id="live-queue" className="space-y-6 scroll-mt-6">
        <div className="border-b border-red-200 pb-4">
          <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-red-600" />
            Queue & Booking
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            ระบบจองคิวออนไลน์ & ตรวจเช็คเวลารอสด
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            ระบบคำนวณเวลารอแบบเรียลไทม์มาตรฐานร้าน 45 นาที/รอบ สะดวก ไม่ต้องยืนรอนานหน้าร้าน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Live Wait Time Math & Rules */}
          <div className="lg:col-span-5 bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-200">
              <Clock className="w-4 h-4 text-red-600" />
              สถานะคิวขณะนี้ (Real-Time Queue)
            </h3>

            <div className="bg-red-50/60 rounded-2xl p-5 border border-red-200 text-center space-y-2">
              <span className="text-xs text-stone-600 font-medium">เวลารอเฉลี่ยประมาณ</span>
              <div className="text-4xl sm:text-5xl font-black text-red-600 font-mono">
                {queueData.estimatedWaitTime} <span className="text-base font-normal text-stone-600">นาที</span>
              </div>
              <div className="flex justify-center items-center gap-4 text-xs text-stone-700 pt-1 border-t border-red-200/60">
                <span>รอเรียก: <strong className="text-stone-900 font-mono">{queueData.waitingTables} โต๊ะ</strong></span>
                <span>•</span>
                <span>รอบปล่อย: <strong className="text-stone-900 font-mono">{queueData.openTablesPerRound} โต๊ะ</strong></span>
              </div>
            </div>

            {/* Formula Transparency Callout */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-mono text-red-700 font-bold text-[11px] block">
                สูตรคำนวณเวลารอของร้าน:
              </span>
              <p className="text-[11px] text-stone-600 font-mono">
                = [จำนวนโต๊ะที่รอ ({queueData.waitingTables}) × 45 นาที] ÷ จำนวนโต๊ะที่ว่างต่อรอบ ({queueData.openTablesPerRound})
              </p>
            </div>

            {/* Walk-in Alert Indicator */}
            {queueData.shouldStopWalkIn ? (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs text-red-800 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-red-700">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  หน้าร้านมีลูกค้ารอเกิน 30 นาที
                </span>
                <p className="text-stone-700">
                  แนะนำให้ลงทะเบียนรับคิวผ่านฟอร์มด้านข้าง หรือสแกน LINE OA ทางร้านจะโทรแจ้งเมื่อใกล้ถึงคิวค่ะ
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800">
                <span className="font-bold flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  สามารถ Walk-in เข้าทานได้ทันที
                </span>
                <p className="text-stone-700 mt-0.5">
                  เวลารอไม่เกิน 30 นาที สามารถเดินทางมารับโต๊ะหน้าร้านได้เลยค่ะ
                </p>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                onClick={onOpenStaffPortal}
                className="text-xs text-stone-600 hover:text-red-600 underline transition-colors cursor-pointer"
              >
                เข้าสู่ระบบแดชบอร์ดพนักงานเพื่อจัดคิวหน้าร้าน (Staff Ops) →
              </button>
            </div>
          </div>

          {/* Right: Booking Form & Issued Ticket */}
          <div className="lg:col-span-7 bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-200">
              <Ticket className="w-4 h-4 text-red-600" />
              จองคิวหน้าร้าน
            </h3>

            {bookedTicket ? (
              <div className="bg-gradient-to-br from-red-50 via-white to-red-50/60 border-2 border-red-300 rounded-3xl p-6 text-center space-y-4 shadow-md animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-stone-600 font-bold block">
                    บัตรคิวของคุณ (คุณ {bookedTicket.customerName})
                  </span>
                  {/* 1. คิว */}
                  <div className="text-5xl sm:text-6xl font-black text-red-600 font-mono tracking-wider">
                    {bookedTicket.ticketNo}
                  </div>
                </div>

                {/* 2. คิวก่อนหน้าที่เหลือ, 3. ประมาณเวลาที่ต้องรอ, 4. จำนวนคนในโต๊ะ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-red-100">
                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-[11px] text-stone-500 block font-medium">
                      คิวก่อนหน้าที่เหลือ
                    </span>
                    <span className="text-2xl font-black text-stone-900 font-mono mt-1 block">
                      {bookedTicket.queuesAhead ?? Math.max(queueData.waitingTables, 0)}{' '}
                      <span className="text-xs font-normal text-stone-500">คิว</span>
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-[11px] text-stone-500 block font-medium">
                      ประมาณเวลาที่ต้องรอ
                    </span>
                    <span className="text-2xl font-black text-red-600 font-mono mt-1 block">
                      ~{bookedTicket.estimatedWaitMin}{' '}
                      <span className="text-xs font-normal text-stone-500">นาที</span>
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs">
                    <span className="text-[11px] text-stone-500 block font-medium">
                      จำนวนคนในโต๊ะ
                    </span>
                    <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">
                      {bookedTicket.pax}{' '}
                      <span className="text-xs font-normal text-stone-500">คน</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setBookedTicket(null)}
                    className="text-xs text-stone-600 hover:text-red-600 underline cursor-pointer"
                  >
                    กดจองคิวใหม่อีกใบ
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-stone-700 mb-1.5 font-bold">
                    ใส่ชื่อ:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ใส่ชื่อของคุณ..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:border-red-600 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-700 mb-1.5 font-bold">
                    เลือกจำนวนคน:
                  </label>
                  <select
                    value={pax}
                    onChange={(e) => setPax(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm text-stone-900 focus:bg-white focus:border-red-600 outline-none font-bold transition-colors"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20].map((n) => (
                      <option key={n} value={n} className="bg-white text-stone-900">
                        {n} คน
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 mt-2"
                >
                  <Ticket className="w-5 h-5" />
                  <span>กดจองคิว</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3.5. PARK EASY @ MONEY (ระบบนำทางที่จอดรถอัจฉริยะแบบเรียลไทม์) */}
      <section id="park-easy" className="space-y-6 scroll-mt-6">
        {/* Section Header */}
        <div className="border-b border-red-200 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Car className="w-4 h-4 text-red-600" />
                PARK EASY @ MONEY • LIVE PARKING GUIDANCE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                รู้พิกัดล่วงหน้า ไม่ต้องขับรถวน
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              ระบบ “Park Easy @ Money”
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              แสดงทางเข้า-ออก, บริเวณจอดรถที่ว่างอยู่ และระบุตำแหน่งพื้นที่จอดรถของลูกค้าแบบเรียลไทม์ ทำให้รู้ล่วงหน้าว่าควรเข้าทางไหนและขับไปจอดตรงช่องว่างได้ทันที
            </p>
          </div>

          {/* Quick Sensor Simulator Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Toggle a random slot status to demonstrate real-time sensing
                setParkingSlots((prev) => {
                  const copy = [...prev];
                  const randomIdx = Math.floor(Math.random() * copy.length);
                  copy[randomIdx] = {
                    ...copy[randomIdx],
                    status: copy[randomIdx].status === 'available' ? 'occupied' : 'available',
                  };
                  return copy;
                });
                setSmartRouteNotice('🔄 อัปเดตข้อมูลเซนเซอร์ช่องจอดเรียลไทม์สำเร็จ');
                setTimeout(() => setSmartRouteNotice(null), 3000);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>เซนเซอร์อัปเดตเรียลไทม์</span>
            </button>
          </div>
        </div>

        {/* Real-Time Smart Guidance Navigator Bar */}
        {(() => {
          const carSlots = parkingSlots.filter((s) => s.type === 'car');
          const motoSlots = parkingSlots.filter((s) => s.type === 'motorcycle');
          const availCars = carSlots.filter((s) => s.status === 'available').length;
          const availMotos = motoSlots.filter((s) => s.status === 'available').length;

          // Find best slot based on vehicle
          const bestCar = carSlots.find((s) => s.status === 'available') || carSlots[0];
          const bestMoto = motoSlots.find((s) => s.status === 'available') || motoSlots[0];
          const bestTarget = selectedVehicleType === 'car' ? bestCar : bestMoto;
          const mySlotObj = parkingSlots.find((s) => s.id === myParkedSlotId);

          return (
            <div className="space-y-6">
              {/* Top Smart Recommendation Banner */}
              <div className="bg-gradient-to-r from-red-50/80 via-white to-red-50/80 border-2 border-red-200 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                        SMART ROUTE RECOMMENDATION
                      </span>
                      <span className="text-xs text-stone-600 font-medium">
                        เลือกประเภทยานพาหนะของคุณเพื่อรับคำแนะนำทันที:
                      </span>
                    </div>

                    {/* Vehicle Type Picker */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedVehicleType('car')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          selectedVehicleType === 'car'
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Car className="w-4 h-4" />
                        <span>🚗 รถยนต์ (ว่าง {availCars}/{carSlots.length} คัน)</span>
                      </button>

                      <button
                        onClick={() => setSelectedVehicleType('motorcycle')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          selectedVehicleType === 'motorcycle'
                            ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black'
                            : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <Navigation className="w-4 h-4" />
                        <span>🛵 มอเตอร์ไซค์ (ว่าง {availMotos}/{motoSlots.length} คัน)</span>
                      </button>
                    </div>

                    {/* Dynamic Real-Time Route Guidance */}
                    <div className="bg-white p-4 rounded-2xl border border-red-100 shadow-xs space-y-2">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <Navigation className="w-4 h-4 text-red-600" />
                        <span>เส้นทางที่ระบบแนะนำล่วงหน้า (ไม่ต้องขับรถวน):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-stone-500 text-[10px] block font-mono">1. ทางเข้าที่ควรใช้:</span>
                          <strong className="text-stone-900 text-sm block mt-0.5">
                            {bestTarget?.recommendedGate || 'ทางเข้า 1 (ถ.สุเทพ)'}
                          </strong>
                          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
                            ✓ การจราจรโล่ง เลี้ยวเข้าได้ทันที
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-stone-500 text-[10px] block font-mono">2. ช่องจอดว่างเป้าหมาย:</span>
                          <strong className="text-red-700 text-sm block mt-0.5 font-mono">
                            {bestTarget?.zone} - ช่อง {bestTarget?.id}
                          </strong>
                          <span className="text-[11px] text-stone-600 mt-1 block">
                            🚶 ห่างประตูร้านเพียง {bestTarget?.distanceMeters} เมตร (เดิน ~20 วินาที)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-600">
                        <span className="text-stone-600">
                          💡 ขับเข้าทางที่ระบุด้านบน แล้วเลี้ยวเข้าช่อง <strong className="text-red-700 font-mono">{bestTarget?.id}</strong> ได้ทันที ไม่ต้องขับวนหาที่จอด!
                        </span>
                        {bestTarget && (
                          <button
                            onClick={() => {
                              setMyParkedSlotId(bestTarget.id);
                              setSmartRouteNotice(`📍 ปักหมุดระบุตำแหน่งจอดของคุณที่ช่อง ${bestTarget.id} เรียบร้อย`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold transition-all cursor-pointer shadow-xs"
                          >
                            ปักหมุดจอดที่ช่อง {bestTarget.id}
                          </button>
                        )}
                      </div>
                    </div>

                    {smartRouteNotice && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{smartRouteNotice}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Real-time Customer Spot Detection Box */}
                  <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-red-100 shadow-xs space-y-4 text-center">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">
                      CUSTOMER REAL-TIME PARKING STATUS
                    </span>

                    {mySlotObj ? (
                      <div className="space-y-2">
                        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 border-2 border-red-300 mx-auto flex items-center justify-center text-2xl shadow-sm animate-pulse">
                          🚗
                        </div>
                        <div>
                          <span className="text-xs text-stone-500 block">ตำแหน่งที่คุณจอดอยู่ขณะนี้:</span>
                          <h4 className="text-xl font-black text-red-700 font-mono">
                            ช่อง {mySlotObj.id} ({mySlotObj.zone.split(' ')[0]})
                          </h4>
                          <span className="text-xs text-stone-600 block mt-1">
                            ห่างร้าน {mySlotObj.distanceMeters} เมตร • เดินสะดวก
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-700">
                          🧭 เข้าทาง: <strong>{mySlotObj.recommendedGate}</strong>
                        </div>
                        <button
                          onClick={() => {
                            setMyParkedSlotId(null);
                            setSmartRouteNotice('ยกเลิกการปักหมุดตำแหน่งจอดแล้ว');
                          }}
                          className="text-xs text-stone-500 hover:text-red-600 underline transition-colors cursor-pointer"
                        >
                          เปลี่ยนจุดจอด / ล้างพิกัด
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <div className="w-14 h-14 rounded-2xl bg-stone-50 border border-stone-200 text-stone-400 mx-auto flex items-center justify-center">
                          <Car className="w-6 h-6" />
                        </div>
                        <span className="text-xs text-stone-500 block">ยังไม่ได้ระบุตำแหน่งจอด</span>
                        <p className="text-[11px] text-stone-500">
                          แตะที่ช่องจอดว่างในแผนที่ด้านล่าง เพื่อปักหมุดตำแหน่งรถของคุณแบบเรียลไทม์
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Cards: ENTRANCES & EXITS (แสดงทางเข้า-ออก ชัดเจน) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gate 1 */}
                <div className="bg-white border border-red-100 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      ทางเข้า 1
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      คล่องตัว
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">ถ.สุเทพ (ประตูหน้า)</h4>
                    <span className="text-[11px] text-stone-500">ฝั่ง รพ.มหาราช / ประตูสวนดอก</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    เลี้ยวเข้าตรงสู่ <strong>Zone A (ติดร้าน 8-20 ม.)</strong> และ <strong>Zone B (ลานในร่ม 25-42 ม.)</strong> สะดวกที่สุดสำหรับรถยนต์
                  </p>
                  <div className="text-[11px] text-red-700 font-mono bg-red-50 p-2 rounded-lg border border-red-100">
                    ➔ มีช่องว่างพร้อมจอด: {parkingSlots.filter(s => s.recommendedGate.includes('สุเทพ') && s.status === 'available').length} ช่อง
                  </div>
                </div>

                {/* Gate 2 */}
                <div className="bg-white border border-red-100 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                      ทางเข้า 2
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      เลี้ยวง่าย
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">ซอยวัดสวนดอก (ประตูด้านข้าง/หลัง)</h4>
                    <span className="text-[11px] text-stone-500">ฝั่งคันคลองชลประทาน</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    เลี้ยวเข้าตรงสู่ <strong>Moto Zone (มอเตอร์ไซค์ 5-12 ม.)</strong> และ <strong>Zone C (ลานหลัก กว้างขวาง 30-52 ม.)</strong>
                  </p>
                  <div className="text-[11px] text-red-700 font-mono bg-red-50 p-2 rounded-lg border border-red-100">
                    ➔ มีช่องว่างพร้อมจอด: {parkingSlots.filter(s => s.recommendedGate.includes('สวนดอก') && s.status === 'available').length} ช่อง
                  </div>
                </div>

                {/* Exit 1 */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      ทางออก 1
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">EXIT A</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">ออกสู่ ถ.สุเทพ</h4>
                    <span className="text-[11px] text-stone-500">ประตูหลักหน้าร้าน</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    เลี้ยวซ้ายมุ่งหน้า โรงพยาบาลมหาราชนครเชียงใหม่ • เลี้ยวขวามุ่งหน้า ตลาดต้นพยอม / สนามบินเชียงใหม่
                  </p>
                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    🛣️ มีสัญญาณไฟเตือนทางออกชัดเจน
                  </div>
                </div>

                {/* Exit 2 */}
                <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                      ทางออก 2
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">EXIT B (ทางลัด)</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-stone-900">ออกสู่ ซอยวัดสวนดอก</h4>
                    <span className="text-[11px] text-stone-500">ประตูหลังร้าน</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    เส้นทางลัดเลี่ยงรถติดชั่วโมงเร่งด่วน ทะลุออกถนนคันคลองชลประทาน มหาวิทยาลัยเชียงใหม่ หรือดอยสุเทพ
                  </p>
                  <div className="text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                    🛣️ ทางลัดรถไม่ติด สะดวกคล่องตัว
                  </div>
                </div>
              </div>

              {/* Real-Time Parking Grid Map (บริเวณจอดรถที่ว่างอยู่ & แตะเพื่อดู/เลือกตำแหน่ง) */}
              <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                  <div>
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      <Compass className="w-5 h-5 text-red-600" />
                      แผนผังช่องจอดรถแบบเรียลไทม์ (Live Parking Slots Map)
                    </h3>
                    <p className="text-xs text-stone-600">
                      แตะที่ช่องสีเขียวเพื่อปักหมุดตำแหน่งจอดของคุณ • ระบบจะบันทึกและแสดงระยะทางเดินเข้าร้านทันที
                    </p>
                  </div>

                  {/* Map Legend */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-500"></span>
                      <span className="text-emerald-700 font-semibold">ว่าง (Available)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-stone-200 border border-stone-300"></span>
                      <span className="text-stone-500">มีรถจอดแล้ว</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-red-600 border border-red-700"></span>
                      <span className="text-red-700 font-bold">จุดจอดของคุณ</span>
                    </div>
                  </div>
                </div>

                {/* 4 Parking Zones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Zone A */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                          Zone A
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">ลานติดร้าน (เดินใกล้สุด 8-20 เมตร)</h4>
                      </div>
                      <span className="text-[10px] text-red-700 font-mono font-bold">
                        ว่าง {parkingSlots.filter(s => s.zone.includes('Zone A') && s.status === 'available').length}/6
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {parkingSlots.filter(s => s.zone.includes('Zone A')).map((slot) => {
                        const isMine = myParkedSlotId === slot.id;
                        const isAvail = slot.status === 'available';

                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isAvail || isMine) {
                                setMyParkedSlotId(isMine ? null : slot.id);
                                setSmartRouteNotice(
                                  isMine
                                    ? `ยกเลิกการเลือกช่อง ${slot.id}`
                                    : `📍 บันทึกว่าคุณจอดที่ช่อง ${slot.id} (Zone A เดินเข้าร้าน ${slot.distanceMeters} ม.)`
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                              isMine
                                ? 'bg-red-600 text-white font-black border-red-700 shadow-md scale-105 ring-2 ring-red-400'
                                : isAvail
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold'
                                : 'bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold block">{slot.id}</span>
                            <span className="text-[9px] block opacity-80">
                              {isMine ? '📍 รถฉัน' : isAvail ? `${slot.distanceMeters}ม.` : 'เต็ม'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zone B */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                          Zone B
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">ลานในร่ม มีหลังคา (เดิน 25-42 เมตร)</h4>
                      </div>
                      <span className="text-[10px] text-red-700 font-mono font-bold">
                        ว่าง {parkingSlots.filter(s => s.zone.includes('Zone B') && s.status === 'available').length}/8
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {parkingSlots.filter(s => s.zone.includes('Zone B')).map((slot) => {
                        const isMine = myParkedSlotId === slot.id;
                        const isAvail = slot.status === 'available';

                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isAvail || isMine) {
                                setMyParkedSlotId(isMine ? null : slot.id);
                                setSmartRouteNotice(
                                  isMine
                                    ? `ยกเลิกการเลือกช่อง ${slot.id}`
                                    : `📍 บันทึกว่าคุณจอดที่ช่อง ${slot.id} (Zone B ในร่ม เดินเข้าร้าน ${slot.distanceMeters} ม.)`
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                              isMine
                                ? 'bg-red-600 text-white font-black border-red-700 shadow-md scale-105 ring-2 ring-red-400'
                                : isAvail
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold'
                                : 'bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold block">{slot.id}</span>
                            <span className="text-[9px] block opacity-80">
                              {isMine ? '📍 รถฉัน' : isAvail ? `${slot.distanceMeters}ม.` : 'เต็ม'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zone C */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                          Zone C
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">ลานหลัก กว้างขวาง จอดง่าย (เดิน 30-52 เมตร)</h4>
                      </div>
                      <span className="text-[10px] text-red-700 font-mono font-bold">
                        ว่าง {parkingSlots.filter(s => s.zone.includes('Zone C') && s.status === 'available').length}/10
                      </span>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                      {parkingSlots.filter(s => s.zone.includes('Zone C')).map((slot) => {
                        const isMine = myParkedSlotId === slot.id;
                        const isAvail = slot.status === 'available';

                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isAvail || isMine) {
                                setMyParkedSlotId(isMine ? null : slot.id);
                                setSmartRouteNotice(
                                  isMine
                                    ? `ยกเลิกการเลือกช่อง ${slot.id}`
                                    : `📍 บันทึกว่าคุณจอดที่ช่อง ${slot.id} (Zone C ลานหลัก เดินเข้าร้าน ${slot.distanceMeters} ม.)`
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                              isMine
                                ? 'bg-red-600 text-white font-black border-red-700 shadow-md scale-105 ring-2 ring-red-400'
                                : isAvail
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold'
                                : 'bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold block">{slot.id}</span>
                            <span className="text-[9px] block opacity-80">
                              {isMine ? '📍 รถฉัน' : isAvail ? `${slot.distanceMeters}ม.` : 'เต็ม'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Moto Zone */}
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-200">
                          Moto Zone
                        </span>
                        <h4 className="text-xs font-bold text-stone-900">ช่องจอดมอเตอร์ไซค์ (ติดประตู 2 เดิน 5-12 เมตร)</h4>
                      </div>
                      <span className="text-[10px] text-red-700 font-mono font-bold">
                        ว่าง {parkingSlots.filter(s => s.type === 'motorcycle' && s.status === 'available').length}/8
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                      {parkingSlots.filter(s => s.type === 'motorcycle').map((slot) => {
                        const isMine = myParkedSlotId === slot.id;
                        const isAvail = slot.status === 'available';

                        return (
                          <button
                            key={slot.id}
                            onClick={() => {
                              if (isAvail || isMine) {
                                setMyParkedSlotId(isMine ? null : slot.id);
                                setSmartRouteNotice(
                                  isMine
                                    ? `ยกเลิกการเลือกช่อง ${slot.id}`
                                    : `📍 บันทึกว่าคุณจอดมอเตอร์ไซค์ที่ช่อง ${slot.id} (เดินเข้าร้าน ${slot.distanceMeters} ม.)`
                                );
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                              isMine
                                ? 'bg-red-600 text-white font-black border-red-700 shadow-md scale-105 ring-2 ring-red-400'
                                : isAvail
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 font-bold'
                                : 'bg-stone-200/80 text-stone-400 border-stone-300 cursor-not-allowed'
                            }`}
                          >
                            <span className="font-mono text-xs font-bold block">{slot.id}</span>
                            <span className="text-[9px] block opacity-80">
                              {isMine ? '📍 รถฉัน' : isAvail ? `${slot.distanceMeters}ม.` : 'เต็ม'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* 4. TABLE SERVICE CALL & GAS STOVE INCIDENT REPORTING SYSTEM */}
      <section id="table-service" className="space-y-6 scroll-mt-6">
        <div className="border-b border-red-200 pb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Table Service & Incident Report Desk • บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 flex items-center gap-2">
              ระบบแจ้งปัญหาพนักงาน & บริการประจำโต๊ะ
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                ส่งตรงถึงหัวหน้ากะ & ผู้จัดการทันที
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              แจ้งปัญหาประจำโต๊ะ เรียกพนักงาน เปลี่ยนกระป๋องแก๊ส หรือขอกระทะใหม่ได้ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl text-red-700 font-medium flex items-center gap-1.5 shadow-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>ระบบ Real-Time เปิดรับแจ้งเตือนอยู่</span>
            </span>
          </div>
        </div>

        {/* Success or Active Notice Toast */}
        {serviceSubmittedNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-red-500 text-stone-900 shadow-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-red-700 block">แจ้งพนักงานสำเร็จแล้ว!</span>
                <p className="text-xs text-stone-700">{serviceSubmittedNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setServiceSubmittedNotice(null)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg text-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Quick Action Tiles & Custom Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick 1-Tap Preset Tiles */}
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  กดเรียกพนักงานด่วน 1-Tap (เลือกปัญหาประจำโต๊ะ {selectedTable})
                </h3>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-stone-600">โต๊ะ:</span>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="bg-stone-50 border border-stone-300 text-red-700 font-bold px-2 py-1 rounded-lg text-xs outline-none focus:border-red-600"
                  >
                    {Array.from({ length: 28 }, (_, i) => `โต๊ะ ${String(i + 1).padStart(2, '0')}`).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 6 Quick Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleCustomerServiceSubmit(
                      'เตาแก๊ส/แก๊สกระป๋องมีปัญหา',
                      `เตาแก๊สไฟเบาหรือกระป๋องแก๊สหมดที่ ${selectedTable} ขอเปลี่ยนกระป๋องแก๊สใหม่ด่วน`
                    )
                  }
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:scale-110 transition-transform shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    🧯 แก๊สหมด
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCustomerServiceSubmit(
                      'ขอเปลี่ยนกระทะ',
                      `กระทะหมูกระทะที่ ${selectedTable} เริ่มไหม้ ขอกระทะทองเหลืองใบใหม่และเติมน้ำซุป`
                    )
                  }
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform shrink-0">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    🍳 เปลี่ยนกระทะ
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCustomerServiceSubmit(
                      'อุปกรณ์ชำรุด',
                      `ขอเติมน้ำซุปกระดูกหมู และขอน้ำจิ้มสุกี้/ซีฟู้ดเพิ่มที่ ${selectedTable}`
                    )
                  }
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    🥣 เติมน้ำซุป / น้ำจิ้ม
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setServiceRepeatCalls(3);
                    handleCustomerServiceSubmit(
                      'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
                      `ลูกค้าที่ ${selectedTable} กดเรียกหรือตามพนักงานแล้วยังไม่ได้รับการบริการ`
                    );
                  }}
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-red-100 text-red-600 group-hover:scale-110 transition-transform shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    🔔 เรียกพนักงาน
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCustomerServiceSubmit(
                      'วัตถุดิบหมด',
                      `วัตถุดิบบาร์สดหมดชั่วคราว เช่น สันคอสไลด์/สามชั้น/กุ้งขาว ที่บาร์อาหารหน้าร้าน`
                    )
                  }
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    🥩 วัตถุดิบบาร์หมด
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCustomerServiceSubmit(
                      'ความปลอดภัยอาหาร',
                      `พบข้อสงสัยเรื่องความสะอาดหรือสิ่งแปลกปลอมในอาหารที่ ${selectedTable}`
                    )
                  }
                  className="p-3.5 rounded-xl bg-stone-50 hover:bg-red-50/70 border border-stone-200 hover:border-red-300 text-left transition-all cursor-pointer group shadow-xs flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-600 group-hover:scale-110 transition-transform shrink-0">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-sm font-bold text-stone-900 group-hover:text-red-700">
                    ⚠️ แจ้งปัญหาอาหาร / ความสะอาด
                  </span>
                </button>
              </div>
            </div>

            {/* Custom Detailed Form */}
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-200">
                <MessageSquare className="w-4 h-4 text-red-600" />
                หรือ พิมพ์ระบุรายละเอียดปัญหาเพิ่มเติม
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCustomerServiceSubmit();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-stone-700 mb-1 font-medium">หมายเลขโต๊ะของคุณ:</label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-red-700 font-bold focus:bg-white focus:border-red-600 outline-none"
                    >
                      {Array.from({ length: 28 }, (_, i) => `โต๊ะ ${String(i + 1).padStart(2, '0')}`).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-700 mb-1 font-medium">ประเภทปัญหา:</label>
                    <select
                      value={serviceIssueType}
                      onChange={(e) => setServiceIssueType(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:border-red-600 outline-none"
                    >
                      <option value="เตาแก๊ส/แก๊สกระป๋องมีปัญหา">🧯 แก๊สหมด / เตาแก๊สมีปัญหา</option>
                      <option value="ขอเปลี่ยนกระทะ">🍳 ขอกระทะใหม่</option>
                      <option value="ลูกค้าเรียกซ้ำเกิน 2 ครั้ง">🔔 เรียกพนักงาน</option>
                      <option value="วัตถุดิบหมด">🥩 วัตถุดิบบาร์อาหารหมด</option>
                      <option value="ความปลอดภัยอาหาร">⚠️ แจ้งปัญหาอาหาร / ความสะอาด</option>
                      <option value="อุปกรณ์ชำรุด">🛠️ อุปกรณ์ชำรุด (พัดลม/โคมไฟ/เก้าอี้)</option>
                      <option value="อื่นๆ">อื่นๆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-700 mb-1 font-medium">กดเรียกพนักงานกี่ครั้งแล้ว:</label>
                    <select
                      value={serviceRepeatCalls}
                      onChange={(e) => setServiceRepeatCalls(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:border-red-600 outline-none"
                    >
                      <option value={1}>1 ครั้ง</option>
                      <option value={2}>2 ครั้ง</option>
                      <option value={3}>3 ครั้งขึ้นไป (ด่วน)</option>
                      <option value={4}>4 ครั้ง (ฉุกเฉิน)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-700 mb-1 font-medium">
                    ข้อความหรือคำขอเพิ่มเติม (พิมพ์ได้ตามต้องการ):
                  </label>
                  <textarea
                    rows={2}
                    value={serviceDetail}
                    onChange={(e) => setServiceDetail(e.target.value)}
                    placeholder="เช่น เตาแก๊สดับ ขอเปลี่ยนกระป๋องแก๊สใหม่ หรือขอน้ำจิ้มซีฟู้ดเพิ่ม 2 ถ้วย..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-red-600 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-stone-500">
                    ⚡ สัญญาณแจ้งเตือนจะส่งไปที่ห้องควบคุมพนักงานและหน้าจอแดชบอร์ดทันที
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งแจ้งเตือนพนักงาน</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Resolution Status & LINE OA Coupon Voucher Showcase */}
          <div className="lg:col-span-5 space-y-4">
            {/* Active Case or Latest Incident Feedback */}
            {lastDispatchedIncident ? (
              <div className="bg-white border-2 border-red-300 rounded-2xl p-5 shadow-sm space-y-3.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    สถานะการรับแจ้ง: {lastDispatchedIncident.tableId}
                  </span>
                  <span className="text-[10px] font-mono bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {lastDispatchedIncident.severityLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-stone-500 block font-medium">เรื่องที่แจ้ง:</span>
                  <p className="text-xs text-stone-900 font-semibold">{lastDispatchedIncident.detail}</p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-stone-900 font-bold">
                    <span>ผู้รับผิดชอบดูแล:</span>
                    <span className="text-emerald-700">{lastDispatchedIncident.responsible}</span>
                  </div>
                  <div className="text-[11px] text-stone-600">
                    <span className="text-stone-500 block">แนวทางเยียวยา (Service Recovery):</span>
                    {lastDispatchedIncident.serviceRecovery}
                  </div>
                </div>

                {/* Apology Script Quote */}
                {lastDispatchedIncident.apologyScript && (
                  <div className="p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs italic text-stone-700">
                    <span className="font-bold text-red-700 not-italic block mb-0.5 text-[11px]">
                      คำขอโทษลูกค้าตามมาตรฐาน Robinson 2019:
                    </span>
                    {lastDispatchedIncident.apologyScript}
                  </div>
                )}

                {/* Voucher Card if generated */}
                {activeCouponVoucher && (
                  <div className="bg-gradient-to-r from-red-50 via-white to-red-50 border-2 border-red-300 rounded-2xl p-4 shadow-sm space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-red-600" />
                        คูปองส่วนลดชดเชยผ่าน LINE OA
                      </span>
                      <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                        DISPATCHED
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-xs text-stone-500 block">รหัสคูปอง LINE OA ของคุณ:</span>
                        <span className="text-base font-black font-mono text-red-600 tracking-wider">
                          {activeCouponVoucher.code}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(activeCouponVoucher.code)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        {copiedCouponCode === activeCouponVoucher.code ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>คัดลอกรหัส</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-stone-600">
                      🎁 <strong>สิทธิประโยชน์:</strong> {activeCouponVoucher.title} ({activeCouponVoucher.discount}) นำรหัสนี้แจ้งที่ LINE OA <strong>@moneymookata</strong> หรือแสดงต่อพนักงานตอนเช็คบิลได้เลยค่ะ
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-200">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">มาตรฐานการบริการ & ความปลอดภัยเตาแก๊ส</h4>
                    <p className="text-[11px] text-stone-500">Suan Dok Safety First & Robinson 2019 Protocol</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                    <Flame className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">เตาแก๊สระบบตัดอัตโนมัติ (Safety Governor)</span>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        ผ่านการตรวจสอบระบบวาล์วนิรภัยทุกวัน หากแก๊สหมดแจ้งพนักงานเปลี่ยนกระป๋องใหม่ได้ทันทีฟรี!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">เกณฑ์ขอโทษ Robinson 2019 (Apology Protocol)</span>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        หากลูกค้ารอนานเกิน 5 นาที หรือกดเรียกซ้ำเกิน 2 ครั้ง ระบบจะยกระดับเป็น Level 2 มอบชีสดิปฟรี 1 ถ้วย และส่งคูปองเข้า LINE OA ทันที
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-2.5">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 block">รับคูปองเยียวยาผ่าน LINE OA ทันที</span>
                      <p className="text-stone-600 text-[11px] mt-0.5">
                        สแกนเพิ่มเพื่อน LINE OA <strong>@moneymookata</strong> เพื่อรับคูปองส่วนลดและสิทธิพิเศษประจำโต๊ะ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <a
                    href="#line-oa"
                    className="text-xs text-red-600 hover:text-red-700 underline font-medium"
                  >
                    ดูข้อมูลและเพิ่มเพื่อน LINE OA มันนี่หมูกระทะ →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. LINE OFFICIAL ACCOUNT (@moneymookata) HUB */}
      <section id="line-oa" className="space-y-6 scroll-mt-6">
        <div className="border-b border-stone-200 pb-4">
          <span className="text-xs text-emerald-700 font-bold tracking-widest uppercase flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            LINE Official Account • @moneymookata
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 flex items-center gap-2">
            ข้อมูล LINE OA มันนี่หมูกระทะ สวนดอก
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Account
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            ศูนย์รวมสิทธิพิเศษสำหรับลูกค้า: รับคูปองเยียวยาบริการ Robinson 2019, เช็คสถานะคิวสด, สะสมแต้ม E-Member และคุยกับผู้จัดการร้าน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: LINE OA Card & QR Code Simulation */}
          <div className="lg:col-span-5 bg-white border-2 border-emerald-500/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-lg font-black text-stone-900">มันนี่หมูกระทะ สวนดอก</h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                      OFFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">@moneymookata (มี @ ด้วยนะคะ)</p>
                  <span className="text-[11px] text-emerald-600 font-medium">👥 5,420+ เพื่อนในเชียงใหม่</span>
                </div>
              </div>

              {/* QR Code Mockup Graphic */}
              <div className="bg-white p-4 rounded-2xl text-center space-y-2 shadow-inner max-w-[220px] mx-auto border-4 border-stone-200">
                <div className="w-full aspect-square bg-white flex flex-col items-center justify-center relative p-1">
                  {/* Stylized high fidelity QR layout */}
                  <div className="w-full h-full border-2 border-stone-900 p-1.5 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-4 border-stone-900 flex items-center justify-center">
                        <div className="w-4 h-4 bg-stone-900"></div>
                      </div>
                      <div className="w-10 h-10 border-4 border-stone-900 flex items-center justify-center">
                        <div className="w-4 h-4 bg-stone-900"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center my-auto">
                      <div className="p-1 rounded bg-emerald-500 text-white font-black text-[9px] shadow">
                        LINE
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="w-10 h-10 border-4 border-stone-900 flex items-center justify-center">
                        <div className="w-4 h-4 bg-stone-900"></div>
                      </div>
                      <div className="w-6 h-6 border-2 border-stone-900 grid grid-cols-2 gap-0.5 p-0.5">
                        <div className="bg-stone-900"></div>
                        <div className="bg-stone-900"></div>
                        <div className="bg-stone-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-stone-600 font-bold block">
                  สแกนผ่านแอป LINE เพื่อเพิ่มเพื่อน
                </span>
              </div>

              {/* Line ID Copy Box */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-stone-500 block font-medium">LINE ID อย่างเป็นทางการ:</span>
                  <span className="text-sm font-mono font-black text-emerald-600">@moneymookata</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLineId}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-200 transition-colors shadow-sm"
                >
                  {copiedLineId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">คัดลอกแล้ว!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>คัดลอก ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Open LINE button */}
            <a
              href="https://line.me/R/ti/p/@moneymookata"
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>เปิด LINE และเพิ่มเพื่อนทันที (@moneymookata)</span>
            </a>
          </div>

          {/* Right Column: 4 Services and Privilege Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-stone-200 hover:border-red-300 rounded-2xl p-5 shadow-sm space-y-2.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">1. รับคูปองเยียวยาบริการอัตโนมัติ</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                ตามเกณฑ์ <strong>Robinson 2019</strong> หากคุณลูกค้ารอนานเกินเกณฑ์ หรือกดเรียกพนักงานซ้ำเกิน 2 ครั้ง ระบบจะยิงคูปองส่วนลด 50 บาท หรือฟรีชีสดิป 1 ถ้วยเข้า LINE OA อัตโนมัติทันที
              </p>
              <span className="text-[11px] text-red-600 block font-medium">⚡ คูปองไม่มีวันหมดอายุ ใช้ได้ที่สาขาสวนดอก</span>
            </div>

            <div className="bg-white border border-stone-200 hover:border-emerald-300 rounded-2xl p-5 shadow-sm space-y-2.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Ticket className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">2. ระบบแจ้งเตือนคิวอัจฉริยะ</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                ไม่ต้องยืนรอนานหน้าร้าน! รับแจ้งเตือนผ่าน LINE OA เมื่อเหลืออีก 2 คิว สามารถเดินเล่นสวนดอก คณะแพทย์ มช. หรือถนนสุเทพได้อย่างสบายใจ
              </p>
              <span className="text-[11px] text-emerald-600 block font-medium">🔔 แจ้งเตือนพร้อมโทรแจ้งก่อนโต๊ะพร้อม</span>
            </div>

            <div className="bg-white border border-stone-200 hover:border-red-300 rounded-2xl p-5 shadow-sm space-y-2.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-red-600" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">3. บัตรสมาชิกสะสมแต้ม E-Member</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                บุฟเฟต์ 1 หัว = 1 คะแนนสะสม (พนักงานบันทึกให้อัตโนมัติหน้าร้าน) • 20 แต้ม แลกหมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี) • 35 แต้ม ได้ส่วนลด 15% บิลถัดไป • 50 แต้ม กินบุฟเฟต์ฟรี 1 ท่าน
              </p>
              <span className="text-[11px] text-red-600 block font-medium">👑 สิทธิพิเศษนักศึกษา มช. และแพทย์สวนดอก</span>
            </div>

            <div className="bg-white border border-stone-200 hover:border-sky-300 rounded-2xl p-5 shadow-sm space-y-2.5 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5 text-sky-600" />
              </div>
              <h4 className="text-sm font-bold text-stone-900">4. ติดต่อผู้จัดการ & น้องมันนี่ AI</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                สำรองโต๊ะจัดเลี้ยงกลุ่มใหญ่ งานเลี้ยงสายรหัส มช., สั่งเซตวันเกิดล่วงหน้า, สอบถามพิกัดที่จอดรถ หรือแจ้งลืมสิ่งของในร้าน ติดต่อทีมงานได้ตลอดเวลา
              </p>
              <span className="text-[11px] text-sky-600 block font-medium">💬 ตอบกลับไวภายใน 3 นาทีในเวลาทำการ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LINE OA MEMBER ACCUMULATION & WEB DASHBOARD */}
      <section id="member-dashboard" className="space-y-6 scroll-mt-6">
        <div id="member-check" className="border-b border-red-200 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-red-600" />
                LINE OA Member & Loyalty Portal
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 font-bold">
                @moneymookata
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
              แดชบอร์ดสมาชิก & สะสมแต้มผ่าน LINE OA
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              บุฟเฟต์ 1 หัว = 1 คะแนนสะสม (บันทึกอัตโนมัติ) • 20 แต้ม (Tier 1) แลกหมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี) • 35 แต้มได้ส่วนลดบุฟเฟต์ครึ่งราคา • 50 คะแนนกินบุฟเฟต์ฟรี
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ สมัครสมาชิกใหม่ (รับฟรี 10 แต้ม)</span>
            </button>
          </div>
        </div>

        {/* Member Selector Bar & Quick Search */}
        <div className="bg-white border border-red-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs text-stone-700">
              <Search className="w-4 h-4 text-red-600" />
              <span className="font-semibold">เลือกล็อกอินดูแดชบอร์ดสมาชิกของคุณ:</span>
            </div>
            <span className="text-[11px] text-stone-500">
              พบสมาชิกทั้งหมด {members.length} ท่านในระบบ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Quick Demo Member Pills */}
            <div className="md:col-span-8 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone-500 mr-1">คลิกสลับโปรไฟล์:</span>
              {members.map((m) => {
                const isSelected = currentMember.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setActiveMemberId(m.id);
                      setSearchedMember(m);
                      setSearchPhone(m.phone);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white font-bold shadow-sm'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'
                    }`}>
                      {m.points} pts
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="md:col-span-4">
              <form onSubmit={handleMemberSearch} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="ค้นหาเบอร์โทร / ชื่อสมาชิก..."
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:border-red-600 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition-all cursor-pointer"
                >
                  ค้นหา
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ACTIVE MEMBER DASHBOARD CONTAINER */}
        <div className="bg-white border border-red-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
          {/* Member Hero Summary Banner */}
          <div className="bg-gradient-to-r from-red-50/90 via-white to-red-50/90 border border-red-200 rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
                    {currentMember.type.includes('แพทย์') ? (
                      <Stethoscope className="w-5 h-5 text-rose-500" />
                    ) : currentMember.type.includes('นักศึกษา') ? (
                      <GraduationCap className="w-5 h-5 text-sky-500" />
                    ) : (
                      <Award className="w-5 h-5 text-amber-500" />
                    )}
                    <span>{currentMember.name}</span>
                  </span>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-medium">
                    {currentMember.type}
                  </span>

                  {currentMember.lineConnected && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-mono">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      LINE OA: {currentMember.lineId || '@moneymookata'}
                    </span>
                  )}
                </div>

                <div className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
                  <span>เบอร์โทร: <strong className="text-stone-800">{currentMember.phone}</strong></span>
                  <span>•</span>
                  <span>รหัสสมาชิก: <strong className="text-red-700 font-mono">{currentMember.memberCode || currentMember.id}</strong></span>
                  <span>•</span>
                  <span>มาใช้บริการแล้ว: <strong className="text-stone-800">{currentMember.totalVisits} ครั้ง</strong></span>
                </div>
              </div>

              {/* Big Points Badge */}
              <div className="flex items-center gap-4 bg-white border border-red-200 px-5 py-3 rounded-2xl shadow-xs">
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">แต้มสะสมปัจจุบัน</span>
                  <div className="text-3xl sm:text-4xl font-black text-red-600 font-mono flex items-baseline justify-end gap-1">
                    <span>{currentMember.points}</span>
                    <span className="text-xs font-normal text-stone-500">แต้ม</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  <Coins className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Progress Bar to 50 pts free buffet */}
            <div className="mt-5 pt-4 border-t border-red-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-700 font-medium">
                  {currentMember.points >= 50 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ยินดีด้วยค่ะ! คุณสะสมครบ 50 แต้มแล้ว สามารถกดแลกบุฟเฟต์ฟรี 1 ท่านได้ทันที
                    </span>
                  ) : (
                    <span>
                      เป้าหมายแลกบุฟเฟต์ฟรี (50 แต้ม): ขาดอีก{' '}
                      <strong className="text-red-700 font-bold">{50 - currentMember.points} แต้ม</strong>
                      {currentMember.points < 20 && (
                        <span className="text-stone-500 ml-1">
                          (หรืออีกเพียง {20 - currentMember.points} แต้ม รับหมูสไลด์พรีเมียม / ชีสดิปฟรี)
                        </span>
                      )}
                    </span>
                  )}
                </span>
                <span className="font-mono font-bold text-red-700">
                  {Math.min(Math.round((currentMember.points / 50) * 100), 100)}%
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden border border-stone-200">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min((currentMember.points / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* DASHBOARD TABS NAVIGATION */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none">
            <button
              onClick={() => setDashboardTab('card')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                dashboardTab === 'card'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>1. บัตรสมาชิก E-Card</span>
            </button>

            <button
              onClick={() => setDashboardTab('rewards')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                dashboardTab === 'rewards'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>2. แลกรางวัล & E-Coupon ({(currentMember.coupons || []).filter(c => c.status === 'active').length})</span>
            </button>

            <button
              onClick={() => setDashboardTab('history')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                dashboardTab === 'history'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>3. ประวัติแต้ม</span>
            </button>

            <button
              onClick={() => setDashboardTab('simulator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                dashboardTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-stone-50 hover:bg-stone-100 text-emerald-700 border border-emerald-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>4. จำลอง LINE OA Chat & Rich Menu</span>
            </button>
          </div>

          {/* TAB 1: DIGITAL MEMBER CARD (E-CARD) */}
          {dashboardTab === 'card' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left: Graphic Digital VIP Card */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-md bg-gradient-to-br from-red-600 via-stone-900 to-stone-950 border-2 border-red-400 rounded-3xl p-6 shadow-xl relative overflow-hidden text-white flex flex-col justify-between h-64 sm:h-72">
                  {/* Metallic pattern background */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.25),transparent_70%)] pointer-events-none" />
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-red-500/10 rounded-full blur-xl pointer-events-none" />

                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/40 shadow-md shrink-0">
                        <img
                          src="/logo.jpg"
                          alt="โลโก้ มันนี่หมูกระทะ"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-sm sm:text-base tracking-wide uppercase text-white">
                          Money Mookata
                        </h4>
                        <span className="text-[10px] text-stone-300 font-mono">
                          VIP MEMBER CLUB • SUAN DOK
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30 font-bold uppercase tracking-wider">
                        {currentMember.type.includes('แพทย์') ? 'Medical Staff' : currentMember.type.includes('นักศึกษา') ? 'CMU Student' : 'General VIP'}
                      </span>
                      <span className="text-[10px] text-stone-300 font-mono mt-1">@moneymookata</span>
                    </div>
                  </div>

                  {/* Middle Chip & Points */}
                  <div className="flex items-center justify-between relative z-10 my-auto">
                    <div className="w-11 h-8 rounded-lg bg-amber-200/40 border border-amber-200/60 flex items-center justify-center shadow-inner">
                      <div className="w-8 h-5 border border-amber-200/80 rounded" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-300 block uppercase">ยอดแต้มสะสม</span>
                      <span className="text-3xl font-black text-amber-300 font-mono tracking-tight">
                        {currentMember.points} <span className="text-sm font-normal text-stone-300">pts</span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Bar: Name, Member Code & Simulated Barcode */}
                  <div className="relative z-10 border-t border-stone-700/60 pt-3 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Member Name</span>
                      <span className="font-bold text-sm text-white tracking-wide">{currentMember.name}</span>
                      <span className="text-[11px] text-amber-300 font-mono block">{currentMember.phone}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-black tracking-widest text-amber-200">
                        {currentMember.memberCode || currentMember.id}
                      </span>
                      {/* Simulated barcode lines */}
                      <div className="h-6 w-24 bg-stone-900/80 p-1 rounded border border-stone-700/80 flex items-center justify-between mt-1">
                        <div className="w-1 h-full bg-white" />
                        <div className="w-0.5 h-full bg-white" />
                        <div className="w-1.5 h-full bg-white" />
                        <div className="w-0.5 h-full bg-white" />
                        <div className="w-2 h-full bg-white" />
                        <div className="w-1 h-full bg-white" />
                        <div className="w-0.5 h-full bg-white" />
                        <div className="w-1.5 h-full bg-white" />
                        <div className="w-1 h-full bg-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Card Actions & How to use */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-red-600" />
                    วิธีใช้บัตรสมาชิก E-Card ที่ร้านมันนี่หมูกระทะ
                  </h4>
                  <ul className="text-xs text-stone-700 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>แสดงหน้านี้ให้พนักงานแคชเชียร์สแกนบาร์โค้ด หรือแจ้งเบอร์โทรศัพท์ <strong>{currentMember.phone}</strong> ขณะชำระเงิน</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>รับแต้มอัตโนมัติ <strong>1 แต้ม ทุกๆ 100 บาท</strong> ของยอดบิลสุทธิ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>ผูกกับ LINE OA <strong>@moneymookata</strong> เพื่อรับแจ้งเตือนแต้มและคูปองโปรโมชันส่งตรงถึงมือถือทันที</span>
                    </li>
                  </ul>

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentMember.memberCode || currentMember.id);
                        alert(`คัดลอกรหัสสมาชิก ${currentMember.memberCode || currentMember.id} เรียบร้อย!`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold border border-stone-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-red-600" />
                      <span>คัดลอกรหัสสมาชิก</span>
                    </button>

                    <button
                      onClick={() => setDashboardTab('simulator')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>เปิดดูบัตรใน LINE OA Simulator</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REWARDS REDEMPTION & ACTIVE COUPONS */}
          {dashboardTab === 'rewards' && (
            <div className="space-y-6">
              {/* Point Earning Rule Notice */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-stone-700">
                  <Coins className="w-4 h-4 text-red-600" />
                  <span>
                    <strong>กติกาแต้มสะสม:</strong> บุฟเฟต์ 1 หัว = 1 คะแนนสะสม (พนักงานแคชเชียร์บันทึกให้อัตโนมัติเมื่อเช็คบิล ไม่ต้องส่งบิลเอง)
                  </span>
                </div>
                <span className="text-red-700 font-mono font-bold">
                  แต้มสะสมของคุณ: {currentMember.points} แต้ม
                </span>
              </div>

              {/* Rewards Catalog */}
              <div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4 text-red-600" />
                  รายการสิทธิพิเศษที่สามารถแลกได้ (Reward Tiers)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier 1 */}
                  <div className="bg-white border-2 border-red-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">🥈 Tier 1 (20 คะแนน)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          20 pts
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-sm">
                        หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)
                      </h5>
                      <p className="text-xs text-stone-600">
                        20 คะแนนแลกรับหมูสไลด์พรีเมียม หรือชีสดิป 1 ถ้วย (ฟรี) เสิร์ฟสดถึงโต๊ะ
                      </p>
                    </div>

                    <button
                      onClick={() => handleWebRedeem('หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)', 20)}
                      disabled={currentMember.points < 20}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        currentMember.points >= 20
                          ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95 shadow-md shadow-red-600/30'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{currentMember.points >= 20 ? 'กดแลกสิทธิ์ (ใช้ 20 คะแนน)' : `ขาดอีก ${20 - currentMember.points} แต้ม`}</span>
                    </button>
                  </div>

                  {/* Tier 2 */}
                  <div className="bg-white border-2 border-stone-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-700">🥇 Tier 2 (35 แต้ม)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                          35 pts
                        </span>
                      </div>
                      <h5 className="font-bold text-stone-900 text-sm">
                        ส่วนลดบุฟเฟต์ครึ่งราคา
                      </h5>
                      <p className="text-xs text-stone-600">
                        35 แต้มได้ส่วนลดบุฟเฟต์ครึ่งราคา (ลด 50% ทันทีในมื้อถัดไป)
                      </p>
                    </div>

                    <button
                      onClick={() => handleWebRedeem('ส่วนลดบุฟเฟต์ครึ่งราคา (ลด 50%)', 35)}
                      disabled={currentMember.points < 35}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                        currentMember.points >= 35
                          ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-95 shadow-md shadow-red-600/30'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{currentMember.points >= 35 ? 'กดแลกคูปองลด 50% (ใช้ 35 แต้ม)' : `ขาดอีก ${35 - currentMember.points} แต้ม`}</span>
                    </button>
                  </div>

                  {/* Tier 3: VIP Free Buffet */}
                  <div className="bg-gradient-to-br from-red-50/70 via-white to-amber-50/70 border-2 border-red-400 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-red-700">👑 VIP Gold (50 แต้ม)</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white">
                          กินฟรี!
                        </span>
                      </div>
                      <h5 className="font-black text-stone-900 text-base">
                        กินบุฟเฟต์ฟรี 1 ท่าน (149.-)
                      </h5>
                      <p className="text-xs text-stone-600 font-medium">
                        50 คะแนนกินบุฟเฟต์ฟรี อิ่มไม่อั้น ไม่จำกัดเวลา ฟรี 1 ท่านเต็มๆ
                      </p>
                    </div>

                    <button
                      onClick={() => handleWebRedeem('กินบุฟเฟต์ฟรี 1 ท่าน (มูลค่า 149.-)', 50)}
                      disabled={currentMember.points < 50}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                        currentMember.points >= 50
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white cursor-pointer active:scale-95 shadow-md shadow-red-600/30'
                          : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{currentMember.points >= 50 ? '🎉 กดแลกบุฟเฟต์ฟรีทันที!' : `ขาดอีก ${50 - currentMember.points} แต้ม`}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* My Active E-Coupons Wallet */}
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-red-600" />
                    กระเป๋าคูปองของฉัน (My Active E-Coupons)
                  </h4>
                  <span className="text-xs text-stone-500 font-medium">
                    {(currentMember.coupons || []).length} ใบ
                  </span>
                </div>

                {(currentMember.coupons || []).length === 0 ? (
                  <div className="text-center py-8 text-xs text-stone-500">
                    ยังไม่มีคูปองที่แลกไว้ สามารถสะสมแต้มแล้วกดแลกของรางวัลด้านบนได้เลยค่ะ
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(currentMember.coupons || []).map((cpn) => {
                      const isActive = cpn.status === 'active';
                      return (
                        <div
                          key={cpn.id}
                          className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-white border-red-200 shadow-sm'
                              : 'bg-stone-100 border-stone-200 opacity-60'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-900">{cpn.title}</span>
                              <span className={`text-[10px] px-2 py-0.2 rounded font-bold ${
                                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'
                              }`}>
                                {isActive ? 'พร้อมใช้งาน' : 'ใช้แล้ว'}
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-600">
                              รหัส: <strong className="text-red-700 font-mono text-xs">{cpn.code}</strong> • หมดอายุ: {cpn.expiresAt}
                            </div>
                          </div>

                          {isActive && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(cpn.code);
                                alert(`คัดลอกรหัสคูปอง ${cpn.code} เรียบร้อยแล้ว!`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 flex items-center gap-1 cursor-pointer shrink-0 shadow-xs"
                            >
                              <Copy className="w-3 h-3" />
                              <span>ใช้สิทธิ์</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: POINT TRANSACTION HISTORY */}
          {dashboardTab === 'history' && (
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-red-600" />
                  ประวัติการสะสมและแลกแต้มของ {currentMember.name}
                </h4>
                <span className="text-xs text-stone-500 font-mono">
                  {(currentMember.transactions || []).length} รายการ
                </span>
              </div>

              {(currentMember.transactions || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  ยังไม่มีประวัติการทำรายการแต้ม
                </div>
              ) : (
                <div className="space-y-2">
                  {(currentMember.transactions || []).map((tx) => {
                    const isPlus = tx.points > 0;
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-xs shadow-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-stone-900 flex items-center gap-2">
                            <span>{tx.title}</span>
                            <span className="text-[10px] text-stone-500 font-normal">
                              ({tx.timestamp})
                            </span>
                          </div>
                          {tx.billAmount && (
                            <span className="text-[11px] text-stone-500">
                              ยอดบิลที่ร่วมรายการ: {tx.billAmount.toLocaleString()} บาท
                            </span>
                          )}
                        </div>

                        <span
                          className={`font-mono font-black text-sm px-2.5 py-1 rounded-lg ${
                            isPlus
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {isPlus ? `+${tx.points}` : tx.points} แต้ม
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: INTERACTIVE LINE OA CHAT & RICH MENU SIMULATOR */}
          {dashboardTab === 'simulator' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 flex justify-center">
                {/* Smartphone Device Mockup */}
                <div className="w-full max-w-[340px] bg-stone-950 border-4 border-stone-700 rounded-[38px] p-3 shadow-2xl space-y-3 relative overflow-hidden">
                  {/* Phone Notch */}
                  <div className="w-24 h-4 bg-stone-800 mx-auto rounded-b-xl" />

                  {/* LINE OA Header */}
                  <div className="bg-[#06C755] text-white p-3 rounded-2xl flex items-center justify-between shadow">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white text-[#06C755] flex items-center justify-center font-bold">
                        🐷
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1">
                          <span>มันนี่หมูกระทะ</span>
                          <span className="text-[9px] bg-white/20 px-1 rounded">Official</span>
                        </div>
                        <span className="text-[10px] text-white/80">@moneymookata</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white text-[#06C755] px-2 py-0.5 rounded-full font-bold">
                      เพื่อน 5.4k
                    </span>
                  </div>

                  {/* Chat Message Scroll Area */}
                  <div className="bg-[#8c9bab]/20 rounded-2xl p-2.5 h-64 overflow-y-auto space-y-2 text-[11px] scrollbar-none">
                    {simChatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.sender === 'user' ? (
                          <div className="bg-[#06C755] text-white px-3 py-1.5 rounded-2xl rounded-tr-none max-w-[80%] shadow">
                            {msg.text}
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-w-[90%]">
                            {msg.text && (
                              <div className="bg-stone-900 border border-stone-800 text-stone-200 px-3 py-1.5 rounded-2xl rounded-tl-none shadow">
                                {msg.text}
                              </div>
                            )}

                            {/* Card preview if triggered */}
                            {msg.cardType === 'card' && (
                              <div className="bg-stone-900 border border-amber-500/50 rounded-xl p-3 space-y-1.5 text-white shadow-lg">
                                <div className="text-amber-300 font-bold text-xs">🪪 ข้อมูลบัตรสมาชิก Money Club</div>
                                <div>คุณ {currentMember.name}</div>
                                <div className="text-amber-400 font-black text-sm">{currentMember.points} แต้มสะสม</div>
                                <div className="text-[10px] text-stone-400">รหัสสมาชิก: {currentMember.memberCode || currentMember.id}</div>
                              </div>
                            )}

                            {msg.cardType === 'earn' && (
                              <div className="bg-stone-900 border border-emerald-500/50 rounded-xl p-3 space-y-1 text-white shadow-lg">
                                <div className="text-emerald-400 font-bold text-xs">⚡ สะสมแต้มบิลล่าสุด</div>
                                <p className="text-[10px] text-stone-300">ทุก 100 บาท = 1 แต้ม สามารถกรอกเลขใบเสร็จในแท็บ "สะสมแต้มจากบิล" ได้ทันทีค่ะ!</p>
                              </div>
                            )}

                            {msg.cardType === 'rewards' && (
                              <div className="bg-stone-900 border border-amber-500/50 rounded-xl p-3 space-y-1 text-white shadow-lg">
                                <div className="text-amber-300 font-bold text-xs">🎁 สิทธิ์แลกรางวัล</div>
                                <div className="text-[10px] text-stone-300">• 20 pts: หมูสไลด์พรีเมียม / ชีส</div>
                                <div className="text-[10px] text-stone-300">• 35 pts: ส่วนลด 15%</div>
                                <div className="text-[10px] text-stone-300">• 50 pts: บุฟเฟต์ฟรี 1 ท่าน (149.-)</div>
                              </div>
                            )}

                            {msg.cardType === 'queue' && (
                              <div className="bg-stone-900 border border-red-500/50 rounded-xl p-3 space-y-1 text-white shadow-lg">
                                <div className="text-red-400 font-bold text-xs">🎫 สถานะคิวสดหน้าร้าน</div>
                                <div className="text-[10px] text-stone-300">รอคิวอยู่: {queueData.waitingTables} โต๊ะ (รอประมาณ ~{queueData.estimatedWaitTime} นาที)</div>
                              </div>
                            )}

                            {msg.cardType === 'promo' && (
                              <div className="bg-stone-900 border border-sky-500/50 rounded-xl p-3 space-y-1 text-white shadow-lg">
                                <div className="text-sky-300 font-bold text-xs">🔥 โปรโมชันสาขาสวนดอก</div>
                                <div className="text-[10px] text-stone-300">นักศึกษา มช. & แพทย์สวนดอก แสดงบัตรรับฟรีน้ำแข็งถังแรก!</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* LINE Interactive Rich Menu (6 tiles) */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-stone-400 block text-center">
                      ▼ กดเมนูริชเมนูจำลองด้านล่าง ▼
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-stone-900 p-1.5 rounded-2xl border border-stone-800">
                      <button
                        onClick={() => handleSimLineAction('card')}
                        className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] font-bold text-center border border-amber-500/30 cursor-pointer active:scale-95"
                      >
                        🪪 บัตรสมาชิก
                      </button>
                      <button
                        onClick={() => handleSimLineAction('earn')}
                        className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[10px] font-bold text-center border border-emerald-500/30 cursor-pointer active:scale-95"
                      >
                        ⚡ สะสมแต้ม
                      </button>
                      <button
                        onClick={() => handleSimLineAction('rewards')}
                        className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[10px] font-bold text-center border border-amber-500/30 cursor-pointer active:scale-95"
                      >
                        🎁 แลกคูปอง
                      </button>
                      <button
                        onClick={() => handleSimLineAction('queue')}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 text-[10px] font-bold text-center border border-red-500/30 cursor-pointer active:scale-95"
                      >
                        🎫 เช็คคิวสด
                      </button>
                      <button
                        onClick={() => handleSimLineAction('promo')}
                        className="p-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 text-[10px] font-bold text-center border border-sky-500/30 cursor-pointer active:scale-95"
                      >
                        🔥 โปรโมชัน
                      </button>
                      <button
                        onClick={() => onOpenAiChat('น้องมันนี่คะ ขอทราบวิธีการสะสมแต้มผ่าน LINE OA และเงื่อนไขการกินฟรี 50 แต้มหน่อยค่ะ')}
                        className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-[10px] font-bold text-center border border-purple-500/30 cursor-pointer active:scale-95"
                      >
                        💬 คุยกับ AI
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Explanation of LINE OA integration */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-red-100 space-y-4 text-xs text-stone-700 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <span>ระบบสมาชิกและสะสมแต้มผ่าน LINE Official Account (@moneymookata)</span>
                </div>
                <p className="leading-relaxed text-stone-600">
                  ระบบเชื่อมต่อตรงระหว่าง <strong>เว็บแอปพลิเคชัน</strong> และ <strong>LINE Official Account</strong> ลูกค้าไม่ต้องดาวน์โหลดแอปพลิเคชันเพิ่มเติม เพียงแอดไลน์ร้านก็สามารถ:
                </p>
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>เช็คแต้ม & บัตรสมาชิกดิจิทัล:</strong> เปิดดู E-Card พร้อมบาร์โค้ดได้ทันทีจากเมนู LINE ไม่ต้องพกบัตรกระดาษ</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>สะสมแต้มบิลอัตโนมัติ:</strong> พนักงานสแกนหรือบันทึกแต้มหน้าร้าน ยอดแต้มจะส่งแจ้งเตือนเข้าแชท LINE ทันที</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>แลกคูปองทานบุฟเฟต์ฟรี 50 แต้ม:</strong> รับโค้ด E-Coupon ส่งตรงเข้ากระเป๋าคูปองใน LINE นำมาแสดงเพื่อทานฟรีได้ทันที</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL: REGISTER NEW MEMBER VIA WEB / LINE OA */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-red-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <UserPlus className="w-4 h-4 text-red-600" />
                  <span>สมัครสมาชิกมันนี่คลับผ่านเว็บ (ผูก LINE OA)</span>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                🎁 <strong>สิทธิพิเศษต้อนรับ:</strong> สมัครวันนี้รับฟรีทันที <strong>10 แต้มต้อนรับ</strong> + สิทธิ์แลกหมูสไลด์พรีเมียม / ชีสดิปฟรีเมื่อสะสมครบ 20 แต้ม!
              </div>

              <form onSubmit={handleWebRegister} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 mb-1 font-medium">ชื่อ-นามสกุล / ชื่อเล่น *:</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คุณณภัทร หรือ นศ.พ. มินตรา"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-medium">เบอร์โทรศัพท์ (ใช้สะสมแต้ม) *:</label>
                  <input
                    type="tel"
                    required
                    placeholder="08x-xxx-xxxx"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 font-mono focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-medium">สังกัด / สิทธิพิเศษ:</label>
                  <select
                    value={regType}
                    onChange={(e) => setRegType(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:border-red-600 outline-none"
                  >
                    <option value="นักศึกษา มช.">🎓 นักศึกษา มช. (รับสิทธิ์ส่วนลดสายรหัส)</option>
                    <option value="บุคลากรทางการแพทย์ (สวนดอก)">🩺 บุคลากรการแพทย์ (รพ.มหาราช สวนดอก)</option>
                    <option value="ลูกค้าทั่วไป">ลูกค้าทั่วไป (Money Club Member)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-1 font-medium">LINE ID (ถ้ามี):</label>
                  <input
                    type="text"
                    placeholder="@line_user"
                    value={regLineId}
                    onChange={(e) => setRegLineId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-stone-900 focus:bg-white focus:border-red-600 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/30 cursor-pointer"
                  >
                    ยืนยันสมัครสมาชิก (+10 แต้ม)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FLOATING SIMULATED LINE OA PUSH NOTIFICATION TOAST */}
        {linePushToast && (
          <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-stone-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0 shadow">
                💬
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">@moneymookata (LINE OA)</span>
                  <span className="text-[10px] text-stone-500 font-mono">เมื่อสักครู่</span>
                </div>
                <h5 className="text-xs font-bold text-white">{linePushToast.title}</h5>
                <p className="text-[11px] text-stone-300 leading-relaxed">{linePushToast.body}</p>
                {linePushToast.pointsDelta && (
                  <span className="inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {linePushToast.pointsDelta}
                  </span>
                )}
              </div>
              <button
                onClick={() => setLinePushToast(null)}
                className="text-stone-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 7. SERVICE SATISFACTION (คะแนนความพึงพอใจ) */}
      <section id="cashier-rating" className="space-y-6 scroll-mt-6">
        <div className="border-b border-red-200 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span>🐷</span>
                CUSTOMER SERVICE SATISFACTION (5 PIGS / 5 น้องหมู)
              </span>
              <span className="text-[10px] bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold">
                คะแนนเต็ม 5 น้องหมู 🐷
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900">
              คะแนนความพึงพอใจ
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              แตะให้คะแนน 1 - 5 น้องหมู 🐷 บนหน้าจอแท็บเล็ตขณะชำระเงิน • รับโบนัสสะสมแต้ม LINE OA +1 แต้ม ฟรีทันที!
            </p>
          </div>

          {onOpenCashierRating && (
            <button
              onClick={onOpenCashierRating}
              className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span className="text-base">🐷</span>
              <span>เริ่มประเมิน</span>
            </button>
          )}
        </div>

        {/* Featured Satisfaction Banner & Interactive POS Trigger */}
        <div className="bg-white border-2 border-red-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-50/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Overall Score & CSAT Stats */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>อัตราความพึงพอใจลูกค้า 96% (CSAT Rating)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black text-red-600 tracking-tight font-mono">
                  {ratingStats.averageRating}
                </span>
                <div>
                  <div className="flex items-center gap-1 text-lg">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-2xl sm:text-3xl transition-all ${
                          s <= Math.round(ratingStats.averageRating)
                            ? 'scale-105 drop-shadow-sm filter-none'
                            : 'opacity-25 grayscale'
                        }`}
                      >
                        🐷
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 mt-1 block">
                    คะแนนเต็ม 5.0 น้องหมู จากลูกค้าจริงกว่า {ratingStats.totalRatings}+ ท่าน
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                ที่ร้านมันนี่หมูกระทะ สาขาสวนดอก เราติดตั้งหน้าจอแท็บเล็ตระบบสัมผัส (Customer Tablet Screen) ให้ลูกค้าสามารถแตะให้คะแนนความพึงพอใจ 5 น้องหมูได้ด้วยตนเองอย่างโปร่งใส พร้อมฟังก์ชันรับฟังคำแนะนำเพื่อพัฒนาบริการให้ดียิ่งขึ้นทุกวัน
              </p>

              {/* Star breakdown mini bars */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs max-w-md">
                {[5, 4, 3, 2, 1].map((s) => {
                  const count = ratingStats.starsCount[s as 5 | 4 | 3 | 2 | 1];
                  const pct = ratingStats.totalRatings > 0 ? Math.round((count / ratingStats.totalRatings) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-2 text-[11px]">
                      <span className="w-12 text-stone-700 flex items-center gap-1 font-mono font-medium">
                        {s} <span className="text-xs">🐷</span>
                      </span>
                      <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden border border-stone-300">
                        <div
                          className={`h-full rounded-full ${
                            s >= 4 ? 'bg-red-500' : s === 3 ? 'bg-amber-500' : 'bg-stone-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-14 text-right text-stone-600 font-mono text-[10px]">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Cashier Tablet Interactive Simulator Box */}
            <div className="lg:col-span-6 bg-red-50/50 border border-red-200 rounded-3xl p-6 shadow-sm space-y-5 text-center relative">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  CUSTOMER SATISFACTION EXPERIENCE
                </span>
                <h4 className="text-base sm:text-lg font-black text-stone-900">
                  ประเมินคะแนนความพึงพอใจ
                </h4>
                <p className="text-xs text-stone-600">
                  แตะเลือกจำนวนน้องหมูเพื่อเปิดหน้าจอประเมินความพึงพอใจจำลอง
                </p>
              </div>

              {/* Big Interactive 5 Pigs */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 py-2">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={onOpenCashierRating}
                    className="p-1 rounded-2xl hover:scale-125 transition-transform cursor-pointer group text-center"
                    title={`แตะให้ ${starVal} หมู`}
                  >
                    <span className="text-3xl sm:text-4xl block drop-shadow-sm group-hover:scale-110 transition-transform select-none">
                      🐷
                    </span>
                    <span className="block text-[10px] font-bold text-stone-600 group-hover:text-red-600 mt-1">
                      {starVal} หมู
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>พิเศษ:</strong> ทุกการประเมินบริการ รับโบนัสแต้มสะสม LINE OA <strong>+1 แต้ม ทันที!</strong>
                </span>
              </div>

              {onOpenCashierRating && (
                <button
                  onClick={onOpenCashierRating}
                  className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm sm:text-base shadow-md shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span className="text-lg">🐷</span>
                  <span>เริ่มประเมิน</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 5 Rating Topics Breakdown Cards */}
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              เกณฑ์คะแนนความพึงพอใจ 5 ด้านหลัก (เต็ม 5 น้องหมู 🐷)
            </span>
            <span className="text-[11px] text-stone-500">
              ประเมินโดยลูกค้าจริง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. การจอดรถ */}
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl space-y-2 hover:border-red-400 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-red-600 font-mono flex items-center gap-1">
                  <span>{ratingStats.categoryAverages.parking}</span>
                  <span className="text-sm">🐷</span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">1. การจอดรถ</h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  ที่จอดรถกว้างขวาง ร่มรื่น สะดวก ปลอดภัย
                </p>
              </div>
            </div>

            {/* 2. การจองคิว */}
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl space-y-2 hover:border-red-400 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-red-600 font-mono flex items-center gap-1">
                  <span>{ratingStats.categoryAverages.booking}</span>
                  <span className="text-sm">🐷</span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">2. การจองคิว</h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  กดจองสะดวกรวดเร็ว ไม่ซับซ้อน ได้คิวทันที
                </p>
              </div>
            </div>

            {/* 3. การรอคิว */}
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl space-y-2 hover:border-red-400 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-red-600 font-mono flex items-center gap-1">
                  <span>{ratingStats.categoryAverages.waiting}</span>
                  <span className="text-sm">🐷</span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">3. การรอคิว</h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  เวลารอตรงตามคาดหมาย จุดนั่งรอสะดวกสบาย
                </p>
              </div>
            </div>

            {/* 4. บริการภายในร้าน */}
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl space-y-2 hover:border-red-400 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-red-600 font-mono flex items-center gap-1">
                  <span>{ratingStats.categoryAverages.service}</span>
                  <span className="text-sm">🐷</span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">4. บริการภายในร้าน</h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  พนักงานยิ้มแย้มใส่ใจ เติมอาหารสดสม่ำเสมอ
                </p>
              </div>
            </div>

            {/* 5. การชำระเงิน */}
            <div className="bg-white border border-stone-200 p-3.5 rounded-2xl space-y-2 hover:border-red-400 transition-colors shadow-xs">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-sm font-black text-red-600 font-mono flex items-center gap-1">
                  <span>{ratingStats.categoryAverages.payment}</span>
                  <span className="text-sm">🐷</span>
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">5. การชำระเงิน</h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  คิดเงินถูกต้อง สแกนจ่ายไว ได้แต้ม LINE ทันใจ
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Authentic Customer Reviews Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-red-600" />
              <span>ความคิดเห็นล่าสุดจากลูกค้าบริการ</span>
            </h4>
            <span className="text-xs text-stone-500">อัปเดตแบบเรียลไทม์</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {cashierRatings.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="bg-white border border-stone-200 p-4 rounded-2xl space-y-2.5 hover:border-red-300 transition-colors shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < r.stars ? 'drop-shadow-xs filter-none' : 'opacity-25 grayscale'
                        }`}
                      >
                        🐷
                      </span>
                    ))}
                    <span className="text-xs font-bold text-red-600 ml-1">{r.stars}.0</span>
                  </div>
                  <span className="text-[10px] text-stone-500">{r.timestamp}</span>
                </div>

                <p className="text-xs text-stone-700 italic leading-relaxed">
                  "{r.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-900">{r.customerName || 'ลูกค้าหน้าร้าน'}</span>
                  <span>{r.cashierStaff}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. LOCATION, HOURS, MAP & CONTACT */}
      <section id="location" className="space-y-6 scroll-mt-6">
        <div className="border-b border-red-200 pb-4">
          <span className="text-xs text-red-600 font-bold tracking-widest uppercase flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-red-600" />
            Location & Store Info
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1">
            พิกัดร้านมันนี่หมูกระทะ สาขาสวนดอก เชียงใหม่
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            เดินทางสะดวก ติดถนนสุเทพ ใกล้โรงพยาบาลมหาราชนครเชียงใหม่และมหาวิทยาลัยเชียงใหม่
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-red-100 text-red-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">ที่อยู่ร้าน</h3>
                  <p className="text-xs text-stone-700 mt-0.5 leading-relaxed">
                    ถนนสุเทพ ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200
                    <br />
                    <span className="text-red-700 font-medium">(จุดสังเกต: เยื้องคณะทันตแพทยศาสตร์ มช. และ รพ.มหาราช สวนดอก)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">เวลาเปิดทำการ</h3>
                  <p className="text-xs text-stone-700 mt-0.5">
                    เปิดให้บริการทุกวัน จันทร์ - อาทิตย์ เวลา <strong>16:00 - 23:00 น.</strong>
                    <br />
                    <span className="text-stone-500">(ไลน์อาหารและบาร์สดปิดเติม 22:30 น.)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-stone-100">
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">ติดต่อสำรองโต๊ะกลุ่มใหญ่</h3>
                  <p className="text-xs text-stone-700 mt-0.5">
                    โทร: <strong>053-999-888</strong> หรือ <strong>089-777-6655</strong>
                    <br />
                    LINE Official: <strong className="text-emerald-700">@moneymookata</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Facilities Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-xs">
                <Car className="w-5 h-5 text-red-600 mx-auto mb-1" />
                <span className="text-stone-700 font-medium text-[11px] block">ที่จอดรถสะดวก</span>
              </div>
              <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-xs">
                <Wifi className="w-5 h-5 text-sky-600 mx-auto mb-1" />
                <span className="text-stone-700 font-medium text-[11px] block">ฟรี Wi-Fi แรง</span>
              </div>
              <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-xs">
                <CreditCard className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <span className="text-stone-700 font-medium text-[11px] block">สแกนจ่าย QR</span>
              </div>
              <div className="bg-white border border-stone-200 p-3 rounded-xl shadow-xs">
                <Users className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="text-stone-700 font-medium text-[11px] block">รับโต๊ะเลี้ยงกลุ่ม</span>
              </div>
            </div>
          </div>

          {/* Map Simulation / Visual Pin Card */}
          <div className="lg:col-span-6 bg-white border border-red-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-64 sm:h-72 bg-gradient-to-br from-red-50/80 via-stone-50 to-red-50/50 relative flex items-center justify-center p-6 text-center border-b border-stone-200">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="relative z-10 space-y-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-500 mx-auto shadow-md animate-pulse shrink-0 bg-red-600">
                  <img
                    src="/logo.jpg"
                    alt="โลโก้ร้าน มันนี่หมูกระทะ x ชาบู"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">มันนี่หมูกระทะ สาขาสวนดอก</h4>
                  <p className="text-xs text-stone-600">พิกัด: 18.7892° N, 98.9680° E (ย่านสวนดอก เชียงใหม่)</p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-red-200 text-xs text-red-700 font-bold shadow-xs">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>ติดกับประตูคณะทันตแพทย์ มช.</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs">
              <span className="text-stone-600">ค้นหาใน Google Maps: "มันนี่หมูกระทะ สวนดอก"</span>
              <button
                onClick={() =>
                  window.open(
                    'https://www.google.com/maps/search/?api=1&query=Mookata+Suan+Dok+Chiang+Mai',
                    '_blank'
                  )
                }
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>เปิดแผนที่นำทาง</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STAFF SHORTCUT BANNER */}
      <section className="bg-white border border-red-200 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">สำหรับพนักงานและผู้จัดการร้าน</h4>
            <p className="text-xs text-stone-600">
              เข้าถึงโมดูลแจ้งเตือนเหตุฉุกเฉิน Robinson 2019, กราฟวิเคราะห์ยอดขาย Recharts, รันคิวหน้าร้าน, และบันทึกแต้มสมาชิก
            </p>
          </div>
        </div>

        <button
          onClick={onOpenStaffPortal}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>เปิดแดชบอร์ดจัดการร้าน (Staff Ops)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* Floating Quick Action Buttons (Bottom Left) for Customer Assistance */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex flex-col gap-2">
        <a
          href="#table-service"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white hover:bg-red-50 text-red-600 text-xs font-bold shadow-lg border border-red-200 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>แจ้งปัญหาโต๊ะ / แก๊สหมด</span>
        </a>

        <a
          href="#member-dashboard"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold shadow-lg border border-emerald-300 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>LINE OA (@moneymookata)</span>
        </a>
      </div>
    </div>
  );
};
