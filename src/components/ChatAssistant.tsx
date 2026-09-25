import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, AlertTriangle, Zap, RefreshCw, Volume2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatAssistantProps {
  onDirectIncident?: (detail: string) => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `สวัสดีค่ะพนักงานทุกท่าน! น้องมันนี่ AI ผู้ช่วยประจำร้านมันนี่หมูกระทะ สาขาสวนดอก พร้อมซัพพอร์ตงานหน้าร้านทั้ง 4 โมดูลหลักค่ะ 🥓🔥

• **โมดูล 1 แจ้งเตือนปัญหา**: ประเมิน Apology Level (Robinson 2019) พร้อมร่างคำขอโทษ + ยิง JSON ไป n8n และ LINE OA ทันทีหากเรียกซ้ำเกิน 2 ครั้ง
• **โมดูล 2 ต้นทุน/บัญชี**: คำนวณ Food Cost % (เตือน >35%), มอนิเตอร์ราคาหมู ก.ค. 2569, คำนวณ Break-even ต่อวัน
• **โมดูล 3 คิว**: คำนวณเวลารอเฉลี่ยจากรอบ 45 นาที แนะนำหยุดรับ Walk-in เมื่อเกิน 30 นาที
• **โมดูล 4 สมาชิก**: คิดแต้ม 100 บาท = 1 แต้ม และสิทธิพิเศษ นศ. มช./บุคลากรแพทย์สวนดอก

สามารถพิมพ์เหตุการณ์จริง หรือคลิกปุ่มตัวอย่างด่วนด้านล่างได้เลยนะคะ!`,
      timestamp: 'ตอนนี้',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    {
      label: '🚨 โต๊ะ 14 เรียกซ้ำ 3 ครั้ง ขอกระทะใหม่',
      prompt: 'โต๊ะ 14 กดกริ่งเรียกซ้ำ 3 ครั้งแล้วยังไม่ได้เปลี่ยนกระทะถ่าน ลูกค้าเริ่มไม่พอใจ',
      tag: 'โมดูล 1: เรียกซ้ำ>2',
    },
    {
      label: '⚠️ พบเส้นผมในถาดหมู โต๊ะ 08',
      prompt: 'ลูกค้าโต๊ะ 08 พบเส้นผมปนในถาดหมูหมักงา แจ้งขอพบคนดูแลด่วน',
      tag: 'โมดูล 1: Level 1 ความปลอดภัย',
    },
    {
      label: '📊 คำนวณ Food Cost ยอด 22,350 บ.',
      prompt: 'วันนี้ยอดขาย 22,350 บาท ใช้วัตถุดิบไป 7,850 บาท คำนวณ Food Cost % และบอกว่าเกิน 35% ไหม',
      tag: 'โมดูล 2: Food Cost',
    },
    {
      label: '🥩 เช็กราคาหมูตลาด 72 บ. vs 68 บ.',
      prompt: 'ราคาเนื้อหมูตลาดรอบนี้ 72 บาท/กก. สัปดาห์ก่อน 68 บาท/กก. คำนวณ % การขยับขึ้นว่าเกิน 5% หรือยัง',
      tag: 'โมดูล 2: ราคาหมู',
    },
    {
      label: '⏱️ คิวรอ 7 โต๊ะ โต๊ะว่างรอบละ 2',
      prompt: 'ตอนนี้มีคิวรอ 7 โต๊ะ โต๊ะว่างเฉลี่ย 2 โต๊ะต่อรอบ คำนวณเวลารอเฉลี่ยกี่นาที และควรหยุดรับ walk-in หรือยัง',
      tag: 'โมดูล 3: คิว',
    },
    {
      label: '💳 โต๊ะ 4 ยอด 596 บ. ได้กี่แต้ม',
      prompt: 'ลูกค้าโต๊ะ 4 เช็กบิลยอดรวม 596 บาท คำนวณแต้มสะสม และลูกค้าเป็นนักศึกษาแพทย์ มช. มีสิทธิ์อะไรบ้าง',
      tag: 'โมดูล 4: สมาชิก',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-4),
        }),
      });

      if (!res.ok) {
        throw new Error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
      }

      const data = await res.json();
      const isUrgent = data.reply.startsWith('แจ้งด่วน:');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isUrgent,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `ขออภัยค่ะ เกิดข้อขัดข้องชั่วคราว: ${err.message || 'ไม่สามารถติดต่อ AI ได้'} กรุณาลองใหม่อีกครั้งนะคะ`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[740px] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Assistant Header */}
      <div className="bg-stone-950 px-5 py-3.5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              น้องมันนี่ AI Copilot
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Online • พร้อมปฏิบัติงาน
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              ถาม-ตอบหน้างาน • ประเมิน Robinson Level 1-5 • สูตรคำนวณ Food Cost/คิว/แต้ม
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  sender: 'bot',
                  text: 'รีเซ็ตบทสนทนาเรียบร้อยค่ะ น้องมันนี่พร้อมรับแจ้งเหตุการณ์ใหม่ค่ะ',
                  timestamp: 'ตอนนี้',
                },
              ])
            }
            className="text-stone-400 hover:text-stone-200 text-xs px-2.5 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800/60 flex items-center gap-1.5 transition-colors"
            title="ล้างข้อความ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ล้างแชต</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-900/60">
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          const isUrgentMsg = msg.text.startsWith('แจ้งด่วน:') || msg.isUrgent;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
            >
              {isBot && (
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-md ${
                    isUrgentMsg
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isUrgentMsg ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  isBot
                    ? isUrgentMsg
                      ? 'bg-red-950/40 border-2 border-red-500/60 text-red-100'
                      : 'bg-stone-950/90 border border-stone-800 text-stone-200'
                    : 'bg-gradient-to-r from-amber-600 to-red-600 text-white'
                }`}
              >
                {/* Urgent indicator header if bot urgent */}
                {isBot && isUrgentMsg && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-500/30 text-red-300 font-bold text-xs">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      เคสเร่งด่วนตามเกณฑ์ Robinson 2019
                    </span>
                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      ACTION REQUIRED
                    </span>
                  </div>
                )}

                {/* Message body with Markdown format */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.text}
                </div>

                {/* Footer with time and copy button */}
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] opacity-70">
                  <span>{msg.timestamp}</span>
                  {isBot && (
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:opacity-100 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
                      title="คัดลอกข้อความ"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {!isBot && (
                <div className="w-8 h-8 rounded-lg bg-stone-700 border border-stone-600 text-stone-200 flex items-center justify-center shrink-0 mt-1 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-stone-950/90 border border-stone-800 rounded-2xl p-4 text-xs text-stone-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              น้องมันนี่กำลังวิเคราะห์ข้อมูลและคำนวณสูตร...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2.5 bg-stone-950/80 border-t border-stone-800/80">
        <div className="flex items-center gap-2 mb-1.5 text-xs text-stone-400 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>คำถามด่วนหน้างาน (คลิกส่งทันที):</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700/60 text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="พิมพ์แจ้งเหตุการณ์ เช่น โต๊ะ 12 เรียกซ้ำ 3 ครั้ง, อาหารมีสิ่งแปลกปลอม, คำนวณ Food Cost..."
            className="flex-1 bg-stone-900 border border-stone-700/80 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 outline-none transition-all shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-medium text-sm transition-all shadow-md hover:shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <span>ส่ง</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[11px] text-stone-500 mt-1.5 text-center">
          ⚡ ประเมิน Robinson 2019 อัตโนมัติ • แจ้งด่วน Level 1-2 • รองรับ n8n JSON Webhook
        </p>
      </div>
    </div>
  );
};
