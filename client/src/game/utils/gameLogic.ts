import { FieldCard } from '../stores/useCardGame';
import { CardData } from '../components/Card';

// Calculate damage between two creatures and return results
export function calculateDamage(
  attacker: FieldCard,
  defender: FieldCard
): [FieldCard, FieldCard, boolean, boolean] {
  // Apply damage
  const attackerDamage = defender.attack || 0;
  const defenderDamage = attacker.attack || 0;
  
  // Update health
  const attackerNewHealth = (attacker.health || 0) - attackerDamage;
  const defenderNewHealth = (defender.health || 0) - defenderDamage;
  
  // Check if either creature died
  const attackerDied = attackerNewHealth <= 0;
  const defenderDied = defenderNewHealth <= 0;
  
  // Create updated versions
  const updatedAttacker: FieldCard = {
    ...attacker,
    damage: attacker.damage + attackerDamage,
    health: attackerNewHealth
  };
  
  const updatedDefender: FieldCard = {
    ...defender,
    damage: defender.damage + defenderDamage,
    health: defenderNewHealth
  };
  
  return [updatedAttacker, updatedDefender, attackerDied, defenderDied];
}

// Check if there's a winner based on health values
export function checkWinner(
  playerHealth: number,
  opponentHealth: number
): 'player' | 'opponent' | null {
  if (playerHealth <= 0) {
    return 'opponent';
  }
  
  if (opponentHealth <= 0) {
    return 'player';
  }
  
  return null;
}

// Handle spell effects based on the card's effect type
export function handleSpellEffect(
  spellCard: CardData,
  gameState: any
) {
  const effect = spellCard.effect;
  const updatedState = { ...gameState };
  
  switch (effect) {
    case 'heal_player':
      // Healing Light - restore 3 health to player
      if (gameState.currentPlayer === 'player') {
        updatedState.playerHealth = Math.min(gameState.playerHealth + 3, 20);
      } else {
        updatedState.opponentHealth = Math.min(gameState.opponentHealth + 3, 20);
      }
      break;
      
    case 'damage_all_enemies':
      // Fireball - deal 2 damage to all enemy creatures
      if (gameState.currentPlayer === 'player') {
        // Player cast spell against opponent creatures
        const opponentField = gameState.opponentField.map((card: FieldCard) => ({
          ...card,
          health: (card.health || 0) - 2,
          damage: card.damage + 2
        }));
        
        // Remove dead creatures
        updatedState.opponentField = opponentField.filter((card: FieldCard) => 
          (card.health || 0) > 0
        );
      } else {
        // Opponent cast spell against player creatures
        const playerField = gameState.playerField.map((card: FieldCard) => ({
          ...card,
          health: (card.health || 0) - 2,
          damage: card.damage + 2
        }));
        
        // Remove dead creatures
        updatedState.playerField = playerField.filter((card: FieldCard) => 
          (card.health || 0) > 0
        );
      }
      break;
      
    case 'buff_all_creatures':
      // Nature's Blessing - give all your creatures +1/+1
      if (gameState.currentPlayer === 'player') {
        updatedState.playerField = gameState.playerField.map((card: FieldCard) => ({
          ...card,
          attack: (card.attack || 0) + 1,
          health: (card.health || 0) + 1
        }));
      } else {
        updatedState.opponentField = gameState.opponentField.map((card: FieldCard) => ({
          ...card,
          attack: (card.attack || 0) + 1,
          health: (card.health || 0) + 1
        }));
      }
      break;
      
    case 'damage_opponent':
      // Lightning Strike - deal 3 damage to opponent
      if (gameState.currentPlayer === 'player') {
        updatedState.opponentHealth = gameState.opponentHealth - 3;
      } else {
        updatedState.playerHealth = gameState.playerHealth - 3;
      }
      
      // Check for winner
      const winner = checkWinner(
        updatedState.playerHealth, 
        updatedState.opponentHealth
      );
      
      if (winner) {
        updatedState.winner = winner;
      }
      break;
  }
  
  return updatedState;
}
