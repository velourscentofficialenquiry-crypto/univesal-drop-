export type OperatingSystem = 'ios' | 'android' | 'macos' | 'windows' | 'linux' | 'unknown';
export type DeviceType = 'phone' | 'tablet' | 'desktop' | 'laptop';

export interface PeerInfo {
  id: string;
  name: string;
  deviceType: DeviceType;
  os: OperatingSystem;
  browser: string;
  avatarColor: string;
  joinedAt: number;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export type TransferStatus = 
  | 'offering'
  | 'incoming_prompt'
  | 'transferring'
  | 'completed'
  | 'rejected'
  | 'failed'
  | 'canceled';

export interface ActiveTransfer {
  transferId: string;
  role: 'sender' | 'receiver';
  peer: PeerInfo;
  files: FileMetadata[];
  text?: string;
  status: TransferStatus;
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0 to 100
  startTime: number;
  speed: number; // bytes per second
  error?: string;
  receivedBlobUrls?: { name: string; url: string; size: number; type: string }[];
}

export interface TransferHistoryItem {
  id: string;
  timestamp: number;
  peerName: string;
  peerOs: OperatingSystem;
  type: 'file' | 'text';
  role: 'sent' | 'received';
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  blobUrl?: string;
  text?: string;
}
