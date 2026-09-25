import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Bell,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Radio,
  FileCode2,
  UserCheck,
  ArrowRight,
  Flame,
  Ticket,
} from 'lucide-react';
import { Incident, IncidentCategory, ApologyLevel } from '../types';

interface IncidentHubProps {
  incidents: Incident[];
  onAddIncident: (incident: Incident) => void;
  onUpdateStatus: (id: string, status: 'Pending' | 'Escalated' | 'Resolved') => void;
}

export const IncidentHub: React.FC<IncidentHubProps> = ({
  incidents,
  onAddIncident,
  onUpdateStatus,
}) => {
  const [tableId, setTableId] = useState('โต๊ะ 14');
  const [issueType, setIssueType] = useState<IncidentCategory>('ลูกค้าเรียกซ้ำเกิน 2 ครั้ง');
  const [repeatCalls, setRepeatCalls] = useState(3);
  const [detail, setDetail] = useState('');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [copiedJsonId, setCopiedJsonId] = useState<string | null>(null);
  const [simulatedN8nLoading, setSimulatedN8nLoading] = useState(false);
  const [n8nSentSuccess, setN8nSentSuccess] = useState<string | null>(null);

  // Auto determine apology level and responsible based on Robinson 2019
  const determineLevel = (
    type: IncidentCategory,
    calls: number,
    text: string
  ): { level: ApologyLevel; responsible: string; isUrgent: boolean } => {
    const lower = text.toLowerCase();
    if (
      type === 'ความปลอดภัยอาหาร' ||
      lower.includes('เส้นผม') ||
      lower.includes('แมลง') ||
      lower.includes('สิ่งแปลกปลอม') ||
      lower.includes('บูด') ||
      lower.includes('เน่า') ||
      lower.includes('ความปลอดภัย')
    ) {
      return { level: 'Level 1', responsible: 'ผู้จัดการนุ่น (081-445-5678)', isUrgent: true };
    }
    if (calls > 2 || type === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง') {
      return { level: 'Level 2', responsible: 'หัวหน้ากะบอย (089-998-8123)', isUrgent: true };
    }
    if (type === 'เตาแก๊ส/แก๊สกระป๋องมีปัญหา') {
      return { level: 'Level 3', responsible: 'พนักงานบริการ & ตรวจระบบเตาแก๊ส', isUrgent: false };
    }
    if (type === 'ขอเปลี่ยนกระทะ') {
      return { level: 'Level 4', responsible: 'พนักงานบริการประจำโซน', isUrgent: false };
    }
    if (type === 'คิวล้น' || type === 'วัตถุดิบหมด') {
      return { level: 'Level 3', responsible: 'หัวหน้ากะแนน (084-222-3344)', isUrgent: false };
    }
    if (type === 'อุปกรณ์ชำรุด') {
      return { level: 'Level 3', responsible: 'หัวหน้ากะบอย (089-998-8123)', isUrgent: false };
    }
    return { level: 'Level 4', responsible: 'พนักงานหน้างานกะบ่าย/ดึก', isUrgent: false };
  };

  const preview = determineLevel(issueType, repeatCalls, detail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isUrgent = preview.isUrgent;
    const needN8n = repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง';

    const n8nPayload = needN8n
      ? {
          table_id: tableId,
          issue_type: 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
          severity_level: preview.level,
          timestamp: new Date().toISOString(),
          action_required: 'ส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที',
        }
      : null;

    let apologyScript = '';
    let serviceRecovery = '';

    if (preview.level === 'Level 1') {
      apologyScript = `(ผู้จัดการนุ่นเข้าพบลูกค้าทันที): "กราบขออภัยคุณลูกค้า${tableId}อย่างสูงยิ่งนะคะ ทางร้านมันนี่หมูกระทะให้ความสำคัญสูงสุดกับความสะอาดและปลอดภัย ทางเราขอนำจานนี้ไปตรวจสอบทันที พร้อมเปลี่ยนชุดอาหารใหม่ให้ทั้งโต๊ะ และขอดูแลบิลนี้ให้คุณลูกค้าเป็นกรณีพิเศษค่ะ"`;
      serviceRecovery = 'ยกเว้นค่าอาหารทั้งโต๊ะทันที + มอบคูปองทานฟรีมื้อถัดไป + ตรวจสอบล็อตวัตถุดิบในครัว';
    } else if (preview.level === 'Level 2') {
      apologyScript = `(หัวหน้ากะเข้าพบลูกค้าที่ ${tableId}): "ขออภัยคุณลูกค้า${tableId}เป็นอย่างยิ่งเลยนะคะ/ครับที่ทำให้ต้องรอนานและเรียกซ้ำ ทางร้านกำลังเร่งจัดการเปลี่ยนกระทะ/เสิร์ฟให้เดี๋ยวนี้เลยค่ะ ขออนุญาตมอบชีสดิปฟรีและคูปองส่วนลดพิเศษ 50 บาทผ่าน LINE OA สำหรับรอบหน้านะคะ"`;
      serviceRecovery = 'ฟรีชีสดิปมื้อนี้ทันที + ส่งคูปองส่วนลด 50 บ. ผ่าน LINE OA อัตโนมัติ + หัวหน้ากะบริการประกบ';
    } else if (preview.level === 'Level 3') {
      if (issueType === 'เตาแก๊ส/แก๊สกระป๋องมีปัญหา') {
        apologyScript = `"ขออภัยคุณลูกค้า ${tableId} ในความไม่สะดวกนะคะ พนักงานกำลังนำกระป๋องแก๊สใหม่และตรวจเช็คหัวเตาแก๊สให้เดี๋ยวนี้เลยค่ะ"`;
        serviceRecovery = 'เปลี่ยนกระป๋องแก๊สใหม่ทันที + ตรวจเช็ควาล์วนิรภัย + ยิงคูปองเครื่องดื่มผ่าน LINE OA';
      } else {
        apologyScript = `"ขออภัยในความไม่สะดวกด้วยนะคะคุณลูกค้า ทางร้านกำลังเร่งเติมวัตถุดิบ/แก้ไขอุปกรณ์ให้โต๊ะ ${tableId} ทันทีภายใน 3 นาทีนี้ค่ะ"`;
        serviceRecovery = 'รีบนำวัตถุดิบ/อุปกรณ์มาเปลี่ยนให้ถึงโต๊ะ + เสิร์ฟเกี๊ยวทอดกรอบรองท้องฟรี';
      }
    } else {
      if (issueType === 'ขอเปลี่ยนกระทะ') {
        apologyScript = `"ขออภัยที่ให้รอนะคะ ทางร้านเร่งนำกระทะหมูกระทะใบใหม่และน้ำซุปกระดูกหมูมาเปลี่ยนให้โต๊ะ ${tableId} เดี๋ยวนี้เลยค่ะ"`;
        serviceRecovery = 'เปลี่ยนกระทะทองเหลืองใหม่ + เติมน้ำซุปกระดูกหมูร้อนๆ';
      } else {
        apologyScript = `"ขออภัยที่ให้รอนะคะ เดี๋ยวทางน้องพนักงานรีบนำมาให้ที่โต๊ะ ${tableId} ทันทีเลยค่ะ"`;
        serviceRecovery = 'พนักงานหน้างานหยิบจัดส่งให้ทันทีด้วยรอยยิ้ม';
      }
    }

    const newInc: Incident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      tableId,
      issueType,
      severityLevel: preview.level,
      detail: detail.trim() || `แจ้งปัญหา${issueType} ที่${tableId} (เรียกซ้ำ ${repeatCalls} ครั้ง)`,
      responsible: preview.responsible,
      status: isUrgent ? 'Escalated' : 'Pending',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      repeatCalls,
      n8nDispatched: needN8n,
      lineCouponSent: needN8n,
      apologyScript,
      serviceRecovery,
      n8nPayload,
    };

    onAddIncident(newInc);
    setDetail('');
  };

  const handleSimulateN8n = (incident: Incident) => {
    setSimulatedN8nLoading(true);
    setTimeout(() => {
      setSimulatedN8nLoading(false);
      setN8nSentSuccess(incident.id);
      setTimeout(() => setN8nSentSuccess(null), 4000);
    }, 800);
  };

  const handleCopy = (text: string, id: string, type: 'script' | 'json') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScriptId(id);
      setTimeout(() => setCopiedScriptId(null), 2000);
    } else {
      setCopiedJsonId(id);
      setTimeout(() => setCopiedJsonId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Robinson 2019 Framework Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              โมดูล 1: ระบบแจ้งเตือนปัญหาแบบ Real-time & Apology Protocol
            </h2>
            <p className="text-xs text-stone-400">
              อิงเกณฑ์การขอโทษตามระดับความรุนแรง (Robinson 2019) และระบบเชื่อมโยงอัตโนมัติ n8n + LINE OA
            </p>
          </div>
          <span className="text-xs font-mono bg-red-950 text-red-300 border border-red-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            Active Incident Monitoring
          </span>
        </div>

        {/* Robinson 2019 Levels Visual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-red-950/40 border border-red-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-red-300 mb-1">
              <span>Level 1: ความปลอดภัยอาหาร</span>
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded">สูงสุด</span>
            </div>
            <p className="text-red-200/80 mb-2">
              สิ่งแปลกปลอม, หมูเน่าเสีย, อาหารเป็นพิษ, สารเคมี
            </p>
            <div className="text-[11px] font-semibold text-white bg-red-900/60 px-2 py-1 rounded border border-red-600/40">
              🚨 แจ้งด่วน: ผู้จัดการร้าน (ผู้จัดการนุ่น) ทันที
            </div>
          </div>

          <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
              <span>Level 2-3: บริการล่าช้า/ตกหล่น</span>
              <span className="bg-amber-500 text-stone-950 text-[10px] px-1.5 py-0.5 rounded font-bold">
                ปานกลาง
              </span>
            </div>
            <p className="text-amber-200/80 mb-2">
              ลูกค้ารอนาน, เรียกซ้ำเกิน 2 ครั้ง, เตาดับไม่เปลี่ยน, คิวล้น
            </p>
            <div className="text-[11px] font-semibold text-white bg-amber-900/60 px-2 py-1 rounded border border-amber-600/40">
              ⚡ แจ้งหัวหน้ากะ (บอย / แนน) + ยิง n8n LINE OA
            </div>
          </div>

          <div className="bg-emerald-950/40 border border-emerald-700/50 rounded-xl p-3">
            <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
              <span>Level 4-5: ปัญหาเล็กน้อย</span>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded">ทั่วไป</span>
            </div>
            <p className="text-emerald-200/80 mb-2">
              ของใช้/ถ้วยน้ำจิ้มหมดช่วงสั้น, ช้อนส้อมขาดตอน, ทิชชูหมด
            </p>
            <div className="text-[11px] font-semibold text-white bg-emerald-900/60 px-2 py-1 rounded border border-emerald-600/40">
              ✅ พนักงานหน้างานจัดการเองทันที
            </div>
          </div>
        </div>
      </div>

      {/* Incident Input Form & Live Evaluation Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-6 bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            บันทึกแจ้งเหตุการณ์หน้างาน
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Table & Category Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  ระบุตำแหน่ง / หมายเลขโต๊ะ
                </label>
                <select
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:border-amber-500 outline-none"
                >
                  {Array.from({ length: 28 }, (_, i) => `โต๊ะ ${String(i + 1).padStart(2, '0')}`).map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                  <option value="จุดรับคิวหน้าร้าน">จุดรับคิวหน้าร้าน</option>
                  <option value="บาร์น้ำจิ้มและผัก">บาร์น้ำจิ้มและผัก</option>
                  <option value="ไลน์ตักเนื้อหมูหมัก">ไลน์ตักเนื้อหมูหมัก</option>
                  <option value="จุดล้างจาน/หลังร้าน">จุดล้างจาน/หลังร้าน</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  ประเภทปัญหา (5 หมวดหลัก)
                </label>
                <select
                  value={issueType}
                  onChange={(e) => {
                    const val = e.target.value as IncidentCategory;
                    setIssueType(val);
                    if (val === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง' && repeatCalls < 3) {
                      setRepeatCalls(3);
                    }
                  }}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 focus:border-amber-500 outline-none"
                >
                  <option value="ลูกค้าเรียกซ้ำเกิน 2 ครั้ง">ลูกค้าเรียกซ้ำเกิน 2 ครั้ง (Trigger n8n)</option>
                  <option value="เตาแก๊ส/แก๊สกระป๋องมีปัญหา">เตาแก๊ส/แก๊สกระป๋องมีปัญหา (แก๊สหมด/ไฟไม่ติด)</option>
                  <option value="ขอเปลี่ยนกระทะ">ขอเปลี่ยนกระทะ (กระทะไหม้/ขอเติมน้ำซุป)</option>
                  <option value="ความปลอดภัยอาหาร">ความปลอดภัยอาหาร (Level 1 ด่วน)</option>
                  <option value="คิวล้น">คิวล้น (เวลารอเกินเกณฑ์)</option>
                  <option value="วัตถุดิบหมด">วัตถุดิบหมด (เช่น สามชั้นสไลด์/สันคอ)</option>
                  <option value="อุปกรณ์ชำรุด">อุปกรณ์ชำรุด (พัดลม/โคมไฟ/เก้าอี้)</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
            </div>

            {/* Repeat Call Counter */}
            <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-300">
                  จำนวนครั้งที่ลูกค้ากดเรียก / ตามซ้ำ:
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    repeatCalls > 2
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {repeatCalls} ครั้ง {repeatCalls > 2 && '⚡ เกิน 2 ครั้ง (Trigger n8n!)'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setRepeatCalls(num);
                      if (num > 2 && issueType !== 'ความปลอดภัยอาหาร') {
                        setIssueType('ลูกค้าเรียกซ้ำเกิน 2 ครั้ง');
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      repeatCalls === num
                        ? num > 2
                          ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                          : 'bg-amber-600 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800'
                    }`}
                  >
                    {num} ครั้ง
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">
                รายละเอียดเหตุการณ์
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="เช่น ลูกค้าตามขอกระทะใหม่ 3 รอบเนื่องจากกะทะไหม้, หรือ พบสิ่งแปลกปลอมในถาดหมู..."
                rows={3}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-500 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>บันทึกแจ้งเหตุการณ์ & ส่งต่อทีมงาน</span>
            </button>
          </form>
        </div>

        {/* Live Evaluation & n8n Payload Preview Column */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live Analysis Card */}
          <div
            className={`p-5 rounded-2xl border shadow-xl transition-all ${
              preview.isUrgent
                ? 'bg-red-950/30 border-red-700/60'
                : 'bg-stone-900 border-stone-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs text-stone-400 font-medium">ผลการวิเคราะห์สด (Real-time Evaluation)</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  preview.level === 'Level 1'
                    ? 'bg-red-600 text-white animate-pulse'
                    : preview.level === 'Level 2'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {preview.level} (Robinson 2019)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-stone-400">ผู้รับผิดชอบที่ต้องเข้าพบลูกค้า:</span>
                <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span className={preview.isUrgent ? 'text-red-300 font-extrabold text-base' : 'text-stone-200'}>
                    {preview.responsible}
                  </span>
                </div>
              </div>

              {preview.isUrgent && (
                <div className="p-2.5 rounded-xl bg-red-900/40 border border-red-600/50 text-xs text-red-200 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>แจ้งด่วน: ต้องเข้าพบลูกค้าที่ {tableId} ทันที ห้ามปล่อยให้ลูกค้ารอนาน!</span>
                </div>
              )}

              {/* Service Recovery Blueprint */}
              <div className="bg-stone-950/70 p-3 rounded-xl border border-stone-800">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-1">
                  <Flame className="w-3.5 h-3.5" />
                  มาตรการชดเชย (Service Recovery):
                </span>
                <p className="text-xs text-stone-300">
                  {preview.level === 'Level 1'
                    ? 'ยกเว้นค่าอาหารมื้อนี้ทั้งโต๊ะทันที + มอบคูปองทานฟรีมื้อถัดไป + ตรวจสอบล็อตวัตถุดิบในครัว'
                    : preview.level === 'Level 2'
                    ? 'ฟรีชีสดิปมื้อนี้ทันที + ยิงคูปองส่วนลด 50 บ. ผ่าน LINE OA อัตโนมัติ + หัวหน้ากะบริการประกบ'
                    : preview.level === 'Level 3'
                    ? 'รีบนำวัตถุดิบ/กระทะใหม่มาเปลี่ยนให้ถึงโต๊ะ + เสิร์ฟเกี๊ยวทอดกรอบรองท้องฟรี'
                    : 'พนักงานหน้างานจัดส่งให้ทันทีพร้อมกล่าวขอบคุณด้วยรอยยิ้ม'}
                </p>
              </div>
            </div>
          </div>

          {/* n8n JSON Schema Output Box */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-amber-400" />
                n8n Webhook Payload Schema
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
                  ? '⚡ LINE OA Coupon Trigger Active'
                  : 'Standby'}
              </span>
            </div>

            <pre className="bg-stone-900/90 text-amber-300/90 p-3 rounded-xl text-[11px] font-mono overflow-x-auto border border-stone-800">
              {JSON.stringify(
                {
                  table_id: tableId,
                  issue_type:
                    repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
                      ? 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
                      : issueType,
                  severity_level: preview.level,
                  timestamp: new Date().toISOString(),
                  ...(repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
                    ? { action_required: 'ส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที' }
                    : {}),
                },
                null,
                2
              )}
            </pre>

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400">
              <span className="text-emerald-400 font-medium">
                {repeatCalls > 2 ? '✓ สรุป JSON ส่งต่อ n8n เพื่อยิงคูปองส่วนลด LINE OA สำเร็จ' : 'เรียกซ้ำ ≤ 2 ยังไม่ยิง webhook'}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    JSON.stringify(
                      {
                        table_id: tableId,
                        issue_type: 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
                        severity_level: preview.level,
                        timestamp: new Date().toISOString(),
                        action_required: 'ส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที',
                      },
                      null,
                      2
                    ),
                    'preview-json',
                    'json'
                  )
                }
                className="text-stone-300 hover:text-white px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedJsonId === 'preview-json' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>คัดลอก JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Stream & Action Log */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            รายการแจ้งเตือนและเหตุการณ์ล่าสุด ({incidents.length} รายการ)
          </h3>
          <span className="text-xs text-stone-400">อัปเดตแบบเรียลไทม์</span>
        </div>

        <div className="space-y-3">
          {incidents.map((inc) => {
            const isL1 = inc.severityLevel === 'Level 1';
            const isL2 = inc.severityLevel === 'Level 2';

            return (
              <div
                key={inc.id}
                className={`p-4 rounded-xl border transition-all ${
                  isL1
                    ? 'bg-red-950/20 border-red-700/50'
                    : isL2
                    ? 'bg-amber-950/20 border-amber-700/50'
                    : 'bg-stone-950/70 border-stone-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                      {inc.tableId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        isL1
                          ? 'bg-red-600 text-white'
                          : isL2
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {inc.severityLevel}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">{inc.issueType}</span>
                    {inc.repeatCalls && inc.repeatCalls > 2 && (
                      <span className="text-[10px] bg-red-900/60 text-red-200 border border-red-600/40 px-2 py-0.5 rounded-full font-bold">
                        เรียกซ้ำ {inc.repeatCalls} ครั้ง
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-stone-400">{inc.timestamp}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        inc.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inc.status === 'Escalated'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {inc.status === 'Resolved'
                        ? 'แก้ไขแล้ว'
                        : inc.status === 'Escalated'
                        ? 'กำลังแก้ไขเร่งด่วน'
                        : 'รอดำเนินการ'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-200 mb-2.5 font-sans leading-relaxed">
                  {inc.detail}
                </p>

                {/* Responsible tag */}
                <div className="text-xs text-amber-300 font-semibold mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>ผู้ดูแลรับผิดชอบ: {inc.responsible}</span>
                </div>

                {/* Apology Script Box */}
                {inc.apologyScript && (
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800/80 mb-2.5 text-xs">
                    <div className="flex items-center justify-between text-stone-400 mb-1 font-medium">
                      <span>คำขอโทษลูกค้า (Apology Script):</span>
                      <button
                        onClick={() => handleCopy(inc.apologyScript || '', inc.id, 'script')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedScriptId === inc.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>คัดลอกบทพูด</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-stone-300 italic">{inc.apologyScript}</p>
                  </div>
                )}

                {/* n8n Status & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-800/60 text-xs">
                  <div className="flex items-center gap-2">
                    {inc.n8nPayload && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                        <Ticket className="w-3 h-3" />
                        n8n Webhook: ส่งคูปอง LINE OA อัตโนมัติแล้ว
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {inc.n8nPayload && (
                      <button
                        onClick={() => handleSimulateN8n(inc)}
                        disabled={simulatedN8nLoading}
                        className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {n8nSentSuccess === inc.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">ยิง n8n สำเร็จ!</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>ยิงทดสอบ n8n</span>
                          </>
                        )}
                      </button>
                    )}

                    {inc.status !== 'Resolved' ? (
                      <button
                        onClick={() => onUpdateStatus(inc.id, 'Resolved')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ปิดเคสเรียบร้อย</span>
                      </button>
                    ) : (
                      <span className="text-stone-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        เสร็จสิ้น
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
