import React, { useState } from 'react';
import { OsIcon } from './PlatformIcons';
import { X, CheckCircle2, Share, PlusSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface PlatformGuideModalProps {
  onClose: () => void;
}

export const PlatformGuideModal: React.FC<PlatformGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'windows' | 'macos'>('ios');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Cross-Platform Guide</h3>
            <p className="text-xs text-slate-400">Universal AirDrop across all your devices</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <OsIcon os="ios" className="w-3.5 h-3.5" />
            <span>iOS</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <OsIcon os="android" className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'windows'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <OsIcon os="windows" className="w-3.5 h-3.5 text-sky-400" />
            <span>Windows</span>
          </button>
          <button
            onClick={() => setActiveTab('macos')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'macos'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <OsIcon os="macos" className="w-3.5 h-3.5" />
            <span>macOS</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-3 text-xs text-slate-300">
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                <div>
                  <p className="font-semibold text-slate-100">Scan with iPhone Camera</p>
                  <p className="text-slate-400 mt-0.5">Point camera at desktop screen QR code and tap yellow link to open in Safari.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                <div>
                  <p className="font-semibold text-slate-100">Optional: Add to Home Screen</p>
                  <p className="text-slate-400 mt-0.5">Tap the Safari Share icon <Share className="w-3 h-3 inline mx-0.5" /> and select &quot;Add to Home Screen&quot; for instant 1-tap AirDrop anytime.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                <div>
                  <p className="font-semibold text-slate-100">Direct Photo &amp; Video Transfer</p>
                  <p className="text-slate-400 mt-0.5">Select photos from your Photo Library or capture directly with camera and beam to Windows or Mac.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                <div>
                  <p className="font-semibold text-slate-100">Scan with Camera or Google Lens</p>
                  <p className="text-slate-400 mt-0.5">Scan the QR code on the sender screen to instantly pair in Google Chrome.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                <div>
                  <p className="font-semibold text-slate-100">Full File System Access</p>
                  <p className="text-slate-400 mt-0.5">Send documents, downloads, APK files, music, and gallery photos directly.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                <div>
                  <p className="font-semibold text-slate-100">Auto-Save to Downloads</p>
                  <p className="text-slate-400 mt-0.5">Received files are automatically stored in your phone&apos;s Downloads folder.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                <div>
                  <p className="font-semibold text-slate-100">Drag &amp; Drop from File Explorer</p>
                  <p className="text-slate-400 mt-0.5">Simply drag files from your desktop or File Explorer directly onto the target device avatar.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                <div>
                  <p className="font-semibold text-slate-100">Works in Edge, Chrome &amp; Firefox</p>
                  <p className="text-slate-400 mt-0.5">No drivers, companion apps, or Bluetooth pairing required.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                <div>
                  <p className="font-semibold text-slate-100">Instant Phone QR Sharing</p>
                  <p className="text-slate-400 mt-0.5">Click &quot;Scan QR&quot; in the header to pair your iPhone or Android phone in 2 seconds.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'macos' && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-zinc-500/20 text-zinc-300 flex items-center justify-center font-bold shrink-0 text-xs">1</span>
                <div>
                  <p className="font-semibold text-slate-100">Drop Files from Finder</p>
                  <p className="text-slate-400 mt-0.5">Drop files directly from Finder onto Windows PC or Android devices without AirDrop restrictions.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-zinc-500/20 text-zinc-300 flex items-center justify-center font-bold shrink-0 text-xs">2</span>
                <div>
                  <p className="font-semibold text-slate-100">Safari &amp; Chrome Support</p>
                  <p className="text-slate-400 mt-0.5">Native full-speed streaming using WebSockets.</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-zinc-500/20 text-zinc-300 flex items-center justify-center font-bold shrink-0 text-xs">3</span>
                <div>
                  <p className="font-semibold text-slate-100">Bridge Apple &amp; Non-Apple Ecosystems</p>
                  <p className="text-slate-400 mt-0.5">Send to Android phones or Windows PCs with the exact same simplicity as native AirDrop.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted local session</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
