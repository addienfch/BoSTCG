import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/game-mode', icon: '🎮', label: 'Game' },
    { path: '/deck-builder', icon: '📚', label: 'Deck' },
    { path: '/library', icon: '📖', label: 'Library' },
    { path: '/shop', icon: '🛒', label: 'Shop' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
    { path: '/dev-tools', icon: '🔧', label: 'Dev' }
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
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavigationBar;