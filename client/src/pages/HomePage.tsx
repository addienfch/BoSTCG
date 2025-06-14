import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import NavigationBar from '../components/NavigationBar';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Rolling images for the carousel
  const rollingImages = [
    '/textures/cards/radja.png',
    '/textures/cards/crimson.png',
    '/textures/cards/banaspati.png',
    '/textures/cards/scarlet.png',
    '/textures/cards/daisy.png',
    '/textures/cards/boar-berserker.png',
    '/textures/cards/banaspati-fem.png',
    '/textures/cards/burning-armor.png'
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % rollingImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [rollingImages.length]);

  const menuItems = [
    {
      title: 'Start Game',
      description: 'Play against AI or other players',
      icon: '⚔️',
      action: () => navigate('/game-mode'),
      color: 'bg-spektrum-orange hover:bg-orange-600'
    },
    {
      title: 'Deck Builder',
      description: 'Create and customize your decks',
      icon: '📋',
      action: () => navigate('/deck-builder'),
      color: 'bg-spektrum-light hover:bg-gray-200'
    },
    {
      title: 'Library',
      description: 'View your card collection',
      icon: '📚',
      action: () => navigate('/library'),
      color: 'bg-spektrum-light hover:bg-gray-200'
    },
    {
      title: 'Marketplace',
      description: 'Buy booster packs and trade NFTs',
      icon: '🛒',
      action: () => navigate('/shop'),
      color: 'bg-spektrum-orange hover:bg-orange-600'
    },
    {
      title: 'Settings',
      description: 'Game preferences and wallet settings',
      icon: '⚙️',
      action: () => navigate('/settings'),
      color: 'bg-spektrum-light hover:bg-gray-200'
    }
  ];

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <div className="max-w-md mx-auto p-4">
        {/* Welcome section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-spektrum-light mb-2">Welcome Back</h1>
          <p className="text-spektrum-light opacity-80 text-sm mb-4">
            Ready to battle in the world of Spektrum
          </p>
          
          {/* Rolling Image Section */}
          <div className="relative h-48 bg-spektrum-light bg-opacity-10 rounded-lg overflow-hidden border border-spektrum-light border-opacity-20">
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {rollingImages.map((image, index) => (
                <div
                  key={index}
                  className="w-full h-full flex-shrink-0 flex items-center justify-center bg-gray-800"
                >
                  <div className="text-center text-gray-400">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-sm">Upload Image #{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {rollingImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex 
                      ? 'bg-spektrum-orange' 
                      : 'bg-spektrum-light bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Rolling image placeholder - upload promotional images here
          </p>
        </div>

        {/* Stats overview */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="font-bold text-spektrum-orange mb-3 text-sm">Your Progress</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-spektrum-light">0</div>
              <div className="text-xs text-gray-400">NFT Cards</div>
            </div>
            <div>
              <div className="text-lg font-bold text-spektrum-light">3</div>
              <div className="text-xs text-gray-400">Decks</div>
            </div>
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
};

export default HomePage;