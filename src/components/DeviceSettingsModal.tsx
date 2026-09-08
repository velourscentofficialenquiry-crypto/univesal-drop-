import React, { useState } from 'react';
import { PeerInfo } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel, getOsColor } from './PlatformIcons';
import { X, Check, RefreshCw, Smartphone, ShieldCheck, Palette, Laptop } from 'lucide-react';

interface DeviceSettingsModalProps {
  myPeer: PeerInfo;
  autoAccept: boolean;
  onUpdatePeer: (updated: Partial<PeerInfo>) => void;
  onToggleAutoAccept: () => void;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
];

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({
  myPeer,
  autoAccept,
  onUpdatePeer,
  onToggleAutoAccept,
  onClose
}) => {
  const [name, setName] = useState(myPeer.name);
  const [color, setColor] = useState(myPeer.avatarColor);
  const [deviceType, setDeviceType] = useState(myPeer.deviceType);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdatePeer({
        name: name.trim(),
        avatarColor: color,
        deviceType
      });
      onClose();
    }
  };

  const handleRandomize = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const osLabel = getOsLabel(myPeer.os);
    setName(`${osLabel} Device ${randomNum}`);
    const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    setColor(randomColor);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <DeviceTypeIcon type={deviceType} className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Device Settings</h3>
              <p className="text-xs text-slate-400">How other devices see you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Device Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Name
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                placeholder="e.g. John's iPhone or Work Mac"
                className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleRandomize}
                title="Randomize name & color"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Color Chooser */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Radar Avatar Accent
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Device Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Device Icon Shape
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['phone', 'tablet', 'laptop', 'desktop'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeviceType(t)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs capitalize transition-colors ${
                    deviceType === t
                      ? 'bg-sky-500/20 border-sky-500 text-white font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <DeviceTypeIcon type={t} className="w-4 h-4" />
                  <span className="text-[11px]">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detected Platform Details */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Operating System:</span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-200">
                <OsIcon os={myPeer.os} className="w-3.5 h-3.5" />
                {getOsLabel(myPeer.os)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Web Browser:</span>
              <span className="font-medium text-slate-200">{myPeer.browser}</span>
            </div>
          </div>

          {/* Auto-Accept Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Auto-Accept Incoming Files</p>
                <p className="text-[11px] text-slate-400">Download without prompting</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleAutoAccept}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                autoAccept ? 'bg-sky-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoAccept ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
