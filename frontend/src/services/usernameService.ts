/**
 * Mock service for username availability checking
 * 
 * Note: In production, this would make actual API calls to your backend
 * This mock service simulates backend behavior for development purposes
 * 
 * @module UsernameAvailabilityService
 */

/**
 * Simulated database of existing usernames
 * In production, this would be fetched from the backend database
 * 
 * @constant {string[]} EXISTING_USERNAMES
 */
const EXISTING_USERNAMES = [
  'john_doe',
  'jane_smith',
  'artist123',
  'canvas_master',
  'designer',
  'creative',
  'painter',
  'drawing_pro'
];

/**
 * Interface for username availability check results
 * @interface UsernameCheckResult
 */
export interface UsernameCheckResult {
  /** Whether the username is available for registration */
  available: boolean;
  /** Detailed message about availability status */
  message: string;
  /** Optional array of suggested alternative usernames */
  suggestions?: string[];
}

/**
 * Checks if a username is available for registration
 * 
 * This function simulates a real API call with network delay and validates
 * the username against various criteria including length, character restrictions,
 * and existing username database.
 * 
 * @async
 * @function checkUsernameAvailability
 * @param {string} username - The username to check for availability
 * @returns {Promise<UsernameCheckResult>} Object containing availability status, message, and suggestions
 * 
 * @example
 * ```typescript
 * // Check username availability
 * const result = await checkUsernameAvailability('john_doe');
 * 
 * if (result.available) {
 *   console.log('Username is available!');
 * } else {
 *   console.log('Username is taken. Suggestions:', result.suggestions);
 * }
 * ```
 * 
 * @remarks
 * Validation rules:
 * - Minimum 3 characters
 * - Maximum 20 characters
 * - Only letters, numbers, dots, hyphens, and underscores allowed
 * - Case-insensitive comparison
 */
export const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResult> => {
  // Simulate network delay (300ms) to mimic real API call
  await new Promise(resolve => setTimeout(resolve, 300));

  // Normalize username for consistent comparison
  const normalizedUsername = username.trim().toLowerCase();

  // Validation: Minimum length check
  if (normalizedUsername.length < 3) {
    return {
      available: false,
      message: 'Username must be at least 3 characters'
    };
  }

  // Validation: Maximum length check
  if (normalizedUsername.length > 20) {
    return {
      available: false,
      message: 'Username must be less than 20 characters'
    };
  }

  // Validation: Character restrictions check
  if (!/^[a-zA-Z0-9_.-]+$/.test(normalizedUsername)) {
    return {
      available: false,
      message: 'Username can only contain letters, numbers, dots, hyphens, and underscores'
    };
  }

  // Check if username already exists in the simulated database
  const isTaken = EXISTING_USERNAMES.includes(normalizedUsername);
  
  if (isTaken) {
    // Generate alternative suggestions when username is taken
    const suggestions = generateUsernameSuggestions(normalizedUsername);
    
    return {
      available: false,
      message: 'Username is already taken',
      suggestions
    };
  }

  // Username passed all validation checks and is available
  return {
    available: true,
    message: 'Username is available!'
  };
};

/**
 * Generates alternative username suggestions when the requested username is taken
 * 
 * This function creates variations of the requested username by:
 * 1. Appending numbers (1-5)
 * 2. Adding common art/design-related suffixes
 * 3. Removing special characters and appending variations
 * 
 * @private
 * @function generateUsernameSuggestions
 * @param {string} username - The original requested username
 * @returns {string[]} Array of up to 5 unique suggested usernames
 * 
 * @example
 * ```typescript
 * // Returns suggestions like ['john_doe1', 'john_doe_art', 'john_doe_design']
 * const suggestions = generateUsernameSuggestions('john_doe');
 * ```
 */
const generateUsernameSuggestions = (username: string): string[] => {
  const suggestions: string[] = [];
  const baseName = username.replace(/[0-9_.-]/g, '');
  
  // Strategy 1: Append numbers (1-5)
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${username}${i}`);
    suggestions.push(`${baseName}${i}`);
  }
  
  // Strategy 2: Add art/design-related suffixes
  const suffixes = ['art', 'draw', 'design', 'canvas', 'studio', 'creative'];
  suffixes.forEach(suffix => {
    suggestions.push(`${username}_${suffix}`);
    suggestions.push(`${baseName}_${suffix}`);
  });
  
  // Return unique suggestions, limited to 5 for user convenience
  return [...new Set(suggestions)].slice(0, 5);
};