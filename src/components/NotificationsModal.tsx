import React from 'react';
import { Session, AdminTask, Case } from '../types/legal';
import {
  Bell,
  Clock,
  Calendar,
  ClipboardList,
  AlertTriangle,
  X,
  CheckCircle2,
} from 'lucide-react';

interface NotificationsModalProps {
  cases: Case[];
  adminTasks: AdminTask[];
  onClose: () => void;
  onSelectCase: (c: Case) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  cases,
  adminTasks,
  onClose,
  onSelectCase,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // 1. Session Reminders (18 hours before & 8:00 AM day of session)
  const sessionAlerts: Array<{ session: Session; parentCase: Case; type: 'today_8am' | 'before_18h' }> = [];
  cases.forEach((c) => {
    if (c.degreeStatus !== 'finished') {
      c.sessions.forEach((s) => {
        if (!s.isCompleted) {
          if (s.date === todayStr) {
            sessionAlerts.push({ session: s, parentCase: c, type: 'today_8am' });
          } else if (s.date === tomorrowStr) {
            sessionAlerts.push({ session: s, parentCase: c, type: 'before_18h' });
          }
        }
      });
    }
  });

  // 2. Admin Task Reminders (18 hours before & daily 8:00 AM until completed)
  const adminTaskAlerts: Array<{ task: AdminTask; type: 'today_8am' | 'before_18h' }> = [];
  adminTasks.forEach((t) => {
    if (t.status !== 'completed') {
      if (t.dueDate <= todayStr) {
        adminTaskAlerts.push({ task: t, type: 'today_8am' });
      } else if (t.dueDate === tomorrowStr) {
        adminTaskAlerts.push({ task: t, type: 'before_18h' });
      }
    }
  });

  const totalCount = sessionAlerts.length + adminTaskAlerts.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 text-slate-800">
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>تنبيهات الجلسات والأعمال الإدارية</span>
                <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full border border-rose-300 font-bold">
                  {totalCount} تنبيه موقوت
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                قاعدة التنبيه: قبل الموعد بـ 18 ساعة وإشعار يومي الساعة 8:00 صباحاً
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {totalCount === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="font-bold text-slate-800">لا توجد تنبيهات عاجلة حالياً</p>
              <p className="text-[11px] text-slate-400">
                كافة الجلسات والأعمال الإدارية في مواعيد لاحقة آمنة.
              </p>
            </div>
          ) : (
            <>
              {/* Session Alerts */}
              {sessionAlerts.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>تنبيهات الجلسات القضائية:</span>
                  </div>

                  {sessionAlerts.map(({ session, parentCase, type }) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        onSelectCase(parentCase);
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 hover:border-amber-400 cursor-pointer transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          ملف: {parentCase.fileNumber} - {parentCase.clientName}
                        </span>
                        {type === 'today_8am' ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-300 animate-pulse">
                            جلسة اليوم (8:00 صباحاً)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                            متبقي أقل من 18 ساعة
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600">
                        {session.court} {session.circuit && `(${session.circuit})`}
                      </div>
                      {session.rollNumber && (
                        <div className="text-[10px] text-amber-800 font-mono font-bold">
                          رقم الرول: #{session.rollNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Admin Tasks Alerts */}
              {adminTaskAlerts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>تنبيهات الأعمال الإدارية والمحضرين:</span>
                  </div>

                  {adminTaskAlerts.map(({ task, type }) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          ملف: {task.caseFileNumber} ({task.department})
                        </span>
                        {type === 'today_8am' ? (
                          <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-300">
                            استحقاق اليوم (8:00 ص)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                            متبقي 18 ساعة
                          </span>
                        )}
                      </div>
                      <div className="text-slate-800 font-medium">{task.taskType}</div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>المكلف: {task.assignedLawyerName}</span>
                        <span>الموكل: {task.clientName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
