import React, { useState } from 'react';
import {
  Case,
  CaseType,
  CaseStatus,
  LitigationStage,
  Session,
  LawyerMember,
  AdminTask,
} from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Building,
  User,
  Shield,
  Clock,
  CheckCircle2,
  Paperclip,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown,
  Layers,
  Phone,
  AlertCircle,
  Archive,
} from 'lucide-react';

interface CasesTabProps {
  cases: Case[];
  currentUser: LawyerMember;
  adminTasks: AdminTask[];
  onSelectCase: (c: Case) => void;
  onAddCase: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCase: (caseId: string, updates: Partial<Case>) => void;
  onDeleteCase: (caseId: string) => void;
  onOpenSessionModal: (c: Case, s?: Session) => void;
  onOpenNewAdminTask: (preselectedCase?: Case) => void;
}

const EGYPTIAN_COURTS = [
  'محكمة جنايات شمال القاهرة - مجمع محاكم العباسية',
  'محكمة استئناف عالي القاهرة - مجمع محاكم التجمع الخامس',
  'محكمة جنوب القاهرة الابتدائية - مجمع محاكم زينهم',
  'محكمة جنوب الجيزة الابتدائية - مجمع محاكم شارع السودان',
  'محكمة شمال الجيزة الابتدائية - مجمع محاكم تاج الدول',
  'محكمة استئناف عالي بني سويف / الجيزة',
  'محكمة القاهرة الاقتصادية - مجمع محاكم المعادي',
  'محكمة النقض - دار القضاء العالي (وسط البلد)',
  'محكمة القضاء الإداري - مجلس الدولة بالدقي',
  'المحكمة الإدارية العليا - مجلس الدولة بالدقي',
  'محكمة جنح مستأنف مصر الجديدة والنزهة',
  'محكمة جنح الدقي والعجوزة الجزئية',
  'محكمة الأسرة - مصر الجديدة',
  'محكمة الأسرة - المعادي والبساتين',
  'محكمة استئناف الإسكندرية',
  'محكمة جنايات الإسكندرية - مجمع المنشية',
];

const CASE_TYPES: CaseType[] = [
  'جنايات',
  'جنح',
  'مدني',
  'جنايات اقتصادية',
  'جنح اقتصادية',
  'قضاء إداري',
  'أحوال شخصية',
  'عمالي',
  'أخرى',
];

