import React, { useState } from 'react';
import {
  CreditCard,
  Gift,
  Award,
  Search,
  Plus,
  Sparkles,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Stethoscope,
  Coins,
  ArrowRight,
  Flame,
  Smartphone,
  ShieldCheck,
  UserPlus,
  History,
  Check,
  MessageSquare,
  Ticket,
  ThumbsUp,
  MessageCircle,
  Car,
  Clock,
  Utensils,
} from 'lucide-react';
import { PigIcon } from './PigIcon';
import { Member, MemberCoupon, MemberTransaction, CashierRating } from '../types';
import { calculateCashierRatingStats } from '../data/store';

interface MemberLoyaltyProps {
  members: Member[];
  onAddPoints: (memberId: string, addedPoints: number, newBill: number, desc?: string) => void;
  onAskAi: (prompt: string) => void;
  onRegisterMember?: (newMember: Member) => void;
  onRedeemReward?: (memberId: string, rewardTitle: string, pointsCost: number) => string;
  cashierRatings?: CashierRating[];
  onOpenCashierRating?: (tableId?: string, billAmount?: number) => void;
}

export const MemberLoyalty: React.FC<MemberLoyaltyProps> = ({
  members,
  onAddPoints,
  onAskAi,
  onRegisterMember,
  onRedeemReward,
  cashierRatings = [],
  onOpenCashierRating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(members[0] || null);

  // Cashier ratings filter state
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | 'low'>('all');

  // Compute Cashier CSAT Statistics
  const ratingStats = calculateCashierRatingStats(cashierRatings);

  // Bill point calculator inputs
  const [billAmount, setBillAmount] = useState<number>(596);
  const [paxCount, setPaxCount] = useState<number>(4);

  // Staff feedback toast
  const [staffNotice, setStaffNotice] = useState<string | null>(null);

  // Quick Register Modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemType, setNewMemType] = useState<'นักศึกษา มช.' | 'บุคลากรทางการแพทย์ (สวนดอก)' | 'ลูกค้าทั่วไป'>('นักศึกษา มช.');
  const [newMemLineId, setNewMemLineId] = useState('');

  // Calculate points: บุฟเฟต์ 1 หัว จะได้ 1 คะแนนสะสม
  const pointsEarned = Math.max(1, paxCount);

  // Milestones: Tier 1 หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี), Tier 2 ส่วนลด 15%, Tier 3 กินบุฟเฟต์ฟรี
  const milestones = [
    { points: 10, reward: 'หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)' },
    { points: 35, reward: 'ส่วนลด 15% บิลถัดไปทั้งโต๊ะ' },
    { points: 50, reward: 'ทานบุฟเฟต์ฟรี 1 ท่าน (มูลค่า 149.-)' },
  ];

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.memberCode && m.memberCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Quick preset calculation for buffets
  const handleQuickPax = (heads: number) => {
    setPaxCount(heads);
    setBillAmount(heads * 149);
  };

  const showToast = (msg: string) => {
    setStaffNotice(msg);
    setTimeout(() => setStaffNotice(null), 4000);
  };

  const handleStaffAddPoints = () => {
    if (!selectedMember) return;
    const desc = `พนักงานบันทึกแต้มหน้าร้าน บุฟเฟต์ ${paxCount} หัว ยอด ${billAmount.toLocaleString()}.- (+${pointsEarned} แต้ม)`;
    onAddPoints(selectedMember.id, pointsEarned, billAmount, desc);
    showToast(`✅ บันทึกแต้ม +${pointsEarned} แต้ม (บุฟเฟต์ ${paxCount} หัว) ให้คุณ ${selectedMember.name} เรียบร้อย (ยิงแจ้งเตือน LINE OA สำเร็จ)`);
  };

  const handleStaffRedeem = (rewardTitle: string, pointsCost: number) => {
    if (!selectedMember) return;
    if (selectedMember.points < pointsCost) {
      alert(`แต้มไม่เพียงพอ (ต้องการ ${pointsCost} แต้ม แต่มี ${selectedMember.points} แต้ม)`);
      return;
    }
    if (onRedeemReward) {
      const code = onRedeemReward(selectedMember.id, rewardTitle, pointsCost);
      showToast(`🎉 ตัดแต้มสำเร็จ! รหัสคูปอง ${code} (${rewardTitle}) แจ้งเตือนเข้า LINE OA ของลูกค้าแล้ว`);
    }
  };

  const handleStaffRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemPhone.trim()) return;

    const newCode = `MMK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newMember: Member = {
      id: `MEM-${Date.now().toString().slice(-4)}`,
      name: newMemName.trim(),
      phone: newMemPhone.trim(),
      type: newMemType,
      points: 10,
      totalVisits: 1,
      lastVisit: 'วันนี้',
      lineId: newMemLineId.trim() || `@line_${newMemPhone.slice(-4)}`,
      lineConnected: true,
      memberCode: newCode,
      coupons: [
        {
          id: `CPN-${Date.now()}`,
          code: `WELCOME-${Math.floor(100 + Math.random() * 900)}`,
          title: 'ฟรีน้ำแข็งถังแรก (ต้อนรับสมาชิกใหม่)',
          pointsCost: 0,
          redeemedAt: 'วันนี้',
          expiresAt: 'ใช้ได้ตลอดชีพ',
          status: 'active',
        },
      ],
      transactions: [
        {
          id: `TX-${Date.now()}`,
          type: 'bonus',
          points: 10,
          title: 'โบนัสแต้มต้อนรับสมาชิกใหม่ (สมัครหน้าร้าน)',
          timestamp: 'วันนี้',
        },
      ],
    };

    if (onRegisterMember) {
      onRegisterMember(newMember);
    }
    setSelectedMember(newMember);
    setIsRegisterOpen(false);
    setNewMemName('');
    setNewMemPhone('');
    setNewMemLineId('');
    showToast(`🎉 สมัครสมาชิกสำเร็จ! รหัส ${newCode} คุณ ${newMember.name} ได้รับฟรี 10 แต้มต้อนรับ`);
  };

  const getNextMilestone = (currentPoints: number) => {
    for (const m of milestones) {
      if (currentPoints < m.points) {
        return {
          target: m.points,
          reward: m.reward,
          remaining: m.points - currentPoints,
          isClose: m.points - currentPoints <= 5,
        };
      }
    }
    return {
      target: 50,
      reward: 'รับประทานบุฟเฟต์ฟรี 1 ท่าน',
      remaining: 0,
      isClose: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {staffNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border-2 border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs sm:text-sm font-semibold">{staffNotice}</span>
          <button
            onClick={() => setStaffNotice(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 border-b border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                LINE Official Account Connected
              </span>
              <span className="text-xs text-stone-400 font-mono">@moneymookata</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              โมดูล 4: ระบบสมาชิกและแต้มสะสมผ่าน LINE OA (Member & Loyalty Hub)
            </h2>
            <p className="text-xs text-stone-400">
              ทุก 100 บาท = 1 แต้ม • แจ้งเตือนสิทธิพิเศษล่วงหน้า • ระบบสมาชิกออนไลน์เชื่อมต่อ LINE OA ทันที
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCashierRating && (
              <button
                onClick={() => onOpenCashierRating(selectedMember ? `โต๊ะ 08 (${selectedMember.name})` : 'โต๊ะ 08', billAmount)}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PigIcon className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
                <span>📱 เปิดจอแท็บเล็ตแคชเชียร์ (5 น้องหมู)</span>
              </button>
            )}

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ สมัครสมาชิกใหม่หน้าร้าน</span>
            </button>
            <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              100 บาท = 1 แต้ม
            </span>
          </div>
        </div>

        {/* Milestone Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3">
          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
              <span>🥈 10 แต้ม</span>
              <span className="bg-amber-500/20 text-amber-200 text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
                Tier 1
              </span>
            </div>
            <p className="text-stone-300">หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)</p>
          </div>

          <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
              <span>🥇 35 แต้ม</span>
              <span className="bg-amber-500/20 text-amber-200 text-[10px] px-2 py-0.5 rounded border border-amber-500/30">
                Tier 2
              </span>
            </div>
            <p className="text-stone-300">ส่วนลด 15% สำหรับบิลถัดไปทั้งโต๊ะ</p>
          </div>

          <div className="bg-amber-950/40 border border-amber-700/60 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
              <span>👑 50 แต้ม</span>
              <span className="bg-amber-500 text-stone-950 text-[10px] px-2 py-0.5 rounded font-black">
                ฟรีบุฟเฟต์!
              </span>
            </div>
            <p className="text-amber-100 font-medium">ทานบุฟเฟต์ฟรี 1 ท่านทันที (มูลค่า 149.-)</p>
          </div>
        </div>
      </div>

      {/* Grid: Point Calculator & Member Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bill & Points Calculation Box */}
        <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-stone-800">
            <Coins className="w-4 h-4 text-amber-400" />
            คำนวณแต้มจากยอดบิล (Point Calculator)
          </h3>

          {/* Quick Pax selector */}
          <div>
            <label className="block text-xs text-stone-300 mb-1.5 font-medium">
              จำนวนท่าน (149.-/ท่าน):
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 4, 6, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleQuickPax(n)}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    paxCount === n
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                  }`}
                >
                  {n} คน ({n * 149}.-)
                </button>
              ))}
            </div>
          </div>

          {/* Custom Bill Input */}
          <div>
            <label className="block text-xs text-stone-300 mb-1">
              ยอดบิลสุทธิ (บาท):
            </label>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(Number(e.target.value))}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
            />
          </div>

          {/* Step-by-Step Formula Output */}
          <div className="bg-stone-950 rounded-xl p-4 border border-stone-800">
            <div className="text-[11px] text-stone-400 font-mono mb-1">กติกาการคำนวณแต้มสะสม:</div>
            <div className="text-xs font-mono text-amber-300 font-semibold mb-2">
              บุฟเฟต์ 1 หัว จะได้ 1 คะแนนสะสม
            </div>
            <div className="bg-stone-900 p-3 rounded-lg border border-stone-800 text-xs font-mono">
              <div className="text-stone-300">
                จำนวนหัวบุฟเฟต์ที่ทาน = {paxCount} หัว
              </div>
              <div className="text-lg font-black text-amber-400 mt-1">
                = {pointsEarned} แต้ม
                <span className="text-xs text-stone-400 font-normal ml-2">
                  (1 ท่าน = 1 คะแนนสะสม)
                </span>
              </div>
            </div>
          </div>

          {/* Add to Selected Member Action */}
          {selectedMember ? (
            <div className="space-y-2">
              <button
                onClick={handleStaffAddPoints}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-amber-600 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 text-stone-950" />
                <span>
                  บันทึกแต้ม +{pointsEarned} แต้ม ให้ {selectedMember.name} (แจ้งเข้า LINE OA)
                </span>
              </button>

              {onOpenCashierRating && (
                <button
                  type="button"
                  onClick={() => onOpenCashierRating(`โต๊ะ 08 (${selectedMember.name})`, billAmount)}
                  className="w-full py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 hover:text-white border border-amber-500/40 font-bold text-xs shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <PigIcon className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  <span>🐷 เปิดจอแท็บเล็ตให้ลูกค้าโต๊ะนี้ประเมิน 5 หมูที่แคชเชียร์</span>
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-center text-xs text-stone-400">
              กรุณาเลือกสมาชิกในตารางด้านขวาเพื่อบันทึกแต้ม
            </div>
          )}
        </div>

        {/* Member Directory & Proactive Notification Card */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                ค้นหาสมาชิก LINE OA & ตรวจสอบสิทธิพิเศษ
              </h3>
              <span className="text-xs text-stone-400 font-mono">
                {filteredMembers.length} สมาชิก
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาด้วยชื่อ, เบอร์โทร, รหัสสมาชิก หรือคณะ..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Members Quick List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredMembers.map((m) => {
                const isSelected = selectedMember?.id === m.id;
                const next = getNextMilestone(m.points);

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/70 shadow-md'
                        : 'bg-stone-950/60 border-stone-800 hover:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {m.type.includes('แพทย์') ? (
                          <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                        ) : m.type.includes('นักศึกษา') ? (
                          <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                        ) : null}
                        <span>{m.name}</span>
                        {m.lineConnected && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            LINE
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {m.points} แต้ม
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-stone-400">
                      <span>{m.phone} • {m.memberCode || m.id} • {m.type}</span>
                      {next.isClose && (
                        <span className="text-red-400 font-bold animate-pulse">
                          ⚡ ขาดอีก {next.remaining} แต้ม!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Member Detail & Staff Proactive Alert */}
          {selectedMember && (
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
              {(() => {
                const next = getNextMilestone(selectedMember.points);

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{selectedMember.name}</span>
                          <span className="text-[11px] text-emerald-400 font-mono font-normal">
                            ({selectedMember.lineId || '@line_oa'})
                          </span>
                        </div>
                        <div className="text-xs text-stone-400">
                          {selectedMember.type} • มาแล้ว {selectedMember.totalVisits} ครั้ง • รหัส: <strong className="text-stone-300 font-mono">{selectedMember.memberCode || selectedMember.id}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-stone-400 block">แต้มปัจจุบัน</span>
                        <span className="text-xl font-black text-amber-400 font-mono">
                          {selectedMember.points} แต้ม
                        </span>
                      </div>
                    </div>

                    {/* Progress to next tier */}
                    <div>
                      <div className="flex justify-between text-xs text-stone-300 mb-1">
                        <span>เป้าหมายถัดไป: {next.target} แต้ม ({next.reward})</span>
                        <span className="font-bold text-amber-400">
                          {Math.min(Math.round((selectedMember.points / next.target) * 100), 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-500"
                          style={{
                            width: `${Math.min((selectedMember.points / next.target) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Proactive Staff Prompt Banner */}
                    {next.isClose ? (
                      <div className="bg-red-950/40 border border-red-500/60 p-3 rounded-xl text-xs text-red-200">
                        <div className="font-bold flex items-center gap-1.5 text-red-300 mb-1">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          <span>เตือนพนักงานหน้างาน: ลูกค้าใกล้ถึงสิทธิ์รับรางวัลแล้ว!</span>
                        </div>
                        <p className="text-stone-300">
                          คุณ {selectedMember.name} ขาดอีกเพียง <strong>{next.remaining} แต้ม</strong> จะได้รับสิทธิ์ <em>"{next.reward}"</em> พนักงานควรแจ้งชวนสะสมเพิ่มในบิลนี้ทันทีค่ะ
                        </p>
                      </div>
                    ) : (
                      <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-xs text-stone-300">
                        <span>สิทธิ์พิเศษประจำย่านสวนดอก: แสดงบัตรนักศึกษา มช. หรือบัตรบุคลากร รพ.มหาราช รับฟรีน้ำแข็งถังแรก</span>
                      </div>
                    )}

                    {/* Quick Staff Cut Points / Redeem Buttons */}
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                      <span className="text-[11px] font-bold text-amber-300 block">
                        🎁 พนักงานตัดแต้มแลกสิทธิ์:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStaffRedeem('หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)', 10)}
                          disabled={selectedMember.points < 10}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            selectedMember.points >= 10
                              ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40'
                              : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          หมูสไลด์/ชีสดิป (10 pts)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStaffRedeem('ส่วนลดบุฟเฟต์ครึ่งราคา (ลด 50%)', 35)}
                          disabled={selectedMember.points < 35}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            selectedMember.points >= 35
                              ? 'bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40'
                              : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          ลดครึ่งราคา (35 pts)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStaffRedeem('กินบุฟเฟต์ฟรี 1 ท่าน (149.-)', 50)}
                          disabled={selectedMember.points < 50}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                            selectedMember.points >= 50
                              ? 'bg-amber-500 text-stone-950 shadow'
                              : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed'
                          }`}
                        >
                          บุฟเฟต์ฟรี (50 pts)
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onAskAi(
                          `ลูกค้าชื่อ ${selectedMember.name} (${selectedMember.type}) มีแต้มปัจจุบัน ${selectedMember.points} แต้ม ขาดอีกกี่แต้มถึงจะได้กินฟรี 50 แต้ม และมีสิทธิ์อะไรแนะนำลูกค้าบ้าง`
                        )
                      }
                      className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>ให้น้องมันนี่แนะนำสิทธิประโยชน์</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* SERVICE SATISFACTION 5-PIG RATING SYSTEM (ระบบประเมินความพึงพอใจบริการ) */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1.5">
                <span>🐷</span>
                CUSTOMER SATISFACTION RATING
              </span>
              <span className="text-xs text-stone-400">ระบบประเมินความพึงพอใจ 5 ด้าน (5 น้องหมู 🐷)</span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
              <span>ระบบให้คะแนนความพึงพอใจการบริการ (เรทเต็ม 5 ด้าน)</span>
            </h3>
            <p className="text-xs text-stone-300">
              ลูกค้าประเมิน 5 ด้าน (การจอดรถ, การจองคิว, การรอคิว, บริการในร้าน, การชำระเงิน พร้อมคำถามย่อยด้านละ 3 ข้อ) • รับโบนัสสะสมแต้ม LINE OA +1 แต้ม
            </p>
          </div>

          {onOpenCashierRating && (
            <button
              onClick={() => onOpenCashierRating(selectedMember ? `โต๊ะ 08 (${selectedMember.name})` : 'โต๊ะ 08', billAmount)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/50 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>🐷</span>
              <span>เปิดจอให้คะแนนความพึงพอใจ</span>
            </button>
          )}
        </div>

        {/* 4 Summary Scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-stone-400 block">คะแนนความพึงพอใจเฉลี่ย</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">
                {ratingStats.averageRating}
              </span>
              <span className="text-xs text-stone-400">/ 5.0 น้องหมู 🐷</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`text-sm ${
                    i <= Math.round(ratingStats.averageRating)
                      ? 'drop-shadow-[0_1px_4px_rgba(244,114,182,0.6)] filter-none'
                      : 'opacity-25 grayscale'
                  }`}
                >
                  🐷
                </span>
              ))}
            </div>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-stone-400 block">อัตราพึงพอใจรวม (CSAT)</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">
              {ratingStats.satisfactionRate}%
            </div>
            <p className="text-[11px] text-stone-400">
              ลูกค้าให้ 4 และ 5 น้องหมู
            </p>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-stone-400 block">จำนวนคำประเมินทั้งหมด</span>
            <div className="text-2xl sm:text-3xl font-black text-white">
              {ratingStats.totalRatings} <span className="text-xs font-normal text-stone-400">รีวิว</span>
            </div>
            <p className="text-[11px] text-stone-400">
              บันทึกตรงหน้าเคาน์เตอร์แคชเชียร์
            </p>
          </div>

          <div className="bg-stone-950/80 border border-stone-800 p-4 rounded-2xl space-y-1">
            <span className="text-xs text-stone-400 block">โบนัสแต้มแจกสะสม LINE OA</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              +{cashierRatings.reduce((sum, r) => sum + (r.bonusPointsAwarded || 0), 0)} <span className="text-xs font-normal text-stone-400">แต้ม</span>
            </div>
            <p className="text-[11px] text-emerald-400">
              ฟรี +1 แต้ม ทุกการประเมิน
            </p>
          </div>
        </div>

        {/* 5 Rating Categories Breakdown Box */}
        <div className="bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-850 pb-2">
            <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
              <PigIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>คะแนนเฉลี่ยแยกตาม 5 หัวข้อประเมินการบริการ:</span>
            </h4>
            <span className="text-[11px] text-amber-300 font-mono">
              เกณฑ์คะแนนเต็ม 5.0 น้องหมู
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. การจอดรถ */}
            <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-sky-400" />
                  <span>การจอดรถ</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {ratingStats.categoryAverages.parking} ⭐
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(ratingStats.categoryAverages.parking / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 2. การจองคิว */}
            <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-amber-400" />
                  <span>การจองคิว</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {ratingStats.categoryAverages.booking} ⭐
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(ratingStats.categoryAverages.booking / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 3. การรอคิว */}
            <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>การรอคิว</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {ratingStats.categoryAverages.waiting} ⭐
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${(ratingStats.categoryAverages.waiting / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. บริการภายในร้าน */}
            <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>บริการในร้าน</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {ratingStats.categoryAverages.service} ⭐
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(ratingStats.categoryAverages.service / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 5. การชำระเงิน */}
            <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-rose-400" />
                  <span>การชำระเงิน</span>
                </span>
                <span className="font-mono font-black text-amber-400 text-xs">
                  {ratingStats.categoryAverages.payment} ⭐
                </span>
              </div>
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${(ratingStats.categoryAverages.payment / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mid-Row: Star Breakdown & Cashier On-Duty Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Star Breakdown Bars */}
          <div className="lg:col-span-6 bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
              <span>สัดส่วนคะแนนความพึงพอใจ (1 - 5 น้องหมู):</span>
              <span className="text-[11px] text-stone-400 font-normal">รวม {ratingStats.totalRatings} คำประเมิน</span>
            </h4>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = ratingStats.starsCount[s as 5 | 4 | 3 | 2 | 1];
                const pct = ratingStats.totalRatings > 0 ? Math.round((count / ratingStats.totalRatings) * 100) : 0;
                return (
                  <div key={s} className="flex items-center gap-2.5 text-xs">
                    <span className="w-12 text-stone-300 flex items-center gap-1 font-mono">
                      <span>{s}</span>
                      <PigIcon className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 h-3 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          s === 5
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : s === 4
                            ? 'bg-emerald-500'
                            : s === 3
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-16 text-right text-stone-400 font-mono text-[11px]">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cashier Staff Leaderboard */}
          <div className="lg:col-span-6 bg-stone-950 p-4 sm:p-5 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-stone-200 flex items-center justify-between">
              <span>คะแนนเฉลี่ยพนักงานแคชเชียร์ประจำกะ:</span>
              <span className="text-[11px] text-emerald-400 font-bold">● กำลังปฏิบัติหน้าที่</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                    ก
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">แคชเชียร์กวาง (กะบ่าย-ค่ำ)</div>
                    <span className="text-[11px] text-stone-400">จุดเด่น: คิดเงินไว ยิ้มแย้ม แนะนำโปรนักศึกษา มช.</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-amber-400 text-sm">4.9 ⭐</span>
                  <span className="block text-[10px] text-stone-400">142 รีวิว</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    บ
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">แคชเชียร์บอย (หัวหน้ากะ)</div>
                    <span className="text-[11px] text-stone-400">จุดเด่น: ประสานงานไว แก้ไขปัญหาโต๊ะฉับไว</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-amber-400 text-sm">4.8 ⭐</span>
                  <span className="block text-[10px] text-stone-400">118 รีวิว</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-xs">
                    น
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">แคชเชียร์แนน (กะค่ำ)</div>
                    <span className="text-[11px] text-stone-400">จุดเด่น: สุภาพ ละเอียดเรื่องแต้มและสิทธิพิเศษ</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-amber-400 text-sm">4.7 ⭐</span>
                  <span className="block text-[10px] text-stone-400">82 รีวิว</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Ratings Stream & Filter */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>ประวัติการให้คะแนนสด (Live Reviews Feed)</span>
            </h4>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setRatingFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ratingFilter === 'all'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                ทั้งหมด ({cashierRatings.length})
              </button>
              <button
                type="button"
                onClick={() => setRatingFilter('5')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ratingFilter === '5'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                5 น้องหมู ({ratingStats.starsCount[5]})
              </button>
              <button
                type="button"
                onClick={() => setRatingFilter('low')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ratingFilter === 'low'
                    ? 'bg-red-600 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                เคส 1-2 หมู ({ratingStats.starsCount[1] + ratingStats.starsCount[2]})
              </button>
            </div>
          </div>

          {/* Ratings Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {cashierRatings
              .filter((r) => {
                if (ratingFilter === '5') return r.stars === 5;
                if (ratingFilter === 'low') return r.stars <= 2;
                return true;
              })
              .map((r) => {
                const isUrgent = r.stars <= 2;
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all ${
                      isUrgent
                        ? 'bg-red-950/30 border-red-500/60 shadow-md'
                        : 'bg-stone-950/80 border-stone-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{r.customerName || 'ลูกค้าหน้าร้าน'}</span>
                          <span className="text-[10px] text-stone-400">({r.tableId})</span>
                          {r.bonusPointsAwarded ? (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              +1 แต้ม
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {r.cashierStaff} • {r.billAmount ? `${r.billAmount.toLocaleString()} ฿` : ''} • {r.timestamp}
                        </div>
                      </div>

                      {/* Stars -> Pigs */}
                      <div className="flex items-center gap-0.5 bg-stone-900 px-2 py-1 rounded-lg border border-stone-800">
                        {Array.from({ length: 5 }, (_, i) => (
                          <PigIcon
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < r.stars
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-stone-800 text-stone-700'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-amber-300 ml-1">
                          {r.stars}.0
                        </span>
                      </div>
                    </div>

                    {/* Tags */}
                    {r.categoryTags && r.categoryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {r.categoryTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border ${
                              isUrgent
                                ? 'bg-red-950/60 border-red-500/40 text-red-200'
                                : 'bg-stone-900 border-stone-800 text-stone-300'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment */}
                    {r.comment && (
                      <p className="text-[11px] text-stone-300 italic bg-stone-900/60 p-2 rounded-xl border border-stone-850">
                        "{r.comment}"
                      </p>
                    )}

                    {/* 5-Category Breakdown Pills */}
                    {r.categoryRatings && (
                      <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-stone-850 text-[10px] text-stone-400 text-center">
                        <div className="bg-stone-900/90 rounded p-1">
                          <span className="block text-[9px] text-stone-500">จอดรถ</span>
                          <span className="font-bold text-amber-400 font-mono">{r.categoryRatings.parking}⭐</span>
                        </div>
                        <div className="bg-stone-900/90 rounded p-1">
                          <span className="block text-[9px] text-stone-500">จองคิว</span>
                          <span className="font-bold text-amber-400 font-mono">{r.categoryRatings.booking}⭐</span>
                        </div>
                        <div className="bg-stone-900/90 rounded p-1">
                          <span className="block text-[9px] text-stone-500">รอคิว</span>
                          <span className="font-bold text-amber-400 font-mono">{r.categoryRatings.waiting}⭐</span>
                        </div>
                        <div className="bg-stone-900/90 rounded p-1">
                          <span className="block text-[9px] text-stone-500">บริการ</span>
                          <span className="font-bold text-amber-400 font-mono">{r.categoryRatings.service}⭐</span>
                        </div>
                        <div className="bg-stone-900/90 rounded p-1">
                          <span className="block text-[9px] text-stone-500">ชำระเงิน</span>
                          <span className="font-bold text-amber-400 font-mono">{r.categoryRatings.payment}⭐</span>
                        </div>
                      </div>
                    )}

                    {/* Status Note for Low Rating */}
                    {isUrgent && (
                      <div className="flex items-center justify-between text-[11px] bg-red-950/70 text-red-200 px-2.5 py-1.5 rounded-xl border border-red-500/40 font-semibold">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                          <span>เชื่อมต่อ Apology Protocol: แจ้งผู้จัดการนุ่นแล้ว</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Staff Register New Member Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                สมัครสมาชิกใหม่หน้าร้าน (ผูก LINE OA)
              </h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-stone-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStaffRegister} className="space-y-3">
              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  ชื่อ-นามสกุล / ชื่อเล่น *:
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คุณกานต์ หรือ นศ.พ. วรัญญา"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  เบอร์โทรศัพท์ *:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08x-xxx-xxxx"
                  value={newMemPhone}
                  onChange={(e) => setNewMemPhone(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  สิทธิพิเศษ / สังกัด:
                </label>
                <select
                  value={newMemType}
                  onChange={(e) => setNewMemType(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                >
                  <option value="นักศึกษา มช.">🎓 นักศึกษา มช. (ฟรีน้ำแข็งถังแรก)</option>
                  <option value="บุคลากรทางการแพทย์ (สวนดอก)">🩺 บุคลากรทางการแพทย์ (รพ.มหาราช)</option>
                  <option value="ลูกค้าทั่วไป">ลูกค้าทั่วไป</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  LINE ID (ถ้ามี):
                </label>
                <input
                  type="text"
                  placeholder="@line_user"
                  value={newMemLineId}
                  onChange={(e) => setNewMemLineId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300">
                🎁 สมาชิกใหม่จะได้รับ <strong>10 แต้มต้อนรับทันที</strong> พร้อมรหัสสมาชิกดิจิทัลเชื่อมต่อ LINE OA
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  ยืนยันบันทึกสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
