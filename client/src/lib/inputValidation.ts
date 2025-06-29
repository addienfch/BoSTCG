/**
 * Enhanced Input Validation and Sanitization System
 * Provides comprehensive validation for all user inputs
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
  warnings: string[];
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  allowHtml?: boolean;
  allowSpecialChars?: boolean;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: string) => boolean;
}

class InputValidator {
  private xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<object[^>]*>/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /<link[^>]*rel=['"]?stylesheet['"]?[^>]*>/gi
  ];

  private dangerousPatterns = [
    /\.\.\//g,  // Path traversal
    /\0/g,      // Null bytes
    /[\x00-\x08\x0E-\x1F\x7F]/g, // Control characters
  ];

  /**
   * Validates and sanitizes user input
   */
  validateInput(value: string, options: ValidationOptions = {}): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: value || '',
      errors: [],
      warnings: []
    };

    // Required field validation
    if (options.required && (!value || value.trim().length === 0)) {
      result.isValid = false;
      result.errors.push('This field is required');
      return result;
    }

    // Skip further validation if empty and not required
    if (!value) {
      return result;
    }

    // Length validation
    if (options.maxLength && value.length > options.maxLength) {
      result.isValid = false;
      result.errors.push(`Maximum length is ${options.maxLength} characters`);
    }

    if (options.minLength && value.length < options.minLength) {
      result.isValid = false;
      result.errors.push(`Minimum length is ${options.minLength} characters`);
    }

    // XSS protection
    result.sanitizedValue = this.sanitizeXSS(value);
    if (result.sanitizedValue !== value) {
      result.warnings.push('Potentially dangerous content was removed');
    }

    // Remove dangerous patterns
    const beforeDangerousClean = result.sanitizedValue;
    result.sanitizedValue = this.removeDangerousPatterns(result.sanitizedValue);
    if (result.sanitizedValue !== beforeDangerousClean) {
      result.warnings.push('Suspicious patterns were removed');
    }

    // HTML validation
    if (!options.allowHtml && this.containsHtml(result.sanitizedValue)) {
      result.sanitizedValue = this.stripHtml(result.sanitizedValue);
      result.warnings.push('HTML tags were removed');
    }

    // Special characters validation
    if (!options.allowSpecialChars && this.containsSpecialChars(result.sanitizedValue)) {
      result.sanitizedValue = this.removeSpecialChars(result.sanitizedValue);
      result.warnings.push('Special characters were removed');
    }

    // Pattern validation
    if (options.pattern && !options.pattern.test(result.sanitizedValue)) {
      result.isValid = false;
      result.errors.push('Input format is invalid');
    }

    // Custom validation
    if (options.customValidator && !options.customValidator(result.sanitizedValue)) {
      result.isValid = false;
      result.errors.push('Input failed custom validation');
    }

    // Final trim
    result.sanitizedValue = result.sanitizedValue.trim();

    return result;
  }

  /**
   * Validates card name input
   */
  validateCardName(name: string): ValidationResult {
    return this.validateInput(name, {
      required: true,
      maxLength: 100,
      minLength: 2,
      allowHtml: false,
      allowSpecialChars: true,
      pattern: /^[a-zA-Z0-9\s\-'\.!]+$/
    });
  }

  /**
   * Validates expansion ID input
   */
  validateExpansionId(id: string): ValidationResult {
    return this.validateInput(id, {
      required: true,
      maxLength: 50,
      minLength: 3,
      allowHtml: false,
      allowSpecialChars: false,
      pattern: /^[a-z0-9\-]+$/,
      customValidator: (value) => !value.startsWith('-') && !value.endsWith('-')
    });
  }

  /**
   * Validates description text
   */
  validateDescription(description: string): ValidationResult {
    return this.validateInput(description, {
      required: false,
      maxLength: 1000,
      allowHtml: false,
      allowSpecialChars: true
    });
  }

  /**
   * Validates file names
   */
  validateFileName(fileName: string): ValidationResult {
    return this.validateInput(fileName, {
      required: true,
      maxLength: 255,
      minLength: 1,
      allowHtml: false,
      allowSpecialChars: false,
      pattern: /^[a-zA-Z0-9\-_\.]+$/,
      customValidator: (value) => {
        const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
        return allowedExtensions.some(ext => value.toLowerCase().endsWith(ext));
      }
    });
  }

  /**
   * Validates numeric input
   */
  validateNumber(value: string | number, min?: number, max?: number): ValidationResult {
    const stringValue = String(value);
    const numValue = Number(stringValue);
    
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: stringValue,
      errors: [],
      warnings: []
    };

    if (isNaN(numValue)) {
      result.isValid = false;
      result.errors.push('Must be a valid number');
      return result;
    }

    if (min !== undefined && numValue < min) {
      result.isValid = false;
      result.errors.push(`Must be at least ${min}`);
    }

    if (max !== undefined && numValue > max) {
      result.isValid = false;
      result.errors.push(`Must be at most ${max}`);
    }

    result.sanitizedValue = String(numValue);
    return result;
  }

  /**
   * Sanitizes input to prevent XSS attacks
   */
  private sanitizeXSS(input: string): string {
    let sanitized = input;
    
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  }

  /**
   * Removes dangerous patterns
   */
  private removeDangerousPatterns(input: string): string {
    let cleaned = input;
    
    this.dangerousPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }

  /**
   * Checks if input contains HTML
   */
  private containsHtml(input: string): boolean {
    return /<[^>]*>/g.test(input);
  }

  /**
   * Strips HTML tags from input
   */
  private stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  /**
   * Checks if input contains special characters
   */
  private containsSpecialChars(input: string): boolean {
    return /[<>{}[\]\\\/\0\x08\x0E-\x1F\x7F]/.test(input);
  }

  /**
   * Removes special characters
   */
  private removeSpecialChars(input: string): string {
    return input.replace(/[<>{}[\]\\\/\0\x08\x0E-\x1F\x7F]/g, '');
  }

  /**
   * Batch validates multiple inputs
   */
  validateBatch(inputs: Array<{ value: string; options: ValidationOptions }>): ValidationResult[] {
    return inputs.map(({ value, options }) => this.validateInput(value, options));
  }

  /**
   * Creates a validation report
   */
  createValidationReport(results: ValidationResult[]): {
    allValid: boolean;
    totalErrors: number;
    totalWarnings: number;
    summary: string;
  } {
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
    const allValid = results.every(r => r.isValid);
    
    const summary = allValid 
      ? `All ${results.length} inputs are valid`
      : `${results.filter(r => !r.isValid).length} of ${results.length} inputs have errors`;

    return {
      allValid,
      totalErrors,
      totalWarnings,
      summary
    };
  }
}

export const inputValidator = new InputValidator();

// Utility functions for common validations
export const validateCardName = (name: string) => inputValidator.validateCardName(name);
export const validateExpansionId = (id: string) => inputValidator.validateExpansionId(id);
export const validateDescription = (desc: string) => inputValidator.validateDescription(desc);
export const validateFileName = (fileName: string) => inputValidator.validateFileName(fileName);
export const validateNumber = (value: string | number, min?: number, max?: number) => 
  inputValidator.validateNumber(value, min, max);

export default inputValidator;