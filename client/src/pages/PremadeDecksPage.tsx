import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import { useDeckStore } from '../game/stores/useDeckStore';
import { toast } from 'sonner';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

interface PremadeDeck {
  id: string;
  name: string;
  element: ElementType;
  description: string;
  price: number;
  cardCount: number;
  strategy: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverCard: string;
  keyCards: string[];
  purchased: boolean;
}

const PremadeDecksPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDeck, getAvailableCards } = useDeckStore();
  const [purchasedDecks, setPurchasedDecks] = useState<Set<string>>(new Set());
  const [selectedDeck, setSelectedDeck] = useState<PremadeDeck | null>(null);

  const premadeDecks: PremadeDeck[] = [
    {
      id: 'fire-starter',
      name: 'Blazing Beginners',
      element: 'fire',
      description: 'Perfect starter deck focused on aggressive fire tactics and basic combos.',
      price: 25,
      cardCount: 40,
      strategy: 'Aggressive rush tactics with burn effects',
      difficulty: 'Beginner',
      coverCard: 'Radja',
      keyCards: ['Radja', 'Crimson', 'Burn Ball', 'Spark'],
      purchased: false
    },
    {
      id: 'fire-control',
      name: 'Inferno Masters',
      element: 'fire',
      description: 'Advanced fire deck with complex burn synergies and tactical control.',
      price: 45,
      cardCount: 40,
      strategy: 'Control-based burn with defensive options',
      difficulty: 'Advanced',
      coverCard: 'Boar Berserker',
      keyCards: ['Boar Berserker', 'Burning Armor', 'After Burn', 'Double Bomb'],
      purchased: false
    },
    {
      id: 'water-flow',
      name: 'Tidal Force',
      element: 'water',
      description: 'Fluid water-based deck emphasizing healing and defensive strategies.',
      price: 35,
      cardCount: 40,
      strategy: 'Defensive healing with counter-attacks',
      difficulty: 'Intermediate',
      coverCard: 'Water Avatar',
      keyCards: ['Water Avatar', 'Healing Wave', 'Tidal Shield', 'Flow Control'],
      purchased: false
    },
    {
      id: 'ground-fortress',
      name: 'Stone Guardians',
      element: 'ground',
      description: 'Solid ground deck built around defense and gradual advantage building.',
      price: 40,
      cardCount: 40,
      strategy: 'Tank and fortify with high-health avatars',
      difficulty: 'Intermediate',
      coverCard: 'Stone Guardian',
      keyCards: ['Stone Guardian', 'Rock Shield', 'Earth Tremor', 'Mountain Fortress'],
      purchased: false
    },
    {
      id: 'air-swift',
      name: 'Wind Dancers',
      element: 'air',
      description: 'Fast-paced air deck focusing on quick strikes and evasive maneuvers.',
      price: 30,
      cardCount: 40,
      strategy: 'Speed and agility with hit-and-run tactics',
      difficulty: 'Beginner',
      coverCard: 'Wind Dancer',
      keyCards: ['Wind Dancer', 'Swift Strike', 'Gust Shield', 'Aerial Assault'],
      purchased: false
    },
    {
      id: 'neutral-balance',
      name: 'Harmonious Balance',
      element: 'neutral',
      description: 'Versatile neutral deck that adapts to any situation with balanced strategies.',
      price: 35,
      cardCount: 40,
      strategy: 'Adaptive multi-element synergy',
      difficulty: 'Advanced',
      coverCard: 'Balance Keeper',
      keyCards: ['Balance Keeper', 'Elemental Harmony', 'Universal Shield', 'Adaptive Strike'],
      purchased: false
    }
  ];

  const generateDeckCards = (deckTemplate: PremadeDeck): Card[] => {
    const availableCards = getAvailableCards();
    const elementCards = deckTemplate.element === 'neutral' 
      ? availableCards 
      : availableCards.filter(card => card.element === deckTemplate.element);

    const cards: Card[] = [];
    const usedCardCounts: Record<string, number> = {};

    // Add key cards first (if they exist in our card pool)
    deckTemplate.keyCards.forEach(keyCardName => {
      const keyCard = elementCards.find(card => 
        card.name.toLowerCase().includes(keyCardName.toLowerCase())
      );
      if (keyCard) {
        // Add 3 copies of each key card
        for (let i = 0; i < 3; i++) {
          cards.push({
            ...keyCard,
            id: `${keyCard.id}-premade-${i + 1}`
          });
        }
        usedCardCounts[keyCard.name] = 3;
      }
    });

    // Fill remaining slots with other cards from the element
    const remainingSlots = 40 - cards.length;
    const otherCards = elementCards.filter(card => 
      !deckTemplate.keyCards.some(keyCard => 
        card.name.toLowerCase().includes(keyCard.toLowerCase())
      )
    );

    for (let i = 0; i < remainingSlots; i++) {
      const randomCard = otherCards[Math.floor(Math.random() * otherCards.length)];
      if (randomCard) {
        const currentCount = usedCardCounts[randomCard.name] || 0;
        if (currentCount < 4) { // Max 4 copies of any card
          cards.push({
            ...randomCard,
            id: `${randomCard.id}-premade-${Date.now()}-${i}`
          });
          usedCardCounts[randomCard.name] = currentCount + 1;
        }
      }
    }

    return cards.slice(0, 40); // Ensure exactly 40 cards
  };

  const handlePurchaseDeck = (deck: PremadeDeck) => {
    if (purchasedDecks.has(deck.id)) {
      toast.error('You have already purchased this deck!');
      return;
    }

    try {
      const deckCards = generateDeckCards(deck);
      
      // Create the deck using the deck store
      addDeck(deck.name, deckCards, deck.element);
      
      // Mark as purchased
      setPurchasedDecks(prev => new Set(prev.add(deck.id)));
      
      toast.success(`${deck.name} purchased and added to your collection!`);
      
      // Navigate to deck builder to show the new deck
      setTimeout(() => {
        navigate('/deck-builder');
      }, 1500);
      
    } catch (error) {
      console.error('Error purchasing deck:', error);
      toast.error('Failed to purchase deck. Please try again.');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getElementColor = (element: ElementType) => {
    switch (element) {
      case 'fire': return 'border-red-500 bg-red-900';
      case 'water': return 'border-blue-500 bg-blue-900';
      case 'ground': return 'border-yellow-500 bg-yellow-900';
      case 'air': return 'border-green-500 bg-green-900';
      case 'neutral': return 'border-gray-500 bg-gray-900';
      default: return 'border-gray-500 bg-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20">
      <NavigationBar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <BackButton to="/shop" />
          <h1 className="text-2xl font-bold ml-4">Premade Decks</h1>
        </div>

        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Ready-to-Play Decks</h2>
          <p className="text-gray-400 text-sm">
            Each premade deck contains 40 carefully selected cards with synergistic strategies. 
            You can only purchase one deck of each type. Perfect for getting started or trying new playstyles!
          </p>
        </div>

        {/* Deck Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premadeDecks.map((deck) => (
            <div
              key={deck.id}
              className={`${getElementColor(deck.element)} border-2 rounded-lg p-6 transition-all ${
                selectedDeck?.id === deck.id ? 'ring-2 ring-spektrum-orange' : ''
              }`}
              onClick={() => setSelectedDeck(deck)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{deck.name}</h3>
                  <p className="text-sm text-gray-300 capitalize">{deck.element} Element</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-spektrum-orange">${deck.price}</div>
                  <div className={`text-sm ${getDifficultyColor(deck.difficulty)}`}>
                    {deck.difficulty}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{deck.description}</p>

              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Strategy:</div>
                <div className="text-sm text-gray-400">{deck.strategy}</div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Key Cards:</div>
                <div className="flex flex-wrap gap-1">
                  {deck.keyCards.map((card, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 rounded text-xs"
                    >
                      {card}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{deck.cardCount} Cards</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchaseDeck(deck);
                  }}
                  disabled={purchasedDecks.has(deck.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    purchasedDecks.has(deck.id)
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-spektrum-orange hover:bg-orange-600 text-white'
                  }`}
                >
                  {purchasedDecks.has(deck.id) ? 'Purchased' : 'Purchase'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Deck Details */}
        {selectedDeck && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Deck Details: {selectedDeck.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Strategy Guide:</h4>
                <p className="text-gray-400 text-sm mb-4">{selectedDeck.strategy}</p>
                
                <h4 className="font-semibold mb-2">Playstyle:</h4>
                <p className="text-gray-400 text-sm">
                  This {selectedDeck.difficulty.toLowerCase()} deck focuses on {selectedDeck.element} element 
                  synergies and provides a {selectedDeck.strategy.toLowerCase()} approach to gameplay.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What's Included:</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• 40 carefully selected cards</li>
                  <li>• Balanced mana curve</li>
                  <li>• Synergistic card combinations</li>
                  <li>• Ready-to-play strategy</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremadeDecksPage;