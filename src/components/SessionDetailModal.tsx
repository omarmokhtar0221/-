import React, { useState } from 'react';
import { Case, Session, LawyerMember } from '../types/legal';
import {
  Calendar,
  Clock,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building,
} from 'lucide-react';

interface SessionDetailModalProps {
  parentCase: Case;
  existingSession?: Session;
  currentUser: LawyerMember;
  onClose: () => void;
  onSaveSession: (caseId: string, sessionData: Partial<Session>) => void;
}

const COMMON_POSTPONEMENT_REASONS = [
  'لإعادة الإعلان وتكليف الحضور لقلم المحضرين',
  'لورود تقرير مكتب خبراء وزارة العدل',
  'للاطلاع على المذكرات والمستندات المقدمة والرد عليها',
  'لضم أصل الشيك البنكي / أصل إيصال الأمانة ومستندات الدعوى',
  'للمرافعة الشفوية الختامية وتقديم المذكرات',
  'لسداد رسم أمانة الخبير القضائي وتوريدها بالخزينة',
  'لإعلان الخصم بأصل صحيفة الدعوى',
  'لإحضار المتهم من محبسه ومناقشة شهود الإثبات',
  'للقرار وإصدار الحكم بالجلسة القادمة',
];

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  parentCase,
  existingSession,
  currentUser,
  onClose,
  onSaveSession,
}) => {
  const [date, setDate] = useState(
    existingSession?.date || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState(existingSession?.time || '09:30');
  const [court, setCourt] = useState(existingSession?.court || parentCase.court);
  const [circuit, setCircuit] = useState(
    existingSession?.circuit || parentCase.stages[0]?.circuit || ''
  );
  const [rollNumber, setRollNumber] = useState(existingSession?.rollNumber || '');
  const [whatHappened, setWhatHappened] = useState(existingSession?.whatHappened || '');
  const [isPostponed, setIsPostponed] = useState(existingSession?.isPostponed ?? true);
  const [postponementReason, setPostponementReason] = useState(
    existingSession?.postponementReason || COMMON_POSTPONEMENT_REASONS[0]
  );
  const [postponedToDate, setPostponedToDate] = useState(
    existingSession?.postponedToDate ||
      new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]
  );
  const [decision, setDecision] = useState(existingSession?.decision || '');
  const [isCompleted, setIsCompleted] = useState(existingSession?.isCompleted ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSaveSession(parentCase.id, {
      id: existingSession?.id,
      caseFileNumber: parentCase.fileNumber,
      clientName: parentCase.clientName,
      court: court,
      circuit: circuit,
      rollNumber: rollNumber,
      date: date,
      time: time,
      whatHappened: whatHappened,
      isPostponed: isPostponed,
      postponementReason: isPostponed ? postponementReason : undefined,
      postponedToDate: isPostponed ? postponedToDate : undefined,
      decision: decision,
      isCompleted: isCompleted,
      assignedLawyerName: currentUser.name,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in zoom-in-95 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {existingSession ? 'تسجيل ما تم بالجلسة وقرار الترحيل' : 'إضافة وتحديد موعد جلسة جديدة'}
              </h3>
              <p className="text-xs text-slate-500">
                ملف رقم: {parentCase.fileNumber} - الموكل: {parentCase.clientName}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {/* Date, Time, Roll */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-800 font-bold mb-1">
                تاريخ الجلسة <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">وقت انعقاد الجلسة</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">رقم الرول بالقاعة</label>
              <input
                type="text"
                placeholder="مثال: 18"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Court & Circuit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-800 font-bold mb-1">المحكمة</label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">الدائرة القضائية</label>
              <input
                type="text"
                value={circuit}
                onChange={(e) => setCircuit(e.target.value)}
                placeholder="مثال: الدائرة 3 جنايات"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* What happened in the session */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">ما الذي حدث بالجلسة وملاحظات الدفاع</label>
            <textarea
              rows={2}
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              placeholder="مثال: حضر المحامي وقدم أصل صحيفة الدعوى ومذكرة بالدفاع، وطلب حجز الدعوى للحكم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Postponement Engine (ترحيل الجلسة تلقائياً لموعدها) */}
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-amber-900 font-bold text-xs">
                <input
                  type="checkbox"
                  checked={isPostponed}
                  onChange={(e) => setIsPostponed(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span>هل رُحلت الجلسة لجلسة أخرى قادمة؟</span>
              </label>

              {isPostponed && (
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  تُرحل وتُجدول تلقائياً
                </span>
              )}
            </div>

            {isPostponed && (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">سبب ترحيل وتأجيل الجلسة:</label>
                  <select
                    value={postponementReason}
                    onChange={(e) => setPostponementReason(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800"
                  >
                    {COMMON_POSTPONEMENT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    تاريخ الجلسة القادمة المرحل إليها <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required={isPostponed}
                    value={postponedToDate}
                    onChange={(e) => setPostponedToDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-mono font-bold"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    ⚡ عند الحفظ، سيتم جدولة الجلسة القادمة تلقائياً وتفعيل تنبيهات الـ 18 ساعة والـ 8 صباحاً.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Decision */}
          <div>
            <label className="block text-slate-800 font-bold mb-1">القرار أو الحكم الصادر</label>
            <input
              type="text"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              placeholder="مثال: التأجيل لجلسة 24 الجاري للمذكرات، أو حجز الدعوى للحكم..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isComp"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
            />
            <label htmlFor="isComp" className="text-slate-600 cursor-pointer">
              تم انقضاء هذه الجلسة وانتهت وقائعها
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold shadow-xs active:scale-95 transition"
            >
              {existingSession ? 'حفظ التحديثات والترحيل' : 'إضافة الجلسة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
