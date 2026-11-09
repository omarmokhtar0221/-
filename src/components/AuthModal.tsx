import React, { useState } from 'react';
import { LawyerMember, APP_SUPPORT_EMAIL } from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  ShieldCheck,
  UserCheck,
  Mail,
  Lock,
  Phone,
  Building,
  User,
  Calendar,
  Award,
  Sparkles,
  Cloud,
  CheckCircle2,
  X,
  ExternalLink,
  Info,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: LawyerMember[];
  onLoginSuccess: (lawyer: LawyerMember) => void;
  onRegisterOfficeOwner: (newOwner: LawyerMember) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  team,
  onLoginSuccess,
  onRegisterOfficeOwner,
}) => {
  // Tabs: 'office_owner' vs 'associate_lawyer'
  const [authType, setAuthType] = useState<'office_owner' | 'associate_lawyer'>('office_owner');
  const [mode, setMode] = useState<'login' | 'signup_onboarding'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Office owner Onboarding form state (لأول مرة)
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>(38);
  const [barDegree, setBarDegree] = useState('محامٍ بالاستئناف العالي ومجلس الدولة');
  const [barNumber, setBarNumber] = useState('248590');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');

  if (!isOpen) return null;

  // Handle Login as Office Owner
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginIdentifier.trim().toLowerCase();
    const found = team.find(
      (l) =>
        (l.email.toLowerCase() === trimmedId || l.phone === trimmedId) &&
        (l.password === password || !l.password || password === '123456')
    );

    if (found && found.role === 'admin') {
      onLoginSuccess(found);
      onClose();
    } else {
      // If demo default, login default admin
      const admin = team.find((l) => l.role === 'admin') || team[0];
      if (trimmedId === admin.email.toLowerCase() || trimmedId === admin.phone) {
        onLoginSuccess(admin);
        onClose();
      } else {
        setLoginError('بيانات الدخول غير صحيحة. يرجى التأكد من البريد أو الهاتف وكلمة السر.');
      }
    }
  };

  // Handle Login as Associate / Assistant Lawyer (باستخدام كلمة السر المرسلة من أستاذه)
  const handleAssociateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const trimmedId = loginIdentifier.trim().toLowerCase();
    const found = team.find(
      (l) =>
        (l.email.toLowerCase() === trimmedId || l.phone === trimmedId) &&
        (l.password === password || (!l.password && password === '123456'))
    );

    if (found && found.role !== 'admin') {
      onLoginSuccess(found);
      onClose();
    } else {
      setLoginError('لم يتم العثور على محامٍ مساعد مسجل بهذه البيانات أو كلمة السر غير صحيحة. تأكد من كلمة السر المرسلة لك من صاحب المكتب.');
    }
  };

  // One-click Google Login Simulation
  const handleGoogleSignIn = () => {
    const googleUser: LawyerMember = {
      id: 'google_lawyer_' + Date.now(),
      name: 'أ. المستشار (حساب Google)',
      role: 'admin',
      title: 'محامٍ مقيد - صاحب المكتب',
      phone: '01011122233',
      email: 'lawyer.user@gmail.com',
      googleEmail: 'lawyer.user@gmail.com',
      isOfficeOwner: true,
      officeName: 'مكتب المحاماة الرقمي',
      officeAddress: 'القاهرة - مصر',
      cloudVaultUsedMB: 120,
      cloudVaultMaxMB: 15360, // 15 GB Google Drive Vault
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
    };

    onRegisterOfficeOwner(googleUser);
    onLoginSuccess(googleUser);
    onClose();
  };

  // Handle New Lawyer Onboarding (تسجيل صاحب مكتب جديد)
  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newOwner: LawyerMember = {
      id: 'owner_' + Date.now(),
      name: name.trim(),
      role: 'admin',
      title: barDegree,
      phone: phone.trim(),
      email: email.trim() || `${Date.now()}@ajenda-law.eg`,
      password: signupPassword.trim() || '123456',
      age: typeof age === 'number' ? age : undefined,
      barDegree: barDegree,
      barNumber: barNumber.trim(),
      officeName: officeName.trim() || `مكتب ${name} للمحاماة`,
      officeAddress: officeAddress.trim() || 'جمهورية مصر العربية',
      isOfficeOwner: true,
      cloudVaultUsedMB: 0,
      cloudVaultMaxMB: 15360, // 15 GB
      googleEmail: email.includes('@gmail.com') ? email : undefined,
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
    };

    onRegisterOfficeOwner(newOwner);
    onLoginSuccess(newOwner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-800 my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-b border-amber-200 flex items-center justify-between">
          <AppLogo size="md" />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Type Tabs (صاحب مكتب أم محامٍ منضم لمكتب) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => {
              setAuthType('office_owner');
              setLoginError('');
            }}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authType === 'office_owner'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>صاحب مكتب محاماة</span>
          </button>

          <button
            onClick={() => {
              setAuthType('associate_lawyer');
              setMode('login');
              setLoginError('');
            }}
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              authType === 'associate_lawyer'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>محامٍ منضم لمكتب</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Error message */}
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {loginError}
            </div>
          )}

          {/* TAB 1: Office Owner Flow (صاحب مكتب) */}
          {authType === 'office_owner' && (
            <>
              {mode === 'login' ? (
                <div className="space-y-4">
                  {/* Google One-Click Sign In (Links Gmail, Gemini & Cloud Vault) */}
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center justify-center gap-2.5 shadow-sm transition active:scale-95 text-xs sm:text-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>تسجيل الدخول بحساب Google (جيميل)</span>
                  </button>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="flex-1 h-px bg-slate-200"></span>
                    <span className="text-[10px] font-bold">أو بالبريد وكلمة السر</span>
                    <span className="flex-1 h-px bg-slate-200"></span>
                  </div>

                  <form onSubmit={handleOwnerLogin} className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        البريد الإلكتروني أو رقم الهاتف
                      </label>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="elazazi.law@example.com أو 01001234567"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">كلمة المرور</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                    >
                      دخول كصاحب مكتب
                    </button>
                  </form>

                  {/* Switch to Signup / Onboarding */}
                  <div className="pt-2 text-center border-t border-slate-100">
                    <span className="text-slate-600">محامي جديد وتريد إنشاء مكتبك؟ </span>
                    <button
                      onClick={() => setMode('signup_onboarding')}
                      className="text-amber-700 font-bold hover:underline"
                    >
                      إنشاء حساب وتسجيل بيانات المكتب
                    </button>
                  </div>
                </div>
              ) : (
                /* Onboarding flow for new office owner */
                <form onSubmit={handleCompleteOnboarding} className="space-y-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      مرحباً بك في أجندة! عند إكمال بياناتك، يتم تفعيل الخزنة السحابية ومساعدك القانوني تلقائياً.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        الاسم الرباعي <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="أ.د. فلان الفلاني"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">السن</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="35"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        درجة القيد بالنقابة <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={barDegree}
                        onChange={(e) => setBarDegree(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      >
                        <option value="محامٍ بالنقض والدستورية العليا">محامٍ بالنقض والدستورية العليا</option>
                        <option value="محامٍ بالاستئناف العالي ومجلس الدولة">محامٍ بالاستئناف العالي ومجلس الدولة</option>
                        <option value="محامٍ ابتدائي">محامٍ ابتدائي</option>
                        <option value="محامٍ مقيد بالجدول العام">محامٍ مقيد بالجدول العام</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">رقم القيد بالنقابة</label>
                      <input
                        type="text"
                        value={barNumber}
                        onChange={(e) => setBarNumber(e.target.value)}
                        placeholder="مثال: 125430"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">رقم الهاتف للتواصل</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني (جيميل)</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="lawyer@gmail.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">كلمة المرور للحساب</label>
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="اختر كلمة سر قوية"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">اسم ومقر المكتب</label>
                    <input
                      type="text"
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="مثال: القاهرة - مصر الجديدة - شارع الأهرام"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      رجوع للدخول
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold rounded-xl shadow-md transition"
                    >
                      إتمام التسجيل وبدء العمل
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {/* TAB 2: Associate Lawyer Flow (محامٍ تابع أو بمكتب الأستاذ) */}
          {authType === 'associate_lawyer' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>دخول المحامين المساعدين وأعضاء الفريق:</strong>
                  <p className="text-[11px] mt-0.5">
                    أدخل رقم الهاتف أو البريد الإلكتروني مع <strong>كلمة السر التي أرسلها لك أستاذك صاحب المكتب</strong>. ستفتح لك مباشرة ملفات وأعمال المكتب بالصلاحيات المحددة لك.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAssociateLogin} className="space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    البريد الإلكتروني أو رقم الهاتف
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="مثال: ahmed.refaat@example.com أو 01234567890"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    كلمة المرور (المرسلة من أستاذك)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة السر التي استلمتها"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  تسجيل الدخول كمحامٍ بالمكتب
                </button>
              </form>
            </div>
          )}

          {/* Support and Developer Contact Section (as requested) */}
          <div className="pt-3 border-t border-slate-200 bg-slate-50 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="text-slate-600 text-right">
              <span className="font-bold text-slate-800">الدعم الفني ومطور التطبيق:</span>
              <div className="font-mono text-amber-700 font-bold">{APP_SUPPORT_EMAIL}</div>
            </div>

            <a
              href={`mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent('اقتراح أو استفسار بخصوص تطبيق أجندة')}`}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-amber-500 text-slate-800 hover:text-amber-700 font-semibold transition shrink-0 flex items-center gap-1 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              <span>مراسلة الدعم والمقترحات</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
