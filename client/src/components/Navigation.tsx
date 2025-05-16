import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SolanaWalletButton from './SolanaWalletButton';
import { useSolanaWallet } from '../lib/solana/useSolanaWallet';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { walletAddress } = useSolanaWallet();
  
  // Determine which link is active based on current path
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <>
      {/* Wallet Button - Fixed to top right */}
      <div className="fixed top-2 right-2 z-50">
        <SolanaWalletButton mode="compact" className="py-1 px-3 text-sm" customStyle="game" />
      </div>
      
      {/* Bottom Navigation - With increased visibility */}
      <div className="fixed bottom-0 left-0 w-full p-1 z-50 shadow-2xl border-t-2 border-blue-700" style={{ backgroundColor: '#0D1A29' }}>
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/home"
          className={`flex flex-col items-center justify-center py-2 rounded-t-lg ${
            isActive('/home') ? 'bg-blue-800' : 'hover:bg-gray-800'
          }`}
          style={{ color: 'white' }}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs">Home</span>
        </Link>
        
        {/* Deck Builder */}
        <Link
          to="/deck-builder"
          className={`flex flex-col items-center justify-center py-2 rounded-t-lg ${
            isActive('/deck-builder') ? 'bg-blue-800' : 'hover:bg-gray-800'
          }`}
          style={{ color: 'white' }}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-xs">Decks</span>
        </Link>
        
        {/* Arena */}
        <Link
          to="/arena"
          className={`flex flex-col items-center justify-center py-2 rounded-t-lg ${
            isActive('/arena') ? 'bg-blue-800' : 'hover:bg-gray-800'
          }`}
          style={{ color: 'white' }}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs">Arena</span>
        </Link>
        
        {/* Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center py-2 rounded-t-lg ${
            isActive('/shop') ? 'bg-blue-800' : 'hover:bg-gray-800'
          }`}
          style={{ color: 'white' }}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs">Shop</span>
        </Link>
        
        {/* Library */}
        <Link
          to="/library"
          className={`flex flex-col items-center justify-center py-2 rounded-t-lg ${
            isActive('/library') ? 'bg-blue-800' : 'hover:bg-gray-800'
          }`}
          style={{ color: 'white' }}
        >
          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-xs">Library</span>
        </Link>
      </div>
    </div>
    </>
  );
};

export default Navigation;
