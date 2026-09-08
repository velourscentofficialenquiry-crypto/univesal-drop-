import React, { useState } from 'react';
import { PeerInfo } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel } from './PlatformIcons';
import { Send, X, Clipboard, Link as LinkIcon } from 'lucide-react';

interface TextDropModalProps {
  targetPeer: PeerInfo;
  onSend: (peer: PeerInfo, text: string) => void;
  onClose: () => void;
}

export const TextDropModal: React.FC<TextDropModalProps> = ({
  targetPeer,
  onSend,
  onClose
}) => {
  const [text, setText] = useState('');

  const handlePasteClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
      }
    } catch {
      // Clipboard permission denied or unavailable
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(targetPeer, text.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: targetPeer.avatarColor }}
            >
              <DeviceTypeIcon type={targetPeer.deviceType} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Send Text to</span>
                <span className="text-sky-400">{targetPeer.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {getOsLabel(targetPeer.os)} • Instant clipboard drop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a link, note, WiFi password, or message..."
              rows={5}
              autoFocus
              className="w-full p-3 text-xs sm:text-sm font-sans bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none"
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Clipboard className="w-3 h-3" />
              <span>Paste</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 mb-5">
            <span>{text.length} characters</span>
            <span>Receiver can copy with 1-click</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Drop to Device</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
