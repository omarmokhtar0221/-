import React from 'react';
import { NavigationTab } from '../types/legal';
import {
  Briefcase,
  FileText,
  Sparkles,
  ClipboardList,
  MapPin,
  Cloud,
  Users,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  adminTasksPendingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  adminTasksPendingCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] text-slate-600">
      <div className="max-w-md mx-auto sm:max-w-3xl px-2 py-1.5 flex items-center justify-around relative">
        {/* 1. Dashboard / Home */}
        <button
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'dashboard'
              ? 'text-amber-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className={`w-5 h-5 mb-0.5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px]">الرئيسية</span>
        </button>

        {/* 2. Cases & Clients */}
        <button
          onClick={() => onChangeTab('cases')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'cases'
              ? 'text-amber-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className={`w-5 h-5 mb-0.5 ${currentTab === 'cases' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px]">القضايا</span>
        </button>

        {/* 3. CENTER: "مساعدك القانوني" (استبدال مساعد جيمناي كما طلب المستخدم تماماً) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={() => onChangeTab('ai_assistant')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
              currentTab === 'ai_assistant'
                ? 'bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 text-white ring-4 ring-amber-200 shadow-[0_4px_20px_rgba(217,119,6,0.4)]'
                : 'bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-amber-300 border-2 border-amber-400 shadow-md'
            }`}
            title="مساعدك القانوني الذكي المباشر"
          >
            <Sparkles className="w-7 h-7 animate-pulse" />
          </button>
          <span
            className={`text-[10px] mt-0.5 font-black tracking-tight ${
              currentTab === 'ai_assistant' ? 'text-amber-700 font-black' : 'text-slate-800'
            }`}
          >
            مساعدك القانوني
          </span>
        </div>

        {/* 4. Admin Tasks (الأعمال الإدارية - الأهم) */}
        <button
          onClick={() => onChangeTab('admin_tasks')}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'admin_tasks'
              ? 'text-amber-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ClipboardList className={`w-5 h-5 mb-0.5 ${currentTab === 'admin_tasks' ? 'stroke-[2.5]' : ''}`} />
            {adminTasksPendingCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white font-black text-[9px] px-1 py-0.2 rounded-full border border-white shadow-xs">
                {adminTasksPendingCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">الأعمال الإدارية</span>
        </button>

        {/* 5. Cloud Vault (الخزنة السحابية) */}
        <button
          onClick={() => onChangeTab('cloud_vault')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentTab === 'cloud_vault'
              ? 'text-amber-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="الخزنة السحابية للمستندات"
        >
          <Cloud className={`w-5 h-5 mb-0.5 ${currentTab === 'cloud_vault' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px]">الخزنة</span>
        </button>
      </div>
    </nav>
  );
};
