import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getIcon = (path: string) => {
    const size = "16";
    const strokeWidth = "1.5";
    
    switch (path) {
      case '/home':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M3 9.5L12 3l9 6.5v9a2 2 0 01-2 2H5a2 2 0 01-2-2v-9z"/>
            <path d="M9 22V12h6v10"/>
          </svg>
        );
      case '/game-mode':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8"/>
            <path d="M12 17v4"/>
          </svg>
        );
      case '/deck-builder':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
            <path d="M8 7h8"/>
            <path d="M8 11h6"/>
          </svg>
        );
      case '/library':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
          </svg>
        );
      case '/shop':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <circle cx="8" cy="21" r="1"/>
            <circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 002 1.58h9.78a2 2 0 001.95-1.57l1.65-7.43H5.12"/>
          </svg>
        );
      case '/settings':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        );
      case '/dev-tools':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { path: '/home', label: 'Home' },
    { path: '/game-mode', label: 'Game' },
    { path: '/deck-builder', label: 'Deck' },
    { path: '/library', label: 'Library' },
    { path: '/shop', label: 'Shop' },
    { path: '/settings', label: 'Settings' },
    { path: '/dev-tools', label: 'Dev' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'text-amber-400 bg-gray-800'
                : 'text-white hover:text-amber-300 hover:bg-gray-800'
            }`}
          >
            <div className="mb-1">{getIcon(item.path)}</div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;