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

  // Empty placeholder card for zones - exactly matching the screenshot
  const EmptyZoneBlue = ({ name, count }: { name: string, count?: number }) => (
    <div className="border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center text-center p-1 aspect-[2/3] w-full relative">
      <span className="text-xs text-white opacity-70 transform rotate-180">{name}</span>
      {count !== undefined && (
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 rounded">
          {count}
        </div>
      )}
    </div>
  );
  
  const EmptyZoneRed = ({ name, count }: { name: string, count?: number }) => (
    <div className="border-2 border-dashed border-red-400 rounded-lg flex items-center justify-center text-center p-1 aspect-[2/3] w-full relative">
      <span className="text-xs text-white opacity-70">{name}</span>
      {count !== undefined && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded">
          {count}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col bg-slate-900 p-4 overflow-auto">
      <div className="w-full flex">
        {/* Left section - Top row */}
        <div className="w-1/4 flex flex-col space-y-2 pr-4">
          <div className="w-full relative">
            <EmptyZoneBlue name="Grave" count={0} />
          </div>
          <div className="w-full relative">
            <EmptyZoneBlue name="Deck" count={15} />
          </div>
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-1 aspect-square w-full relative">
            <div className="text-xs text-center text-blue-300">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Center section - Top row */}
        <div className="w-1/2 flex flex-col items-center">
          <div className="flex justify-center space-x-12 mb-4">
            <div className="w-20">
              <EmptyZoneBlue name="Reserve" />
            </div>
            <div className="w-20">
              <EmptyZoneBlue name="Reserve" />
            </div>
          </div>
          
          {/* Opponent Active Avatar */}
          <div className="w-28 border-4 border-blue-600 rounded-lg aspect-[2/3] mb-4">
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
        
        {/* Right section - Top row */}
        <div className="w-1/4 flex flex-col space-y-2 justify-end pl-4">
          <div className="w-full relative">
            <EmptyZoneBlue name="Used Energy" count={2} />
          </div>
          <div className="w-full relative">
            <EmptyZoneBlue name="Energy Pile" count={3} />
          </div>
        </div>
      </div>
      
      {/* Field card in center */}
      <div className="w-full flex justify-center my-8">
        <div className="w-56 h-28 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm font-bold transform rotate-90">FIELD</span>
        </div>
      </div>
      
      <div className="w-full flex">
        {/* Left section - Bottom row */}
        <div className="w-1/4 flex flex-col space-y-2 pr-4">
          <div className="w-full relative">
            <EmptyZoneRed name="Energy Pile" count={4} />
          </div>
          <div className="w-full relative">
            <EmptyZoneRed name="Used Energy" count={1} />
          </div>
        </div>
        
        {/* Center section - Bottom row */}
        <div className="w-1/2 flex flex-col items-center">
          {/* Player Active Avatar */}
          <div className="w-28 border-4 border-red-600 rounded-lg aspect-[2/3] mb-4">
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
          
          <div className="flex justify-center space-x-12">
            <div className="w-20">
              <EmptyZoneRed name="Reserve" />
            </div>
            <div className="w-20">
              <EmptyZoneRed name="Reserve" />
            </div>
          </div>
        </div>
        
        {/* Right section - Bottom row */}
        <div className="w-1/4 flex flex-col space-y-2 pl-4">
          <div className="border-2 border-dashed border-red-400 rounded-lg p-1 aspect-square w-full relative">
            <div className="text-xs text-center text-red-300">Life</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
            </div>
          </div>
          <div className="w-full relative">
            <EmptyZoneRed name="Deck" count={20} />
          </div>
          <div className="w-full relative">
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