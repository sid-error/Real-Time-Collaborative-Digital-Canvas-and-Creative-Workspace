import React, { useState, useEffect, useMemo } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
// Corrected imports to use your existing files
import { checkUsernameAvailability } from '../../utils/authService';

/**
 * Debounce utility function to limit the frequency of function calls
 * 
 * @function debounceFunc
 * @param {Function} fn - Function to debounce
 * @param {number} ms - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @remarks
 * This is a basic debounce implementation. Consider using a library like
 * lodash.debounce or extracting this to a shared utilities file.
 */
const debounceFunc = (fn: Function, ms: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

/**
 * Interface defining the result structure from username availability checks
 * 
 * @interface UsernameCheckResult
 * @property {boolean} available - Whether the username is available
 * @property {string} message - User-friendly message about availability
 * @property {string[]} [suggestions] - Optional array of suggested alternative usernames
 */
interface UsernameCheckResult {
  available: boolean;
  message: string;
  suggestions?: string[];
}

/**
 * Interface defining the properties for the UsernameChecker component
 * 
 * @interface UsernameCheckerProps
 * @property {string} username - The username to check for availability
 * @property {(available: boolean) => void} [onAvailabilityChange] - Callback when availability status changes
 * @property {string} [className=''] - Additional CSS classes for the container
 * @property {number} [debounceTime=500] - Debounce delay in milliseconds for checking
 */
export interface UsernameCheckerProps {
  /** The username to check for availability */
  username: string;
  /** Callback when availability status changes */
  onAvailabilityChange?: (available: boolean) => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Debounce delay in milliseconds for checking */
  debounceTime?: number;
}

/**
 * UsernameChecker Component
 * 
 * @component
 * @description
 * A real-time username availability checker with debounced API calls,
 * visual feedback, and suggested alternatives for unavailable usernames.
 * 
 * @features
 * - **Real-time Checking**: Automatically checks username availability as user types
 * - **Debounced API Calls**: Prevents excessive API requests while typing
 * - **Visual Feedback**: Clear icons and colors indicate availability status
 * - **Smart Suggestions**: Provides alternative username suggestions when unavailable
 * - **Error Handling**: Graceful handling of network errors and API failures
 * - **Minimum Length**: Only checks usernames with at least 3 characters
 * - **Accessibility**: Proper ARIA roles and status announcements
 * 
 * @behavior
 * 1. Waits for user to stop typing (debounce) before checking availability
 * 2. Only checks usernames with 3+ characters
 * 3. Shows loading indicator during API calls
 * 4. Provides suggestions for unavailable usernames
 * 5. Calls onAvailabilityChange callback with boolean result
 * 
 * @example
 * ```tsx
 * // Basic usage in a signup form
 * const [username, setUsername] = useState('');
 * 
 * <div>
 *   <label htmlFor="username">Username</label>
 *   <input
 *     id="username"
 *     value={username}
 *     onChange={(e) => setUsername(e.target.value)}
 *   />
 *   <UsernameChecker 
 *     username={username}
 *     onAvailabilityChange={(available) => setUsernameAvailable(available)}
 *   />
 * </div>
 * 
 * // With custom debounce time
 * <UsernameChecker 
 *   username={username}
 *   debounceTime={300}
 *   className="mt-3"
 * />
 * ```
 * 
 * @param {UsernameCheckerProps} props - Component properties
 * @param {string} props.username - Username to check
 * @param {(available: boolean) => void} [props.onAvailabilityChange] - Availability change callback
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {number} [props.debounceTime=500] - Debounce delay in milliseconds
 * 
 * @returns {JSX.Element | null} Username checker UI or null if username is empty
 */
export const UsernameChecker: React.FC<UsernameCheckerProps> = ({
  username,
  onAvailabilityChange,
  className = '',
  debounceTime = 500
}) => {
  /**
   * State for storing the username availability check result
   * 
   * @state {UsernameCheckResult | null} checkResult
   */
  const [checkResult, setCheckResult] = useState<UsernameCheckResult | null>(null);
  
  /**
   * State indicating whether a username availability check is in progress
   * 
   * @state {boolean} isChecking
   */
  const [isChecking, setIsChecking] = useState<boolean>(false);
  
  /**
   * State for storing any error messages from the availability check
   * 
   * @state {string | null} error
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Memoized debounced function for checking username availability
   * Prevents creating new debounced functions on every render
   * 
   * @constant {Function} debouncedCheck
   * @dependencies debounceTime, onAvailabilityChange
   */
  const debouncedCheck = useMemo(() => 
    debounceFunc(async (usernameToCheck: string) => {
      const trimmed = usernameToCheck.trim();
      
      // Skip checking for invalid usernames
      if (!trimmed || trimmed.length < 3) {
        setCheckResult(null);
        setIsChecking(false);
        onAvailabilityChange?.(false);
        return;
      }

      try {
        setIsChecking(true);
        setError(null);
        
        // Call API to check username availability
        const result = await checkUsernameAvailability(trimmed);
        setCheckResult(result);
        onAvailabilityChange?.(result.available);
      } catch (err) {
        setError('Unable to check username availability');
        setCheckResult(null);
        onAvailabilityChange?.(false);
      } finally {
        setIsChecking(false);
      }
    }, debounceTime),
    [debounceTime, onAvailabilityChange]
  );

  /**
   * Effect that triggers username availability checks when username changes
   * Only checks when username meets minimum length requirements
   * 
   * @effect
   * @dependencies username, debouncedCheck
   */
  useEffect(() => {
    if (username.trim().length >= 3) {
      setIsChecking(true);
      debouncedCheck(username);
    } else {
      // Clear results for invalid/short usernames
      setCheckResult(null);
      setIsChecking(false);
    }
  }, [username, debouncedCheck]);

  // Don't render anything if username is empty or too short
  if (!username.trim() || username.trim().length < 1) return null;

  return (
    <div 
      className={`mt-2 space-y-2 ${className}`} 
      role="status" 
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Main status indicator */}
      <div className="flex items-center gap-2">
        {/* Status icon */}
        {isChecking ? (
          <Loader2 
            className="w-4 h-4 animate-spin text-blue-500" 
            aria-hidden="true" 
            aria-label="Checking username availability"
          />
        ) : checkResult?.available ? (
          <Check 
            className="w-4 h-4 text-green-500" 
            aria-hidden="true" 
            aria-label="Username available"
          />
        ) : (
          <X 
            className="w-4 h-4 text-red-500" 
            aria-hidden="true" 
            aria-label="Username not available"
          />
        )}
        
        {/* Status message */}
        <span className="text-sm font-medium">
          {isChecking ? (
            'Checking username availability...'
          ) : error ? (
            <span className="text-red-600 dark:text-red-400">{error}</span>
          ) : (
            <span className={
              checkResult?.available 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }>
              {checkResult?.message || (username.length < 3 ? 'Minimum 3 characters' : '')}
            </span>
          )}
        </span>
      </div>

      {/* Alternative username suggestions (shown when username is unavailable) */}
      {!isChecking && checkResult && !checkResult.available && checkResult.suggestions && (
        <div className="mt-2">
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
            Try these alternatives:
          </p>
          <div className="flex flex-wrap gap-2">
            {checkResult.suggestions.map((suggestion) => (
              <span 
                key={suggestion} 
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-default"
                aria-label={`Suggested username: ${suggestion}`}
              >
                {suggestion}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Character count indicator (optional enhancement) */}
      {username.trim().length > 0 && (
        <div 
          className="text-xs text-slate-500 dark:text-slate-400 mt-1"
          aria-label={`${username.trim().length} characters`}
        >
          {username.trim().length} character{username.trim().length !== 1 ? 's' : ''}
          {username.trim().length < 3 && ' (minimum 3 required)'}
        </div>
      )}
    </div>
  );
};

export default UsernameChecker;