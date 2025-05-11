import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollectionStore } from '../game/stores/useCollectionStore';
import { Card, AvatarCard, ActionCard } from '../game/data/cardTypes';
import { toast } from 'sonner';

// Card display component with filter options
const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const { cards, coins } = useCollectionStore();
  
  // State for filters and sorting
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  // Get card counts for duplicates
  const cardCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [cards]);
  
  // Apply filters and sorting to the cards, and remove duplicates
  const filteredAndSortedCards = React.useMemo(() => {
    // First create a unique list of cards with their counts
    const uniqueCards = new Map<string, Card>();
    cards.forEach(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      if (!uniqueCards.has(key)) {
        uniqueCards.set(key, card);
      }
    });
    
    let result = Array.from(uniqueCards.values());
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(card => {
        switch (filter) {
          case 'avatar':
            return card.type === 'avatar';
          case 'spell':
            return card.type === 'spell';
          case 'quickSpell':
            return card.type === 'quickSpell';
          case 'fire':
            return card.element === 'fire';
          case 'water':
            return card.element === 'water';
          case 'earth':
            return card.element === 'earth';
          case 'air':
            return card.element === 'air';
          default:
            return true;
        }
      });
    }
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(card => 
        card.name.toLowerCase().includes(term) || 
        (card.type === 'avatar' && (card as AvatarCard).subType?.toLowerCase().includes(term)) ||
        (card.type !== 'avatar' && (card as ActionCard).description?.toLowerCase().includes(term))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'element':
          return a.element.localeCompare(b.element);
        case 'health':
          if (a.type === 'avatar' && b.type === 'avatar') {
            return (b as AvatarCard).health - (a as AvatarCard).health;
          }
          return a.type === 'avatar' ? -1 : 1;
        case 'count':
          const keyA = `${a.name}-${a.type}-${a.element}`;
          const keyB = `${b.name}-${b.type}-${b.element}`;
          return cardCounts[keyB] - cardCounts[keyA];
        default:
          return 0;
      }
    });
    
    return result;
  }, [cards, filter, sortBy, searchTerm, cardCounts]);
  
  // Card component
  const CardItem: React.FC<{ card: Card }> = ({ card }) => {
    const avatarCard = card.type === 'avatar' ? card as AvatarCard : null;
    const actionCard = card.type !== 'avatar' ? card as ActionCard : null;
    
    // Get the count of this card type
    const cardKey = `${card.name}-${card.type}-${card.element}`;
    const count = cardCounts[cardKey] || 1;
    
    // Card background based on element
    const getCardBg = () => {
      switch (card.element) {
        case 'fire': return 'bg-gradient-to-br from-red-800 to-orange-600';
        case 'water': return 'bg-gradient-to-br from-blue-800 to-cyan-600';
        case 'earth': return 'bg-gradient-to-br from-green-800 to-lime-600';
        case 'air': return 'bg-gradient-to-br from-sky-800 to-indigo-600';
        default: return 'bg-gradient-to-br from-purple-800 to-pink-600';
      }
    };
    
    return (
      <div 
        className={`w-40 h-56 rounded-lg overflow-hidden ${getCardBg()} shadow-lg cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all relative`}
        onClick={() => setSelectedCard(card)}
      >
        {/* Card count badge */}
        {count > 1 && (
          <div className="absolute top-1 right-1 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
            {count}
          </div>
        )}
        <div className="p-2 h-full flex flex-col">
          <div className="text-sm font-bold bg-black bg-opacity-50 px-2 py-1 rounded mb-1 text-white truncate">
            {card.name}
          </div>
          
          {card.art ? (
            <div className="h-24 bg-black bg-opacity-30 rounded overflow-hidden mb-1">
              <img 
                src={card.art} 
                alt={card.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/textures/cards/card_back.png'; // Fallback image
                }}
              />
            </div>
          ) : (
            <div className="h-24 bg-black bg-opacity-30 rounded mb-1 flex items-center justify-center">
              <span className="text-white text-opacity-50 text-sm">No image</span>
            </div>
          )}
          
          <div className="bg-black bg-opacity-50 p-2 rounded text-xs text-white flex-1 overflow-hidden">
            {avatarCard && (
              <div>
                <div className="flex justify-between">
                  <span>HP: {avatarCard.health}</span>
                  <span>Lv: {avatarCard.level}</span>
                </div>
                <div className="mt-1 text-[10px] truncate">
                  Tribe: {avatarCard.subType || 'None'}
                </div>
                <div className="mt-1 text-[10px] truncate">
                  Skill: {avatarCard.skill1.name}
                </div>
              </div>
            )}
            
            {actionCard && (
              <div className="text-[10px] line-clamp-4">
                {actionCard.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Card detail modal
  const CardDetailModal: React.FC = () => {
    if (!selectedCard) return null;
    
    const avatarCard = selectedCard.type === 'avatar' ? selectedCard as AvatarCard : null;
    const actionCard = selectedCard.type !== 'avatar' ? selectedCard as ActionCard : null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <button 
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex mb-6">
              <div className="w-1/3">
                {selectedCard.art ? (
                  <img 
                    src={selectedCard.art} 
                    alt={selectedCard.name} 
                    className="w-full rounded shadow"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/textures/cards/card_back.png'; // Fallback
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              
              <div className="w-2/3 pl-4">
                <div className="mb-2">
                  <span className="text-gray-400">Type:</span>
                  <span className="ml-2 text-white font-medium capitalize">{selectedCard.type}</span>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Element:</span>
                  <span className="ml-2 text-white font-medium capitalize">{selectedCard.element}</span>
                </div>
                
                <div className="mb-2">
                  <span className="text-gray-400">Owned:</span>
                  <span className="ml-2 text-white font-medium">
                    {cardCounts[`${selectedCard.name}-${selectedCard.type}-${selectedCard.element}`] || 1} copies
                  </span>
                </div>
                
                {avatarCard && (
                  <>
                    <div className="mb-2">
                      <span className="text-gray-400">Health:</span>
                      <span className="ml-2 text-white font-medium">{avatarCard.health}</span>
                    </div>
                    
                    <div className="mb-2">
                      <span className="text-gray-400">Level:</span>
                      <span className="ml-2 text-white font-medium">{avatarCard.level}</span>
                    </div>
                    
                    {avatarCard.subType && (
                      <div className="mb-2">
                        <span className="text-gray-400">Tribe:</span>
                        <span className="ml-2 text-white font-medium capitalize">{avatarCard.subType}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {avatarCard && (
              <div className="mb-6">
                <h3 className="text-white font-bold mb-2">Skills</h3>
                
                <div className="bg-gray-700 rounded p-3 mb-3">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium text-white">{avatarCard.skill1.name}</h4>
                    <div className="text-xs">
                      Energy: {avatarCard.skill1.energyCost.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 mb-1">Damage: {avatarCard.skill1.damage}</div>
                  <div className="text-sm text-gray-300">{avatarCard.skill1.effect}</div>
                </div>
                
                {avatarCard.skill2 && (
                  <div className="bg-gray-700 rounded p-3">
                    <div className="flex justify-between mb-1">
                      <h4 className="font-medium text-white">{avatarCard.skill2.name}</h4>
                      <div className="text-xs">
                        Energy: {avatarCard.skill2.energyCost.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-300 mb-1">Damage: {avatarCard.skill2.damage}</div>
                    <div className="text-sm text-gray-300">{avatarCard.skill2.effect}</div>
                  </div>
                )}
              </div>
            )}
            
            {actionCard && (
              <div className="bg-gray-700 rounded p-3 mb-6">
                <h3 className="text-white font-bold mb-2">Description</h3>
                <div className="text-gray-300">{actionCard.description}</div>
                
                {actionCard.energyCost && actionCard.energyCost.length > 0 && (
                  <div className="mt-2">
                    <span className="text-gray-400">Energy Cost:</span>
                    <span className="ml-2 text-white">
                      {actionCard.energyCost.map(e => e.charAt(0).toUpperCase() + e.slice(1)).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            <button 
              onClick={() => setSelectedCard(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header with navigation and wallet */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-md"
        >
          Back to Home
        </button>
        <div className="flex items-center bg-yellow-700 px-4 py-2 rounded-md shadow-md">
          <span className="mr-2">🪙</span>
          <span className="font-bold">{coins}</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Card Library</h1>
      
      {/* Filters and search */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Filter by Type</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Cards</option>
              <option value="avatar">Avatars</option>
              <option value="spell">Spells</option>
              <option value="quickSpell">Quick Spells</option>
              <option value="item">Items</option>
              <option value="fire">Fire Element</option>
              <option value="water">Water Element</option>
              <option value="earth">Earth Element</option>
              <option value="air">Air Element</option>
              <option value="neutral">Neutral Element</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sort by</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="element">Element</option>
              <option value="health">Health (Avatars)</option>
              <option value="count">Card Count</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Search Cards</label>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Card Display */}
      <div className="mb-8">
        <div className="text-sm text-gray-400 mb-2">
          Showing {filteredAndSortedCards.length} of {cards.length} cards
        </div>
        
        {filteredAndSortedCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredAndSortedCards.map((card, index) => (
              <CardItem key={`${card.id}-${index}`} card={card} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-2">No cards found matching your criteria</p>
            <button 
              onClick={() => {
                setFilter('all');
                setSortBy('name');
                setSearchTerm('');
              }}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      
      {/* Card detail modal */}
      {selectedCard && <CardDetailModal />}
    </div>
  );
};

export default LibraryPage;