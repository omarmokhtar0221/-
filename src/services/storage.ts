import {
  Case,
  AdminTask,
  LawyerMember,
  LawyerLiveLocation,
  Session,
} from '../types/legal';

const CASES_STORAGE_KEY = 'ajenda_cases_v1';
const ADMIN_TASKS_STORAGE_KEY = 'ajenda_admin_tasks_v1';
const TEAM_STORAGE_KEY = 'ajenda_team_v1';
const CURRENT_USER_KEY = 'ajenda_current_user_v1';
const LOCATION_STORAGE_KEY = 'ajenda_location_v1';

// Seed Initial Egyptian Lawyers Team
const INITIAL_TEAM: LawyerMember[] = [
  {
    id: 'lawyer_admin',
    name: 'أ. عمر مختار عبدالعزيز',
    role: 'admin',
    title: 'محامٍ بالنقض والدستورية العليا - صاحب المكتب',
    phone: '01001234567',
    email: 'Maro100010001000@gmail.com',
    isActive: true,
    permissions: {
      canAddCase: true,
      canEditCase: true,
      canDeleteCase: true,
      canViewAllCases: true,
      canManageAdminTasks: true,
      canDeleteAdminTasks: true,
      canUseAI: true,
      canManageTeam: true,
    },
  },
  {
    id: 'lawyer_associate_1',
    name: 'أ. طارق الشناوي',
    role: 'associate',
    title: 'محامٍ بالاستئناف العالي ومجلس الدولة',
    phone: '01123456789',
    email: 'tarek.lawyer@example.com',
    isActive: true,
    permissions: {
      canAddCase: true,
      canEditCase: true,
      canDeleteCase: false,
      canViewAllCases: true,
      canManageAdminTasks: true,
      canDeleteAdminTasks: false,
      canUseAI: true,
      canManageTeam: false,
    },
  },
  {
    id: 'lawyer_trainee_2',
    name: 'أ. أحمد رفعت',
    role: 'trainee',
    title: 'محامٍ ابتدائي - مسؤول المحضرين والجداول',
    phone: '01234567890',
    email: 'ahmed.refaat@example.com',
    isActive: true,
    permissions: {
      canAddCase: true,
      canEditCase: true,
      canDeleteCase: false,
      canViewAllCases: false,
      canManageAdminTasks: true,
      canDeleteAdminTasks: false,
      canUseAI: true,
      canManageTeam: false,
    },
  },
];

// Helper to get formatted dates relative to today
const getRelativeDate = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

