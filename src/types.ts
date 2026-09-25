export type ApologyLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5';

export type IncidentCategory =
  | 'คิวล้น'
  | 'วัตถุดิบหมด'
  | 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง'
  | 'อุปกรณ์ชำรุด'
  | 'เตาแก๊ส/แก๊สกระป๋องมีปัญหา'
  | 'ขอเปลี่ยนกระทะ'
  | 'ความปลอดภัยอาหาร'
  | 'อื่นๆ';

export interface Incident {
  id: string;
  tableId: string;
  issueType: IncidentCategory | string;
  severityLevel: ApologyLevel;
  detail: string;
  responsible: string;
  status: 'Pending' | 'Escalated' | 'Resolved';
  timestamp: string;
  repeatCalls?: number;
  n8nDispatched?: boolean;
  lineCouponSent?: boolean;
  apologyScript?: string;
  serviceRecovery?: string;
  n8nPayload?: {
    table_id: string;
    issue_type: string;
    severity_level: string;
    timestamp: string;
    action_required?: string;
  } | null;
}

export interface CostData {
  todaySales: number;
  todayIngredientsCost: number;
  foodCostPercent: number;
  isFoodCostHigh: boolean;
  currentPorkPrice: number;
  prevPorkPrice: number;
  porkDiffPercent: number;
  isPorkPriceSurged: boolean;
  fixedCostDaily: number;
  variableCostPerHead: number;
  breakEvenHeads: number;
  currentHeads: number;
}

export interface QueueData {
  waitingTables: number;
  openTablesPerRound: number;
  turnoverTime: number; // minutes (default 45)
  estimatedWaitTime: number; // minutes
  shouldStopWalkIn: boolean;
  tickets: QueueTicket[];
}

export interface QueueTicket {
  id: string;
  ticketNo: string;
  customerName: string;
  pax: number;
  phone?: string;
  category?: 'Normal' | 'Student' | 'MedicalStaff';
  status: 'Waiting' | 'Called' | 'Seated' | 'Cancelled';
  createdAt: string;
  estimatedWaitMin: number;
  queuesAhead?: number;
}

export interface MemberCoupon {
  id: string;
  code: string;
  title: string;
  pointsCost: number;
  redeemedAt: string;
  expiresAt: string;
  status: 'active' | 'used';
}

export interface MemberTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'bonus';
  points: number;
  title: string;
  timestamp: string;
  billAmount?: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  type: 'นักศึกษา มช.' | 'บุคลากรทางการแพทย์ (สวนดอก)' | 'ลูกค้าทั่วไป';
  points: number;
  totalVisits: number;
  lastVisit: string;
  lineId?: string;
  lineConnected?: boolean;
  memberCode?: string;
  coupons?: MemberCoupon[];
  transactions?: MemberTransaction[];
}

export interface BuffetItem {
  id: string;
  name: string;
  enName: string;
  category: 'pork' | 'seafood' | 'veggie' | 'sauce' | 'dessert';
  station: string;
  temp: string;
  desc: string;
  cookTip: string;
  badge: string;
  image?: string;
  dip: string;
  stockRemainingPercent: number; // 0 - 100% สัดส่วนคงเหลือในบาร์
  isSeasonalDrop?: boolean; // เมนู Seasonal Drop ประจำฤดูกาล
  seasonalNote?: string;
}

export interface ParkingSlot {
  id: string;
  zone: 'Zone A (ติดร้าน)' | 'Zone B (ในร่ม)' | 'Zone C (ลานหลัก)' | 'Moto Zone (มอเตอร์ไซค์)';
  type: 'car' | 'motorcycle';
  status: 'available' | 'occupied' | 'assigned';
  recommendedGate: 'ทางเข้า 1 (ถ.สุเทพ)' | 'ทางเข้า 2 (ซอยวัดสวนดอก)';
  distanceMeters: number;
}

export interface SubQuestionRating {
  id: string;
  categoryKey: 'parking' | 'booking' | 'waiting' | 'service' | 'payment';
  question: string;
  score: number; // 1 - 5
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  isUrgent?: boolean;
  responsible?: string;
  n8nJson?: any;
}

export interface CategoryRatingScores {
  parking: number; // การจอดรถ (1-5)
  booking: number; // การจองคิว (1-5)
  waiting: number; // การรอคิว (1-5)
  service: number; // บริการภายในร้าน (1-5)
  payment: number; // การชำระเงิน (1-5)
}

export interface CashierRating {
  id: string;
  stars: number; // 1 - 5 (Overall rating / average)
  ratingLabel: string;
  categoryRatings: CategoryRatingScores;
  tableId: string;
  billAmount?: number;
  cashierStaff: string;
  customerName?: string;
  phone?: string;
  categoryTags: string[];
  comment?: string;
  timestamp: string;
  createdAt: string;
  bonusPointsAwarded?: number;
  status: 'normal' | 'urgent_recovery';
  managerNotified?: boolean;
}

export interface CashierRatingStats {
  averageRating: number;
  totalRatings: number;
  satisfactionRate: number; // e.g. 96 (%)
  starsCount: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  categoryAverages: {
    parking: number; // การจอดรถ
    booking: number; // การจองคิว
    waiting: number; // การรอคิว
    service: number; // บริการภายในร้าน
    payment: number; // การชำระเงิน
  };
}

