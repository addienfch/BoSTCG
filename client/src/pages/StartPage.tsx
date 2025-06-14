import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// Temporarily disabled Solana wallet functionality

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Temporarily disabled wallet functionality
  const walletAddress = null;
  const connecting = false;
  const connected = false;

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (walletAddress) {
      // Auto-redirect to home if wallet is already connected
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
    setLoading(false);
  }, [walletAddress, navigate]);
  
  // When the wallet connection state changes, redirect if needed
  useEffect(() => {
    if (connected && walletAddress) {
      // Redirect to home page after successful connection
      toast.success('Wallet connected successfully!');
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    }
  }, [connected, walletAddress, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative" 
         style={{ backgroundColor: '#DFE1DD', color: '#0D1A29' }}>
      
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="flex flex-col items-center">
          <img 
            src="/textures/ui/spektrum_logo.png" 
            alt="Book of Spektrum" 
            className="h-24 mb-3"
            onError={(e) => {
              // Just hide the image if it doesn't exist, no fallback text
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <img 
            src="/textures/logo/spektrum_logo.png" 
            alt="Book of Spektrum Trading Card Game" 
            className="h-40 mb-4"
            onError={(e) => {
              // Just hide the image if it doesn't exist
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      </div>
      
      {walletAddress ? (
        /* After wallet connection */
        <div className="flex flex-col items-center w-full max-w-md">
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-full font-bold text-xl transition-colors mb-4"
          >
            Start Game
          </button>
          
          <button
            onClick={() => toast.info('Wallet functionality temporarily disabled')}
            className="flex items-center justify-center bg-gray-700 hover:bg-gray-800 text-white py-3 px-6 rounded-full font-medium transition-colors"
          >
            <svg className="mr-2" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2"/>
              <path d="M16 8H8V16H16V8Z" fill="white"/>
            </svg>
            Settings
          </button>
        </div>
      ) : (
        /* Before wallet connection */
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="w-full bg-gray-400 bg-opacity-50 rounded-full py-4 px-6 text-center mb-8">
            <span className="text-gray-700 font-bold">Connect Wallet to Play</span>
          </div>
          <div className="w-full flex justify-center">
            <button 
              onClick={() => navigate('/home')}
              className="bg-gray-900 hover:bg-black text-white py-3 px-6 rounded-full font-medium transition-colors"
            >
              Start Playing
            </button>
          </div>
          {/* Skip button removed */}
        </div>
      )}
      
      {/* Circuit Background removed */}
    </div>
  );
};

export default StartPage;
