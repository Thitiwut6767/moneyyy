import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = `คุณคือ "น้องมันนี่" ผู้ช่วย AI ประจำร้านมันนี่หมูกระทะ สาขาสวนดอก เชียงใหม่
ทำหน้าที่สนับสนุนพนักงานหน้างาน 4 เรื่องหลัก: แจ้งเตือนปัญหา, ต้นทุน/บัญชี, คิว, สมาชิก

บริบทร้าน:
- หมูกระทะ+ชาบูบุฟเฟต์ราคาเดียว 149 บาท ไม่จำกัดเวลา เปิด 16:00-23:00 น.
- ทำเล: สาขาสวนดอก เชียงใหม่
- กลุ่มเป้าหมายหลัก: นักศึกษาและบุคลากรทางการแพทย์ ย่านสวนดอก เชียงใหม่ (รพ.มหาราชนครเชียงใหม่/สวนดอก, คณะแพทย์, นศ. มช.)

=== โมดูล 1: แจ้งเตือนปัญหาแบบ Real-time ===
เมื่อพนักงานพิมพ์แจ้งปัญหา:
1. จำแนกประเภท: [คิวล้น / วัตถุดิบหมด / ลูกค้าเรียกซ้ำเกิน 2 ครั้ง / อุปกรณ์ชำรุด / อื่นๆ]
2. ประเมิน Apology Level ตามแนวทาง Robinson 2019:
   - Level 1 (ปัญหาความปลอดภัยอาหาร: สิ่งแปลกปลอม, เนื้อเน่าเสีย, อาหารเป็นพิษ, สารเคมี) → แจ้งผู้จัดการทันที ("ผู้จัดการนุ่น")
   - Level 2-3 (บริการล่าช้า/ไม่ทั่วถึง: รอนานเกินควร, ลืมออเดอร์, เตาดับไม่เปลี่ยน, คิวหลุดเวลา) → แจ้งหัวหน้ากะ ("หัวหน้ากะบอย" หรือ "หัวหน้ากะแนน")
   - Level 4-5 (ปัญหาเล็กน้อย: ของใช้/น้ำจิ้มหมดชั่วคราว, ช้อนส้อมขาดช่วงสั้น, ทิชชูหมด) → พนักงานหน้างานจัดการเอง
3. ร่างข้อความขอโทษลูกค้าให้ตามระดับ พร้อมแนะนำ Service Recovery (เช่น เปลี่ยนอาหารทันที, แถมชีสดิปฟรี, มอบคูปองส่วนลด, เปลี่ยนโต๊ะ)
4. ถ้าลูกค้ากดเรียกซ้ำเกิน 2 ครั้ง (เช่น 3 ครั้งขึ้นไป):
   ให้สรุปเป็น JSON ส่งต่อ n8n เสมอ:
   \`\`\`json
   {
     "table_id": "...",
     "issue_type": "ลูกค้าเรียกซ้ำเกิน 2 ครั้ง",
     "severity_level": "Level 2",
     "timestamp": "2026-09-23T..."
   }
   \`\`\`
   และระบุอย่างชัดเจนว่า "⚡ ต้องส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที"

=== โมดูล 2: ต้นทุนและบัญชี ===
- Food Cost % = (ต้นทุนวัตถุดิบที่ใช้ไป ÷ ยอดขายวันนั้น) × 100
  * เตือนทันทีถ้าเกิน 35%! (เกณฑ์มาตรฐาน: ดีมาก < 30%, ปกติ 30-35%, เกินเกณฑ์ > 35%)
- ราคาหมูอ้างอิง: 66-74 บาท/กก. (ราคาตลาด ก.ค. 2569)
  * เตือนถ้าราคาตลาดขยับเกิน 5% จากสัปดาห์ก่อน
- Break-even ต่อวัน (จุดคุ้มทุน) = ต้นทุนคงที่ ÷ (ราคาขายเฉลี่ยต่อหัว − ต้นทุนผันแปรต่อหัว)
  * ราคาขายต่อหัวคือ 149 บาท
* กฎเหล็ก: ตอบคำถามเชิงตัวเลขต้องโชว์สูตรคำนวณและแสดงวิธีคิดอย่างละเอียดทุกครั้ง ห้ามให้แค่คำตอบเปล่าเด็ดขาด!

=== โมดูล 3: คิวและการจอง ===
- คำนวณเวลารอเฉลี่ย:
  สูตร: เวลารอเฉลี่ย (นาที) = [จำนวนโต๊ะที่รอ × เวลาหมุนเวียนเฉลี่ย 45 นาที ÷ จำนวนโต๊ะที่ว่างต่อรอบ]
- กฎการจัดการคิว: หากเวลารอเฉลี่ยคำนวณได้เกิน 30 นาที ให้แนะนำ "🛑 หยุดรับคิว Walk-in ชั่วคราวทันที" เพื่อป้องกันลูกค้ารอนานเกินเกณฑ์

=== โมดูล 4: สมาชิก/แต้มสะสม ===
- เงื่อนไขแต้ม: ทุก 100 บาท = 1 แต้ม (เช่น 149 บ. = 1 แต้ม, 2 คน 298 บ. = 2 แต้ม, 4 คน 596 บ. = 5 แต้ม)
- ระดับสิทธิพิเศษ:
  * 10 แต้ม (Tier 1): หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)
  * 35 แต้ม (Tier 2): ส่วนลด 15% บิลถัดไป
  * 50 แต้ม (Tier 3): บุฟเฟต์ฟรี 1 ท่าน (มูลค่า 149 บาท)
  * สิทธิพิเศษบุคลากรแพทย์/นศ. ย่านสวนดอก: แสดงบัตร รับฟรีน้ำแข็งถังแรก
- แจ้งเตือนพนักงานเมื่อแต้มของสมาชิกใกล้ถึงระดับรับสิทธิพิเศษ เช่น เหลือ 1-5 แต้มจะถึงสิทธิ์

=== กฎการตอบที่ต้องปฏิบัติตามอย่างเคร่งครัด ===
1. ใช้ภาษาไทย กระชับ มีโครงสร้างชัดเจน สุภาพ เป็นกันเองสไตล์ผู้ช่วยร้านอาหาร
2. ใช้ bullet list เมื่อมีหลายขั้นตอนหรือหลายประเด็น
3. **สำคัญมาก**: ถ้าเป็นปัญหาเร่งด่วน (Apology Level 1 หรือ 2) ให้ขึ้นต้นคำตอบด้วย "แจ้งด่วน:" เสมอ และระบุชื่อผู้ดูแลที่รับผิดชอบเคสนั้นๆ ทันทีในบรรทัดแรก! (เช่น "แจ้งด่วน: [ผู้จัดการนุ่น] รับผิดชอบเคสนี้ทันที" หรือ "แจ้งด่วน: [หัวหน้ากะบอย] เข้าหน้างานทันที")
`;

