import React, { useEffect } from 'react';
import GameBoard2D from './GameBoard2D';
import GameControls2D from './GameControls2D';
import PlayerStats2D from './PlayerStats2D';
import Hand2D from './Hand2D';
import { useGame } from '@/lib/stores/useGame';
import { useCardGame } from '../stores/useCardGame';
import { Toaster } from '@/components/ui/sonner';

const Game2D: React.FC = () => {
  const { phase, start } = useGame();
  const { startGame } = useCardGame();
  
  // Start the game when component mounts
  useEffect(() => {
    if (phase === 'ready') {
      start();
      startGame();
    }
  }, [phase, start, startGame]);
  
  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 to-slate-700 text-white">
      {/* Top area - opponent stats */}
      <div className="w-full p-2 border-b border-gray-700">
        <PlayerStats2D player="opponent" />
      </div>
      
      {/* Middle area - game board */}
      <div className="flex-grow overflow-auto p-2">
        <GameBoard2D />
      </div>
      
      {/* Bottom area - player hand and controls */}
      <div className="w-full border-t border-gray-700 bg-gray-900">
        <div className="flex flex-col sm:flex-row">
          {/* Hand */}
          <div className="flex-grow p-2">
            <Hand2D />
          </div>
          
          {/* Controls */}
          <div className="w-full sm:w-80 p-2">
            <GameControls2D />
          </div>
        </div>
      </div>
      
      {/* Toaster for notifications */}
      <Toaster position="top-center" />
    </div>
  );
};

export default Game2D;