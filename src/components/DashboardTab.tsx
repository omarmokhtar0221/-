import React from 'react';
import {
  Case,
  AdminTask,
  LawyerMember,
  NavigationTab,
  Session,
} from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  ClipboardList,
  CheckCircle2,
  Sparkles,
  MapPin,
  Printer,
  ChevronLeft,
  Users,
  Shield,
  Cloud,
} from 'lucide-react';

interface DashboardTabProps {
  currentUser: LawyerMember;
  cases: Case[];
  adminTasks: AdminTask[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectCase: (c: Case) => void;
  onUpdateAdminTaskStatus: (taskId: string, status: AdminTask['status']) => void;
  onOpenSessionModal: (c: Case, s: Session) => void;
  onOpenPrintRoll: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  currentUser,
  cases,
  adminTasks,
  onNavigate,
  onSelectCase,
  onUpdateAdminTaskStatus,
  onOpenSessionModal,
  onOpenPrintRoll,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate today's sessions from all active/under_filing cases
  const allSessions: { session: Session; parentCase: Case }[] = [];
  cases.forEach((c) => {
    if (c.degreeStatus !== 'finished') {
      c.sessions.forEach((s) => {
        allSessions.push({ session: s, parentCase: c });
      });
    }
  });

  const todaySessions = allSessions.filter((item) => item.session.date === todayStr);
  const upcomingSessions = allSessions
    .filter((item) => item.session.date > todayStr)
    .sort((a, b) => a.session.date.localeCompare(b.session.date))
    .slice(0, 4);

  // Administrative tasks: Today's pending/in_progress tasks
  const pendingAdminTasks = adminTasks.filter(
    (t) => t.status !== 'completed'
  );
  const todayAdminTasks = pendingAdminTasks.filter((t) => t.dueDate <= todayStr);

  // Statistics
  const activeCasesCount = cases.filter((c) => c.degreeStatus === 'active').length;
  const underFilingCount = cases.filter((c) => c.degreeStatus === 'under_filing').length;
  const finishedCasesCount = cases.filter((c) => c.degreeStatus === 'finished').length;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 relative text-slate-800">
      {/* Background Watermark Branding Stamp (as requested) */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none z-0">
        <AppLogo size="watermark" />
      </div>

      {/* Welcome & Egyptian Lawyer Motto Card (Light Luxury Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50/80 via-white to-amber-100/40 border border-amber-300 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-13 h-13 rounded-2xl bg-white border border-amber-400/50 p-1.5 flex items-center justify-center shrink-0 shadow-sm">
              <img
                src="/assets/aistudio/_________0051f627.png"
                alt="شعار العدالة"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-900 font-bold">أهلاً بك زميلنا العزيز</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
                  {currentUser.role === 'admin' ? 'صاحب المكتب' : 'محامٍ بالمكتب'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                {currentUser.name}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                «العدالة أساس الملك.. والمحاماة رسالة الدفاع عن الحقوق والحريات»
              </p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onNavigate('ai_assistant')}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold px-3.5 py-2 rounded-xl shadow-sm active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>مساعدك القانوني</span>
            </button>
            <button
              onClick={() => onNavigate('location_share')}
              className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3 py-2 rounded-xl border border-slate-300 hover:border-amber-400 transition"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>موقعي بالقاعة</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Priority Timed Alerts (18h & 8am Rules) */}
      {(todaySessions.length > 0 || todayAdminTasks.length > 0) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-300 p-3 sm:p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
            <span>تنبيهات الميعاد العاجلة (تنبيه الـ 18 ساعة وإشعار الـ 8 صباحاً)</span>
          </div>
          <div className="text-xs space-y-2 text-slate-700">
            {todaySessions.length > 0 && (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  لديك <strong>{todaySessions.length} جلسة اليوم</strong> تتطلب الحضور والمرافعة في المحاكم!
                </span>
                <button
                  onClick={onOpenPrintRoll}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  استعراض رول الحضور
                </button>
              </div>
            )}
            {todayAdminTasks.length > 0 && (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs">
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-amber-600" />
                  لديك <strong>{todayAdminTasks.length} عمل إداري عاجل</strong> يستوجب التوجه لقلم المحضرين أو الجدول اليوم!
                </span>
                <button
                  onClick={() => onNavigate('admin_tasks')}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  فتح كشف المحضرين
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div
          onClick={() => onNavigate('cases')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-300 p-3.5 rounded-2xl cursor-pointer transition shadow-xs"
        >
          <div className="text-slate-500 text-xs flex items-center justify-between">
            <span>القضايا المتداولة</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{activeCasesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">منظورة أمام المحاكم</div>
        </div>

        <div
          onClick={() => onNavigate('admin_tasks')}
          className="bg-amber-50/60 hover:bg-amber-50 border border-amber-300 p-3.5 rounded-2xl cursor-pointer transition shadow-xs"
        >
          <div className="text-amber-900 text-xs flex items-center justify-between font-bold">
            <span>الأعمال الإدارية</span>
            <ClipboardList className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">
            {pendingAdminTasks.length}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-0.5">محضرين وجداول وخزينة</div>
        </div>

        <div
          onClick={() => onNavigate('cases')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-300 p-3.5 rounded-2xl cursor-pointer transition shadow-xs"
        >
          <div className="text-slate-500 text-xs flex items-center justify-between">
            <span>تحت الرفع والقيد</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{underFilingCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">بانتظار تحديد الجلسة</div>
        </div>

        <div
          onClick={() => onNavigate('archive')}
          className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-amber-300 p-3.5 rounded-2xl cursor-pointer transition shadow-xs"
        >
          <div className="text-slate-500 text-xs flex items-center justify-between">
            <span>الأرشيف المنتهي</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{finishedCasesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">محكومة ومحفوظة</div>
        </div>
      </div>

      {/* Main Grid: Today's Court Roll & Today's Administrative Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECTION 1: رول جلسات اليوم والمحاكم */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>رول جلسات اليوم</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {todaySessions.length} جلسات
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">سجل الجلسات المنعقدة اليوم بالمحاكم</p>
                </div>
              </div>

              <button
                onClick={onOpenPrintRoll}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 p-1"
                title="طباعة رول الجلسات"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">طباعة الرول</span>
              </button>
            </div>

            {/* List of Today Sessions */}
            <div className="mt-3 space-y-2.5">
              {todaySessions.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-xs">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-700">لا توجد جلسات محددة لليوم</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    يمكنك مراجعة الجلسات القادمة في جدول القضايا.
                  </p>
                </div>
              ) : (
                todaySessions.map(({ session, parentCase }) => (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-800">
                            ملف: {parentCase.fileNumber}
                          </span>
                          {session.rollNumber && (
                            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                              رول #{session.rollNumber}
                            </span>
                          )}
                          <span className="text-[10px] bg-white text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {parentCase.caseType}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-1">
                          {parentCase.clientName}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {session.court} {session.circuit && `- ${session.circuit}`}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenSessionModal(parentCase, session)}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold transition shrink-0 shadow-xs"
                      >
                        إثبات القرار / ترحيل
                      </button>
                    </div>

                    {session.whatHappened && (
                      <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                        <strong className="text-slate-900">ما تم بالجلسة:</strong> {session.whatHappened}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Sessions preview */}
          {upcomingSessions.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
                <span>أقرب الجلسات القادمة:</span>
                <button
                  onClick={() => onNavigate('cases')}
                  className="text-amber-700 hover:underline flex items-center gap-0.5 font-bold"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {upcomingSessions.map(({ session, parentCase }) => (
                  <div
                    key={session.id}
                    onClick={() => onSelectCase(parentCase)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 text-xs cursor-pointer transition"
                  >
                    <div className="truncate max-w-[220px]">
                      <span className="font-bold text-slate-800">{parentCase.clientName}</span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {session.court}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {session.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: شق الأعمال الإدارية (القسم الأهم!) */}
        <div className="bg-white border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-amber-900">الأعمال الإدارية والمحضرين</span>
                    <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-black">
                      القسم الأهم
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    شهادات الجدول، أقلام المحضرين، سداد الرسوم، واستلام الأحكام
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('admin_tasks')}
                className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1 transition"
              >
                <span>إضافة وتفاصيل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of Pending Admin Tasks */}
            <div className="mt-3 space-y-2.5">
              {pendingAdminTasks.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-500 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <p className="font-bold text-emerald-800">تم إنجاز كافة الأعمال الإدارية بنجاح!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    لا توجد أعمال معلقة لقلم المحضرين أو الجداول حالياً.
                  </p>
                </div>
              ) : (
                pendingAdminTasks.slice(0, 5).map((task) => {
                  const isToday = task.dueDate <= todayStr;
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition ${
                        isToday
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                          : 'bg-slate-50/70 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-amber-800">
                              ملف: {task.caseFileNumber}
                            </span>
                            <span className="text-[10px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                              {task.department}
                            </span>
                            {isToday && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-bold animate-pulse">
                                استحقاق اليوم
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-bold text-slate-900 mt-1 leading-snug">
                            {task.taskType}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>الموكل: {task.clientName}</span>
                            <span>•</span>
                            <span className="text-amber-800 font-semibold">المكلف: {task.assignedLawyerName}</span>
                          </div>
                        </div>

                        {/* Quick toggle completed */}
                        <button
                          onClick={() => onUpdateAdminTaskStatus(task.id, 'completed')}
                          className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 px-2.5 py-1.5 rounded-xl font-bold transition shrink-0 flex items-center gap-1 shadow-2xs"
                          title="تحديد كمنجز"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>تم الإنجاز</span>
                        </button>
                      </div>

                      {task.notes && (
                        <div className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                          <strong>ملاحظة:</strong> {task.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>تذكير آلي قبل 18 ساعة + تنبيه يومي 8 صباحاً</span>
            <button
              onClick={() => onNavigate('admin_tasks')}
              className="text-amber-800 font-bold hover:underline"
            >
              عرض الكشف الكامل ({pendingAdminTasks.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
