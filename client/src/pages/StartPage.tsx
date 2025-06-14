import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SolanaWalletConnect from '../components/SolanaWalletConnect';

const StartPage: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  const handleWalletConnected = () => {
    setIsConnected(true);
  };

  const handlePlayGame = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light flex flex-col items-center justify-center p-4" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md w-full text-center">
        
        {/* Logo */}
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-spektrum-orange to-orange-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-bold text-spektrum-dark">BS</span>
          </div>
          <h1 className="text-4xl font-bold text-spektrum-light mb-2">
            Book of Spektrum
          </h1>
        </div>

        {/* Two main buttons */}
        <div className="space-y-4">
          {!isConnected ? (
            <>
              {/* Button 1: Connect your wallet to sign in */}
              <div onClick={handleWalletConnected}>
                <SolanaWalletConnect onConnected={handleWalletConnected} />
              </div>
              
              {/* Button 2: Connect Wallet (Solana) */}
              <button
                onClick={handleWalletConnected}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Connect Wallet (Solana)
              </button>
            </>
          ) : (
            <>
              {/* Play Game button (after connection) */}
              <button
                onClick={handlePlayGame}
                className="w-full bg-gradient-to-r from-spektrum-orange to-orange-600 text-spektrum-dark font-bold py-4 px-8 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
              >
                Play Game
              </button>
              
              {/* Connect Wallet button (now shows connected state) */}
              <button
                disabled
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg opacity-80"
              >
                ✓ Wallet Connected
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartPage;