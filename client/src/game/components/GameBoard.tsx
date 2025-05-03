import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from "@react-three/drei";
import * as THREE from 'three';
import Battlefield from './Battlefield';
import Hand from './Hand';
import PlayerStats from './PlayerStats';
import { useCardGame } from '../stores/useCardGame';
import { useGame } from '@/lib/stores/useGame';

const GameBoard = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const { phase: gamePhase } = useGame();
  const { currentPlayer, startGame } = useCardGame();
  const isUserTurn = currentPlayer === 'player';

  // Setting up the game when component mounts
  useEffect(() => {
    if (gamePhase === 'ready') {
      // Initialize the game
      startGame();
    }
  }, [gamePhase, startGame]);
  
  // Fixed camera position for consistent layout view, optimized for mobile
  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    
    // Make camera gently float for a dynamic feel
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 0.5) * 0.02; // Minimal float amount
    
    // FIXED camera position - looking down at board from player's side
    // Positioned to see both opponent (top/blue) and player (bottom/red) sides
    const fixedCameraPosition = new THREE.Vector3(0, 4.5 + floatY, 2.0);
    
    // Smooth camera movement
    cameraRef.current.position.lerp(fixedCameraPosition, 0.05);
    
    // Look down at the battlefield center with slight tilt toward opponent side
    cameraRef.current.lookAt(0, 0, -0.5);
  });

  return (
    <>
      {/* Fixed Camera - optimized for mobile portrait mode (1080x1920) */}
      <PerspectiveCamera 
        makeDefault 
        ref={cameraRef} 
        position={[0, 4.5, 2.0]} 
        fov={70} // Wider field of view for better visibility on mobile
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1} 
        castShadow 
        shadow-mapSize-width={1024} 
        shadow-mapSize-height={1024}
      />
      
      {/* Environment */}
      <Environment preset="sunset" />
      
      {/* Game Elements */}
      <group>
        {/* Game table - using wood texture */}
        <mesh 
          position={[0, -0.1, 0]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#5e3b28" />
        </mesh>
        
        {/* Game areas - optimized for mobile portrait mode */}
        <Battlefield position={[0, 0, 0]} />
        
        {/* Player hand positioned in front of camera view */}
        <Hand position={[0, 0, 3.5]} />
        
        {/* Player stats displays - positioned on sides */}
        <PlayerStats player="player" position={[3, 0, 1.5]} />
        <PlayerStats player="opponent" position={[-3, 0, -1.5]} />
      </group>
    </>
  );
};

export default GameBoard;
