/**
 * Comprehensive input validation for dev tools and user inputs
 */

import { ElementType, RarityType, CardType } from '../game/data/cardTypes';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates card creation form data
 */
export const validateCardData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validations
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Card name is required');
  } else if (data.name.length < 2) {
    errors.push('Card name must be at least 2 characters');
  } else if (data.name.length > 50) {
    errors.push('Card name cannot exceed 50 characters');
  }

  if (!data.type) {
    errors.push('Card type is required');
  } else if (!['avatar', 'spell', 'quickSpell', 'ritualArmor', 'field', 'equipment', 'item'].includes(data.type)) {
    errors.push('Invalid card type');
  }

  if (!data.element) {
    errors.push('Element is required');
  } else if (!['fire', 'water', 'ground', 'air', 'neutral'].includes(data.element)) {
    errors.push('Invalid element type');
  }

  if (!data.rarity) {
    errors.push('Rarity is required');
  } else if (!['common', 'uncommon', 'rare', 'superRare', 'mythic'].includes(data.rarity)) {
    errors.push('Invalid rarity type');
  }

  // Numeric validations
  if (data.level !== undefined) {
    const level = parseInt(data.level);
    if (isNaN(level) || level < 1 || level > 10) {
      errors.push('Level must be between 1 and 10');
    }
  }

  if (data.health !== undefined) {
    const health = parseInt(data.health);
    if (isNaN(health) || health < 1 || health > 999) {
      errors.push('Health must be between 1 and 999');
    }
  }

  // Skill damage validations
  if (data.skill1Damage !== undefined) {
    const damage = parseInt(data.skill1Damage);
    if (isNaN(damage) || damage < 0 || damage > 999) {
      errors.push('Skill 1 damage must be between 0 and 999');
    }
  }

  if (data.skill2Damage !== undefined) {
    const damage = parseInt(data.skill2Damage);
    if (isNaN(damage) || damage < 0 || damage > 999) {
      errors.push('Skill 2 damage must be between 0 and 999');
    }
  }

  // String length validations
  if (data.description && data.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (data.subType && data.subType.length > 50) {
    errors.push('Sub-type cannot exceed 50 characters');
  }

  // Skill name validations
  if (data.skill1Name && data.skill1Name.length > 50) {
    errors.push('Skill 1 name cannot exceed 50 characters');
  }

  if (data.skill2Name && data.skill2Name.length > 50) {
    errors.push('Skill 2 name cannot exceed 50 characters');
  }

  // Warnings for potentially problematic inputs
  if (data.name && /[<>"\']/.test(data.name)) {
    warnings.push('Card name contains potentially problematic characters');
  }

  if (data.description && /[<>]/.test(data.description)) {
    warnings.push('Description contains HTML-like characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates expansion data
 */
export const validateExpansionData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('Expansion ID is required');
  } else if (data.id.length < 3) {
    errors.push('Expansion ID must be at least 3 characters');
  } else if (!/^[a-z0-9-]+$/.test(data.id)) {
    errors.push('Expansion ID can only contain lowercase letters, numbers, and hyphens');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Expansion name is required');
  } else if (data.name.length < 2) {
    errors.push('Expansion name must be at least 2 characters');
  } else if (data.name.length > 100) {
    errors.push('Expansion name cannot exceed 100 characters');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }

  if (data.totalCards !== undefined) {
    const total = parseInt(data.totalCards);
    if (isNaN(total) || total < 1 || total > 1000) {
      errors.push('Total cards must be between 1 and 1000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates deck data
 */
export const validateDeckData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Deck name is required');
  } else if (data.name.length < 2) {
    errors.push('Deck name must be at least 2 characters');
  } else if (data.name.length > 100) {
    errors.push('Deck name cannot exceed 100 characters');
  }

  if (data.description && data.description.length > 500) {
    errors.push('Description cannot exceed 500 characters');
  }

  if (data.price !== undefined) {
    const price = parseFloat(data.price);
    if (isNaN(price) || price < 0 || price > 999.99) {
      errors.push('Price must be between $0.00 and $999.99');
    }
  }

  if (!data.difficulty) {
    errors.push('Difficulty level is required');
  } else if (!['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(data.difficulty)) {
    errors.push('Invalid difficulty level');
  }

  if (data.cardCount !== undefined) {
    const count = parseInt(data.cardCount);
    if (isNaN(count) || count < 40 || count > 60) {
      errors.push('Card count must be between 40 and 60');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitizes string input to prevent XSS and other issues
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML-like characters
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

/**
 * Validates numeric input with bounds
 */
export const validateNumeric = (value: any, min: number, max: number): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const num = parseFloat(value);
  if (isNaN(num)) {
    errors.push('Must be a valid number');
  } else if (num < min) {
    errors.push(`Must be at least ${min}`);
  } else if (num > max) {
    errors.push(`Must be at most ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    } else if (email.length > 254) {
      errors.push('Email too long');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates URL format
 */
export const validateUrl = (url: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!url || typeof url !== 'string') {
    errors.push('URL is required');
  } else {
    try {
      new URL(url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        warnings.push('URL should start with http:// or https://');
      }
    } catch {
      errors.push('Invalid URL format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};