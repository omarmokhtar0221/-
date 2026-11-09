import React, { useState } from 'react';
import {
  AdminTask,
  Case,
  LawyerMember,
  AdminTaskStatus,
} from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  Calendar,
  Share2,
  Printer,
  Search,
  Check,
  History,
  Trash2,
  Bell,
} from 'lucide-react';

interface AdminTasksTabProps {
  adminTasks: AdminTask[];
  cases: Case[];
  currentUser: LawyerMember;
  team: LawyerMember[];
  onAddTask: (task: Omit<AdminTask, 'id' | 'historyLog'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<AdminTask>, logAction?: string, lawyerName?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenPrintRoll: () => void;
}

const EGYPTIAN_ADMIN_TASK_TYPES = [
  'استخراج شهادة رسمية من واقع الجدول بما تم بالجلسة',
  'إعلان صحيفة الدعوى وإعادة الإعلان لقلم المحضرين',
  'إعلان بالتحري عن محل إقامة الخصم في مواجهة النيابة',
  'سداد رسم أمانة خبير (هندسي / حسابي / طب شرعي) بالخزينة',
  'استلام الصيغة التنفيذية للحكم وتذييلها بالصيغة',
  'استخراج صورة رسمية طبق الأصل من الحكم ومحضر الجلسة',
  'استخراج شهادة بعدم حصول استئناف (لإثبات نهائية الحكم)',
  'قيد صحيفة استئناف وتأشيرة الجدول وتحديد الدائرة',
  'قيد طعن بالنقض وإيداع الكفالة القانونية بدار القضاء',
  'عمل تقرير معارضة في حكم غيابي أو معارضة استئنافية',
  'استخراج صورة ضوئية من أوراق القضية من قلم الحفظ',
  'استعلام عن إشارة جدول أو قيد جنحة بنيابة القسم',
  'تحرير محضر شرطة أو جنحة مباشرة بنيابة القسم',
  'توثيق توكيل رسمي عام في القضايا بالشهر العقاري',
  'صرف أمانة مالية أو كفالة بنكية من خزينة المحكمة',
];

const EGYPTIAN_DEPARTMENTS = [
  'قلم المحضرين (إعلانات وتنفيذ)',
  'الجدول الجنائي (مصر الجديدة / الدقي / الجيزة...)',
  'الجدول المدني والتعويضات',
  'خزينة المحكمة (سداد رسوم وأمانات)',
  'قلم الحفظ والأرشيف بالمحكمة',
  'مكتب خبراء وزارة العدل',
  'مصلحة الشهر العقاري والتوثيق',
  'ديوان قسم الشرطة والنيابة الجزئية',
  'جدول محكمة القضاء الإداري (مجلس الدولة)',
  'نيابة الشؤون المالية والتجارية',
];

export const AdminTasksTab: React.FC<AdminTasksTabProps> = ({
  adminTasks,
  cases,
  currentUser,
  team,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenPrintRoll,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all_pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLawyer, setFilterLawyer] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Task Form State
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [customFileNumber, setCustomFileNumber] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [customOpponentName, setCustomOpponentName] = useState('النيابة العامة');
  const [customCourt, setCustomCourt] = useState('');
  const [taskType, setTaskType] = useState(EGYPTIAN_ADMIN_TASK_TYPES[0]);
  const [department, setDepartment] = useState(EGYPTIAN_DEPARTMENTS[0]);
  const [assignedLawyerId, setAssignedLawyerId] = useState(currentUser.id);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'urgent' | 'normal'>('urgent');
  const [notes, setNotes] = useState('');

  const [selectedTaskForLog, setSelectedTaskForLog] = useState<AdminTask | null>(null);
  const [newLogText, setNewLogText] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-fill Case Info when case is picked
  const handleCaseSelectChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    if (caseId) {
      const foundCase = cases.find((c) => c.id === caseId);
      if (foundCase) {
        setCustomFileNumber(foundCase.fileNumber);
        setCustomClientName(foundCase.clientName);
        setCustomOpponentName(foundCase.opponentName);
        setCustomCourt(foundCase.court);
      }
    } else {
      setCustomFileNumber('');
      setCustomClientName('');
      setCustomOpponentName('النيابة العامة');
      setCustomCourt('');
    }
  };

