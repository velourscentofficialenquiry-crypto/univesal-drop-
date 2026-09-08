import React from 'react';
import { OperatingSystem, DeviceType } from '../types';
import { Smartphone, Tablet, Laptop, Monitor, Terminal } from 'lucide-react';

export function OsIcon({ os, className = "w-4 h-4" }: { os: OperatingSystem; className?: string }) {
  switch (os) {
    case 'windows':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.802" />
        </svg>
      );
    case 'macos':
    case 'ios':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.92-1 .04-2.19.67-2.88 1.47-.57.65-1.07 1.73-.93 2.78 1.12.09 2.24-.56 2.87-1.33z" />
        </svg>
      );
    case 'android':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0003 0-.5512.4482-1.0004.9993-1.0004.5516 0 .9997.4492.9997 1.0004 0 .5517-.4481 1.0003-.9997 1.0003m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0003 0-.5512.4482-1.0004.9993-1.0004.5516 0 .9997.4492.9997 1.0004 0 .5517-.4481 1.0003-.9997 1.0003m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.4116-5.1368 1.3497L4.8409 5.9467a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.6917.3853 15.4057 0 19.8h24c-.3853-4.3943-2.6889-8.1083-6.1185-10.4786" />
        </svg>
      );
    case 'linux':
      return <Terminal className={className} />;
    default:
      return <Monitor className={className} />;
  }
}

export function DeviceTypeIcon({ type, className = "w-4 h-4" }: { type: DeviceType; className?: string }) {
  switch (type) {
    case 'phone':
      return <Smartphone className={className} />;
    case 'tablet':
      return <Tablet className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'desktop':
    default:
      return <Monitor className={className} />;
  }
}

export function getOsLabel(os: OperatingSystem): string {
  switch (os) {
    case 'windows': return 'Windows';
    case 'macos': return 'macOS';
    case 'ios': return 'iOS';
    case 'android': return 'Android';
    case 'linux': return 'Linux';
    default: return 'Device';
  }
}

export function getOsColor(os: OperatingSystem): { bg: string; text: string; border: string } {
  switch (os) {
    case 'windows':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'macos':
    case 'ios':
      return { bg: 'bg-zinc-500/10', text: 'text-zinc-200', border: 'border-zinc-400/30' };
    case 'android':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'linux':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    default:
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
  }
}
