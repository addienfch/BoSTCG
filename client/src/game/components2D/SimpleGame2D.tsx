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

  // Empty placeholder card for zones
  const EmptyZone = ({ name, color }: { name: string, color: string }) => (
    <div className={`border-2 border-dashed ${color} rounded-lg flex items-center justify-center text-center p-2 aspect-[2/3] w-full`}>
      <span className="text-sm text-white opacity-70">{name}</span>
    </div>
  );
  
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-700 p-2 overflow-auto">
      {/* Game header with player stats and turn info */}
      <div className="bg-slate-800 p-2 rounded-lg mb-2 text-white shadow-lg">
        <div className="flex justify-between mb-2">
          <div className="bg-blue-900 bg-opacity-70 p-1 rounded-lg text-center text-xs">
            <div className="font-bold">OPPONENT</div>
            <div className="flex gap-1">
              <span className="px-1 bg-red-800 rounded">HP: 20</span>
              <span className="px-1 bg-yellow-800 rounded">Energy: 3</span>
            </div>
          </div>
          
          <div className="bg-red-900 bg-opacity-70 p-1 rounded-lg text-center text-xs">
            <div className="font-bold">PLAYER</div>
            <div className="flex gap-1">
              <span className="px-1 bg-red-800 rounded">HP: 20</span>
              <span className="px-1 bg-yellow-800 rounded">Energy: 5</span>
            </div>
          </div>
        </div>
        
        <div className="text-center font-bold bg-yellow-900 px-4 py-1 rounded-lg text-sm">
          TURN: Player • Phase: Main 1
        </div>
      </div>
      
      {/* Opponent Hand - Face down */}
      <div className="p-2 bg-black bg-opacity-30 rounded-lg mb-2">
        <div className="text-white text-xs mb-1">Opponent Hand ({opponentCards.length})</div>
        <div className="flex justify-center gap-2">
          {opponentCards.map((card, index) => (
            <div key={index} style={{ minWidth: '80px', maxWidth: '80px', height: '112px' }} className="bg-blue-900 rounded-lg border-2 border-blue-700 flex items-center justify-center">
              <div className="font-bold text-white text-xs text-center">
                Card {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Opponent Area (Blue) */}
      <div className="grid grid-cols-12 gap-2 mb-4">
        {/* Left Column - Opponent Energy Piles */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Energy Piles */}
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Energy Pile" color="border-blue-500" />
          </div>
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Used Energy Pile" color="border-blue-300" />
          </div>
        </div>
        
        {/* Middle Column - Opponent Avatar Areas */}
        <div className="col-span-6 flex flex-col gap-2">
          {/* Life Cards Section - Moved to top */}
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-1 mb-2">
            <div className="text-xs text-center text-blue-300 mb-1">Life Cards Section</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
              <div className="aspect-square w-full border border-blue-300 rounded"></div>
            </div>
          </div>
          
          {/* Active Avatar - Made more prominent */}
          <div className="aspect-[2/3] w-full border-4 border-blue-600 rounded-lg">
            {opponentCards.length > 0 && opponentCards[0].type === 'avatar' ? (
              <div className="transform scale-85">
                <Card2D 
                  card={opponentCards[0]} 
                  isPlayable={false}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-bold">Active Avatar</span>
              </div>
            )}
          </div>
          
          {/* Reserve Avatars (2) */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <EmptyZone name="Reserve Avatar" color="border-blue-500" />
            <EmptyZone name="Reserve Avatar" color="border-blue-500" />
          </div>
        </div>
        
        {/* Right Column - Opponent Deck and Graveyard (moved here) */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Opponent Deck */}
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Deck" color="border-blue-500" />
          </div>
          
          {/* Opponent Graveyard - small */}
          <div className="aspect-[2/3] h-10">
            <EmptyZone name="Grave" color="border-blue-300" />
          </div>
        </div>
      </div>
      
      {/* Field Cards Row - Made smaller and more compact */}
      <div className="flex justify-center gap-4 mb-4">
        {/* Opponent Field Card */}
        <div style={{ width: '120px' }} className="aspect-[2/3]">
          <EmptyZone name="Field Card" color="border-blue-500" />
        </div>
        
        {/* Player Field Card */}
        <div style={{ width: '120px' }} className="aspect-[2/3]">
          {fieldCard ? (
            <div className="transform scale-90 w-full h-full">
              <Card2D 
                card={fieldCard} 
                isPlayable={true}
              />
            </div>
          ) : (
            <EmptyZone name="Field Card" color="border-red-500" />
          )}
        </div>
      </div>
      
      {/* Battlefield divider */}
      <div className="border-t-2 border-b-2 border-white border-opacity-20 py-1 mb-4">
        <div className="text-center font-bold text-white">BATTLEFIELD</div>
      </div>
      
      {/* Player Area (Red) */}
      <div className="grid grid-cols-12 gap-2 mb-4">
        {/* Left Column - Player Energy Piles (moved here) */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Energy Piles */}
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Energy Pile" color="border-red-500" />
          </div>
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Used Energy Pile" color="border-red-300" />
          </div>
        </div>
        
        {/* Middle Column - Player Avatar Areas */}
        <div className="col-span-6 flex flex-col gap-2">
          {/* Life Cards Section - Moved to top */}
          <div className="border-2 border-dashed border-red-400 rounded-lg p-1 mb-2">
            <div className="text-xs text-center text-red-300 mb-1">Life Cards Section</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
              <div className="aspect-square w-full border border-red-300 rounded"></div>
            </div>
          </div>
          
          {/* Active Avatar - Made more prominent */}
          <div className="aspect-[2/3] w-full border-4 border-red-600 rounded-lg">
            {playerCards.some(card => card.type === 'avatar') ? (
              <div className="transform scale-85">
                <Card2D 
                  card={playerCards.find(card => card.type === 'avatar') as CardData} 
                  isPlayable={true}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white font-bold">Active Avatar</span>
              </div>
            )}
          </div>
          
          {/* Reserve Avatars (2) */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <EmptyZone name="Reserve Avatar" color="border-red-500" />
            <EmptyZone name="Reserve Avatar" color="border-red-500" />
          </div>
        </div>
        
        {/* Right Column - Player Deck and Graveyard (moved here) */}
        <div className="col-span-3 flex flex-col gap-2">
          {/* Player Deck */}
          <div className="aspect-[2/3] w-full">
            <EmptyZone name="Deck" color="border-red-500" />
          </div>
          
          {/* Player Graveyard - small */}
          <div className="aspect-[2/3] h-10">
            <EmptyZone name="Grave" color="border-red-300" />
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