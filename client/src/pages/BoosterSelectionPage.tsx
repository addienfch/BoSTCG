import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, ElementType } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

interface BoosterPack {
  id: string;
  name: string;
  element: ElementType | 'mixed';
  price: number;
  description: string;
  guaranteedRarity: string;
  cardCount: number;
  emoji: string;
  color: string;
  artUrl: string;
}

interface BoosterVariant {
  id: string;
  name: string;
  subtitle: string;
  artUrl: string;
  rarity: string;
  description: string;
}

const BoosterSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAvailableCards } = useDeckStore();
  
  // Get the selected pack from navigation state
  const selectedPack = location.state?.selectedPack as BoosterPack;
  const [selectedVariant, setSelectedVariant] = useState<BoosterVariant | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  if (!selectedPack) {
    navigate('/shop/booster');
    return null;
  }

  // Generate 9 booster pack variants based on the element
  const generatePackVariants = (pack: BoosterPack): BoosterVariant[] => {
    const baseVariants = [
      { rarity: 'Starter', subtitle: 'Basic Collection', description: 'Common cards with 1 guaranteed uncommon' },
      { rarity: 'Advanced', subtitle: 'Enhanced Power', description: 'Uncommon cards with 1 guaranteed rare' },
      { rarity: 'Elite', subtitle: 'Superior Force', description: 'Rare cards with chance of epic' },
      { rarity: 'Master', subtitle: 'Legendary Power', description: 'Epic cards with chance of legendary' },
      { rarity: 'Champion', subtitle: 'Ultimate Collection', description: 'Guaranteed legendary card' },
      { rarity: 'Mythic', subtitle: 'Divine Arsenal', description: 'Multiple rare+ cards guaranteed' },
      { rarity: 'Cosmic', subtitle: 'Stellar Force', description: 'Enhanced drop rates for all rarities' },
      { rarity: 'Eternal', subtitle: 'Timeless Power', description: 'Exclusive variant cards included' },
      { rarity: 'Infinity', subtitle: 'Beyond Limits', description: 'Maximum rarity with bonus cards' }
    ];

    return baseVariants.map((variant, index) => ({
      id: `${pack.id}-variant-${index + 1}`,
      name: `${variant.rarity} ${pack.name}`,
      subtitle: variant.subtitle,
      artUrl: pack.artUrl,
      rarity: variant.rarity,
      description: variant.description
    }));
  };

  const packVariants = generatePackVariants(selectedPack);

  const generateRandomCards = (pack: BoosterPack, variant: BoosterVariant): Card[] => {
    const availableCards = getAvailableCards();
    const elementCards = pack.element === 'mixed' 
      ? availableCards 
      : availableCards.filter(card => card.element === pack.element);

    const cards: Card[] = [];
    const cardCount = pack.cardCount;

    // Generate cards based on variant rarity
    for (let i = 0; i < cardCount; i++) {
      const randomCard = elementCards[Math.floor(Math.random() * elementCards.length)];
      if (randomCard) {
        cards.push({
          ...randomCard,
          id: `${randomCard.id}-pack-${Date.now()}-${i}`
        });
      }
    }

    return cards;
  };

  const handleVariantSelect = (variant: BoosterVariant) => {
    setSelectedVariant(variant);
  };

  const handleOpenPack = () => {
    if (!selectedVariant) {
      toast.error('Please select a booster pack variant first!');
      return;
    }

    setIsOpening(true);
    
    // Simulate pack opening delay
    setTimeout(() => {
      const cards = generateRandomCards(selectedPack, selectedVariant);
      
      navigate('/shop/booster', {
        state: {
          openedCards: cards,
          packName: selectedVariant.name,
          packVariant: selectedVariant
        }
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20">
      <NavigationBar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <BackButton to="/shop/booster" />
          <h1 className="text-2xl font-bold ml-4">Select {selectedPack.name}</h1>
        </div>

        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Choose Your Variant</h2>
          <p className="text-gray-400 text-sm">
            Each variant offers different rarity distributions and guaranteed cards. 
            Select wisely to maximize your collection!
          </p>
        </div>

        {/* Pack Variants Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {packVariants.map((variant) => (
            <div
              key={variant.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all ${
                selectedVariant?.id === variant.id
                  ? 'ring-2 ring-spektrum-orange bg-gray-700'
                  : 'hover:bg-gray-700'
              }`}
              onClick={() => handleVariantSelect(variant)}
            >
              <div className="text-center">
                <div className="w-full h-24 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-3xl">{selectedPack.emoji}</span>
                </div>
                <h3 className="font-bold text-sm mb-1">{variant.rarity}</h3>
                <p className="text-xs text-gray-400 mb-2">{variant.subtitle}</p>
                <p className="text-xs text-gray-500">{variant.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Variant Details */}
        {selectedVariant && (
          <div className="mb-6 bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Selected: {selectedVariant.name}</h3>
            <p className="text-gray-400 text-sm mb-2">{selectedVariant.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-spektrum-orange font-semibold">
                {selectedPack.cardCount} Cards • ${selectedPack.price}
              </span>
              <span className="text-xs text-gray-500">
                Guaranteed: {selectedVariant.rarity} rarity
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/shop/booster')}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
          >
            Back to Packs
          </button>
          <button
            onClick={handleOpenPack}
            disabled={!selectedVariant || isOpening}
            className="flex-1 bg-spektrum-orange hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
          >
            {isOpening ? 'Opening Pack...' : `Open Pack ($${selectedPack.price})`}
          </button>
        </div>

        {isOpening && (
          <div className="mt-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-spektrum-orange border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-400">Opening your {selectedVariant?.name}...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoosterSelectionPage;