import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Toaster } from "sonner";
import GameBoard2D from "./game/components2D/GameBoard2D";

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
    // Just preload sounds
    playHit();
    playButton();
  }, [playHit, playButton]);
  
  return null;
}

// Game App component with full gameplay UI
function App() {
  const { sfxEnabled, toggleSfx } = useAudio();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
      <Toaster position="top-center" richColors />
      
      <SoundLoader />
      
      {/* Full gameplay UI */}
      <div className="w-full h-full flex items-center justify-center p-2">
        <div className="w-full h-full max-w-4xl rounded-lg overflow-hidden shadow-2xl">
          <GameBoard2D onAction={(action, data) => console.log(action, data)} />
        </div>
      </div>
      
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
