import React, { useEffect, useState } from 'react';
import { useGameStore } from '../stores/useGameStore';
import Card2D from './Card2D';
import { fireAvatarCards, fireActionCards } from '../data/fireCards';
import { Card, AvatarCard } from '../data/cardTypes';

const GameDemo: React.FC = () => {
  const game = useGameStore();
  const [localCards, setLocalCards] = useState<Card[]>([]);
  
  // Initialize the game
  useEffect(() => {
    game.initGame();
    
    // For demonstration purposes, we'll set up a small selection of cards
    setLocalCards([
      // Add a few avatar cards
      fireAvatarCards[0], // Witch Trainee
      fireAvatarCards[2], // Kobar Trainee
      // Add a few action cards
      fireActionCards[0], // After Burn
      fireActionCards[1], // Burn Ball
    ]);
  }, []);
  
  return (
    <div className="bg-gray-900 w-full h-full p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Card Game Demo</h1>
      
      <div className="mb-6">
        <h2 className="text-white text-xl mb-2">Game State:</h2>
        <div className="bg-black bg-opacity-30 p-4 rounded">
          <div className="text-white mb-2">
            <span className="font-bold">Phase:</span> {game.getPhaseText()}
          </div>
          <div className="text-white mb-2">
            <span className="font-bold">Turn:</span> {game.turn}
          </div>
          <div className="text-white mb-2">
            <span className="font-bold">Current Player:</span> {game.currentPlayer}
          </div>
          <div className="flex gap-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white"
              onClick={() => game.nextPhase()}
            >
              Next Phase
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
              onClick={() => game.endTurn()}
            >
              End Turn
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-white text-xl mb-2">Player Cards:</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {localCards.map((card, index) => (
            <div key={index} className="w-full">
              <Card2D 
                card={card} 
                isPlayable={true}
                onClick={() => console.log('Clicked card:', card.name)}
              />
              <div className="flex justify-center mt-2">
                {card.type === 'avatar' ? (
                  <>
                    <button 
                      className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs mx-1"
                      onClick={() => {
                        game.player.activeAvatar = card as AvatarCard;
                        console.log('Set active avatar:', card.name);
                      }}
                    >
                      Set Active
                    </button>
                  </>
                ) : (
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-white text-xs mx-1"
                    onClick={() => {
                      console.log('Play spell:', card.name);
                    }}
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-white text-xl mb-2">Game Log:</h2>
        <div className="bg-black bg-opacity-30 p-4 rounded h-40 overflow-y-auto">
          {game.logs.map((log, index) => (
            <div key={index} className="text-gray-300 mb-1 text-sm">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDemo;