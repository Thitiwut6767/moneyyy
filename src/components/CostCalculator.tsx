import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Scale,
  Calculator,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Target,
  Calendar,
  Flame,
  ChevronDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CostData } from '../types';

interface CostCalculatorProps {
  initialData: CostData;
  onAskAi: (prompt: string) => void;
}

export const CostCalculator: React.FC<CostCalculatorProps> = ({ initialData, onAskAi }) => {
  // Food cost inputs
  const [sales, setSales] = useState<number>(initialData.todaySales);
  const [ingredientsCost, setIngredientsCost] = useState<number>(initialData.todayIngredientsCost);

  // Target sales state
  const [targetSales, setTargetSales] = useState<number>(35000);

  // Pork price inputs
  const [currentPorkPrice, setCurrentPorkPrice] = useState<number>(initialData.currentPorkPrice);
  const [prevPorkPrice, setPrevPorkPrice] = useState<number>(initialData.prevPorkPrice);

  // Break-even inputs
  const [fixedCost, setFixedCost] = useState<number>(initialData.fixedCostDaily);
  const [variableCost, setVariableCost] = useState<number>(initialData.variableCostPerHead);
  const pricePerHead = 149; // Fixed buffet price

  // Chart view tab
  const [chartMode, setChartMode] = useState<'sales' | 'foodcost'>('sales');

  // Calculations
  const foodCostPercent = sales > 0 ? Number(((ingredientsCost / sales) * 100).toFixed(2)) : 0;
  const isFoodCostHigh = foodCostPercent > 35;

  const porkDiffPercent =
    prevPorkPrice > 0
      ? Number((((currentPorkPrice - prevPorkPrice) / prevPorkPrice) * 100).toFixed(2))
      : 0;
  const isPorkSurged = Math.abs(porkDiffPercent) > 5;

  const marginPerHead = pricePerHead - variableCost;
  const breakEvenHeads = marginPerHead > 0 ? Math.ceil(fixedCost / marginPerHead) : 0;
  const breakEvenSales = breakEvenHeads * pricePerHead;
  const currentHeads = Math.round(sales / pricePerHead);
  const breakEvenProgress = breakEvenHeads > 0 ? Math.min(Math.round((currentHeads / breakEvenHeads) * 100), 150) : 0;

  // 7-day Historical + Today's Realtime Data for Recharts
  const salesHistory = [
    { day: 'จันทร์ 17 ก.ค.', shortDay: 'จ.', sales: 27800, target: 32000, heads: 186, foodCostPercent: 32.5, breakEven: breakEvenSales },
    { day: 'อังคาร 18 ก.ค.', shortDay: 'อ.', sales: 29400, target: 32000, heads: 197, foodCostPercent: 31.8, breakEven: breakEvenSales },
    { day: 'พุธ 19 ก.ค.', shortDay: 'พ.', sales: 31800, target: 32000, heads: 213, foodCostPercent: 33.1, breakEven: breakEvenSales },
    { day: 'พฤหัส 20 ก.ค.', shortDay: 'พฤ.', sales: 35100, target: 32000, heads: 235, foodCostPercent: 32.9, breakEven: breakEvenSales },
    { day: 'ศุกร์ 21 ก.ค.', shortDay: 'ศ.', sales: 43200, target: 38000, heads: 290, foodCostPercent: 34.2, breakEven: breakEvenSales },
    { day: 'เสาร์ 22 ก.ค.', shortDay: 'ส.', sales: 48500, target: 40000, heads: 325, foodCostPercent: 34.6, breakEven: breakEvenSales },
    { day: 'อาทิตย์ 23 ก.ค.', shortDay: 'อา.', sales: 45200, target: 40000, heads: 303, foodCostPercent: 33.8, breakEven: breakEvenSales },
    { day: 'วันนี้ (สด)', shortDay: 'วันนี้', sales: sales, target: targetSales, heads: currentHeads, foodCostPercent: foodCostPercent, breakEven: breakEvenSales },
  ];

  const totalWeekSales = salesHistory.reduce((acc, curr) => acc + curr.sales, 0);
  const targetAchievedDays = salesHistory.filter((item) => item.sales >= item.target).length;
  const avgFoodCost = (salesHistory.reduce((acc, curr) => acc + curr.foodCostPercent, 0) / salesHistory.length).toFixed(1);

  // Custom Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isTargetMet = data.sales >= data.target;
      return (
        <div className="bg-stone-900 border border-stone-700 p-3 rounded-xl shadow-2xl text-xs space-y-1 z-50">
          <p className="font-bold text-white border-b border-stone-800 pb-1 flex items-center justify-between gap-3">
            <span>📅 {data.day}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isTargetMet ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              {isTargetMet ? 'ทะลุเป้าหมาย ✨' : 'ต่ำกว่าเป้า'}
            </span>
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-stone-300 pt-1">
            <span>ยอดขายจริง:</span>
            <span className="font-bold text-amber-400 text-right font-mono">
              {data.sales.toLocaleString()} ฿
            </span>
            <span>เป้าหมายยอด:</span>
            <span className="font-bold text-stone-400 text-right font-mono">
              {data.target.toLocaleString()} ฿
            </span>
            <span>จำนวนลูกค้า:</span>
            <span className="text-right font-mono">{data.heads} หัว</span>
            <span>จุดคุ้มทุน (BEP):</span>
            <span className="text-right font-mono text-stone-400">{data.breakEven.toLocaleString()} ฿</span>
            <span>Food Cost %:</span>
            <span
              className={`font-bold text-right font-mono ${
                data.foodCostPercent > 35 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {data.foodCostPercent}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              โมดูล 2: ต้นทุนและบัญชี (Cost, Sales & Break-Even Engine)
            </h2>
            <p className="text-xs text-stone-400">
              ควบคุม Food Cost % ≤ 35% • ติดตามราคาหมูตลาด ก.ค. 2569 • คำนวณจุดคุ้มทุน • กราฟวิเคราะห์แนวโน้มยอดขาย Recharts
            </p>
          </div>
          <span className="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            สูตรโปร่งใส • โชว์วิธีคิดทุกขั้นตอน
          </span>
        </div>
        <p className="text-xs text-amber-200/90 font-medium">
          ⚠️ กฎเหล็กของร้านมันนี่หมูกระทะ: ทุกการคำนวณเชิงตัวเลขต้องแสดงสูตรคำนวณเสมอ ห้ามให้แค่ตัวเลขเปล่า!
        </p>
      </div>

      {/* NEW: RECHARTS SALES TREND & TARGET GRAPH */}
      <section className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        {/* Header of Chart Section */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                แนวโน้มยอดขายรายวันเทียบกับเป้าหมาย (Recharts Analytics)
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              ติดตามประสิทธิภาพยอดขายรายวันเทียบเป้าหมายและจุดคุ้มทุน เพื่อให้พนักงานเห็นภาพรวมชัดเจน
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2">
            <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-center">
              <span className="text-[10px] text-stone-400 block">ยอดรวมสัปดาห์</span>
              <span className="font-bold text-amber-400 font-mono">{totalWeekSales.toLocaleString()} ฿</span>
            </div>
            <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-center">
              <span className="text-[10px] text-stone-400 block">ผ่านเป้าหมาย</span>
              <span className="font-bold text-emerald-400 font-mono">{targetAchievedDays} / 8 วัน</span>
            </div>
            <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-center">
              <span className="text-[10px] text-stone-400 block">Food Cost เฉลี่ย</span>
              <span className={`font-bold font-mono ${Number(avgFoodCost) > 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                {avgFoodCost}%
              </span>
            </div>
          </div>
        </div>

        {/* Chart View Switcher & Target Controller */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-stone-950/80 p-3 rounded-xl border border-stone-800">
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">โหมดกราฟ:</span>
            <div className="flex gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
              <button
                onClick={() => setChartMode('sales')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  chartMode === 'sales'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                ยอดขาย vs เป้าหมาย (฿)
              </button>
              <button
                onClick={() => setChartMode('foodcost')}
                className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  chartMode === 'foodcost'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Food Cost % รายวัน
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300">ตั้งเป้าหมายยอดขายวันนี้:</span>
              <input
                type="number"
                value={targetSales}
                onChange={(e) => setTargetSales(Number(e.target.value))}
                className="w-24 bg-stone-900 border border-stone-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-mono text-right outline-none focus:border-amber-500"
              />
              <span className="text-stone-400">บาท</span>
            </div>

            <button
              onClick={() =>
                onAskAi(
                  `วิเคราะห์แนวโน้มยอดขายสัปดาห์นี้: ยอดรวม ${totalWeekSales.toLocaleString()} บาท ผ่านเป้า ${targetAchievedDays}/8 วัน Food Cost เฉลี่ย ${avgFoodCost}% แนะนำกลยุทธ์เพิ่มยอดขายช่วงวันธรรมดา`
                )
              }
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>วิเคราะห์กราฟด้วย AI</span>
            </button>
          </div>
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'sales' ? (
              <ComposedChart data={salesHistory} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis
                  dataKey="shortDay"
                  stroke="#a8a29e"
                  fontSize={12}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#a8a29e"
                  fontSize={11}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  domain={[15000, 55000]}
                  dx={-5}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />

                {/* Break-even reference line */}
                <ReferenceLine
                  y={breakEvenSales}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `จุดคุ้มทุน (${breakEvenSales.toLocaleString()}฿)`,
                    fill: '#f87171',
                    fontSize: 10,
                    position: 'insideBottomLeft',
                  }}
                />

                {/* Sales Area */}
                <Area
                  type="monotone"
                  dataKey="sales"
                  name="ยอดขายจริง (บาท)"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#salesGradient)"
                />

                {/* Target Line */}
                <Line
                  type="stepAfter"
                  dataKey="target"
                  name="เป้าหมายยอดขาย (บาท)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#38bdf8' }}
                />
              </ComposedChart>
            ) : (
              <ComposedChart data={salesHistory} margin={{ top: 15, right: 20, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                <XAxis
                  dataKey="shortDay"
                  stroke="#a8a29e"
                  fontSize={12}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#a8a29e"
                  fontSize={11}
                  unit="%"
                  domain={[25, 40]}
                  dx={-5}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }}
                />

                {/* 35% Threshold Warning Line */}
                <ReferenceLine
                  y={35}
                  stroke="#dc2626"
                  strokeWidth={2}
                  label={{
                    value: 'เพดานเตือน Food Cost 35%',
                    fill: '#ef4444',
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />

                {/* Food Cost % Bar and Line */}
                <Bar
                  dataKey="foodCostPercent"
                  name="Food Cost %"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="foodCostPercent"
                  name="แนวโน้ม Food Cost %"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#fbbf24' }}
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-stone-400 bg-stone-950 p-2.5 rounded-xl border border-stone-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            วันศุกร์-เสาร์ ยอดขายแตะ 43,000 - 48,000 บาท สูงกว่าเป้าหมายจากกลุ่มนักศึกษาและแพทย์สวนดอก
          </span>
          <span className="text-amber-300 font-mono">
            ยอดขายวันนี้: {sales.toLocaleString()} บาท ({currentHeads} ท่าน)
          </span>
        </div>
      </section>

      {/* Grid of 3 Main Calculators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Food Cost % Card */}
        <div
          className={`rounded-2xl p-5 border shadow-xl flex flex-col justify-between transition-all ${
            isFoodCostHigh
              ? 'bg-red-950/20 border-red-700/60'
              : 'bg-stone-900 border-stone-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                1. Food Cost %
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isFoodCostHigh
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isFoodCostHigh ? '⚠️ เกินเกณฑ์ 35%!' : '✅ อยู่ในเกณฑ์ปกติ'}
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ยอดขายวันนั้น (บาท):
                </label>
                <input
                  type="number"
                  value={sales}
                  onChange={(e) => setSales(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ต้นทุนวัตถุดิบที่ใช้ไป (บาท):
                </label>
                <input
                  type="number"
                  value={ingredientsCost}
                  onChange={(e) => setIngredientsCost(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Formula Block */}
            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 mb-4">
              <div className="text-[11px] text-stone-400 mb-1 font-mono">สูตรคำนวณ:</div>
              <div className="text-xs font-mono text-amber-300 font-semibold mb-2">
                Food Cost % = (ต้นทุนวัตถุดิบ ÷ ยอดขาย) × 100
              </div>
              <div className="text-xs font-mono text-stone-300 bg-stone-900 p-2 rounded border border-stone-800">
                = ({ingredientsCost.toLocaleString()} ÷ {sales.toLocaleString()}) × 100
                <br />= <span className={`text-base font-bold ${isFoodCostHigh ? 'text-red-400' : 'text-emerald-400'}`}>{foodCostPercent}%</span>
              </div>
            </div>

            {/* Meter Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                <span>เกณฑ์เป้าหมาย: ≤ 35%</span>
                <span className={isFoodCostHigh ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                  {foodCostPercent}%
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${
                    isFoodCostHigh ? 'bg-red-500' : foodCostPercent > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(foodCostPercent * 2, 100)}%` }}
                />
              </div>
            </div>

            {isFoodCostHigh && (
              <div className="p-2.5 rounded-xl bg-red-900/40 border border-red-600/50 text-xs text-red-200">
                🚨 <strong>เตือนด่วน:</strong> Food Cost เกิน 35% ให้ตรวจสอบการสไลด์หมูหน้าร้านและเศษเหลือทิ้งทันที!
              </div>
            )}
          </div>

          <button
            onClick={() =>
              onAskAi(
                `วิเคราะห์ Food Cost % วันนี้: ยอดขาย ${sales} บาท วัตถุดิบ ${ingredientsCost} บาท คำนวณได้ ${foodCostPercent}% ควรปรับแผนจัดการสต็อกอย่างไร`
              )
            }
            className="mt-4 w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ให้น้องมันนี่วิเคราะห์สาเหตุ</span>
          </button>
        </div>

        {/* 2. Pork Market Price Watch Card */}
        <div
          className={`rounded-2xl p-5 border shadow-xl flex flex-col justify-between transition-all ${
            isPorkSurged
              ? 'bg-amber-950/20 border-amber-700/60'
              : 'bg-stone-900 border-stone-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                2. ราคาหมูตลาด (ก.ค. 2569)
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isPorkSurged
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isPorkSurged ? '⚠️ ขยับเกิน 5%!' : '✅ ขยับปกติ'}
              </span>
            </div>

            {/* Market Reference Badge */}
            <div className="bg-stone-950/70 p-2.5 rounded-xl border border-stone-800 mb-3 text-xs">
              <span className="text-stone-400">ราคาตลาดอ้างอิง (ก.ค. 2569):</span>
              <div className="text-amber-400 font-bold text-sm mt-0.5">
                66 - 74 บาท/กก. (เกณฑ์รับเข้าปกติ)
              </div>
            </div>

            {/* Price Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ราคารับเข้าปัจจุบัน (บาท/กก.):
                </label>
                <input
                  type="number"
                  value={currentPorkPrice}
                  onChange={(e) => setCurrentPorkPrice(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ราคาสัปดาห์ก่อนหน้า (บาท/กก.):
                </label>
                <input
                  type="number"
                  value={prevPorkPrice}
                  onChange={(e) => setPrevPorkPrice(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Formula Block */}
            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 mb-4">
              <div className="text-[11px] text-stone-400 mb-1 font-mono">สูตรคำนวณ % การเปลี่ยนแปลง:</div>
              <div className="text-xs font-mono text-amber-300 font-semibold mb-2">
                % ขยับ = ((ราคาปัจจุบัน − ราคาสัปดาห์ก่อน) ÷ ราคาสัปดาห์ก่อน) × 100
              </div>
              <div className="text-xs font-mono text-stone-300 bg-stone-900 p-2 rounded border border-stone-800">
                = (({currentPorkPrice} − {prevPorkPrice}) ÷ {prevPorkPrice}) × 100
                <br />= <span className={`text-base font-bold ${isPorkSurged ? 'text-amber-400' : 'text-emerald-400'}`}>{porkDiffPercent > 0 ? `+${porkDiffPercent}` : porkDiffPercent}%</span>
              </div>
            </div>

            {isPorkSurged && (
              <div className="p-2.5 rounded-xl bg-amber-900/40 border border-amber-600/50 text-xs text-amber-200">
                ⚠️ <strong>เตือนราคาตลาด:</strong> ราคาหมูขยับเกิน 5% จากสัปดาห์ก่อน ({porkDiffPercent}%) ให้สต็อกล่วงหน้าและคุมมาตรฐานการตัดแต่ง
              </div>
            )}
          </div>

          <button
            onClick={() =>
              onAskAi(
                `ราคาเนื้อหมูปัจจุบัน ${currentPorkPrice} บ./กก. เทียบสัปดาห์ก่อน ${prevPorkPrice} บ./กก. ขยับขึ้น ${porkDiffPercent}% ขอคำแนะนำการคุมต้นทุนหมูกระทะ 149 บาท`
              )
            }
            className="mt-4 w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ขอคำแนะนำจัดการสต็อกหมู</span>
          </button>
        </div>

        {/* 3. Break-Even per Day Card */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-400" />
                3. จุดคุ้มทุนต่อวัน (Break-Even)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                บุฟเฟต์ 149.-/หัว
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ต้นทุนคงที่ต่อวัน (ค่าเช่า+ค่าแรง+ค่าไฟ):
                </label>
                <input
                  type="number"
                  value={fixedCost}
                  onChange={(e) => setFixedCost(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1">
                  ต้นทุนผันแปรต่อหัว (วัตถุดิบ/คน):
                </label>
                <input
                  type="number"
                  value={variableCost}
                  onChange={(e) => setVariableCost(Number(e.target.value))}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-mono focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Formula Block */}
            <div className="bg-stone-950/90 rounded-xl p-3 border border-stone-800 mb-4">
              <div className="text-[11px] text-stone-400 mb-1 font-mono">สูตรคำนวณจุดคุ้มทุน:</div>
              <div className="text-xs font-mono text-amber-300 font-semibold mb-2">
                Break-even (หัว) = ต้นทุนคงที่ ÷ (ราคาต่อหัว 149 − ผันแปรต่อหัว)
              </div>
              <div className="text-xs font-mono text-stone-300 bg-stone-900 p-2 rounded border border-stone-800">
                = {fixedCost.toLocaleString()} ÷ ({pricePerHead} − {variableCost})
                <br />= {fixedCost.toLocaleString()} ÷ {marginPerHead}
                <br />= <span className="text-base font-bold text-amber-400">{breakEvenHeads} หัว/วัน</span>
                <span className="text-[11px] text-stone-400 block mt-0.5">
                  (คิดเป็นยอดขายขั้นต่ำ {breakEvenSales.toLocaleString()} บาท)
                </span>
              </div>
            </div>

            {/* Progress Bar vs Current Heads */}
            <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-800 text-xs">
              <div className="flex justify-between text-stone-300 mb-1">
                <span>ยอดลูกค้ารวมวันนี้:</span>
                <span className="font-bold text-white">{currentHeads} / {breakEvenHeads} หัว</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full ${currentHeads >= breakEvenHeads ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(breakEvenProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-stone-400">
                <span>สถานะ: {currentHeads >= breakEvenHeads ? '🎉 คุ้มทุนแล้ว (มีกำไร)' : `ขาดอีก ${breakEvenHeads - currentHeads} หัว`}</span>
                <span className="font-mono text-amber-400">{breakEvenProgress}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              onAskAi(
                `คำนวณ Break-even: ต้นทุนคงที่ ${fixedCost} บ. ต้นทุนผันแปร ${variableCost} บ./หัว ขายหัวละ 149 บ. วันนี้มีลูกค้า ${currentHeads} คน คุ้มทุนหรือยัง`
              )
            }
            className="mt-4 w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ให้น้องมันนี่สรุปกำไรขาดทุน</span>
          </button>
        </div>
      </div>
    </div>
  );
};
