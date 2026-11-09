import React, { useState } from 'react';
import { Case, LawyerMember } from '../types/legal';
import {
  Archive,
  Search,
  CheckCircle2,
  FileText,
  Building,
  User,
  Calendar,
  ExternalLink,
  RotateCcw,
  Scale,
} from 'lucide-react';

interface ArchiveTabProps {
  cases: Case[];
  currentUser: LawyerMember;
  onSelectCase: (c: Case) => void;
  onReopenCase: (caseId: string) => void;
}

export const ArchiveTab: React.FC<ArchiveTabProps> = ({
  cases,
  currentUser,
  onSelectCase,
  onReopenCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const archivedCases = cases.filter((c) => c.degreeStatus === 'finished');

  const filteredArchived = archivedCases.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fileNumber.toLowerCase().includes(q) ||
      c.clientName.toLowerCase().includes(q) ||
      c.opponentName.toLowerCase().includes(q) ||
      c.court.toLowerCase().includes(q) ||
      c.charge.toLowerCase().includes(q) ||
      (c.finishDetails?.verdict && c.finishDetails.verdict.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-50 via-slate-50 to-amber-50/40 border border-purple-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  أرشيف القضايا المنتهية والمحكومة
                </h2>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-300 font-bold">
                  {archivedCases.length} قضية بالأرشيف
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                القضايا التي انتهت بالبراءة، الصلح، أو صدور حكم نهائي بات وسحب المستندات. ترحل وتؤرشف تلقائياً فور اختيار حالة «منتهية».
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الأرشيف برقم الملف، اسم الموكل، المحكمة، أو منطوق الحكم..."
          className="w-full bg-white border border-slate-200 rounded-2xl pr-9 pl-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 shadow-2xs"
        />
      </div>

      {/* Archive Cards */}
      <div className="space-y-3">
        {filteredArchived.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs shadow-2xs">
            <Archive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">لا توجد قضايا في الأرشيف حالياً</p>
            <p className="text-[11px] text-slate-400 mt-1">
              عند إنهاء أي قضية متداولة واختيار حالة «منتهية»، ستظهر هنا تلقائياً بكامل بياناتها ومستنداتها.
            </p>
          </div>
        ) : (
          filteredArchived.map((c) => (
            <div
              key={c.id}
              className="bg-white hover:bg-slate-50/60 border border-slate-200 hover:border-purple-300 rounded-3xl p-4 sm:p-5 shadow-2xs transition space-y-3"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-purple-900 bg-purple-100 px-2.5 py-1 rounded-xl border border-purple-200 font-mono">
                    ملف رقم: {c.fileNumber}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {c.caseType}
                  </span>
                  <span className="text-[11px] bg-purple-50 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-purple-600" />
                    منتهية ومحفوظة
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectCase(c)}
                    className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 font-bold transition flex items-center gap-1"
                  >
                    <span>استعراض الملف والأوراق</span>
                    <ExternalLink className="w-3 h-3 text-amber-700" />
                  </button>

                  {currentUser.permissions.canEditCase && (
                    <button
                      onClick={() => onReopenCase(c.id)}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1 font-semibold"
                      title="إعادة التداول وإلغاء الأرشفة"
                    >
                      <RotateCcw className="w-3 h-3 text-amber-700" />
                      <span className="hidden sm:inline">إعادة تداول</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Case Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <strong className="text-slate-800">الموكل:</strong> {c.clientName} (ضد {c.opponentName})
                </div>
                <div>
                  <strong className="text-slate-800">المحكمة:</strong> {c.court}
                </div>
              </div>

              {/* Verdict Summary Box */}
              {c.finishDetails && (
                <div className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                  <div className="text-purple-900 font-bold flex items-center justify-between">
                    <span>منطوق الحكم / القرار المنتهي:</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      تاريخ الحكم: {c.finishDetails.date}
                    </span>
                  </div>
                  <div className="text-slate-800 font-medium leading-relaxed">
                    {c.finishDetails.verdict}
                  </div>
                  {c.finishDetails.archiveNotes && (
                    <div className="text-[11px] text-slate-600 mt-1 pt-1 border-t border-purple-200">
                      <strong>ملاحظات الحفظ:</strong> {c.finishDetails.archiveNotes}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