// Seed Realistic Egyptian Cases
const INITIAL_CASES: Case[] = [
  {
    id: 'case_1',
    fileNumber: '2026/104 ج',
    clientName: 'الحاج إبراهيم منصور الدسوقي',
    clientPhone: '01098765432',
    clientNationalId: '28005120101918',
    clientRole: 'متهم (مخلى سبيله بضمان مالي)',
    opponentName: 'النيابة العامة',
    degreeStatus: 'active',
    court: 'محكمة جنايات شمال القاهرة - العباسية',
    caseType: 'جنايات',
    charge: 'استعمال محرر عرفي مزور وإيهام بمشروع تجاري كاذب (نصب)',
    stages: [
      {
        id: 'stg_1',
        level: 'first_degree',
        levelLabel: 'أول درجة',
        caseNumber: '8412 لسنة 2025 جنايات مصر الجديدة',
        court: 'محكمة جنايات شمال القاهرة - العباسية',
        circuit: 'الدائرة 18 جنايات شمال',
        year: '2025',
        notes: 'مقيدة برقم كلي 142 لسنة 2025 كلي شرق القاهرة',
      },
      {
        id: 'stg_2',
        level: 'appeal',
        levelLabel: 'المستأنف',
        caseNumber: '312 لسنة 2026 جنايات مستأنف',
        court: 'محكمة استئناف عالي القاهرة - مجمع محاكم التجمع الخامس',
        circuit: 'الدائرة 5 استئنافية',
        year: '2026',
        notes: 'تم قيد الاستئناف بعد تعديل قانون الإجراءات الجنائية لاستئناف الجنايات',
      },
    ],
    sessions: [
      {
        id: 'sess_1_1',
        caseId: 'case_1',
        caseFileNumber: '2026/104 ج',
        clientName: 'الحاج إبراهيم منصور الدسوقي',
        court: 'محكمة استئناف عالي القاهرة - التجمع الخامس',
        circuit: 'الدائرة 5 جنايات مستأنف',
        rollNumber: '14',
        date: getRelativeDate(0), // Today!
        time: '09:30',
        whatHappened: 'حضور المتهم والمرافعة الشفوية والدفع ببطلان استجواب المتهم أمام النيابة',
        isPostponed: true,
        postponementReason: 'لضم أصل الشيك البنكي ومستندات الخبير المصرفي والمرافعة الختامية',
        postponedToDate: getRelativeDate(14),
        decision: 'تأجيل لجلسة ' + getRelativeDate(14) + ' للضم وطلب الخبير',
        isCompleted: false,
        assignedLawyerName: 'أ.د. محمود العزازي',
      },
      {
        id: 'sess_1_2',
        caseId: 'case_1',
        caseFileNumber: '2026/104 ج',
        clientName: 'الحاج إبراهيم منصور الدسوقي',
        court: 'محكمة استئناف عالي القاهرة - التجمع الخامس',
        circuit: 'الدائرة 5 جنايات مستأنف',
        rollNumber: '',
        date: getRelativeDate(14),
        time: '10:00',
        whatHappened: '',
        isPostponed: false,
        isCompleted: false,
        assignedLawyerName: 'أ. طارق الشناوي',
      },
    ],
    attachments: [
      {
        id: 'att_1',
        name: 'غلاف ملف القضية',
        type: 'case_cover',
        fileUrl: '/assets/aistudio/_________0051f627.png',
        fileName: 'غلاف_ملف_2026_104.png',
        fileSize: '420 KB',
        uploadDate: '2026-01-10',
      },
      {
        id: 'att_2',
        name: 'التوكيل الرسمي العام في القضايا',
        type: 'power_of_attorney',
        fileUrl: '/assets/aistudio/_____________bc3f6910.png',
        fileName: 'توكيل_رسمي_مصر_الجديدة.png',
        fileSize: '1.2 MB',
        uploadDate: '2026-01-11',
      },
    ],
    notes: 'الموكل سدد الدفعة الأولى من الأتعاب. الدفاع يركز على انتفاء الركن المادي وتنازل الشاكي عرفياً.',
    createdAt: '2026-01-10',
    updatedAt: '2026-02-15',
  },
  {
    id: 'case_2',
    fileNumber: '2026/72 م',
    clientName: 'شركة النيل للإنشاءات الهندسية (المهندس عادل كمال)',
    clientPhone: '01229988776',
    clientRole: 'مدعي',
    opponentName: 'شركة الفراعنة للتوريدات العقارية وممثلها القانوني',
    degreeStatus: 'active',
    court: 'محكمة جنوب الجيزة الابتدائية - مجمع محاكم الجيزة',
    caseType: 'مدني',
    charge: 'دعوى فسخ عقد مقاولة وإلزام بالتعويض الاتفاقي بمبلغ 3 ملايين جنيه',
    stages: [
      {
        id: 'stg_2_1',
        level: 'first_degree',
        levelLabel: 'أول درجة',
        caseNumber: '1945 لسنة 2025 مدني كلي الجيزة',
        court: 'محكمة جنوب الجيزة الابتدائية',
        circuit: 'الدائرة 8 تعويضات',
        year: '2025',
        notes: 'تم سداد أمانة الخبير الهندسي بمبلغ 5000 جنيه',
      },
    ],
    sessions: [
      {
        id: 'sess_2_1',
        caseId: 'case_2',
        caseFileNumber: '2026/72 م',
        clientName: 'شركة النيل للإنشاءات الهندسية',
        court: 'محكمة جنوب الجيزة الابتدائية',
        circuit: 'الدائرة 8 مدني كلي',
        rollNumber: '7',
        date: getRelativeDate(1), // Tomorrow (within 18 hours!)
        time: '10:30',
        whatHappened: '',
        isPostponed: false,
        isCompleted: false,
        assignedLawyerName: 'أ. طارق الشناوي',
      },
    ],
    attachments: [
      {
        id: 'att_2_1',
        name: 'صورة كاملة من صحيفة الدعوى وقائمة المستندات',
        type: 'full_case',
        fileUrl: '/assets/aistudio/_________0051f627.png',
        fileName: 'صحيفة_دعوى_تعويض_الجيزة.pdf',
        fileSize: '3.4 MB',
        uploadDate: '2026-01-15',
      },
    ],
    notes: 'مطلوب استعجال مكتب خبراء وزارة العدل بالجيزة لإيداع التقرير الهندسي.',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-18',
  },
  {
    id: 'case_3',
    fileNumber: '2026/15 ق.إ',
    clientName: 'د. سمير عبد الرؤوف القاضي',
    clientPhone: '01155443322',
    clientRole: 'مدعي / طاعن',
    opponentName: 'وزير الصحة ورئيس الهيئة العامة للمستشفيات بصفتيهما',
    degreeStatus: 'under_filing',
    court: 'محكمة القضاء الإداري - مجلس الدولة بالدقي',
    caseType: 'قضاء إداري',
    charge: 'طعن بإلغاء القرار الإداري السلبي بالامتناع عن الترقية وصرف الحوافز',
    stages: [
      {
        id: 'stg_3_1',
        level: 'first_degree',
        levelLabel: 'أول درجة',
        caseNumber: 'تحت القيد بمجلس الدولة',
        court: 'محكمة القضاء الإداري - الدائرة الثانية أفراد',
        circuit: 'الدائرة الثانية',
        year: '2026',
        notes: 'تم تقديم التظلم الإداري والانتظار لمرور الـ 60 يوماً القانونية',
      },
    ],
    sessions: [],
    attachments: [],
    notes: 'تم تجهيز مذكرة الطعن بواسطة المساعد الذكي وجاري مراجعة تواريخ الإعلانات.',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-19',
  },
  {
    id: 'case_4',
    fileNumber: '2025/310 ج.م',
    clientName: 'محمود عبد السلام الشربيني',
    clientPhone: '01011223344',
    clientRole: 'شاكي / مدعي بالحق المدني',
    opponentName: 'سيد رجب عبد العال',
    degreeStatus: 'finished',
    court: 'محكمة جنح الدقي الجزئية',
    caseType: 'جنح',
    charge: 'جنحة إصدار شيك بدون رصيد بمبلغ 450 ألف جنيه',
    stages: [
      {
        id: 'stg_4_1',
        level: 'first_degree',
        levelLabel: 'أول درجة',
        caseNumber: '11204 لسنة 2025 جنح الدقي',
        court: 'محكمة جنح الدقي',
        circuit: 'الدائرة 3 جنح',
        year: '2025',
      },
    ],
    sessions: [
      {
        id: 'sess_4_1',
        caseId: 'case_4',
        caseFileNumber: '2025/310 ج.م',
        clientName: 'محمود عبد السلام الشربيني',
        court: 'محكمة جنح الدقي الجزئية',
        circuit: 'الدائرة 3',
        rollNumber: '32',
        date: '2025-11-20',
        time: '11:00',
        whatHappened: 'حضور المتهم وقام بالسداد الفوري والتصالح أمام المحكمة',
        isPostponed: false,
        decision: 'حكمت المحكمة بانقضاء الدعوى الجنائية بالتصالح وإثبات ترك الدعوى المدنية',
        isCompleted: true,
      },
    ],
    finishDetails: {
      date: '2025-11-20',
      verdict: 'انقضاء الدعوى الجنائية بالتصالح لاستلام الموكل كامل مستحقاته المالية ونهاية النزاع.',
      archiveNotes: 'تم حفظ أصل الشيك وأوراق القضية بالأرشيف ورفع إشارة الجدول.',
    },
    attachments: [],
    createdAt: '2025-08-10',
    updatedAt: '2025-11-20',
  },
];

