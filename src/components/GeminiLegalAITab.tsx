import React, { useState } from 'react';
import { Case, LawyerMember } from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Sparkles,
  Send,
  FileText,
  Copy,
  Printer,
  Check,
  Share2,
  Scale,
  ShieldAlert,
  BookOpen,
  FileCode,
  Loader2,
  FolderOpen,
} from 'lucide-react';

interface GeminiLegalAITabProps {
  cases: Case[];
  currentUser: LawyerMember;
  initialContextCase?: Case | null;
}

type AIMode = 'chat' | 'draft_brief' | 'draft_contract' | 'case_analysis' | 'ready_templates';

const READY_TEMPLATES = [
  {
    title: 'مذكرة دفاع بالدفع ببطلان القبض والتفتيش لانتفاء حالة التلبس',
    category: 'دفوع جنائية',
    docType: 'مذكرة بدفاع المتهم',
    instructions: 'الدفع ببطلان القبض والتفتيش لانتفاء حالة التلبس الواردة بالمادة 30 من قانون الإجراءات الجنائية، واستناداً لأحكام محكمة النقض المصرية ببطلان ما تلا التفتيش الباطل من أدلة أو اعترافات.',
  },
  {
    title: 'مذكرة دفاع بالدفع بانتفاء الركن المادي والمعنوي في جنحة إيصال أمانة',
    category: 'جنح أمانة',
    docType: 'مذكرة دفاع في جنحة خيانة أمانة (مادة 341 عقوبات)',
    instructions: 'الدفع بانتفاء ركن التسليم الفعلي وانتفاء القصد الجنائي وأن الورقة موقعة على بياض كضمان لمعاملة مدنية وتجارية سابقة، وطلب الإحالة للطب الشرعي لإثبات معاصرة التوقيع لصلب الإيصال.',
  },
  {
    title: 'عقد إيجار وحدة سكنية خاضع للقانون رقم 4 لسنة 1996 والتعديلات',
    category: 'عقود مدنية',
    docType: 'عقد إيجار شقة سكنية مصري رسمي',
    instructions: 'عقد إيجار محدد المدة يخضع لأحكام القانون رقم 4 لسنة 1996، يتضمن القيمة الإيجارية ومبلغ التأمين، والتزام المستأجر، وشرط الفسخ الصريح التلقائي دون حاجة لتنبيه أو إنذار عند التأخر في السداد، وإمكانية تذييل العقد بالصيغة التنفيذية وفقاً للقانون 137 لسنة 2006.',
  },
  {
    title: 'إنذار رسمي على يد محضر بسداد القيمة الإيجارية المتأخرة والفسخ',
    category: 'إنذارات محضرين',
    docType: 'إنذار رسمي على يد محضر',
    instructions: 'إنذار موجه من المؤجر إلى المستأجر بتكليفه بالوفاء بالقيمة الإيجارية المتأخرة عن الشهور المستحقة خلال 15 يوماً وإلا يعد العقد مفسوخاً من تلقاء نفسه مع الطرد والتعويض.',
  },
  {
    title: 'طلب رسمي موجه لرئيس المحكمة لاستخراج شهادة من واقع الجدول',
    category: 'طلبات إدارية',
    docType: 'طلب استخراج شهادة رسمية',
    instructions: 'صيغة طلب رسمي للسيد الأستاذ المستشار رئيس المحكمة لاستخراج شهادة رسمية من واقع الجدول بما تم في الجلسة المحددة لتقديمها لجهة رسمية.',
  },
];

