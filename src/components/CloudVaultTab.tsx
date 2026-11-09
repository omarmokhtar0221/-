import React, { useState } from 'react';
import { Case, LawyerMember, CaseAttachment } from '../types/legal';
import { AppLogo } from './AppLogo';
import {
  Cloud,
  Folder,
  FileText,
  Download,
  Upload,
  Lock,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  Eye,
  Mail,
  RefreshCw,
} from 'lucide-react';

interface CloudVaultTabProps {
  cases: Case[];
  currentUser: LawyerMember;
  onUpdateCase: (caseId: string, updates: Partial<Case>) => void;
}

export const CloudVaultTab: React.FC<CloudVaultTabProps> = ({
  cases,
  currentUser,
  onUpdateCase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<CaseAttachment | null>(null);

  // Collect all files uploaded across all cases
  const allVaultFiles: Array<{
    attachment: CaseAttachment;
    parentCase: Case;
  }> = [];

  cases.forEach((c) => {
    c.attachments.forEach((att) => {
      allVaultFiles.push({ attachment: att, parentCase: c });
    });
  });

  // Filter vault files
  const filteredFiles = allVaultFiles.filter(({ attachment, parentCase }) => {
    if (selectedCategory !== 'all' && attachment.type !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      attachment.name.toLowerCase().includes(q) ||
      attachment.fileName.toLowerCase().includes(q) ||
      parentCase.fileNumber.toLowerCase().includes(q) ||
      parentCase.clientName.toLowerCase().includes(q)
    );
  });

  const usedMB = currentUser.cloudVaultUsedMB || 240;
  const maxMB = currentUser.cloudVaultMaxMB || 15360; // 15 GB Google Cloud
  const percentage = Math.min(100, Math.round((usedMB / maxMB) * 100));

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Hero Card for Cloud Vault */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-white to-amber-100/50 border border-amber-300 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-amber-700 shrink-0 shadow-inner">
              <Cloud className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  الخزنة السحابية للملفات والمستندات القضائية
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  مؤمّنة ومشفرة
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                الخزنة السحابية الخاصة بمكتبك، مرتبطة بحساب Google المسجل (
                <span className="font-semibold text-slate-800 font-mono">
                  {currentUser.googleEmail || currentUser.email}
                </span>
                ) للنسخ الاحتياطي التلقائي لكافة التوكيلات، صور القضايا، والمذكرات.
              </p>
            </div>
          </div>

          {/* Storage Capacity Gauge */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs min-w-[200px]">
            <div className="flex items-center justify-between text-xs text-slate-700 font-bold mb-1.5">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                سعة الخزنة السحابية
              </span>
              <span className="text-amber-700 font-mono">{percentage}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"
                style={{ width: `${Math.max(4, percentage)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between font-mono">
              <span>{usedMB} ميجابايت مستخدمة</span>
              <span>15 جيجابايت سحابية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            كافة الملفات ({allVaultFiles.length})
          </button>

          <button
            onClick={() => setSelectedCategory('power_of_attorney')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === 'power_of_attorney'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            التوكيلات الرسمية
          </button>

          <button
            onClick={() => setSelectedCategory('case_cover')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === 'case_cover'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            أغلفة الملفات
          </button>

          <button
            onClick={() => setSelectedCategory('full_case')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 ${
              selectedCategory === 'full_case'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            صور القضايا الكاملة
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المستند، رقم ملف القضية، أو اسم الموكل..."
            className="w-full bg-white border border-slate-300 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-xs"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredFiles.length === 0 ? (
          <div className="col-span-full text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs shadow-xs">
            <Cloud className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">الخزنة السحابية لا تحتوي على ملفات مطابقة</p>
            <p className="text-[11px] text-slate-400 mt-1">
              يتم حفظ أي مستند أو غلاف أو توكيل يتم رفعه داخل أي قضية تلقائياً في هذه الخزنة السحابية.
            </p>
          </div>
        ) : (
          filteredFiles.map(({ attachment, parentCase }) => (
            <div
              key={attachment.id}
              className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    ملف: {parentCase.fileNumber}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 mt-2 truncate">
                  {attachment.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  الموكل: {parentCase.clientName}
                </p>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{attachment.fileSize || '450 KB'}</span>
                  <span>{attachment.uploadDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setPreviewItem(attachment)}
                  className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة المستند</span>
                </button>

                <a
                  href={attachment.fileUrl}
                  download={attachment.fileName}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  title="تحميل"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 truncate">
                {previewItem.name}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[55vh] flex items-center justify-center bg-slate-50 rounded-xl p-3 border border-slate-200">
              <img
                src={previewItem.fileUrl}
                alt={previewItem.name}
                className="max-h-[45vh] object-contain rounded"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 pt-2">
              <span>الحجم: {previewItem.fileSize}</span>
              <a
                href={previewItem.fileUrl}
                download={previewItem.fileName}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل إلى جهازك</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
