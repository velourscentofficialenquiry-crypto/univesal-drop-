import React, { useState, useRef } from 'react';
import { PeerInfo } from '../types';
import { PeerNode } from './PeerNode';
import { OsIcon, DeviceTypeIcon, getOsLabel } from './PlatformIcons';
import { QrCode, Smartphone, Laptop, UploadCloud, Radio, RefreshCw, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface RadarViewProps {
  myPeer: PeerInfo;
  peers: PeerInfo[];
  roomId: string;
  connected: boolean;
  onSendFiles: (peer: PeerInfo, files: File[]) => void;
  onSendText: (peer: PeerInfo) => void;
  onOpenQR: () => void;
  onOpenSettings: () => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  myPeer,
  peers,
  roomId,
  connected,
  onSendFiles,
  onSendText,
  onOpenQR,
  onOpenSettings
}) => {
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global drag-and-drop listener for drop zones
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsWindowDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      setIsWindowDragOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsWindowDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (peers.length === 1) {
        // Drop directly to the single peer
        onSendFiles(peers[0], Array.from(e.dataTransfer.files));
      } else if (peers.length > 1) {
        // User dropped in empty area with multiple peers, we can prompt or pick first
        onSendFiles(peers[0], Array.from(e.dataTransfer.files));
      }
    }
  };

  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${roomId}` : '';

  return (
    <main
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative min-h-[calc(100vh-65px)] w-full flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden"
    >
      {/* Subtle Radar Concentric Rings Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-30">
        <div className="w-[300px] h-[300px] rounded-full border border-sky-500/20" />
        <div className="w-[550px] h-[550px] rounded-full border border-sky-500/15 absolute" />
        <div className="w-[800px] h-[800px] rounded-full border border-sky-500/10 absolute" />
        <div className="w-[1100px] h-[1100px] rounded-full border border-sky-500/5 absolute" />
        {/* Animated Sweep Line */}
        <div className="absolute w-[800px] h-[800px] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(56,189,248,0.1)_360deg)] animate-[spin_10s_linear_infinite]" />
      </div>

      {/* Top Context Subheader */}
      <div className="relative z-10 w-full max-w-4xl text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md text-xs text-slate-300 mb-2 shadow-sm">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Universal AirDrop Radar</span>
          <span className="text-slate-600">•</span>
          <span className="text-sky-400 font-medium">{peers.length} nearby {peers.length === 1 ? 'device' : 'devices'}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Drop files between any Windows, Mac, iPhone & Android
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-1">
          Open this webpage on any phone, tablet, or laptop in room <span className="text-sky-300 font-mono font-semibold">{roomId}</span> to transfer files with zero setup.
        </p>
      </div>

      {/* Center Stage: Discovered Peers or Empty Guidance */}
      <div className="relative z-10 w-full max-w-6xl my-auto flex flex-col items-center justify-center min-h-[380px]">
        {peers.length > 0 ? (
          <div className="w-full flex flex-col items-center">
            {/* Peer Cards Grid */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 w-full">
              {peers.map(peer => (
                <PeerNode
                  key={peer.id}
                  peer={peer}
                  onSendFiles={onSendFiles}
                  onSendText={onSendText}
                  isDragOverGlobal={isWindowDragOver}
                />
              ))}
            </div>

            {/* If more than 1 peer, multi-send option */}
            {peers.length > 1 && (
              <div className="mt-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      // Broadcast to all peers
                      peers.forEach(p => onSendFiles(p, Array.from(e.target.files!)));
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors shadow-sm"
                >
                  <Layers className="w-4 h-4" />
                  <span>Send to all {peers.length} devices</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State: Prompt to connect other devices */
          <div className="flex flex-col items-center justify-center max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-2xl text-center">
            {/* Animated Radar Pulse Icon */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <Radio className="w-7 h-7 animate-pulse" />
                </div>
              </div>
              <div className="absolute -inset-2 rounded-full border border-sky-500/20 animate-ping opacity-25" />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Waiting for other devices to connect...
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
              Connect your iPhone, Android phone, Mac, or Windows PC by scanning this QR code with your camera or opening the link.
            </p>

            {/* Quick QR code preview & scan invitation */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 w-full max-w-md">
              <div
                onClick={onOpenQR}
                className="cursor-pointer p-2 rounded-xl bg-white shadow-md hover:scale-105 transition-transform"
                title="Click to expand QR code"
              >
                <QRCodeSVG
                  value={currentUrl}
                  size={96}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="text-left flex-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-sky-400 mb-1">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Point phone camera to scan</span>
                </div>
                <p className="text-xs text-slate-300">
                  Instant zero-install pairing. Both devices will see each other in real-time.
                </p>
                <button
                  onClick={onOpenQR}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-white hover:text-sky-300 underline underline-offset-2"
                >
                  <span>Open larger QR code & link</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* "You" Indicator & Platform Compatibility Bar */}
      <div className="relative z-10 w-full max-w-4xl mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-850 text-xs">
        {/* Current Device Pill */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors shadow-sm"
          title="Click to change your device name or settings"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400">You:</span>
            <span className="font-semibold text-white">{myPeer.name}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            <OsIcon os={myPeer.os} className="w-3 h-3" />
            <span>{getOsLabel(myPeer.os)}</span>
          </span>
        </div>

        {/* Supported Platforms Strip */}
        <div className="flex items-center gap-3 text-slate-400">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Supported platforms:</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px]">
              <OsIcon os="windows" className="w-3 h-3 text-sky-400" /> Windows
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px]">
              <OsIcon os="macos" className="w-3 h-3 text-slate-200" /> macOS
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px]">
              <OsIcon os="ios" className="w-3 h-3 text-slate-200" /> iOS
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[11px]">
              <OsIcon os="android" className="w-3 h-3 text-emerald-400" /> Android
            </span>
          </div>
        </div>
      </div>

      {/* Drag Over Screen Overlay */}
      {isWindowDragOver && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white pointer-events-none p-6 text-center border-4 border-dashed border-sky-400">
          <div className="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 animate-bounce">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Drop files onto a device</h2>
          <p className="text-sm text-slate-300 max-w-md">
            Release your files over any discovered device card to start transfer immediately.
          </p>
        </div>
      )}
    </main>
  );
};
