import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Card, { CardData } from './Card';
import { useCardGame } from '../stores/useCardGame';
import { useCardDrag } from '../hooks/useCardDrag';
import { Vector3, Group } from 'three';
import { toast } from 'sonner';

interface HandProps {
  position?: [number, number, number];
}

const Hand = ({ position = [0, 0, 0] }: HandProps) => {
  const { 
    playerHand, 
    playerEnergyPile, 
    playCard, 
    selectCard, 
    setEnergyCard,
    gamePhase, 
    currentPlayer 
  } = useCardGame();
  const { size } = useThree();
  const handRef = useRef<Group>(null);
  
  // Card drag state
  const { 
    draggedCard, 
    isDragging, 
    dragPosition, 
    endDrag,
    startDrag,
    updateDragPosition
  } = useCardDrag();
  
  // Adjust layout based on screen size and number of cards
  const [cardPositions, setCardPositions] = useState<Array<[number, number, number]>>([]);
  
  // Calculate card positions based on hand size and screen dimensions - optimized for mobile
  useEffect(() => {
    if (!playerHand.length) return;
    
    // Even more compact layout for mobile screens
    const isMobile = true; // Always use mobile layout for this form factor
    const cardSpacing = isMobile ? 0.6 : 1.2; // Smaller spacing for mobile
    const totalWidth = (playerHand.length - 1) * cardSpacing;
    const startX = -totalWidth / 2;
    
    const newPositions: Array<[number, number, number]> = [];
    
    for (let index = 0; index < playerHand.length; index++) {
      // Calculate x position with a slight arc
      const x = startX + index * cardSpacing;
      
      // Calculate y and z to create a more pronounced arc effect for mobile
      const arcHeight = 0.15; // Reduced arc height to fit view
      const normalizedPos = (index / Math.max(1, playerHand.length - 1) - 0.5) * 2;
      
      // Move cards up in frame for better visibility in mobile portrait mode
      const y = -Math.abs(normalizedPos) * arcHeight - 0.1; // Closer to eye level
      
      // Curve the hand toward the camera for better visibility
      const z = 1.0 - Math.abs(normalizedPos) * 0.3; // More prominent fan for visibility
      
      newPositions.push([
        x + position[0], 
        y + position[1], 
        z + position[2]
      ]);
    }
    
    setCardPositions(newPositions);
  }, [playerHand.length, size.width, position]);
  
  // Check if a card is playable based on game state and card type
  const isCardPlayable = (card: CardData) => {
    // Can only play cards during main phases and on player's turn
    if (currentPlayer !== 'player' || (gamePhase !== 'main1' && gamePhase !== 'main2')) {
      return false;
    }
    
    // Avatar cards can always be played (either as avatar or energy)
    if (card.type === 'avatar') {
      return true;
    }
    
    // For action cards, check if player has enough energy
    return (card.energyCost || 0) <= playerEnergyPile.length;
  };
  
  // Set up touch/mouse move handler for dragging
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || draggedCard === null) return;
      
      // Calculate pointer position in 3D space
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      
      // Update drag position
      updateDragPosition(new Vector3(x * 5, 0.5, y * 4 - 1));
    };
    
    // Add event listeners
    window.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isDragging, draggedCard, size, updateDragPosition]);
  
  // Handle card actions based on drag position
  const handleDragEnd = () => {
    if (draggedCard !== null) {
      const card = playerHand[draggedCard];
      
      // Determine action based on where the card was dragged
      if (dragPosition.z < -2) {
        // Dragged backward (toward player) - use as energy
        if (card.type === 'avatar') {
          setEnergyCard(draggedCard);
          toast.success(`Using ${card.name} as energy`);
        } else {
          toast.error('Only Avatar cards can be used as energy');
        }
      } else if (dragPosition.z > 2) {
        // Dragged forward (toward battlefield)
        
        // For avatar and field cards, can play directly
        if (card.type === 'avatar' || card.type === 'field') {
          playCard(draggedCard);
        } 
        // For other cards that need targeting, select the card first
        else {
          selectCard(draggedCard);
          toast.info(`Select a target for ${card.name}`);
        }
      } else {
        // If not dragged far enough, simply select the card
        selectCard(draggedCard);
        toast.info(`${card.name} selected. Drag forward to play, backward to use as energy, or click a target.`);
      }
      
      endDrag();
    }
  };
  
  // Handle direct click on card
  const handleCardClick = (index: number) => {
    const card = playerHand[index];
    
    if (isCardPlayable(card)) {
      // Select the card
      selectCard(index);
      toast.info(`Selected ${card.name}. Now choose a target.`);
    } else {
      toast.error('Cannot play this card now');
    }
  };
  
  return (
    <group ref={handRef} position={[position[0], position[1], position[2]]}>
      {playerHand.map((card, index) => {
        // Skip rendering the card being dragged in its original position
        if (draggedCard === index && isDragging) return null;
        
        // Determine if card can be played
        const playable = isCardPlayable(card);
        
        // Calculate rotation for hand cards - slight fan effect
        const rotationY = ((index / (playerHand.length - 1)) - 0.5) * 0.3;
        
        return (
          <Card
            key={`hand-${card.id}`}
            card={card}
            position={cardPositions[index] || [0, 0, 0]}
            rotation={[0, rotationY, 0]}
            isPlayable={playable}
            isInHand={true}
            isBeingDrawn={card.isBeingDrawn}
            drawAnimationDelay={index * 300} // Stagger animations
            onDragStart={() => {
              if (playable) {
                startDrag(index);
              }
            }}
            onDragEnd={handleDragEnd}
            onClick={() => handleCardClick(index)}
          />
        );
      })}
      
      {/* Render dragged card separately to keep it on top */}
      {isDragging && draggedCard !== null && (
        <Card
          card={playerHand[draggedCard]}
          position={[dragPosition.x, dragPosition.y, dragPosition.z]}
          rotation={[0, 0, 0]}
          isPlayable={true}
          isInHand={false}
          isDragging={true}
          scale={1.2}
        />
      )}
      
      {/* Energy pile indicator */}
      <group position={[position[0] - 4, position[1], position[2]]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial color="#2a6e82" />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </group>
    </group>
  );
};

export default Hand;