export const CasesTab: React.FC<CasesTabProps> = ({
  cases,
  currentUser,
  adminTasks,
  onSelectCase,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onOpenSessionModal,
  onOpenNewAdminTask,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | CaseStatus>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Case Form State
  const [newFileNumber, setNewFileNumber] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNationalId, setNewClientNationalId] = useState('');
  const [newClientRole, setNewClientRole] = useState('متهم');
  const [newOpponentName, setNewOpponentName] = useState('النيابة العامة');
  const [newDegreeStatus, setNewDegreeStatus] = useState<CaseStatus>('active');
  const [newCourt, setNewCourt] = useState(EGYPTIAN_COURTS[0]);
  const [newCaseType, setNewCaseType] = useState<CaseType>('جنايات');
  const [newCharge, setNewCharge] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Litigation stages (First degree default + dynamic Appeal and Cassation via + button)
  const [stages, setStages] = useState<LitigationStage[]>([
    {
      id: 'stg_init',
      level: 'first_degree',
      levelLabel: 'الدرجة الأولى',
      caseNumber: '',
      court: EGYPTIAN_COURTS[0],
      circuit: 'الدائرة الأولى',
      year: new Date().getFullYear().toString(),
      notes: '',
    },
  ]);

  // Initial Session (optional)
  const [hasInitialSession, setHasInitialSession] = useState(true);
  const [initialSessionDate, setInitialSessionDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [initialSessionRoll, setInitialSessionRoll] = useState('');

  // Attachments placeholders
  const [hasCoverFile, setHasCoverFile] = useState(true);
  const [hasFullCaseFile, setHasFullCaseFile] = useState(false);
  const [hasPowerOfAttorneyFile, setHasPowerOfAttorneyFile] = useState(true);

  // Filter cases
  const filteredCases = cases.filter((c) => {
    if (activeFilter !== 'all' && c.degreeStatus !== activeFilter) return false;
    if (selectedCaseType !== 'all' && c.caseType !== selectedCaseType) return false;
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      c.fileNumber.toLowerCase().includes(query) ||
      c.clientName.toLowerCase().includes(query) ||
      c.opponentName.toLowerCase().includes(query) ||
      c.court.toLowerCase().includes(query) ||
      c.charge.toLowerCase().includes(query)
    );
  });

  const handleAddAppealStage = () => {
    if (stages.some((s) => s.level === 'appeal')) return;
    setStages([
      ...stages,
      {
        id: 'stg_appeal_' + Date.now(),
        level: 'appeal',
        levelLabel: 'المستأنف',
        caseNumber: '',
        court: 'محكمة استئناف عالي القاهرة - التجمع الخامس',
        circuit: 'الدائرة استئنافية',
        year: new Date().getFullYear().toString(),
        notes: '',
      },
    ]);
  };

  const handleAddCassationStage = () => {
    if (stages.some((s) => s.level === 'cassation')) return;
    setStages([
      ...stages,
      {
        id: 'stg_cassation_' + Date.now(),
        level: 'cassation',
        levelLabel: 'النقض',
        caseNumber: '',
        court: 'محكمة النقض - دار القضاء العالي',
        circuit: 'دائرة النقض الجنائية / المدنية',
        year: new Date().getFullYear().toString(),
        notes: '',
      },
    ]);
  };

  const handleStageChange = (index: number, field: keyof LitigationStage, val: string) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: val };
    setStages(updated);
  };

  const handleRemoveStage = (index: number) => {
    if (stages.length <= 1) return;
    const updated = stages.filter((_, i) => i !== index);
    setStages(updated);
  };

  const handleSubmitNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      alert('يرجى إدخال اسم الموكل.');
      return;
    }

    const fileNum = newFileNumber.trim() || `${new Date().getFullYear()}/${cases.length + 101}`;

    const sessions: Session[] = [];
    if (hasInitialSession && initialSessionDate) {
      sessions.push({
        id: 'sess_' + Date.now(),
        caseId: '',
        caseFileNumber: fileNum,
        clientName: newClientName,
        court: newCourt,
        circuit: stages[0]?.circuit || '',
        rollNumber: initialSessionRoll,
        date: initialSessionDate,
        time: '09:30',
        whatHappened: '',
        isPostponed: false,
        isCompleted: false,
        assignedLawyerName: currentUser.name,
      });
    }

    const attachments = [];
    if (hasCoverFile) {
      attachments.push({
        id: 'att_cov_' + Date.now(),
        name: 'غلاف الملف الرسمي بالمكتب',
        type: 'case_cover' as const,
        fileUrl: '/assets/aistudio/_________0051f627.png',
        fileName: `غلاف_${fileNum.replace('/', '_')}.png`,
        fileSize: '450 KB',
        uploadDate: new Date().toISOString().split('T')[0],
      });
    }
    if (hasPowerOfAttorneyFile) {
      attachments.push({
        id: 'att_poa_' + Date.now(),
        name: 'التوكيل الرسمي العام في القضايا',
        type: 'power_of_attorney' as const,
        fileUrl: '/assets/aistudio/_____________bc3f6910.png',
        fileName: 'توكيل_موكل.png',
        fileSize: '890 KB',
        uploadDate: new Date().toISOString().split('T')[0],
      });
    }
    if (hasFullCaseFile) {
      attachments.push({
        id: 'att_full_' + Date.now(),
        name: 'صورة ضوئية كاملة لأوراق القضية',
        type: 'full_case' as const,
        fileUrl: '/assets/aistudio/_________0051f627.png',
        fileName: 'صورة_القضية_الكاملة.pdf',
        fileSize: '4.2 MB',
        uploadDate: new Date().toISOString().split('T')[0],
      });
    }

    onAddCase({
      fileNumber: fileNum,
      clientName: newClientName,
      clientPhone: newClientPhone,
      clientNationalId: newClientNationalId,
      clientRole: newClientRole,
      opponentName: newOpponentName || 'النيابة العامة',
      degreeStatus: newDegreeStatus,
      stages: stages,
      court: newCourt,
      caseType: newCaseType,
      charge: newCharge || 'غير محدد',
      sessions: sessions,
      attachments: attachments,
      notes: newNotes,
      finishDetails:
        newDegreeStatus === 'finished'
          ? {
              date: new Date().toISOString().split('T')[0],
              verdict: 'انتهت القضية ونقلت إلى الأرشيف',
              archiveNotes: 'حفظ أوراق القضية',
            }
          : undefined,
    });

    setIsAddModalOpen(false);
    setNewFileNumber('');
    setNewClientName('');
    setNewClientPhone('');
    setNewCharge('');
    setNewNotes('');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 text-slate-800">
      {/* Top Header & Actions Bar (Light Theme) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <span>شق الموكلين والقضايا</span>
            <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-black">
              {filteredCases.length} قضية
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة ملفات المكتب، درجات التقاضي، سجل الجلسات وترحيلها، والمرفقات
          </p>
        </div>

        {currentUser.permissions.canAddCase && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إضافة ملف قضية جديد</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-bold shrink-0 ${
              activeFilter === 'active'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>متداولة بالمحاكم</span>
          </button>

          <button
            onClick={() => setActiveFilter('under_filing')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-bold shrink-0 ${
              activeFilter === 'under_filing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>تحت الرفع والقيد</span>
          </button>

          <button
            onClick={() => setActiveFilter('finished')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 font-bold shrink-0 ${
              activeFilter === 'finished'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>الأرشيف (المنتهية)</span>
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${
              activeFilter === 'all'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            كافة القضايا
          </button>
        </div>

        {/* Search input and type dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم الملف، اسم الموكل، الخصم، التهمة، أو المحكمة..."
              className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <select
              value={selectedCaseType}
              onChange={(e) => setSelectedCaseType(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs"
            >
              <option value="all">كافة أنواع القضايا</option>
              {CASE_TYPES.map((t) => (
                <option key={t} value={t}>
                  قضايا {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases List (Light Cards) */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs shadow-xs">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">لم يتم العثور على أي ملفات قضايا مطابقة</p>
            <p className="text-[11px] text-slate-400 mt-1">
              تأكد من شروط البحث أو اضغط على «إضافة ملف قضية جديد» لتدوين قضية.
            </p>
          </div>
        ) : (
          filteredCases.map((c) => {
            const linkedTasks = adminTasks.filter(
              (t) => t.caseId === c.id || t.caseFileNumber === c.fileNumber
            );
            const pendingTasksCount = linkedTasks.filter((t) => t.status !== 'completed').length;

            const upcomingSessions = c.sessions
              .filter((s) => !s.isCompleted && s.date >= new Date().toISOString().split('T')[0])
              .sort((a, b) => a.date.localeCompare(b.date));
            const nextSession = upcomingSessions[0];

            return (
              <div
                key={c.id}
                className="bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition group"
              >
                {/* Header row: File number & status badge */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-black text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg border border-amber-300">
                      ملف رقم: {c.fileNumber}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200">
                      {c.caseType}
                    </span>
                    {c.degreeStatus === 'active' && (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        متداولة
                      </span>
                    )}
                    {c.degreeStatus === 'under_filing' && (
                      <span className="text-[11px] bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                        تحت الرفع
                      </span>
                    )}
                    {c.degreeStatus === 'finished' && (
                      <span className="text-[11px] bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        منتهية (أرشيف)
                      </span>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectCase(c)}
                      className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                    >
                      <span>ملف القضية والمرفقات</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    {currentUser.permissions.canDeleteCase && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف ملف القضية ${c.fileNumber} نهائياً؟`)) {
                            onDeleteCase(c.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="حذف القضية"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main case info: Client, Opponent, Court, Charge */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                      <User className="w-4 h-4 text-amber-600" />
                      <span>الموكل: {c.clientName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({c.clientRole})
                      </span>
                    </div>
                    {c.clientPhone && (
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 mr-5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span dir="ltr">{c.clientPhone}</span>
                      </div>
                    )}

                    <div className="text-slate-700 mt-1.5 mr-5">
                      <strong className="text-slate-500">الخصم:</strong>{' '}
                      <span className="text-slate-800">{c.opponentName}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-700 flex items-start gap-1.5">
                      <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-500">المحكمة:</strong> {c.court}
                      </div>
                    </div>
                    <div className="text-slate-700 mt-1 mr-5">
                      <strong className="text-slate-500">موضوع الدعوى / التهمة:</strong>{' '}
                      <span className="text-amber-900 font-semibold">{c.charge}</span>
                    </div>
                  </div>
                </div>

                {/* Litigation Stages Badges */}
                <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] flex flex-wrap items-center gap-2 justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-600 font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      مراحل التقاضي المسجلة:
                    </span>
                    {c.stages.map((stg) => (
                      <span
                        key={stg.id}
                        className="bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-300 font-medium"
                      >
                        <strong>{stg.levelLabel}:</strong> {stg.caseNumber || 'رقم غير مدرج'}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                    <span>{c.attachments.length} مرفقات (غلاف، توكيل، أوراق)</span>
                  </div>
                </div>

                {/* Next Hearing & Linked Admin tasks row */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    {nextSession ? (
                      <div>
                        <span className="text-slate-600">الجلسة القادمة: </span>
                        <strong className="text-amber-800 font-mono">{nextSession.date}</strong>
                        {nextSession.rollNumber && (
                          <span className="mr-1.5 text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                            رول #{nextSession.rollNumber}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 block sm:inline sm:mr-2">
                          (تنبيه قبل 18 ساعة + 8 صباحاً)
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">لا توجد جلسات محددة قادمة</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      <strong>الأعمال الإدارية:</strong> {linkedTasks.length} عمل ({pendingTasksCount} قيد التنفيذ)
                    </div>
                    <button
                      onClick={() => onOpenNewAdminTask(c)}
                      className="text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 font-bold transition"
                      title="إضافة عمل إداري خاص بهذا الملف"
                    >
                      + عمل إداري
                    </button>
                    <button
                      onClick={() => onOpenSessionModal(c)}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 font-bold transition"
                      title="إضافة جلسة أو ترحيل"
                    >
                      + جلسة
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Add New Case Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">إضافة ملف قضية جديد بالأجندة</h3>
                  <p className="text-xs text-slate-500">سجل بيانات الموكل، الخصم، والمحاكم والدرجات</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewCase} className="space-y-4 text-xs">
              {/* Row 1: File number & degree status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    رقم الملف بالمكتب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFileNumber}
                    onChange={(e) => setNewFileNumber(e.target.value)}
                    placeholder="مثال: 2026/105 ج"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500">
                    رقم تتبع الملف الداخلي بأرشيف مكتب المحاماة
                  </span>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    درجة وتداول القضية <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newDegreeStatus}
                    onChange={(e) => setNewDegreeStatus(e.target.value as CaseStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="active">متداولة أمام المحاكم</option>
                    <option value="under_filing">تحت الرفع والقيد</option>
                    <option value="finished">منتهية (تذهب تلقائياً للأرشيف)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Client Info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>بيانات الموكل</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">
                      اسم الموكل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="الاسم الثلاثي أو الرباعي"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">صفة الموكل في الدعوى</label>
                    <select
                      value={newClientRole}
                      onChange={(e) => setNewClientRole(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500"
                    >
                      <option value="متهم">متهم</option>
                      <option value="مدعي">مدعي</option>
                      <option value="مدعى عليه">مدعى عليه</option>
                      <option value="شاكي / مدعي بالحق المدني">شاكي / مدعي بالحق المدني</option>
                      <option value="مجني عليه">مجني عليه</option>
                      <option value="طاعن">طاعن</option>
                      <option value="مطعون ضده">مطعون ضده</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1">رقم الهاتف للتواصل</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="01012345678"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">
                    اسم الخصم (افتراضياً: النيابة العامة أو اكتب اسم الخصم)
                  </label>
                  <input
                    type="text"
                    value={newOpponentName}
                    onChange={(e) => setNewOpponentName(e.target.value)}
                    placeholder="النيابة العامة"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 3: Case Type, Charge, and Court */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع القضية</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value as CaseType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    {CASE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    نوع التهمة / موضوع الدعوى
                  </label>
                  <input
                    type="text"
                    value={newCharge}
                    onChange={(e) => setNewCharge(e.target.value)}
                    placeholder="مثال: نصب وإيهام بمشروع تجاري، تبديد، فسخ عقد..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 4: Court Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">المحكمة المختصة</label>
                <input
                  type="text"
                  list="egyptian_courts_list"
                  value={newCourt}
                  onChange={(e) => setNewCourt(e.target.value)}
                  placeholder="اختر أو اكتب اسم المحكمة"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                />
                <datalist id="egyptian_courts_list">
                  {EGYPTIAN_COURTS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              {/* Row 5: Dynamic Litigation Stages with (+) Button */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-700" />
                    <span>مراحل التقاضي وأرقام القضايا بالمحاكم</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!stages.some((s) => s.level === 'appeal') && (
                      <button
                        type="button"
                        onClick={handleAddAppealStage}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ مرحلة المستأنف</span>
                      </button>
                    )}
                    {!stages.some((s) => s.level === 'cassation') && (
                      <button
                        type="button"
                        onClick={handleAddCassationStage}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-300 px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ مرحلة النقض</span>
                      </button>
                    )}
                  </div>
                </div>

                {stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                      <span className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        {stage.levelLabel}
                      </span>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStage(idx)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          إلغاء المرحلة
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-500 text-[10px] block mb-0.5">
                          رقم القضية والسنة
                        </label>
                        <input
                          type="text"
                          value={stage.caseNumber}
                          onChange={(e) => handleStageChange(idx, 'caseNumber', e.target.value)}
                          placeholder="مثال: 4521 لسنة 2025"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] block mb-0.5">
                          المحكمة
                        </label>
                        <input
                          type="text"
                          value={stage.court}
                          onChange={(e) => handleStageChange(idx, 'court', e.target.value)}
                          placeholder="محكمة الدرجة"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] block mb-0.5">الدائرة</label>
                        <input
                          type="text"
                          value={stage.circuit}
                          onChange={(e) => handleStageChange(idx, 'circuit', e.target.value)}
                          placeholder="مثال: الدائرة 3 جنايات"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Row 6: Initial Session */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasInitialSession}
                      onChange={(e) => setHasInitialSession(e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                    <span>تحديد جلسة أولى بالقضية</span>
                  </label>
                  <span className="text-[10px] text-amber-800 font-bold">
                    تنبيه قبل الجلسة بـ 18 ساعة + 8 صباحاً
                  </span>
                </div>

                {hasInitialSession && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-slate-600 text-[10px] block mb-0.5">
                        تاريخ الجلسة الأولى
                      </label>
                      <input
                        type="date"
                        value={initialSessionDate}
                        onChange={(e) => setInitialSessionDate(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 text-[10px] block mb-0.5">
                        رقم الرول (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={initialSessionRoll}
                        onChange={(e) => setInitialSessionRoll(e.target.value)}
                        placeholder="مثال: رول 12"
                        className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
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
                  حفظ وإضافة الملف للأجندة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
