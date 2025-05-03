import { useEffect } from "react";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import { Toaster } from "sonner";
import GameDemo from "./game/components2D/GameDemo";

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

// Simple 2D App component for now
function App() {
  const { sfxEnabled, toggleSfx } = useAudio();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', background: '#121224' }}>
      <Toaster position="top-center" richColors />
      
      <SoundLoader />
      
      {/* Use our GameDemo component */}
      <GameDemo />
      
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
