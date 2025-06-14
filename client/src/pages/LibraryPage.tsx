import React, { useState, useMemo, useEffect } from 'react';
import { useDeckStore } from '../game/stores/useDeckStore';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import { cardNftService } from '../blockchain/solana/cardNftService';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { ChevronDown } from 'lucide-react';

const LibraryPage: React.FC = () => {
  const { getAvailableCards } = useDeckStore();
  const allCards = getAvailableCards();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedExpansion, setSelectedExpansion] = useState<string>('all');
  const [cNftCards, setCNftCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cNFT cards on component mount
  useEffect(() => {
    const loadCNftCards = async () => {
      try {
        const walletStatus = await cardNftService.getWalletStatus();
        if (walletStatus.connected) {
          const ownedCards = await cardNftService.getOwnedCards();
          setCNftCards(ownedCards);
        }
      } catch (error) {
        console.error('Error loading cNFT cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCNftCards();
  }, []);

  // Combine regular cards and cNFT cards
  const combinedCards = useMemo(() => {
    return [...allCards, ...cNftCards];
  }, [allCards, cNftCards]);

  // Create card counts for the library (including cNFTs)
  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedCards.forEach(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [combinedCards]);

  // Get unique cards for display
  const uniqueCards = useMemo(() => {
    const seen = new Set();
    return combinedCards.filter(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [combinedCards]);

  // Filter cards based on search and filter criteria
  const filteredCards = useMemo(() => {
    return uniqueCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesElement = selectedElement === 'all' || card.element === selectedElement;
      const matchesType = selectedType === 'all' || card.type === selectedType;
      const matchesRarity = selectedRarity === 'all'; // All cards shown for now
      const matchesExpansion = selectedExpansion === 'all'; // All expansions shown for now
      
      return matchesSearch && matchesElement && matchesType && matchesRarity && matchesExpansion;
    });
  }, [uniqueCards, searchTerm, selectedElement, selectedType, selectedRarity, selectedExpansion]);



  const clearFilters = () => {
    setSearchTerm('');
    setSelectedElement('all');
    setSelectedType('all');
    setSelectedRarity('all');
    setSelectedExpansion('all');
  };

  const CardItem: React.FC<{ card: Card }> = ({ card }) => {
    const cardKey = `${card.name}-${card.type}-${card.element}`;
    const count = cardCounts[cardKey] || 0;
    
    // Get element styling
    const elementColor = {
      fire: 'border-red-500 bg-red-900',
      water: 'border-blue-500 bg-blue-900', 
      ground: 'border-yellow-500 bg-yellow-900',
      air: 'border-green-500 bg-green-900',
      neutral: 'border-gray-500 bg-gray-900'
    }[card.element] || 'border-gray-500 bg-gray-900';
    
    return (
      <div 
        className={`${elementColor} border-2 rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity min-w-[200px]`}
        onClick={() => setSelectedCard(card)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-sm">{card.name}</h3>
          <span className="bg-gray-700 px-2 py-1 rounded text-xs">x{count}</span>
        </div>
        
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-300 capitalize">{card.type}</span>
          <span className="text-xs text-gray-400">{card.type === 'avatar' ? `HP: ${(card as AvatarCard).health}` : ''}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 capitalize">{card.element}</span>
          {card.type === 'avatar' && (
            <span className="text-xs text-gray-400">Lv. {(card as AvatarCard).level}</span>
          )}
        </div>
        
        {card.art && (
          <div className="mt-2">
            <img 
              src={card.art} 
              alt={card.name}
              className="w-full h-24 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <NavigationBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold ml-4">Card Library</h1>
        </div>

        {/* Search and Filter Controls - Landscape Layout */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 items-center bg-gray-800 p-4 rounded-lg">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 text-white w-64"
            />
            
            {/* Element Dropdown */}
            <div className="relative">
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value as ElementType | 'all')}
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 rounded-lg border border-gray-600 text-white cursor-pointer hover:bg-gray-600"
              >
                <option value="all">All Elements</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="ground">Ground</option>
                <option value="air">Air</option>
                <option value="neutral">Neutral</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Type Dropdown */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 rounded-lg border border-gray-600 text-white cursor-pointer hover:bg-gray-600"
              >
                <option value="all">All Types</option>
                <option value="avatar">Avatar</option>
                <option value="spell">Spell</option>
                <option value="quickSpell">Quick Spell</option>
                <option value="ritualArmor">Ritual Armor</option>
                <option value="item">Item</option>
                <option value="field">Field</option>
                <option value="equipment">Equipment</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Rarity Dropdown */}
            <div className="relative">
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 rounded-lg border border-gray-600 text-white cursor-pointer hover:bg-gray-600"
              >
                <option value="all">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Expansion Dropdown */}
            <div className="relative">
              <select
                value={selectedExpansion}
                onChange={(e) => setSelectedExpansion(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-gray-700 rounded-lg border border-gray-600 text-white cursor-pointer hover:bg-gray-600"
              >
                <option value="all">All Sets</option>
                <option value="base">Base Set</option>
                <option value="expansion1">Expansion 1</option>
                <option value="expansion2">Expansion 2</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-400">
            Showing {filteredCards.length} of {uniqueCards.length} cards
          </p>
        </div>

        {/* Cards Grid - Vertical Scrollable */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredCards.map((card, index) => (
            <div key={`${card.name}-${card.type}-${card.element}-${index}`}>
              <CardItem card={card} />
            </div>
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>No cards found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-red-400 hover:underline"
            >
              Clear filters to see all cards
            </button>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedCard.name}</h2>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
            
            {selectedCard.art && (
              <img 
                src={selectedCard.art} 
                alt={selectedCard.name}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Type:</span> {selectedCard.type}</p>
              <p><span className="font-semibold">Element:</span> {selectedCard.element}</p>
              {selectedCard.type === 'avatar' && (
                <>
                  <p><span className="font-semibold">Health:</span> {(selectedCard as AvatarCard).health}</p>
                  <p><span className="font-semibold">Level:</span> {(selectedCard as AvatarCard).level}</p>
                </>
              )}
              {selectedCard.description && (
                <p><span className="font-semibold">Description:</span> {selectedCard.description}</p>
              )}
              {selectedCard.energyCost && selectedCard.energyCost.length > 0 && (
                <p><span className="font-semibold">Energy Cost:</span> {selectedCard.energyCost.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;