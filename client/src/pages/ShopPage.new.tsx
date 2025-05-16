import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { availableBoosterPacks, BoosterPackType } from '../game/gacha/BoosterPackSystem';
import { useCollectionStore } from '../game/stores/useCollectionStore';
import { Card } from '../game/data/cardTypes';
import { AvatarCard, ActionCard } from '../game/data/cardTypes';

// Shop page component with tabs
const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { coins, purchaseBoosterPack, resetCoins } = useCollectionStore();
  
  // State for active tab
  const [activeTab, setActiveTab] = useState<'boosters' | 'nft'>('boosters');
  
  // State for pack opening
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [allCardsRevealed, setAllCardsRevealed] = useState(false);
  
  // State for card preview
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  
  // State for pack selection animation
  const [selectedPackType, setSelectedPackType] = useState<BoosterPackType | null>(null);
  const [packOptions, setPackOptions] = useState<number[]>([]);
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null);
  
  // NFT Marketplace state
  const [connectingWallet, setConnectingWallet] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  
  // Mock NFT data
  const mockNFTs = [
    { id: 'nft1', name: 'Legendary Avatar', price: 0.5, rarity: 'Legendary', image: '/attached_assets/Red Elemental Avatar_Ava - Radja.png' },
    { id: 'nft2', name: 'Epic Spell Card', price: 0.2, rarity: 'Epic', image: '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png' },
    { id: 'nft3', name: 'Rare Equipment', price: 0.1, rarity: 'Rare', image: '/attached_assets/Red Elemental Avatar_Ava - Radja.png' },
    { id: 'nft4', name: 'Common Item', price: 0.05, rarity: 'Common', image: '/attached_assets/Red Elemental Avatar_Ava - Boar Witch.png' },
  ];
  
  // Handle booster pack purchase
  const handleSelectPackType = (packType: BoosterPackType, packPrice: number) => {
    // Check if player has enough coins
    if (coins < packPrice) {
      toast.error(`Not enough coins! You need ${packPrice} coins.`);
      return;
    }
    
    toast.success(`Purchased ${packType} pack for ${packPrice} coins!`);
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
  };
  
  // Handle wallet connection
  const handleConnectWallet = () => {
    setConnectingWallet(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      setConnectingWallet(false);
      toast.success(`Wallet connected: ${mockAddress.substring(0, 6)}...${mockAddress.substring(38)}`);
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
  
  return (
    <div className="bg-gray-900 min-h-screen text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-md"
        >
          Back to Home
        </button>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-green-700 px-4 py-2 rounded-md shadow-md">
            <span className="mr-2">$</span>
            <span className="font-bold">{coins.toLocaleString()}</span>
          </div>
          <button 
            onClick={resetCoins}
            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-md shadow-md text-sm"
          >
            Reset Coins
          </button>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Card Shop</h1>
      
      {/* Tab navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-800 rounded-lg p-1 inline-flex">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'boosters' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('boosters')}
          >
            Booster Packs
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'nft' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            onClick={() => setActiveTab('nft')}
          >
            NFT Marketplace
          </button>
        </div>
      </div>
      
      {/* Booster Packs Tab */}
      {activeTab === 'boosters' && (
        <div>
          {isOpeningPack ? (
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md mx-auto">
              <h2 className="text-xl font-bold mb-4 text-center">Opening Booster Pack</h2>
              
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {openedCards.map((card, index) => (
                  <div 
                    key={index}
                    className="w-28 h-40 rounded-lg overflow-hidden bg-gradient-to-br from-purple-700 to-pink-600 shadow-xl"
                  >
                    <div className="p-2 h-full flex flex-col">
                      <div className="text-xs font-bold bg-black bg-opacity-50 px-1 py-0.5 rounded mb-1 text-white truncate">
                        {card.name}
                      </div>
                      
                      {card.art && (
                        <div className="h-16 bg-black bg-opacity-30 rounded overflow-hidden mb-1">
                          <img 
                            src={card.art} 
                            alt={card.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="bg-black bg-opacity-50 p-1 rounded text-xs text-white flex-1">
                        {card.type === 'avatar' ? (
                          <div>
                            <div className="flex justify-between">
                              <span>HP: {(card as AvatarCard).health}</span>
                              <span>Lv: {(card as AvatarCard).level}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px]">
                            {(card as ActionCard).description || "Special card effect"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {allCardsRevealed && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleClosePack}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableBoosterPacks.map((pack) => (
                <div 
                  key={pack.id}
                  className="bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleSelectPackType(pack.type, pack.price)}
                >
                  <div className="w-32 h-40 bg-gray-700 rounded overflow-hidden mb-3">
                    {pack.image ? (
                      <img 
                        src={pack.image} 
                        alt={pack.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
                        <span className="text-2xl font-bold">?</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{pack.name}</h3>
                  <p className="text-xs text-gray-300 text-center mb-3">{pack.description}</p>
                  <div className="flex items-center bg-green-600 px-3 py-1 rounded-full text-white font-bold">
                    <span className="mr-1">$</span>
                    <span>{pack.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Extra info section */}
          <div className="mt-10 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">About Booster Packs</h2>
            <p className="text-gray-300 text-sm">
              Booster packs contain randomly selected cards from the corresponding card pool.
              Each pack guarantees a certain number of avatar and spell cards.
              Purchased cards are automatically added to your collection and can be used to build decks.
            </p>
          </div>
        </div>
      )}
      
      {/* NFT Marketplace Tab */}
      {activeTab === 'nft' && (
        <div>
          {/* Wallet connection */}
          <div className="mb-6 bg-gray-800 p-4 rounded-lg">
            {!walletConnected ? (
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-4 text-center">
                  Connect your crypto wallet to buy, sell, and trade NFT cards on the marketplace.
                </p>
                <button
                  onClick={handleConnectWallet}
                  disabled={connectingWallet}
                  className={`bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg font-bold ${connectingWallet ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {connectingWallet ? 'Connecting...' : 'Connect Wallet'}
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold">Wallet Connected</h2>
                  <p className="text-gray-300 text-sm">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </p>
                </div>
                <button
                  onClick={() => setWalletConnected(false)}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
          
          {/* NFT cards */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Featured NFT Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockNFTs.map((nft) => (
                <div 
                  key={nft.id}
                  className="bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    if (walletConnected) {
                      handleNFTPurchase(nft.id, nft.price);
                    } else {
                      toast.error("Please connect your wallet first!");
                    }
                  }}
                >
                  <div className="w-32 h-40 bg-gray-700 rounded overflow-hidden mb-3">
                    {nft.image ? (
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                        <span className="text-2xl font-bold">NFT</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{nft.name}</h3>
                  <div className="mb-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      nft.rarity === 'Legendary' ? 'bg-yellow-600' : 
                      nft.rarity === 'Epic' ? 'bg-purple-600' : 
                      nft.rarity === 'Rare' ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      {nft.rarity}
                    </span>
                  </div>
                  <div className="flex items-center bg-green-600 px-3 py-1 rounded-full text-white font-bold">
                    <span className="mr-1">ETH</span>
                    <span>{nft.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* NFT info section */}
          <div className="mt-10 bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">About NFT Cards</h2>
            <p className="text-gray-300 text-sm">
              NFT cards are unique digital collectibles that you truly own on the blockchain.
              These cards can be traded on the marketplace or used in-game for special bonuses.
              Each NFT card has a limited supply and varying rarity levels.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
