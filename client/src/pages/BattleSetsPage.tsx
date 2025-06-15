import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

interface BattleSetItem {
  id: string;
  name: string;
  type: 'card_back' | 'deck_cover' | 'avatar_skin' | 'battlefield' | 'effect_animation';
  description: string;
  price: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  preview: string;
  owned: boolean;
  element?: string;
}

const BattleSetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set());

  const battleSetItems: BattleSetItem[] = [
    // Card Backs
    {
      id: 'cardback-fire-1',
      name: 'Blazing Flames',
      type: 'card_back',
      description: 'Fiery card back with animated flame effects',
      price: 150,
      rarity: 'Rare',
      preview: '/textures/cards/fire_booster.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'cardback-water-1',
      name: 'Ocean Depths',
      type: 'card_back',
      description: 'Deep blue card back with flowing water patterns',
      price: 150,
      rarity: 'Rare',
      preview: '/textures/cards/neutral_booster.png',
      owned: false,
      element: 'water'
    },
    {
      id: 'cardback-legendary-1',
      name: 'Spektrum Master',
      type: 'card_back',
      description: 'Exclusive rainbow-colored card back for veteran players',
      price: 500,
      rarity: 'Legendary',
      preview: '/textures/cards/booster_pack.png',
      owned: false
    },

    // Deck Covers
    {
      id: 'cover-fire-radja',
      name: 'Radja Portrait',
      type: 'deck_cover',
      description: 'Animated deck cover featuring Radja with flame effects',
      price: 200,
      rarity: 'Epic',
      preview: '/textures/cards/radja.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'cover-fire-crimson',
      name: 'Crimson Warrior',
      type: 'deck_cover',
      description: 'Dynamic deck cover showcasing Crimson in battle stance',
      price: 200,
      rarity: 'Epic',
      preview: '/textures/cards/crimson.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'cover-tribal-kobar',
      name: 'Kobar Tribal Crest',
      type: 'deck_cover',
      description: 'Tribal-themed cover representing the Kobar lineage',
      price: 300,
      rarity: 'Legendary',
      preview: '/textures/cards/kobar_booster.png',
      owned: false
    },

    // Avatar Skins
    {
      id: 'skin-radja-golden',
      name: 'Golden Radja',
      type: 'avatar_skin',
      description: 'Luxurious golden variant of Radja with enhanced animations',
      price: 400,
      rarity: 'Legendary',
      preview: '/textures/cards/radja.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'skin-boar-berserker-chrome',
      name: 'Chrome Berserker',
      type: 'avatar_skin',
      description: 'Metallic chrome skin for Boar Berserker with particle effects',
      price: 350,
      rarity: 'Epic',
      preview: '/textures/cards/boar-berserker.png',
      owned: false,
      element: 'fire'
    },

    // Battlefields
    {
      id: 'battlefield-volcano',
      name: 'Volcanic Arena',
      type: 'battlefield',
      description: 'Battle on the edge of an active volcano with lava effects',
      price: 600,
      rarity: 'Legendary',
      preview: '/textures/cards/battle_preparation.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'battlefield-ancient',
      name: 'Ancient Ruins',
      type: 'battlefield',
      description: 'Mystical battlefield set in forgotten ancient ruins',
      price: 450,
      rarity: 'Epic',
      preview: '/textures/cards/prize.png',
      owned: false
    },

    // Effect Animations
    {
      id: 'effect-fire-burst',
      name: 'Inferno Burst',
      type: 'effect_animation',
      description: 'Enhanced fire spell effects with explosive animations',
      price: 250,
      rarity: 'Rare',
      preview: '/textures/cards/burning-up.png',
      owned: false,
      element: 'fire'
    },
    {
      id: 'effect-bleed-enhanced',
      name: 'Crimson Bleed',
      type: 'effect_animation',
      description: 'Dramatic bleed effect animations with blood particles',
      price: 200,
      rarity: 'Rare',
      preview: '/textures/cards/after-burn.png',
      owned: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: '🎨' },
    { id: 'card_back', name: 'Card Backs', icon: '🎴' },
    { id: 'deck_cover', name: 'Deck Covers', icon: '📚' },
    { id: 'avatar_skin', name: 'Avatar Skins', icon: '👤' },
    { id: 'battlefield', name: 'Battlefields', icon: '🏟️' },
    { id: 'effect_animation', name: 'Effects', icon: '✨' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? battleSetItems 
    : battleSetItems.filter(item => item.type === selectedCategory);

  const handlePurchase = (item: BattleSetItem) => {
    if (ownedItems.has(item.id)) {
      toast.error('You already own this item!');
      return;
    }

    // Simulate purchase
    setOwnedItems(prev => new Set(prev.add(item.id)));
    toast.success(`${item.name} purchased! It's now available in your collection.`);
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
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20">
      <NavigationBar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <BackButton to="/shop" />
          <h1 className="text-2xl font-bold ml-4">Battle Sets</h1>
        </div>

        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Customize Your Game Experience</h2>
          <p className="text-gray-400 text-sm">
            Personalize your cards, avatars, and battlefield with exclusive cosmetic items. 
            These items enhance the visual experience without affecting gameplay balance.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-spektrum-orange text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${getRarityColor(item.rarity)} transition-all hover:scale-105`}
            >
              {/* Preview Image */}
              <div className="h-40 bg-gray-700 flex items-center justify-center">
                <img
                  src={item.preview}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = '/textures/cards/placeholder.svg';
                    target.onerror = null;
                  }}
                />
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <span className="text-2xl">{getTypeIcon(item.type)}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRarityColor(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  {item.element && (
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs capitalize">
                      {item.element}
                    </span>
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-4">{item.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-spektrum-orange font-bold text-lg">
                    ${item.price}
                  </span>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={ownedItems.has(item.id)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      ownedItems.has(item.id)
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-spektrum-orange hover:bg-orange-600 text-white'
                    }`}
                  >
                    {ownedItems.has(item.id) ? 'Owned' : 'Purchase'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No items found</div>
            <p className="text-gray-500 text-sm">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSetsPage;