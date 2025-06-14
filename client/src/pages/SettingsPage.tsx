import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAudio } from '../lib/stores/useAudio';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sfxEnabled, toggleSfx } = useAudio();
  
  const [gameSettings, setGameSettings] = useState({
    visualQuality: 'high',
    gameSpeed: 'normal',
    animations: true,
    language: 'english',
    musicEnabled: true,
    soundEffectsEnabled: sfxEnabled
  });

  const [walletSettings, setWalletSettings] = useState({
    autoConfirmTransactions: false,
    walletType: 'phantom'
  });

  const handleGameSettingChange = (key: string, value: any) => {
    setGameSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'soundEffectsEnabled') {
      toggleSfx();
    }
    
    toast.success('Setting updated');
  };

  const handleWalletSettingChange = (key: string, value: any) => {
    setWalletSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Wallet setting updated');
  };

  const disconnectWallet = () => {
    toast.success('Wallet disconnected');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">Settings</h1>
        
        <div className="space-y-4">
          {/* Game Settings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Game Settings</h2>
            
            <div className="space-y-3">
              {/* Visual Quality */}
              <div>
                <label className="block text-sm font-medium mb-1">Visual Quality</label>
                <select
                  value={gameSettings.visualQuality}
                  onChange={(e) => handleGameSettingChange('visualQuality', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Game Speed */}
              <div>
                <label className="block text-sm font-medium mb-1">Game Speed</label>
                <select
                  value={gameSettings.gameSpeed}
                  onChange={(e) => handleGameSettingChange('gameSpeed', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={gameSettings.language}
                  onChange={(e) => handleGameSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="english">English</option>
                  <option value="japanese">Japanese</option>
                  <option value="chinese">Chinese</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>

              {/* Music Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Music</span>
                <button
                  onClick={() => handleGameSettingChange('musicEnabled', !gameSettings.musicEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    gameSettings.musicEnabled ? 'bg-spektrum-orange' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gameSettings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effects Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sound Effects</span>
                <button
                  onClick={() => handleGameSettingChange('soundEffectsEnabled', !gameSettings.soundEffectsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    gameSettings.soundEffectsEnabled ? 'bg-spektrum-orange' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gameSettings.soundEffectsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Animations Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Animations</span>
                <button
                  onClick={() => handleGameSettingChange('animations', !gameSettings.animations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    gameSettings.animations ? 'bg-spektrum-orange' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gameSettings.animations ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Wallet Settings */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Wallet Settings</h2>
            
            <div className="space-y-3">
              {/* Wallet Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Preferred Wallet</label>
                <select
                  value={walletSettings.walletType}
                  onChange={(e) => handleWalletSettingChange('walletType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="phantom">Phantom</option>
                  <option value="sollet">Sollet</option>
                  <option value="solflare">Solflare</option>
                  <option value="backpack">Backpack</option>
                </select>
              </div>

              {/* Auto Confirm Transactions */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium">Auto-confirm Transactions</span>
                  <p className="text-xs opacity-70">Automatically confirm NFT trades</p>
                </div>
                <button
                  onClick={() => handleWalletSettingChange('autoConfirmTransactions', !walletSettings.autoConfirmTransactions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    walletSettings.autoConfirmTransactions ? 'bg-spektrum-orange' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      walletSettings.autoConfirmTransactions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Wallet Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark py-2 px-4 rounded transition-colors font-medium"
                >
                  Connect Different Wallet
                </button>
                <button
                  onClick={disconnectWallet}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors font-medium"
                >
                  Disconnect Current Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default SettingsPage;