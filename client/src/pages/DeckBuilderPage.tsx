import React, { useState, useEffect } from 'react';
import { useDeckStore, Deck } from '../game/stores/useDeckStore';
import { Card, ElementType, AvatarCard, RarityType } from '../game/data/cardTypes';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';
import { getRarityColor, getRarityTextColor } from '../game/utils/rarityUtils';

const DeckBuilderPage: React.FC = () => {
  const { decks, activeDeckId, getAvailableCards, getAvailableCardsWithCNFTs, addDeck, updateDeck, deleteDeck, setActiveDeck } = useDeckStore();
  const navigate = useNavigate();
  
  // Local state for the deck builder
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [deckName, setDeckName] = useState('');
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [elementFilter, setElementFilter] = useState<ElementType | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string | 'all'>('all');
  const [tribeFilter, setTribeFilter] = useState<string | 'all'>('all');
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  // Load all available cards including cNFTs on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        const cardsWithCNFTs = await getAvailableCardsWithCNFTs();
        setAllCards(cardsWithCNFTs);
      } catch (error) {
        console.error('Error loading cards:', error);
        // Fallback to regular cards
        setAllCards(getAvailableCards());
      } finally {
        setIsLoadingCards(false);
      }
    };

    loadCards();
  }, [getAvailableCards, getAvailableCardsWithCNFTs]);
  
  // Helper function to get unique cards (removing duplicates) 
  const getUniqueCards = (cards: Card[]) => {
    const seen = new Set();
    return cards.filter(card => {
      const key = `${card.name}-${card.type}-${card.element}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  // Filter cards based on selected filters
  const filteredCards = getUniqueCards(allCards).filter(card => {
    const elementMatch = elementFilter === 'all' || card.element === elementFilter;
    const typeMatch = typeFilter === 'all' || card.type === typeFilter;
    
    // Tribe filter (for avatar cards)
    let tribeMatch = true;
    if (tribeFilter !== 'all' && card.type === 'avatar') {
      const avatarCard = card as AvatarCard;
      // Check if the avatar's subType contains the tribe keyword
      tribeMatch = avatarCard.subType?.includes(tribeFilter.toLowerCase()) || false;
    }
    
    return elementMatch && typeMatch && tribeMatch;
  });
  
  // Calculate card counts for the current selection by card name (more accurate)
  const cardCounts = selectedCards.reduce<Record<string, number>>((acc, card) => {
    const key = card.name; // Use card name for proper counting
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  // Check if we've reached the max count for a specific card using our own logic
  const hasReachedMaxCount = (card: Card) => {
    const currentCount = cardCounts[card.name] || 0;
    
    // Level 2 avatars can only have 1 copy
    if (card.type === 'avatar' && (card as AvatarCard).level === 2) {
      return currentCount >= 1;
    }
    
    // All other cards can have up to 4 copies
    return currentCount >= 4;
  };

  // Get wallet card count - how many the user actually owns
  const getWalletCardCount = (cardName: string) => {
    // Use the getAllCards() from deck store to get all available cards including CNFTs
    const allCards = availableCards;
    return allCards.filter(card => card.name === cardName).length;
  };
  
  // Load a deck into the editor
  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setDeckName(deck.name);
    setSelectedCards([...deck.cards]); // Create a copy of the cards array
  };
  
  // Create a new deck
  const handleNewDeck = () => {
    setSelectedDeck(null);
    setDeckName('New Custom Deck');
    setSelectedCards([]);
    toast.success("Start adding cards to your new deck");
  };
  
  // Save the current deck
  const handleSaveDeck = () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }
    
    if (selectedCards.length < 40) {
      toast.error("A deck must have at least 40 cards");
      return;
    }
    
    try {
      if (selectedDeck) {
        // Update existing deck
        updateDeck(selectedDeck.id, {
          name: deckName,
          cards: selectedCards,
          coverCardId: selectedCards[0]?.id || undefined
        });
        toast.success(`Deck "${deckName}" updated`);
      } else {
        // Create new deck
        const newDeck = addDeck(deckName, selectedCards);
        setSelectedDeck(newDeck);
        toast.success(`Deck "${deckName}" created`);
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  
  // Delete the current deck
  const handleDeleteDeck = () => {
    if (!selectedDeck) return;
    
    if (window.confirm(`Are you sure you want to delete the deck "${selectedDeck.name}"?`)) {
      deleteDeck(selectedDeck.id);
      setSelectedDeck(null);
      setDeckName('');
      setSelectedCards([]);
      toast.success(`Deck "${selectedDeck.name}" deleted`);
    }
  };
  
  // Set a deck as active (for gameplay)
  const handleSetActiveDeck = (deck: Deck) => {
    setActiveDeck(deck.id);
    toast.success(`Deck "${deck.name}" set as active`);
  };

  // Handle deck cover selection
  const handleSelectCover = (card: Card) => {
    if (!selectedDeck) return;
    
    updateDeck(selectedDeck.id, {
      ...selectedDeck,
      coverCardId: card.id
    });
    setShowCoverSelector(false);
    toast.success(`Deck cover updated to ${card.name}`);
  };
  
  // Add a card to the deck
  const handleAddCard = (card: Card) => {
    if (hasReachedMaxCount(card)) {
      const currentCount = cardCounts[card.name] || 0;
      const maxAllowed = card.type === 'avatar' && (card as AvatarCard).level === 2 ? 1 : 4;
      toast.error(`Maximum ${maxAllowed} copies allowed for "${card.name}" (currently have ${currentCount})`);
      return;
    }
    
    // Create a new copy of the card with a unique timestamp-based ID to ensure uniqueness
    const timestamp = Date.now();
    const currentCount = cardCounts[card.name] || 0;
    const newCard = { ...card, id: `${card.id}-copy-${currentCount + 1}-${timestamp}` };
    
    setSelectedCards([...selectedCards, newCard]);
  };
  
  // Remove a card from the deck
  const handleRemoveCard = (index: number) => {
    const newSelectedCards = [...selectedCards];
    newSelectedCards.splice(index, 1);
    setSelectedCards(newSelectedCards);
  };
  
  if (isLoadingCards) {
    return (
      <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20 flex items-center justify-center" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-spektrum-orange mx-auto mb-4"></div>
          <p className="text-lg">Loading cards and cNFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">Deck Builder</h1>
        
        {/* Show total cards available including cNFTs */}
        <div className="text-center mb-4 text-sm text-gray-300">
          {allCards.length} cards available (including cNFTs)
        </div>
        
        {/* Deck selection and management */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Your Decks</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {decks.map(deck => (
            <div 
              key={deck.id} 
              className={`p-3 rounded-lg cursor-pointer flex flex-col items-center transition-colors ${
                deck.id === activeDeckId 
                  ? 'bg-amber-700 border-2 border-amber-500' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => handleEditDeck(deck)}
            >
              <div className="w-24 h-32 bg-gray-600 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                {deck.coverCardId ? (
                  <>
                    {/* Try to find the card and display its image */}
                    {(() => {
                      const coverCard = useDeckStore.getState().findCard(deck.coverCardId);
                      if (coverCard && coverCard.art) {
                        return (
                          <img 
                            src={coverCard.art} 
                            alt={`${deck.name} cover`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.src = '/textures/cards/placeholder.svg';
                              target.onerror = null;
                            }}
                          />
                        );
                      } else {
                        return (
                          <span className="text-xs text-center p-1">
                            Deck Cover
                          </span>
                        );
                      }
                    })()}
                  </>
                ) : (
                  <span className="text-xs text-center">No Cover</span>
                )}
              </div>
              <span className="font-medium text-sm">{deck.name}</span>
              <span className="text-xs text-gray-300">{deck.cards.length} cards</span>
              {deck.id === activeDeckId ? (
                <span className="bg-amber-600 px-2 py-0.5 rounded text-xs mt-1">Active</span>
              ) : (
                <button 
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-0.5 rounded text-xs mt-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetActiveDeck(deck);
                  }}
                >
                  Set Active
                </button>
              )}
            </div>
          ))}
          
          {/* New deck button */}
          {decks.length < 5 && (
            <div 
              className="p-3 rounded-lg cursor-pointer flex flex-col items-center bg-green-700 hover:bg-green-600 transition-colors"
              onClick={handleNewDeck}
            >
              <div className="w-24 h-32 bg-green-800 rounded-md mb-2 flex items-center justify-center">
                <span className="text-3xl">+</span>
              </div>
              <span className="font-medium text-sm">New Deck</span>
              <span className="text-xs text-gray-300">{decks.length}/5 decks</span>
            </div>
          )}
          </div>
        </div>
        
        {/* Deck editor */}
        {(selectedDeck || selectedCards.length > 0 || deckName === 'New Custom Deck') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current deck */}
            <div className="md:col-span-1 bg-gray-800 rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-2">
                {selectedDeck ? "Edit Deck" : "Create New Deck"}
              </h2>
              <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Deck Name
              </label>
              <input 
                type="text" 
                value={deckName} 
                onChange={(e) => setDeckName(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter deck name"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Cards ({selectedCards.length}/60)
                </span>
                <span className={`text-xs ${selectedCards.length >= 40 ? 'text-green-400' : 'text-red-400'}`}>
                  {selectedCards.length < 40 ? `Need ${40 - selectedCards.length} more` : 'Minimum reached'}
                </span>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto bg-gray-700 rounded-md p-2">
                {selectedCards.length === 0 ? (
                  <div className="text-gray-400 text-sm text-center py-4">
                    No cards added yet. Add cards from the collection.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {selectedCards.map((card, index) => (
                      <div 
                        key={`${card.id}-${index}`} 
                        className="flex items-center justify-between bg-gray-800 rounded p-2 text-sm"
                      >
                        <div className="flex items-center">
                          {card.art ? (
                            <div className={`w-8 h-8 mr-2 rounded overflow-hidden border-2 ${card.rarity ? getRarityColor(card.rarity) : 'border-gray-400'}`}>
                              <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div 
                              className={`w-3 h-3 rounded-full mr-2 ${
                                card.element === 'fire' ? 'bg-red-500' : 
                                card.element === 'water' ? 'bg-blue-500' : 
                                card.element === 'air' ? 'bg-cyan-300' : 
                                card.element === 'ground' ? 'bg-amber-700' : 'bg-gray-400'
                              }`}
                            />
                          )}
                          <span className="truncate max-w-[140px]">{card.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs bg-gray-700 px-1 rounded mr-2">
                            {card.type}
                          </span>
                          <button 
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleRemoveCard(index)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between">
              <button 
                className={`${selectedDeck ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700 text-white font-bold'} px-4 py-2 rounded disabled:bg-gray-600 disabled:text-gray-400 transition-colors`}
                onClick={handleSaveDeck}
                disabled={selectedCards.length < 40 || !deckName.trim()}
              >
                {selectedDeck ? 'Update Deck' : 'Create New Deck'}
              </button>
              
              {selectedDeck && (
                <>
                  <button 
                    className="bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded mr-2"
                    onClick={() => setShowCoverSelector(true)}
                  >
                    Edit Cover
                  </button>
                  <button 
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    onClick={handleDeleteDeck}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Card collection */}
          <div className="md:col-span-2 bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Card Collection</h2>
              <a 
                href="/card_import_template.csv"
                download="spektrum_card_template.csv"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors flex items-center"
              >
                <span className="mr-1">📥</span> Download Card CSV Template
              </a>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Element
                </label>
                <select 
                  value={elementFilter}
                  onChange={(e) => setElementFilter(e.target.value as ElementType | 'all')}
                  className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Elements</option>
                  <option value="fire">Fire</option>
                  <option value="water">Water</option>
                  <option value="air">Air</option>
                  <option value="earth">Ground</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Type
                </label>
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="avatar">Avatar</option>
                  <option value="spell">Spell</option>
                  <option value="quickSpell">Quick Spell</option>
                  <option value="item">Item</option>
                  <option value="ritualArmor">Ritual Armor</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tribe
                </label>
                <select 
                  value={tribeFilter}
                  onChange={(e) => setTribeFilter(e.target.value)}
                  className="px-3 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tribes</option>
                  <option value="kobar">Kobar</option>
                  <option value="borah">Borah</option>
                  <option value="kujana">Kujana</option>
                  <option value="kuhaka">Kuhaka</option>
                </select>
              </div>
            </div>
            
            {/* Card grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-2">
              {filteredCards.map((card, index) => {
                const deckCount = cardCounts[card.name] || 0; // Cards in current deck
                const walletCount = getWalletCardCount(card.name); // Cards owned in wallet
                const isMaxed = hasReachedMaxCount(card);
                const maxAllowed = card.type === 'avatar' && (card as AvatarCard).level === 2 ? 1 : 4;
                
                return (
                  <div 
                    key={`${card.id}-${index}`} 
                    className={`bg-gray-700 rounded-md overflow-hidden transition-transform hover:scale-105 ${
                      isMaxed ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="relative group">
                      <div 
                        className={`h-36 flex items-center justify-center relative ${
                          card.element === 'fire' ? 'bg-red-900' : 
                          card.element === 'water' ? 'bg-blue-900' : 
                          card.element === 'air' ? 'bg-cyan-900' :
                          card.element === 'ground' ? 'bg-amber-900' : 'bg-gray-800'
                        }`}
                      >
                        {card.art ? (
                          <>
                            <img 
                              src={card.art} 
                              alt={card.name} 
                              className="h-full w-full object-cover opacity-80"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = '/textures/cards/placeholder.svg';
                                target.onerror = null; // Prevent infinite loop
                              }}
                            />
                            <div className="absolute inset-0 flex flex-col justify-between p-1">
                              <div className="flex justify-between">
                                <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded font-bold">
                                  {card.name}
                                </div>
                                {card.type === 'avatar' && (
                                  <div className="bg-gray-800 bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                    Lv{(card as AvatarCard).level}
                                  </div>
                                )}
                              </div>
                              <div className="bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded self-start">
                                {card.type} 
                                {card.type === 'avatar' && (card as AvatarCard).subType && 
                                  ` • ${(card as AvatarCard).subType.charAt(0).toUpperCase() + (card as AvatarCard).subType.slice(1)}`
                                }
                              </div>
                            </div>
                            
                            {/* Hover tooltip for card details */}
                            <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-gray-900 bg-opacity-90 border border-gray-600 rounded-md p-3 shadow-lg w-64 text-sm text-left left-0 mt-2 pointer-events-none" style={{ top: '100%' }}>
                              <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                              <div className="flex justify-between mb-2">
                                <div className="text-gray-300">
                                  {card.type} • {card.element}
                                  {card.type === 'avatar' && ` • Lv${(card as AvatarCard).level}`}
                                </div>
                                <div className="flex items-center gap-1">
                                  {card.energyCost?.map((energy, i) => (
                                    <div 
                                      key={i}
                                      className={`w-3 h-3 rounded-full ${
                                        energy === 'fire' ? 'bg-red-500' : 
                                        energy === 'water' ? 'bg-blue-500' : 
                                        energy === 'air' ? 'bg-cyan-300' : 
                                        energy === 'ground' ? 'bg-amber-700' : 
                                        energy === 'neutral' ? 'bg-gray-400' : 'bg-gray-400'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {card.type === 'avatar' && (
                                <div className="mb-2">
                                  <div>Health: {(card as AvatarCard).health}</div>
                                  {(card as AvatarCard).skill1 && (
                                    <div className="mt-2">
                                      <div className="font-medium">{(card as AvatarCard).skill1.name}</div>
                                      <div className="text-xs text-gray-300 mb-1">
                                        Energy: {(card as AvatarCard).skill1.energyCost?.map(e => 
                                          e.charAt(0).toUpperCase() + e.slice(1)
                                        ).join(', ')}
                                      </div>
                                      <div>Damage: {(card as AvatarCard).skill1.damage}</div>
                                      <div className="text-xs mt-1">{(card as AvatarCard).skill1.effect}</div>
                                    </div>
                                  )}
                                  {(() => {
                                    const skill2 = (card as AvatarCard).skill2;
                                    if (!skill2) return null;
                                    return (
                                      <div className="mt-2 border-t border-gray-700 pt-2">
                                        <div className="font-medium">{skill2.name}</div>
                                        <div className="text-xs text-gray-300 mb-1">
                                          Energy: {skill2.energyCost?.map(e => 
                                            e.charAt(0).toUpperCase() + e.slice(1)
                                          ).join(', ') || 'None'}
                                        </div>
                                        <div>Damage: {skill2.damage || 0}</div>
                                        <div className="text-xs mt-1">{skill2.effect}</div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                              {(card.type === 'spell' || card.type === 'quickSpell' || card.type === 'ritualArmor' || card.type === 'equipment') && (
                                <div className="mb-2">
                                  <div className="text-gray-100">{card.description}</div>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-2">
                            <div className="font-bold">{card.name}</div>
                            <div className="text-xs">{card.type}</div>
                            {card.type === 'avatar' && (
                              <div className="text-xs mt-1">Level: {(card as AvatarCard).level}</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Count badge */}
                      {deckCount > 0 && (
                        <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-20">
                          {deckCount}
                        </div>
                      )}
                      
                      {/* Wallet count badge */}
                      {walletCount > 0 && (
                        <div className="absolute top-1 left-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center z-20">
                          {walletCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-300">{card.element}</span>
                        <div className="flex items-center gap-1">
                          {card.energyCost?.map((energy, i) => (
                            <div 
                              key={i}
                              className={`w-3 h-3 rounded-full ${
                                energy === 'fire' ? 'bg-red-500' : 
                                energy === 'water' ? 'bg-blue-500' : 
                                energy === 'air' ? 'bg-cyan-300' : 
                                energy === 'ground' ? 'bg-amber-700' : 
                                energy === 'neutral' ? 'bg-gray-400' : 'bg-gray-400'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        className={`w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400 px-2 py-1 rounded text-xs`}
                        onClick={() => handleAddCard(card)}
                        disabled={isMaxed}
                      >
                        {isMaxed ? `Max (${deckCount}/${maxAllowed})` : `Add (${deckCount}/${maxAllowed})`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Cover Selector Modal */}
      {showCoverSelector && selectedDeck && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Select Deck Cover</h2>
              <p className="text-sm text-gray-300">Choose a card from your deck to use as the cover</p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {selectedCards.map((card, index) => (
                  <div
                    key={`cover-${card.id}-${index}`}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => handleSelectCover(card)}
                  >
                    <div className="bg-gray-700 rounded-lg p-2 hover:bg-gray-600">
                      <div className="w-full h-32 bg-gray-600 rounded mb-2 flex items-center justify-center overflow-hidden">
                        {card.art ? (
                          <img 
                            src={card.art} 
                            alt={card.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xs text-center p-1">
                            {card.name}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-center">
                        <div className="font-medium truncate">{card.name}</div>
                        <div className="text-gray-400">{card.type}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-700 flex justify-end">
              <button
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                onClick={() => setShowCoverSelector(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <NavigationBar />
    </div>
  );
};

export default DeckBuilderPage;