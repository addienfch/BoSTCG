import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

const ShopPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBoosterPacks = () => {
    navigate('/shop/booster');
  };

  const handlePremadeDecks = () => {
    navigate('/shop/premade-decks');
  };

  const handleMarketplace = () => {
    window.open('https://www.tensor.trade/', '_blank');
    // Alternative: window.open('https://magiceden.io/', '_blank');
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8 text-center">Shop</h1>
        
        <div className="space-y-6">
          {/* Booster Packs Button */}
          <button
            onClick={handleBoosterPacks}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-xl font-bold mb-1">Booster Packs</div>
            <div className="text-sm opacity-90">Buy randomized card packs</div>
          </button>

          {/* Premade Decks Button */}
          <button
            onClick={handlePremadeDecks}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <div className="text-4xl mb-2">🃏</div>
            <div className="text-xl font-bold mb-1">Premade Decks</div>
            <div className="text-sm opacity-90">Ready-to-play 40-card decks</div>
          </button>

          {/* Cosmetics Button */}
          <button
            onClick={() => navigate('/shop/cosmetics')}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <div className="text-4xl mb-2">✨</div>
            <div className="text-xl font-bold mb-1">Cosmetics</div>
            <div className="text-sm opacity-90">Card backs & customizations</div>
          </button>

          {/* NFT Marketplace Button */}
          <button
            onClick={handleMarketplace}
            className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <div className="text-4xl mb-2">🏪</div>
            <div className="text-xl font-bold mb-1">NFT Marketplace</div>
            <div className="text-sm opacity-90">Trade on Tensor</div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-2">About the Shop</h2>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Booster packs contain random cards with guaranteed rarities</li>
            <li>• Premade decks are tournament-ready 40-card strategies</li>
            <li>• Cosmetics include card backs and visual customizations</li>
            <li>• NFT marketplace connects to Tensor for trading</li>
          </ul>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default ShopPage;