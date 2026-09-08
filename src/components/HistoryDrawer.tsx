import React from 'react';
import { TransferHistoryItem } from '../types';
import { OsIcon, getOsLabel } from './PlatformIcons';
import { formatBytes } from '../utils/formatters';
import { X, Download, Copy, Check, Trash2, ArrowUpRight, ArrowDownLeft, FileText, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  history: TransferHistoryItem[];
  onClear: () => void;
  onClose: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onClear,
  onClose
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Transfer History</h3>
            <p className="text-xs text-slate-400">Files and snippets from this session</p>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.role === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        <ArrowUpRight className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <ArrowDownLeft className="w-3 h-3" /> Received
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
                      <OsIcon os={item.peerOs} className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[120px]">{item.peerName}</span>
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {item.type === 'file' ? (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200 truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(item.fileSize || 0)}
                      </p>
                    </div>

                    {item.blobUrl && (
                      <a
                        href={item.blobUrl}
                        download={item.fileName}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-medium transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs font-mono text-slate-300 bg-slate-900 p-2 rounded-xl border border-slate-850 break-all line-clamp-3">
                      {item.text}
                    </p>
                    <button
                      onClick={() => handleCopyText(item.id, item.text || '')}
                      className="mt-2 flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied to clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy text</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <FileText className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-400">No transfers yet</p>
              <p className="text-xs max-w-xs mt-1">
                Files and texts you send or receive will appear here for easy access.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
