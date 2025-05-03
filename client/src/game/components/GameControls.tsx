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
    playerHealth, 
    opponentHealth,
    processPhase,
    winner,
    turn
  } = useCardGame();
  const { phase: appGamePhase } = useGame();
  const { playSuccess } = useAudio();
  
  // Get keyboard controls
  const nextPhasePressed = useKeyboardControls(state => state.nextPhase);
  
  // Handle key presses for game control
  useEffect(() => {
    if (nextPhasePressed && currentPlayer === 'player') {
      processPhase();
    }
  }, [nextPhasePressed, currentPlayer, processPhase]);
  
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
  
  // Return transparent UI container with buttons
  return (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
      {/* Phase indicator */}
      <div className="bg-gray-800 bg-opacity-80 text-white px-4 py-2 rounded-lg">
        Turn: {turn} | {currentPlayer === 'player' ? 'Your Turn' : 'Opponent Turn'} | Phase: {gamePhase}
      </div>
      
      {/* Control buttons for player's turn */}
      {currentPlayer === 'player' && !winner && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={processPhase}
        >
          {gamePhase === 'draw' ? 'Draw Card' : 
           gamePhase === 'play' ? 'To Attack Phase' :
           gamePhase === 'attack' ? 'End Turn' : 'Next'}
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
              Final Score: You {playerHealth} - {opponentHealth} Opponent
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
      {turn === 1 && currentPlayer === 'player' && gamePhase === 'draw' && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center">
          <div className="bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>Draw phase: Draw a card from your deck</li>
              <li>Play phase: Drag cards from your hand to the battlefield</li>
              <li>Attack phase: Select your creature then click an opponent's creature or opponent directly</li>
              <li>Each creature can attack once per turn</li>
              <li>Defeat your opponent by reducing their life to zero!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
