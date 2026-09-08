import React from 'react';
import { ActiveTransfer } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel, getOsColor } from './PlatformIcons';
import { formatBytes, getFileCategoryIcon } from '../utils/formatters';
import { Download, X, Check, FileText, Image as ImageIcon, Video, Music, Archive, Code, File } from 'lucide-react';

interface IncomingTransferModalProps {
  transfer: ActiveTransfer;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingTransferModal: React.FC<IncomingTransferModalProps> = ({
  transfer,
  onAccept,
  onDecline
}) => {
  const { peer, files, text } = transfer;
  const osColors = getOsColor(peer.os);

  const getIconForFile = (type: string, name: string) => {
    const category = getFileCategoryIcon(type, name);
    switch (category) {
      case 'image': return <ImageIcon className="w-5 h-5 text-sky-400" />;
      case 'video': return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio': return <Music className="w-5 h-5 text-pink-400" />;
      case 'archive': return <Archive className="w-5 h-5 text-amber-400" />;
      case 'code': return <Code className="w-5 h-5 text-emerald-400" />;
      case 'document': return <FileText className="w-5 h-5 text-blue-400" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Top Glow Accent */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-40"
          style={{ backgroundColor: peer.avatarColor }}
        />

        {/* Header with Sender Avatar & OS */}
        <div className="relative flex flex-col items-center text-center mb-5">
          <div className="relative mb-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: peer.avatarColor }}
            >
              <DeviceTypeIcon type={peer.deviceType} className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center">
              <OsIcon os={peer.os} className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border mb-1.5"
            style={{
              backgroundColor: `${peer.avatarColor}15`,
              borderColor: `${peer.avatarColor}40`,
              color: '#ffffff'
            }}
          >
            <span>AirDrop Request</span>
          </div>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {peer.name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <span>{getOsLabel(peer.os)}</span>
            <span>•</span>
            <span>{peer.browser}</span>
          </p>
        </div>

        {/* Content Box: Files or Text */}
        <div className="relative mb-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 p-4 max-h-56 overflow-y-auto">
          {text ? (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Incoming Text / Link:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-mono break-all whitespace-pre-wrap bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                {text}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
                <span>{formatBytes(transfer.totalBytes)}</span>
              </div>

              {files.map((file, idx) => (
                <div key={file.id || idx} className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                    {getIconForFile(file.type, file.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Question */}
        <p className="text-center text-xs text-slate-400 mb-5">
          Would you like to accept {files.length > 0 ? (files.length === 1 ? 'this file' : 'these files') : 'this drop'} and save to your device?
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-slate-300 hover:text-white font-semibold text-sm transition-all border border-slate-700/80 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            onClick={onAccept}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-semibold text-sm shadow-lg shadow-sky-600/25 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
