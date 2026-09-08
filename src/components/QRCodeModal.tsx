import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, QrCode, Smartphone, Wifi } from 'lucide-react';

interface QRCodeModalProps {
  roomId: string;
  onChangeRoom: (newRoom: string) => void;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  roomId,
  onChangeRoom,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [roomEdit, setRoomEdit] = useState(roomId);

  const currentUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${roomId}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomEdit.trim()) {
      onChangeRoom(roomEdit.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-center overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 mb-3">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          Scan to Connect Devices
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Point your iPhone or Android camera at the QR code to join this room instantly.
        </p>

        {/* QR Code Container */}
        <div className="mx-auto w-fit p-3.5 rounded-2xl bg-white shadow-xl mb-4">
          <QRCodeSVG
            value={currentUrl}
            size={180}
            level="H"
            includeMargin={false}
          />
        </div>

        {/* Room Code & Link */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-left truncate mr-2">
            <Wifi className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-400">Room:</span>
            <span className="font-mono font-bold text-white">{roomId}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Room Customizer */}
        <form onSubmit={handleRoomSubmit} className="flex gap-1.5 mb-4">
          <input
            type="text"
            value={roomEdit}
            onChange={(e) => setRoomEdit(e.target.value.toUpperCase())}
            placeholder="CUSTOM ROOM"
            maxLength={12}
            className="flex-1 px-3 py-1.5 text-xs font-mono uppercase bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            Change
          </button>
        </form>

        <p className="text-[11px] text-slate-400">
          Works seamlessly on Safari (iOS), Chrome (Android), Edge/Chrome (Windows), and Mac Safari.
        </p>
      </div>
    </div>
  );
};