// In-memory demo data store for app features
const store = {
  incidents: [
    {
      id: 'INC-101',
      tableId: 'โต๊ะ 14',
      issueType: 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
      severityLevel: 'Level 2',
      detail: 'ลูกค้ากดกริ่งเรียก 3 ครั้ง ขอเติมเตาถ่านแต่พนักงานกะบ่ายกำลังติดเสิร์ฟโต๊ะใหญ่',
      responsible: 'หัวหน้ากะบอย',
      status: 'Escalated',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      n8nDispatched: true,
      lineCouponSent: true,
    },
    {
      id: 'INC-102',
      tableId: 'โต๊ะ 06',
      issueType: 'วัตถุดิบหมด',
      severityLevel: 'Level 3',
      detail: 'สามชั้นสไลด์ในไลน์บุฟเฟต์หมดชั่วคราว ลูกค้าถามหา 2 โต๊ะ',
      responsible: 'หัวหน้ากะแนน (ครัวเตรียม)',
      status: 'Resolved',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      n8nDispatched: false,
      lineCouponSent: false,
    },
  ],
  queueData: {
    waitingTables: 6,
    openTablesPerRound: 2,
    turnoverTime: 45,
    isWalkInClosed: false,
  },
  costData: {
    todaySales: 22350, // 150 heads * 149
    todayIngredientsCost: 6950,
    currentPorkPrice: 72, // Baht/kg
    prevPorkPrice: 68,
    fixedCostDaily: 4500, // Rent, staff salary, electric, water
    variableCostPerHead: 75,
  },
  members: [
    {
      id: 'MEM-001',
      name: 'นศ.พ. ธนกฤต (สวนดอก)',
      phone: '089-123-4567',
      type: 'นักศึกษาแพทย์ มช.',
      points: 47,
      totalVisits: 12,
    },
    {
      id: 'MEM-002',
      name: 'พยาบาลสุภาพร (รพ.มหาราช)',
      phone: '081-987-6543',
      type: 'บุคลากรทางการแพทย์',
      points: 18,
      totalVisits: 6,
    },
    {
      id: 'MEM-003',
      name: 'คุณกิตติศักดิ์',
      phone: '084-555-8899',
      type: 'ลูกค้าทั่วไป',
      points: 32,
      totalVisits: 8,
    },
  ],
};

