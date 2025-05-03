import React from 'react';
import Card2D from './Card2D';
import { CardData } from '../components/Card';
import { toast } from 'sonner';

// Game board zones
enum BoardZone {
  OpponentHand,
  OpponentField,
  OpponentAvatar,
  PlayerAvatar,
  PlayerField,
  PlayerHand
}

interface SimpleGame2DProps {
  playerCards: CardData[];
  opponentCards?: CardData[];
}

const SimpleGame2D: React.FC<SimpleGame2DProps> = ({ 
  playerCards, 
  opponentCards = [] 
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
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-700 p-4 overflow-auto">
      {/* Game header with stats */}
      <div className="bg-slate-800 p-2 rounded-lg mb-4 text-white shadow-lg">
        <div className="flex justify-between">
          <div className="text-center p-2 bg-blue-900 bg-opacity-50 rounded-lg">
            <div className="font-bold">Opponent</div>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-red-900 rounded">HP: 20</span>
              <span className="px-2 py-1 bg-yellow-900 rounded">Energy: 3</span>
              <span className="px-2 py-1 bg-purple-900 rounded">Life Cards: 4</span>
            </div>
          </div>
          
          <div className="text-center font-bold bg-yellow-900 px-4 py-2 rounded-lg">
            TURN: Player
          </div>
          
          <div className="text-center p-2 bg-red-900 bg-opacity-50 rounded-lg">
            <div className="font-bold">You</div>
            <div className="flex gap-2 text-sm">
              <span className="px-2 py-1 bg-red-700 rounded">HP: 20</span>
              <span className="px-2 py-1 bg-yellow-700 rounded">Energy: 5</span>
              <span className="px-2 py-1 bg-purple-700 rounded">Life Cards: 4</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Opponent area */}
      <div className="mb-6 bg-blue-900 bg-opacity-20 p-3 rounded-lg">
        <div className="text-white font-bold mb-2">Opponent Field</div>
        
        {/* Opponent card area */}
        <div className="flex justify-center gap-3 mb-2">
          <div className="border-2 border-dashed border-blue-500 rounded-lg h-40 w-40 flex items-center justify-center text-blue-300">
            Active Avatar
          </div>
          
          <div className="border-2 border-dashed border-blue-400 rounded-lg h-40 w-40 flex items-center justify-center text-blue-300">
            Field Card Zone
          </div>
          
          <div className="border-2 border-dashed border-blue-400 rounded-lg h-40 w-40 flex items-center justify-center text-blue-300">
            Field Card Zone
          </div>
        </div>
        
        <div className="flex justify-start gap-2">
          <div className="border-2 border-dashed border-blue-300 rounded-lg h-24 w-24 flex items-center justify-center text-blue-200 text-xs">
            Reserve Avatar
          </div>
          <div className="border-2 border-dashed border-blue-300 rounded-lg h-24 w-24 flex items-center justify-center text-blue-200 text-xs">
            Reserve Avatar
          </div>
        </div>
      </div>
      
      {/* Battlefield divider */}
      <div className="border-t-2 border-b-2 border-white border-opacity-20 py-1 mb-6">
        <div className="text-center font-bold text-white">BATTLEFIELD</div>
      </div>
      
      {/* Player area */}
      <div className="mb-6 bg-red-900 bg-opacity-20 p-3 rounded-lg">
        <div className="text-white font-bold mb-2">Your Field</div>
        
        {/* Player card area */}
        <div className="flex justify-start gap-2 mb-2">
          <div className="border-2 border-dashed border-red-300 rounded-lg h-24 w-24 flex items-center justify-center text-red-200 text-xs">
            Reserve Avatar
          </div>
          <div className="border-2 border-dashed border-red-300 rounded-lg h-24 w-24 flex items-center justify-center text-red-200 text-xs">
            Reserve Avatar
          </div>
        </div>
        
        <div className="flex justify-center gap-3">
          <div className="border-2 border-dashed border-red-500 rounded-lg h-40 w-40 flex items-center justify-center text-red-300">
            Active Avatar
          </div>
          
          <div className="border-2 border-dashed border-red-400 rounded-lg h-40 w-40 flex items-center justify-center text-red-300">
            Field Card Zone
          </div>
          
          <div className="border-2 border-dashed border-red-400 rounded-lg h-40 w-40 flex items-center justify-center text-red-300">
            Field Card Zone
          </div>
        </div>
      </div>
      
      {/* Player hand */}
      <div className="bg-black bg-opacity-40 p-4 rounded-lg">
        <div className="text-white font-bold mb-2">Your Hand ({playerCards.length})</div>
        
        <div className="flex justify-center flex-wrap gap-4">
          {playerCards.map((card, index) => (
            <div key={index} className="transform hover:scale-105 transition-transform">
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
      <div className="mt-4 p-2 bg-slate-800 rounded-lg">
        <div className="flex justify-around">
          <button className="px-4 py-2 bg-yellow-700 text-white rounded-lg font-bold hover:bg-yellow-600">
            Draw Card
          </button>
          <button className="px-4 py-2 bg-blue-700 text-white rounded-lg font-bold hover:bg-blue-600">
            End Turn
          </button>
          <button className="px-4 py-2 bg-red-700 text-white rounded-lg font-bold hover:bg-red-600">
            Attack
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleGame2D;