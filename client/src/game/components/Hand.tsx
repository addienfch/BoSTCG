import { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import Card, { CardData } from './Card';
import { useCardGame } from '../stores/useCardGame';
import { useCardDrag } from '../hooks/useCardDrag';
import { Vector3 } from 'three';

interface HandProps {
  position?: [number, number, number];
}

const Hand = ({ position = [0, 0, 0] }: HandProps) => {
  const { playerHand, mana, playCard } = useCardGame();
  const { size } = useThree();
  const handRef = useRef<THREE.Group>(null);
  
  // Card drag state
  const { 
    draggedCard, 
    isDragging, 
    setDraggedCard, 
    dragPosition, 
    endDrag,
    startDrag,
    updateDragPosition
  } = useCardDrag();
  
  // Adjust layout based on screen size and number of cards
  const [cardPositions, setCardPositions] = useState<Array<[number, number, number]>>([]);
  
  // Calculate card positions based on hand size and screen dimensions
  useEffect(() => {
    if (!playerHand.length) return;
    
    const isMobile = size.width < 768;
    const cardWidth = 1;
    const cardSpacing = isMobile ? 0.7 : 1.2;
    const totalWidth = (playerHand.length - 1) * cardSpacing;
    const startX = -totalWidth / 2;
    
    const newPositions = playerHand.map((_, index) => {
      // Calculate x position with a slight arc
      const x = startX + index * cardSpacing;
      
      // Calculate y and z to create an arc effect
      const arcHeight = 0.1;
      const normalizedPos = (index / (playerHand.length - 1) - 0.5) * 2;
      const y = -Math.abs(normalizedPos) * arcHeight + 0.1;
      const z = Math.abs(normalizedPos) * 0.3;
      
      return [x + position[0], y + position[1], z + position[2]];
    });
    
    setCardPositions(newPositions);
  }, [playerHand.length, size.width, position]);
  
  // Check if a card is playable (has enough mana)
  const isCardPlayable = (card: CardData) => {
    return card.cost <= mana;
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
  
  // Play a card when drag ends
  const handleDragEnd = () => {
    if (draggedCard !== null) {
      const card = playerHand[draggedCard];
      if (dragPosition.z < 2) { // Only play if dragged forward onto the battlefield
        playCard(draggedCard);
      }
      endDrag();
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
            onDragStart={() => {
              if (playable) {
                startDrag(index);
              }
            }}
            onDragEnd={handleDragEnd}
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
    </group>
  );
};

export default Hand;
