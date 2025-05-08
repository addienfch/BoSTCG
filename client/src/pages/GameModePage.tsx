import React, { useState, useEffect } from 'react';
import { useGameMode } from '../game/stores/useGameMode';
import { useDeckStore } from '../game/stores/useDeckStore';
import SolanaWalletConnect from '../components/SolanaWalletConnect';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface GameModePageProps {
  onStartGame: () => void;
}

// Component for selecting game modes
const GameModePage: React.FC<GameModePageProps> = ({ onStartGame }) => {
  const gameMode = useGameMode();
  const { decks, activeDeckId, setActiveDeck } = useDeckStore();
  
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState(gameMode.playerName);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(activeDeckId);
  
  // If no deck is selected, select the first one by default
  useEffect(() => {
    if (!selectedDeckId && decks.length > 0) {
      setSelectedDeckId(decks[0].id);
    }
  }, [decks, selectedDeckId]);
  
  // Set the selected deck as active
  const updateActiveDeck = () => {
    if (!selectedDeckId) {
      toast.error("Please select a deck first.");
      return false;
    }
    
    setActiveDeck(selectedDeckId);
    return true;
  };
  
  // Handle form submission for joining a room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.joinRoom(roomCode);
    toast.success(`Joining room ${roomCode}...`);
    onStartGame(); // Navigate to the game
  };
  
  // Handle creating a new room
  const handleCreateRoom = () => {
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.createRoom();
    toast.success('Creating a new room...');
    // For now, we still navigate to the game even when waiting for an opponent
    // In a real implementation, this would wait for the opponent to join
    onStartGame();
  };
  
  // Handle starting single player game
  const handleStartSinglePlayer = () => {
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.startSinglePlayer();
    toast.success('Starting practice game...');
    onStartGame(); // Call the parent component callback to navigate to the game
  };
  
  // Handle starting AI opponent game
  const handleStartAIGame = () => {
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.startAIGame();
    toast.success('Starting game against AI...');
    onStartGame(); // Call the parent component callback to navigate to the game
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8">Book of Spektrum</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Player Setup</h2>
          
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-sm font-medium mb-1">
              Your Name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          {/* Deck Selection */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Select Deck
              </label>
              <Link 
                to="/deck-builder"
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                Manage Decks
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mb-2">
              {decks.map(deck => {
                // Find a card to display (preferably a level 2 avatar)
                const displayCard = deck.cards.find(card => 
                  card.type === 'avatar' && card.level === 2
                ) || deck.cards[0];
                
                // Determine tribe badge color
                let tribeBadgeColor = 'bg-gray-500';
                let tribeLabel = '';
                
                if (deck.tribe === 'kobar-borah') {
                  tribeBadgeColor = 'bg-red-700';
                  tribeLabel = 'Kobar-Borah';
                } else if (deck.tribe === 'kujana-kuhaka') {
                  tribeBadgeColor = 'bg-orange-700';
                  tribeLabel = 'Kujana-Kuhaka';
                }
                
                return (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeckId(deck.id)}
                    className={`p-3 rounded-lg flex items-center transition-colors ${
                      selectedDeckId === deck.id
                        ? 'bg-amber-800 border-2 border-amber-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div 
                      className="w-12 h-16 bg-gray-600 rounded-md mr-3 overflow-hidden"
                      style={{
                        backgroundImage: `url(${displayCard.art})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                    </div>
                    <div className="text-left flex-1">
                      <span className="font-bold">{deck.name}</span>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-gray-300">{deck.cards.length} cards</div>
                        {tribeLabel && (
                          <div className={`text-xs px-2 py-0.5 rounded-full text-white ${tribeBadgeColor}`}>
                            {tribeLabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              
              {decks.length === 0 && (
                <div className="bg-gray-700 p-4 rounded-lg text-center">
                  <p className="text-gray-400 mb-2">No decks available</p>
                  <Link
                    to="/deck-builder"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Create a Deck
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Game Modes</h3>
            
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleStartSinglePlayer}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
                disabled={decks.length === 0 || !selectedDeckId}
              >
                Practice Mode
              </button>
              
              <button
                onClick={handleStartAIGame}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
                disabled={decks.length === 0 || !selectedDeckId}
              >
                Play Against AI
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-3">Online Play</h3>
              
              <form onSubmit={handleJoinRoom} className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter room code"
                    maxLength={6}
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    disabled={decks.length === 0 || !selectedDeckId}
                  >
                    Join Room
                  </button>
                </div>
              </form>
              
              <button
                onClick={handleCreateRoom}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors"
                disabled={decks.length === 0 || !selectedDeckId}
              >
                Create New Room
              </button>
            </div>
          </div>
        </div>
        
        {/* Solana Wallet Connection */}
        <SolanaWalletConnect />
        
        {/* Room info display when waiting for opponent */}
        {gameMode.isWaitingForOpponent && gameMode.roomCode && (
          <div className="mt-6 bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <h2 className="text-xl font-bold mb-2">Waiting for Opponent</h2>
            <p className="mb-4">Share this room code with your friend:</p>
            <div className="bg-gray-700 rounded-md p-3 font-mono text-2xl tracking-widest mb-4">
              {gameMode.roomCode}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(gameMode.roomCode || '');
                toast.success('Room code copied to clipboard!');
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
            >
              Copy Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModePage;