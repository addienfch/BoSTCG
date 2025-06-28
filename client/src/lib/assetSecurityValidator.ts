/**
 * Asset Security Validator for Book of Spektrum
 * Validates and secures all asset paths to prevent broken resources and security issues
 */

export interface AssetValidationResult {
  isValid: boolean;
  secureUrl: string;
  fallbackUrl?: string;
  errors: string[];
}

/**
 * Validates and secures image paths
 */
export const validateImagePath = async (imagePath: string): Promise<AssetValidationResult> => {
  const errors: string[] = [];
  
  if (!imagePath || typeof imagePath !== 'string') {
    errors.push('Image path must be a valid string');
    return {
      isValid: false,
      secureUrl: '/textures/cards/card_back.png',
      fallbackUrl: '/textures/cards/card_back.png',
      errors
    };
  }

  // Security check: Only allow specific asset directories
  const allowedPaths = [
    '/textures/',
    '/models/',
    '/audio/',
    '/icons/',
    '/ui/'
  ];

  const isAllowedPath = allowedPaths.some(allowed => imagePath.startsWith(allowed));
  if (!isAllowedPath) {
    errors.push('Asset path not in allowed directories');
    return {
      isValid: false,
      secureUrl: '/textures/cards/card_back.png',
      fallbackUrl: '/textures/cards/card_back.png',
      errors
    };
  }

  // Security check: Prevent directory traversal
  if (imagePath.includes('..') || imagePath.includes('//')) {
    errors.push('Invalid path: directory traversal detected');
    return {
      isValid: false,
      secureUrl: '/textures/cards/card_back.png',
      fallbackUrl: '/textures/cards/card_back.png',
      errors
    };
  }

  // Check if file exists (simplified check)
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    if (!response.ok) {
      errors.push('Asset file not found');
      return {
        isValid: false,
        secureUrl: getSecureFallback(imagePath),
        fallbackUrl: '/textures/cards/card_back.png',
        errors
      };
    }
  } catch (error) {
    errors.push('Unable to verify asset existence');
    return {
      isValid: false,
      secureUrl: getSecureFallback(imagePath),
      fallbackUrl: '/textures/cards/card_back.png',
      errors
    };
  }

  return {
    isValid: true,
    secureUrl: imagePath,
    errors: []
  };
};

/**
 * Get secure fallback for different asset types
 */
const getSecureFallback = (originalPath: string): string => {
  if (originalPath.includes('/cards/')) {
    return '/textures/cards/card_back.png';
  }
  if (originalPath.includes('/avatars/')) {
    return '/textures/cards/default_avatar.png';
  }
  if (originalPath.includes('/spells/')) {
    return '/textures/cards/default_spell.png';
  }
  if (originalPath.includes('/booster/')) {
    return '/textures/cards/booster_pack.png';
  }
  return '/textures/cards/card_back.png';
};

/**
 * Validates 3D model paths
 */
export const validateModelPath = async (modelPath: string): Promise<AssetValidationResult> => {
  const errors: string[] = [];
  
  if (!modelPath || typeof modelPath !== 'string') {
    errors.push('Model path must be a valid string');
    return {
      isValid: false,
      secureUrl: '/models/default_card.glb',
      fallbackUrl: '/models/default_card.glb',
      errors
    };
  }

  // Only allow .glb and .gltf files from models directory
  if (!modelPath.startsWith('/models/') || 
      (!modelPath.endsWith('.glb') && !modelPath.endsWith('.gltf'))) {
    errors.push('Invalid model path or format');
    return {
      isValid: false,
      secureUrl: '/models/default_card.glb',
      fallbackUrl: '/models/default_card.glb',
      errors
    };
  }

  // Security check: Prevent directory traversal
  if (modelPath.includes('..') || modelPath.includes('//')) {
    errors.push('Invalid path: directory traversal detected');
    return {
      isValid: false,
      secureUrl: '/models/default_card.glb',
      fallbackUrl: '/models/default_card.glb',
      errors
    };
  }

  return {
    isValid: true,
    secureUrl: modelPath,
    errors: []
  };
};

/**
 * Validates audio file paths
 */
export const validateAudioPath = async (audioPath: string): Promise<AssetValidationResult> => {
  const errors: string[] = [];
  
  if (!audioPath || typeof audioPath !== 'string') {
    errors.push('Audio path must be a valid string');
    return {
      isValid: false,
      secureUrl: '/audio/default.mp3',
      fallbackUrl: '/audio/default.mp3',
      errors
    };
  }

  // Only allow audio files from audio directory
  const allowedFormats = ['.mp3', '.wav', '.ogg'];
  const hasValidFormat = allowedFormats.some(format => audioPath.endsWith(format));
  
  if (!audioPath.startsWith('/audio/') || !hasValidFormat) {
    errors.push('Invalid audio path or format');
    return {
      isValid: false,
      secureUrl: '/audio/default.mp3',
      fallbackUrl: '/audio/default.mp3',
      errors
    };
  }

  // Security check: Prevent directory traversal
  if (audioPath.includes('..') || audioPath.includes('//')) {
    errors.push('Invalid path: directory traversal detected');
    return {
      isValid: false,
      secureUrl: '/audio/default.mp3',
      fallbackUrl: '/audio/default.mp3',
      errors
    };
  }

  return {
    isValid: true,
    secureUrl: audioPath,
    errors: []
  };
};

/**
 * Batch validate multiple assets
 */
export const validateAssetBatch = async (assets: { path: string; type: 'image' | 'model' | 'audio' }[]): Promise<Map<string, AssetValidationResult>> => {
  const results = new Map<string, AssetValidationResult>();
  
  const validationPromises = assets.map(async (asset) => {
    let result: AssetValidationResult;
    
    switch (asset.type) {
      case 'image':
        result = await validateImagePath(asset.path);
        break;
      case 'model':
        result = await validateModelPath(asset.path);
        break;
      case 'audio':
        result = await validateAudioPath(asset.path);
        break;
      default:
        result = {
          isValid: false,
          secureUrl: asset.path,
          errors: ['Unknown asset type']
        };
    }
    
    results.set(asset.path, result);
  });
  
  await Promise.allSettled(validationPromises);
  return results;
};

/**
 * Security-focused asset preloader
 */
export class SecureAssetPreloader {
  private loadedAssets: Set<string> = new Set();
  private failedAssets: Set<string> = new Set();
  
  async preloadImage(imagePath: string): Promise<boolean> {
    if (this.loadedAssets.has(imagePath)) return true;
    if (this.failedAssets.has(imagePath)) return false;
    
    const validation = await validateImagePath(imagePath);
    if (!validation.isValid) {
      this.failedAssets.add(imagePath);
      return false;
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.loadedAssets.add(imagePath);
        resolve(true);
      };
      img.onerror = () => {
        this.failedAssets.add(imagePath);
        resolve(false);
      };
      img.src = validation.secureUrl;
    });
  }
  
  getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets);
  }
  
  getFailedAssets(): string[] {
    return Array.from(this.failedAssets);
  }
  
  getLoadingStats(): { loaded: number; failed: number; total: number } {
    const loaded = this.loadedAssets.size;
    const failed = this.failedAssets.size;
    return {
      loaded,
      failed,
      total: loaded + failed
    };
  }
}

export const secureAssetPreloader = new SecureAssetPreloader();

/**
 * Comprehensive asset audit
 */
export const performAssetAudit = async (): Promise<{
  totalAssets: number;
  validAssets: number;
  invalidAssets: number;
  missingAssets: string[];
  securityIssues: string[];
}> => {
  const commonAssets = [
    '/textures/cards/card_back.png',
    '/textures/cards/booster_pack.png',
    '/textures/cards/default_avatar.png',
    '/textures/cards/default_spell.png',
    '/models/default_card.glb',
    '/audio/default.mp3'
  ];
  
  const results = await validateAssetBatch(
    commonAssets.map(path => ({
      path,
      type: path.includes('/models/') ? 'model' as const :
            path.includes('/audio/') ? 'audio' as const :
            'image' as const
    }))
  );
  
  let validAssets = 0;
  let invalidAssets = 0;
  const missingAssets: string[] = [];
  const securityIssues: string[] = [];
  
  results.forEach((result, path) => {
    if (result.isValid) {
      validAssets++;
    } else {
      invalidAssets++;
      missingAssets.push(path);
      securityIssues.push(...result.errors);
    }
  });
  
  return {
    totalAssets: commonAssets.length,
    validAssets,
    invalidAssets,
    missingAssets,
    securityIssues
  };
};