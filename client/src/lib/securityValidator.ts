/**
 * Comprehensive security validation system for Book of Spektrum
 * Prevents XSS, data corruption, and game exploits
 */

export interface SecurityValidationResult {
  isValid: boolean;
  sanitizedValue: any;
  errors: string[];
  warnings: string[];
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;')
    .trim();
};

/**
 * Validates and sanitizes card data to prevent game exploits
 */
export const validateCardData = (data: any): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sanitized: any = {};

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Card name is required and must be a string');
  } else if (data.name.length > 100) {
    errors.push('Card name too long (max 100 characters)');
  } else {
    sanitized.name = sanitizeHtml(data.name);
  }

  // Validate type
  const validTypes = ['avatar', 'spell', 'quickSpell', 'ritualArmor', 'field', 'equipment', 'item'];
  if (!validTypes.includes(data.type)) {
    errors.push('Invalid card type');
  } else {
    sanitized.type = data.type;
  }

  // Validate level (must be 1 or 2)
  if (data.level !== undefined) {
    const level = parseInt(data.level);
    if (isNaN(level) || level < 1 || level > 2) {
      errors.push('Card level must be 1 or 2');
    } else {
      sanitized.level = level;
    }
  }

  // Validate health (must be reasonable range)
  if (data.health !== undefined) {
    const health = parseInt(data.health);
    if (isNaN(health) || health < 0 || health > 99) {
      errors.push('Card health must be between 0 and 99');
    } else {
      sanitized.health = health;
    }
  }

  // Validate damage (must be reasonable range)
  if (data.damage !== undefined) {
    const damage = parseInt(data.damage);
    if (isNaN(damage) || damage < 0 || damage > 99) {
      errors.push('Card damage must be between 0 and 99');
    } else {
      sanitized.damage = damage;
    }
  }

  // Sanitize description
  if (data.description) {
    if (data.description.length > 500) {
      errors.push('Description too long (max 500 characters)');
    } else {
      sanitized.description = sanitizeHtml(data.description);
    }
  }

  // Validate energy cost array
  if (data.energyCost && Array.isArray(data.energyCost)) {
    const validElements = ['fire', 'water', 'ground', 'air', 'neutral'];
    const validCost = data.energyCost.every((element: any) => validElements.includes(element));
    if (!validCost) {
      errors.push('Invalid energy cost elements');
    } else if (data.energyCost.length > 10) {
      errors.push('Energy cost too high (max 10 elements)');
    } else {
      sanitized.energyCost = data.energyCost;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: sanitized,
    errors,
    warnings
  };
};

/**
 * Validates deck data to prevent deck building exploits
 */
export const validateDeckData = (deckCards: any[]): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!Array.isArray(deckCards)) {
    errors.push('Deck cards must be an array');
    return { isValid: false, sanitizedValue: [], errors, warnings };
  }

  // Check deck size limits
  if (deckCards.length < 40) {
    errors.push('Deck must have at least 40 cards');
  } else if (deckCards.length > 60) {
    errors.push('Deck cannot have more than 60 cards');
  }

  // Check card count limits (max 4 of each card, max 1 for level 2 avatars)
  const cardCounts = new Map<string, number>();
  const level2Avatars = new Set<string>();

  deckCards.forEach(card => {
    if (!card.name) {
      errors.push('All cards must have names');
      return;
    }

    const cardName = card.name;
    cardCounts.set(cardName, (cardCounts.get(cardName) || 0) + 1);

    // Track level 2 avatars
    if (card.type === 'avatar' && card.level === 2) {
      level2Avatars.add(cardName);
    }
  });

  // Validate card counts
  cardCounts.forEach((count, cardName) => {
    if (level2Avatars.has(cardName)) {
      if (count > 1) {
        errors.push(`Level 2 avatar "${cardName}" can only have 1 copy (found ${count})`);
      }
    } else {
      if (count > 4) {
        errors.push(`Card "${cardName}" can only have 4 copies (found ${count})`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    sanitizedValue: deckCards,
    errors,
    warnings
  };
};

/**
 * Validates game action to prevent game state manipulation
 */
export const validateGameAction = (action: any): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!action || typeof action !== 'object') {
    errors.push('Action must be an object');
    return { isValid: false, sanitizedValue: null, errors, warnings };
  }

  // Validate action type
  const validActions = ['playCard', 'useSkill', 'endTurn', 'evolveAvatar', 'attachCard'];
  if (!validActions.includes(action.type)) {
    errors.push('Invalid action type');
  }

  // Validate player ID to prevent impersonation
  if (action.playerId && typeof action.playerId !== 'string') {
    errors.push('Invalid player ID');
  }

  // Validate card ID format
  if (action.cardId && !/^[a-zA-Z0-9-_]+$/.test(action.cardId)) {
    errors.push('Invalid card ID format');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: action,
    errors,
    warnings
  };
};

/**
 * Validates purchase data to prevent financial exploits
 */
export const validatePurchaseData = (data: any): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Purchase data must be an object');
    return { isValid: false, sanitizedValue: null, errors, warnings };
  }

  // Validate price
  if (data.price !== undefined) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0 || price > 999.99) {
      errors.push('Invalid price range (must be $0.00 - $999.99)');
    }
  }

  // Validate item type
  const validItems = ['boosterPack', 'premadeDeck', 'battleSet'];
  if (!validItems.includes(data.itemType)) {
    errors.push('Invalid purchase item type');
  }

  // Validate quantity
  if (data.quantity !== undefined) {
    const quantity = parseInt(data.quantity);
    if (isNaN(quantity) || quantity < 1 || quantity > 99) {
      errors.push('Invalid quantity (must be 1-99)');
    }
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: data,
    errors,
    warnings
  };
};

/**
 * Rate limiting for API calls to prevent abuse
 */
class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  private readonly windowMs: number = 60000; // 1 minute
  private readonly maxCalls: number = 100; // Max calls per window

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(identifier) || [];
    
    // Remove old calls outside the window
    const recentCalls = calls.filter(time => now - time < this.windowMs);
    
    if (recentCalls.length >= this.maxCalls) {
      return false;
    }

    // Add current call
    recentCalls.push(now);
    this.calls.set(identifier, recentCalls);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Comprehensive security audit for the entire game state
 */
export const performSecurityAudit = (gameState: any): SecurityValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Audit player data
  if (gameState.player) {
    if (gameState.player.health && gameState.player.health > 100) {
      errors.push('Player health exceeds maximum allowed value');
    }
    if (gameState.player.energy && gameState.player.energy > 20) {
      errors.push('Player energy exceeds maximum allowed value');
    }
  }

  // Audit deck composition
  if (gameState.deck) {
    const deckValidation = validateDeckData(gameState.deck);
    errors.push(...deckValidation.errors);
    warnings.push(...deckValidation.warnings);
  }

  // Audit card states
  if (gameState.battlefield && Array.isArray(gameState.battlefield)) {
    gameState.battlefield.forEach((card: any, index: number) => {
      if (card.health && card.health > 99) {
        errors.push(`Card ${index} has invalid health value`);
      }
      if (card.damage && card.damage > 99) {
        errors.push(`Card ${index} has invalid damage value`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue: gameState,
    errors,
    warnings
  };
};