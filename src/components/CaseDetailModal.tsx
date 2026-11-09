import React, { useState } from 'react';
import {
  Case,
  Session,
  AdminTask,
  CaseAttachment,
  AttachmentType,
  LawyerMember,
} from '../types/legal';
import {
  X,
  FileText,
  Calendar,
  ClipboardList,
  Paperclip,
  Plus,
  Layers,
  Building,
  User,
  Clock,
  CheckCircle2,
  Sparkles,
  Download,
  Eye,
  Trash2,
  Edit,
} from 'lucide-react';

interface CaseDetailModalProps {
  caseItem: Case;
  adminTasks: AdminTask[];
  currentUser: LawyerMember;
  onClose: () => void;
  onUpdateCase: (caseId: string, updates: Partial<Case>) => void;
  onOpenSessionModal: (c: Case, s?: Session) => void;
  onOpenNewAdminTask: (c: Case) => void;
  onNavigateToAIWithContext: (c: Case) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseItem,
  adminTasks,
  currentUser,
  onClose,
  onUpdateCase,
  onOpenSessionModal,
  onOpenNewAdminTask,
  onNavigateToAIWithContext,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'admin_tasks' | 'stages' | 'attachments' | 'notes'>('sessions');
  const [previewAttachment, setPreviewAttachment] = useState<CaseAttachment | null>(null);
  const [isFinishingCase, setIsFinishingCase] = useState(false);
  const [verdictText, setVerdictText] = useState('');
  const [archiveNotesText, setArchiveNotesText] = useState('');

  // Linked Admin Tasks (automatically updated per case file number)
  const linkedTasks = adminTasks.filter(
    (t) => t.caseId === caseItem.id || t.caseFileNumber === caseItem.fileNumber
  );

  // Handle Mark Finished (Archive)
  const handleMarkFinished = () => {
    if (!verdictText.trim()) {
      alert('يرجى كتابة منطوق الحكم أو سبب إنهاء القضية ونقلها للأرشيف.');
      return;
    }

    onUpdateCase(caseItem.id, {
      degreeStatus: 'finished',
      finishDetails: {
        date: new Date().toISOString().split('T')[0],
        verdict: verdictText,
        archiveNotes: archiveNotesText,
      },
    });
    setIsFinishingCase(false);
  };

  // Handle Re-open Case from Archive
  const handleReopenCase = () => {
    if (confirm('هل تريد إعادة تداول هذه القضية وإخراجها من الأرشيف؟')) {
      onUpdateCase(caseItem.id, {
        degreeStatus: 'active',
      });
    }
  };

