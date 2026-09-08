import React, { useState } from 'react';
import { PeerInfo } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel } from './PlatformIcons';
import { QrCode, Settings, History, Volume2, VolumeX, HelpCircle, Check, Copy, Wifi, Edit3, Share2 } from 'lucide-react';
import { getSoundEnabled, setSoundEnabled } from '../utils/soundEffects';

interface HeaderProps {
  myPeer: PeerInfo;
  roomId: string;
  connected: boolean;
  historyCount: number;
  onOpenQR: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onChangeRoom: (newRoom: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  myPeer,
  roomId,
  connected,
  historyCount,
  onOpenQR,
  onOpenSettings,
  onOpenHistory,
  onOpenGuide,
  onChangeRoom
}) => {
  const [sound, setSound] = useState(getSoundEnabled());
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomInput, setRoomInput] = useState(roomId);
  const [copiedLink, setCopiedLink] = useState(false);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
  };

  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomInput.trim()) {
      onChangeRoom(roomInput.trim());
      setIsEditingRoom(false);
    }
  };

  const copyRoomLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Connection status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-md shadow-sky-500/20 text-white">
              <Share2 className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                {connected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                )}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-white text-base sm:text-lg">Universal Drop</span>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Cross-Platform
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AirDrop for Windows, macOS, iOS & Android
              </p>
            </div>
          </div>
        </div>

        {/* Room Code Pill & Actions */}
        <div className="flex items-center gap-2">
          {/* Room Pill */}
          {isEditingRoom ? (
            <form onSubmit={handleRoomSubmit} className="flex items-center">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="ROOM"
                maxLength={12}
                autoFocus
                className="w-24 sm:w-28 px-2 py-1 text-xs font-mono font-bold uppercase rounded-l-lg bg-slate-900 border border-sky-500 text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 text-xs font-semibold rounded-r-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-full pl-3 pr-1 py-1 text-xs transition-colors">
              <div className="flex items-center gap-1.5 mr-1.5">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-400 hidden md:inline">Room:</span>
                <span className="font-mono font-bold text-slate-200 tracking-wide">{roomId}</span>
              </div>
              <button
                onClick={() => {
                  setRoomInput(roomId);
                  setIsEditingRoom(true);
                }}
                title="Change Room"
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={copyRoomLink}
                title="Copy Room Link"
                className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* QR Code Connect button */}
          <button
            id="qr-connect-btn"
            onClick={onOpenQR}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-all shadow-sm"
            title="Scan QR Code on Phone or Tablet"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Scan QR</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title={sound ? "Mute chimes" : "Enable chimes"}
          >
            {sound ? <Volume2 className="w-4 h-4 text-slate-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* History button */}
          <button
            id="history-btn"
            onClick={onOpenHistory}
            className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title="Transfer History"
          >
            <History className="w-4 h-4 text-slate-300" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold bg-sky-500 text-white">
                {historyCount > 99 ? '99+' : historyCount}
              </span>
            )}
          </button>

          {/* Guide / Help */}
          <button
            id="guide-btn"
            onClick={onOpenGuide}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title="How to use on Windows, Mac, iOS & Android"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>

          {/* My Device Button / Settings */}
          <button
            id="device-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-all hover:border-slate-700"
            title="Device settings"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-inner"
              style={{ backgroundColor: myPeer.avatarColor }}
            >
              <OsIcon os={myPeer.os} className="w-3 h-3" />
            </div>
            <span className="max-w-[80px] sm:max-w-[110px] truncate font-medium">{myPeer.name}</span>
            <Settings className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
