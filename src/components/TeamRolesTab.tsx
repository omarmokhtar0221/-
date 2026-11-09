import React, { useState } from 'react';
import { LawyerMember, LawyerPermissions } from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Lock,
  Phone,
  Mail,
  Key,
  Copy,
  Check,
  Share2,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface TeamRolesTabProps {
  currentUser: LawyerMember;
  team: LawyerMember[];
  onUpdateTeam: (team: LawyerMember[]) => void;
  onSwitchUser: (lawyer: LawyerMember) => void;
}

export const TeamRolesTab: React.FC<TeamRolesTabProps> = ({
  currentUser,
  team,
  onUpdateTeam,
  onSwitchUser,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswordId, setVisiblePasswordId] = useState<string | null>(null);

  // Form State for Adding New Lawyer
  const [name, setName] = useState('');
  const [title, setTitle] = useState('محامٍ ابتدائي');
  const [role, setRole] = useState<'admin' | 'partner' | 'associate' | 'trainee'>('associate');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Lawyer@2026'); // Temporary password created by office owner

  const [permissions, setPermissions] = useState<LawyerPermissions>({
    canAddCase: true,
    canEditCase: true,
    canDeleteCase: false,
    canViewAllCases: true,
    canManageAdminTasks: true,
    canDeleteAdminTasks: false,
    canUseAI: true,
    canManageTeam: false,
  });

  const isAdmin = currentUser.role === 'admin';

  // Toggle single permission
  const handleTogglePermission = (
    lawyerId: string,
    permKey: keyof LawyerPermissions
  ) => {
    if (!isAdmin) {
      alert('عذراً، تعديل الصلاحيات مقتصر فقط على مدير وصاحب المكتب.');
      return;
    }

    const updated = team.map((l) => {
      if (l.id === lawyerId) {
        return {
          ...l,
          permissions: {
            ...l.permissions,
            [permKey]: !l.permissions[permKey],
          },
        };
      }
      return l;
    });
    onUpdateTeam(updated);
  };

  // Add new lawyer
  const handleAddLawyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMember: LawyerMember = {
      id: 'lawyer_' + Date.now(),
      name: name.trim(),
      role: role,
      title: title.trim(),
      phone: phone.trim(),
      email: email.trim() || `${Date.now()}@office-ajenda.eg`,
      password: password.trim() || '123456',
      isOfficeOwner: false,
      parentOfficeId: currentUser.id,
      isActive: true,
      permissions: permissions,
    };

    onUpdateTeam([...team, newMember]);
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setPassword('Lawyer@2026');
  };

  // Copy and Share Login Credentials to WhatsApp (as requested by user)
  const handleShareCredentials = (lawyer: LawyerMember) => {
    const text = `⚖️ *بيانات دخول تطبيق (أجـنـدة) - مكتب ${currentUser.officeName || currentUser.name}*\n\n` +
      `أهلاً بك زميلنا الأستاذ / *${lawyer.name}*\n` +
      `تم تسجيلك كمحامٍ بالمكتب وتحديد صلاحياتك القضائية.\n\n` +
      `📱 *بيانات تسجيل الدخول:*\n` +
      `• *البريد / الهاتف:* ${lawyer.phone || lawyer.email}\n` +
      `• *كلمة المرور:* ${lawyer.password || '123456'}\n` +
      `• *نوع الحساب:* محامٍ منضم لمكتب\n\n` +
      `🌐 رابط التطبيق المباشر:\n${window.location.origin}\n\n` +
      `_يرجى تسجيل الدخول بمجرد استلام الرسالة._`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyCredentials = (lawyer: LawyerMember) => {
    const text = `بيانات الدخول لتطبيق أجندة:\nالبريد/الهاتف: ${lawyer.phone || lawyer.email}\nكلمة السر: ${lawyer.password || '123456'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lawyer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300 text-slate-800">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-100/50 border border-amber-300 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  إدارة محامي المكتب وتحديد الصلاحيات
                </h2>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                  {isAdmin ? 'أنت صاحب المكتب' : 'عرض الصلاحيات'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                أضف محاميك المساعدين وحدد كلمة المرور لكل محامٍ ليرسلها له الأستاذ، مع التحكم الدقيق بصلاحيات الإضافة والتعديل والحذف.
              </p>
            </div>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition text-xs sm:text-sm self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة محامٍ جديد للمكتب</span>
            </button>
          )}
        </div>
      </div>

      {/* Lawyers List with Granular Permissions and Login Passwords */}
      <div className="space-y-3">
        {team.map((lawyer) => {
          const isThisAdmin = lawyer.role === 'admin';
          const isCurrentActive = currentUser.id === lawyer.id;
          const isPasswordVisible = visiblePasswordId === lawyer.id;

          return (
            <div
              key={lawyer.id}
              className={`rounded-2xl p-4 sm:p-5 border transition shadow-xs ${
                isCurrentActive
                  ? 'bg-amber-50/40 border-amber-400 ring-2 ring-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-base shadow-2xs">
                    {lawyer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{lawyer.name}</h3>
                      {isThisAdmin ? (
                        <span className="text-[10px] bg-amber-200 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                          صاحب المكتب (المدير)
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                          محامٍ بالمكتب
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          حسابك الحالي
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-800 font-semibold mt-0.5">{lawyer.title}</div>
                    <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3 font-mono">
                      {lawyer.phone && <span>هاتف: {lawyer.phone}</span>}
                      {lawyer.email && <span>بريد: {lawyer.email}</span>}
                    </div>
                  </div>
                </div>

                {/* Login Credentials and Action buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {!isThisAdmin && (
                    <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-slate-500 text-[11px]">كلمة السر:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {isPasswordVisible ? lawyer.password || '123456' : '••••••••'}
                      </span>
                      <button
                        onClick={() =>
                          setVisiblePasswordId(isPasswordVisible ? null : lawyer.id)
                        }
                        className="text-slate-400 hover:text-slate-700 p-0.5"
                        title={isPasswordVisible ? 'إخفاء' : 'إظهار'}
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopyCredentials(lawyer)}
                        className="text-amber-700 hover:text-amber-900 p-0.5"
                        title="نسخ بيانات الدخول"
                      >
                        {copiedId === lawyer.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleShareCredentials(lawyer)}
                        className="text-emerald-700 hover:text-emerald-900 p-0.5"
                        title="إرسال بيانات الدخول عبر واتساب"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {!isCurrentActive && (
                    <button
                      onClick={() => onSwitchUser(lawyer)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl transition"
                    >
                      دخول بهذا الحساب
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions Grid */}
              <div className="mt-3">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>الصلاحيات المحددة من صاحب المكتب:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Can Add Case */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canAddCase')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canAddCase
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>إضافة ملفات قضايا</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canAddCase}
                      readOnly
                      className="rounded accent-emerald-600"
                    />
                  </div>

                  {/* Can Edit Case */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canEditCase')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canEditCase
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>تعديل بيانات القضايا</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canEditCase}
                      readOnly
                      className="rounded accent-emerald-600"
                    />
                  </div>

                  {/* Can Delete Case */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canDeleteCase')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canDeleteCase
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>حذف القضايا نهائياً</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canDeleteCase}
                      readOnly
                      className="rounded accent-rose-600"
                    />
                  </div>

                  {/* Can Manage Admin Tasks */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canManageAdminTasks')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canManageAdminTasks
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>إدارة الأعمال الإدارية</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canManageAdminTasks}
                      readOnly
                      className="rounded accent-amber-600"
                    />
                  </div>

                  {/* Can Delete Admin Tasks */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canDeleteAdminTasks')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canDeleteAdminTasks
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>حذف الأعمال الإدارية</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canDeleteAdminTasks}
                      readOnly
                      className="rounded accent-rose-600"
                    />
                  </div>

                  {/* Can View All Cases */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canViewAllCases')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canViewAllCases
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>الإطلاع على كافة القضايا</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canViewAllCases}
                      readOnly
                      className="rounded accent-emerald-600"
                    />
                  </div>

                  {/* Can Use AI Assistant */}
                  <div
                    onClick={() => handleTogglePermission(lawyer.id, 'canUseAI')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      lawyer.permissions.canUseAI
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>مساعدك القانوني</span>
                    <input
                      type="checkbox"
                      disabled={!isAdmin || isThisAdmin}
                      checked={lawyer.permissions.canUseAI}
                      readOnly
                      className="rounded accent-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Lawyer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-600" />
                <span>إضافة محامٍ جديد للمكتب وتعيين كلمة المرور</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLawyer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  اسم المحامي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أ. محمود سامي عبد الرحمن"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الصفة القضائية</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="محامٍ بالاستئناف العالي">محامٍ بالاستئناف العالي</option>
                    <option value="محامٍ ابتدائي">محامٍ ابتدائي</option>
                    <option value="محامٍ مقيد بالجدول العام (متدرب)">محامٍ جدول عام (متدرب)</option>
                    <option value="محامٍ بالنقض">محامٍ بالنقض</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">الدور بالمكتب</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  >
                    <option value="associate">محامٍ مساعد</option>
                    <option value="trainee">محامٍ متدرب</option>
                    <option value="partner">محامٍ شريك</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    رقم الهاتف (لتسجيل الدخول) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Requirement 3: Password set by the office owner to send to the lawyer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <label className="block text-amber-900 font-black">
                  كلمة المرور المحددة للمحامي (ترسلها له للدخول):
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة السر"
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-slate-900 font-mono font-bold"
                />
                <span className="text-[10px] text-amber-800 block">
                  سيستخدم المحامي هذه الكلمة مع هاتفه أو بريده للدخول عبر تبويب «محامٍ منضم لمكتب».
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold transition shadow-xs"
                >
                  حفظ وإضافة للمكتب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
