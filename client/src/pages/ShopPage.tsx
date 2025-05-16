import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { availableBoosterPacks, BoosterPackType } from '../game/gacha/BoosterPackSystem';
import { useCollectionStore } from '../game/stores/useCollectionStore';
import { useDeckStore } from '../game/stores/useDeckStore';
import { Card, AvatarCard, ActionCard } from '../game/data/cardTypes';
import { useSolanaWallet } from '../lib/solana/useSolanaWallet';
import { redElementalCards } from '../game/data/redElementalCards';
import { allKobarBorahCards } from '../game/data/kobarBorahCards';
import { allKujanaKuhakaCards } from '../game/data/kujanaKuhakaCards';
// Import deck creation functions from their respective files
import { kobarBorahAvatarCards, kobarBorahActionCards } from '../game/data/kobarBorahCards';
import { kujanaKuhakaAvatarCards } from '../game/data/kujanaKuhakaCards';

// Shop page component with tabs
const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { coins, purchaseBoosterPack, resetCoins } = useCollectionStore();
  const { walletAddress, connected } = useSolanaWallet();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'boosters' | 'decks'>('decks');
  
  // State for pack opening
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [allCardsRevealed, setAllCardsRevealed] = useState(false);
  
  // State for card preview
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // State for pack selection animation
  const [selectedPackType, setSelectedPackType] = useState<BoosterPackType | null>(null);
  const [packOptions, setPackOptions] = useState<number[]>([]);
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null);
  
  // NFT Marketplace state
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(!!walletAddress);
  
  // Mock NFT data
  const nfts = [
    { id: 'nft1', name: 'Legendary Avatar', price: 10, rarity: 'Legendary', image: '/attached_assets/Red Elemental Avatar_Ava - Radja.png' },
    { id: 'nft2', name: 'Epic Spell Card', price: 5, rarity: 'Epic', image: '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png' },
    { id: 'nft3', name: 'Rare Equipment', price: 2.5, rarity: 'Rare', image: '/attached_assets/Red Elemental Avatar_Ava - Radja.png' },
    { id: 'nft4', name: 'Common Item', price: 1, rarity: 'Common', image: '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png' },
  ];
  
  // Deck type definition
  interface Deck {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    cardCount: number;
    avatarCount: number;
    spellCount: number;
    element: string;
  }
  
  // Premade deck data
  const premadeDecks: Deck[] = [
    { 
      id: 'deck1', 
      name: 'Kobar-Borah Deck', 
      price: 50, // USDC
      description: 'A powerful fire-based deck featuring 16 level 1 avatar cards, 4 level 2 avatar cards, and supporting spell cards.',
      image: 'https://placehold.co/400x600/ef4444/ffffff?text=Kobar-Borah',
      cardCount: 40,
      avatarCount: 20,
      spellCount: 20,
      element: 'Fire'
    },
    { 
      id: 'deck2', 
      name: 'Kuhaka-Kujana Deck', 
      price: 50, // USDC
      description: 'A strategic water-based deck featuring 16 level 1 avatar cards, 4 level 2 avatar cards, and supporting spell cards.',
      image: 'https://placehold.co/400x600/3b82f6/ffffff?text=Kuhaka-Kujana',
      cardCount: 40,
      avatarCount: 20,
      spellCount: 20,
      element: 'Water'
    }
  ];
  
  // Get user's card collection and deck store
  const { cards } = useCollectionStore();
  const { purchaseDeck, isDeckOwned, claimStarterDeck, starterDeckClaimed } = useDeckStore();
  
  // State for available decks and starter deck status
  const [availableDecks, setAvailableDecks] = useState<Deck[]>(premadeDecks.filter(deck => !isDeckOwned(deck.id)));
  const [hasClaimedStarterDeck, setHasClaimedStarterDeck] = useState(starterDeckClaimed);
  
  // Update hasClaimedStarterDeck when starterDeckClaimed changes
  useEffect(() => {
    setHasClaimedStarterDeck(starterDeckClaimed);
  }, [starterDeckClaimed]);
  
  // Update available decks when ownership changes
  useEffect(() => {
    setAvailableDecks(premadeDecks.filter(deck => !isDeckOwned(deck.id)));
  }, [isDeckOwned]);
  
  // Handle booster pack purchase
  const handleSelectPackType = (packType: BoosterPackType, packPrice: number) => {
    // Check if player has enough coins
    if (coins < packPrice) {
      toast.error(`Not enough USDC! You need ${packPrice} USDC.`);
      return;
    }
    
    toast.success(`Purchased ${packType} pack for ${packPrice} USDC!`);
    const cards = purchaseBoosterPack(packType, packPrice);
    
    if (cards && cards.length > 0) {
      setOpenedCards(cards);
      setIsOpeningPack(true);
      
      // After a delay, show all cards as revealed
      setTimeout(() => {
        setAllCardsRevealed(true);
      }, 1000);
    }
  };
  
  // Handle closing the pack opening screen
  const handleClosePack = () => {
    setIsOpeningPack(false);
    setOpenedCards([]);
    setAllCardsRevealed(false);
    setPreviewCard(null);
    setShowPreview(false);
  };
  
  // Handle card preview
  const handleCardPreview = (card: Card) => {
    setPreviewCard(card);
    setShowPreview(true);
  };
  
  // Handle wallet connection
  const handleConnectWallet = () => {
    setConnectingWallet(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setWalletConnected(true);
      setConnectingWallet(false);
      toast.success(`Wallet connected successfully!`);
    }, 1500);
  };
  
  // Handle NFT purchase
  const handleNFTPurchase = (nftId: string, price: number) => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }
    
    toast.success(`NFT purchase initiated! Transaction pending...`);
    
    // Simulate transaction
    setTimeout(() => {
      toast.success(`Successfully purchased NFT! Transaction hash: 0x${Math.random().toString(16).substring(2, 10)}`);
    }, 2000);
  };
  
  // State for deck opening
  const [isOpeningDeck, setIsOpeningDeck] = useState(false);
  const [openedDeckCards, setOpenedDeckCards] = useState<Card[]>([]);
  const [selectedDeckName, setSelectedDeckName] = useState('');
  
  // Function to create a Kobar-Borah deck
  const createKobarBorahDeck = (): Card[] => {
    const avatars = kobarBorahAvatarCards.filter(card => card.level === 1);
    const level2Avatars = kobarBorahAvatarCards.filter(card => card.level === 2);
    
    const cards: Card[] = [];
    
    // Add copies of level 1 avatars (3 of each)
    avatars.forEach(avatar => {
      for (let i = 1; i <= 3; i++) {
        cards.push({...avatar, id: `${avatar.id}-${i}`});
      }
    });
    
    // Add 3 copies of each action card
    kobarBorahActionCards.forEach(action => {
      for (let i = 0; i < 3; i++) {
        cards.push({...action, id: `${action.id}-${i+1}`});
      }
    });
    
    // Also add 1 copy of each level 2 avatar for evolution possibilities
    level2Avatars.forEach(avatar => {
      cards.push({...avatar, id: `${avatar.id}-1`});
    });
    
    return cards;
  };
  
  // Function to create a Kujana-Kuhaka deck
  const createKujanaKuhakaDeck = (): Card[] => {
    const avatars = kujanaKuhakaAvatarCards.filter(card => card.level === 1);
    const level2Avatars = kujanaKuhakaAvatarCards.filter(card => card.level === 2);
    
    const cards: Card[] = [];
    
    // Add copies of level 1 avatars (3 of each)
    avatars.forEach(avatar => {
      for (let i = 1; i <= 3; i++) {
        cards.push({...avatar, id: `${avatar.id}-${i}`});
      }
    });
    
    // Add 3 copies of each action card (using kobarBorahActionCards as placeholder)
    kobarBorahActionCards.forEach(action => {
      for (let i = 0; i < 3; i++) {
        cards.push({...action, id: `${action.id}-${i+1}`});
      }
    });
    
    // Also add 1 copy of each level 2 avatar for evolution possibilities
    level2Avatars.forEach(avatar => {
      cards.push({...avatar, id: `${avatar.id}-1`});
    });
    
    return cards;
  };
  
  // Handle deck purchase
  const handleDeckPurchase = async (deck: Deck) => {
    try {
      // Check if wallet is connected
      if (!connected) {
        toast.error('Please connect your wallet to purchase decks');
        return;
      }
      
      // Get the deck cards based on the deck ID
      let deckCards: Card[] = [];
      
      if (deck.id === 'deck1') {
        // Kobar-Borah deck
        deckCards = createKobarBorahDeck();
      } else if (deck.id === 'deck2') {
        // Kujana-Kuhaka deck
        deckCards = createKujanaKuhakaDeck();
      }
      
      // Purchase the deck
      const success = purchaseDeck(deck.id, deckCards);
      
      if (success) {
        toast.success(`Successfully purchased ${deck.name}!`);
        // Update available decks by filtering out the purchased deck
        setAvailableDecks((currentDecks: Deck[]) => 
          currentDecks.filter((d: Deck) => d.id !== deck.id)
        );
      }
    } catch (error) {
      console.error('Error purchasing deck:', error);
      toast.error('Failed to purchase deck. Please try again.');
    }
  };
  
  // Handle closing the deck opening screen
  const handleCloseDeck = () => {
    setIsOpeningDeck(false);
    setOpenedDeckCards([]);
    setSelectedDeckName('');
    setPreviewCard(null);
    setShowPreview(false);
  };
  
  // Handle external NFT marketplace navigation
  const handleNFTMarketplace = () => {
    toast.info('Redirecting to Solana NFT marketplace...');
    // In a real app, this would open a new window to Magic Eden or Tensor
    window.open('https://magiceden.io/', '_blank');
  };
  
  return (
    <div className="min-h-screen p-2 sm:p-4 w-full max-w-screen-xl mx-auto" style={{ backgroundColor: '#DFE1DD', color: '#0D1A29' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold">Shop</h1>
          <p className="text-sm">Your USDC: {coins}</p>
        </div>
        
        {/* Debug buttons - only for development */}
        <div className="flex gap-2">
          <button 
            onClick={() => resetCoins()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded"
          >
            Add Coins
          </button>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Card Shop</h1>
      
      {/* Main Shop Navigation Buttons */}
      <div className="mb-8 flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-3 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Shop
          </button>
          <button
            onClick={handleNFTMarketplace}
            className="px-6 py-3 rounded-xl text-white bg-purple-600 hover:bg-purple-700 font-bold shadow-lg flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            NFT Marketplace
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setActiveTab('boosters')}
          className={`px-4 py-2 rounded-md text-white ${activeTab === 'boosters' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Booster Packs
        </button>
        <button
          onClick={() => setActiveTab('decks')}
          className={`px-4 py-2 rounded-md text-white ml-2 ${activeTab === 'decks' ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
          Premade Decks
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'boosters' ? (
        <div>
          {isOpeningPack ? (
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4 text-center text-white">Pack Opening</h2>
              
              {/* Cards display */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {openedCards.map((card, index) => (
                  <div 
                    key={index}
                    className={`bg-gray-700 rounded-lg p-2 text-center cursor-pointer transform transition-transform ${allCardsRevealed ? 'hover:scale-105' : 'hover:scale-102'}`}
                    onClick={() => handleCardPreview(card)}
                  >
                    <div className="text-sm font-bold text-white mb-1">{card.name}</div>
                    <div className="text-xs text-gray-300">{card.type}</div>
                    <div className={`text-xs mt-1 ${
                      card.rarity === 'legendary' ? 'text-yellow-400' :
                      card.rarity === 'epic' ? 'text-purple-400' :
                      card.rarity === 'rare' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : 'Common'}
                    </div>
                    {card.art && (
                      <div className="mt-2 w-full h-24 overflow-hidden">
                        <img src={card.art} alt={card.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Card Preview Modal */}
              {showPreview && previewCard && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-xl max-w-sm w-full relative">
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <h3 className="text-xl font-bold text-white mb-4">{previewCard.name}</h3>
                    
                    {previewCard.art ? (
                      <div className="w-full h-64 bg-gray-700 overflow-hidden mb-4">
                        <img 
                          src={previewCard.art} 
                          alt={previewCard.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-500">{previewCard.name.charAt(0)}</span>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white font-medium">{previewCard.type}</span>
                      </div>
                      
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Rarity:</span>
                        <span className={`font-medium ${previewCard.rarity === 'legendary' ? 'text-yellow-400' : previewCard.rarity === 'epic' ? 'text-purple-400' : previewCard.rarity === 'rare' ? 'text-blue-400' : 'text-gray-400'}`}>
                          {previewCard.rarity ? previewCard.rarity.charAt(0).toUpperCase() + previewCard.rarity.slice(1) : 'Common'}
                        </span>
                      </div>
                      
                      {previewCard.description && (
                        <div className="mt-4">
                          <p className="text-gray-300 text-sm">{previewCard.description}</p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setShowPreview(false)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
              
              {/* Close button */}
              <div className="text-center">
                <button
                  onClick={handleClosePack}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableBoosterPacks.map((pack) => (
                <div 
                  key={pack.type}
                  className="bg-gray-800 rounded-3xl p-4 mb-4 flex flex-col items-center shadow-lg hover:shadow-xl transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => handleSelectPackType(pack.type, pack.price)}
                >
                  <div className="w-32 h-40 bg-gray-700 rounded-lg overflow-hidden mb-3">
                    {pack.image ? (
                      <img 
                        src={pack.image} 
                        alt={pack.type} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                        <span className="text-2xl font-bold text-white">{pack.type.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{pack.name}</h3>
                  <p className="text-sm text-gray-300 mb-3 text-center">{pack.description}</p>
                  <div className="flex items-center bg-green-600 px-3 py-1 rounded-full text-white font-bold">
                    <span className="mr-1">💰</span>
                    <span>{pack.price} USDC</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Extra info section */}
          <div className="mt-10 bg-gray-800 p-4 rounded-3xl">
            <h2 className="text-xl font-bold mb-2 text-white">About Booster Packs</h2>
            <p className="text-gray-300 text-sm">
              Booster packs contain randomly selected cards from the corresponding card pool.
              Each pack guarantees a certain number of avatar and spell cards.
              Purchased cards are automatically added to your collection and can be used to build decks.
            </p>
          </div>
        </div>
      ) : activeTab === 'decks' && (
        <div>
          {isOpeningDeck ? (
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4 text-center text-white">{selectedDeckName} Deck</h2>
              <p className="text-gray-300 text-sm mb-4 text-center">Here are some of the cards in your new deck:</p>
              
              {/* Cards display */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {openedDeckCards.map((card, index) => (
                  <div 
                    key={index}
                    className="bg-gray-700 rounded-lg p-2 text-center cursor-pointer transform transition-transform hover:scale-105"
                    onClick={() => handleCardPreview(card)}
                  >
                    <div className="text-sm font-bold text-white mb-1">{card.name}</div>
                    <div className="text-xs text-gray-300">{card.type}</div>
                    <div className="text-xs mt-1 text-gray-400">
                      {card.type === 'avatar' ? `Level ${(card as AvatarCard).level}` : 'Spell'}
                    </div>
                    {card.art && (
                      <div className="mt-2 w-full h-24 overflow-hidden">
                        <img src={card.art} alt={card.name} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-gray-300 text-sm mb-4 text-center">...and {40 - openedDeckCards.length} more cards!</p>
              
              {/* Close button */}
              <div className="text-center">
                <button
                  onClick={handleCloseDeck}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">Premade Decks</h2>
              {availableDecks.length === 0 ? (
                <div className="bg-gray-800 p-6 rounded-xl text-center">
                  <p className="text-white mb-2">No decks available yet!</p>
                  <p className="text-gray-400 text-sm">Purchase booster packs to unlock more cards and access premade decks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableDecks.map(deck => (
              <div 
                key={deck.id}
                className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <div className="h-48 bg-gradient-to-r from-gray-900 to-gray-700 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                      <div className="text-4xl font-bold text-white opacity-30">
                        {deck.element === 'Fire' ? '🔥' : '💧'}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white text-center px-4 drop-shadow-lg">{deck.name}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4 text-gray-300 text-sm">{deck.description}</div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Cards</div>
                      <div className="font-bold text-white">{deck.cardCount}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Avatars</div>
                      <div className="font-bold text-white">{deck.avatarCount}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-2 text-center">
                      <div className="text-xs text-gray-400">Spells</div>
                      <div className="font-bold text-white">{deck.spellCount}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-white">{deck.price} <span className="text-sm">USDC</span></div>
                    <button
                      onClick={() => handleDeckPurchase(deck)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      Buy Deck
                    </button>
                  </div>
                </div>
              </div>
            ))}
              </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
