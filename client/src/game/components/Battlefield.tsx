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
    playerActiveAvatar,
    playerReserveAvatars, 
    playerFieldCards,
    opponentActiveAvatar,
    opponentReserveAvatars,
    opponentFieldCards,
    currentPlayer, 
    selectedCard,
    selectedTarget, 
    selectTarget,
    useAvatarSkill,
    gamePhase
  } = useCardGame();
  const { playHit } = useAudio();
  
  // For highlighting possible attack targets
  const [attackTargets, setAttackTargets] = useState<string[]>([]);
  
  // Calculate field positions
  const calculateFieldPositions = (count: number, zOffset: number) => {
    const spacing = 1.5;
    const totalWidth = (count - 1) * spacing;
    const startX = -totalWidth / 2;
    
    return Array.from({ length: count }).map((_, index) => {
      return [startX + (index * spacing) + position[0], position[1], zOffset + position[2]] as [number, number, number];
    });
  };
  
  // Update attackable targets during battle phase
  useEffect(() => {
    if (currentPlayer === 'player' && gamePhase === 'battle' && playerActiveAvatar && !playerActiveAvatar.tapped) {
      // Can attack the opponent's active avatar
      if (opponentActiveAvatar) {
        setAttackTargets(['opponent-avatar']);
      } else {
        // Can't attack if opponent has no avatar
        setAttackTargets([]);
      }
    } else {
      setAttackTargets([]);
    }
  }, [currentPlayer, gamePhase, playerActiveAvatar, opponentActiveAvatar]);
  
  // Calculate positions for field cards
  const playerFieldPositions = calculateFieldPositions(playerFieldCards.length, 1.5);
  const opponentFieldPositions = calculateFieldPositions(opponentFieldCards.length, -1.5);
  
  // Handle attacking opponent's avatar
  const handleAttackOpponentAvatar = () => {
    if (currentPlayer === 'player' && 
        gamePhase === 'battle' && 
        playerActiveAvatar && 
        !playerActiveAvatar.tapped && 
        opponentActiveAvatar) {
      
      // Use skill 1 for attacking (simplified battle system)
      if (playerActiveAvatar.skill1) {
        useAvatarSkill(1, 'opponent-avatar');
        playHit();
        toast.info(`${playerActiveAvatar.name} uses ${playerActiveAvatar.skill1.name} to attack!`);
      } else {
        toast.error('This avatar has no attack skill.');
      }
    }
  };
  
  // Handle selecting player's avatar for targetable actions
  const handlePlayerAvatarClick = () => {
    if (selectedCard !== null && (gamePhase === 'main1' || gamePhase === 'main2')) {
      selectTarget('player-avatar');
      playHit();
    }
  };
  
  // Calculate player avatar position
  const playerAvatarPosition: [number, number, number] = [0, 0, 3];
  
  // Calculate opponent avatar position
  const opponentAvatarPosition: [number, number, number] = [0, 0, -3];
  
  // Calculate reserve avatar positions (to the right of active avatars)
  const playerReservePositions = calculateFieldPositions(playerReserveAvatars.length, 4);
  const opponentReservePositions = calculateFieldPositions(opponentReserveAvatars.length, -4);
  
  return (
    <group ref={battlefieldRef} position={[position[0], position[1], position[2]]}>
      {/* Render the player's active avatar */}
      {playerActiveAvatar && (
        <Card
          key={`player-avatar-${playerActiveAvatar.id}`}
          card={playerActiveAvatar}
          position={playerAvatarPosition}
          scale={1.2} // Make avatar slightly larger
          isPlayable={currentPlayer === 'player' && (gamePhase === 'main1' || gamePhase === 'main2')}
          isTapped={playerActiveAvatar.tapped}
          onClick={handlePlayerAvatarClick}
        />
      )}
      
      {/* Render the player's reserve avatars */}
      {playerReserveAvatars.map((card, index) => (
        <Card
          key={`player-reserve-${card.id}`}
          card={card}
          position={playerReservePositions[index] || [2, 0, 3]}
          scale={0.8} // Make reserves slightly smaller
          isPlayable={false} // Cannot directly activate
          onClick={() => toast.info(`Reserve avatar: ${card.name}`)}
        />
      ))}
      
      {/* Render the player's field cards */}
      {playerFieldCards.map((card, index) => (
        <Card
          key={`player-field-${card.id}`}
          card={card}
          position={playerFieldPositions[index] || [0, 0, 1.5]}
          scale={0.9}
          isPlayable={false} // Field cards are passive
          onClick={() => toast.info(`Field card: ${card.name}`)}
        />
      ))}
      
      {/* Render the opponent's active avatar */}
      {opponentActiveAvatar && (
        <Card
          key={`opponent-avatar-${opponentActiveAvatar.id}`}
          card={opponentActiveAvatar}
          position={opponentAvatarPosition}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={1.2} // Make avatar slightly larger
          isPlayable={attackTargets.includes('opponent-avatar')}
          isTapped={opponentActiveAvatar.tapped}
          onClick={handleAttackOpponentAvatar}
        />
      )}
      
      {/* Render the opponent's reserve avatars */}
      {opponentReserveAvatars.map((card, index) => (
        <Card
          key={`opponent-reserve-${card.id}`}
          card={card}
          position={opponentReservePositions[index] || [2, 0, -3]}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={0.8} // Make reserves slightly smaller
          isPlayable={false} // Cannot target reserves
          onClick={() => toast.info(`Opponent's reserve avatar: ${card.name}`)}
        />
      ))}
      
      {/* Render the opponent's field cards */}
      {opponentFieldCards.map((card, index) => (
        <Card
          key={`opponent-field-${card.id}`}
          card={card}
          position={opponentFieldPositions[index] || [0, 0, -1.5]}
          rotation={[0, Math.PI, 0]} // Flip cards to face the player
          scale={0.9}
          isPlayable={false} // Field cards cannot be targeted (for simplicity)
          onClick={() => toast.info(`Opponent's field card: ${card.name}`)}
        />
      ))}
      
      {/* Battlefield grid */}
      <mesh 
        position={[0, -0.05, 0]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[12, 10]} />
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
