import { useEffect, useState } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Toaster } from "sonner";
import GameBoard2D from "./game/components2D/GameBoard2D";
import GameModePage from "./pages/GameModePage";
import { useGameMode } from "./game/stores/useGameMode";

// Define control keys for the game
const controls = [
  { name: "select", keys: ["KeyX", "Space"] },
  { name: "confirm", keys: ["KeyZ", "Enter"] },
  { name: "nextPhase", keys: ["KeyC", "Tab"] }
];

function SoundLoader() {
  const playHit = useAudio(state => state.playHit);
  const playButton = useAudio(state => state.playButton);
  
  useEffect(() => {
    // Just preload sounds - we do this quietly now to avoid autoplay issues
    try {
      // Only preload if user has already interacted with page
      if (document.hasFocus()) {
        playHit();
        playButton();
      }
    } catch (e) {
      console.warn('Audio preload not available yet');
    }
  }, [playHit, playButton]);
  
  return null;
}

// Game App component with full gameplay UI
function App() {
  const { sfxEnabled, toggleSfx } = useAudio();
  const gameMode = useGameMode();
  
  // Set up a state to determine if we should show game setup or the actual game
  const [showGameSetup, setShowGameSetup] = useState(true);
  
  // Function to start the game after setup
  const handleStartGame = () => {
    setShowGameSetup(false);
  };
  
  // Function to go back to game setup
  const handleBackToSetup = () => {
    setShowGameSetup(true);
    gameMode.resetState();
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
      <Toaster position="top-center" richColors />
      
      <SoundLoader />
      
      {showGameSetup ? (
        // Show game mode selection page
        <GameModePage onStartGame={handleStartGame} />
      ) : (
        // Show actual game board
        <div className="w-full h-full flex items-center justify-center p-2">
          <div className="w-full h-full max-w-4xl rounded-lg overflow-hidden shadow-2xl">
            <GameBoard2D onAction={(action, data) => console.log(action, data)} />
            
            {/* Back to menu button */}
            <button
              onClick={handleBackToSetup}
              className="absolute top-2 left-2 z-50 bg-gray-800 bg-opacity-70 text-white py-1 px-3 rounded text-sm"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
      
      {/* Sound controls */}
      <button 
        onClick={toggleSfx} 
        className="absolute top-2 right-2 z-50 p-2 bg-opacity-70 bg-gray-800 text-white rounded-full"
        style={{ width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        {!sfxEnabled ? '🔇' : '🔊'}
      </button>
    </div>
  );
}

export default App;
