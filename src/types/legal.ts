export type CaseStatus = 'under_filing' | 'active' | 'finished';

export type CaseType =
  | 'جنايات'
  | 'جنح'
  | 'مدني'
  | 'جنايات اقتصادية'
  | 'جنح اقتصادية'
  | 'قضاء إداري'
  | 'أحوال شخصية'
  | 'عمالي'
  | 'مجلس دولة'
  | 'أخرى';

export type LitigationLevel = 'first_degree' | 'appeal' | 'cassation';

export interface LitigationStage {
  id: string;
  level: LitigationLevel;
  levelLabel: string; // 'أول درجة' | 'استئناف' | 'نقض'
  caseNumber: string; // مثال: 1024 لسنة 2025
  court: string; // مثال: محكمة جنح مستأنف مصر الجديدة
  circuit: string; // مثال: الدائرة 3 جنايات
  year: string;
  notes?: string;
}

export interface Session {
  id: string;
  caseId: string;
  caseFileNumber: string;
  clientName: string;
  opponentName?: string;
  court: string;
  circuit?: string;
  rollNumber?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  whatHappened?: string; // ما الذي حدث بالجلسة
  isPostponed: boolean; // هل رُحلت لجلسة أخرى
  postponementReason?: string; // سبب الترحيل / التأجيل (مثل: للمذكرات، للتقرير، لسداد الرسم)
  postponedToDate?: string; // تاريخ الجلسة القادمة (تُرحل وتُضاف تلقائياً)
  decision?: string; // القرار الصادر
  isCompleted: boolean;
  assignedLawyerName?: string;
}

export type AdminTaskStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

export interface AdminTaskHistoryItem {
  id: string;
  date: string;
  action: string;
  lawyerName: string;
}

export interface AdminTask {
  id: string;
  caseId?: string;
  caseFileNumber: string; // رقم الملف بالمكتب
  clientName: string;
  opponentName: string;
  court: string;
  taskType: string; // استخراج شهادة، سداد رسم، إعلان، استلام صيغة تنفيذية...
  department: string; // قلم المحضرين، الجدول، الخزينة، الشهر العقاري...
  assignedLawyerId: string;
  assignedLawyerName: string;
  dueDate: string; // تاريخ الإنجاز المطلوب
  status: AdminTaskStatus;
  completedAt?: string;
  historyLog: AdminTaskHistoryItem[];
  notes?: string;
  priority?: 'urgent' | 'normal' | 'low';
}

export type AttachmentType = 'case_cover' | 'full_case' | 'power_of_attorney' | 'document';

export interface CaseAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  fileUrl: string;
  fileName: string;
  fileSize?: string;
  uploadDate: string;
  uploadedByLawyerName?: string;
}

export interface Case {
  id: string;
  fileNumber: string; // رقم الملف بالمكتب (فريد)
  clientName: string;
  clientPhone: string;
  clientNationalId?: string;
  clientRole: string; // متهم / مدعي / مدعى عليه / شاكي / مجني عليه
  opponentName: string; // افتراضياً: "النيابة العامة"
  degreeStatus: CaseStatus; // تحت الرفع / متداولة / منتهية (الأرشيف)
  stages: LitigationStage[];
  court: string; // المحكمة الحالية
  caseType: CaseType;
  charge: string; // نوع التهمة أو موضوع الدعوى
  sessions: Session[];
  attachments: CaseAttachment[];
  finishDetails?: {
    date: string;
    verdict: string;
    archiveNotes?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LawyerPermissions {
  canAddCase: boolean;
  canEditCase: boolean;
  canDeleteCase: boolean;
  canViewAllCases: boolean;
  canManageAdminTasks: boolean;
  canDeleteAdminTasks: boolean;
  canUseAI: boolean;
  canManageTeam: boolean;
}

export interface LawyerMember {
  id: string;
  name: string;
  role: 'admin' | 'partner' | 'associate' | 'trainee';
  title: string; // محامٍ بالنقض / محامٍ بالاستئناف / محامٍ ابتدائي / جدول عام
  phone: string;
  email: string;
  password?: string; // كلمة السر المحددة من صاحب المكتب أو المنشأة بواسطة المحامي
  age?: number;
  barDegree?: string; // درجة القيد بالنقابة (جدول عام، ابتدائي، استئناف عالي ومجلس دولة، نقض ودستورية)
  barNumber?: string; // رقم القيد بالنقابة
  officeName?: string; // اسم المكتب
  officeAddress?: string; // عنوان ومقر المكتب
  isOfficeOwner?: boolean; // هل هو صاحب مكتب أم محامٍ تابع لمكتب
  parentOfficeId?: string; // معرف مكتب الأستاذ في حال كان محامياً تابعاً
  googleEmail?: string; // حساب جيميل المرتبط
  cloudVaultUsedMB?: number;
  cloudVaultMaxMB?: number;
  isActive: boolean;
  permissions: LawyerPermissions;
}

export interface LawyerLiveLocation {
  isSharing: boolean;
  courtName: string;
  hall: string; // رقم أو اسم القاعة
  circuit: string; // الدائرة
  rollNumber: string; // رقم الرول
  currentRollNumber?: string;
  notes: string;
  lat?: number;
  lng?: number;
  updatedAt: string;
}

export type NavigationTab =
  | 'dashboard' // الرئيسية ورول اليوم
  | 'cases' // الموكلين والقضايا
  | 'admin_tasks' // الأعمال الإدارية (القسم الأهم)
  | 'ai_assistant' // مساعدك القانوني (المركز)
  | 'cloud_vault' // الخزنة السحابية للملفات
  | 'location_share' // مشاركة الموقع المباشر
  | 'team_roles' // إدارة الصلاحيات والفريق
  | 'archive'; // أرشيف القضايا المنتهية

export const APP_SUPPORT_EMAIL = 'Maro100010001000@gmail.com';
