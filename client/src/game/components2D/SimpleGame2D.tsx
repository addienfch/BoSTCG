import React from 'react';
import Card2D from './Card2D';
import { CardData } from '../components/Card';
import { toast } from 'sonner';

interface SimpleGame2DProps {
  playerCards: CardData[];
  opponentCards?: CardData[];
  fieldCard?: CardData;
}

const SimpleGame2D: React.FC<SimpleGame2DProps> = ({ 
  playerCards, 
  opponentCards = [],
  fieldCard
}) => {
  // Handle card actions (avatar placement, energy, etc)
  const handleCardAction = (card: CardData, action: string) => {
    switch(action) {
      case 'active':
        toast.success(`${card.name} played as active avatar`);
        break;
      case 'reserve':
        toast.success(`${card.name} placed in reserve`);
        break;
      case 'energy':
        toast.success(`${card.name} used as energy`);
        break;
      default:
        toast.info(`${card.name} action: ${action}`);
    }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-slate-900">
      {/* TOP HALF - OPPONENT BOARD */}
      <div className="h-1/2 w-full relative">
        {/* Top row: Grave, Deck, Life (Left) + 2x Reserve (Center) + Energy Used, Energy Pile (Right) */}
        
        {/* LEFT SIDE ZONES */}
        {/* Grave */}
        <div className="absolute left-[6%] top-[8%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Grave</span>
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
              0
            </div>
          </div>
        </div>
        
        {/* Deck */}
        <div className="absolute left-[6%] top-[37%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Deck</span>
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
              15
            </div>
          </div>
        </div>
        
        {/* Life */}
        <div className="absolute left-[6%] top-[66%] w-[12%] h-[21%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg p-1 flex flex-col items-center transform rotate-180">
            <div className="text-xs text-center text-blue-300">Life</div>
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="border border-blue-300 rounded"></div>
              <div className="border border-blue-300 rounded"></div>
              <div className="border border-blue-300 rounded"></div>
              <div className="border border-blue-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* CENTER ZONES */}
        {/* Reserve 1 */}
        <div className="absolute left-[35%] top-[20%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Reserve</span>
          </div>
        </div>
        
        {/* Reserve 2 */}
        <div className="absolute left-[53%] top-[20%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Reserve</span>
          </div>
        </div>
        
        {/* RIGHT SIDE ZONES */}
        {/* Used Energy */}
        <div className="absolute right-[6%] top-[35%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Used Energy</span>
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
              2
            </div>
          </div>
        </div>
        
        {/* Energy Pile */}
        <div className="absolute right-[6%] top-[64%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center transform rotate-180">
            <span className="text-xs text-white opacity-70">Energy Pile</span>
            <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
              3
            </div>
          </div>
        </div>
        
        {/* AVATAR ZONE */}
        <div className="absolute left-[43%] top-[50%] w-[14%] h-[42%]">
          <div className="w-full h-full border-4 border-blue-600 rounded-lg flex items-center justify-center bg-blue-800 bg-opacity-30">
            <div className="transform rotate-180 w-full h-full">
              {opponentCards.length > 0 && opponentCards[0].type === 'avatar' ? (
                <Card2D 
                  card={opponentCards[0]} 
                  isPlayable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center flex-col">
                  <span className="text-white text-sm font-bold">Air Element</span>
                  <div className="absolute top-3 left-2 bg-yellow-500 text-black font-bold text-xs px-1 rounded-br">1</div>
                  <div className="absolute bottom-6 flex justify-center gap-2 w-full">
                    <div className="bg-blue-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">2</div>
                    <div className="bg-red-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">5</div>
                    <div className="bg-purple-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">6</div>
                  </div>
                  <div className="absolute bottom-0 px-2 py-1 w-full">
                    <p className="text-xs text-blue-300 text-center">Powerful air element with ability to fly.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* FIELD ZONES IN MIDDLE */}
      <div className="absolute left-[28%] top-[35%] w-[18%] h-[27%]">
        <div className="w-full h-full border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center bg-gray-900 bg-opacity-50">
          <span className="text-white font-bold text-2xl transform rotate-180">FIELD</span>
        </div>
      </div>
      
      <div className="absolute right-[28%] top-[48%] w-[18%] h-[27%]">
        <div className="w-full h-full border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center bg-gray-900 bg-opacity-50">
          <span className="text-white font-bold text-2xl">FIELD</span>
        </div>
      </div>
      
      {/* BOTTOM HALF - PLAYER BOARD */}
      <div className="h-1/2 w-full relative">
        {/* Left side: Energy Pile, Used Energy */}
        <div className="absolute left-[6%] top-[10%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Energy Pile</span>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
              4
            </div>
          </div>
        </div>
        
        <div className="absolute left-[6%] top-[39%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Used Energy</span>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
              1
            </div>
          </div>
        </div>
        
        {/* Active Avatar */}
        <div className="absolute left-[43%] top-[8%] w-[14%] h-[42%]">
          <div className="w-full h-full border-4 border-red-600 rounded-lg flex items-center justify-center bg-red-800 bg-opacity-30">
            {playerCards.some(card => card.type === 'avatar') ? (
              <Card2D 
                card={playerCards.find(card => card.type === 'avatar') as CardData} 
                isPlayable={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col">
                <span className="text-white text-sm font-bold">Fire Avatar</span>
                <div className="absolute top-1 left-2 bg-yellow-500 text-black font-bold text-xs px-1 rounded-br">1</div>
                <div className="absolute bottom-6 flex justify-center gap-2 w-full">
                  <div className="bg-red-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">3</div>
                  <div className="bg-blue-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">5</div>
                  <div className="bg-purple-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">7</div>
                </div>
                <div className="absolute bottom-0 px-2 py-1 w-full">
                  <p className="text-xs text-red-300 text-center">A powerful fire avatar with strong stats.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Reserve zones */}
        <div className="absolute left-[35%] top-[55%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Reserve</span>
          </div>
        </div>
        
        <div className="absolute left-[53%] top-[55%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Reserve</span>
          </div>
        </div>
        
        {/* Right side: Life, Deck, Grave */}
        <div className="absolute right-[6%] top-[10%] w-[12%] h-[21%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg p-1 flex flex-col items-center">
            <div className="text-xs text-center text-red-300">Life</div>
            <div className="grid grid-cols-2 gap-1 w-full h-full mt-1">
              <div className="border border-red-300 rounded"></div>
              <div className="border border-red-300 rounded"></div>
              <div className="border border-red-300 rounded"></div>
              <div className="border border-red-300 rounded"></div>
            </div>
          </div>
        </div>
        
        <div className="absolute right-[6%] top-[35%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Deck</span>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
              20
            </div>
          </div>
        </div>
        
        <div className="absolute right-[6%] top-[64%] w-[12%] h-[25%]">
          <div className="w-full h-full border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center">
            <span className="text-xs text-white opacity-70">Grave</span>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
              2
            </div>
          </div>
        </div>
      </div>
      
      {/* Player Hand */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 p-2">
        <div className="text-white text-xs mb-1">Your Hand ({playerCards.length})</div>
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {playerCards.map((card, index) => (
            <div key={index} style={{ minWidth: '70px', maxWidth: '70px' }} className="transform hover:scale-110 transition-transform">
              <Card2D 
                card={card} 
                isPlayable={true} 
                isInHand={true}
                onAction={(action) => handleCardAction(card, action)}
              />
            </div>
          ))}
        </div>
        
        {/* Game controls */}
        <div className="mt-2 grid grid-cols-4 gap-1">
          <button className="p-1 bg-yellow-700 text-white rounded text-xs font-bold hover:bg-yellow-600">
            Draw Card
          </button>
          <button className="p-1 bg-red-700 text-white rounded text-xs font-bold hover:bg-red-600">
            Main Phase 1
          </button>
          <button className="p-1 bg-purple-700 text-white rounded text-xs font-bold hover:bg-purple-600">
            Battle Phase
          </button>
          <button className="p-1 bg-blue-700 text-white rounded text-xs font-bold hover:bg-blue-600">
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGame2D;