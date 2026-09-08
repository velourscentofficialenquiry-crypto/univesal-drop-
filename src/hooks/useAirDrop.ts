import { useState, useEffect, useRef, useCallback } from 'react';
import { PeerInfo, ActiveTransfer, FileMetadata, TransferHistoryItem } from '../types';
import { getStoredOrNewPeerInfo, savePeerInfo } from '../utils/deviceDetector';
import { playIncomingChime, playSuccessChime, playDismissTone } from '../utils/soundEffects';

const CHUNK_SIZE = 64 * 1024; // 64KB chunks for optimal WebSocket throughput and smooth progress

export function useAirDrop() {
  const [myPeer, setMyPeer] = useState<PeerInfo>(() => getStoredOrNewPeerInfo());
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [roomId, setRoomId] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get('room');
    if (roomParam) return roomParam.toUpperCase().trim();
    return localStorage.getItem('universal_drop_room') || 'AIRDROP';
  });
  const [connected, setConnected] = useState<boolean>(false);
  const [activeTransfer, setActiveTransfer] = useState<ActiveTransfer | null>(null);
  const [history, setHistory] = useState<TransferHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('universal_drop_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [autoAccept, setAutoAccept] = useState<boolean>(() => {
    return localStorage.getItem('universal_drop_auto_accept') === '1';
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const outgoingFilesRef = useRef<{ files: File[]; transferId: string; targetPeerId: string } | null>(null);
  const incomingChunksRef = useRef<Map<number, string[]>>(new Map());
  const activeTransferRef = useRef<ActiveTransfer | null>(null);

  // Sync ref
  useEffect(() => {
    activeTransferRef.current = activeTransfer;
  }, [activeTransfer]);

  // Save history to localStorage
  const addToHistory = useCallback((item: TransferHistoryItem) => {
    setHistory(prev => {
      const updated = [item, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('universal_drop_history', JSON.stringify(updated));
      } catch {
        // quota limit
      }
      return updated;
    });
  }, []);

  // Update my peer info
  const updateMyPeer = useCallback((updatedProps: Partial<PeerInfo>) => {
    setMyPeer(prev => {
      const updated = { ...prev, ...updatedProps };
      savePeerInfo(updated);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'update_peer',
          peer: updated
        }));
      }
      return updated;
    });
  }, []);

  // Set and switch room
  const changeRoom = useCallback((newRoom: string) => {
    const cleanRoom = newRoom.trim().toUpperCase() || 'AIRDROP';
    setRoomId(cleanRoom);
    localStorage.setItem('universal_drop_room', cleanRoom);

    // Update URL query parameter without full reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', cleanRoom);
    window.history.replaceState({}, '', url.toString());

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'join',
        room: cleanRoom,
        peer: myPeer
      }));
    }
  }, [myPeer]);

  // Connect WebSocket
  useEffect(() => {
    let isMounted = true;
    let pingInterval: NodeJS.Timeout | null = null;

    function connect() {
      if (!isMounted) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setConnected(true);

        // Join current room
        ws.send(JSON.stringify({
          type: 'join',
          room: roomId,
          peer: myPeer
        }));

        // Heartbeat keep-alive
        pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleWebSocketMessage(msg);
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setConnected(false);
        setPeers([]);
        if (pingInterval) clearInterval(pingInterval);

        // Reconnect after 2 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (pingInterval) clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [roomId, myPeer.id]);

  // Handle incoming messages
  const handleWebSocketMessage = useCallback(async (msg: any) => {
    switch (msg.type) {
      case 'peers_list': {
        setPeers(msg.peers || []);
        break;
      }

      case 'transfer_offer': {
        // Someone is sending us file(s) or text!
        const { fromPeerId, transferId, files, text, sender } = msg;

        playIncomingChime();

        const totalBytes = files ? files.reduce((acc: number, f: FileMetadata) => acc + f.size, 0) : (text ? text.length : 0);

        const newTransfer: ActiveTransfer = {
          transferId,
          role: 'receiver',
          peer: sender || { id: fromPeerId, name: 'Nearby Device', deviceType: 'phone', os: 'unknown', browser: '', avatarColor: '#3b82f6', joinedAt: Date.now() },
          files: files || [],
          text,
          status: 'incoming_prompt',
          bytesTransferred: 0,
          totalBytes,
          progress: 0,
          startTime: Date.now(),
          speed: 0
        };

        incomingChunksRef.current = new Map();
        setActiveTransfer(newTransfer);

        // Check auto-accept
        if (localStorage.getItem('universal_drop_auto_accept') === '1') {
          setTimeout(() => {
            acceptTransfer(newTransfer);
          }, 400);
        }
        break;
      }

      case 'transfer_accept': {
        // Target peer accepted our transfer!
        if (activeTransferRef.current && activeTransferRef.current.transferId === msg.transferId) {
          setActiveTransfer(prev => prev ? { ...prev, status: 'transferring', startTime: Date.now() } : null);

          // If text transfer, send text directly and complete
          if (activeTransferRef.current.text) {
            completeSenderTransfer();
            return;
          }

          // Start streaming file chunks
          if (outgoingFilesRef.current && outgoingFilesRef.current.transferId === msg.transferId) {
            startStreamingFiles(outgoingFilesRef.current.files, outgoingFilesRef.current.targetPeerId, msg.transferId);
          }
        }
        break;
      }

      case 'transfer_reject': {
        playDismissTone();
        if (activeTransferRef.current && activeTransferRef.current.transferId === msg.transferId) {
          setActiveTransfer(prev => prev ? { ...prev, status: 'rejected', error: msg.reason || 'Declined by recipient' } : null);
        }
        break;
      }

      case 'transfer_chunk': {
        // Receiver receiving a file chunk
        const { transferId, fileIndex, chunkIndex, totalChunks, chunkData, bytesChunk } = msg;
        const current = activeTransferRef.current;
        if (!current || current.transferId !== transferId) return;

        let fileChunks = incomingChunksRef.current.get(fileIndex);
        if (!fileChunks) {
          fileChunks = [];
          incomingChunksRef.current.set(fileIndex, fileChunks);
        }
        fileChunks[chunkIndex] = chunkData;

        // Calculate progress
        const chunkByteSize = bytesChunk || (chunkData.length * 0.75); // approx base64 decoded size
        const newBytes = Math.min(current.totalBytes, current.bytesTransferred + chunkByteSize);
        const elapsedSec = Math.max(0.1, (Date.now() - current.startTime) / 1000);
        const speed = newBytes / elapsedSec;
        const progress = current.totalBytes > 0 ? Math.min(99, Math.round((newBytes / current.totalBytes) * 100)) : 50;

        setActiveTransfer(prev => prev ? {
          ...prev,
          status: 'transferring',
          bytesTransferred: newBytes,
          speed,
          progress
        } : null);
        break;
      }

      case 'transfer_complete': {
        // All chunks received! Assemble files and trigger download/save
        const current = activeTransferRef.current;
        if (!current || current.transferId !== msg.transferId) return;

        playSuccessChime();

        const receivedUrls: { name: string; url: string; size: number; type: string }[] = [];

        // Convert stored base64 chunks to Blobs
        for (let i = 0; i < current.files.length; i++) {
          const fileMeta = current.files[i];
          const chunks = incomingChunksRef.current.get(i) || [];
          
          try {
            const byteArrays: Uint8Array[] = [];
            for (const b64 of chunks) {
              if (b64) {
                const binaryStr = atob(b64);
                const bytes = new Uint8Array(binaryStr.length);
                for (let j = 0; j < binaryStr.length; j++) {
                  bytes[j] = binaryStr.charCodeAt(j);
                }
                byteArrays.push(bytes);
              }
            }

            const blob = new Blob(byteArrays, { type: fileMeta.type || 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(blob);
            receivedUrls.push({
              name: fileMeta.name,
              url: blobUrl,
              size: fileMeta.size,
              type: fileMeta.type
            });

            // Add to history
            addToHistory({
              id: `hist_${Date.now()}_${i}`,
              timestamp: Date.now(),
              peerName: current.peer.name,
              peerOs: current.peer.os,
              type: 'file',
              role: 'received',
              fileName: fileMeta.name,
              fileSize: fileMeta.size,
              fileType: fileMeta.type,
              blobUrl
            });

            // Trigger auto download
            triggerDownload(blobUrl, fileMeta.name);
          } catch (err) {
            console.error('Failed assembling file blob:', err);
          }
        }

        // If it was a text drop
        if (current.text) {
          addToHistory({
            id: `hist_${Date.now()}`,
            timestamp: Date.now(),
            peerName: current.peer.name,
            peerOs: current.peer.os,
            type: 'text',
            role: 'received',
            text: current.text
          });
        }

        setActiveTransfer(prev => prev ? {
          ...prev,
          status: 'completed',
          progress: 100,
          bytesTransferred: prev.totalBytes,
          receivedBlobUrls: receivedUrls
        } : null);

        incomingChunksRef.current.clear();
        break;
      }

      case 'transfer_cancel': {
        playDismissTone();
        if (activeTransferRef.current && activeTransferRef.current.transferId === msg.transferId) {
          setActiveTransfer(prev => prev ? { ...prev, status: 'canceled', error: 'Transfer was canceled' } : null);
        }
        break;
      }

      case 'peer_unavailable': {
        if (activeTransferRef.current && activeTransferRef.current.transferId === msg.transferId) {
          setActiveTransfer(prev => prev ? { ...prev, status: 'failed', error: 'Device disconnected or unavailable' } : null);
        }
        break;
      }
    }
  }, [addToHistory]);

  // Trigger file download helper
  const triggerDownload = (url: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Start streaming files chunk by chunk
  const startStreamingFiles = async (files: File[], targetPeerId: string, transferId: string) => {
    let totalBytesSent = 0;
    const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
    const startTime = Date.now();

    for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
      const file = files[fileIndex];
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1;

      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        // Check if canceled
        if (activeTransferRef.current?.status === 'canceled') return;

        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const slice = file.slice(start, end);

        const base64Chunk = await readFileSliceAsBase64(slice);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'transfer_chunk',
            targetPeerId,
            transferId,
            fileIndex,
            chunkIndex,
            totalChunks,
            chunkData: base64Chunk,
            bytesChunk: slice.size
          }));
        }

        totalBytesSent += slice.size;
        const elapsedSec = Math.max(0.1, (Date.now() - startTime) / 1000);
        const speed = totalBytesSent / elapsedSec;
        const progress = totalBytes > 0 ? Math.min(99, Math.round((totalBytesSent / totalBytes) * 100)) : 50;

        setActiveTransfer(prev => prev ? {
          ...prev,
          bytesTransferred: totalBytesSent,
          speed,
          progress
        } : null);

        // Small micro-yield to keep UI responsive and prevent buffer overflow
        if (chunkIndex % 4 === 0) {
          await new Promise(r => setTimeout(r, 8));
        }
      }
    }

    // Finished sending all chunks
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_complete',
        targetPeerId,
        transferId
      }));
    }

    playSuccessChime();

    // Add to history
    files.forEach((f, idx) => {
      addToHistory({
        id: `hist_sent_${Date.now()}_${idx}`,
        timestamp: Date.now(),
        peerName: activeTransferRef.current?.peer.name || 'Nearby Device',
        peerOs: activeTransferRef.current?.peer.os || 'unknown',
        type: 'file',
        role: 'sent',
        fileName: f.name,
        fileSize: f.size,
        fileType: f.type
      });
    });

    setActiveTransfer(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      bytesTransferred: totalBytes
    } : null);
  };

  const completeSenderTransfer = () => {
    playSuccessChime();
    if (activeTransferRef.current?.text) {
      addToHistory({
        id: `hist_sent_${Date.now()}`,
        timestamp: Date.now(),
        peerName: activeTransferRef.current.peer.name,
        peerOs: activeTransferRef.current.peer.os,
        type: 'text',
        role: 'sent',
        text: activeTransferRef.current.text
      });
    }

    setActiveTransfer(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100
    } : null);
  };

  // Convert blob slice to base64
  const readFileSliceAsBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:application/octet-stream;base64, prefix
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Start sending files to a peer
  const sendFilesToPeer = useCallback((targetPeer: PeerInfo, files: File[]) => {
    if (!files || files.length === 0) return;

    const transferId = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    outgoingFilesRef.current = { files, transferId, targetPeerId: targetPeer.id };

    const fileMetaList: FileMetadata[] = files.map((f, i) => ({
      id: `file_${i}_${f.name}`,
      name: f.name,
      size: f.size,
      type: f.type,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
    }));

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);

    const transfer: ActiveTransfer = {
      transferId,
      role: 'sender',
      peer: targetPeer,
      files: fileMetaList,
      status: 'offering',
      bytesTransferred: 0,
      totalBytes,
      progress: 0,
      startTime: Date.now(),
      speed: 0
    };

    setActiveTransfer(transfer);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_offer',
        targetPeerId: targetPeer.id,
        transferId,
        files: fileMetaList,
        sender: myPeer
      }));
    }
  }, [myPeer]);

  // Send quick text snippet to a peer
  const sendTextToPeer = useCallback((targetPeer: PeerInfo, text: string) => {
    if (!text.trim()) return;

    const transferId = `trans_txt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const transfer: ActiveTransfer = {
      transferId,
      role: 'sender',
      peer: targetPeer,
      files: [],
      text,
      status: 'offering',
      bytesTransferred: 0,
      totalBytes: text.length,
      progress: 0,
      startTime: Date.now(),
      speed: 0
    };

    setActiveTransfer(transfer);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_offer',
        targetPeerId: targetPeer.id,
        transferId,
        text,
        sender: myPeer
      }));
    }
  }, [myPeer]);

  // Accept incoming transfer
  const acceptTransfer = useCallback((transfer?: ActiveTransfer) => {
    const t = transfer || activeTransferRef.current;
    if (!t) return;

    setActiveTransfer(prev => prev ? { ...prev, status: 'transferring', startTime: Date.now() } : null);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_accept',
        targetPeerId: t.peer.id,
        transferId: t.transferId
      }));
    }
  }, []);

  // Reject incoming transfer
  const rejectTransfer = useCallback((reason?: string) => {
    const t = activeTransferRef.current;
    if (!t) return;

    playDismissTone();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_reject',
        targetPeerId: t.peer.id,
        transferId: t.transferId,
        reason: reason || 'Declined by recipient'
      }));
    }

    setActiveTransfer(null);
  }, []);

  // Cancel in-progress transfer
  const cancelTransfer = useCallback(() => {
    const t = activeTransferRef.current;
    if (!t) return;

    playDismissTone();

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'transfer_cancel',
        targetPeerId: t.peer.id,
        transferId: t.transferId
      }));
    }

    setActiveTransfer(null);
  }, []);

  const closeTransferModal = useCallback(() => {
    setActiveTransfer(null);
  }, []);

  const toggleAutoAccept = useCallback(() => {
    setAutoAccept(prev => {
      const next = !prev;
      localStorage.setItem('universal_drop_auto_accept', next ? '1' : '0');
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('universal_drop_history');
  }, []);

  return {
    myPeer,
    peers,
    roomId,
    connected,
    activeTransfer,
    history,
    autoAccept,
    updateMyPeer,
    changeRoom,
    sendFilesToPeer,
    sendTextToPeer,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    closeTransferModal,
    toggleAutoAccept,
    clearHistory
  };
}