export const GeminiLegalAITab: React.FC<GeminiLegalAITabProps> = ({
  cases,
  currentUser,
  initialContextCase,
}) => {
  const [mode, setMode] = useState<AIMode>('chat');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialContextCase ? initialContextCase.id : ''
  );

  // Chat Mode State
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'model'; text: string; time: string }>
  >([
    {
      role: 'model',
      text: `مرحباً بك زميلنا العزيز ${currentUser.name} في **مساعدك القانوني الذكي**.
أنا جاهز ومبرمج وفقاً لمنظومة القانون المصري وأحكام محكمة النقض المصرية لمساعدتك في:
• صياغة مذكرات الدفاع ودفوع البطلان أمام محاكم الجنايات والاستئناف والنقض ومجلس الدولة.
• صياغة العقود والاتفاقيات والإنذارات الرسمية على يد محضر.
• تحليل وقائع القضايا واستنباط الثغرات الإجرائية والموضوعية.
• حل المشكلات القانونية والمسائل الإدارية بأقلام المحضرين والجداول.

كيف يمكنني معاونتك اليوم؟`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Draft Tool State
  const [docType, setDocType] = useState('مذكرة دفاع أمام محكمة الجنايات');
  const [docInstructions, setDocInstructions] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Loopholes Tool State
  const [caseFacts, setCaseFacts] = useState('');
  const [chargeType, setChargeType] = useState('نصب واحتيال مالي');
  const [courtName, setCourtName] = useState('محكمة جنايات شمال القاهرة');
  const [loopholesAnalysis, setLoopholesAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [copied, setCopied] = useState(false);

  const currentCase = cases.find((c) => c.id === selectedCaseId);

  // Send Message in Legal Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoadingChat) return;

    const userText = chatInput.trim();
    const newMsg = {
      role: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setIsLoadingChat(true);

    try {
      const response = await fetch('/api/gemini/legal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          context: currentCase
            ? {
                fileNumber: currentCase.fileNumber,
                clientName: currentCase.clientName,
                opponentName: currentCase.opponentName,
                court: currentCase.court,
                charge: currentCase.charge,
                caseType: currentCase.caseType,
              }
            : undefined,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.text,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `⚠️ عذراً، حدث خطأ أثناء الاتصال بالمساعد القانوني: ${err.message || 'يرجى مراجعة الاتصال وإعادة المحاولة'}`,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Generate Document
  const handleGenerateDocument = async () => {
    setIsDrafting(true);
    setGeneratedDraft('');

    try {
      const response = await fetch('/api/gemini/draft-legal-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: docType,
          caseInfo: currentCase
            ? {
                clientName: currentCase.clientName,
                opponentName: currentCase.opponentName,
                caseNumber: currentCase.stages[0]?.caseNumber || currentCase.fileNumber,
                court: currentCase.court,
                charge: currentCase.charge,
              }
            : undefined,
          specificInstructions: docInstructions,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setGeneratedDraft(data.draft);
    } catch (err: any) {
      alert(`خطأ أثناء الصياغة: ${err.message}`);
    } finally {
      setIsDrafting(false);
    }
  };

  // Analyze Loopholes
  const handleAnalyzeLoopholes = async () => {
    if (!caseFacts.trim()) {
      alert('يرجى إدخال ملخص وقائع وأوراق القضية.');
      return;
    }

    setIsAnalyzing(true);
    setLoopholesAnalysis('');

    try {
      const response = await fetch('/api/gemini/analyze-case-loopholes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseFacts: caseFacts,
          chargeType: chargeType,
          court: courtName,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setLoopholesAnalysis(data.analysis);
    } catch (err: any) {
      alert(`خطأ أثناء التحليل: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Amiri', 'Cairo', serif; padding: 40px; color: #111; line-height: 1.8; }
            .header { text-align: center; border-bottom: 2px solid #b38a36; padding-bottom: 15px; margin-bottom: 25px; }
            .logo-title { font-size: 22px; font-weight: bold; color: #0a1128; }
            .sub-title { font-size: 13px; color: #555; }
            .content { white-space: pre-wrap; font-size: 15px; text-align: justify; }
            .footer { margin-top: 50px; text-align: left; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-title">${currentUser.officeName || 'مكتب المحاماة والاستشارات القانونية'}</div>
            <div class="sub-title">أجندة - مساعدك القانوني الذكي | تحريراً في: ${new Date().toLocaleDateString('ar-EG')}</div>
          </div>
          <div class="content">${content}</div>
          <div class="footer">
            وكيل الموكل / ${currentUser.name}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 text-slate-800">
      {/* Top Banner (Light Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-100/40 border border-amber-300 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 p-0.5 shadow-sm shrink-0">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-amber-700">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-1.5">
                  <span>مساعدك القانوني</span>
                  <span className="text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300">
                    الذكاء القانوني المصري
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                مستشارك المباشر داخل التطبيق لكتابة مذكرات الدفاع، صياغة العقود، الدفوع الجنائية والمدنية، واستنباط ثغرات القضايا بالاستناد لأحكام محكمة النقض.
              </p>
            </div>
          </div>

          {/* Connect with case dropdown */}
          <div className="bg-white border border-slate-300 p-2 rounded-xl flex items-center gap-2 text-xs shadow-2xs">
            <FolderOpen className="w-4 h-4 text-amber-600 shrink-0" />
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none max-w-[200px] truncate"
            >
              <option value="">-- ربط استفسار بملف قضية --</option>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  ملف {c.fileNumber}: {c.clientName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Case Context Badge */}
        {currentCase && (
          <div className="mt-3 pt-3 border-t border-amber-200/80 flex items-center gap-2 text-xs text-amber-900">
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>السياق القانوني المفعل: </span>
            <span className="font-bold text-slate-900">
              ملف رقم {currentCase.fileNumber} ({currentCase.clientName} ضد {currentCase.opponentName}) - {currentCase.court}
            </span>
          </div>
        )}
      </div>

      {/* Modes Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setMode('chat')}
          className={`px-3.5 py-2 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
            mode === 'chat'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>المستشار المباشر (شات)</span>
        </button>

        <button
          onClick={() => setMode('draft_brief')}
          className={`px-3.5 py-2 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
            mode === 'draft_brief'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>صياغة مذكرات الدفاع والطعون</span>
        </button>

        <button
          onClick={() => setMode('draft_contract')}
          className={`px-3.5 py-2 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
            mode === 'draft_contract'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>صياغة العقود الرسمية</span>
        </button>

        <button
          onClick={() => setMode('case_analysis')}
          className={`px-3.5 py-2 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
            mode === 'case_analysis'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>استنباط الثغرات والدفوع</span>
        </button>

        <button
          onClick={() => setMode('ready_templates')}
          className={`px-3.5 py-2 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
            mode === 'ready_templates'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>نماذج وصيغ جاهزة بنقرة زر</span>
        </button>
      </div>

      {/* MODE 1: Interactive Chat with Legal Assistant */}
      {mode === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[520px]">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-1">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 font-normal'
                  }`}
                >
                  <div>{msg.text}</div>
                  <div
                    className={`text-[10px] mt-2 flex items-center justify-between ${
                      msg.role === 'user' ? 'text-amber-100' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1 mr-2 text-slate-500">
                        <button
                          onClick={() => handleCopy(msg.text)}
                          className="hover:text-slate-900 p-1"
                          title="نسخ الرد"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePrint(msg.text, 'استشارة من مساعدك القانوني')}
                          className="hover:text-slate-900 p-1"
                          title="طباعة"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoadingChat && (
              <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
                <span>جاري استحضار الأسانيد القانونية وأحكام محكمة النقض المصرية...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <textarea
                rows={1}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="اكتب استفسارك القانوني، طلب صياغة دفع، استشارة في قانون المرافعات أو الإجراءات الجنائية..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 resize-none shadow-2xs"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isLoadingChat}
                className="w-10 h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center shadow-xs active:scale-95 disabled:opacity-50 transition shrink-0"
              >
                <Send className="w-4 h-4 rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: Draft Legal Briefs */}
      {mode === 'draft_brief' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>بيانات مذكرة الدفاع المطلوبة</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع المذكرة القضائية</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="مذكرة دفاع أمام محكمة الجنايات (براءة ودفوع جوهرية)">
                    مذكرة دفاع أمام محكمة الجنايات
                  </option>
                  <option value="مذكرة دفاع في جنحة شيك أو إيصال أمانة">
                    مذكرة دفاع في جنحة (شيك / إيصال أمانة / ضرب)
                  </option>
                  <option value="مذكرة دفاع أمام محكمة الاستئناف العالي">
                    مذكرة دفاع أمام محكمة الاستئناف العالي
                  </option>
                  <option value="مذكرة بأسباب الطعن بالنقض الجنائي">
                    مذكرة بأسباب الطعن بالنقض الجنائي (مبادئ محكمة النقض)
                  </option>
                  <option value="مذكرة دفاع مدنية في دعوى تعويض أو فسخ عقد">
                    مذكرة دفاع في دعوى مدنية / تعويضات
                  </option>
                  <option value="مذكرة طعن أمام محكمة القضاء الإداري بمجلس الدولة">
                    مذكرة أمام القضاء الإداري (مجلس الدولة)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  إرشادات خاصة ودفوع محددة تريد تضمينها
                </label>
                <textarea
                  rows={4}
                  value={docInstructions}
                  onChange={(e) => setDocInstructions(e.target.value)}
                  placeholder="مثال: الدفع ببطلان استجواب المتهم لغياب المحامي، الدفع بانتفاء القصد الجنائي، الدفع بانقضاء الدعوى بمضي المدة، مع إبراز أحكام نقض حديثة تؤيد الموقف..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <button
                onClick={handleGenerateDocument}
                disabled={isDrafting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-xs active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                {isDrafting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تحرير وصياغة المذكرة القانونية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>صياغة المذكرة الرسمية</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Draft */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-amber-800">المذكرة المصاغة الرسمية</span>
                {generatedDraft && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(generatedDraft)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                    <button
                      onClick={() => handlePrint(generatedDraft, docType)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-700" />
                      <span>طباعة رسمية</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 max-h-[400px] overflow-y-auto text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-['Amiri',serif]">
                {generatedDraft || 'اضغط على زر «صياغة المذكرة الرسمية» لتوليد مذكرة متكاملة جاهزة للتقديم في المحكمة.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: Draft Contracts */}
      {mode === 'draft_contract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>محرر العقود والاتفاقيات القانونية</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع العقد المطلوب</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="عقد بيع شقة سكنية خالص الثمن بحصة شائعة في الأرض">
                    عقد بيع شقة سكنية (مع حصة بالأرض)
                  </option>
                  <option value="عقد إيجار محدد المدة خاضع للقانون 4 لسنة 1996">
                    عقد إيجار خاضع للقانون 4 لسنة 1996
                  </option>
                  <option value="عقد شراكة تجارية وتوزيع أرباح وإدارة">
                    عقد تأسيس شراكة تجارية
                  </option>
                  <option value="عقد عمل محدد المدة وفقاً لقانون العمل المصري رقم 12 لسنة 2003">
                    عقد عمل وفق قانون العمل المصري
                  </option>
                  <option value="عقد اتفاق وصلح وتنازل عن دعاوى قضائية">
                    عقد صلح وتنازل عن جنحة / دعوى قضائية
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  شروط العقد وأسماء الأطراف والقيم المالية
                </label>
                <textarea
                  rows={4}
                  value={docInstructions}
                  onChange={(e) => setDocInstructions(e.target.value)}
                  placeholder="اكتب أسماء الطرفين، القيمة المالية، مواعيد السداد، والشروط الجزائية الخاصة..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <button
                onClick={handleGenerateDocument}
                disabled={isDrafting}
                className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {isDrafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>صياغة العقد الرسمي المتكامل</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-amber-800">صيغة العقد المكتملة</span>
                {generatedDraft && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(generatedDraft)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </button>
                    <button
                      onClick={() => handlePrint(generatedDraft, docType)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-bold"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-700" />
                      <span>طباعة العقد</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 max-h-[400px] overflow-y-auto text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-['Amiri',serif]">
                {generatedDraft || 'اختر نوع العقد واضغط «صياغة العقد الرسمي المتكامل» لإنشاء عقد متوافق مع القانون المدني المصري.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: Case Loopholes */}
      {mode === 'case_analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 text-xs shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>تحليل وقائع القضية واستخراج الثغرات القانونية</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المحكمة والجهة</label>
                <input
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع التهمة / موضوع الدعوى</label>
                <input
                  type="text"
                  value={chargeType}
                  onChange={(e) => setChargeType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  وقائع القضية، محضر التحريات، أقوال الشهود أو بنود النزاع <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={caseFacts}
                  onChange={(e) => setCaseFacts(e.target.value)}
                  placeholder="ألصق هنا ملخص محضر الشرطة، إذن النيابة العامة، أقوال الضابط مجري التحريات، أقوال المجني عليه، أو وقائع النزاع..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <button
                onClick={handleAnalyzeLoopholes}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-105 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل الثغرات الشكلية والموضوعية...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>استخراج الثغرات وأوجه البطلان وأحكام النقض</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-rose-800">تقرير الثغرات وخطة المرافعة</span>
                {loopholesAnalysis && (
                  <button
                    onClick={() => handleCopy(loopholesAnalysis)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ التقرير</span>
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-[420px] overflow-y-auto text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 font-['Amiri',serif]">
                {loopholesAnalysis || 'أدخل وقائع القضية واضغط استخراج الثغرات لتحصل على تحليل مفصل لأوجه البطلان وأسانيد محكمة النقض.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 5: Ready Templates */}
      {mode === 'ready_templates' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {READY_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-400 transition flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                  {tmpl.category}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-2">{tmpl.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1">{tmpl.instructions}</p>
              </div>

              <button
                onClick={() => {
                  setDocType(tmpl.docType);
                  setDocInstructions(tmpl.instructions);
                  setMode('draft_brief');
                }}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>فتح وصياغة النموذج</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