  const filteredTasks = adminTasks.filter((t) => {
    if (filterStatus === 'all_pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'today' && t.dueDate !== todayStr) return false;
    if (filterLawyer !== 'all' && t.assignedLawyerId !== filterLawyer) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.caseFileNumber.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      t.taskType.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.court.toLowerCase().includes(q) ||
      t.assignedLawyerName.toLowerCase().includes(q)
    );
  });

  const handleSubmitNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customClientName.trim() || !customFileNumber.trim()) {
      alert('يرجى تحديد رقم الملف بالمكتب واسم الموكل.');
      return;
    }

    const assignedLawyer = team.find((l) => l.id === assignedLawyerId) || currentUser;

    onAddTask({
      caseId: selectedCaseId || undefined,
      caseFileNumber: customFileNumber,
      clientName: customClientName,
      opponentName: customOpponentName || 'النيابة العامة',
      court: customCourt || 'المحكمة المختصة',
      taskType: taskType,
      department: department,
      assignedLawyerId: assignedLawyer.id,
      assignedLawyerName: assignedLawyer.name,
      dueDate: dueDate,
      status: 'pending',
      priority: priority,
      notes: notes,
    });

    setIsAddModalOpen(false);
    setSelectedCaseId('');
    setCustomFileNumber('');
    setCustomClientName('');
    setNotes('');
  };

  const handleAddLogToTask = () => {
    if (!selectedTaskForLog || !newLogText.trim()) return;

    onUpdateTask(
      selectedTaskForLog.id,
      {},
      newLogText.trim(),
      currentUser.name
    );

    const updated = adminTasks.find((t) => t.id === selectedTaskForLog.id);
    if (updated) {
      setSelectedTaskForLog(updated);
    }
    setNewLogText('');
  };

  const handleShareOnWhatsApp = (task: AdminTask) => {
    const text = `📋 *تكليف عمل إداري - مكتب المحاماة*\n` +
      `• *رقم الملف:* ${task.caseFileNumber}\n` +
      `• *الموكل:* ${task.clientName}\n` +
      `• *المحكمة/الجهة:* ${task.court}\n` +
      `• *الجهة الفرعية:* ${task.department}\n` +
      `• *العمل المطلوب:* ${task.taskType}\n` +
      `• *تاريخ الإنجاز المطلوب:* ${task.dueDate}\n` +
      `• *المحامي المكلف:* ${task.assignedLawyerName}\n` +
      (task.notes ? `• *ملاحظات:* ${task.notes}\n` : '') +
      `\n_يرجى التوجه مبكراً الساعة 8:00 صباحاً وإثبات رقم الإجراء بالسجل._`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 text-slate-800">
      {/* Prominent Golden Hero Card (Light Theme) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-100/50 border-2 border-amber-300 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 shadow-inner">
              <ClipboardList className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  شق الأعمال الإدارية والمحضرين
                </h2>
                <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                  الشق الأهم بمكتب المحامي
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                متابعة دقيقة لكافة إجراءات المحضرين، الجداول الجنائية والمدنية، سداد الرسوم وأمانات الخبراء، مع إشعار تلقائي قبل موعد الإنجاز بـ 18 ساعة وتنبيه يومي ثابت الساعة 8:00 صباحاً.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>تكليف عمل إداري جديد</span>
            </button>

            <button
              onClick={onOpenPrintRoll}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold transition"
              title="طباعة كشف الأعمال الإدارية للمساعدين"
            >
              <Printer className="w-4 h-4 text-amber-600" />
              <span>طباعة كشف المحضرين</span>
            </button>
          </div>
        </div>

        {/* 18h & 8am notification assurance badge */}
        <div className="mt-3 pt-3 border-t border-amber-200 flex flex-wrap items-center gap-2 text-[11px] text-amber-900">
          <div className="flex items-center gap-1 font-bold">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>نظام التذكيرات التلقائي:</span>
          </div>
          <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
            تنبيه أول قبل الموعد بـ 18 ساعة
          </span>
          <span className="bg-white px-2 py-0.5 rounded-md border border-amber-200 font-semibold">
            إشعار يومي الساعة 8:00 صباحاً حتى يتم الإنجاز
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilterStatus('all_pending')}
            className={`px-3 py-1.5 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'all_pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>قيد التنفيذ (عاجلة)</span>
          </button>

          <button
            onClick={() => setFilterStatus('today')}
            className={`px-3 py-1.5 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'today'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>استحقاق اليوم (8:00 ص)</span>
          </button>

          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded-xl transition font-bold shrink-0 flex items-center gap-1.5 ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم إنجازها</span>
          </button>

          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
              filterStatus === 'all'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            كافة الأعمال
          </button>
        </div>

        {/* Search & Lawyer Assignee Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الملف، اسم الموكل، العمل الإداري، أو المحكمة..."
              className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <select
              value={filterLawyer}
              onChange={(e) => setFilterLawyer(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="all">كافة المحامين المكلفين</option>
              {team.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Admin Tasks Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs shadow-xs">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">لا توجد أعمال إدارية مطابقة لهذا التصنيف</p>
            <p className="text-[11px] text-slate-400 mt-1">
              اضغط على «تكليف عمل إداري جديد» لإضافة مهام قلم المحضرين والجدول.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isToday = task.dueDate <= todayStr && task.status !== 'completed';
            return (
              <div
                key={task.id}
                className={`rounded-2xl p-4 sm:p-5 transition shadow-xs border ${
                  task.status === 'completed'
                    ? 'bg-slate-50 border-slate-200 opacity-85'
                    : isToday
                    ? 'bg-amber-50/50 border-amber-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                {/* Header row: File number, department, status */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      ملف: {task.caseFileNumber}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-medium">
                      {task.department}
                    </span>
                    {task.status === 'completed' ? (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        تم الإنجاز في ({task.completedAt})
                      </span>
                    ) : (
                      <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-700" />
                        قيد التنفيذ
                      </span>
                    )}

                    {isToday && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full font-black animate-pulse">
                        تنبيه 8:00 صباحاً - مطلوب اليوم!
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    {task.status !== 'completed' ? (
                      <button
                        onClick={() =>
                          onUpdateTask(
                            task.id,
                            { status: 'completed' },
                            'تم إنجاز العمل الإداري بالكامل',
                            currentUser.name
                          )
                        }
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>تم الإنجاز</span>
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onUpdateTask(
                            task.id,
                            { status: 'in_progress' },
                            'تمت إعادة فتح العمل الإداري للمتابعة',
                            currentUser.name
                          )
                        }
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl transition"
                      >
                        إعادة فتح العمل
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedTaskForLog(task)}
                      className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1"
                      title="سجل حركات العمل والملاحظات"
                    >
                      <History className="w-3.5 h-3.5 text-amber-600" />
                      <span>السجل ({task.historyLog.length})</span>
                    </button>

                    <button
                      onClick={() => handleShareOnWhatsApp(task)}
                      className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition"
                      title="مشاركة التكليف على واتساب"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {currentUser.permissions.canDeleteAdminTasks && (
                      <button
                        onClick={() => {
                          if (confirm('هل أنت متأكد من حذف هذا العمل الإداري؟')) {
                            onDeleteTask(task.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="حذف العمل"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Task Description */}
                <div className="mt-3 text-sm font-bold text-slate-900">
                  {task.taskType}
                </div>

                {/* Case & Court details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      <strong className="text-slate-500">الموكل:</strong> {task.clientName}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      <strong className="text-slate-500">المحكمة:</strong> {task.court}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      <strong className="text-slate-500">تاريخ الإنجاز:</strong>{' '}
                      <span className="font-mono text-amber-800 font-bold">{task.dueDate}</span>
                    </span>
                  </div>
                </div>

                {/* Assignee & Notes */}
                <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>
                      المحامي المكلف: <strong className="text-slate-900">{task.assignedLawyerName}</strong>
                    </span>
                  </div>

                  {task.notes && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex-1 max-w-md">
                      <strong>ملاحظة:</strong> {task.notes}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create New Admin Task Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">تكليف عمل إداري بالمحكمة / المحضرين</h3>
                  <p className="text-xs text-slate-500">
                    عند اختيار رقم الملف تظهر بيانات القضية والموكل تلقائياً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewTask} className="space-y-4 text-xs">
              {/* Feature 3: Select Case File Number -> Auto Fills Everything */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <label className="block text-amber-900 font-bold">
                  اختر رقم الملف بالمكتب (لتعبئة البيانات آلياً):
                </label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => handleCaseSelectChange(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500 shadow-2xs"
                >
                  <option value="">-- أو كتابة رقم ملف حر يدوي --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      ملف {c.fileNumber} | {c.clientName} ({c.court})
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-filled or editable case fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    رقم الملف بالمكتب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customFileNumber}
                    onChange={(e) => setCustomFileNumber(e.target.value)}
                    placeholder="مثال: 2026/104 ج"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    اسم الموكل <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="اسم الموكل"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم الخصم</label>
                  <input
                    type="text"
                    value={customOpponentName}
                    onChange={(e) => setCustomOpponentName(e.target.value)}
                    placeholder="النيابة العامة"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">المحكمة المختصة</label>
                  <input
                    type="text"
                    value={customCourt}
                    onChange={(e) => setCustomCourt(e.target.value)}
                    placeholder="مثال: محكمة شمال القاهرة - العباسية"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Task Type and Department */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  نوع العمل الإداري المطلوب إنجازه <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  list="admin_task_types_list"
                  required
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  placeholder="اختر أو اكتب نوع العمل"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                />
                <datalist id="admin_task_types_list">
                  {EGYPTIAN_ADMIN_TASK_TYPES.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  الجهة / القسم الإداري داخل المحكمة
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                >
                  {EGYPTIAN_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignee & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    المحامي المكلف بالإنجاز
                  </label>
                  <select
                    value={assignedLawyerId}
                    onChange={(e) => setAssignedLawyerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    {team.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.title.split(' - ')[0]})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    تاريخ الاستحقاق المطلوب
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ملاحظات وتعليمات خاصة للمحامي المنفذ
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى التوجه مبكراً لأخذ تأشيرة رئيس القلم ومراجعة أصل التوكيل..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Automatic notification reminder notes */}
              <div className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                🔔 سيقوم التطبيق بتذكير المحامي المكلف تلقائياً قبل الموعد بـ 18 ساعة، وسيرسل إشعاراً ثابتاً الساعة 8:00 صباحاً من كل يوم حتى يتم وضع علامة «تم الإنجاز».
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold shadow-xs active:scale-95 transition"
                >
                  حفظ وتكليف العمل الإداري
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View & Update Task History Log */}
      {selectedTaskForLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>سجل الإجراءات للعمل الإداري: ملف {selectedTaskForLog.caseFileNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTaskForLog.taskType}</p>
              </div>
              <button
                onClick={() => setSelectedTaskForLog(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* List of past log items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {selectedTaskForLog.historyLog.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-mono">{log.date}</span>
                    <span className="text-amber-800 font-bold">{log.lawyerName}</span>
                  </div>
                  <div className="text-slate-800 font-medium">{log.action}</div>
                </div>
              ))}
            </div>

            {/* Add new action log */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-slate-700 font-bold text-xs">
                إضافة إجراء أو إفادة جديدة بالسجل:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogText}
                  onChange={(e) => setNewLogText(e.target.value)}
                  placeholder="مثال: تم تسليم الإعلان للمحضر برقم قيد 458..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddLogToTask}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                >
                  إضافة
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTaskForLog(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
