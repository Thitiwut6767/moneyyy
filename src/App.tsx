import React, { useState } from 'react';
import {
  MessageSquare,
  ShieldAlert,
  Calculator,
  Clock,
  Award,
  Sparkles,
  PhoneCall,
  X,
  Send,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Globe,
  Sliders,
  ChevronRight,
  HelpCircle,
  Bot,
  Utensils,
} from 'lucide-react';
import { Header } from './components/Header';
import { CustomerWebsite } from './components/CustomerWebsite';
import { ChatAssistant } from './components/ChatAssistant';
import { IncidentHub } from './components/IncidentHub';
import { CostCalculator } from './components/CostCalculator';
import { QueueManager } from './components/QueueManager';
import { MemberLoyalty } from './components/MemberLoyalty';
import { BuffetStockManager } from './components/BuffetStockManager';
import { CashierRatingModal } from './components/CashierRatingModal';
import {
  INITIAL_INCIDENTS,
  INITIAL_COST_DATA,
  INITIAL_QUEUE_DATA,
  INITIAL_MEMBERS,
  INITIAL_CASHIER_RATINGS,
} from './data/store';
import { Incident, CostData, QueueData, Member, QueueTicket, MemberCoupon, MemberTransaction, CashierRating } from './types';

type OperationsTab = 'chat' | 'incidents' | 'cost' | 'queue' | 'member' | 'stock';

