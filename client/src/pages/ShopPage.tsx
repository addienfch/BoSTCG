import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { availableBoosterPacks, BoosterPackType } from '../game/gacha/BoosterPackSystem';
import { useCollectionStore } from '../game/stores/useCollectionStore';
import { Card } from '../game/data/cardTypes';
import { AvatarCard, ActionCard } from '../game/data/cardTypes';

// Component to display a booster pack
const BoosterPackCard: React.FC<{
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  onClick: () => void;
}> = ({ id, name, description, price, image, onClick }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg p-4 flex flex-col items-center shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
      onClick={onClick}
    >
      <div className="w-32 h-40 bg-gray-700 rounded overflow-hidden mb-3">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
            <span className="text-2xl font-bold">?</span>
          </div>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
      <p className="text-xs text-gray-300 text-center mb-3">{description}</p>
      <div className="flex items-center bg-green-600 px-3 py-1 rounded-full text-white font-bold">
        <span className="mr-1">$</span>
        <span>{price}</span>
      </div>
    </div>
  );
};

// Component to display a card from a booster pack opening
const CardReveal: React.FC<{
  card: Card;
  index: number;
  isRevealed: boolean;
}> = ({ card, index, isRevealed }) => {
  const avatarCard = card.type === 'avatar' ? card as AvatarCard : null;
  const actionCard = card.type !== 'avatar' ? card as ActionCard : null;
  
  const getCardColor = () => {
    if (card.element === 'fire') return 'from-red-700 to-orange-600';
    if (card.element === 'water') return 'from-blue-700 to-cyan-600';
    if (card.element === 'earth') return 'from-green-700 to-lime-600';
    if (card.element === 'air') return 'from-sky-700 to-indigo-600';
    return 'from-purple-700 to-pink-600';
  };
  
  return (
    <div 
      className={`transition-all duration-500 ease-in-out transform ${
        isRevealed 
          ? 'scale-100 rotate-0 opacity-100' 
          : 'scale-90 rotate-12 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 300}ms` }}
    >
      <div className={`w-28 h-40 rounded-lg overflow-hidden bg-gradient-to-br ${getCardColor()} shadow-xl`}>
        <div className="p-2 h-full flex flex-col">
          <div className="text-xs font-bold bg-black bg-opacity-50 px-1 py-0.5 rounded mb-1 text-white">
            {card.name}
          </div>
          
          {card.art ? (
            <div className="h-16 bg-black bg-opacity-30 rounded overflow-hidden mb-1">
              <img src={card.art} alt={card.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-16 bg-black bg-opacity-30 rounded mb-1"></div>
          )}
          
          <div className="bg-black bg-opacity-50 p-1 rounded text-xs text-white flex-1">
            {avatarCard && (
              <div>
                <div className="flex justify-between">
                  <span>HP: {avatarCard.health}</span>
                  <span>Lv: {avatarCard.level}</span>
                </div>
                <div className="mt-1 text-[10px]">
                  Skill: {avatarCard.skill1.name}
                </div>
              </div>
            )}
            
            {actionCard && (
              <div className="text-[10px]">
                {actionCard.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Shop page component
const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  const { coins, purchaseBoosterPack } = useCollectionStore();
  
  // State for pack opening
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [allCardsRevealed, setAllCardsRevealed] = useState(false);
  
  // State for pack selection animation
  const [selectedPackType, setSelectedPackType] = useState<BoosterPackType | null>(null);
  const [packOptions, setPackOptions] = useState<number[]>([]);
  const [selectedPackIndex, setSelectedPackIndex] = useState<number | null>(null);
  
  // Handle booster pack purchase - first step: select pack type
  const handleSelectPackType = (packType: BoosterPackType, packPrice: number) => {
    // Check if player has enough coins
    if (coins < packPrice) {
      toast.error(`Not enough coins! You need ${packPrice} coins.`);
      return;
    }
    
    // Start the pack selection animation
    setSelectedPackType(packType);
    
    // Generate 10 random pack options
    setPackOptions(Array.from({length: 10}, (_, i) => i + 1));
    setSelectedPackIndex(null);
  };
  
  // Handle pack selection from the grid
  const handleSelectPackFromGrid = (index: number) => {
    // Animate selection
    setSelectedPackIndex(index);
    
    // Start the pack opening process after a delay
    setTimeout(() => {
      if (!selectedPackType) return;
      
      // Find the pack info
      const packInfo = availableBoosterPacks.find(p => p.type === selectedPackType);
      if (!packInfo) return;
      
      // Start the pack opening animation
      setIsOpeningPack(true);
      setAllCardsRevealed(false);
      setOpenedCards([]);
      
      // Purchase the pack
      setTimeout(() => {
        const cards = purchaseBoosterPack(selectedPackType, packInfo.price);
        
        if (cards) {
          // Show the cards one by one
          setOpenedCards(cards);
          
          // After all cards are revealed, set the state
          setTimeout(() => {
            setAllCardsRevealed(true);
          }, cards.length * 300 + 500);
        } else {
          // Failed to purchase pack
          setIsOpeningPack(false);
          setSelectedPackType(null);
        }
      }, 1000);
    }, 1500);
  };
  
  // Handle closing the pack opening screen
  const handleClosePack = () => {
    setIsOpeningPack(false);
    setOpenedCards([]);
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
        <div className="flex items-center bg-green-700 px-4 py-2 rounded-md shadow-md">
          <span className="mr-2">$</span>
          <span className="font-bold">{coins}</span>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 text-center">Card Shop</h1>
      
      {/* Pack opening modal */}
      {isOpeningPack && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">Opening Booster Pack</h2>
            
            {openedCards.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {openedCards.map((card, index) => (
                  <CardReveal 
                    key={index} 
                    card={card} 
                    index={index} 
                    isRevealed={true} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="animate-pulse bg-gray-700 w-32 h-40 rounded-lg"></div>
              </div>
            )}
            
            {allCardsRevealed && (
              <button
                onClick={handleClosePack}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Pack type selection (initial view) */}
      {!selectedPackType && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {availableBoosterPacks.map((pack) => (
            <BoosterPackCard
              key={pack.id}
              id={pack.id}
              name={pack.name}
              description={pack.description}
              price={pack.price}
              image={pack.image}
              onClick={() => handleSelectPackType(pack.type, pack.price)}
            />
          ))}
        </div>
      )}
      
      {/* Pack selection grid (after selecting pack type) */}
      {selectedPackType && !isOpeningPack && (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Choose Your Mystery Pack!</h2>
            <p className="text-gray-300 mb-6">Select one of the packs below to reveal your cards</p>
            
            {/* Pack type info */}
            {(() => {
              const packInfo = availableBoosterPacks.find(p => p.type === selectedPackType);
              return packInfo && (
                <div className="bg-gray-800 p-3 rounded-lg inline-block mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-16 mr-3">
                      <img src={packInfo.image} alt={packInfo.name} className="w-full h-full object-cover rounded" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold">{packInfo.name}</h3>
                      <div className="text-sm text-gray-300">Price: <span className="text-yellow-500">{packInfo.price} 🪙</span></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
          
          <div className="grid grid-cols-5 grid-rows-2 gap-4 mb-8">
            {packOptions.map((num, index) => {
              const packInfo = availableBoosterPacks.find(p => p.type === selectedPackType);
              return (
                <div
                  key={index}
                  onClick={() => selectedPackIndex === null && handleSelectPackFromGrid(index)}
                  className={`relative cursor-pointer transform transition-all duration-300 ${
                    selectedPackIndex === index 
                      ? 'scale-110 z-10' 
                      : selectedPackIndex !== null 
                        ? 'opacity-50 scale-95' 
                        : 'hover:scale-105'
                  }`}
                >
                  <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg h-40">
                    <div 
                      className="h-full bg-center bg-cover flex items-center justify-center"
                      style={{ backgroundImage: `url(${packInfo?.image})` }}
                    >
                      <div className="bg-black bg-opacity-60 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                        {num}
                      </div>
                    </div>
                  </div>
                  
                  {/* Animation effect for selected pack */}
                  {selectedPackIndex === index && (
                    <div className="absolute inset-0 bg-yellow-500 bg-opacity-20 rounded-lg animate-pulse"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setSelectedPackType(null)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Go Back
            </button>
          </div>
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
  );
};

export default ShopPage;