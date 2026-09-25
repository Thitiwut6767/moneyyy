import React, { useEffect, useState } from 'react';
import {
  Flame,
  Clock,
  MapPin,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  Globe,
  Sliders,
  Utensils,
  Ticket,
  Award,
} from 'lucide-react';
import { PigIcon } from './PigIcon';

interface HeaderProps {
  currentView: 'website' | 'operations';
  onToggleView: (view: 'website' | 'operations') => void;
  onQuickEmergency: () => void;
  urgentCount: number;
  onOpenCashierRating?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onToggleView,
  onQuickEmergency,
  urgentCount,
  onOpenCashierRating,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={`${currentView === 'website' ? 'bg-white/95 text-stone-900 border-b border-red-100 shadow-sm' : 'bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white border-b border-stone-800 shadow-xl'} sticky top-0 z-40 backdrop-blur-md transition-colors`}>
      {/* Top micro announcement bar */}
      <div className={`${currentView === 'website' ? 'bg-red-600 text-white' : 'bg-black/60 text-white/90 border-b border-white/10'} px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 transition-colors`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className={`w-3.5 h-3.5 ${currentView === 'website' ? 'text-white' : 'text-amber-400'}`} />
            สาขาสวนดอก เชียงใหม่ (ถ.สุเทพ เยื้องคณะทันตแพทย์ & รพ.มหาราช มช.)
          </span>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <Clock className={`w-3.5 h-3.5 ${currentView === 'website' ? 'text-white' : 'text-emerald-400'}`} />
            16:00 - 23:00 น. (เปิดให้บริการอยู่)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${currentView === 'website' ? 'bg-white/20 text-white border border-white/30' : 'bg-amber-500/20 text-amber-200 border border-amber-500/30'}`}>
            🔥 บุฟเฟต์ 149.- ไม่จำกัดเวลา
          </span>
          <span className={`font-mono px-2 py-0.5 rounded text-[11px] ${currentView === 'website' ? 'bg-black/20 text-white border border-white/20' : 'text-emerald-300 bg-emerald-950/60 border border-emerald-500/30'}`}>
            ⏰ {timeStr || '18:00:00 น.'}
          </span>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={() => onToggleView('website')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden p-0.5 shadow-md group-hover:scale-105 transition-transform bg-gradient-to-br from-red-500 to-rose-600 border border-red-300">
              <img
                src="/logo.jpg"
                alt="โลโก้ร้าน มันนี่หมูกระทะ x ชาบู"
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg sm:text-2xl font-black tracking-tight flex items-center gap-1.5 ${currentView === 'website' ? 'text-stone-900' : 'text-white'}`}>
                มันนี่หมูกระทะ <span className="text-red-600 text-sm sm:text-base font-bold">สวนดอก</span>
              </span>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold ${currentView === 'website' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'}`}>
                149.-
              </span>
            </div>
            <p className={`text-[11px] font-normal ${currentView === 'website' ? 'text-stone-500' : 'text-stone-400'}`}>
              บุฟเฟต์ราคาเดียว 149.- (ไม่รวมเครื่องดื่ม) อิ่มได้ไม่อั้น • ขวัญใจชาว มช. & แพทย์สวนดอก
            </p>
          </div>
        </div>

        {/* Navigation Quick Links (shown on website mode) */}
        {currentView === 'website' && (
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <a
              href="#buffet-highlights"
              className="px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Utensils className="w-3.5 h-3.5 text-red-500" />
              <span>บุฟเฟต์ 149.-</span>
            </a>
            <a
              href="#table-service"
              className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 font-bold"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              <span>แจ้งปัญหา/เรียกพนักงาน</span>
            </a>
            <a
              href="#food-menu"
              className="px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Utensils className="w-3.5 h-3.5 text-red-500" />
              <span>เมนูอาหาร & seasonal drop</span>
            </a>
            <a
              href="#park-easy"
              className="px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Park Easy @ Money</span>
            </a>
            <a
              href="#live-queue"
              className="px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Ticket className="w-3.5 h-3.5 text-red-500" />
              <span>จองคิว</span>
            </a>
            <a
              href="#member-dashboard"
              className="px-2.5 py-1.5 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1.5 font-bold"
            >
              <Award className="w-3.5 h-3.5 text-red-600" />
              <span>สะสมแต้ม LINE OA</span>
            </a>
            <a
              href="#cashier-rating"
              className="px-2.5 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-bold"
            >
              <span>🐷 คะแนนความพึงพอใจ</span>
            </a>
            <a
              href="#location"
              className="px-2.5 py-1.5 rounded-lg text-stone-700 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 font-medium"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>พิกัดร้าน</span>
            </a>
          </nav>
        )}

        {/* View Switcher Toggle & Emergency Actions */}
        <div className="flex items-center gap-2">
          {/* Main Website vs Staff Ops Switcher */}
          <div className={`p-1 rounded-xl flex items-center text-xs ${currentView === 'website' ? 'bg-stone-100 border border-stone-200' : 'bg-stone-900 border border-stone-800'}`}>
            <button
              onClick={() => onToggleView('website')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                currentView === 'website'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>หน้าเว็บร้าน</span>
            </button>
            <button
              onClick={() => onToggleView('operations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer relative ${
                currentView === 'operations'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : currentView === 'website'
                  ? 'text-stone-600 hover:text-stone-900'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ระบบพนักงาน (Ops)</span>
              {urgentCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Emergency Button */}
          <button
            onClick={onQuickEmergency}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            title="แจ้งเหตุด่วนหน้าร้าน (ความปลอดภัยอาหาร / เรียกซ้ำเกิน 2 ครั้ง)"
          >
            <PhoneCall className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">แจ้งเหตุด่วน</span>
          </button>
        </div>
      </div>
    </header>
  );
};
