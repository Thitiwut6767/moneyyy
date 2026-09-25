import React, { useState } from 'react';
import {
  Utensils,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Plus,
  Minus,
  Bell,
  Sparkles,
  Flame,
  Search,
  Filter,
  Check,
  ChevronRight,
  X,
} from 'lucide-react';
import { BuffetItem, Incident } from '../types';
import { BUFFET_ITEMS, INITIAL_STOCK_MAP } from '../data/store';

interface BuffetStockManagerProps {
  onAddIncident?: (incident: Incident) => void;
  onAskAi?: (prompt: string) => void;
}

export const BuffetStockManager: React.FC<BuffetStockManagerProps> = ({
  onAddIncident,
  onAskAi,
}) => {
  const [stockLevels, setStockLevels] = useState<Record<string, number>>(INITIAL_STOCK_MAP);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pork' | 'seafood' | 'veggie' | 'sauce' | 'dessert'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'low' | 'urgent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BuffetItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAdjustStock = (itemId: string, delta: number) => {
    setStockLevels((prev) => {
      const current = prev[itemId] ?? 80;
      const next = Math.max(0, Math.min(100, current + delta));
      return { ...prev, [itemId]: next };
    });
  };

  const handleSetStock = (itemId: string, targetPercent: number) => {
    setStockLevels((prev) => ({
      ...prev,
      [itemId]: Math.max(0, Math.min(100, targetPercent)),
    }));
  };

  const handleRefillAll = () => {
    const fullyStocked: Record<string, number> = {};
    BUFFET_ITEMS.forEach((item) => {
      fullyStocked[item.id] = 100;
    });
    setStockLevels(fullyStocked);
    showToast('✅ อัปเดตเติมวัตถุดิบเต็ม 100% ครบทุกถาดที่บาร์เรียบร้อยแล้ว');
  };

  const handleReportKitchenRefill = (item: BuffetItem) => {
    showToast(`🔔 ส่งสัญญาณแจ้งครัว: ขอเติม "${item.name}" ที่ ${item.station} ด่วน!`);

    if (onAddIncident) {
      const newInc: Incident = {
        id: `INC-BAR-${Date.now()}`,
        tableId: 'บาร์อาหารสด',
        issueType: 'วัตถุดิบหมด',
        severityLevel: 'Level 3',
        detail: `พนักงานแจ้งวัตถุดิบบาร์ลดต่ำ: ${item.name} (${item.station}) เหลือ ${stockLevels[item.id] ?? 20}% ขอครัวเร่งสไลด์/จัดส่งเติม`,
        responsible: 'หัวหน้ากะแนน (ครัวเตรียม)',
        status: 'Pending',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
        repeatCalls: 1,
        n8nDispatched: true,
        lineCouponSent: false,
        apologyScript: `"ขออภัยในความไม่สะดวกนะคะคุณลูกค้า ทางครัวกำลังนำ ${item.name} สดใหม่มาเติมที่บาร์ภายใน 2 นาทีนี้ค่ะ"`,
        serviceRecovery: `นำจาน ${item.name} พิเศษมาส่งให้ลูกค้าที่รอทันที`,
      };
      onAddIncident(newInc);
    }
  };

  const filteredItems = BUFFET_ITEMS.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    const stock = stockLevels[item.id] ?? 80;
    if (statusFilter === 'ready' && stock < 60) return false;
    if (statusFilter === 'low' && (stock >= 60 || stock < 25)) return false;
    if (statusFilter === 'urgent' && stock >= 25) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.enName.toLowerCase().includes(q) ||
        item.station.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalItemsCount = BUFFET_ITEMS.length;
  const readyItemsCount = BUFFET_ITEMS.filter((i) => (stockLevels[i.id] ?? 80) >= 60).length;
  const lowItemsCount = BUFFET_ITEMS.filter(
    (i) => (stockLevels[i.id] ?? 80) >= 25 && (stockLevels[i.id] ?? 80) < 60
  ).length;
  const urgentItemsCount = BUFFET_ITEMS.filter((i) => (stockLevels[i.id] ?? 80) < 25).length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-amber-500/50 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-stone-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-stone-800">
          <div>
            <span className="text-xs text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-amber-400" />
              Staff Operations • Cold Bar Inventory & Dispenser
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
              ระบบตรวจสอบวัตถุดิบบาร์สด & ตู้แช่อุณหภูมิ 2°C
              <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                มุมมองพนักงาน
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              ควบคุมคุณภาพความสด ถาดแช่เย็น 2°C และสั่งเติมวัตถุดิบบาร์ทันท่วงทีก่อนที่ลูกค้าจะขาดตอน
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefillAll}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>เติมเต็ม 100% ทุกรายการ</span>
            </button>
            {onAskAi && (
              <button
                onClick={() =>
                  onAskAi(
                    `ตอนนี้บาร์มีของใกล้หมด ${urgentItemsCount} รายการ (${BUFFET_ITEMS.filter(
                      (i) => (stockLevels[i.id] ?? 80) < 25
                    )
                      .map((i) => i.name)
                      .join(', ')}) ขอคำแนะนำลำดับการสไลด์เนื้อและเตรียมของให้ทันรอบคนแน่น`
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-amber-300 font-semibold text-xs border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>ปรึกษาน้องมันนี่</span>
              </button>
            )}
          </div>
        </div>

        {/* Cold Storage Temp Monitors Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-blue-400" />
              ตู้แช่หมูสไลด์ 01:
            </span>
            <strong className="text-blue-300 font-mono">2.1°C (ปกติ)</strong>
          </div>
          <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              บาร์ซีฟู้ดสด 02:
            </span>
            <strong className="text-cyan-300 font-mono">0.4°C (น้ำแข็งรอง)</strong>
          </div>
          <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
              บาร์ผักไฮโดรโปนิกส์:
            </span>
            <strong className="text-emerald-300 font-mono">หมอกเย็นพ่นปกติ</strong>
          </div>
          <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-indigo-400" />
              ตู้ไอศกรีมโบราณ:
            </span>
            <strong className="text-indigo-300 font-mono">-18.2°C (เย็นจัด)</strong>
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-stone-900 border-amber-500/60 shadow-lg'
              : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="text-xs text-stone-400 mb-1">เมนูบาร์ทั้งหมด</div>
          <div className="text-2xl font-black text-white font-mono">{totalItemsCount}</div>
          <div className="text-[11px] text-stone-500 mt-1">คลิกเพื่อดูทั้งหมด</div>
        </div>

        <div
          onClick={() => setStatusFilter('ready')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'ready'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-lg'
              : 'bg-stone-900/60 border-stone-800 hover:border-emerald-500/40'
          }`}
        >
          <div className="text-xs text-emerald-300 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>พร้อมตักเต็มบาร์ (≥60%)</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{readyItemsCount}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">ไม่ต้องเติม</div>
        </div>

        <div
          onClick={() => setStatusFilter('low')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'low'
              ? 'bg-amber-950/40 border-amber-500 shadow-lg'
              : 'bg-stone-900/60 border-stone-800 hover:border-amber-500/40'
          }`}
        >
          <div className="text-xs text-amber-300 mb-1 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>เริ่มเหลือน้อย (25-59%)</span>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{lowItemsCount}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">เตรียมสไลด์เพิ่ม</div>
        </div>

        <div
          onClick={() => setStatusFilter('urgent')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'urgent'
              ? 'bg-red-950/50 border-red-500 shadow-lg'
              : 'bg-stone-900/60 border-stone-800 hover:border-red-500/40'
          }`}
        >
          <div className="text-xs text-red-300 mb-1 flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>ด่วน! ใกล้หมด (&lt;25%)</span>
          </div>
          <div className="text-2xl font-black text-red-400 font-mono">{urgentItemsCount}</div>
          <div className="text-[11px] text-red-400/90 mt-1">ต้องเติมทันที</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3.5 rounded-2xl border border-stone-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pork', label: '🥩 บาร์หมูสไลด์' },
            { id: 'seafood', label: '🦐 ซีฟู้ด & ชีส' },
            { id: 'veggie', label: '🥬 ผักสด & เส้น' },
            { id: 'sauce', label: '🥣 น้ำจิ้ม 3 สูตร' },
            { id: 'dessert', label: '🍨 ไอศกรีม/ผลไม้' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-950 text-stone-300 hover:text-white border border-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อวัตถุดิบ/จุดวาง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-stone-500 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Grid of Buffet Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const stock = stockLevels[item.id] ?? 80;
          const isFull = stock >= 60;
          const isMedium = stock >= 25 && stock < 60;
          const isLow = stock < 25;

          return (
            <div
              key={item.id}
              className={`bg-stone-900 border rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col justify-between ${
                isLow
                  ? 'border-red-500/50 shadow-red-950/30'
                  : isMedium
                  ? 'border-amber-500/30'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                {/* Image + Header Badges */}
                <div className="relative h-44 overflow-hidden bg-stone-950">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />
                  
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-950/80 text-white border border-stone-700 backdrop-blur-md">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-950/80 text-blue-300 border border-stone-700 backdrop-blur-md">
                      {item.temp}
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white drop-shadow-md">{item.name}</h4>
                      <p className="text-[11px] text-stone-300 font-mono drop-shadow">{item.enName}</p>
                    </div>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span>จุดประจำบาร์:</span>
                    <span className="font-semibold text-amber-300">{item.station}</span>
                  </div>

                  {/* Stock Gauge */}
                  <div className="space-y-1.5 bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-300 font-medium">ระดับคงเหลือในถาด:</span>
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          isFull
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : isMedium
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-red-950 text-red-300 border border-red-500/40 animate-pulse'
                        }`}
                      >
                        {stock}% {isLow ? '(ด่วน!)' : ''}
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFull
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : isMedium
                            ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                            : 'bg-gradient-to-r from-red-600 to-rose-400 animate-pulse'
                        }`}
                        style={{ width: `${Math.max(6, Math.min(100, stock))}%` }}
                      />
                    </div>

                    {/* Stock Quick Adjustment Buttons */}
                    <div className="flex items-center justify-between pt-1 gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, -10)}
                          className="px-2 py-0.5 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 text-[10px] border border-stone-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" /> 10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, 25)}
                          className="px-2 py-0.5 rounded bg-stone-850 hover:bg-stone-800 text-amber-300 text-[10px] border border-stone-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> 25%
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSetStock(item.id, 100)}
                        className="px-2 py-0.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Check className="w-2.5 h-2.5" /> เติม 100%
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReportKitchenRefill(item)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isLow
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50 animate-pulse'
                        : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                    }`}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isLow ? 'แจ้งครัวเร่งเติมด่วน!' : 'แจ้งครัวเตรียมของ'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700 transition-colors cursor-pointer"
                    title="ดูรายละเอียดวัตถุดิบและคำแนะนำ"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-stone-950/80 text-stone-400 hover:text-white flex items-center justify-center border border-stone-700 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative h-64 overflow-hidden bg-stone-950">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-md">
                    {selectedItem.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                    {selectedItem.name}
                  </h3>
                  <span className="text-xs text-stone-300 font-mono">{selectedItem.enName}</span>
                </div>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-stone-950/80 text-blue-300 border border-stone-700 backdrop-blur-md">
                  {selectedItem.temp}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {selectedItem.desc}
              </p>

              <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">จุดบริการที่บาร์อาหาร:</span>
                <span className="font-bold text-amber-300">{selectedItem.station}</span>
              </div>

              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">ระดับคงเหลือในถาด:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {stockLevels[selectedItem.id] ?? 80}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSetStock(selectedItem.id, 100)}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    บันทึกเติมเต็ม 100%
                  </button>
                  <button
                    onClick={() => {
                      handleReportKitchenRefill(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    ส่งเตือนครัวด่วน
                  </button>
                </div>
              </div>

              <div className="bg-stone-850 p-3.5 rounded-2xl border border-stone-700/80 space-y-1 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  คำแนะนำในการปรุง:
                </span>
                <p className="text-stone-300 leading-relaxed">{selectedItem.cookTip}</p>
                <div className="pt-1 text-[11px] text-stone-400">
                  จิ้มคู่กับ: <span className="text-amber-200 font-medium">{selectedItem.dip}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
