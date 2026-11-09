import React, { useState } from 'react';
import { LawyerLiveLocation, LawyerMember } from '../types/legal';
import {
  MapPin,
  Share2,
  Copy,
  Check,
  Building,
  Navigation,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
} from 'lucide-react';

interface LocationShareTabProps {
  currentUser: LawyerMember;
  initialLocation: LawyerLiveLocation;
  onSaveLocation: (loc: LawyerLiveLocation) => void;
}

const EGYPTIAN_COURT_LOCATIONS = [
  { name: 'محكمة استئناف عالي القاهرة - التجمع الخامس', lat: 30.0131, lng: 31.4332 },
  { name: 'محكمة جنايات شمال القاهرة - العباسية', lat: 30.0664, lng: 31.2825 },
  { name: 'محكمة النقض - دار القضاء العالي (وسط البلد)', lat: 30.0528, lng: 31.2427 },
  { name: 'محكمة جنوب الجيزة الابتدائية - شارع السودان', lat: 30.0152, lng: 31.2064 },
  { name: 'مجمع محاكم جنوب القاهرة - زينهم السيدة زينب', lat: 30.0272, lng: 31.2394 },
  { name: 'مجلس الدولة - محكمة القضاء الإداري بالدقي', lat: 30.0401, lng: 31.2185 },
  { name: 'محكمة القاهرة الاقتصادية - المعادي', lat: 29.9678, lng: 31.2789 },
  { name: 'محكمة جنح الدقي والعجوزة - شارع السودان', lat: 30.0512, lng: 31.2045 },
  { name: 'محكمة الإسكندرية الابتدائية - المنشية', lat: 31.1989, lng: 29.8967 },
];

export const LocationShareTab: React.FC<LocationShareTabProps> = ({
  currentUser,
  initialLocation,
  onSaveLocation,
}) => {
  const [location, setLocation] = useState<LawyerLiveLocation>(initialLocation);
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [copied, setCopied] = useState(false);

  // Update GPS location
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('خدمة تحديد الموقع الجغرافي غير مدعومة على جهازك.');
      return;
    }

    setIsGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = {
          ...location,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          updatedAt: new Date().toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setLocation(newLoc);
        onSaveLocation(newLoc);
        setIsGettingGPS(false);
      },
      (err) => {
        console.warn('Geolocation warning, using preset fallback:', err);
        setIsGettingGPS(false);
        alert('تعذر جلب الإحداثيات الدقيقة من نظام الملاحة. يمكنك اختيار المحكمة من القائمة أدناه.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Update preset court coordinates
  const handleSelectCourtPreset = (courtName: string) => {
    const found = EGYPTIAN_COURT_LOCATIONS.find((c) => c.name === courtName);
    const updated = {
      ...location,
      courtName: courtName,
      lat: found?.lat || location.lat,
      lng: found?.lng || location.lng,
      updatedAt: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setLocation(updated);
    onSaveLocation(updated);
  };

  // WhatsApp Share Text
  const generateShareText = () => {
    const mapsLink = location.lat && location.lng
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : 'https://maps.google.com';

    return `📍 *الموقع المباشر وتواجد المحامي بالقاعة*\n` +
      `👤 *المحامي:* ${currentUser.name} (${currentUser.title.split(' - ')[0]})\n` +
      `🏛️ *المحكمة:* ${location.courtName}\n` +
      `🚪 *القاعة / الدور:* ${location.hall || 'قيد الوصول'}\n` +
      `⚖️ *الدائرة:* ${location.circuit || 'الرئيسية'}\n` +
      (location.currentRollNumber ? `🔢 *رقم الرول الحالي للقضية:* #${location.currentRollNumber}\n` : '') +
      `🕒 *وقت التحديث:* ${location.updatedAt || 'الآن'}\n` +
      (location.notes ? `📝 *ملاحظات التواجد:* ${location.notes}\n` : '') +
      `🌐 *رابط خرائط جوجل المباشر:* ${mapsLink}\n\n` +
      `— تم الإرسال عبر تطبيق *أجندة* للمحامين ⚖️`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-amber-50/40 border border-blue-200 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 shrink-0">
              <MapPin className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  مشاركة موقع المحامي المباشر
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 font-bold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  مباشر طوال الوقت
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                شارك مكان تواجدك اللحظي، اسم المحكمة، القاعة، ورقم الرول بنقرة واحدة عبر الواتساب للموكلين ولزملائك بمكتب المحاماة.
              </p>
            </div>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xs active:scale-95 transition text-xs sm:text-sm self-start sm:self-auto"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة الرابط على الواتساب</span>
          </button>
        </div>
      </div>

      {/* Main Location Editor Form & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 space-y-4 text-xs shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-600" />
              <span>تحديث بيانات التواجد الحالي بالقاعة</span>
            </h3>
            <button
              onClick={handleDetectGPS}
              disabled={isGettingGPS}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 font-semibold transition flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-600" />
              <span>{isGettingGPS ? 'جاري التحديد...' : 'تحديد عبر GPS'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-slate-800 font-bold mb-1">المحكمة المتواجد بها حالياً</label>
              <select
                value={location.courtName}
                onChange={(e) => handleSelectCourtPreset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {EGYPTIAN_COURT_LOCATIONS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">رقم أو اسم القاعة والدور</label>
                <input
                  type="text"
                  value={location.hall}
                  onChange={(e) => {
                    const updated = { ...location, hall: e.target.value };
                    setLocation(updated);
                    onSaveLocation(updated);
                  }}
                  placeholder="مثال: قاعة 3 (الدور الثاني علوي)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">اسم الدائرة القضائية</label>
                <input
                  type="text"
                  value={location.circuit}
                  onChange={(e) => {
                    const updated = { ...location, circuit: e.target.value };
                    setLocation(updated);
                    onSaveLocation(updated);
                  }}
                  placeholder="مثال: الدائرة 5 جنايات مستأنف"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-800 font-bold mb-1">رقم الرول الحالي بالقاعة</label>
                <input
                  type="text"
                  value={location.currentRollNumber}
                  onChange={(e) => {
                    const updated = { ...location, currentRollNumber: e.target.value };
                    setLocation(updated);
                    onSaveLocation(updated);
                  }}
                  placeholder="مثال: 14"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">آخر وقت لتحديث الموقع</label>
                <input
                  type="text"
                  readOnly
                  value={location.updatedAt || 'الآن'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold mb-1">رسالة توجيهية للموكل أو للزميل</label>
              <textarea
                rows={2}
                value={location.notes}
                onChange={(e) => {
                  const updated = { ...location, notes: e.target.value };
                  setLocation(updated);
                  onSaveLocation(updated);
                }}
                placeholder="مثال: أنا موجود بالقاعة الآن.. الرول شغال في الرقم 12 وجلستنا رقم 14."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-2xs">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>معاينة الرسالة قبل الإرسال للموكل</span>
              </span>
              <button
                onClick={handleCopyText}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition flex items-center gap-1 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            </div>

            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
              {generateShareText()}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
            <div className="text-[11px] text-slate-500">
              📍 إحداثيات GPS: {location.lat != null ? location.lat.toFixed(4) : '30.0528'}, {location.lng != null ? location.lng.toFixed(4) : '31.2427'}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://maps.google.com/?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                <span>فتح الخريطة</span>
              </a>

              <button
                onClick={handleShareWhatsApp}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>إرسال واتساب</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
