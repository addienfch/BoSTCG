import React, { useState, useEffect } from 'react';
import { useGameMode } from '../game/stores/useGameMode';
import { useDeckStore } from '../game/stores/useDeckStore';
import SolanaWalletConnect from '../components/SolanaWalletConnect';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import BackButton from '../components/BackButton';
import NavigationBar from '../components/NavigationBar';

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
  const [showAIDifficultySelector, setShowAIDifficultySelector] = useState(false);
  
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
  
  // Handle starting AI opponent game with difficulty selection
  const handleStartAIGame = (difficulty?: 'newbie' | 'regular' | 'advanced') => {
    if (!difficulty) {
      setShowAIDifficultySelector(true);
      return;
    }
    
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.setAIDifficulty(difficulty);
    gameMode.startAIGame();
    toast.success(`Starting game against ${difficulty} AI...`);
    setShowAIDifficultySelector(false);
    onStartGame(); // Call the parent component callback to navigate to the game
  };
  
  return (
    <div className="min-h-screen bg-spektrum-dark text-spektrum-light pb-20" style={{ fontFamily: 'Noto Sans, Inter, sans-serif' }}>
      <BackButton />
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-spektrum-light">Book of Spektrum</h1>
        
        <div className="bg-spektrum-light bg-opacity-10 border border-spektrum-light border-opacity-20 rounded-lg p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-spektrum-light">Player Setup</h2>
          
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
              <div className="flex space-x-2">
                <Link 
                  to="/deck-builder"
                  className="text-blue-400 hover:text-blue-300 text-xs"
                >
                  Manage Decks
                </Link>
                <Link 
                  to="/library"
                  className="text-green-400 hover:text-green-300 text-xs"
                >
                  Card Library
                </Link>
              </div>
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
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStartAIGame()}
                className="bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark py-3 px-4 rounded-md transition-colors font-medium"
                disabled={decks.length === 0 || !selectedDeckId}
              >
                Vs AI
              </button>
              
              <button
                onClick={handleStartSinglePlayer}
                className="bg-spektrum-light hover:bg-gray-200 text-spektrum-dark py-3 px-4 rounded-md transition-colors font-medium"
                disabled={decks.length === 0 || !selectedDeckId}
              >
                Random Match
              </button>
            </div>
            
            <div className="pt-4 border-t border-spektrum-light border-opacity-20">
              <h3 className="text-lg font-semibold mb-3 text-spektrum-light">Multiplayer</h3>
              
              <div className="grid grid-cols-1 gap-3 mb-3">
                <button
                  onClick={handleCreateRoom}
                  className="bg-spektrum-orange hover:bg-orange-600 text-spektrum-dark py-3 px-4 rounded-md transition-colors font-medium"
                  disabled={decks.length === 0 || !selectedDeckId}
                >
                  Create Room
                </button>
              </div>
              
              <form onSubmit={handleJoinRoom} className="space-y-3">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-spektrum-dark border border-spektrum-light border-opacity-30 rounded-md text-spektrum-light focus:outline-none focus:ring-2 focus:ring-spektrum-orange"
                  placeholder="Enter room code"
                  maxLength={6}
                />
                <button
                  type="submit"
                  className="w-full bg-spektrum-light hover:bg-gray-200 text-spektrum-dark py-3 px-4 rounded-md transition-colors font-medium"
                  disabled={decks.length === 0 || !selectedDeckId}
                >
                  Enter Custom Room
                </button>
              </form>
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
        
        {/* AI Difficulty Selection Modal */}
        {showAIDifficultySelector && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-spektrum-dark border border-spektrum-light border-opacity-20 rounded-lg p-6 shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 text-spektrum-light text-center">Choose AI Difficulty</h2>
              <p className="text-sm text-gray-300 mb-6 text-center">
                Select the AI opponent difficulty level for your match
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleStartAIGame('newbie')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md transition-colors font-medium text-left"
                >
                  <div className="font-bold">🟢 Newbie AI</div>
                  <div className="text-sm opacity-90">Easy opponent, makes simple moves with longer thinking time</div>
                </button>
                
                <button
                  onClick={() => handleStartAIGame('regular')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-md transition-colors font-medium text-left"
                >
                  <div className="font-bold">🟡 Regular AI</div>
                  <div className="text-sm opacity-90">Balanced opponent, considers multiple options</div>
                </button>
                
                <button
                  onClick={() => handleStartAIGame('advanced')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md transition-colors font-medium text-left"
                >
                  <div className="font-bold">🔴 Advanced AI</div>
                  <div className="text-sm opacity-90">Challenging opponent, makes strategic decisions quickly</div>
                </button>
              </div>
              
              <button
                onClick={() => setShowAIDifficultySelector(false)}
                className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default GameModePage;