// Seed Realistic Egyptian Administrative Tasks (The core emphasized section)
const INITIAL_ADMIN_TASKS: AdminTask[] = [
  {
    id: 'task_1',
    caseId: 'case_1',
    caseFileNumber: '2026/104 ج',
    clientName: 'الحاج إبراهيم منصور الدسوقي',
    opponentName: 'النيابة العامة',
    court: 'محكمة شمال القاهرة الابتدائية - العباسية',
    taskType: 'استخراج شهادة رسمية من واقع الجدول الجنائي بما تم بالجلسة',
    department: 'الجدول الجنائي (مصر الجديدة)',
    assignedLawyerId: 'lawyer_trainee_2',
    assignedLawyerName: 'أ. أحمد رفعت',
    dueDate: getRelativeDate(0), // Today!
    status: 'in_progress',
    priority: 'urgent',
    historyLog: [
      {
        id: 'log_1',
        date: getRelativeDate(-1),
        action: 'تم التوجه وشراء الدمغات القضائية وسداد رسم الشهادة بالخزينة',
        lawyerName: 'أ. أحمد رفعت',
      },
    ],
    notes: 'مطلوبة على وجه السرعة لتقديمها لمباحث الأموال العامة لإثبات التأجيل لضم أصل الشيك.',
  },
  {
    id: 'task_2',
    caseId: 'case_2',
    caseFileNumber: '2026/72 م',
    clientName: 'شركة النيل للإنشاءات الهندسية',
    opponentName: 'شركة الفراعنة للتوريدات العقارية',
    court: 'محكمة جنوب الجيزة - قلم محضرين الدقي',
    taskType: 'إعلان صحيفة الدعوى بإعادة الإعلان وتكليف الحضور للخصم في مواجهة النيابة',
    department: 'قلم المحضرين (محضرين الدقي)',
    assignedLawyerId: 'lawyer_trainee_2',
    assignedLawyerName: 'أ. أحمد رفعت',
    dueDate: getRelativeDate(1), // Tomorrow!
    status: 'pending',
    priority: 'urgent',
    historyLog: [],
    notes: 'التأكد من تسليم الإعلان لقلم المحضرين والحصول على رقم اليومية والتاريخ المقرر لتسلم الإعلان.',
  },
  {
    id: 'task_3',
    caseId: 'case_1',
    caseFileNumber: '2026/104 ج',
    clientName: 'الحاج إبراهيم منصور الدسوقي',
    opponentName: 'النيابة العامة',
    court: 'مجمع محاكم التجمع الخامس - استئناف القاهرة',
    taskType: 'سداد رسم الطعن بالاستئناف وتوريد الكفالة الجنائية',
    department: 'خزينة محكمة الاستئناف',
    assignedLawyerId: 'lawyer_associate_1',
    assignedLawyerName: 'أ. طارق الشناوي',
    dueDate: getRelativeDate(3),
    status: 'completed',
    completedAt: getRelativeDate(-1),
    priority: 'normal',
    historyLog: [
      {
        id: 'log_3',
        date: getRelativeDate(-1),
        action: 'تم سداد مبلغ الكفالة واستلام قسيمة السداد وتعلية القسيمة على أصل الملف',
        lawyerName: 'أ. طارق الشناوي',
      },
    ],
    notes: 'تم إرفاق إيصال السداد بملف القضية وتسليمه لسكرتير الجلسة.',
  },
  {
    id: 'task_4',
    caseId: 'case_3',
    caseFileNumber: '2026/15 ق.إ',
    clientName: 'د. سمير عبد الرؤوف القاضي',
    opponentName: 'وزير الصحة ورئيس هيئة المستشفيات',
    court: 'مجلس الدولة - مجمع محاكم الدقي',
    taskType: 'قيد صحيفة الطعن بالجدول واستخراج رقم الدعوى وتحديد الدائرة وجلسة التحضير',
    department: 'جدول القضاء الإداري - محكمة القضاء الإداري',
    assignedLawyerId: 'lawyer_associate_1',
    assignedLawyerName: 'أ. طارق الشناوي',
    dueDate: getRelativeDate(2),
    status: 'pending',
    priority: 'normal',
    historyLog: [],
    notes: 'إرفاق التوكيل الرسمي، وما يفيد تقديم التظلم الإداري والشهادة بمرور 60 يوماً.',
  },
];

