import React, { useState } from 'react';
import { Case, AdminTask, Session } from '../types/legal';
import { Printer, X, Download, Calendar, ClipboardList } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface CourtRollPrintModalProps {
  cases: Case[];
  adminTasks: AdminTask[];
  onClose: () => void;
}

export const CourtRollPrintModal: React.FC<CourtRollPrintModalProps> = ({
  cases,
  adminTasks,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [reportType, setReportType] = useState<'sessions' | 'admin_tasks' | 'both'>('both');

  // Find sessions for selected date
  const sessionsForDate: { session: Session; parentCase: Case }[] = [];
  cases.forEach((c) => {
    if (c.degreeStatus !== 'finished') {
      c.sessions.forEach((s) => {
        if (s.date === selectedDate) {
          sessionsForDate.push({ session: s, parentCase: c });
        }
      });
    }
  });

  // Find admin tasks for selected date
  const adminTasksForDate = adminTasks.filter(
    (t) => t.dueDate === selectedDate && t.status !== 'completed'
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 text-slate-800">
        {/* Modal Controls Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Printer className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                طباعة رول الجلسات وكشف المحضرين اليومي
              </h3>
              <p className="text-xs text-slate-500">
                كشف رسمي للمحامي وللمساعدين صباح يوم العمل بالمحاكم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono"
            />

            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900"
            >
              <option value="both">الرولين معاً (جلسات + محضرين)</option>
              <option value="sessions">رول الجلسات بالمحاكم فقط</option>
              <option value="admin_tasks">كشف المحضرين والجداول فقط</option>
            </select>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكشف</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-950 font-['Cairo',sans-serif] print:p-0">
          {/* Formal Letterhead */}
          <div className="border-b-2 border-amber-500 pb-4 mb-6 flex items-center justify-between">
            <div className="text-right">
              <h2 className="text-lg font-black text-slate-950">
                مكتب الأستاذ / عمر مختار عبدالعزيز
              </h2>
              <p className="text-xs text-slate-600 font-semibold">
                المحامي بالنقض والدستورية العليا ومجلس الدولة
              </p>
              <p className="text-[11px] text-slate-500">
                جمهورية مصر العربية | هاتف: 01001234567
              </p>
            </div>

            <div className="flex items-center justify-center">
              <AppLogo size="sm" showSubtitle={false} />
            </div>

            <div className="text-left text-xs">
              <div className="font-bold text-amber-700">تطبيق أجندة المحامي الذكي</div>
              <div className="text-slate-600">
                التاريخ: <strong>{selectedDate}</strong>
              </div>
              <div className="text-[11px] text-slate-500">رول العمل القضائي اليومي</div>
            </div>
          </div>

          {/* Section A: Court Hearings Roll (رول الجلسات) */}
          {(reportType === 'both' || reportType === 'sessions') && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3 bg-slate-100 p-2.5 rounded-xl border-r-4 border-amber-600">
                <Calendar className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  أولاً: رول الجلسات المنعقدة اليوم بالمحاكم ({sessionsForDate.length} جلسات)
                </h3>
              </div>

              {sessionsForDate.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 italic">
                  لا توجد جلسات محددة لنظرها في هذا التاريخ.
                </p>
              ) : (
                <table className="w-full text-right text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300 w-12 text-center">رول</th>
                      <th className="p-2 border border-slate-300">رقم الملف والقضية</th>
                      <th className="p-2 border border-slate-300">الموكل ضد الخصم</th>
                      <th className="p-2 border border-slate-300">المحكمة والدائرة</th>
                      <th className="p-2 border border-slate-300">المحامي الحاضر</th>
                      <th className="p-2 border border-slate-300">ما تم بالجلسة والقرار</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsForDate.map(({ session, parentCase }, idx) => (
                      <tr key={session.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-bold font-mono">
                          {session.rollNumber || idx + 1}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <span className="font-bold text-amber-900">ملف #{parentCase.fileNumber}</span>
                          <div className="text-[11px] text-slate-600">
                            {parentCase.stages[0]?.caseNumber || 'قيد الرفع'}
                          </div>
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-bold">{parentCase.clientName}</div>
                          <div className="text-[11px] text-slate-600">ضد: {parentCase.opponentName}</div>
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div>{session.court}</div>
                          <div className="text-[11px] text-slate-600">{session.circuit || '-'}</div>
                        </td>
                        <td className="p-2 border border-slate-300">
                          {session.assignedLawyerName || 'أ.د. محمود العزازي'}
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px]">
                          {session.whatHappened || session.decision ? (
                            <div>
                              {session.whatHappened && <div>{session.whatHappened}</div>}
                              {session.decision && (
                                <div className="text-emerald-700 font-bold">
                                  القرار: {session.decision}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">...........................</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section B: Admin & Bailiff Roll (كشف المحضرين والأعمال الإدارية) */}
          {(reportType === 'both' || reportType === 'admin_tasks') && (
            <div>
              <div className="flex items-center gap-2 mb-3 bg-slate-100 p-2.5 rounded-xl border-r-4 border-amber-600">
                <ClipboardList className="w-4 h-4 text-amber-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  ثانياً: كشف المحضرين والأعمال الإدارية المستحقة اليوم ({adminTasksForDate.length} أعمال)
                </h3>
              </div>

              {adminTasksForDate.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 italic">
                  لا توجد تكليفات محضرين أو أعمال إدارية مستحقة اليوم.
                </p>
              ) : (
                <table className="w-full text-right text-xs border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border border-slate-300 w-10 text-center">م</th>
                      <th className="p-2 border border-slate-300">رقم الملف والموكل</th>
                      <th className="p-2 border border-slate-300">نوع العمل الإداري</th>
                      <th className="p-2 border border-slate-300">الجهة / القلم</th>
                      <th className="p-2 border border-slate-300">المحامي المكلف</th>
                      <th className="p-2 border border-slate-300">ملاحظات والتوقيع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminTasksForDate.map((task, idx) => (
                      <tr key={task.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 text-center font-bold">
                          {idx + 1}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <span className="font-bold text-amber-900">ملف #{task.caseFileNumber}</span>
                          <div className="text-[11px] text-slate-600">{task.clientName}</div>
                        </td>
                        <td className="p-2 border border-slate-300 font-bold">
                          {task.taskType}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div>{task.department}</div>
                          {task.court && <div className="text-[11px] text-slate-600">{task.court}</div>}
                        </td>
                        <td className="p-2 border border-slate-300">
                          {task.assignedLawyerName}
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px]">
                          {task.notes || '...........................'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Footer note for print */}
          <div className="mt-12 pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-500">
            <div>تطبيق أجندة المحامي الذكي - جمهورية مصر العربية</div>
            <div>توقيع مدير المكتب: .......................................</div>
          </div>
        </div>
      </div>
    </div>
  );
};
