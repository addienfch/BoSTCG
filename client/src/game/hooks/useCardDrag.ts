import { useState, useCallback } from 'react';
import * as THREE from 'three';

export function useCardDrag() {
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(new THREE.Vector3(0, 0, 0));
  
  // Start dragging a card
  const startDrag = useCallback((cardIndex: number) => {
    setDraggedCard(cardIndex);
    setIsDragging(true);
    // Initialize with a position that feels natural for picking up a card
    setDragPosition(new THREE.Vector3(0, 0.5, 3));
  }, []);
  
  // Update drag position
  const updateDragPosition = useCallback((position: THREE.Vector3) => {
    setDragPosition(position);
  }, []);
  
  // End dragging
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDraggedCard(null);
  }, []);
  
  return {
    draggedCard,
    isDragging,
    dragPosition,
    setDraggedCard,
    startDrag,
    updateDragPosition,
    endDrag
  };
}