// API: AI Chat with น้องมันนี่
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'ข้อความไม่ถูกต้อง' });
    }

    if (ai) {
      try {
        // Construct conversation contents
        const contents: any[] = [];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            if (item.sender === 'user') {
              contents.push({ role: 'user', parts: [{ text: item.text }] });
            } else if (item.sender === 'bot') {
              contents.push({ role: 'model', parts: [{ text: item.text }] });
            }
          }
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
        });

        const reply = response.text || '';
        return res.json({ reply, source: 'gemini' });
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to local engine:', geminiError?.message);
      }
    }

    // Smart Local Fallback Engine adhering 100% to Prompt Guidelines
    const localReply = generateLocalAssistantResponse(message);
    return res.json({ reply: localReply, source: 'local_engine' });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผลข้อความ' });
  }
});

// API: Process Incident & Auto-evaluate Robinson Level + n8n JSON
app.post('/api/incident/report', (req, res) => {
  try {
    const { tableId, issueType, detail, repeatCalls } = req.body;

    let severityLevel = 'Level 4';
    let responsible = 'พนักงานหน้างาน';
    let isUrgent = false;

    // Robinson 2019 Apology Level logic
    if (detail && (detail.includes('สิ่งแปลกปลอม') || detail.includes('หนอน') || detail.includes('แมลงสาบ') || detail.includes('เส้นผม') || detail.includes('เน่า') || detail.includes('บูด') || detail.includes('ท้องเสีย') || detail.includes('ความปลอดภัย'))) {
      severityLevel = 'Level 1';
      responsible = 'ผู้จัดการนุ่น';
      isUrgent = true;
    } else if (repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง') {
      severityLevel = 'Level 2';
      responsible = 'หัวหน้ากะบอย';
      isUrgent = true;
    } else if (issueType === 'คิวล้น' || issueType === 'วัตถุดิบหมด') {
      severityLevel = 'Level 3';
      responsible = 'หัวหน้ากะแนน';
      isUrgent = false;
    } else if (issueType === 'อุปกรณ์ชำรุด') {
      severityLevel = 'Level 3';
      responsible = 'หัวหน้ากะบอย';
      isUrgent = false;
    }

    const n8nPayload = (repeatCalls > 2 || issueType === 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง') ? {
      table_id: tableId || 'ไม่ระบุโต๊ะ',
      issue_type: 'ลูกค้าเรียกซ้ำเกิน 2 ครั้ง',
      severity_level: severityLevel,
      timestamp: new Date().toISOString(),
      action_required: 'ส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที',
    } : null;

    const apologyScript = generateApologyScript(severityLevel, tableId, detail);
    const serviceRecovery = generateServiceRecovery(severityLevel);

    const newIncident = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      tableId: tableId || 'หน้าร้าน',
      issueType: issueType || 'อื่นๆ',
      severityLevel,
      detail: detail || '',
      responsible,
      status: isUrgent ? 'Escalated' : 'Pending',
      timestamp: new Date().toISOString(),
      n8nDispatched: Boolean(n8nPayload),
      lineCouponSent: Boolean(n8nPayload),
      apologyScript,
      serviceRecovery,
      n8nPayload,
    };

    store.incidents.unshift(newIncident);

    return res.json({
      success: true,
      incident: newIncident,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// API: Get incidents
app.get('/api/incidents', (_req, res) => {
  res.json(store.incidents);
});

// API: Calculations (Cost, Queue, Points)
app.get('/api/dashboard-data', (_req, res) => {
  // Compute cost metrics
  const foodCostPercent = (store.costData.todayIngredientsCost / store.costData.todaySales) * 100;
  const porkDiff = ((store.costData.currentPorkPrice - store.costData.prevPorkPrice) / store.costData.prevPorkPrice) * 100;
  const breakEvenHeads = store.costData.fixedCostDaily / (149 - store.costData.variableCostPerHead);
  const currentHeads = Math.round(store.costData.todaySales / 149);

  // Compute queue metrics
  const { waitingTables, turnoverTime, openTablesPerRound } = store.queueData;
  const estimatedWaitTime = openTablesPerRound > 0 ? (waitingTables * turnoverTime) / openTablesPerRound : 0;
  const shouldStopWalkIn = estimatedWaitTime > 30;

  res.json({
    incidents: store.incidents,
    cost: {
      ...store.costData,
      foodCostPercent: Number(foodCostPercent.toFixed(1)),
      isFoodCostHigh: foodCostPercent > 35,
      porkDiffPercent: Number(porkDiff.toFixed(1)),
      isPorkPriceSurged: Math.abs(porkDiff) > 5,
      breakEvenHeads: Math.ceil(breakEvenHeads),
      currentHeads,
    },
    queue: {
      ...store.queueData,
      estimatedWaitTime: Math.round(estimatedWaitTime),
      shouldStopWalkIn,
    },
    members: store.members,
  });
});

// Helper for Robinson 2019 Apology Script
function generateApologyScript(level: string, tableId: string, detail: string): string {
  switch (level) {
    case 'Level 1':
      return `(ผู้จัดการนุ่นเข้าพบลูกค้าที่ ${tableId} ทันที): "กราบขออภัยคุณลูกค้าอย่างสูงยิ่งนะคะ/ครับ ทางร้านมันนี่หมูกระทะให้ความสำคัญสูงสุดกับสุขอนามัยและความปลอดภัยของอาหาร ทางเราขออนุญาตเก็บจาน/หม้อนี้ไปตรวจสอบทันที พร้อมเปลี่ยนเซตอาหารใหม่ทั้งโต๊ะ และขอดูแลบิลนี้ให้คุณลูกค้าเป็นกรณีพิเศษค่ะ"`;
    case 'Level 2':
      return `(หัวหน้ากะเข้าพบลูกค้าที่ ${tableId} พร้อมชีสดิป): "ขออภัยคุณลูกค้าที่ ${tableId} เป็นอย่างยิ่งเลยนะคะ/ครับที่ทำให้ต้องรอนานและเรียกซ้ำ ทางร้านกำลังเร่งจัดการเติมเตา/เสิร์ฟให้เดี๋ยวนี้เลยค่ะ ขออนุญาตมอบชีสดิปฟรีและคูปองส่วนลดพิเศษผ่าน LINE OA สำหรับรอบหน้านะคะ"`;
    case 'Level 3':
      return `"ขออภัยในความไม่สะดวกด้วยนะคะคุณลูกค้า ทางร้านกำลังเร่งเติมวัตถุดิบ/เปลี่ยนอุปกรณ์ให้โต๊ะ ${tableId} ทันทีภายใน 3 นาทีนี้ค่ะ"`;
    default:
      return `"ขออภัยที่ให้รอนะคะ เดี๋ยวทางน้องพนักงานรีบนำมาให้ที่โต๊ะ ${tableId} ทันทีเลยค่ะ"`;
  }
}

function generateServiceRecovery(level: string): string {
  switch (level) {
    case 'Level 1':
      return 'ยกเว้นค่าอาหารมื้อนี้ทั้งโต๊ะทันที + มอบ Voucher ทานฟรีครั้งหน้า + บันทึกรายงาน HACCP เพื่อตรวจสอบล็อตวัตถุดิบ';
    case 'Level 2':
      return 'ฟรีชีสดิปมื้อนี้ทันที + ยิงคูปองส่วนลด 50 บาทเข้า LINE OA อัตโนมัติ + หัวหน้ากะดูแลใกล้ชิด';
    case 'Level 3':
      return 'เติมวัตถุดิบ/เปลี่ยนเตาไฟแรงให้ทันที + เสิร์ฟของทานเล่นรองท้องฟรี (เช่น เกี๊ยวทอดกรอบ)';
    default:
      return 'พนักงานหน้างานจัดส่งของใช้ให้ลูกค้าทันทีพร้อมกล่าวขอบคุณด้วยรอยยิ้ม';
  }
}

// Smart Local Fallback Response Engine
function generateLocalAssistantResponse(message: string): string {
  const lower = message.toLowerCase();

  // Urgent Incident or Level 1 Safety check
  if (lower.includes('เส้นผม') || lower.includes('แมลง') || lower.includes('สิ่งแปลกปลอม') || lower.includes('อาหารเสีย') || lower.includes('เน่า') || lower.includes('บูด')) {
    return `แจ้งด่วน: [ผู้จัดการนุ่น] รับผิดชอบเคสนี้ทันที!

• จำแนกประเภท: ปัญหาความปลอดภัยอาหาร (Apology Level 1)
• การปฏิบัติการเร่งด่วน:
  - ผู้จัดการนุ่นต้องเข้าพบลูกค้าที่โต๊ะด้วยตนเองภายใน 1 นาที
  - เปลี่ยนหม้อ/ชุดอาหารใหม่ยกโต๊ะทันที หรือยกเว้นค่าอาหารมื้อนี้ (Service Recovery)
  - เก็บตัวอย่างเพื่อตรวจสอบล็อตวัตถุดิบในครัว
• ร่างคำขอโทษลูกค้า:
  "กราบขออภัยคุณลูกค้าอย่างสูงยิ่งค่ะ ทางร้านมันนี่หมูกระทะให้ความสำคัญกับความสะอาดปลอดภัยสูงสุด ทางร้านขอนำจานนี้ไปตรวจสอบทันที พร้อมเปลี่ยนชุดอาหารใหม่ให้ทั้งโต๊ะ และขอดูแลมื้อนี้ให้คุณลูกค้าเป็นกรณีพิเศษนะคะ"`;
  }

  // Repeat calls > 2 times check
  if (lower.includes('เรียกซ้ำ') || lower.includes('กดกริ่ง 3') || lower.includes('เรียก 3 ครั้ง') || lower.includes('เรียกหลายครั้ง') || lower.includes('เกิน 2')) {
    const tableMatch = message.match(/โต๊ะ\s*(\d+)/);
    const tableId = tableMatch ? `โต๊ะ ${tableMatch[1]}` : 'โต๊ะลูกค้า';

    return `แจ้งด่วน: [หัวหน้ากะบอย] เข้าหน้างานที่ ${tableId} ทันที!

• จำแนกประเภท: ลูกค้าเรียกซ้ำเกิน 2 ครั้ง
• ระดับความรุนแรง: Apology Level 2 (บริการล่าช้า/ตกหล่น)
• การแก้ไขปัญหา (Service Recovery):
  - หัวหน้ากะเข้าชี้แจงด้วยความนอบน้อม พร้อมจัดการสิ่งที่ลูกค้าต้องการทันที
  - มอบชีสดิปฟรีหรือเมนูพิเศษปลอบใจ
• สรุป JSON ส่งต่อ n8n เพื่อยิง Webhook:
\`\`\`json
{
  "table_id": "${tableId}",
  "issue_type": "ลูกค้าเรียกซ้ำเกิน 2 ครั้ง",
  "severity_level": "Level 2",
  "timestamp": "${new Date().toISOString()}"
}
\`\`\`
⚡ สถานะ: ต้องส่งคูปองส่วนลดอัตโนมัติผ่าน LINE OA ทันที`;
  }

  // Cost & Accounting check
  if (lower.includes('food cost') || lower.includes('ต้นทุน') || lower.includes('จุดคุ้มทุน') || lower.includes('break-even') || lower.includes('ราคาหมู')) {
    return `น้องมันนี่สรุปการคำนวณต้นทุนและบัญชีให้เรียบร้อยค่ะ:

1. สูตรคำนวณ Food Cost %:
   • สูตร: (ต้นทุนวัตถุดิบที่ใช้ไป ÷ ยอดขายวันนั้น) × 100
   • ตัวอย่างวันนี้: (6,950 ÷ 22,350) × 100 = 31.09% (ปกติ เกณฑ์มาตรฐานไม่เกิน 35%)
   • ข้อควรระวัง: หาก Food Cost % เกิน 35% ระบบจะส่งสัญญาณเตือนให้ตรวจสอบสัดส่วนการสไลด์หมูและการสูญเสีย (Waste) หน้าร้าน

2. ราคาหมูอ้างอิงตลาด (ก.ค. 2569):
   • กรอบราคามาตรฐาน: 66 - 74 บาท/กก.
   • ปัจจุบันรับเข้า: 72 บาท/กก. (เทียบสัปดาห์ก่อน 68 บาท/กก. เพิ่มขึ้น +5.88%)
   • แจ้งเตือน: ราคาขยับเกิน 5% จากสัปดาห์ก่อนหน้า ควรควบคุมการหั่นและการสั่งสต็อกอย่างแม่นยำ

3. Break-even ต่อวัน (จุดคุ้มทุน):
   • สูตร: ต้นทุนคงที่ ÷ (ราคาขายเฉลี่ยต่อหัว − ต้นทุนผันแปรต่อหัว)
   • คำนวณ: 4,500 ÷ (149 − 75) = 4,500 ÷ 74 = 60.81 หัว
   • สรุป: ร้านต้องมีลูกค้าอย่างน้อย 61 หัว/วัน ถึงจะคุ้มทุน (ยอดขายรวม 9,089 บาท)`;
  }

  // Queue & Wait time check
  if (lower.includes('คิว') || lower.includes('รอ') || lower.includes('walk-in') || lower.includes('เวลารอ')) {
    return `น้องมันนี่สรุปสถานะคิวและการคำนวณเวลารอให้ค่ะ:

• สูตรคำนวณเวลารอเฉลี่ย:
  เวลารอเฉลี่ย (นาที) = [จำนวนโต๊ะที่รอ × เวลาหมุนเวียนเฉลี่ย 45 นาที ÷ จำนวนโต๊ะที่ว่างต่อรอบ]

• ตัวอย่างสถานการณ์ขณะนี้ (รอ 6 โต๊ะ, ว่างเฉลี่ย 2 โต๊ะต่อรอบ):
  เวลารอ = [6 × 45 ÷ 2] = 270 ÷ 2 = 135 นาที (หรือ 2 ชั่วโมง 15 นาที)

• นโยบายการรับคิวหน้าร้าน:
  🛑 แนะนำหยุดรับคิว Walk-in ชั่วคราวทันที! เนื่องจากเวลารอเฉลี่ยเกิน 30 นาที เพื่อรักษามาตรฐานการบริการและความพึงพอใจของลูกค้านักศึกษาและบุคลากรทางการแพทย์ค่ะ`;
  }

  // Member points check
  if (lower.includes('แต้ม') || lower.includes('สมาชิก') || lower.includes('member') || lower.includes('สิทธิพิเศษ')) {
    return `น้องมันนี่สรุปข้อมูลสิทธิประโยชน์สมาชิกและแต้มสะสมค่ะ:

• อัตราการสะสมแต้ม:
  - ทุกๆ 100 บาท = 1 แต้ม (คำนวณจากยอดสุทธิ เช่น 149.- ได้ 1 แต้ม, 2 ท่าน 298.- ได้ 2 แต้ม, 4 ท่าน 596.- ได้ 5 แต้ม)

• ลำดับสิทธิพิเศษแลกของรางวัล:
  - 10 แต้ม (Tier 1): หมูสไลด์พรีเมียม / ชีสดิป 1 ถ้วย (ฟรี)
  - 35 แต้ม (Tier 2): รับส่วนลด 15% บิลถัดไป
  - 50 แต้ม (Tier 3): ทานบุฟเฟต์ฟรี 1 ท่าน (มูลค่า 149 บาท)

• สิทธิพิเศษประจำสาขาสวนดอก:
  - บุคลากร รพ.มหาราช / นักศึกษาแพทย์ / นศ. มช. แสดงบัตร รับฟรีน้ำแข็งถังแรก!
• ระบบแจ้งเตือนพนักงาน: หากลูกค้ามีแต้มใกล้ถึงเป้าหมาย (เช่น มี 8 แต้ม หรือ 47 แต้ม) พนักงานควรแจ้งลูกค้าทันทีเพื่อสร้างความประทับใจค่ะ`;
  }

  // Default welcome
  return `สวัสดีค่ะ! น้องมันนี่ ผู้ช่วย AI ประจำร้านมันนี่หมูกระทะ สาขาสวนดอก พร้อมช่วยเหลือพนักงานทุกท่านค่ะ 🥓🔥

มีอะไรให้น้องมันนี่ช่วยวันนี้คะ?
• โมดูล 1: แจ้งปัญหาหน้าร้านด่วน (ประเมิน Robinson Level 1-5 + ส่งออก JSON ไปยัง n8n)
• โมดูล 2: คำนวณ Food Cost %, มอนิเตอร์ราคาหมู, คำนวณจุดคุ้มทุน Break-even
• โมดูล 3: คำนวณเวลารอคิวเฉลี่ย & นโยบายเปิด-ปิดรับ Walk-in
• โมดูล 4: เช็กยอดแต้มสะสม & สิทธิพิเศษสมาชิกแพทย์/นศ. มช.

สามารถพิมพ์แจ้งเหตุการณ์หรือกดเมนูลัดด้านบนได้เลยนะคะ!`;
}

// Server startup with Vite in Dev mode or Static in Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[น้องมันนี่ AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
