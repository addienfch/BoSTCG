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
      {/* Opponent area - Top section - Matching screenshot exactly */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left column - Opponent grave, deck, life cards */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Grave" color="border-blue-500" count={0} />
          </div>
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Deck" color="border-blue-500" count={15} />
          </div>
          <div className="border-2 border-dashed border-blue-500 rounded-lg p-2 aspect-square">
            <div className="text-xs text-center text-blue-300 mb-1">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Middle column - Opponent reserve avatars */}
        <div className="col-span-6 grid grid-cols-2 gap-4">
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Reserve" color="border-blue-500" />
          </div>
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Reserve" color="border-blue-500" />
          </div>
        </div>
        
        {/* Right column - Opponent energy piles */}
        <div className="col-span-3 flex flex-col gap-4 justify-end">
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Used Energy" color="border-blue-500" count={2} />
          </div>
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Energy Pile" color="border-blue-500" count={3} />
          </div>
        </div>
      </div>
      
      {/* Opponent Active Avatar - Centered and rotated as in screenshot */}
      <div className="flex justify-center mb-8">
        <div className="aspect-[2/3] w-[140px] border-4 border-blue-600 rounded-lg relative">
          <div className="rotate-180 w-full h-full">
            {opponentCards.length > 0 && opponentCards[0].type === 'avatar' ? (
              <Card2D 
                card={opponentCards[0]} 
                isPlayable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-bold">Air Element</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Battlefield divider */}
      <div className="border-t-2 border-b-2 border-white border-opacity-20 py-1 mb-8">
        <div className="text-center font-bold text-white">BATTLEFIELD</div>
      </div>
      
      {/* Player Active Avatar - Centered as in screenshot */}
      <div className="flex justify-center mb-8">
        <div className="aspect-[2/3] w-[140px] border-4 border-red-600 rounded-lg relative">
          {playerCards.some(card => card.type === 'avatar') ? (
            <Card2D 
              card={playerCards.find(card => card.type === 'avatar') as CardData} 
              isPlayable={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white font-bold">Fire Avatar</span>
              <div className="absolute top-0 left-0 bg-yellow-500 text-black font-bold text-xs p-1 rounded-br">1</div>
              <div className="absolute bottom-4 flex justify-center gap-4 w-full">
                <div className="bg-red-700 text-white text-xs p-1 rounded-full w-8 h-8 flex items-center justify-center">3</div>
                <div className="bg-blue-700 text-white text-xs p-1 rounded-full w-8 h-8 flex items-center justify-center">5</div>
                <div className="bg-purple-700 text-white text-xs p-1 rounded-full w-8 h-8 flex items-center justify-center">7</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Player area - Bottom section - Matching screenshot exactly */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left column - Player energy piles */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Energy Pile" color="border-red-500" count={4} />
          </div>
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Used Energy" color="border-red-500" count={1} />
          </div>
        </div>
        
        {/* Middle column - Player reserve avatars */}
        <div className="col-span-6 grid grid-cols-2 gap-4">
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Reserve" color="border-red-500" />
          </div>
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Reserve" color="border-red-500" />
          </div>
        </div>
        
        {/* Right column - Player life, deck, grave */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="border-2 border-dashed border-red-500 rounded-lg p-2 aspect-square">
            <div className="text-xs text-center text-red-300 mb-1">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
            </div>
          </div>
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Deck" color="border-red-500" count={20} />
          </div>
          <div className="aspect-[2/3] w-full relative">
            <EmptyZone name="Grave" color="border-red-500" count={2} />
          </div>
        </div>
      </div>
      
      {/* Player Hand */}
      <div className="bg-black bg-opacity-30 p-2 rounded-lg">
        <div className="text-white text-xs mb-1">Your Hand ({playerCards.length})</div>
        <div className="flex justify-center gap-2 overflow-x-auto pb-2">
          {playerCards.map((card, index) => (
            <div key={index} style={{ minWidth: '120px', maxWidth: '120px' }} className="transform hover:scale-105 transition-transform">
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