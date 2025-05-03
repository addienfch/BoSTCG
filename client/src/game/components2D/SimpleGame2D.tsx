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

  // Empty placeholder card for zones - updated to match the screenshot
  const EmptyZone = ({ name, color, count }: { name: string, color: string, count?: number }) => (
    <div className={`border-2 border-dashed ${color} rounded-lg flex items-center justify-center text-center p-2 aspect-[2/3] w-full relative`}>
      <span className="text-sm text-white opacity-70">{name}</span>
      {count !== undefined && (
        <div className={`absolute top-0 right-0 ${color.includes('blue') ? 'bg-blue-600' : 'bg-red-600'} text-white text-xs px-1 rounded-bl`}>
          {count}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 p-2 overflow-auto">
      {/* Top section - More compact alignment */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Left column - Graveyard with Reserve aligned horizontally */}
        <div className="flex justify-between items-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Grave" color="border-blue-500" count={0} />
          </div>
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Reserve" color="border-blue-500" />
          </div>
        </div>
        
        {/* Middle column - Life and Active Avatar aligned */}
        <div className="flex flex-col items-center">
          <div className="aspect-[2/3] w-[70px] border-4 border-blue-600 rounded-lg relative mb-2">
            <div className="rotate-180 w-full h-full">
              {opponentCards.length > 0 && opponentCards[0].type === 'avatar' ? (
                <Card2D 
                  card={opponentCards[0]} 
                  isPlayable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Air Element</span>
                </div>
              )}
            </div>
          </div>
          <div className="border-2 border-dashed border-blue-500 rounded-lg p-1 aspect-square w-[60px]">
            <div className="text-[10px] text-center text-blue-300 mb-1">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Right column - Deck and Energy Pile aligned */}
        <div className="flex justify-between items-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Energy" color="border-blue-500" count={3} />
          </div>
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Deck" color="border-blue-500" count={15} />
          </div>
        </div>
      </div>
      
      {/* More Top row elements - Used Energy and second Reserve */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex justify-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Used Energy" color="border-blue-500" count={2} />
          </div>
        </div>
        <div className="flex justify-center">
          {/* Field Card */}
          <div className="aspect-[2/3] w-[60px] border-2 border-dashed border-blue-500 rounded-lg relative">
            <EmptyZone name="Field" color="border-blue-500" />
          </div>
        </div>
        <div className="flex justify-end">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Reserve" color="border-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Battlefield divider */}
      <div className="border-t-2 border-b-2 border-white border-opacity-20 py-1 mb-4">
        <div className="text-center font-bold text-white">BATTLEFIELD</div>
      </div>
      
      {/* Bottom row elements - Player Field and second Reserve */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="flex justify-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Reserve" color="border-red-500" />
          </div>
        </div>
        <div className="flex justify-center">
          {/* Field Card */}
          <div className="aspect-[2/3] w-[60px] border-2 border-dashed border-red-500 rounded-lg relative">
            {fieldCard ? (
              <Card2D 
                card={fieldCard} 
                isPlayable={true}
              />
            ) : (
              <EmptyZone name="Field" color="border-red-500" />
            )}
          </div>
        </div>
        <div className="flex justify-end">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Used Energy" color="border-red-500" count={1} />
          </div>
        </div>
      </div>
      
      {/* Bottom section - More compact alignment */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Left column - Graveyard with Reserve aligned horizontally */}
        <div className="flex justify-between items-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Grave" color="border-red-500" count={2} />
          </div>
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Reserve" color="border-red-500" />
          </div>
        </div>
        
        {/* Middle column - Life and Active Avatar aligned */}
        <div className="flex flex-col items-center">
          <div className="border-2 border-dashed border-red-500 rounded-lg p-1 aspect-square w-[60px] mb-2">
            <div className="text-[10px] text-center text-red-300 mb-1">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
            </div>
          </div>
          <div className="aspect-[2/3] w-[70px] border-4 border-red-600 rounded-lg relative">
            {playerCards.some(card => card.type === 'avatar') ? (
              <Card2D 
                card={playerCards.find(card => card.type === 'avatar') as CardData} 
                isPlayable={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">Fire Avatar</span>
                <div className="absolute top-0 left-0 bg-yellow-500 text-black font-bold text-[8px] p-1 rounded-br">1</div>
                <div className="absolute bottom-2 flex justify-center gap-2 w-full">
                  <div className="bg-red-700 text-white text-[8px] rounded-full w-5 h-5 flex items-center justify-center">3</div>
                  <div className="bg-blue-700 text-white text-[8px] rounded-full w-5 h-5 flex items-center justify-center">5</div>
                  <div className="bg-purple-700 text-white text-[8px] rounded-full w-5 h-5 flex items-center justify-center">7</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right column - Deck and Energy Pile aligned */}
        <div className="flex justify-between items-start">
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Energy" color="border-red-500" count={4} />
          </div>
          <div className="aspect-[2/3] w-[60px] relative">
            <EmptyZone name="Deck" color="border-red-500" count={20} />
          </div>
        </div>
      </div>
      
      {/* Player Hand - Smaller card size */}
      <div className="bg-black bg-opacity-30 p-2 rounded-lg">
        <div className="text-white text-xs mb-1">Your Hand ({playerCards.length})</div>
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {playerCards.map((card, index) => (
            <div key={index} style={{ minWidth: '80px', maxWidth: '80px' }} className="transform hover:scale-105 transition-transform">
              <Card2D 
                card={card} 
                isPlayable={true} 
                isInHand={true}
                onAction={(action) => handleCardAction(card, action)}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Game controls */}
      <div className="mt-2 p-1 bg-slate-800 rounded-lg">
        <div className="grid grid-cols-4 gap-1">
          <button className="p-1 bg-yellow-700 text-white rounded text-sm font-bold hover:bg-yellow-600">
            Draw Card
          </button>
          <button className="p-1 bg-red-700 text-white rounded text-sm font-bold hover:bg-red-600">
            Main Phase 1
          </button>
          <button className="p-1 bg-purple-700 text-white rounded text-sm font-bold hover:bg-purple-600">
            Battle Phase
          </button>
          <button className="p-1 bg-blue-700 text-white rounded text-sm font-bold hover:bg-blue-600">
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGame2D;