import { DeviceType, OperatingSystem, PeerInfo } from '../types';

export function detectOS(): OperatingSystem {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // iOS detection (iPhone, iPad, iPod, or iPad on iOS 13+ with desktop UA)
  if (/iphone|ipod/.test(userAgent) || (/ipad/.test(userAgent)) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  
  // Android detection
  if (/android/.test(userAgent)) {
    return 'android';
  }
  
  // macOS detection
  if (/macintosh|mac os x/.test(userAgent)) {
    return 'macos';
  }
  
  // Windows detection
  if (/windows|win32|win64/.test(userAgent)) {
    return 'windows';
  }
  
  // Linux detection
  if (/linux/.test(userAgent)) {
    return 'linux';
  }
  
  return 'unknown';
}

export function detectDeviceType(): DeviceType {
  const ua = window.navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'phone';
  }

  // Check screen width for laptop vs desktop
  if (window.innerWidth <= 1500) {
    return 'laptop';
  }
  
  return 'desktop';
}

export function detectBrowser(): string {
  const ua = window.navigator.userAgent;
  if (/edg/i.test(ua)) return 'Edge';
  if (/chrome|crios/i.test(ua) && !/opr|opera|edg/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) return 'Safari';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/opera|opr/i.test(ua)) return 'Opera';
  return 'Browser';
}

const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function getStoredOrNewPeerInfo(): PeerInfo {
  const stored = localStorage.getItem('universal_drop_peer');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Re-verify OS and device type in case viewport changed or profile loaded on new device
      parsed.os = detectOS();
      parsed.deviceType = detectDeviceType();
      parsed.browser = detectBrowser();
      return parsed;
    } catch {
      // Fall through to generate fresh
    }
  }

  const os = detectOS();
  const deviceType = detectDeviceType();
  const browser = detectBrowser();
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);

  let defaultName = 'My Device';
  if (os === 'ios') {
    defaultName = deviceType === 'tablet' ? `iPad ${randomNum}` : `iPhone ${randomNum}`;
  } else if (os === 'android') {
    defaultName = deviceType === 'tablet' ? `Android Tablet ${randomNum}` : `Android Phone ${randomNum}`;
  } else if (os === 'macos') {
    defaultName = deviceType === 'laptop' ? `MacBook Pro` : `Mac Desktop`;
  } else if (os === 'windows') {
    defaultName = `Windows PC ${randomNum}`;
  } else if (os === 'linux') {
    defaultName = `Linux Device ${randomNum}`;
  }

  const peer: PeerInfo = {
    id: `peer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: defaultName,
    deviceType,
    os,
    browser,
    avatarColor: randomColor,
    joinedAt: Date.now()
  };

  localStorage.setItem('universal_drop_peer', JSON.stringify(peer));
  return peer;
}

export function savePeerInfo(peer: PeerInfo) {
  localStorage.setItem('universal_drop_peer', JSON.stringify(peer));
}
