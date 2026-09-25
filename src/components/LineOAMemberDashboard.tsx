import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Gift,
  Award,
  CheckCircle2,
  Sparkles,
  Plus,
  Search,
  Copy,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Coins,
  Flame,
  UserPlus,
  Clock,
  ArrowRight,
  History,
  Ticket,
  ChevronRight,
  GraduationCap,
  Stethoscope,
  Users,
  Check,
  Zap,
} from 'lucide-react';
import { Member, MemberCoupon, MemberTransaction } from '../types';

interface LineOAMemberDashboardProps {
  members: Member[];
  onAddMemberPoints: (memberId: string, addedPoints: number, newBill: number, desc?: string) => void;
  onRegisterMember: (newMember: Member) => void;
  onRedeemReward: (memberId: string, rewardTitle: string, pointsCost: number) => string;
}

export const LineOAMemberDashboard: React.FC<LineOAMemberDashboardProps> = ({
  members,
  onAddMemberPoints,
  onRegisterMember,
  onRedeemReward,
}) => {
  // Currently active/logged-in member in LINE OA Web Dashboard
  const [activeMemberId, setActiveMemberId] = useState<string>(members[0]?.id || 'MEM-001');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  // Active sub-tab inside the Web Dashboard
  const [activeTab, setActiveTab] = useState<'card' | 'rules' | 'earn' | 'redeem' | 'register' | 'linemenu'>('card');

  // Earn points simulator state
  const [billAmountInput, setBillAmountInput] = useState<number>(596);
  const [receiptNumber, setReceiptNumber] = useState(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [tableNumber, setTableNumber] = useState('โต๊ะ 06');
  const [earnedSuccessMsg, setEarnedSuccessMsg] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regType, setRegType] = useState<'นักศึกษา มช.' | 'บุคลากรทางการแพทย์ (สวนดอก)' | 'ลูกค้าทั่วไป'>('นักศึกษา มช.');
  const [regLineId, setRegLineId] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Notification simulation popup
  const [lineNotification, setLineNotification] = useState<{ title: string; body: string } | null>(null);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const triggerLinePushNotification = (title: string, body: string) => {
    setLineNotification({ title, body });
    setTimeout(() => {
      setLineNotification(null);
    }, 5000);
  };

  const handleSearchMemberByPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;
    const cleanSearch = searchPhone.trim().replace(/[-\s]/g, '');
    const found = members.find((m) => m.phone.replace(/[-\s]/g, '').includes(cleanSearch));
    if (found) {
      setActiveMemberId(found.id);
      setSearchFeedback(`✅ ยินดีต้อนรับคุณ ${found.name}`);
      setActiveTab('card');
    } else {
      setSearchFeedback('❌ ไม่พบบัญชีสมาชิกจากเบอร์นี้ คุณสามารถกด "สมัครสมาชิกใหม่" ได้ทันทีค่ะ');
    }
    setTimeout(() => setSearchFeedback(null), 4000);
  };

  const handleEarnPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (billAmountInput < 100) return;
    const pointsToEarn = Math.floor(billAmountInput / 100);
    const desc = `สะสมแต้มผ่านบิล ${receiptNumber} (${tableNumber} ยอด ${billAmountInput.toLocaleString()}.-)`;

    onAddMemberPoints(activeMember.id, pointsToEarn, billAmountInput, desc);
    setEarnedSuccessMsg(`🎉 สำเร็จ! บันทึกแต้ม +${pointsToEarn} แต้มเข้าบัญชีเรียบร้อย`);
    triggerLinePushNotification(
      '🟢 LINE OA: แต้มสะสมเพิ่มขึ้น!',
      `คุณได้รับ +${pointsToEarn} แต้ม จากบิล ${receiptNumber} ยอด ${billAmountInput.toLocaleString()} บาท (แต้มรวม: ${activeMember.points + pointsToEarn} แต้ม)`
    );

    // Refresh random receipt number for next
    setReceiptNumber(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
    setTimeout(() => setEarnedSuccessMsg(null), 4000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regPhone.trim()) return;

    const newMemId = `MEM-${Date.now().toString().slice(-4)}`;
    const newMemberCode = `MMK-${Math.floor(10000 + Math.random() * 90000)}`;

    const newMember: Member = {
      id: newMemId,
      name: regName.trim(),
      phone: regPhone.trim(),
      type: regType,
      points: 10, // 10 Welcome Bonus Points
      totalVisits: 1,
      lastVisit: 'วันนี้ (สมัครใหม่)',
      lineId: regLineId.trim() || `@line_${regPhone.slice(-4)}`,
      lineConnected: true,
      memberCode: newMemberCode,
      coupons: [
        {
          id: `CPN-WELCOME-${Date.now()}`,
          code: `WELCOME10-${Math.floor(100 + Math.random() * 900)}`,
          title: 'สิทธิ์ฟรีน้ำแข็งถังแรก (ต้อนรับสมาชิกใหม่)',
          pointsCost: 0,
          redeemedAt: 'วันนี้',
          expiresAt: 'ใช้ได้ตลอดชีพ',
          status: 'active',
        },
      ],
      transactions: [
        {
          id: `TX-W-${Date.now()}`,
          type: 'bonus',
          points: 10,
          title: 'โบนัสแต้มต้อนรับสมาชิกใหม่ LINE OA',
          timestamp: 'วันนี้',
        },
      ],
    };

    onRegisterMember(newMember);
    setActiveMemberId(newMember.id);
    setRegSuccessMsg(`🎉 ยินดีต้อนรับคุณ ${newMember.name}! รับโบนัสแต้มต้อนรับทันที +10 แต้ม`);
    triggerLinePushNotification(
      '🟢 LINE OA: สมัครสมาชิกมันนี่คลับสำเร็จ',
      `ยินดีต้อนรับคุณ ${newMember.name} รหัสสมาชิก ${newMemberCode} รับฟรี 10 แต้มต้อนรับ + ฟรีน้ำแข็งถังแรก!`
    );

    setRegName('');
    setRegPhone('');
    setRegLineId('');
    setTimeout(() => {
      setRegSuccessMsg(null);
      setActiveTab('card');
    }, 2000);
  };

  const handleRedeemClick = (rewardTitle: string, pointsCost: number) => {
    if (activeMember.points < pointsCost) {
      alert(`แต้มของคุณไม่เพียงพอ (ต้องการ ${pointsCost} แต้ม แต่มี ${activeMember.points} แต้ม)`);
      return;
    }
    const code = onRedeemReward(activeMember.id, rewardTitle, pointsCost);
    triggerLinePushNotification(
      '🟢 LINE OA: แลกของรางวัลสำเร็จ!',
      `คุณได้แลกรับ "${rewardTitle}" สำเร็จ (หัก ${pointsCost} แต้ม) รหัสคูปอง: ${code} นำไปแสดงต่อพนักงานหน้าร้านได้เลยค่ะ`
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getTier = (points: number) => {
    if (points >= 50) return { name: 'VIP Diamond Member', color: 'from-amber-400 via-amber-200 to-yellow-500', badge: '👑 VIP Diamond', nextTarget: 50, remaining: 0 };
    if (points >= 35) return { name: 'Gold Member', color: 'from-yellow-500 via-amber-400 to-orange-500', badge: '🥇 Gold Tier', nextTarget: 50, remaining: 50 - points };
    if (points >= 20) return { name: 'Silver Member', color: 'from-stone-300 via-slate-200 to-stone-400', badge: '🥈 Silver Tier', nextTarget: 35, remaining: 35 - points };
    return { name: 'Standard Member', color: 'from-stone-500 via-stone-400 to-stone-600', badge: '🥉 Standard', nextTarget: 20, remaining: 20 - points };
  };

  const tier = getTier(activeMember?.points || 0);

  return (
    <div className="space-y-6">
      {/* LINE OA Simulation Floating Banner */}
      {lineNotification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-stone-900 border-2 border-emerald-500 text-white p-4 rounded-2xl shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs flex-1">
            <div className="flex items-center justify-between font-bold text-emerald-400">
              <span>{lineNotification.title}</span>
              <span className="text-[10px] text-stone-400">ตอนนี้</span>
            </div>
            <p className="text-stone-200 leading-relaxed">{lineNotification.body}</p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-950 to-stone-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500 text-stone-950 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
                LINE Official Account @moneymookata
              </span>
              <span className="text-xs text-emerald-400 font-semibold">ระบบสะสมแต้มมันนี่คลับ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-emerald-400" />
              แดชบอร์ดสะสมแต้มผ่าน LINE OA (Web Access)
            </h2>
            <p className="text-xs text-stone-300 mt-1 max-w-2xl">
              เปิดใช้งานผ่านเว็บบราวเซอร์หรือผ่านแอป LINE • ทุก 100 บาท = 1 แต้ม • ไม่ต้องพกบัตรกระดาษ • คูปองส่วนลดและบุฟเฟต์ฟรีซิงค์เข้า LINE ทันที
            </p>
          </div>

          {/* Quick Phone Search / Switch Member */}
          <form onSubmit={handleSearchMemberByPhone} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="กรอกเบอร์โทรเช็คแต้ม..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500 outline-none w-48 sm:w-56"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              ค้นหาบัตร
            </button>
          </form>
        </div>

        {searchFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200">
            {searchFeedback}
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('card')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'card'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>บัตรสมาชิกดิจิทัล (E-Card)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>กติกาแต้ม (1 หัว = 1 แต้ม)</span>
          </button>

          <button
            onClick={() => setActiveTab('redeem')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'redeem'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>แลกของรางวัล & คูปอง ({activeMember.coupons?.filter(c => c.status === 'active').length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'register'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>สมัครสมาชิกใหม่ (+10 แต้มฟรี)</span>
          </button>

          <button
            onClick={() => setActiveTab('linemenu')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'linemenu'
                ? 'bg-emerald-500 text-stone-950 shadow-lg shadow-emerald-500/20'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>จำลองหน้าแชท LINE OA</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: DIGITAL E-CARD VIEW */}
      {activeTab === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: The Virtual LINE OA E-Card */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950/70 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6">
              {/* Watermark Logo */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                <Flame className="w-64 h-64 text-emerald-300" />
              </div>

              {/* Card Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-stone-950 font-black text-2xl shadow-lg">
                    M
                  </div>
                  <div>
                    <div className="text-white font-black text-base sm:text-lg flex items-center gap-1.5">
                      มันนี่หมูกระทะ สวนดอก
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        LINE OA
                      </span>
                    </div>
                    <span className="text-xs text-stone-400 font-mono">
                      MONEY MOOKATA CLUB CARD
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-stone-400 block uppercase">
                    Member Tier
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                    {tier.badge}
                  </span>
                </div>
              </div>

              {/* Card Center: Member Info & QR Code */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
                <div className="space-y-2 text-center sm:text-left">
                  <div>
                    <span className="text-stone-400 text-xs block">ชื่อสมาชิก:</span>
                    <strong className="text-white text-base sm:text-lg font-bold flex items-center justify-center sm:justify-start gap-1.5">
                      {activeMember.name}
                      {activeMember.type.includes('แพทย์') ? (
                        <Stethoscope className="w-4 h-4 text-rose-400" />
                      ) : activeMember.type.includes('นักศึกษา') ? (
                        <GraduationCap className="w-4 h-4 text-sky-400" />
                      ) : null}
                    </strong>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-stone-300 font-mono">
                    <span>เบอร์: {activeMember.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{activeMember.memberCode || 'MMK-78912'}</span>
                  </div>

                  <div className="inline-block bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 text-[11px] text-stone-300">
                    {activeMember.type} • มาแล้ว {activeMember.totalVisits} ครั้ง
                  </div>
                </div>

                {/* QR Code Graphic for Staff to Scan */}
                <div className="bg-white p-3 rounded-2xl shadow-xl text-center shrink-0 space-y-1">
                  <div className="w-28 h-28 bg-white flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Simple generated aesthetic QR pattern */}
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="25" height="25" fill="black" />
                      <rect x="15" y="15" width="15" height="15" fill="white" />
                      <rect x="18" y="18" width="9" height="9" fill="black" />

                      <rect x="65" y="10" width="25" height="25" fill="black" />
                      <rect x="70" y="15" width="15" height="15" fill="white" />
                      <rect x="73" y="18" width="9" height="9" fill="black" />

                      <rect x="10" y="65" width="25" height="25" fill="black" />
                      <rect x="15" y="70" width="15" height="15" fill="white" />
                      <rect x="18" y="73" width="9" height="9" fill="black" />

                      <rect x="42" y="12" width="6" height="16" fill="black" />
                      <rect x="52" y="12" width="6" height="8" fill="black" />
                      <rect x="42" y="32" width="16" height="6" fill="black" />
                      <rect x="42" y="42" width="16" height="16" fill="#059669" />
                      <rect x="65" y="42" width="10" height="8" fill="black" />
                      <rect x="80" y="42" width="10" height="8" fill="black" />
                      <rect x="42" y="65" width="8" height="25" fill="black" />
                      <rect x="56" y="65" width="12" height="10" fill="black" />
                      <rect x="75" y="65" width="15" height="25" fill="black" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-stone-900 block">
                    สแกนสะสม/ตัดแต้ม
                  </span>
                </div>
              </div>

              {/* Card Footer: Points & Progress */}
              <div className="space-y-3 relative z-10 pt-2 border-t border-stone-800">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-xs text-stone-400 block">แต้มสะสมปัจจุบันใน LINE OA:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">
                        {activeMember.points}
                      </span>
                      <span className="text-sm font-bold text-amber-300">แต้ม (Points)</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-400 block">
                      {activeMember.points >= 50
                        ? '🎉 ครบ 50 แต้มแล้ว!'
                        : `ขาดอีก ${tier.remaining} แต้มถึงเป้าถัดไป`}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {activeMember.points >= 50 ? 'รับฟรีบุฟเฟต์ 1 ท่าน' : `เป้าหมาย: ${tier.nextTarget} แต้ม`}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-amber-500 transition-all duration-500 shadow-md"
                    style={{ width: `${Math.min(100, Math.round((activeMember.points / 50) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Action buttons inside card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 relative z-10">
                <button
                  onClick={() => setActiveTab('earn')}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>สะสมแต้มบิลนี้</span>
                </button>
                <button
                  onClick={() => setActiveTab('redeem')}
                  className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>แลกของรางวัล</span>
                </button>
                <button
                  onClick={() => {
                    triggerLinePushNotification(
                      '🟢 LINE Official Account',
                      `รหัสสมาชิกของคุณคือ: ${activeMember.memberCode || 'MMK-78912'} แจ้งเบอร์ ${activeMember.phone} ที่หน้าร้านได้ทันทีค่ะ`
                    );
                  }}
                  className="col-span-2 sm:col-span-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>แชร์เข้า LINE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Quick Members Switcher & Recent Transactions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Demo Switcher */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  เลือกบัญชีสมาชิกเพื่อทดสอบ (Quick Switch)
                </h3>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setActiveMemberId(m.id)}
                    className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      activeMemberId === m.id
                        ? 'bg-emerald-950/40 border-emerald-500/70 text-white font-bold'
                        : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <div className="text-left">
                      <div>{m.name}</div>
                      <span className="text-[10px] text-stone-500 font-mono">{m.phone}</span>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">{m.points} แต้ม</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Point History & Transactions */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  ประวัติการสะสมและแลกแต้มล่าสุด
                </h3>
              </div>

              {activeMember.transactions && activeMember.transactions.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {activeMember.transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-stone-200">{tx.title}</div>
                        <div className="text-[10px] text-stone-500">{tx.timestamp}</div>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          tx.points > 0
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {tx.points > 0 ? `+${tx.points}` : tx.points} แต้ม
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-center text-xs text-stone-500">
                  ยังไม่มีประวัติการทำรายการในรอบนี้
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: POINT RULES (บุฟเฟต์ 1 หัว = 1 คะแนนสะสม) */}
      {activeTab === 'rules' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LOYALTY POINT RULES
                </span>
                <span className="text-xs text-stone-400">ระบบสะสมแต้มมันนี่คลับ</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-1">
                <Coins className="w-5 h-5 text-amber-400" />
                บุฟเฟต์ 1 หัว จะได้ 1 คะแนนสะสม
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">แต้มปัจจุบันของคุณ:</span>
              <strong className="text-amber-400 font-mono text-base font-bold">{activeMember.points} แต้ม</strong>
            </div>
          </div>

          {/* Rule Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="text-white font-bold text-sm">ไม่ต้องสะสมจากบิลเอง แคชเชียร์บันทึกให้อัตโนมัติ</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                ระบบยกเลิกการกรอกเลขที่ใบเสร็จด้วยตนเองแล้ว เพื่อความสะดวกรวดเร็ว เพียงแจ้งเบอร์โทรศัพท์ <strong>{activeMember.phone}</strong> หรือเปิดบัตร E-Card ให้พนักงานสแกนขณะเช็คบิลที่เคาน์เตอร์แคชเชียร์
              </p>
              <div className="text-[11px] text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30">
                ✨ <strong>กติกาง่ายๆ:</strong> ทานบุฟเฟต์กี่ท่าน รับแต้มสะสมตามจำนวนหัวทันที (1 หัว = 1 คะแนนสะสม)
              </div>
            </div>

            <div className="bg-stone-950 p-5 rounded-2xl border border-stone-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <h4 className="text-white font-bold text-sm">เป้าหมายแลกของรางวัลสุดคุ้ม</h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-850">
                  <span className="text-stone-200">🥩 <strong>Tier 1 (10 แต้ม):</strong> หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)</span>
                  <span className="text-amber-400 font-bold">{activeMember.points >= 10 ? '✅ แลกได้เลย' : `ขาดอีก ${10 - activeMember.points}`}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-850">
                  <span className="text-stone-200">🏷️ <strong>35 แต้ม:</strong> ส่วนลดบุฟเฟต์ครึ่งราคา (ลด 50%)</span>
                  <span className="text-amber-400 font-bold">{activeMember.points >= 35 ? '✅ แลกได้เลย' : `ขาดอีก ${35 - activeMember.points}`}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-850">
                  <span className="text-stone-200">👑 <strong>50 แต้ม:</strong> กินบุฟเฟต์ฟรี 1 ท่าน (149.-)</span>
                  <span className="text-amber-400 font-bold">{activeMember.points >= 50 ? '🎉 กินฟรีทันที' : `ขาดอีก ${50 - activeMember.points}`}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('redeem')}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow transition-all cursor-pointer"
              >
                ไปที่หน้าแลกของรางวัล & คูปอง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: REDEEM REWARDS & E-COUPONS */}
      {activeTab === 'redeem' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-400" />
                  แลกของรางวัลมันนี่คลับ (Reward Milestones)
                </h3>
                <p className="text-xs text-stone-400">
                  แต้มสะสมในกระเป๋าของคุณ: <strong className="text-amber-400 font-mono text-sm">{activeMember.points} แต้ม</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Reward 1 */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300">
                      🥈 Tier 1
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">10 คะแนน</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    10 คะแนนแลกรับหมูสไลด์พรีเมียม หรือชีสดิป 1 ถ้วย (ฟรี) เสิร์ฟสดถึงโต๊ะ
                  </p>
                </div>

                <button
                  onClick={() => handleRedeemClick('หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)', 10)}
                  disabled={activeMember.points < 10}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMember.points >= 10
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{activeMember.points >= 10 ? 'กดแลกคูปอง (10 คะแนน)' : 'แต้มไม่พอ (ขาดอีก ' + (10 - activeMember.points) + ')'}</span>
                </button>
              </div>

              {/* Reward 2 */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-800 text-amber-300">
                      🥇 Tier 2
                    </span>
                    <span className="font-mono font-bold text-amber-400 text-sm">35 แต้ม</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">ส่วนลดบุฟเฟต์ครึ่งราคา</h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    รับสิทธิ์ทานบุฟเฟต์ลดทันที 50% ในมื้อถัดไป (35 แต้มแลกรับสิทธิ์)
                  </p>
                </div>

                <button
                  onClick={() => handleRedeemClick('ส่วนลดบุฟเฟต์ครึ่งราคา (ลด 50%)', 35)}
                  disabled={activeMember.points < 35}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMember.points >= 35
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>{activeMember.points >= 35 ? 'กดแลกคูปองลด 50% (35 แต้ม)' : 'แต้มไม่พอ (ขาดอีก ' + (35 - activeMember.points) + ')'}</span>
                </button>
              </div>

              {/* Reward 3 */}
              <div className="bg-gradient-to-br from-amber-950/40 via-stone-950 to-stone-950 p-4 rounded-2xl border-2 border-amber-500/60 flex flex-col justify-between space-y-4 shadow-lg shadow-amber-950/30">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950">
                      👑 VIP Gold
                    </span>
                    <span className="font-mono font-black text-amber-300 text-sm">50 แต้ม</span>
                  </div>
                  <h4 className="text-sm font-bold text-amber-300">ทานบุฟเฟต์ฟรี 1 ท่าน (149.-)</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    สิทธิพิเศษสูงสุด! แลกรับสิทธิ์ทานบุฟเฟต์ฟรี 1 ท่าน มูลค่า 149 บาท ทันที
                  </p>
                </div>

                <button
                  onClick={() => handleRedeemClick('ทานบุฟเฟต์ฟรี 1 ท่าน (มูลค่า 149.-)', 50)}
                  disabled={activeMember.points < 50}
                  className={`w-full py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMember.points >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 shadow-lg'
                      : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{activeMember.points >= 50 ? 'แลกสิทธิ์ทานฟรี (50 แต้ม)' : 'แต้มไม่พอ (ขาดอีก ' + (50 - activeMember.points) + ')'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active E-Coupons Wallet */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-stone-800">
              <Ticket className="w-4 h-4 text-emerald-400" />
              กระเป๋าคูปองของคุณ (My E-Coupon Wallet)
            </h3>

            {activeMember.coupons && activeMember.coupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMember.coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      coupon.status === 'active'
                        ? 'bg-stone-950 border-emerald-500/50 shadow-md'
                        : 'bg-stone-950/40 border-stone-800/40 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{coupon.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          coupon.status === 'active'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {coupon.status === 'active' ? 'พร้อมใช้งาน' : 'ใช้แล้ว'}
                      </span>
                    </div>

                    <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block">รหัสคูปองแสดงต่อพนักงาน:</span>
                        <span className="font-mono text-amber-300 font-bold text-sm tracking-wider">
                          {coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedCode === coupon.code ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode === coupon.code ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>แลกเมื่อ: {coupon.redeemedAt}</span>
                      <span>หมดอายุ: {coupon.expiresAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 text-center text-xs text-stone-500">
                ยังไม่มีคูปองของรางวัลในกระเป๋า คุณสามารถใช้แต้มสะสมแลกรับคูปองได้ทันทีค่ะ
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: REGISTER NEW MEMBER VIA WEB */}
      {activeTab === 'register' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                สมัครสมาชิกมันนี่คลับผ่านเว็บ (ผูกบัญชี LINE OA)
              </h3>
              <p className="text-xs text-stone-400">
                สมัครฟรีใน 30 วินาที • รับโบนัสแต้มต้อนรับทันที 10 แต้ม + ฟรีน้ำแข็งถังแรกสำหรับ นศ. มช.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              🎁 ฟรี 10 แต้มต้อนรับ
            </span>
          </div>

          {regSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  ชื่อ-นามสกุล / ชื่อเล่น *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น น้องฟ้า หรือ นศ.พ. ธนกฤต"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  เบอร์โทรศัพท์สำหรับสะสมแต้ม *:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08x-xxx-xxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  สิทธิพิเศษ / สังกัด:
                </label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="นักศึกษา มช.">🎓 นักศึกษา มช. (ฟรีน้ำแข็งถังแรก)</option>
                  <option value="บุคลากรทางการแพทย์ (สวนดอก)">🩺 บุคลากรทางการแพทย์ (รพ.มหาราช สวนดอก)</option>
                  <option value="ลูกค้าทั่วไป">ลูกค้าทั่วไป</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  LINE ID (สำหรับรับคูปองและแจ้งเตือนแต้ม):
                </label>
                <input
                  type="text"
                  placeholder="@your_line_id (ไม่บังคับ)"
                  value={regLineId}
                  onChange={(e) => setRegLineId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="p-3 bg-stone-950/80 rounded-xl border border-stone-800 text-xs text-stone-300 space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                ⚡ สิทธิประโยชน์ที่จะได้รับทันที:
              </span>
              <p className="text-stone-400">
                • รับโบนัสแต้มต้อนรับทันที 10 แต้ม (สะสมต่ออีกเพียง 10 แต้มแลกหมูสไลด์พรีเมียมได้เลย)
              </p>
              <p className="text-stone-400">
                • บัตรดิจิทัล E-Card เปิดดูแต้มและประวัติบนเว็บหรือใน LINE OA ได้ตลอด 24 ชั่วโมง
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>ยืนยันสมัครสมาชิก & รับฟรี 10 แต้มต้อนรับ</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 5: LINE OA CHAT & RICH MENU SIMULATOR */}
      {activeTab === 'linemenu' && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                จำลองหน้าต่างแชท LINE Official Account (@moneymookata)
              </h3>
              <p className="text-xs text-stone-400">
                มุมมองริชเมนู (Rich Menu) และการแจ้งเตือนยอดแต้มสะสมอัตโนมัติบนมือถือลูกค้า
              </p>
            </div>
            <span className="text-[11px] bg-emerald-500 text-stone-950 font-bold px-2.5 py-0.5 rounded-full">
              🟢 Official Verified
            </span>
          </div>

          <div className="max-w-md mx-auto bg-stone-950 border-2 border-stone-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            {/* LINE OA Header bar */}
            <div className="bg-emerald-800 p-3.5 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white text-emerald-800 font-black flex items-center justify-center text-sm shadow">
                  M
                </div>
                <div>
                  <div className="font-bold text-xs flex items-center gap-1">
                    มันนี่หมูกระทะ สวนดอก
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <span className="text-[10px] text-emerald-200 font-mono">@moneymookata</span>
                </div>
              </div>
              <span className="text-[10px] text-emerald-200">1.8k ผู้ติดตาม</span>
            </div>

            {/* Chat Body Mockup */}
            <div className="p-4 space-y-3 bg-stone-900/90 min-h-[160px] text-xs">
              <div className="bg-stone-800 text-stone-200 p-3 rounded-2xl rounded-tl-none max-w-xs shadow space-y-1">
                <p className="font-bold text-emerald-400">ยินดีต้อนรับสู่มันนี่หมูกระทะ สวนดอกค่ะ! 🍲</p>
                <p className="text-[11px] text-stone-300">
                  สวัสดีค่ะคุณ <strong>{activeMember.name}</strong> ยอดแต้มสะสมของคุณปัจจุบันคือ <strong>{activeMember.points} แต้ม</strong>
                </p>
                <p className="text-[10px] text-stone-400 pt-1">
                  บุฟเฟต์ 1 หัว = 1 แต้ม (บันทึกอัตโนมัติ) • 20 แต้ม (Tier 1) แลกหมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี) • 35 แต้มลด 50% • 50 แต้มกินฟรี 1 ท่าน
                </p>
              </div>

              <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 p-3 rounded-2xl rounded-tl-none max-w-xs shadow text-[11px] space-y-1">
                <div className="font-bold text-white flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  สิทธิ์แลกของรางวัลของคุณ:
                </div>
                <div>• หมูสไลด์พรีเมียม/ชีสดิป (Tier 1): {activeMember.points >= 20 ? '✅ แลกได้เลย' : `ขาดอีก ${20 - activeMember.points} แต้ม`}</div>
                <div>• บุฟเฟต์ลดครึ่งราคา: {activeMember.points >= 35 ? '✅ แลกได้เลย' : `ขาดอีก ${35 - activeMember.points} แต้ม`}</div>
                <div>• บุฟเฟต์ฟรี 1 ท่าน: {activeMember.points >= 50 ? '🎉 แลกฟรีได้ทันที' : `ขาดอีก ${50 - activeMember.points} แต้ม`}</div>
              </div>
            </div>

            {/* Simulated LINE Rich Menu */}
            <div className="bg-stone-950 p-2 border-t border-stone-800 space-y-1">
              <span className="text-[9px] text-stone-500 block text-center uppercase tracking-wider">
                ▲ LINE RICH MENU @moneymookata
              </span>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <button
                  onClick={() => setActiveTab('card')}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>บัตร E-Card</span>
                </button>
                <button
                  onClick={() => setActiveTab('rules')}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <Coins className="w-4 h-4 text-emerald-400" />
                  <span>กติกาแต้ม (1:1)</span>
                </button>
                <button
                  onClick={() => setActiveTab('redeem')}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <Gift className="w-4 h-4 text-rose-400" />
                  <span>แลกของรางวัล</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('live-queue');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>จองคิวออนไลน์</span>
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-sky-400" />
                  <span>สมัครสมาชิก</span>
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('table-service');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-white font-bold flex flex-col items-center gap-1 border border-stone-800 transition-colors"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>เรียกพนักงาน</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
