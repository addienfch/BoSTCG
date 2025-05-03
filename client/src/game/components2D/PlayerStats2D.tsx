import React from 'react';
import { useCardGame } from '../stores/useCardGame';

interface PlayerStats2DProps {
  player: 'player' | 'opponent';
}

const PlayerStats2D: React.FC<PlayerStats2DProps> = ({ player }) => {
  const { 
    playerHealth, 
    opponentHealth,
    playerEnergyPile,
    opponentEnergyPile,
    playerLifeCards,
    opponentLifeCards,
    currentPlayer,
    gamePhase
  } = useCardGame();
  
  const health = player === 'player' ? playerHealth : opponentHealth;
  const energyCount = player === 'player' ? playerEnergyPile.length : opponentEnergyPile.length;
  const lifeCardsCount = player === 'player' ? playerLifeCards.length : opponentLifeCards.length;
  
  const isPlayersTurn = currentPlayer === player;
  
  // Colors based on player type
  const bgColor = player === 'player' ? 'bg-red-800' : 'bg-blue-800';
  const borderColor = player === 'player' ? 'border-red-500' : 'border-blue-500';
  
  return (
    <div className={`${bgColor} ${borderColor} border-2 rounded-lg p-2 shadow-lg text-white w-full max-w-xs`}>
      <div className="text-center font-bold mb-1">
        {player === 'player' ? 'YOU' : 'OPPONENT'}
        {isPlayersTurn && <span className="ml-2 text-yellow-300">★</span>}
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Health</div>
          <div className="font-bold">{health}</div>
        </div>
        
        <div className="bg-yellow-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Energy</div>
          <div className="font-bold">{energyCount}</div>
        </div>
        
        <div className="bg-purple-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Life Cards</div>
          <div className="font-bold">{lifeCardsCount}</div>
        </div>
        
        <div className="bg-green-600 bg-opacity-50 rounded p-1 text-center">
          <div className="text-xs">Phase</div>
          <div className="font-bold text-xs">{isPlayersTurn ? gamePhase : '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats2D;