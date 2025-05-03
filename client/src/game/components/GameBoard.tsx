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
  const { currentPlayer, gameState, startGame } = useCardGame();
  const isUserTurn = currentPlayer === 'player';

  // Setting up the game when component mounts
  useEffect(() => {
    if (gamePhase === 'ready') {
      // Initialize the game
      startGame();
    }
  }, [gamePhase, startGame]);
  
  // Update camera position based on whose turn it is
  useFrame(({ clock }) => {
    if (!cameraRef.current) return;
    
    // Make camera gently float for a dynamic feel
    const t = clock.getElapsedTime();
    const floatY = Math.sin(t * 0.5) * 0.1;
    
    // Target camera position based on turn
    const targetPosition = isUserTurn
      ? new THREE.Vector3(0, 8 + floatY, 6) // Player's turn - see your hand better
      : new THREE.Vector3(0, 10 + floatY, 6); // Opponent's turn - see the battlefield better
    
    // Smooth camera movement
    cameraRef.current.position.lerp(targetPosition, 0.05);
    
    // Always look at the center of the board
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Main Camera */}
      <PerspectiveCamera 
        makeDefault 
        ref={cameraRef} 
        position={[0, 10, 6]} 
        fov={60}
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
        
        {/* Game areas */}
        <Battlefield position={[0, 0, 0]} />
        
        {/* Player hand at bottom */}
        <Hand position={[0, 0, 4]} />
        
        {/* Player stats displays */}
        <PlayerStats player="player" position={[4, 0, 3]} />
        <PlayerStats player="opponent" position={[-4, 0, -3]} />
      </group>
    </>
  );
};

export default GameBoard;
