import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { useExpansionStore, type Expansion } from '../game/stores/useExpansionStore';
import { usePremadeDecksStore, type PremadeDeck } from '../game/stores/usePremadeDecksStore';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import CardRewardPopup from '../components/CardRewardPopup';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  kobarBorahAvatarCards, 
  kobarBorahActionCards, 
  kujanaKuhakaAvatarCards 
} from '../game/data/kobarBorahCards';
import { redElementalSpellCards } from '../game/data/redElementalCards';
import { cardNftService } from '../blockchain/solana/cardNftService';

// Using centralized stores for data management

const PremadeDecksPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDeck, getAvailableCards, addCards } = useDeckStore();
  const { expansions } = useExpansionStore();
  const { premadeDecks, purchaseDeck } = usePremadeDecksStore();
  const [purchasedDecks, setPurchasedDecks] = useState<Set<string>>(new Set());
  const [selectedExpansion, setSelectedExpansion] = useState<Expansion | null>(null);
  const [currentStep, setCurrentStep] = useState<'expansion-selection' | 'deck-selection'>('expansion-selection');
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardCards, setRewardCards] = useState<Card[]>([]);
  const [rewardTitle, setRewardTitle] = useState('');

  // Using centralized expansion data

  const premadeDecks: PremadeDeck[] = [
    {
      id: 'kobar-borah-starter',
      name: 'Kobar-Borah Tribal',
      expansion: expansions[0],
      tribe: 'kobar-borah',
      description: 'Complete tribal deck featuring Kobar and Borah avatars with supporting spells.',
      price: 35,
      cardCount: 42,
      strategy: 'Tribal synergy with avatar evolution and equipment support',
      difficulty: 'Beginner',
      coverCardName: 'Radja',
      keyCards: ['Radja', 'Crimson', 'Boar Berserker', 'Banaspati'],
      purchased: false
    },
    {
      id: 'kujana-kuhaka-starter',
      name: 'Kujana-Kuhaka Tribal',
      expansion: expansions[0],
      tribe: 'kujana-kuhaka',
      description: 'Aggressive tribal deck with Kujana and Kuhaka avatars plus fire spells.',
      price: 40,
      cardCount: 45,
      strategy: 'Fast aggro with spell support and avatar synergies',
      difficulty: 'Intermediate',
      coverCardName: 'Boar Witch',
      keyCards: ['Boar Witch', 'Daisy', 'Spark', 'Burn Ball'],
      purchased: false
    },
    {
      id: 'kobar-pure',
      name: 'Pure Kobar Deck',
      expansion: expansions[1],
      tribe: 'kobar',
      description: 'Specialized deck focusing only on Kobar tribe avatars and equipment.',
      price: 50,
      cardCount: 40,
      strategy: 'Pure tribal with equipment synergy',
      difficulty: 'Advanced',
      coverCardName: 'Kobar Trainee A',
      keyCards: ['Kobar Trainee A', 'Kobar Trainee B', 'Cracking Sword'],
      purchased: false
    },
    {
      id: 'kujana-pure',
      name: 'Pure Kujana Deck',
      expansion: expansions[1],
      tribe: 'kujana',
      description: 'Elite Kujana-only deck with advanced fire magic combinations.',
      price: 55,
      cardCount: 40,
      strategy: 'Elite tribal with advanced spell combos',
      difficulty: 'Advanced',
      coverCardName: 'Witch Trainee',
      keyCards: ['Witch Trainee', 'Burning Up!', 'Flaming Body'],
      purchased: false
    }
  ];

  // Generate deck cards based on the premade deck configuration
  const generateDeckCards = (deckTemplate: PremadeDeck): Card[] => {
    const cards: Card[] = [];
    
    switch (deckTemplate.tribe) {
      case 'kobar-borah':
        // Add Kobar-Borah avatars (3 copies each of level 1)
        const kbAvatars = kobarBorahAvatarCards.filter(card => card.level === 1);
        kbAvatars.forEach(avatar => {
          for (let i = 1; i <= 3; i++) {
            cards.push({ ...avatar, id: `${avatar.id}-${i}` });
          }
        });
        
        // Add action cards (3 copies each)
        kobarBorahActionCards.forEach(action => {
          for (let i = 1; i <= 3; i++) {
            cards.push({ ...action, id: `${action.id}-${i}` });
          }
        });
        
        // Add level 2 avatars (1 copy each for evolution)
        const kbLevel2 = kobarBorahAvatarCards.filter(card => card.level === 2);
        kbLevel2.forEach(avatar => {
          cards.push({ ...avatar, id: `${avatar.id}-1` });
        });
        break;
        
      case 'kujana-kuhaka':
        // Add Kujana-Kuhaka avatars (3 copies each of level 1)
        const kkAvatars = kujanaKuhakaAvatarCards.filter(card => card.level === 1);
        kkAvatars.forEach(avatar => {
          for (let i = 1; i <= 3; i++) {
            cards.push({ ...avatar, id: `${avatar.id}-${i}` });
          }
        });
        
        // Add fire spells (3 copies each)
        redElementalSpellCards.forEach(spell => {
          for (let i = 1; i <= 3; i++) {
            cards.push({ ...spell, id: `${spell.id}-${i}` });
          }
        });
        
        // Add level 2 avatars (1 copy each)
        const kkLevel2 = kujanaKuhakaAvatarCards.filter(card => card.level === 2);
        kkLevel2.forEach(avatar => {
          cards.push({ ...avatar, id: `${avatar.id}-1` });
        });
        break;
        
      case 'kobar':
        // Pure Kobar deck
        const kobarAvatars = kobarBorahAvatarCards.filter(card => 
          card.level === 1 && (card as AvatarCard).subType === 'kobar'
        );
        kobarAvatars.forEach(avatar => {
          for (let i = 1; i <= 4; i++) {
            cards.push({ ...avatar, id: `${avatar.id}-${i}` });
          }
        });
        
        // Add supporting action cards
        kobarBorahActionCards.forEach(action => {
          for (let i = 1; i <= 2; i++) {
            cards.push({ ...action, id: `${action.id}-${i}` });
          }
        });
        break;
        
      case 'kujana':
        // Pure Kujana deck
        const kujanaAvatars = kujanaKuhakaAvatarCards.filter(card => 
          card.level === 1 && (card as AvatarCard).subType === 'kujana'
        );
        kujanaAvatars.forEach(avatar => {
          for (let i = 1; i <= 4; i++) {
            cards.push({ ...avatar, id: `${avatar.id}-${i}` });
          }
        });
        
        // Add fire spells
        redElementalSpellCards.forEach(spell => {
          for (let i = 1; i <= 2; i++) {
            cards.push({ ...spell, id: `${spell.id}-${i}` });
          }
        });
        break;
    }
    
    // Ensure minimum 40 cards
    while (cards.length < 40) {
      const randomIndex = Math.floor(Math.random() * Math.min(cards.length, 10));
      const copyCard = { ...cards[randomIndex], id: `${cards[randomIndex].id}-extra-${cards.length}` };
      cards.push(copyCard);
    }
    
    return cards.slice(0, deckTemplate.cardCount);
  };

  const handlePurchaseDeck = async (deck: PremadeDeck) => {
    try {
      const deckCards = generateDeckCards(deck);
      
      // Add cards to player's collection
      addCards(deckCards);
      
      // Create the deck
      const newDeck = addDeck(deck.name, deckCards, deck.tribe);
      
      // Mark as purchased
      setPurchasedDecks(prev => {
        const newSet = new Set(prev);
        newSet.add(deck.id);
        return newSet;
      });
      
      // Show reward popup
      setRewardCards(deckCards);
      setRewardTitle(`${deck.name} Purchased!`);
      setShowRewardPopup(true);
      
      toast.success(`Successfully purchased ${deck.name}! Added ${deckCards.length} cards to your collection.`);
      
    } catch (error) {
      console.error('Error purchasing deck:', error);
      toast.error('Failed to purchase deck. Please try again.');
    }
  };



  const getExpansionDecks = (expansion: Expansion) => {
    return premadeDecks.filter(deck => deck.expansion.id === expansion.id);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTribeColor = (tribe: string) => {
    switch (tribe) {
      case 'kobar-borah': return 'from-orange-500 to-red-500';
      case 'kujana-kuhaka': return 'from-red-500 to-purple-500';
      case 'kobar': return 'from-orange-400 to-orange-600';
      case 'kujana': return 'from-red-400 to-red-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const handleExpansionSelection = (expansion: Expansion) => {
    setSelectedExpansion(expansion);
    setCurrentStep('deck-selection');
  };

  const handleBackNavigation = () => {
    if (currentStep === 'deck-selection') {
      setCurrentStep('expansion-selection');
      setSelectedExpansion(null);
    } else {
      navigate('/shop');
    }
  };

  // Render expansion selection
  const renderExpansionSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Choose Expansion</h1>
        <p className="text-gray-300">Select the set you want to explore premade decks from</p>
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
                <div className="mt-2">
                  <Badge variant="secondary">
                    {getExpansionDecks(expansion).length} decks available
                  </Badge>
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

  // Render deck selection
  const renderDeckSelection = () => {
    if (!selectedExpansion) return null;
    
    const expansionDecks = getExpansionDecks(selectedExpansion);
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Premade Decks</h1>
          <p className="text-gray-300">
            {selectedExpansion.name} ({selectedExpansion.symbol}) - Choose your deck
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {expansionDecks.map((deck) => (
            <div
              key={deck.id}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${getTribeColor(deck.tribe)} p-6 border-2 border-gray-600 hover:border-spektrum-orange transition-all duration-300`}
            >
              <div className="text-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{deck.name}</h3>
                  <Badge className={`${getDifficultyColor(deck.difficulty)} text-white`}>
                    {deck.difficulty}
                  </Badge>
                </div>
                
                <p className="text-sm opacity-90 mb-4">{deck.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Cards:</span>
                    <span className="font-bold">{deck.cardCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span className="font-bold">${deck.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tribe:</span>
                    <span className="font-bold capitalize">{deck.tribe.replace('-', ' & ')}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs opacity-75 mb-2">Strategy:</p>
                  <p className="text-sm">{deck.strategy}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs opacity-75 mb-2">Key Cards:</p>
                  <div className="flex flex-wrap gap-1">
                    {deck.keyCards.map((card, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {card}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => handlePurchaseDeck(deck)}
                  disabled={purchasedDecks.has(deck.id)}
                  className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-gray-400 disabled:text-gray-600"
                >
                  {purchasedDecks.has(deck.id) ? 'Purchased' : `Buy for $${deck.price}`}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spektrum-dark via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <BackButton onClick={handleBackNavigation} />
        
        <div className="max-w-6xl mx-auto">
          {currentStep === 'expansion-selection' && renderExpansionSelection()}
          {currentStep === 'deck-selection' && renderDeckSelection()}
        </div>
      </div>
      
      <NavigationBar />
      
      {/* Card Reward Popup */}
      <CardRewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        title={rewardTitle}
        subtitle={`${selectedExpansion?.name} - Complete deck with all cards`}
        cards={rewardCards}
        showMintButton={false}
      />
    </div>
  );
};

export default PremadeDecksPage;