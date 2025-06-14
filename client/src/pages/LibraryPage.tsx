import React, { useState, useMemo } from 'react';
import { useDeckStore } from '../game/stores/useDeckStore';
import { Card, ElementType, AvatarCard } from '../game/data/cardTypes';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

const LibraryPage: React.FC = () => {
  const { getAvailableCards } = useDeckStore();
  const allCards = getAvailableCards();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');
  const [selectedExpansion, setSelectedExpansion] = useState<string>('all');

  // Create card counts for the library
  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allCards.forEach(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [allCards]);

  // Get unique cards for display
  const uniqueCards = useMemo(() => {
    const seen = new Set();
    return allCards.filter(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allCards]);

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
        className={`${elementColor} border-2 rounded-lg p-3 cursor-pointer hover:opacity-80 transition-opacity`}
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
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-xl font-bold mb-4 text-center">Card Library</h1>
        
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-3 mb-4">
          {/* Search Bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
            />
          </div>

          {/* Element Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Element</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'all', label: 'All', color: 'bg-gray-600' },
                { value: 'fire', label: 'Fire', color: 'bg-red-600' },
                { value: 'water', label: 'Water', color: 'bg-blue-600' },
                { value: 'ground', label: 'Ground', color: 'bg-yellow-600' },
                { value: 'air', label: 'Air', color: 'bg-green-600' },
                { value: 'neutral', label: 'Neutral', color: 'bg-gray-600' }
              ].map(element => (
                <button
                  key={element.value}
                  onClick={() => setSelectedElement(element.value as ElementType | 'all')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedElement === element.value 
                      ? `${element.color} text-white` 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {element.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Card Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'avatar', label: 'Avatar' },
                { value: 'spell', label: 'Spell' },
                { value: 'quickSpell', label: 'Quick Spell' },
                { value: 'ritualArmor', label: 'Ritual Armor' },
                { value: 'field', label: 'Field' },
                { value: 'equipment', label: 'Equipment' },
                { value: 'item', label: 'Item' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedType === type.value 
                      ? 'bg-spektrum-orange text-spektrum-dark' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {filteredCards.map(card => (
            <CardItem key={`${card.id}-${card.name}-${card.element}`} card={card} />
          ))}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>No cards found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-spektrum-orange hover:underline"
            >
              Clear filters to see all cards
            </button>
          </div>
        )}
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-spektrum-dark border border-gray-600 rounded-lg p-4 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">{selectedCard.name}</h2>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            {selectedCard.art && (
              <img 
                src={selectedCard.art} 
                alt={selectedCard.name}
                className="w-full h-48 object-cover rounded mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Type:</span> {selectedCard.type}</div>
              <div><span className="font-medium">Element:</span> {selectedCard.element}</div>
              
              {selectedCard.type === 'avatar' && (
                <>
                  <div><span className="font-medium">Level:</span> {(selectedCard as AvatarCard).level}</div>
                  <div><span className="font-medium">Health:</span> {(selectedCard as AvatarCard).health}</div>
                  <div><span className="font-medium">Sub Type:</span> {(selectedCard as AvatarCard).subType}</div>
                  
                  {(selectedCard as AvatarCard).skill1 && (
                    <div>
                      <span className="font-medium">Skill 1:</span> {(selectedCard as AvatarCard).skill1?.name}
                      <p className="text-gray-300 ml-2">{(selectedCard as AvatarCard).skill1?.effect}</p>
                    </div>
                  )}
                  
                  {(selectedCard as AvatarCard).skill2 && (
                    <div>
                      <span className="font-medium">Skill 2:</span> {(selectedCard as AvatarCard).skill2?.name}
                      <p className="text-gray-300 ml-2">{(selectedCard as AvatarCard).skill2?.effect}</p>
                    </div>
                  )}
                </>
              )}
              
              <div><span className="font-medium">Description:</span></div>
              <p className="text-gray-300">{selectedCard.description}</p>
            </div>
          </div>
        </div>
      )}

      <NavigationBar />
    </div>
  );
};

export default LibraryPage;