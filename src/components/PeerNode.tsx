import React, { useRef, useState } from 'react';
import { PeerInfo } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel, getOsColor } from './PlatformIcons';
import { Send, MessageSquare, UploadCloud, Smartphone, Monitor } from 'lucide-react';

interface PeerNodeProps {
  peer: PeerInfo;
  onSendFiles: (peer: PeerInfo, files: File[]) => void;
  onSendText: (peer: PeerInfo) => void;
  isDragOverGlobal?: boolean;
}

export const PeerNode: React.FC<PeerNodeProps> = ({
  peer,
  onSendFiles,
  onSendText,
  isDragOverGlobal
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const osColors = getOsColor(peer.os);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onSendFiles(peer, Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSendFiles(peer, Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-between p-5 rounded-3xl transition-all duration-300 backdrop-blur-xl border ${
        isDragOver
          ? 'scale-105 border-sky-400 bg-sky-950/70 shadow-2xl shadow-sky-500/30 ring-4 ring-sky-500/20'
          : isDragOverGlobal
          ? 'border-dashed border-sky-500/60 bg-slate-900/80 shadow-lg ring-2 ring-sky-500/10'
          : 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-900/90 hover:border-slate-700 shadow-xl'
      } w-64 sm:w-72`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />

      {/* OS Badge Top Right */}
      <div className="w-full flex items-center justify-between mb-3">
        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${osColors.bg} ${osColors.text} ${osColors.border}`}>
          <OsIcon os={peer.os} className="w-3 h-3" />
          {getOsLabel(peer.os)}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <DeviceTypeIcon type={peer.deviceType} className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{peer.deviceType}</span>
        </span>
      </div>

      {/* Main Avatar / Radar Target */}
      <div className="relative my-2">
        {/* Glow halo */}
        <div
          className="absolute -inset-2 rounded-full opacity-30 blur-lg group-hover:opacity-60 transition-opacity"
          style={{ backgroundColor: peer.avatarColor }}
        />

        {/* Outer circular badge */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative cursor-pointer w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: peer.avatarColor }}
          title={`Click to send files to ${peer.name}`}
        >
          <div className="w-16 h-16 rounded-full bg-slate-950/20 backdrop-blur-xs flex items-center justify-center border border-white/20">
            <DeviceTypeIcon type={peer.deviceType} className="w-8 h-8 text-white drop-shadow-md" />
          </div>

          {/* OS Icon tag on avatar */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-950 border-2 border-slate-900 flex items-center justify-center shadow-md">
            <OsIcon os={peer.os} className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

      {/* Device Name and Browser */}
      <div className="text-center my-2 max-w-full px-2">
        <h3 className="font-semibold text-slate-100 text-base truncate tracking-tight" title={peer.name}>
          {peer.name}
        </h3>
        <p className="text-xs text-slate-400 truncate mt-0.5">
          {peer.browser} • Ready to receive
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Send Files</span>
        </button>

        <button
          onClick={() => onSendText(peer)}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send Text</span>
        </button>
      </div>

      {/* Drag overlay state */}
      {isDragOver && (
        <div className="absolute inset-0 rounded-3xl bg-sky-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-10 animate-fade-in pointer-events-none">
          <UploadCloud className="w-10 h-10 animate-bounce mb-1" />
          <span className="font-bold text-sm">Drop to send files!</span>
          <span className="text-xs text-sky-200">Will prompt {peer.name}</span>
        </div>
      )}
    </div>
  );
};
