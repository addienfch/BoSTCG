import React from 'react';
import { useCardGame } from '../stores/useCardGame';
import { toast } from 'sonner';

const GameControls2D: React.FC = () => {
  const { 
    currentPlayer, 
    gamePhase, 
    startGame, 
    drawCard, 
    endPhase, 
    endTurn 
  } = useCardGame();
  
  const isPlayerTurn = currentPlayer === 'player';
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handlePhaseAction = async () => {
    if (!isPlayerTurn) {
      toast.error("It's not your turn!");
      return;
    }
    
    // Prevent multiple clicks while processing
    if (isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      switch (gamePhase) {
        case 'ready':
          startGame();
          toast.success("Game started!");
          break;
          
        case 'refresh':
          // Auto-proceed after refresh phase
          endPhase();
          toast.info("Entering Draw phase");
          break;
          
        case 'draw':
          // Draw card and automatically end phase after a short delay
          drawCard();
          toast.success("Card drawn!");
          // Add a small delay before ending phase to prevent rapid clicking
          await new Promise(resolve => setTimeout(resolve, 500));
          endPhase();
          break;
          
        case 'main1':
        case 'main2':
          endPhase();
          toast.info(`Entering ${gamePhase === 'main1' ? 'Battle' : 'End'} phase`);
          break;
          
        case 'battle':
          endPhase();
          toast.info("Entering Main Phase 2");
          break;
          
        case 'end':
          endTurn();
          toast.info("Turn ended");
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error('Error in phase action:', error);
    } finally {
      // Add a small cooldown before allowing the next action
      setTimeout(() => {
        setIsProcessing(false);
      }, 300);
    }
  };
  
  const getActionButtonText = () => {
    if (!isPlayerTurn) {
      return "Opponent's Turn";
    }
    
    switch (gamePhase) {
      case 'ready':
        return "Start Game";
      case 'refresh':
        return "Proceed to Draw";
      case 'draw':
        return "Draw Card";
      case 'main1':
        return "Go to Battle Phase";
      case 'battle':
        return "Go to Main Phase 2";
      case 'main2':
        return "End Turn";
      case 'end':
        return "End Turn";
      default:
        return "Next Phase";
    }
  };
  
  const getPhaseDescription = () => {
    switch (gamePhase) {
      case 'ready':
        return "Game not started";
      case 'refresh':
        return "Refresh Phase: All tapped cards are untapped";
      case 'draw':
        return "Draw Phase: Draw a card";
      case 'main1':
        return "Main Phase 1: Play cards, use abilities";
      case 'battle':
        return "Battle Phase: Attack with avatars";
      case 'main2':
        return "Main Phase 2: Play more cards after battle";
      case 'end':
        return "End Phase: End your turn";
      default:
        return "";
    }
  };
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg text-white">
      <div className="text-center mb-2">
        <div className="font-bold">
          {isPlayerTurn ? 'Your Turn' : "Opponent's Turn"}
        </div>
        <div className="text-sm mb-2">
          {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1)} Phase
        </div>
        <div className="text-xs italic mb-4">
          {getPhaseDescription()}
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <button
          onClick={handlePhaseAction}
          disabled={!isPlayerTurn || isProcessing}
          className={`py-2 px-4 rounded-lg font-bold text-white transition-opacity ${
            isPlayerTurn && !isProcessing
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              : 'bg-gray-700 cursor-not-allowed'
          } ${isProcessing ? 'opacity-70' : ''}`}
        >
          {getActionButtonText()}
        </button>
        
        <div className="grid grid-cols-5 gap-1 text-center text-xs">
          <div className={`rounded p-1 ${gamePhase === 'refresh' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Refresh
          </div>
          <div className={`rounded p-1 ${gamePhase === 'draw' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Draw
          </div>
          <div className={`rounded p-1 ${gamePhase === 'main1' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Main 1
          </div>
          <div className={`rounded p-1 ${gamePhase === 'battle' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Battle
          </div>
          <div className={`rounded p-1 ${gamePhase === 'main2' || gamePhase === 'end' ? 'bg-yellow-600' : 'bg-gray-700'}`}>
            Main 2
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameControls2D;