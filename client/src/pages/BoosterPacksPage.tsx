import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { cardNftService } from '../blockchain/solana/cardNftService';
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
}

interface PackReward {
  pack: BoosterPack;
  cards: Card[];
}

const BoosterPacksPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAvailableCards } = useDeckStore();
  const allCards = getAvailableCards();
  
  const [selectedPacks, setSelectedPacks] = useState<BoosterPack[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [openedPacks, setOpenedPacks] = useState<PackReward[]>([]);
  const [showResults, setShowResults] = useState(false);

  const boosterPacks: BoosterPack[] = [
    {
      id: 'fire-pack',
      name: 'Fire Elemental Pack',
      element: 'fire',
      price: 5,
      description: 'Contains 5 fire element cards with guaranteed rare card',
      guaranteedRarity: 'Rare',
      cardCount: 5,
      emoji: '🔥',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 'water-pack',
      name: 'Water Elemental Pack',
      element: 'water',
      price: 5,
      description: 'Contains 5 water element cards with guaranteed rare card',
      guaranteedRarity: 'Rare',
      cardCount: 5,
      emoji: '💧',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 'ground-pack',
      name: 'Ground Elemental Pack',
      element: 'ground',
      price: 5,
      description: 'Contains 5 ground element cards with guaranteed rare card',
      guaranteedRarity: 'Rare',
      cardCount: 5,
      emoji: '🟡',
      color: 'from-yellow-600 to-yellow-800'
    },
    {
      id: 'air-pack',
      name: 'Air Elemental Pack',
      element: 'air',
      price: 5,
      description: 'Contains 5 air element cards with guaranteed rare card',
      guaranteedRarity: 'Rare',
      cardCount: 5,
      emoji: '💨',
      color: 'from-green-600 to-green-800'
    },
    {
      id: 'mixed-pack',
      name: 'Mixed Elemental Pack',
      element: 'mixed',
      price: 8,
      description: 'Contains 7 random element cards with guaranteed epic card',
      guaranteedRarity: 'Epic',
      cardCount: 7,
      emoji: '✨',
      color: 'from-purple-600 to-purple-800'
    },
    {
      id: 'premium-pack',
      name: 'Premium Collection Pack',
      element: 'mixed',
      price: 15,
      description: 'Contains 10 cards with guaranteed legendary card',
      guaranteedRarity: 'Legendary',
      cardCount: 10,
      emoji: '👑',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const generateRandomCards = (pack: BoosterPack): Card[] => {
    const availableCards = pack.element === 'mixed' 
      ? allCards 
      : allCards.filter(card => card.element === pack.element);
    
    const cards: Card[] = [];
    
    // Generate random cards for the pack
    for (let i = 0; i < pack.cardCount; i++) {
      const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
      cards.push({
        ...randomCard,
        id: `${randomCard.id}-${Date.now()}-${i}`
      });
    }
    
    return cards;
  };

  const handlePackSelection = (pack: BoosterPack) => {
    // Navigate to pack variant selection page
    navigate('/shop/booster/select', { 
      state: { selectedPack: pack } 
    });
  };

  const openSelectedPacks = async () => {
    if (selectedPacks.length === 0) {
      toast.error('Please select at least one booster pack');
      return;
    }

    setIsOpening(true);
    
    try {
      // Check wallet connection
      const walletStatus = await cardNftService.getWalletStatus();
      if (!walletStatus.connected) {
        toast.error('Please connect your wallet first');
        setIsOpening(false);
        return;
      }

      // Simulate opening animation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const rewards: PackReward[] = selectedPacks.map(pack => ({
        pack,
        cards: generateRandomCards(pack)
      }));

      // Create cNFTs for all cards obtained from packs
      const allCards = rewards.flatMap(reward => reward.cards);
      for (const card of allCards) {
        try {
          // Convert card to NFT metadata and create cNFT
          const metadata = cardNftService.convertCardToNftMetadata(card);
          // In a real implementation, this would mint the cNFT on-chain
          await cardNftService.buyCard(`cnft-${card.id}`, 0); // Mock implementation for now
          toast.success(`Created cNFT for ${card.name}`);
        } catch (error) {
          console.error('Failed to create cNFT for card:', card.name, error);
          toast.error(`Failed to create cNFT for ${card.name}`);
        }
      }
      
      setOpenedPacks(rewards);
      setShowResults(true);
      setIsOpening(false);
      setSelectedPacks([]);
      
      const totalCards = rewards.reduce((sum, reward) => sum + reward.cards.length, 0);
      toast.success(`Opened ${selectedPacks.length} packs and received ${totalCards} cards as cNFTs!`);
    } catch (error) {
      console.error('Error opening packs:', error);
      toast.error('Failed to open packs. Please try again.');
      setIsOpening(false);
    }
  };

  const getTotalPrice = () => {
    return selectedPacks.reduce((sum, pack) => sum + pack.price, 0);
  };

  const resetResults = () => {
    setShowResults(false);
    setOpenedPacks([]);
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Booster Packs</h1>
        
        {!showResults ? (
          <>
            {/* Pack Selection */}
            <div className="space-y-3 mb-6">
              {boosterPacks.map(pack => (
                <div
                  key={pack.id}
                  onClick={() => handlePackSelection(pack)}
                  className={`bg-gradient-to-r ${pack.color} rounded-lg p-4 cursor-pointer transition-all transform hover:scale-105 hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pack.emoji}</span>
                      <h3 className="font-bold text-lg">{pack.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{pack.price} USDC</div>
                      <div className="text-xs opacity-80">{pack.cardCount} cards</div>
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 mb-2">{pack.description}</p>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-black bg-opacity-30 px-2 py-1 rounded">
                      Guaranteed: {pack.guaranteedRarity}
                    </span>
                    <span className="text-sm font-medium">
                      Choose from 9 variants →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Section */}
            <div className="mt-6 bg-gray-800 rounded-lg p-4">
              <h3 className="font-bold mb-2">How Pack Opening Works</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Choose a pack type based on your preferred element</li>
                <li>• Select from 9 different variants with unique rarity distributions</li>
                <li>• Each variant offers different guaranteed cards and drop rates</li>
                <li>• All opened cards are minted as cNFTs on Solana blockchain</li>
                <li>• Cards are immediately added to your library and deck collection</li>
              </ul>
            </div>
          </>
        ) : (
          /* Results Display */
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Pack Opening Results!</h2>
              <p className="text-gray-300">
                Opened {openedPacks.length} pack{openedPacks.length !== 1 ? 's' : ''} and received{' '}
                {openedPacks.reduce((sum, reward) => sum + reward.cards.length, 0)} cards
              </p>
            </div>

            {openedPacks.map((reward, packIndex) => (
              <div key={packIndex} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{reward.pack.emoji}</span>
                  <h3 className="font-bold">{reward.pack.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {reward.cards.map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      className={`border-2 rounded-lg p-2 ${
                        card.element === 'fire' ? 'border-red-500 bg-red-900' :
                        card.element === 'water' ? 'border-blue-500 bg-blue-900' :
                        card.element === 'ground' ? 'border-yellow-500 bg-yellow-900' :
                        card.element === 'air' ? 'border-green-500 bg-green-900' :
                        'border-gray-500 bg-gray-900'
                      }`}
                    >
                      <div className="font-medium text-sm">{card.name}</div>
                      <div className="text-xs text-gray-300 capitalize">{card.type}</div>
                      <div className="text-xs text-gray-400 capitalize">{card.element}</div>
                      {card.type === 'avatar' && (
                        <div className="text-xs text-gray-400">
                          Lv.{(card as AvatarCard).level} HP:{(card as AvatarCard).health}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={resetResults}
                className="flex-1 bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark py-3 px-4 rounded font-medium transition-colors"
              >
                Open More Packs
              </button>
              <button
                onClick={() => navigate('/library')}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-medium transition-colors"
              >
                View Collection
              </button>
            </div>
          </div>
        )}
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default BoosterPacksPage;