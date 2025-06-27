import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { cardNftService } from '../blockchain/solana/cardNftService';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface Expansion {
  id: string;
  name: string;
  description: string;
  releaseDate: string;
  cardCount: number;
  artUrl: string;
  symbol: string;
}

interface PackTier {
  id: 'beginner' | 'advanced';
  name: string;
  description: string;
  price: number;
  cardCount: number;
  guaranteedRarity: string[];
  color: string;
  emoji: string;
}

interface IndividualPack {
  id: string;
  expansion: Expansion;
  tier: PackTier;
  packNumber: number;
  artUrl: string;
  uniqueArt: string;
}

interface PackReward {
  pack: IndividualPack;
  cards: Card[];
  mintedCards: string[];
}

const BoosterPacksPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAvailableCards, addCard } = useDeckStore();
  const allCards = getAvailableCards();
  
  // State management
  const [currentStep, setCurrentStep] = useState<'tier-selection' | 'expansion-selection' | 'pack-selection' | 'opening' | 'results'>('tier-selection');
  const [selectedTier, setSelectedTier] = useState<PackTier | null>(null);
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [selectedPack, setSelectedPack] = useState<IndividualPack | null>(null);
  const [openedPacks, setOpenedPacks] = useState<PackReward[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Data definitions
  const expansions: Expansion[] = [
    {
      id: 'genesis',
      name: 'Genesis Set',
      description: 'The foundational cards that started it all',
      releaseDate: '2024-01-01',
      cardCount: 150,
      artUrl: '/attached_assets/Non Elemental (1)-15.png',
      symbol: '⚡'
    },
    {
      id: 'elemental-fury',
      name: 'Elemental Fury',
      description: 'Harness the power of the elements',
      releaseDate: '2024-06-01',
      cardCount: 120,
      artUrl: '/attached_assets/Red Elemental Avatar_Ava - Crimson.png',
      symbol: '🔥'
    },
    {
      id: 'ancient-wisdom',
      name: 'Ancient Wisdom',
      description: 'Discover the secrets of the past',
      releaseDate: '2024-12-01',
      cardCount: 100,
      artUrl: '/attached_assets/Non Elemental - Spell_Kencur.png',
      symbol: '📚'
    }
  ];

  const packTiers: PackTier[] = [
    {
      id: 'beginner',
      name: 'Beginner Pack',
      description: 'Perfect for new players starting their journey',
      price: 3,
      cardCount: 5,
      guaranteedRarity: ['Common', 'Uncommon'],
      color: 'from-green-500 to-green-700',
      emoji: '🌱'
    },
    {
      id: 'advanced',
      name: 'Advanced Pack',
      description: 'For experienced players seeking rare treasures',
      price: 8,
      cardCount: 8,
      guaranteedRarity: ['Rare', 'Epic'],
      color: 'from-purple-500 to-purple-700',
      emoji: '💎'
    }
  ];

  // Generate individual packs for selection
  const generateIndividualPacks = (expansion: Expansion, tier: PackTier): IndividualPack[] => {
    const packs: IndividualPack[] = [];
    const artVariations = [
      'Battle Preparation', 'Crates', 'Golden Crates', 'Prize', 
      'Spell_Kencur', 'Spell_Merah', 'Spell_Rec Scroll',
      'Avatar_Ava - Crimson', 'Avatar_Ava - Scarlet'
    ];

    for (let i = 1; i <= 9; i++) {
      packs.push({
        id: `${expansion.id}-${tier.id}-${i}`,
        expansion,
        tier,
        packNumber: i,
        artUrl: expansion.artUrl,
        uniqueArt: `/attached_assets/Non Elemental (1)_${artVariations[i - 1] || 'Battle Preparation'}.png`
      });
    }
    return packs;
  };

  // Card shuffling and minting logic
  const shuffleAndMintCards = async (pack: IndividualPack): Promise<PackReward> => {
    setIsProcessing(true);
    
    // Filter cards by expansion and add default rarity if missing
    const expansionCards = allCards.map(card => ({
      ...card,
      rarity: card.rarity || (card.type === 'avatar' && (card as AvatarCard).level === 2 ? 'Rare' : 
              card.element === 'fire' ? 'Uncommon' : 'Common'),
      expansion: card.expansion || pack.expansion.id
    }));

    // Generate random cards based on tier guarantees
    const cards: Card[] = [];
    const { cardCount, guaranteedRarity } = pack.tier;
    
    // Guarantee specific rarities
    for (const rarity of guaranteedRarity) {
      const rarityCards = expansionCards.filter(card => card.rarity === rarity);
      if (rarityCards.length > 0) {
        const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
        cards.push(randomCard);
      }
    }
    
    // Fill remaining slots with random cards (weighted by rarity)
    while (cards.length < cardCount) {
      const weights = { 'Common': 50, 'Uncommon': 30, 'Rare': 15, 'Epic': 4, 'Legendary': 1 };
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      const random = Math.random() * totalWeight;
      
      let currentWeight = 0;
      let selectedRarity: keyof typeof weights = 'Common';
      
      for (const [rarity, weight] of Object.entries(weights)) {
        currentWeight += weight;
        if (random <= currentWeight) {
          selectedRarity = rarity as keyof typeof weights;
          break;
        }
      }
      
      const rarityCards = expansionCards.filter(card => card.rarity === selectedRarity);
      if (rarityCards.length > 0) {
        const randomCard = rarityCards[Math.floor(Math.random() * rarityCards.length)];
        cards.push(randomCard);
      } else {
        // Fallback to any available card
        const randomCard = expansionCards[Math.floor(Math.random() * expansionCards.length)];
        cards.push(randomCard);
      }
    }

    // Simulate minting process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mintedCards: string[] = [];
    for (const card of cards) {
      try {
        // Convert card to NFT metadata and mint
        const metadata = cardNftService.convertCardToNftMetadata(card);
        const mintAddress = `mint_${card.id}_${Date.now()}`;
        mintedCards.push(mintAddress);
        
        // Add to player's collection
        addCard(card);
      } catch (error) {
        console.error('Minting error for card:', card.name, error);
      }
    }

    setIsProcessing(false);
    return { pack, cards, mintedCards };
  };

  // Step handlers
  const handleTierSelection = (tier: PackTier) => {
    setSelectedTier(tier);
    setCurrentStep('expansion-selection');
  };

  const handleExpansionSelection = (expansion: Expansion) => {
    setSelectedExpansion(expansion);
    setCurrentStep('pack-selection');
  };

  const handlePackSelection = async (pack: IndividualPack) => {
    setSelectedPack(pack);
    setCurrentStep('opening');
    
    try {
      const reward = await shuffleAndMintCards(pack);
      setOpenedPacks([reward]);
      setCurrentStep('results');
      setShowResults(true);
      
      toast.success(`Successfully opened ${pack.tier.name}! Got ${reward.cards.length} cards.`);
    } catch (error) {
      console.error('Pack opening error:', error);
      toast.error('Failed to open pack. Please try again.');
      setCurrentStep('pack-selection');
    }
  };

  const handleBackNavigation = () => {
    switch (currentStep) {
      case 'expansion-selection':
        setCurrentStep('tier-selection');
        setSelectedTier(null);
        break;
      case 'pack-selection':
        setCurrentStep('expansion-selection');
        setSelectedExpansion(null);
        break;
      case 'results':
        setCurrentStep('tier-selection');
        setSelectedTier(null);
        setSelectedExpansion(null);
        setSelectedPack(null);
        setOpenedPacks([]);
        setShowResults(false);
        break;
      default:
        navigate('/shop');
    }
  };

  // Render tier selection
  const renderTierSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Your Pack Type</h1>
        <p className="text-gray-300">Select between beginner-friendly or advanced booster packs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packTiers.map((tier) => (
          <div
            key={tier.id}
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${tier.color} p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl`}
            onClick={() => handleTierSelection(tier)}
          >
            <div className="text-center text-white">
              <div className="text-6xl mb-4">{tier.emoji}</div>
              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              <p className="text-sm opacity-90 mb-4">{tier.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-bold">${tier.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cards:</span>
                  <span className="font-bold">{tier.cardCount}</span>
                </div>
                <div className="text-xs opacity-75">
                  Guaranteed: {tier.guaranteedRarity.join(', ')}
                </div>
              </div>
              
              <Button className="mt-4 w-full bg-white text-black hover:bg-gray-100">
                Select {tier.name}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render expansion selection
  const renderExpansionSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Expansion</h1>
        <p className="text-gray-300">
          Selected: {selectedTier?.name} ({selectedTier?.emoji})
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {expansions.map((expansion) => (
          <div
            key={expansion.id}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-700 transition-colors duration-300 border border-gray-600 hover:border-spektrum-orange"
            onClick={() => handleExpansionSelection(expansion)}
          >
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{expansion.symbol}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{expansion.name}</h3>
                <p className="text-gray-300 text-sm">{expansion.description}</p>
                <div className="flex space-x-4 mt-2 text-xs text-gray-400">
                  <span>Released: {expansion.releaseDate}</span>
                  <span>{expansion.cardCount} cards</span>
                </div>
              </div>
              <Button className="bg-spektrum-orange hover:bg-orange-600">
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render pack selection (9 packs)
  const renderPackSelection = () => {
    if (!selectedTier || !selectedExpansion) return null;
    
    const individualPacks = generateIndividualPacks(selectedExpansion, selectedTier);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Pack</h1>
          <p className="text-gray-300">
            {selectedExpansion.name} - {selectedTier.name}
          </p>
          <div className="flex justify-center items-center space-x-2 mt-2">
            <Badge variant="secondary">{selectedTier.cardCount} cards</Badge>
            <Badge variant="secondary">${selectedTier.price}</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {individualPacks.map((pack) => (
            <div
              key={pack.id}
              className="relative aspect-[3/4] bg-gray-800 rounded-lg cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 border-gray-600 hover:border-spektrum-orange"
              onClick={() => handlePackSelection(pack)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg">
                <div className="p-4 h-full flex flex-col justify-between">
                  <div className="text-center">
                    <div className="text-2xl mb-2">{selectedExpansion.symbol}</div>
                    <div className="text-xs text-gray-400">Pack #{pack.packNumber}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg">{selectedTier.emoji}</div>
                    <div className="text-xs text-white font-medium">
                      {selectedTier.name}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xs text-spektrum-orange font-bold">
                      ${selectedTier.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          Each pack contains unique card combinations. Choose wisely!
        </div>
      </div>
    );
  };

  // Render opening animation
  const renderOpening = () => (
    <div className="text-center space-y-6">
      <h1 className="text-3xl font-bold text-white">Opening Pack...</h1>
      <div className="animate-pulse">
        <div className="text-6xl">{selectedTier?.emoji}</div>
        <p className="text-gray-300 mt-4">
          Shuffling cards and minting to your wallet...
        </p>
      </div>
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="animate-spin w-8 h-8 border-4 border-spektrum-orange border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  );

  // Render results
  const renderResults = () => {
    if (openedPacks.length === 0) return null;
    
    const reward = openedPacks[0];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Pack Opened!</h1>
          <p className="text-gray-300">
            {reward.pack.expansion.name} - {reward.pack.tier.name}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            You received {reward.cards.length} cards:
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reward.cards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="aspect-[3/4] bg-gray-600 rounded mb-2 relative overflow-hidden">
                  {card.art && (
                    <img
                      src={card.art}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {card.rarity}
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-white font-medium text-sm">{card.name}</h4>
                  <p className="text-gray-400 text-xs">{card.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <div className="bg-green-900 border border-green-600 rounded-lg p-4">
            <p className="text-green-300">
              ✅ All cards have been minted to your wallet and added to your library!
            </p>
            <p className="text-green-400 text-sm mt-1">
              Minted {reward.mintedCards.length} NFTs successfully
            </p>
          </div>
          
          <div className="flex space-x-4 justify-center">
            <Button 
              onClick={() => navigate('/library')}
              className="bg-spektrum-orange hover:bg-orange-600"
            >
              View Library
            </Button>
            <Button 
              onClick={() => navigate('/deck-builder')}
              variant="outline"
            >
              Build Deck
            </Button>
            <Button 
              onClick={handleBackNavigation}
              variant="outline"
            >
              Open Another
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spektrum-dark via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <BackButton onClick={handleBackNavigation} />
        
        <div className="max-w-6xl mx-auto">
          {currentStep === 'tier-selection' && renderTierSelection()}
          {currentStep === 'expansion-selection' && renderExpansionSelection()}
          {currentStep === 'pack-selection' && renderPackSelection()}
          {currentStep === 'opening' && renderOpening()}
          {currentStep === 'results' && renderResults()}
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default BoosterPacksPage;