import { useEffect } from 'react';
import { useCardGame } from '../stores/useCardGame';
import { useKeyboardControls } from '@react-three/drei';
import { useGame } from '@/lib/stores/useGame';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';

const GameControls = () => {
  const { 
    currentPlayer, 
    gamePhase, 
    endTurn, 
    drawCard, 
    startGame, 
    endPhase,
    winner,
    turn,
    playerLifeCards,
    opponentLifeCards,
    playerActiveAvatar,
    opponentActiveAvatar
  } = useCardGame();
  const { phase: appGamePhase } = useGame();
  const { playSuccess } = useAudio();
  
  // Get keyboard controls
  const nextPhasePressed = useKeyboardControls(state => state.nextPhase);
  
  // Handle key presses for game control
  useEffect(() => {
    if (nextPhasePressed && currentPlayer === 'player') {
      endPhase();
    }
  }, [nextPhasePressed, currentPlayer, endPhase]);
  
  // Game over handling
  useEffect(() => {
    if (winner) {
      playSuccess();
      if (winner === 'player') {
        toast.success('You won the game!');
      } else {
        toast.error('You lost the game.');
      }
    }
  }, [winner, playSuccess]);
  
  // Show toast notifications for turn changes
  useEffect(() => {
    if (currentPlayer === 'player') {
      toast.info("Your turn");
    } else if (currentPlayer === 'opponent') {
      toast.info("Opponent's turn");
    }
  }, [currentPlayer, turn]);
  
  // Reset game if appGamePhase changes to 'ready'
  useEffect(() => {
    if (appGamePhase === 'ready') {
      startGame();
    }
  }, [appGamePhase, startGame]);
  
  // Helper function to get the player's life
  const getPlayerLife = () => playerLifeCards?.length || 0;
  
  // Helper function to get the opponent's life
  const getOpponentLife = () => opponentLifeCards?.length || 0;
  
  // Helper function to get the next phase button text
  const getNextPhaseButtonText = () => {
    switch (gamePhase) {
      case 'refresh':
        return 'Refresh → Draw';
      case 'draw':
        return 'Draw Card';
      case 'main1':
        return 'Main 1 → Battle';
      case 'battle':
        return 'Battle → Damage';
      case 'damage':
        return 'Damage → Main 2';
      case 'main2':
        return 'Main 2 → End';
      case 'end':
        return 'End Turn';
      default:
        return 'Next Phase';
    }
  };
  
  // Return transparent UI container with buttons
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
      {/* Phase indicator */}
      <div className="bg-gray-800 bg-opacity-80 text-white px-4 py-2 rounded-lg">
        Turn: {turn} | {currentPlayer === 'player' ? 'Your Turn' : 'Opponent Turn'} | Phase: {gamePhase}
      </div>
      
      {/* Life cards indicator */}
      <div className="bg-gray-800 bg-opacity-80 text-white px-4 py-2 rounded-lg">
        Life Cards: You {getPlayerLife()} - {getOpponentLife()} Opponent
      </div>
      
      {/* Control buttons for player's turn */}
      {currentPlayer === 'player' && !winner && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={endPhase}
        >
          {getNextPhaseButtonText()}
        </button>
      )}
      
      {/* Game over UI */}
      {winner && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              {winner === 'player' ? 'Victory!' : 'Defeat!'}
            </h2>
            <p className="mb-4">
              {winner === 'player' 
                ? 'You have defeated your opponent!' 
                : 'You have been defeated!'}
            </p>
            <p className="mb-6">
              Final Life Cards: You {getPlayerLife()} - {getOpponentLife()} Opponent
            </p>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
              onClick={startGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Tutorial for new players */}
      {turn === 1 && currentPlayer === 'player' && gamePhase === 'refresh' && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Play avatar cards to enter battle</li>
              <li>Set avatar cards as energy by dragging backwards</li>
              <li>Use your energy to play action cards (spells, equipment, etc.)</li>
              <li>Attack opponent's avatar during battle phase</li>
              <li>Win by depleting your opponent's life cards!</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Avatar damage display */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-8 z-10">
        {playerActiveAvatar && (
          <div className="bg-blue-900 bg-opacity-80 text-white px-3 py-1 rounded-lg">
            Your {playerActiveAvatar.name}: HP {(playerActiveAvatar.health || 0) - playerActiveAvatar.damageCounter}/{playerActiveAvatar.health || 0}
          </div>
        )}
        
        {opponentActiveAvatar && (
          <div className="bg-red-900 bg-opacity-80 text-white px-3 py-1 rounded-lg">
            Opponent's {opponentActiveAvatar.name}: HP {(opponentActiveAvatar.health || 0) - opponentActiveAvatar.damageCounter}/{opponentActiveAvatar.health || 0}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameControls;
