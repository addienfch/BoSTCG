import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { useBattleSetsStore, type BattleSetItem } from '../game/stores/useBattleSetsStore';

const BattleSetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Use centralized store
  const { 
    battleSets, 
    initializeBattleSets, 
    purchaseItem, 
    getItemsByCategory, 
    isItemOwned 
  } = useBattleSetsStore();

  // Initialize battle sets data on component mount
  useEffect(() => {
    initializeBattleSets();
  }, [initializeBattleSets]);

  const categories = [
    { id: 'all', name: 'All Items', icon: '🎨' },
    { id: 'card_back', name: 'Card Backs', icon: '🎴' },
    { id: 'deck_cover', name: 'Deck Covers', icon: '📚' },
    { id: 'avatar_skin', name: 'Avatar Skins', icon: '👤' },
    { id: 'battlefield', name: 'Battlefields', icon: '🏟️' },
    { id: 'effect_animation', name: 'Effects', icon: '✨' }
  ];

  const filteredItems = getItemsByCategory(selectedCategory);

  const handlePurchase = (item: BattleSetItem) => {
    if (isItemOwned(item.id)) {
      toast.error('You already own this item!');
      return;
    }

    // Use centralized purchase logic
    const success = purchaseItem(item.id);
    if (success) {
      toast.success(`${item.name} purchased! It's now available in your collection.`);
    } else {
      toast.error('Purchase failed. Please try again.');
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-gray-400 border-gray-500';
      case 'Rare': return 'text-blue-400 border-blue-500';
      case 'Epic': return 'text-purple-400 border-purple-500';
      case 'Legendary': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'card_back': return '🎴';
      case 'deck_cover': return '📚';
      case 'avatar_skin': return '👤';
      case 'battlefield': return '🏟️';
      case 'effect_animation': return '✨';
      default: return '🎨';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationBar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <BackButton to="/shop" />
            <div>
              <h1 className="text-3xl font-bold">Battle Sets</h1>
              <p className="text-gray-400">Customize your game experience</p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-spektrum-orange text-black font-semibold'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all hover:transform hover:scale-105 ${
                item.owned ? 'border-green-500 bg-green-900/20' : 'border-gray-700'
              }`}
            >
              {/* Preview Image */}
              <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src={item.preview}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-6xl opacity-50">
                  {getTypeIcon(item.type)}
                </div>
              </div>

              {/* Item Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs border ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                </div>

                <p className="text-gray-400 text-sm">{item.description}</p>

                {item.element && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Element:</span>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      item.element === 'fire' ? 'bg-red-900 text-red-300' :
                      item.element === 'water' ? 'bg-blue-900 text-blue-300' :
                      item.element === 'ground' ? 'bg-yellow-900 text-yellow-300' :
                      item.element === 'air' ? 'bg-cyan-900 text-cyan-300' :
                      'bg-gray-900 text-gray-300'
                    }`}>
                      {item.element}
                    </span>
                  </div>
                )}

                {/* Purchase Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <span className="text-spektrum-orange font-semibold text-lg">
                    ${item.price}
                  </span>
                  
                  {item.owned ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <span className="text-sm">✓ Owned</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="bg-spektrum-orange text-black px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSetsPage;