import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// Simple lineart style icons
export const LineArtIcons = {
  // Navigation icons
  Home: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),

  Library: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),

  Deck: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),

  Shop: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),

  Game: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="6" y1="2" x2="6" y2="6"/>
      <line x1="18" y1="2" x2="18" y2="6"/>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <circle cx="8" cy="12" r="2"/>
      <circle cx="16" cy="12" r="2"/>
    </svg>
  ),

  Settings: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
    </svg>
  ),

  // Action icons
  Plus: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),

  Minus: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),

  Edit: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),

  Delete: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polyline points="3,6 5,6 21,6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),

  Back: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12,19 5,12 12,5"/>
    </svg>
  ),

  Search: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  ),

  Filter: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
    </svg>
  ),

  Down: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polyline points="6,9 12,15 18,9"/>
    </svg>
  ),

  Close: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),

  // Card and game icons
  Card: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <circle cx="8" cy="12" r="2"/>
      <line x1="16" y1="8" x2="16" y2="16"/>
    </svg>
  ),

  Star: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  ),

  Energy: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
    </svg>
  ),

  Wallet: ({ className = "", size = 24 }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
    </svg>
  )
};

export default LineArtIcons;