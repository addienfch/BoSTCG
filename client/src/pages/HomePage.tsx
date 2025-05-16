import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolanaWallet } from '../lib/solana/useSolanaWallet';
import { useGameMode } from '../game/stores/useGameMode';
import { useDeckStore } from '../game/stores/useDeckStore';
import { toast } from 'sonner';

interface HomePageProps {
  onStartGame: () => void;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { walletAddress, disconnectWallet } = useSolanaWallet();
  const gameMode = useGameMode();
  const { decks, activeDeckId, setActiveDeck } = useDeckStore();
  
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(activeDeckId);
  
  // When the wallet is disconnected, navigate back to start page
  useEffect(() => {
    if (!walletAddress) {
      navigate('/start');
    }
  }, [walletAddress, navigate]);
  
  // Set the selected deck as active
  const updateActiveDeck = () => {
    if (!selectedDeckId) {
      toast.error("Please select a deck first.");
      return false;
    }
    
    setActiveDeck(selectedDeckId);
    return true;
  };
  
  // Navigate to arena page instead of directly to game
  const navigateToArena = () => {
    if (!updateActiveDeck()) return;
    navigate('/arena');
  };
  
  // We use the disconnectWallet function from useSolanaWallet hook

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#DFE1DD', color: '#0D1A29' }}>
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-center mb-6">
          {/* Logo */}
          <div className="relative">
            <img 
              src="/textures/logo/spektrum_logo.png" 
              alt="Book of Spektrum" 
              className="h-40 mb-4"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Wallet info moved under tagline */}
          {walletAddress ? (
            <div className="flex items-center bg-gray-800 rounded-lg p-3 mt-4 inline-flex text-white shadow-lg">
              <div className="mr-2">
                <div className="text-xs text-gray-400">Wallet</div>
                <div className="font-mono text-sm">
                  {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                </div>
              </div>
              <button 
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/start')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center mt-4 mx-auto"
            >
              <span className="mr-1">🔐</span>
              Connect Wallet
            </button>
          )}
        </div>
        
        {/* Main content area */}
        <div className="max-w-md w-full mb-8 overflow-hidden rounded-lg">
          {/* Image removed */}
        </div>
        
        {/* Removed Navigation Buttons as requested */}
      </div>
    </div>
  );
};

export default HomePage;
