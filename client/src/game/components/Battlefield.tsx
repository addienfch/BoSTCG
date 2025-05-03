import { useRef, useEffect, useState } from 'react';
import { useCardGame } from '../stores/useCardGame';
import Card from './Card';
import { useAudio } from '@/lib/stores/useAudio';
import { toast } from 'sonner';

interface BattlefieldProps {
  position?: [number, number, number];
}

const Battlefield = ({ position = [0, 0, 0] }: BattlefieldProps) => {
  const battlefieldRef = useRef<THREE.Group>(null);
  const { 
    playerField, 
    opponentField, 
    currentPlayer, 
    selectedCreature, 
    selectCreature, 
    attackCreature,
    attackPlayer,
    gamePhase
  } = useCardGame();
  const { playHit } = useAudio();
  
  // For highlighting possible attack targets
  const [attackTargets, setAttackTargets] = useState<string[]>([]);
  
  // Calculate player field positions
  const calculateFieldPositions = (count: number, zOffset: number) => {
    const spacing = 1.5;
    const totalWidth = (count - 1) * spacing;
    const startX = -totalWidth / 2;
    
    return Array.from({ length: count }).map((_, index) => {
      return [startX + (index * spacing) + position[0], position[1], zOffset + position[2]] as [number, number, number];
    });
  };
  
  // Update attackable targets when a creature is selected
  useEffect(() => {
    if (selectedCreature && currentPlayer === 'player' && gamePhase === 'attack') {
      // All opponent creatures and the opponent player are valid targets
      setAttackTargets(['opponent', ...opponentField.map(card => card.id)]);
    } else {
      setAttackTargets([]);
    }
  }, [selectedCreature, currentPlayer, opponentField, gamePhase]);
  
  // Calculate positions for both fields
  const playerPositions = calculateFieldPositions(playerField.length, 2);
  const opponentPositions = calculateFieldPositions(opponentField.length, -2);
  
  // Handle creature selection
  const handleCreatureClick = (index: number) => {
    if (currentPlayer === 'player' && gamePhase === 'attack') {
      selectCreature(index);
      playHit();
      toast.info(`${playerField[index].name} selected for attack`);
    }
  };
  
  // Handle attacking opponent's creature
  const handleOpponentCreatureClick = (index: number) => {
    if (selectedCreature !== null && 
        currentPlayer === 'player' && 
        gamePhase === 'attack' &&
        attackTargets.includes(opponentField[index].id)) {
      attackCreature(selectedCreature, index);
      playHit();
    }
  };
  
  // Handle attacking opponent directly
  const handleAttackOpponent = () => {
    if (selectedCreature !== null && 
        currentPlayer === 'player' && 
        gamePhase === 'attack' &&
        attackTargets.includes('opponent')) {
      attackPlayer(selectedCreature);
      playHit();
    }
  };
  
  return (
    <group ref={battlefieldRef} position={[position[0], position[1], position[2]]}>
      {/* Render the player's field */}
      {playerField.map((card, index) => (
        <Card
          key={`player-field-${card.id}`}
          card={card}
          position={playerPositions[index] || [0, 0, 0]}
          isPlayable={currentPlayer === 'player' && gamePhase === 'attack' && !card.tapped}
          isTapped={card.tapped}
          onClick={() => handleCreatureClick(index)}
        />
      ))}
      
      {/* Render the opponent's field */}
      {opponentField.map((card, index) => (
        <Card
          key={`opponent-field-${card.id}`}
          card={card}
          position={opponentPositions[index] || [0, 0, 0]}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          isPlayable={selectedCreature !== null && attackTargets.includes(card.id)}
          isTapped={card.tapped}
          onClick={() => handleOpponentCreatureClick(index)}
        />
      ))}
      
      {/* Opponent target area - for direct attacks */}
      {selectedCreature !== null && attackTargets.includes('opponent') && (
        <mesh 
          position={[0, 0, -3.5]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          onClick={handleAttackOpponent}
        >
          <circleGeometry args={[1, 32]} />
          <meshStandardMaterial color="#c92626" transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* Battlefield grid */}
      <mesh 
        position={[0, -0.05, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial 
          color="#1e415c"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
};

export default Battlefield;
