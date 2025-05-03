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
  const EmptyZoneBlue = ({ name, count }: { name: string, count?: number }) => (
    <div className="border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center text-center p-2 aspect-[2/3] w-full relative">
      <span className="text-xs text-white opacity-90 transform rotate-180">{name}</span>
      {count !== undefined && (
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded-tr">
          {count}
        </div>
      )}
    </div>
  );
  
  const EmptyZoneRed = ({ name, count }: { name: string, count?: number }) => (
    <div className="border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center text-center p-2 aspect-[2/3] w-full relative">
      <span className="text-xs text-white opacity-90">{name}</span>
      {count !== undefined && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-bl">
          {count}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 p-2 overflow-auto">
      {/* Top section - Opponent area */}
      <div className="flex flex-row mb-4 p-2">
        {/* Left side - Grave, Deck, Life */}
        <div className="flex flex-col gap-2 w-1/6">
          <div className="relative">
            <EmptyZoneBlue name="Grave" count={0} />
          </div>
          <div className="relative">
            <EmptyZoneBlue name="Deck" count={15} />
          </div>
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-1 aspect-square relative">
            <div className="text-xs text-center text-blue-300">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Middle - Reserve Avatars */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-8">
            <div className="w-1/5">
              <EmptyZoneBlue name="Reserve" />
            </div>
            <div className="w-1/5">
              <EmptyZoneBlue name="Reserve" />
            </div>
          </div>
        </div>
        
        {/* Right side - Energy */}
        <div className="flex flex-col gap-2 w-1/6 items-end">
          <div className="relative w-full">
            <EmptyZoneBlue name="Used Energy" count={2} />
          </div>
          <div className="relative w-full">
            <EmptyZoneBlue name="Energy Pile" count={3} />
          </div>
        </div>
      </div>
      
      {/* Opponent Avatar Card */}
      <div className="flex justify-center mb-4">
        <div className="aspect-[2/3] w-24 border-4 border-blue-600 rounded-lg relative">
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
      </div>
      
      {/* Shared Field Card Area */}
      <div className="flex justify-center mb-4">
        <div className="aspect-[5/2] border-2 border-dashed border-gray-500 rounded-lg px-4 py-2 flex items-center justify-center w-56">
          <span className="text-white text-center font-bold uppercase transform rotate-90">FIELD</span>
        </div>
      </div>
      
      {/* Player Avatar Card */}
      <div className="flex justify-center mb-4">
        <div className="aspect-[2/3] w-24 border-4 border-red-600 rounded-lg relative">
          {playerCards.some(card => card.type === 'avatar') ? (
            <Card2D 
              card={playerCards.find(card => card.type === 'avatar') as CardData} 
              isPlayable={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">Fire Avatar</span>
              <div className="absolute top-0 left-0 bg-yellow-500 text-black font-bold text-xs px-1 rounded-br">1</div>
              <div className="absolute bottom-2 flex justify-center gap-2 w-full">
                <div className="bg-red-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">3</div>
                <div className="bg-blue-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">5</div>
                <div className="bg-purple-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">7</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom section - Player area */}
      <div className="flex flex-row mb-4 p-2">
        {/* Left side - Energy */}
        <div className="flex flex-col gap-2 w-1/6">
          <div className="relative">
            <EmptyZoneRed name="Energy Pile" count={4} />
          </div>
          <div className="relative">
            <EmptyZoneRed name="Used Energy" count={1} />
          </div>
        </div>
        
        {/* Middle - Reserve Avatars */}
        <div className="flex-1 flex justify-center">
          <div className="flex gap-8">
            <div className="w-1/5">
              <EmptyZoneRed name="Reserve" />
            </div>
            <div className="w-1/5">
              <EmptyZoneRed name="Reserve" />
            </div>
          </div>
        </div>
        
        {/* Right side - Life, Deck, Grave */}
        <div className="flex flex-col gap-2 w-1/6 items-end">
          <div className="border-2 border-dashed border-red-400 rounded-lg p-1 aspect-square w-full relative">
            <div className="text-xs text-center text-red-300">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
            </div>
          </div>
          <div className="relative w-full">
            <EmptyZoneRed name="Deck" count={20} />
          </div>
          <div className="relative w-full">
            <EmptyZoneRed name="Grave" count={2} />
          </div>
        </div>
      </div>
      
      {/* Player Hand - Smaller card size */}
      <div className="bg-black bg-opacity-30 p-2 rounded-lg mt-2">
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