// Initial Lawyer Location
const INITIAL_LOCATION: LawyerLiveLocation = {
  isSharing: true,
  courtName: 'محكمة استئناف عالي القاهرة - التجمع الخامس',
  hall: 'قاعة 3 (الدور الثاني علوي)',
  circuit: 'الدائرة 5 جنايات مستأنف',
  rollNumber: '14',
  notes: 'أنا متواجد حالياً داخل القاعة في انتظار مناداة رول 14 للاستماع للمرافعة.',
  lat: 30.0131,
  lng: 31.4332,
  updatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
};

export const storageService = {
  // Cases Management
  getCases: (): Case[] => {
    try {
      const data = localStorage.getItem(CASES_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(INITIAL_CASES));
        return INITIAL_CASES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CASES;
    }
  },

  saveCases: (cases: Case[]) => {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  },

  addCase: (newCase: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>): Case => {
    const cases = storageService.getCases();
    const createdCase: Case = {
      ...newCase,
      id: 'case_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    cases.unshift(createdCase);
    storageService.saveCases(cases);
    return createdCase;
  },

  updateCase: (caseId: string, updates: Partial<Case>): Case | null => {
    const cases = storageService.getCases();
    const index = cases.findIndex((c) => c.id === caseId);
    if (index === -1) return null;

    // Check if degreeStatus was updated to finished
    let updatedCase = {
      ...cases[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (updates.degreeStatus === 'finished' && !updatedCase.finishDetails) {
      updatedCase.finishDetails = {
        date: new Date().toISOString().split('T')[0],
        verdict: updates.finishDetails?.verdict || 'تم إنهاء النزاع وحفظ القضية بالأرشيف.',
        archiveNotes: updates.finishDetails?.archiveNotes || 'نُقلت تلقائياً إلى أرشيف القضايا المنتهية.',
      };
    }

    cases[index] = updatedCase;
    storageService.saveCases(cases);
    return updatedCase;
  },

  deleteCase: (caseId: string) => {
    const cases = storageService.getCases().filter((c) => c.id !== caseId);
    storageService.saveCases(cases);
  },

  // Sessions Management & Automatic Postponement
  addSessionToCase: (caseId: string, session: Omit<Session, 'id' | 'caseId'>): Session => {
    const cases = storageService.getCases();
    const caseItem = cases.find((c) => c.id === caseId);
    if (!caseItem) throw new Error('القضية غير موجودة');

    const newSession: Session = {
      ...session,
      id: 'sess_' + Date.now(),
      caseId: caseId,
    };

    caseItem.sessions.push(newSession);

    // If marked postponed to another date, automatically schedule that future session!
    if (newSession.isPostponed && newSession.postponedToDate) {
      const futureSession: Session = {
        id: 'sess_postponed_' + Date.now(),
        caseId: caseId,
        caseFileNumber: caseItem.fileNumber,
        clientName: caseItem.clientName,
        court: newSession.court || caseItem.court,
        circuit: newSession.circuit,
        rollNumber: '',
        date: newSession.postponedToDate,
        time: newSession.time || '09:00',
        whatHappened: '',
        isPostponed: false,
        postponementReason: '',
        isCompleted: false,
        assignedLawyerName: newSession.assignedLawyerName,
      };
      caseItem.sessions.push(futureSession);
    }

    storageService.saveCases(cases);
    return newSession;
  },

  updateSessionInCase: (caseId: string, sessionId: string, updates: Partial<Session>) => {
    const cases = storageService.getCases();
    const caseItem = cases.find((c) => c.id === caseId);
    if (!caseItem) return;

    const sIndex = caseItem.sessions.findIndex((s) => s.id === sessionId);
    if (sIndex === -1) return;

    const updatedSession = { ...caseItem.sessions[sIndex], ...updates };
    caseItem.sessions[sIndex] = updatedSession;

    // If postponement was just toggled or date changed, ensure next session exists
    if (updates.isPostponed && updates.postponedToDate) {
      const alreadyHasFuture = caseItem.sessions.some(
        (s) => s.date === updates.postponedToDate && s.id !== sessionId
      );
      if (!alreadyHasFuture) {
        caseItem.sessions.push({
          id: 'sess_postponed_' + Date.now(),
          caseId: caseId,
          caseFileNumber: caseItem.fileNumber,
          clientName: caseItem.clientName,
          court: updatedSession.court,
          circuit: updatedSession.circuit,
          rollNumber: '',
          date: updates.postponedToDate,
          time: '09:00',
          whatHappened: '',
          isPostponed: false,
          isCompleted: false,
          assignedLawyerName: updatedSession.assignedLawyerName,
        });
      }
    }

    storageService.saveCases(cases);
  },

  // Admin Tasks Management (Core Section)
  getAdminTasks: (): AdminTask[] => {
    try {
      const data = localStorage.getItem(ADMIN_TASKS_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(ADMIN_TASKS_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_TASKS));
        return INITIAL_ADMIN_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ADMIN_TASKS;
    }
  },

  saveAdminTasks: (tasks: AdminTask[]) => {
    localStorage.setItem(ADMIN_TASKS_STORAGE_KEY, JSON.stringify(tasks));
  },

  addAdminTask: (task: Omit<AdminTask, 'id' | 'historyLog'>): AdminTask => {
    const tasks = storageService.getAdminTasks();
    const newTask: AdminTask = {
      ...task,
      id: 'task_' + Date.now(),
      historyLog: [
        {
          id: 'log_' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          action: 'تم إنشاء وتكليف العمل الإداري',
          lawyerName: task.assignedLawyerName,
        },
      ],
    };

    tasks.unshift(newTask);
    storageService.saveAdminTasks(tasks);
    return newTask;
  },

  updateAdminTask: (taskId: string, updates: Partial<AdminTask>, logAction?: string, lawyerName?: string): AdminTask | null => {
    const tasks = storageService.getAdminTasks();
    const index = tasks.findIndex((t) => t.id === taskId);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask: AdminTask = {
      ...task,
      ...updates,
    };

    if (updates.status === 'completed' && !updatedTask.completedAt) {
      updatedTask.completedAt = new Date().toISOString().split('T')[0];
    }

    if (logAction) {
      updatedTask.historyLog.push({
        id: 'log_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        action: logAction,
        lawyerName: lawyerName || updatedTask.assignedLawyerName,
      });
    }

    tasks[index] = updatedTask;
    storageService.saveAdminTasks(tasks);
    return updatedTask;
  },

  deleteAdminTask: (taskId: string) => {
    const tasks = storageService.getAdminTasks().filter((t) => t.id !== taskId);
    storageService.saveAdminTasks(tasks);
  },

  // Team & Roles
  getTeam: (): LawyerMember[] => {
    try {
      const data = localStorage.getItem(TEAM_STORAGE_KEY);
      if (!data) {
        localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(INITIAL_TEAM));
        return INITIAL_TEAM;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TEAM;
    }
  },

  saveTeam: (team: LawyerMember[]) => {
    localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(team));
  },

  getCurrentUser: (): LawyerMember => {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    const team = storageService.getTeam();
    return team[0] || INITIAL_TEAM[0];
  },

  setCurrentUser: (lawyer: LawyerMember) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(lawyer));
  },

  // Location Sharing
  getLocation: (): LawyerLiveLocation => {
    try {
      const data = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_LOCATION;
  },

  saveLocation: (location: LawyerLiveLocation) => {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  },
};
