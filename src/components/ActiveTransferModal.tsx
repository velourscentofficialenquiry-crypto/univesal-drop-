import React from 'react';
import { ActiveTransfer } from '../types';
import { OsIcon, DeviceTypeIcon, getOsLabel } from './PlatformIcons';
import { formatBytes, formatSpeed, formatEta } from '../utils/formatters';
import { Check, X, AlertCircle, Loader2, ArrowUpRight, ArrowDownLeft, Share2, Download, ExternalLink } from 'lucide-react';

interface ActiveTransferModalProps {
  transfer: ActiveTransfer;
  onCancel: () => void;
  onClose: () => void;
}

export const ActiveTransferModal: React.FC<ActiveTransferModalProps> = ({
  transfer,
  onCancel,
  onClose
}) => {
  const { role, peer, files, text, status, progress, bytesTransferred, totalBytes, speed, error, receivedBlobUrls } = transfer;

  const isOffering = status === 'offering';
  const isTransferring = status === 'transferring';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed' || status === 'rejected' || status === 'canceled';

  // Calculate ETA
  const remainingBytes = Math.max(0, totalBytes - bytesTransferred);
  const etaSeconds = speed > 0 ? remainingBytes / speed : 0;

  // Web Share API trigger for mobile devices
  const handleShareFile = async (blobUrl: string, fileName: string) => {
    try {
      if (navigator.share) {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        await navigator.share({
          files: [file],
          title: fileName
        });
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 overflow-hidden">
        {/* Top Status Icon & Target info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: peer.avatarColor }}
            >
              {role === 'sender' ? (
                <ArrowUpRight className="w-5 h-5 text-white" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {role === 'sender' ? 'Sending to' : 'Receiving from'}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  <OsIcon os={peer.os} className="w-2.5 h-2.5" />
                  {getOsLabel(peer.os)}
                </span>
              </div>
              <h3 className="text-base font-bold text-white truncate max-w-[200px]" title={peer.name}>
                {peer.name}
              </h3>
            </div>
          </div>

          {/* Transfer status pill */}
          <div className="text-right">
            {isOffering && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Waiting...</span>
              </span>
            )}
            {isTransferring && (
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full border border-sky-400/20 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{progress}%</span>
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full border border-rose-400/20 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Failed</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          {text ? (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Text Snippet
              </span>
              <p className="text-xs text-slate-200 font-mono break-all line-clamp-4">
                {text}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-200 mb-1">
                <span className="truncate max-w-[220px]">
                  {files.length === 1 ? files[0].name : `${files.length} files (${files[0]?.name}...)`}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {formatBytes(totalBytes)}
                </span>
              </div>

              {/* Live animated progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mt-3 relative">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isFailed
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                  }`}
                  style={{ width: `${Math.max(4, isOffering ? 15 : progress)}%` }}
                />
                {isTransferring && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress-bar-stripes_1s_linear_infinite]" />
                )}
              </div>

              {/* Progress metrics */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>
                  {isOffering
                    ? 'Prompt sent to recipient'
                    : isCompleted
                    ? '100% completed'
                    : `${formatBytes(bytesTransferred)} of ${formatBytes(totalBytes)}`}
                </span>
                {isTransferring && (
                  <span className="font-mono text-sky-300">
                    {formatSpeed(speed)} • {formatEta(etaSeconds)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error message if failed */}
        {isFailed && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error || 'Transfer was declined or failed'}</span>
          </div>
        )}

        {/* Received Files List when completed (Receiver role) */}
        {isCompleted && receivedBlobUrls && receivedBlobUrls.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Downloaded Files:
            </span>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {receivedBlobUrls.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="truncate text-slate-200 font-medium" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={item.url}
                      download={item.name}
                      className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 hover:text-white transition-colors"
                      title="Download again"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={() => handleShareFile(item.url, item.name)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Share on phone"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-2">
          {!isCompleted && !isFailed ? (
            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Cancel Transfer
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
