import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  AlertOctagon,
  CheckCircle,
  Plus,
  Phone,
  Sparkles,
  Volume2,
  Ticket,
  UserCheck,
  Ban,
  ArrowRight,
} from 'lucide-react';
import { QueueData, QueueTicket } from '../types';

interface QueueManagerProps {
  queueData: QueueData;
  onUpdateQueue: (updated: Partial<QueueData>) => void;
  onAskAi: (prompt: string) => void;
}

export const QueueManager: React.FC<QueueManagerProps> = ({
  queueData,
  onUpdateQueue,
  onAskAi,
}) => {
  const [waitingTables, setWaitingTables] = useState<number>(queueData.waitingTables);
  const [openTablesPerRound, setOpenTablesPerRound] = useState<number>(queueData.openTablesPerRound);
  const turnoverTime = 45; // 45 minutes fixed standard

  // New ticket state
  const [customerName, setCustomerName] = useState('');
  const [pax, setPax] = useState(4);
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<'Normal' | 'Student' | 'MedicalStaff'>('Student');
  const [tickets, setTickets] = useState<QueueTicket[]>(queueData.tickets);

  useEffect(() => {
    setTickets(queueData.tickets);
    setWaitingTables(queueData.waitingTables);
    setOpenTablesPerRound(queueData.openTablesPerRound);
  }, [queueData]);

  // Calculation: [จำนวนโต๊ะที่รอ × 45 นาที ÷ จำนวนโต๊ะที่ว่างต่อรอบ]
  const estimatedWaitTime =
    openTablesPerRound > 0 ? Math.round((waitingTables * turnoverTime) / openTablesPerRound) : 0;

  const shouldStopWalkIn = estimatedWaitTime > 30;

  const handleRecalculate = (newWaiting: number, newOpen: number) => {
    setWaitingTables(newWaiting);
    setOpenTablesPerRound(newOpen);
    const newWait = newOpen > 0 ? Math.round((newWaiting * turnoverTime) / newOpen) : 0;
    onUpdateQueue({
      waitingTables: newWaiting,
      openTablesPerRound: newOpen,
      estimatedWaitTime: newWait,
      shouldStopWalkIn: newWait > 30,
    });
  };

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newTicket: QueueTicket = {
      id: `Q-${Date.now()}`,
      ticketNo: `A${String(tickets.length + 10).padStart(2, '0')}`,
      customerName: customerName.trim(),
      pax,
      phone: phone.trim() || '08x-xxx-xxxx',
      category,
      status: 'Waiting',
      createdAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      estimatedWaitMin: estimatedWaitTime,
    };

    const updated = [newTicket, ...tickets];
    setTickets(updated);
    onUpdateQueue({ tickets: updated });
    handleRecalculate(waitingTables + 1, openTablesPerRound);
    setCustomerName('');
    setPhone('');
  };

  const handleTicketStatus = (id: string, newStatus: 'Called' | 'Seated' | 'Cancelled') => {
    const updated = tickets.map((t) => (t.id === id ? { ...t, status: newStatus } : t));
    setTickets(updated);
    onUpdateQueue({ tickets: updated });
    if (newStatus === 'Seated' || newStatus === 'Cancelled') {
      handleRecalculate(Math.max(waitingTables - 1, 0), openTablesPerRound);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              โมดูล 3: ระบบคำนวณคิวและควบคุม Walk-in (Queue Engine)
            </h2>
            <p className="text-xs text-stone-400">
              หมุนเวียนเฉลี่ย 45 นาที/รอบ • แนะนำหยุดรับคิว Walk-in ชั่วคราวเมื่อเวลารอเกิน 30 นาที
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
              shouldStopWalkIn
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {shouldStopWalkIn ? '🛑 แนะนำหยุดรับ Walk-in ชั่วคราว' : '✅ รับ Walk-in ได้ตามปกติ'}
          </span>
        </div>

        {/* Core Formula Display Box */}
        <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs">
          <div className="text-stone-400 font-mono mb-1">สูตรคำนวณเวลารอเฉลี่ยมาตรฐาน:</div>
          <div className="text-amber-300 font-mono font-bold text-sm sm:text-base">
            เวลารอเฉลี่ย (นาที) = [จำนวนโต๊ะที่รอ × เวลาหมุนเวียนเฉลี่ย 45 นาที ÷ จำนวนโต๊ะที่ว่างต่อรอบ]
          </div>
        </div>
      </div>

      {/* Main Calculation & Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Card */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-stone-800">
            <Users className="w-4 h-4 text-amber-400" />
            ตัวแปรคำนวณคิวหน้าร้าน
          </h3>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1.5">
              <span>จำนวนโต๊ะที่รอขณะนี้:</span>
              <span className="font-bold text-amber-400 font-mono text-sm">{waitingTables} โต๊ะ</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="20"
                value={waitingTables}
                onChange={(e) => handleRecalculate(Number(e.target.value), openTablesPerRound)}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="w-12 text-center text-xs font-mono bg-stone-950 px-2 py-1 rounded border border-stone-800 text-white">
                {waitingTables}
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-300 mb-1.5">
              <span>จำนวนโต๊ะที่ว่างต่อรอบ (ปล่อยโต๊ะ):</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">{openTablesPerRound} โต๊ะ/รอบ</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                value={openTablesPerRound}
                onChange={(e) => handleRecalculate(waitingTables, Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="w-12 text-center text-xs font-mono bg-stone-950 px-2 py-1 rounded border border-stone-800 text-white">
                {openTablesPerRound}
              </span>
            </div>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800 text-xs space-y-1">
            <div className="flex justify-between text-stone-400">
              <span>เวลาหมุนเวียนเฉลี่ยมาตรฐาน:</span>
              <span className="font-mono text-white">45 นาที / โต๊ะ</span>
            </div>
            <div className="flex justify-between text-stone-400">
              <span>เกณฑ์ควบคุม Walk-in สูงสุด:</span>
              <span className="font-mono text-amber-400">ห้ามเกิน 30 นาที</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="pt-2">
            <span className="text-[11px] text-stone-400 font-medium block mb-1.5">
              สถานการณ์จำลองช่วงพีค (นศ.เลิกเรียน / รพ.เปลี่ยนเวร):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleRecalculate(3, 3)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors cursor-pointer text-left"
              >
                <div className="font-bold text-white">16:30 น. เริ่มเปิดร้าน</div>
                <div className="text-[10px] text-stone-400">รอ 3 โต๊ะ ว่าง 3 โต๊ะ (45 นาที)</div>
              </button>
              <button
                onClick={() => handleRecalculate(8, 2)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-red-300 border border-red-900/50 transition-colors cursor-pointer text-left"
              >
                <div className="font-bold text-red-400">18:30 น. ช่วงพีคสูงสุด</div>
                <div className="text-[10px] text-stone-400">รอ 8 โต๊ะ ว่าง 2 โต๊ะ (180 นาที!)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Math Output & Decision Box */}
        <div className="lg:col-span-7 space-y-4">
          {/* Big Wait Time Dial */}
          <div
            className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between transition-all ${
              shouldStopWalkIn
                ? 'bg-gradient-to-br from-red-950/40 via-stone-900 to-red-950/30 border-red-600/70'
                : 'bg-stone-900 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
              <span className="text-xs text-stone-400 font-medium">ผลการคำนวณเวลารอเฉลี่ย (Live Wait Time)</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  shouldStopWalkIn
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {shouldStopWalkIn ? '🛑 เกินเกณฑ์ 30 นาที' : '✅ ภายในเกณฑ์ปกติ'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white mb-1">
                  {estimatedWaitTime} <span className="text-lg sm:text-xl font-normal text-stone-400">นาที</span>
                </div>
                <p className="text-xs text-stone-400">
                  {estimatedWaitTime > 60
                    ? `(ประมาณ ${Math.floor(estimatedWaitTime / 60)} ชั่วโมง ${estimatedWaitTime % 60} นาที)`
                    : 'ลูกค้ารอไม่นานมาก'}
                </p>
              </div>

              {/* Step-by-Step Calculation Breakdown */}
              <div className="bg-stone-950/90 p-3 rounded-xl border border-stone-800 text-xs font-mono space-y-1">
                <span className="text-stone-400 block font-sans font-medium text-[11px]">
                  วิธีคิดตามสูตรร้าน:
                </span>
                <div className="text-stone-300">
                  = [{waitingTables} โต๊ะรอ × 45 นาที] ÷ {openTablesPerRound} โต๊ะว่าง
                </div>
                <div className="text-stone-300">
                  = {waitingTables * 45} ÷ {openTablesPerRound}
                </div>
                <div className="text-amber-400 font-bold text-sm">
                  = {estimatedWaitTime} นาที
                </div>
              </div>
            </div>

            {/* Recommendation Alert Box */}
            <div className="mt-4 pt-3 border-t border-white/10">
              {shouldStopWalkIn ? (
                <div className="bg-red-900/40 border border-red-500/60 p-3.5 rounded-xl text-xs text-red-200 space-y-1">
                  <div className="font-bold flex items-center gap-2 text-red-300 text-sm">
                    <AlertOctagon className="w-4 h-4 text-red-400" />
                    🛑 มาตรการหน้าร้าน: แนะนำหยุดรับคิว Walk-in ชั่วคราวทันที!
                  </div>
                  <p className="text-red-100/90">
                    เวลารอเฉลี่ย ({estimatedWaitTime} นาที) สูงเกินเกณฑ์ 30 นาที ให้พนักงานหน้าร้านแจ้งลูกค้าแนะนำสแกนจองผ่าน LINE OA หรือกลับมาใหม่ในรอบถัดไป เพื่อป้องกันลูกค้ารอนานและไม่พึงพอใจ
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-950/40 border border-emerald-600/50 p-3.5 rounded-xl text-xs text-emerald-200">
                  <div className="font-bold flex items-center gap-2 text-emerald-300 text-sm mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    เปิดรับ Walk-in ได้ต่อเนื่อง
                  </div>
                  <p className="text-emerald-100/90">
                    เวลารอเฉลี่ยอยู่ในเกณฑ์ดี ({estimatedWaitTime} นาที ≤ 30 นาที) สามารถแจกบัตรคิวและแนะนำลูกค้านั่งรอในจุดรับรองได้เลย
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                onAskAi(
                  `ตอนนี้คิวรอ ${waitingTables} โต๊ะ โต๊ะว่างเฉลี่ยรอบละ ${openTablesPerRound} โต๊ะ คำนวณได้ ${estimatedWaitTime} นาที ขอคำแนะนำสคริปต์พูดแจ้งลูกค้าหน้าร้าน`
                )
              }
              className="mt-4 w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ขอสคริปต์พูดแจ้งคิวลูกค้าจากน้องมันนี่</span>
            </button>
          </div>
        </div>
      </div>

        {/* Queue Ticket Issuing & Live List */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            ตารางคิวลูกค้าหน้าร้าน (Active Queue List)
          </h3>
          <span className="text-xs text-stone-400">
            รอเรียก {tickets.filter((t) => t.status === 'Waiting').length} คิว
          </span>
        </div>

        {/* Add Ticket Form */}
        <form onSubmit={handleAddTicket} className="mb-6 p-4 rounded-xl bg-stone-950/70 border border-stone-800">
          <span className="text-xs font-semibold text-stone-300 block mb-2">
            ออกบัตรคิวใหม่หน้าร้าน:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="ชื่อลูกค้า / คณะ / หน่วยงาน"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
            />
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-700 rounded-xl px-3 py-1 text-xs">
              <span className="text-stone-400">จำนวน:</span>
              <select
                value={pax}
                onChange={(e) => setPax(Number(e.target.value))}
                className="bg-transparent text-white outline-none font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n} className="bg-stone-900">
                    {n} ท่าน
                  </option>
                ))}
              </select>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
            >
              <option value="Student">🎓 นักศึกษา มช. (ฟรีน้ำแข็งถังแรก)</option>
              <option value="MedicalStaff">🩺 บุคลากร รพ.มหาราช (สวนดอก)</option>
              <option value="Normal">ลูกค้าทั่วไป</option>
            </select>
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>พิมพ์บัตรคิว</span>
            </button>
          </div>
        </form>

        {/* Tickets List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tickets.map((t, idx) => {
            // Count waiting tickets ahead
            const waitingAhead = tickets.slice(0, idx).filter((other) => other.status === 'Waiting').length;
            const waitTime = waitingAhead > 0
              ? Math.round((waitingAhead * 45) / Math.max(openTablesPerRound, 1))
              : t.estimatedWaitMin;

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  t.status === 'Waiting'
                    ? 'bg-stone-950/80 border-stone-800'
                    : t.status === 'Called'
                    ? 'bg-amber-950/30 border-amber-600/60'
                    : 'bg-stone-950/40 border-stone-800/40 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-stone-400">คิว</span>
                    <span className="font-mono text-base font-black text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                      {t.ticketNo}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                      t.status === 'Waiting'
                        ? 'bg-stone-800 text-stone-300'
                        : t.status === 'Called'
                        ? 'bg-amber-500 text-stone-950 animate-bounce'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {t.status === 'Waiting' ? 'กำลังรอ' : t.status === 'Called' ? 'กำลังเรียก!' : 'เข้าโต๊ะแล้ว'}
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-2">{t.customerName}</div>

                {/* The 4 core details */}
                <div className="grid grid-cols-3 gap-1.5 p-2 bg-stone-900/90 rounded-lg border border-stone-850 text-center mb-2 text-[10px]">
                  <div>
                    <span className="text-stone-500 block">คิวก่อนหน้า</span>
                    <span className="font-bold text-white font-mono">
                      {t.status === 'Waiting' ? `${waitingAhead} คิว` : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">เวลารอประมาณ</span>
                    <span className="font-bold text-amber-400 font-mono">
                      ~{waitTime} นาที
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">คนในโต๊ะ</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {t.pax} คน
                    </span>
                  </div>
                </div>

              {t.status === 'Waiting' && (
                <div className="flex items-center gap-2 pt-2 border-t border-stone-800 text-xs">
                  <button
                    onClick={() => handleTicketStatus(t.id, 'Called')}
                    className="flex-1 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-colors cursor-pointer text-center"
                  >
                    กดเรียกคิว
                  </button>
                  <button
                    onClick={() => handleTicketStatus(t.id, 'Seated')}
                    className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer text-center"
                  >
                    เข้าโต๊ะ
                  </button>
                </div>
              )}

              {t.status === 'Called' && (
                <div className="flex items-center gap-2 pt-2 border-t border-amber-800/40 text-xs">
                  <button
                    onClick={() => handleTicketStatus(t.id, 'Seated')}
                    className="w-full py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer text-center"
                  >
                    ยืนยันพาลูกค้าเข้าโต๊ะ
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
