import React, { useState } from 'react';
import { LawyerMember, APP_SUPPORT_EMAIL } from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Bell,
  Scale,
  ShieldCheck,
  UserCheck,
  Video,
  Printer,
  ChevronDown,
  Sparkles,
  LogIn,
  Mail,
  HelpCircle,
  Cloud,
} from 'lucide-react';

interface HeaderProps {
  currentUser: LawyerMember;
  team: LawyerMember[];
  onSwitchUser: (lawyer: LawyerMember) => void;
  urgentAlertsCount: number;
  onOpenNotifications: () => void;
  onOpenPrintRoll: () => void;
  onOpenVideoModal: () => void;
  onOpenAuthModal: () => void;
  onOpenCloudVault: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  team,
  onSwitchUser,
  urgentAlertsCount,
  onOpenNotifications,
  onOpenPrintRoll,
  onOpenVideoModal,
  onOpenAuthModal,
  onOpenCloudVault,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Egyptian Date format
  const todayArabic = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs text-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and App Title with "أجندة" Wordmark */}
        <div className="flex items-center gap-3">
          <AppLogo
            size="md"
            onClick={onOpenVideoModal}
            showSubtitle={true}
          />
        </div>

        {/* Action Controls & User Account Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Support Email Tooltip / Button */}
          <a
            href={`mailto:${APP_SUPPORT_EMAIL}?subject=${encodeURIComponent('استفسار ودعم تطبيق أجندة')}`}
            title={`الدعم الفني ومطور التطبيق: ${APP_SUPPORT_EMAIL}`}
            className="hidden lg:flex items-center gap-1 text-[11px] bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-amber-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
          >
            <Mail className="w-3.5 h-3.5 text-amber-600" />
            <span>الدعم: Maro100010001000@gmail.com</span>
          </a>

          {/* Video Intro (3 seconds) Button */}
          <button
            onClick={onOpenVideoModal}
            title="مشاهدة هوية وشعار أجندة (3 ثوانٍ)"
            className="flex items-center gap-1.5 text-xs bg-amber-50 hover:bg-amber-100/80 text-amber-900 px-2.5 py-1.5 rounded-xl border border-amber-300 font-bold transition"
          >
            <Video className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">الهوية (3 ثوانٍ)</span>
          </button>

          {/* Quick Print Roll */}
          <button
            onClick={onOpenPrintRoll}
            title="طباعة رول اليوم وكشف المحضرين"
            className="flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 transition"
          >
            <Printer className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">رول الجلسات والأعمال</span>
          </button>

          {/* Notification Bell (18h & 8am alerts) */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-amber-400 text-slate-700 transition"
            title="التنبيهات الموقوتة (الجلسات والأعمال الإدارية)"
          >
            <Bell className="w-4 h-4 text-amber-600" />
            {urgentAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs animate-pulse">
                {urgentAlertsCount}
              </span>
            )}
          </button>

          {/* Active Lawyer Account Dropdown / Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-amber-300/80 px-2.5 py-1.5 rounded-xl text-right transition shadow-2xs"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center text-xs font-black">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                ) : (
                  <UserCheck className="w-4 h-4 text-blue-700" />
                )}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold">
                  {currentUser.role === 'admin' ? 'صاحب المكتب' : 'محامٍ بالمكتب'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="absolute left-0 sm:right-auto sm:left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 text-right animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-2 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>الحساب المسجل حالياً</span>
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                </div>

                <div className="p-2 bg-amber-50/50 rounded-xl my-1.5 border border-amber-100">
                  <div className="font-bold text-slate-900 text-xs">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-600">{currentUser.title}</div>
                  <div className="text-[10px] text-amber-800 font-mono mt-0.5">
                    {currentUser.googleEmail || currentUser.email}
                  </div>
                </div>

                {/* Team Switcher */}
                <div className="space-y-1 mt-2">
                  <div className="text-[10px] font-bold text-slate-400 px-2 mb-1">
                    تبديل مستخدم بالمكتب:
                  </div>
                  {team.map((lawyer) => (
                    <button
                      key={lawyer.id}
                      onClick={() => onSwitchUser(lawyer)}
                      className={`w-full text-right p-2 rounded-xl text-xs flex items-center justify-between transition ${
                        currentUser.id === lawyer.id
                          ? 'bg-amber-100/70 text-amber-900 font-bold border border-amber-300'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{lawyer.name}</div>
                        <div className="text-[10px] text-slate-500">{lawyer.title.split(' - ')[0]}</div>
                      </div>
                      {lawyer.role === 'admin' && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                          مدير
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Login or Register New Account Button */}
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full text-right p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between"
                  >
                    <span>تسجيل دخول حساب آخر / إنشاء حساب</span>
                    <LogIn className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
