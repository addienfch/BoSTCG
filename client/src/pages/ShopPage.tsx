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
    navigate('/shop/premade');
  };

  const handleBattleSets = () => {
    navigate('/shop/battle-sets');
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
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h4m-4 0v6m4-6v6m-4-6H8a2 2 0 00-2 2v4a2 2 0 002 2h8a2 2 0 002-2v-4a2 2 0 00-2-2h-4z"/>
            </svg>
            <div className="text-xl font-bold mb-1">Booster Packs</div>
            <div className="text-sm opacity-90">Buy randomized card packs</div>
          </button>

          {/* Premade Decks Button */}
          <button
            onClick={handlePremadeDecks}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <div className="text-xl font-bold mb-1">Premade Decks</div>
            <div className="text-sm opacity-90">Ready-to-play 40-card decks</div>
          </button>

          {/* Battle Sets Button */}
          <button
            onClick={handleBattleSets}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-800 hover:from-pink-700 hover:to-pink-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z"/>
            </svg>
            <div className="text-xl font-bold mb-1">Battle Sets</div>
            <div className="text-sm opacity-90">Card backs, covers & battlefield themes</div>
          </button>

          {/* NFT Marketplace Button */}
          <button
            onClick={handleMarketplace}
            className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white py-6 px-6 rounded-lg shadow-lg transition-all transform hover:scale-105 flex flex-col items-center"
          >
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <div className="text-xl font-bold mb-1">NFT Marketplace</div>
            <div className="text-sm opacity-90">Trade on Tensor</div>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-2">About the Shop</h2>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Booster packs: Choose from 9 variants with different rarity distributions</li>
            <li>• Premade decks: One-time purchase of complete 40-card strategies</li>
            <li>• Battle sets: Card backs, deck covers, avatar skins, and battlefield themes</li>
            <li>• NFT marketplace connects to Tensor for trading</li>
          </ul>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default ShopPage;