export default function App() {
  // Main view: 'website' (Customer-facing website) or 'operations' (Internal Staff Hub)
  const [currentView, setCurrentView] = useState<'website' | 'operations'>('website');

  // Internal tab in operations mode
  const [activeTab, setActiveTab] = useState<OperationsTab>('chat');

  // Core synchronized application state
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [costData, setCostData] = useState<CostData>(INITIAL_COST_DATA);
  const [queueData, setQueueData] = useState<QueueData>(INITIAL_QUEUE_DATA);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [cashierRatings, setCashierRatings] = useState<CashierRating[]>(INITIAL_CASHIER_RATINGS);

  // Cashier Tablet Rating Modal State
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [cashierModalTable, setCashierModalTable] = useState('โต๊ะ 08');
  const [cashierModalBill, setCashierModalBill] = useState(596);
  const [cashierModalStaff, setCashierModalStaff] = useState('แคชเชียร์กวาง');

  // Floating AI drawer state
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Quick Emergency Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emTable, setEmTable] = useState('โต๊ะ 08');
  const [emDetail, setEmDetail] = useState('');
  const [emCalls, setEmCalls] = useState(3);
  const [emSuccessNotice, setEmSuccessNotice] = useState<string | null>(null);

  // Active urgent incidents count (Level 1 or 2 pending/escalated)
  const urgentCount = incidents.filter(
    (i) => (i.severityLevel === 'Level 1' || i.severityLevel === 'Level 2') && i.status !== 'Resolved'
  ).length;

  const handleAddIncident = (newInc: Incident) => {
    setIncidents((prev) => [newInc, ...prev]);
  };

  const handleUpdateIncidentStatus = (
    id: string,
    status: 'Pending' | 'Escalated' | 'Resolved'
  ) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
  };

  const handleUpdateQueue = (updated: Partial<QueueData>) => {
    setQueueData((prev) => ({ ...prev, ...updated }));
  };

  const handleAddCustomerOnlineQueue = (newTicket: QueueTicket) => {
    setQueueData((prev) => {
      const newWaiting = prev.waitingTables + 1;
      const newWaitMin =
        prev.openTablesPerRound > 0 ? Math.round((newWaiting * prev.turnoverTime) / prev.openTablesPerRound) : 0;
      return {
        ...prev,
        waitingTables: newWaiting,
        estimatedWaitTime: newWaitMin,
        shouldStopWalkIn: newWaitMin > 30,
        tickets: [newTicket, ...prev.tickets],
      };
    });
  };

  const handleAddMemberPoints = (memberId: string, addedPoints: number, newBill: number, desc?: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const newTx: MemberTransaction = {
          id: `TX-${Date.now()}`,
          type: 'earn',
          points: addedPoints,
          title: desc || `สะสมแต้มบุฟเฟต์ ยอด ${newBill.toLocaleString()} บาท`,
          timestamp: 'เมื่อสักครู่',
          billAmount: newBill,
        };
        return {
          ...m,
          points: m.points + addedPoints,
          totalVisits: m.totalVisits + 1,
          lastVisit: 'เมื่อสักครู่',
          transactions: [newTx, ...(m.transactions || [])],
        };
      })
    );
    // Also record into today's sales
    setCostData((prev) => {
      const newSales = prev.todaySales + newBill;
      const newPercent = Number(((prev.todayIngredientsCost / newSales) * 100).toFixed(1));
      return {
        ...prev,
        todaySales: newSales,
        foodCostPercent: newPercent,
        isFoodCostHigh: newPercent > 35,
        currentHeads: Math.round(newSales / 149),
      };
    });
  };

  const handleRegisterMember = (newMember: Member) => {
    setMembers((prev) => [newMember, ...prev]);
  };

  const handleRedeemReward = (memberId: string, rewardTitle: string, pointsCost: number): string => {
    const couponCode = `MMK-${Math.floor(10000 + Math.random() * 90000)}`;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const newCoupon: MemberCoupon = {
          id: `CPN-${Date.now()}`,
          code: couponCode,
          title: rewardTitle,
          pointsCost,
          redeemedAt: 'วันนี้',
          expiresAt: '30 วันนับจากนี้',
          status: 'active',
        };
        const newTx: MemberTransaction = {
          id: `TX-${Date.now()}`,
          type: 'redeem',
          points: -pointsCost,
          title: `แลกสิทธิ์ ${rewardTitle} (รหัส ${couponCode})`,
          timestamp: 'เมื่อสักครู่',
        };
        return {
          ...m,
          points: Math.max(0, m.points - pointsCost),
          coupons: [newCoupon, ...(m.coupons || [])],
          transactions: [newTx, ...(m.transactions || [])],
        };
      })
    );
    return couponCode;
  };

  const handleAskAiFromModule = (promptText: string) => {
    setCurrentView('operations');
    setActiveTab('chat');
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleOpenCashierRatingModal = (tableId?: string, billAmount?: number, staff?: string) => {
    if (tableId) setCashierModalTable(tableId);
    if (billAmount) setCashierModalBill(billAmount);
    if (staff) setCashierModalStaff(staff);
    setIsCashierModalOpen(true);
  };

  const handleSubmitCashierRating = (newRating: CashierRating) => {
    setCashierRatings((prev) => [newRating, ...prev]);

    // If customer entered member phone, award +1 bonus loyalty point
    if (newRating.phone) {
      const cleanPhone = newRating.phone.replace(/[^0-9]/g, '');
      setMembers((prev) =>
        prev.map((m) => {
          if (m.phone.replace(/[^0-9]/g, '') === cleanPhone) {
            const bonusTx: MemberTransaction = {
              id: `TX-${Date.now()}`,
              type: 'bonus',
              points: 1,
              title: `โบนัสให้คะแนนความพึงพอใจ (${newRating.stars} หมู 🐷)`,
              timestamp: 'เมื่อสักครู่',
            };
            return {
              ...m,
              points: m.points + 1,
              transactions: [bonusTx, ...(m.transactions || [])],
            };
          }
          return m;
        })
      );
    }

    // If 1-2 stars/pigs, trigger apology protocol & create Level 2 Incident
    if (newRating.stars <= 2) {
      const lowRatingInc: Incident = {
        id: `INC-CSAT-${Date.now()}`,
        tableId: newRating.tableId,
        issueType: 'ลูกค้าไม่พึงพอใจการบริการ (เรทต่ำ 1-2 หมู 🐷)',
        severityLevel: 'Level 2',
        detail: `ลูกค้าที่ ${newRating.tableId} ให้คะแนน ${newRating.stars} หมู: "${newRating.comment || newRating.categoryTags.join(', ')}" (ผู้ดูแล: ${newRating.cashierStaff})`,
        responsible: 'ผู้จัดการนุ่น & หัวหน้ากะบอย',
        status: 'Escalated',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        repeatCalls: 1,
        n8nDispatched: true,
        lineCouponSent: true,
        apologyScript: `(ผู้จัดการนุ่นเข้าพบลูกค้าทันที): "กราบขออภัยคุณลูกค้าเป็นอย่างยิ่งค่ะ ทางร้านได้รับคะแนน ${newRating.stars} หมู และคำแนะนำของท่านเรียบร้อยแล้ว ทางเราขออนุญาตมอบคูปองส่วนลดพิเศษผ่าน LINE OA และตรวจสอบข้อบกพร่องทันทีค่ะ"`,
        serviceRecovery: 'ผู้จัดการเข้าพบเพื่อขอโทษ + ยิงคูปองส่วนลด 50 บาทเข้า LINE OA อัตโนมัติ + ปรับปรุงระบบบริการ',
        n8nPayload: {
          table_id: newRating.tableId,
          issue_type: 'คะแนนความพึงพอใจบริการต่ำ',
          severity_level: 'Level 2',
          timestamp: new Date().toISOString(),
          action_required: 'ยิงคูปองขออภัยผ่าน LINE OA และรายงานผู้จัดการร้านทันที',
        },
      };
      setIncidents((prev) => [lowRatingInc, ...prev]);
    }
  };

  const handleQuickEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isFoodSafety =
      emDetail.includes('สิ่งแปลกปลอม') ||
      emDetail.includes('เน่า') ||
      emDetail.includes('บูด') ||
      emDetail.includes('เส้นผม');

    const severityLevel = isFoodSafety ? 'Level 1' : 'Level 2';
    const responsible = isFoodSafety ? 'ผู้จัดการนุ่น (ด่วน!)' : 'หัวหน้ากะบอย';

    const newInc: Incident = {
      id: `INC-EMG-${Date.now()}`,
      tableId: emTable,
      issueType: isFoodSafety ? 'ความปลอดภัยอาหาร' : 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
      severityLevel,
      detail: emDetail.trim() || `แจ้งเหตุด่วนที่ ${emTable} (ลูกค้าเรียกซ้ำ ${emCalls} ครั้ง)`,
      responsible,
      status: 'Escalated',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      repeatCalls: emCalls,
      n8nDispatched: true,
      lineCouponSent: true,
      apologyScript: isFoodSafety
        ? `(ผู้จัดการนุ่นเข้าพบลูกค้าทันที): "กราบขออภัยคุณลูกค้า${emTable}เป็นอย่างยิ่งค่ะ ทางร้านขอดูแลเปลี่ยนอาหารใหม่ทั้งโต๊ะ และขอดูแลบิลนี้ให้คุณลูกค้าฟรีเป็นกรณีพิเศษค่ะ"`
        : `(หัวหน้ากะเข้าพบลูกค้าที่ ${emTable}): "ขออภัยคุณลูกค้า${emTable}เป็นอย่างยิ่งค่ะที่ให้รอนาน ทางเรามอบชีสดิปฟรี 1 ถ้วยและคูปองส่วนลด 50 บาทผ่าน LINE OA ทันทีนะคะ"`,
      serviceRecovery: isFoodSafety
        ? 'ยกเว้นค่าอาหารมื้อนี้ + เปลี่ยนอาหารใหม่ทั้งโต๊ะ + ตรวจสอบครัว'
        : 'ฟรีชีสดิป 1 ถ้วย + ยิงคูปอง LINE OA อัตโนมัติ + เปลี่ยนเตาแก๊ส/กระทะใหม่ทันที',
      n8nPayload: {
        table_id: emTable,
        issue_type: isFoodSafety ? 'ความปลอดภัยอาหาร' : 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
        severity_level: severityLevel,
        timestamp: new Date().toISOString(),
        action_required: 'ส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที',
      },
    };

    setIncidents((prev) => [newInc, ...prev]);
    setEmSuccessNotice(`บันทึกแจ้งด่วนที่ ${emTable} สำเร็จ! ผู้รับผิดชอบ: ${responsible}`);
    setTimeout(() => {
      setEmSuccessNotice(null);
      setIsEmergencyModalOpen(false);
      setEmDetail('');
    }, 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors ${currentView === 'website' ? 'bg-[#FAF9F6] text-stone-900' : 'bg-stone-950 text-stone-100'}`}>
      {/* Top Header */}
      <Header
        currentView={currentView}
        onToggleView={(view) => setCurrentView(view)}
        onQuickEmergency={() => setIsEmergencyModalOpen(true)}
        urgentCount={urgentCount}
        onOpenCashierRating={() => handleOpenCashierRatingModal()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* VIEW 1: CUSTOMER FACING WEBSITE */}
        {currentView === 'website' ? (
          <CustomerWebsite
            queueData={queueData}
            members={members}
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onAddQueueTicket={handleAddCustomerOnlineQueue}
            onOpenStaffPortal={() => setCurrentView('operations')}
            onOpenAiChat={(prompt) => {
              setCurrentView('operations');
              setActiveTab('chat');
            }}
            onAddMemberPoints={handleAddMemberPoints}
            onRegisterMember={handleRegisterMember}
            onRedeemReward={handleRedeemReward}
            cashierRatings={cashierRatings}
            onOpenCashierRating={() => handleOpenCashierRatingModal()}
          />
        ) : (
          /* VIEW 2: OPERATIONS & STAFF DASHBOARD (4 MODULES + AI COPILOT) */
          <div className="space-y-6">
            {/* Top Operations Hub Switcher Bar */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-black shadow-md">
                  ⚡
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    ศูนย์ควบคุมปฏิบัติการร้านมันนี่หมูกระทะ
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-normal">
                      Staff Portal
                    </span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    โมดูล 1-4 ตามข้อกำหนดระบบ: Apology Protocol • Cost & Break-Even • Queue Engine • Member CRM
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCurrentView('website')}
                className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>กลับสู่หน้าเว็บร้าน (Customer View)</span>
              </button>
            </div>

            {/* Navigation Tabs for Operations Hub */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-800 scrollbar-none">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>น้องมันนี่ Copilot</span>
              </button>

              <button
                onClick={() => setActiveTab('incidents')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer relative ${
                  activeTab === 'incidents'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>โมดูล 1: แจ้งเตือนปัญหา</span>
                {urgentCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {urgentCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('cost')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'cost'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>โมดูล 2: ต้นทุน/บัญชี</span>
                {costData.isFoodCostHigh && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>โมดูล 3: คิวและการจอง</span>
                {queueData.shouldStopWalkIn && (
                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">
                    หยุด Walk-in
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('member')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'member'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>โมดูล 4: สมาชิก/แต้ม</span>
              </button>

              <button
                onClick={() => setActiveTab('stock')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'stock'
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-stone-900/80 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800'
                }`}
              >
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>โมดูล 5: สต็อกบาร์อาหารสด</span>
              </button>
            </div>

            {/* Tab Content Panels */}
            {activeTab === 'chat' && <ChatAssistant />}

            {activeTab === 'incidents' && (
              <IncidentHub
                incidents={incidents}
                onAddIncident={handleAddIncident}
                onUpdateStatus={handleUpdateIncidentStatus}
              />
            )}

            {activeTab === 'cost' && (
              <CostCalculator initialData={costData} onAskAi={handleAskAiFromModule} />
            )}

            {activeTab === 'queue' && (
              <QueueManager
                queueData={queueData}
                onUpdateQueue={handleUpdateQueue}
                onAskAi={handleAskAiFromModule}
              />
            )}

            {activeTab === 'member' && (
              <MemberLoyalty
                members={members}
                onAddPoints={handleAddMemberPoints}
                onAskAi={handleAskAiFromModule}
                onRegisterMember={handleRegisterMember}
                onRedeemReward={handleRedeemReward}
                cashierRatings={cashierRatings}
                onOpenCashierRating={handleOpenCashierRatingModal}
              />
            )}

            {activeTab === 'stock' && (
              <BuffetStockManager
                onAddIncident={handleAddIncident}
                onAskAi={handleAskAiFromModule}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button: Ask น้องมันนี่ AI (when on website view) */}
      {currentView === 'website' && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => {
              setCurrentView('operations');
              setActiveTab('chat');
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all border border-amber-300/40 cursor-pointer animate-bounce"
          >
            <Sparkles className="w-5 h-5 text-amber-200" />
            <span>คุยกับ "น้องมันนี่ AI"</span>
          </button>
        </div>
      )}

      {/* Website Global Footer */}
      <footer className={`mt-auto border-t px-4 sm:px-6 py-8 text-xs transition-colors ${currentView === 'website' ? 'border-red-200 bg-white text-stone-600' : 'border-stone-800/80 bg-stone-950 text-stone-500'}`}>
        <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b ${currentView === 'website' ? 'border-red-100' : 'border-stone-850'}`}>
          <div className="space-y-2">
            <div className={`flex items-center gap-2 font-black text-base ${currentView === 'website' ? 'text-stone-900' : 'text-white'}`}>
              <div className="w-6 h-6 rounded-lg overflow-hidden border border-red-300 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="โลโก้ มันนี่หมูกระทะ"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span>มันนี่หมูกระทะ สวนดอก</span>
            </div>
            <p className={`leading-relaxed text-[11px] ${currentView === 'website' ? 'text-stone-600' : 'text-stone-400'}`}>
              บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น สะอาด ปลอดภัย ไม่จำกัดเวลา ยอดนิยมอันดับ 1 ย่านสวนดอก ใกล้ มช. และ รพ.มหาราชนครเชียงใหม่
            </p>
            <div className={`pt-1 flex items-center gap-2 text-[11px] ${currentView === 'website' ? 'text-emerald-700' : 'text-emerald-400'}`}>
              <span className="font-semibold">LINE OA:</span>
              <span className={`font-mono px-2 py-0.5 rounded border font-bold ${currentView === 'website' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-stone-900 border-emerald-500/30'}`}>@moneymookata</span>
            </div>
          </div>

          <div className="space-y-1 text-[11px]">
            <span className={`font-bold block mb-1 ${currentView === 'website' ? 'text-stone-900' : 'text-stone-300'}`}>เมนูและโปรโมชัน</span>
            <p>• บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น</p>
            <p>• บาร์อาหารสด & ผัก หลากหลายรายการ</p>
            <p>• โปรนักศึกษา มช. & แพทย์สวนดอก</p>
            <p>• สะสม 50 แต้ม กินฟรี 1 ท่าน</p>
          </div>

          <div className="space-y-1 text-[11px]">
            <span className={`font-bold block mb-1 ${currentView === 'website' ? 'text-stone-900' : 'text-stone-300'}`}>เวลาและบริการ</span>
            <p>• เปิดทุกวัน 16:00 - 23:00 น.</p>
            <p>• ที่จอดรถสะดวกสบาย</p>
            <p>• รับสแกนจ่ายทุกธนาคาร</p>
            <p>• มีระบบจองคิวออนไลน์ล่วงหน้า</p>
          </div>

          <div className="space-y-2 text-[11px]">
            <span className={`font-bold block mb-1 ${currentView === 'website' ? 'text-stone-900' : 'text-stone-300'}`}>เข้าสู่ระบบร้าน</span>
            <button
              onClick={() => {
                setCurrentView('operations');
                setActiveTab('incidents');
              }}
              className={`w-full py-2 px-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                currentView === 'website'
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 font-semibold'
                  : 'bg-stone-900 hover:bg-stone-850 text-amber-300 border-stone-800'
              }`}
            >
              <span>ระบบหลังร้าน (Staff Ops)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <p className={currentView === 'website' ? 'text-stone-500' : 'text-stone-400'}>
              ควบคุมด้วย น้องมันนี่ AI • Apology Robinson 2019 • n8n Webhook
            </p>
          </div>
        </div>

        <div className={`max-w-7xl mx-auto pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] ${currentView === 'website' ? 'text-stone-500' : 'text-stone-400'}`}>
          <span>© 2026 มันนี่หมูกระทะ สาขาสวนดอก เชียงใหม่ (Money Mookata Suan Dok). All rights reserved.</span>
          <span>ระบบขับเคลื่อนด้วย Google AI Studio & TypeScript</span>
        </div>
      </footer>

      {/* Emergency Quick Report Modal */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border-2 border-red-600/70 rounded-2xl max-w-lg w-full p-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEmergencyModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 text-red-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>แจ้งเหตุด่วนหน้างาน (Level 1-2 Emergency)</span>
            </div>
            <p className="text-xs text-stone-300 mb-4">
              ใช้สำหรับเคสฉุกเฉิน: ความปลอดภัยอาหาร (ผู้จัดการนุ่น) หรือลูกค้าเรียกซ้ำเกิน 2 ครั้ง (หัวหน้ากะบอย + ยิงคูปอง LINE OA)
            </p>

            {emSuccessNotice ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{emSuccessNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleQuickEmergencySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1">ตำแหน่ง/โต๊ะ:</label>
                    <select
                      value={emTable}
                      onChange={(e) => setEmTable(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      {Array.from({ length: 28 }, (_, i) => `โต๊ะ ${String(i + 1).padStart(2, '0')}`).map(
                        (t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1">จำนวนครั้งที่เรียกซ้ำ:</label>
                    <select
                      value={emCalls}
                      onChange={(e) => setEmCalls(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value={1}>1 ครั้ง</option>
                      <option value={2}>2 ครั้ง</option>
                      <option value={3}>3 ครั้ง (เกิน 2 ครั้ง)</option>
                      <option value={4}>4 ครั้ง (เกิน 2 ครั้ง)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1">
                    รายละเอียดเหตุการณ์เร่งด่วน:
                  </label>
                  <textarea
                    value={emDetail}
                    onChange={(e) => setEmDetail(e.target.value)}
                    placeholder="เช่น ลูกค้าพบสิ่งแปลกปลอมในจาน หรือ กดกริ่งเรียก 3 ครั้ง ขอกระทะใหม่..."
                    rows={3}
                    required
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 outline-none resize-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsEmergencyModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-900/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งแจ้งเตือนด่วนทันที</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cashier 5-Star Customer Satisfaction Rating Modal */}
      <CashierRatingModal
        isOpen={isCashierModalOpen}
        onClose={() => setIsCashierModalOpen(false)}
        onSubmitRating={handleSubmitCashierRating}
        members={members}
        initialTable={cashierModalTable}
        initialBill={cashierModalBill}
        initialCashier={cashierModalStaff}
      />
    </div>
  );
}