  // Handle Add Attachment file upload simulation
  const handleUploadAttachment = (type: AttachmentType) => {
    const typeLabel =
      type === 'case_cover'
        ? 'غلاف الملف'
        : type === 'power_of_attorney'
        ? 'التوكيل الرسمي'
        : type === 'full_case'
        ? 'صورة كاملة للقضية'
        : 'مستند إضافي';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,application/pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const fakeUrl = URL.createObjectURL(file);
        const newAtt: CaseAttachment = {
          id: 'att_' + Date.now(),
          name: `${typeLabel} - ${file.name}`,
          type: type,
          fileName: file.name,
          fileUrl: fakeUrl,
          fileSize: `${(file.size / 1024).toFixed(0)} KB`,
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedByLawyerName: currentUser.name,
        };
        const updatedAtts = [...caseItem.attachments, newAtt];
        onUpdateCase(caseItem.id, { attachments: updatedAtts });
      }
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Dossier Header */}
        <div className="bg-gradient-to-r from-amber-50/70 via-slate-50 to-amber-50/50 border-b border-slate-200 p-4 sm:p-5 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-xl border border-amber-300 font-mono">
                ملف رقم: {caseItem.fileNumber}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-semibold border border-slate-200">
                {caseItem.caseType}
              </span>
              {caseItem.degreeStatus === 'active' && (
                <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  متداولة بالمحاكم
                </span>
              )}
              {caseItem.degreeStatus === 'under_filing' && (
                <span className="text-xs bg-blue-50 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                  تحت الرفع والقيد
                </span>
              )}
              {caseItem.degreeStatus === 'finished' && (
                <span className="text-xs bg-purple-50 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  منتهية (محفوظة بالأرشيف)
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
              {caseItem.clientName}
            </h2>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <strong className="text-slate-800">الخصم:</strong> {caseItem.opponentName}
              </span>
              <span>
                <strong className="text-slate-800">المحكمة:</strong> {caseItem.court}
              </span>
              <span>
                <strong className="text-slate-800">الموضوع/التهمة:</strong> {caseItem.charge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick AI Assist with this case context */}
            <button
              onClick={() => onNavigateToAIWithContext(caseItem)}
              className="text-xs bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold px-3 py-2 rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5 shrink-0"
              title="توليد مذكرة دفاع أو دراسة ثغرات هذه القضية عبر مساعدك القانوني"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="hidden sm:inline">صياغة بـ مساعدك القانوني</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation within dossier */}
        <div className="flex items-center gap-1 bg-slate-50 px-4 pt-2 border-b border-slate-200 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sessions'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>سجل الجلسات والترحيل ({caseItem.sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admin_tasks')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'admin_tasks'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>الأعمال الإدارية المرتبطة ({linkedTasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'stages'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>مراحل التقاضي ({caseItem.stages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'attachments'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>المرفقات والتوكيل ({caseItem.attachments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-3 border-b-2 font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'notes'
                ? 'border-amber-600 text-amber-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>الملاحظات وخطة الدفاع</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
          {/* TAB 1: سجل الجلسات والترحيل (Sessions & Postponements) */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span>سجل الجلسات وتاريخ المحاكمات</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    تسجيل ما حدث بالجلسة، القرارات، وترحيل الجلسة تلقائياً لموعدها القادم مع تنبيهات 18 ساعة و8 صباحاً
                  </p>
                </div>

                {currentUser.permissions.canEditCase && (
                  <button
                    onClick={() => onOpenSessionModal(caseItem)}
                    className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة / ترحيل جلسة</span>
                  </button>
                )}
              </div>

              {caseItem.sessions.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">لا توجد جلسات مسجلة بعد لهذا الملف</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اضغط على زر «إضافة / ترحيل جلسة» لتحديد جلسة محاكمة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {caseItem.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-amber-300 transition space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
                            جلسة: {sess.date}
                          </span>
                          {sess.rollNumber && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                              رول #{sess.rollNumber}
                            </span>
                          )}
                          {sess.isCompleted ? (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                              جلسة سابقة
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-300">
                              جلسة مرتقبة
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenSessionModal(caseItem, sess)}
                            className="text-xs bg-white hover:bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1 font-semibold"
                          >
                            <Edit className="w-3 h-3 text-amber-600" />
                            <span>تسجيل ما حدث / ترحيل</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                        <div>
                          <strong className="text-slate-800">المحكمة:</strong> {sess.court}
                          {sess.circuit && <span className="mr-1">- {sess.circuit}</span>}
                        </div>
                        <div>
                          <strong className="text-slate-800">المحامي الحاضر:</strong>{' '}
                          {sess.assignedLawyerName || currentUser.name}
                        </div>
                      </div>

                      {sess.whatHappened && (
                        <div className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                          <strong className="text-amber-800">ما الذي حدث بالجلسة:</strong>{' '}
                          {sess.whatHappened}
                        </div>
                      )}

                      {sess.isPostponed && (
                        <div className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <strong>رُحلت الجلسة:</strong> {sess.postponementReason || 'للتأجيل'}
                          </div>
                          {sess.postponedToDate && (
                            <span className="font-mono text-amber-900 font-bold bg-white px-2 py-0.5 rounded border border-amber-200">
                              إلى جلسة: {sess.postponedToDate} (مجدولة تلقائياً)
                            </span>
                          )}
                        </div>
                      )}

                      {sess.decision && (
                        <div className="text-xs text-emerald-900 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                          <strong>القرار الصادر:</strong> {sess.decision}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: الأعمال الإدارية المرتبطة بالقضية (Linked Admin Tasks) */}
          {activeTab === 'admin_tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>الأعمال الإدارية والمحضرين الخاصة بهذا الملف</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    تتحدث وتضاف تلقائياً مع نظام تذكير قبل 18 ساعة وصباحاً الساعة 8:00
                  </p>
                </div>

                <button
                  onClick={() => onOpenNewAdminTask(caseItem)}
                  className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إضافة عمل إداري للملف</span>
                </button>
              </div>

              {linkedTasks.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <ClipboardList className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">لا توجد أعمال إدارية مسجلة لهذا الملف حالياً</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    اضغط «+ إضافة عمل إداري للملف» لتكليف محضر أو جدول أو سداد رسم.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-amber-300 transition space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {task.taskType}
                            </span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                              {task.department}
                            </span>
                            {task.status === 'completed' ? (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                                تم الإنجاز
                              </span>
                            ) : (
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold">
                                قيد التنفيذ
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>المحامي المكلف: {task.assignedLawyerName}</span>
                            <span>•</span>
                            <span>تاريخ الاستحقاق: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      {task.notes && (
                        <div className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                          {task.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: مراحل التقاضي (Stages: First degree, Appeal, Cassation) */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>مراحل وتدرج التقاضي (الدرجة الأولى / الاستئناف / النقض)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    أرقام الدعاوى، السنوات القضائية، والدوائر بالمحاكم
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {caseItem.stages.map((stg) => (
                  <div
                    key={stg.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200">
                        {stg.levelLabel}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        سنة: {stg.year || '2026'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-600">
                      <div>
                        <strong className="text-slate-800">رقم القضية:</strong>{' '}
                        <span className="text-slate-900 font-bold">{stg.caseNumber || 'قيد الإجراء'}</span>
                      </div>
                      <div>
                        <strong className="text-slate-800">المحكمة:</strong> {stg.court}
                      </div>
                      <div>
                        <strong className="text-slate-800">الدائرة:</strong> {stg.circuit}
                      </div>
                    </div>

                    {stg.notes && (
                      <div className="text-xs text-slate-600 mt-1 bg-white p-2 rounded-lg border border-slate-200">
                        {stg.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: المرفقات والتوكيل (Attachments) */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-amber-600" />
                    <span>مرفقات ملف القضية (غلاف، صورة القضية، التوكيل)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك رفع مستندات إضافية وتصفحها أو تصديرها بنقرة واحدة
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleUploadAttachment('case_cover')}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition font-medium"
                  >
                    + غلاف ملف
                  </button>
                  <button
                    onClick={() => handleUploadAttachment('power_of_attorney')}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition font-medium"
                  >
                    + توكيل رسمي
                  </button>
                  <button
                    onClick={() => handleUploadAttachment('full_case')}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition font-medium"
                  >
                    + صورة كاملة للقضية
                  </button>
                </div>
              </div>

              {caseItem.attachments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  <Paperclip className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-slate-700">لا توجد مرفقات مرفوعة حتى الآن</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    استخدم الأزرار أعلاه لرفع غلاف الملف، التوكيل الرسمي، وصور المستندات.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseItem.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-300 transition flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="truncate text-xs">
                          <div className="font-bold text-slate-900 truncate">{att.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{att.fileSize || '350 KB'}</span>
                            <span>•</span>
                            <span>{att.uploadDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setPreviewAttachment(att)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                          title="معاينة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={att.fileUrl}
                          download={att.fileName}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                          title="تحميل"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: الملاحظات وخطة الدفاع (Notes) */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>ملاحظات مكتب المحاماة وخطة المرافعة</span>
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {caseItem.notes || 'لا توجد ملاحظات إضافية مدونة.'}
              </div>

              {caseItem.finishDetails && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs space-y-1.5">
                  <div className="font-bold text-purple-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-700" />
                    <span>تفاصيل انتهاء القضية وحفظها بالأرشيف:</span>
                  </div>
                  <div className="text-slate-800">
                    <strong>تاريخ الانتهاء:</strong> {caseItem.finishDetails.date}
                  </div>
                  <div className="text-slate-800">
                    <strong>منطوق الحكم / القرار:</strong> {caseItem.finishDetails.verdict}
                  </div>
                  {caseItem.finishDetails.archiveNotes && (
                    <div className="text-slate-600">
                      <strong>ملاحظات الأرشيف:</strong> {caseItem.finishDetails.archiveNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions: Mark finished -> Archive, or Reopen */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-slate-500">
            تاريخ فتح الملف: <span className="font-mono text-slate-700 font-bold">{caseItem.createdAt}</span>
          </div>

          <div className="flex items-center gap-2">
            {caseItem.degreeStatus === 'finished' ? (
              <button
                onClick={handleReopenCase}
                className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl transition font-semibold"
              >
                إلغاء الأرشفة وإعادة التداول
              </button>
            ) : (
              <button
                onClick={() => setIsFinishingCase(true)}
                className="text-xs bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>إنهاء القضية ونقلها للأرشيف</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-xl transition font-semibold"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Mark Case Finished Form */}
      {isFinishingCase && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>إنهاء القضية وتحويلها للأرشيف</span>
              </h3>
              <button
                onClick={() => setIsFinishingCase(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              عند تحويل القضية لـ <strong>«منتهية»</strong>، ستنتقل تلقائياً إلى قسم الأرشيف مع الاحتفاظ بكافة مستنداتها وجلساتها.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  منطوق الحكم النهائي أو سبب الانتهاء <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={verdictText}
                  onChange={(e) => setVerdictText(e.target.value)}
                  placeholder="مثال: حكمت المحكمة ببراءة المتهم من التهمة المنسوبة إليه، أو بالتصالح وانقضاء الدعوى..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">ملاحظات الأرشيف وسحب المستندات</label>
                <input
                  type="text"
                  value={archiveNotesText}
                  onChange={(e) => setArchiveNotesText(e.target.value)}
                  placeholder="مثال: تم تسليم أصل الشيك للعميل وحفظ صورة طبق الأصل بالأرشيف"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsFinishingCase(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                إلغاء
              </button>
              <button
                onClick={handleMarkFinished}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition"
              >
                تأكيد النقل للأرشيف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">{previewAttachment.name}</span>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-slate-100 rounded-2xl p-4">
              <img
                src={previewAttachment.fileUrl}
                alt={previewAttachment.name}
                className="max-h-[50vh] object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>الحجم: {previewAttachment.fileSize}</span>
              <a
                href={previewAttachment.fileUrl}
                download={previewAttachment.fileName}
                className="text-amber-700 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل المستند</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
