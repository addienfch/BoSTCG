import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameMode } from '../game/stores/useGameMode';
import { useDeckStore } from '../game/stores/useDeckStore';
import { toast } from 'sonner';

const ArenaPage: React.FC = () => {
  const navigate = useNavigate();
  const gameMode = useGameMode();
  const { decks, activeDeckId, setActiveDeck } = useDeckStore();
  
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(activeDeckId);
  const [playerName, setPlayerName] = useState(gameMode.playerName || 'Player');
  const [roomCode, setRoomCode] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  
  // Set the selected deck as active
  const updateActiveDeck = () => {
    if (!selectedDeckId) {
      toast.error("Please select a deck first.");
      return false;
    }
    
    setActiveDeck(selectedDeckId);
    return true;
  };
  
  // Handle starting single player game
  const handleStartSinglePlayer = () => {
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.startSinglePlayer();
    toast.success('Starting practice game...');
    navigate('/game');
  };
  
  // Handle starting AI opponent game
  const handleStartAIGame = () => {
    if (!updateActiveDeck()) return;
    
    gameMode.setPlayerName(playerName);
    gameMode.startAIGame();
    toast.success('Starting game against AI...');
    navigate('/game');
  };
  
  // Handle creating a new room
  const handleCreateRoom = () => {
    if (!updateActiveDeck()) return;
    
    setIsCreatingRoom(true);
    gameMode.setPlayerName(playerName);
    
    // Simulate room creation
    setTimeout(() => {
      gameMode.createRoom();
      toast.success('Room created! Waiting for opponent...');
      setIsCreatingRoom(false);
      navigate('/game');
    }, 1500);
  };
  
  // Handle joining a room
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast.error('Please enter a room code');
      return;
    }
    
    if (!updateActiveDeck()) return;
    
    setIsJoiningRoom(true);
    gameMode.setPlayerName(playerName);
    
    // Simulate joining room
    setTimeout(() => {
      gameMode.joinRoom(roomCode);
      toast.success(`Joining room ${roomCode}...`);
      setIsJoiningRoom(false);
      navigate('/game');
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#DFE1DD', color: '#0D1A29' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-center items-center mb-6">
          <h1 className="text-2xl font-bold">Battle Arena</h1>
        </div>
        
        {/* Player Setup */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Player Setup</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
        </div>
        
        {/* Deck Selection */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2 text-white">Select Deck</h2>
          
          <div className="grid grid-cols-1 gap-3 mb-2">
            {decks.map(deck => {
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
                      backgroundImage: deck.coverCardId ? `url(${useDeckStore.getState().findCard(deck.coverCardId)?.art})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="text-left flex-1">
                    <span className="font-bold text-white">{deck.name}</span>
                    
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
                <button
                  onClick={() => navigate('/deck-builder')}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Create a Deck
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Game Modes */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Game Modes</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStartSinglePlayer}
              className="bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-lg flex flex-col items-center justify-center disabled:bg-gray-600 disabled:text-gray-400"
              disabled={decks.length === 0 || !selectedDeckId}
            >
              <span className="text-2xl mb-1">🎮</span>
              <span className="font-medium">Practice Mode</span>
            </button>
            
            <button
              onClick={handleStartAIGame}
              className="bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-lg flex flex-col items-center justify-center disabled:bg-gray-600 disabled:text-gray-400"
              disabled={decks.length === 0 || !selectedDeckId}
            >
              <span className="text-2xl mb-1">🤖</span>
              <span className="font-medium">Play vs AI</span>
            </button>
          </div>
        </div>
        
        {/* Online Play */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3 text-white">Online Play</h2>
          
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
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
                disabled={decks.length === 0 || !selectedDeckId || isJoiningRoom}
              >
                {isJoiningRoom ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </button>
            </div>
          </form>
          
          <button
            onClick={handleCreateRoom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            disabled={decks.length === 0 || !selectedDeckId || isCreatingRoom}
          >
            {isCreatingRoom ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Creating Room...
              </>
            ) : (
              <>
                <span className="mr-2">🌐</span>
                Create New Room
              </>
            )}
          </button>
        </div>
        
        {/* Room info display when waiting for opponent */}
        {gameMode.isWaitingForOpponent && gameMode.roomCode && (
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
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

export default ArenaPage;
