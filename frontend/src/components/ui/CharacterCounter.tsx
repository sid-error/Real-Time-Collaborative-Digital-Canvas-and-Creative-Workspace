import React from 'react';

/**
 * Interface defining the properties for the CharacterCounter component
 * 
 * @interface CharacterCounterProps
 * @property {number} currentLength - Current number of characters/items
 * @property {number} maxLength - Maximum allowed characters/items
 * @property {number} [warningThreshold=80] - Percentage threshold for warning state (0-100)
 * @property {string} [className=''] - Additional CSS classes for the container
 * @property {boolean} [showMessage=true] - Whether to display the status message
 */
interface CharacterCounterProps {
  /** Current number of characters/items */
  currentLength: number;
  /** Maximum allowed characters/items */
  maxLength: number;
  /** Percentage threshold for warning state (0-100) */
  warningThreshold?: number;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to display the status message */
  showMessage?: boolean;
}

/**
 * CharacterCounter Component
 * 
 * @component
 * @description
 * A visual indicator component that displays character count, remaining characters,
 * and a progress bar with color-coded states based on usage thresholds.
 * 
 * @features
 * - **Visual Progress Bar**: Shows usage percentage with color coding
 * - **Color-coded States**: Normal (blue), Warning (yellow), Danger (red)
 * - **Dynamic Messages**: Shows remaining characters or exceed warnings
 * - **Customizable Thresholds**: Configurable warning percentage
 * - **Accessible**: Clear text representation of status
 * 
 * @states
 * 1. **Normal**: Usage below warning threshold - Blue indicator
 * 2. **Warning**: Usage at or above warning threshold but under limit - Yellow indicator
 * 3. **Danger**: Usage exceeds maximum limit - Red indicator
 * 
 * @example
 * ```tsx
 * // Basic usage with textarea
 * <textarea 
 *   onChange={(e) => setText(e.target.value)} 
 *   maxLength={200} 
 * />
 * <CharacterCounter 
 *   currentLength={text.length}
 *   maxLength={200}
 * />
 * 
 * // Custom warning threshold
 * <CharacterCounter 
 *   currentLength={85}
 *   maxLength={100}
 *   warningThreshold={70}
 *   className="mt-2"
 * />
 * 
 * // Without status message (progress bar only)
 * <CharacterCounter 
 *   currentLength={45}
 *   maxLength={50}
 *   showMessage={false}
 * />
 * ```
 * 
 * @param {CharacterCounterProps} props - Component properties
 * @param {number} props.currentLength - Current character/item count
 * @param {number} props.maxLength - Maximum allowed count
 * @param {number} [props.warningThreshold=80] - Warning threshold percentage
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.showMessage=true] - Show/hide status message
 * 
 * @returns {JSX.Element} Character counter UI with progress bar
 */
const CharacterCounter: React.FC<CharacterCounterProps> = ({
  currentLength,
  maxLength,
  warningThreshold = 80,
  className = '',
  showMessage = true
}) => {
  /**
   * Calculate the current usage percentage
   * 
   * @constant {number} percentage
   * @description Percentage of maxLength currently used (0-100+)
   */
  const percentage: number = (currentLength / maxLength) * 100;
  
  /**
   * Calculate remaining characters/items
   * 
   * @constant {number} remaining
   * @description Positive: characters remaining, Negative: characters exceeded
   */
  const remaining: number = maxLength - currentLength;
  
  /**
   * Determine color and status based on current usage
   * 
   * @constant {string} colorClass - Tailwind CSS classes for text color
   * @constant {string} status - Current state: 'normal', 'warning', or 'danger'
   */
  let colorClass: string = 'text-slate-500 dark:text-slate-400';
  let status: 'normal' | 'warning' | 'danger' = 'normal';
  
  if (percentage >= warningThreshold && percentage < 100) {
    colorClass = 'text-yellow-600 dark:text-yellow-500';
    status = 'warning';
  } else if (currentLength > maxLength) {
    colorClass = 'text-red-600 dark:text-red-500';
    status = 'danger';
  }

  /**
   * Generate appropriate status message based on current state
   * 
   * @function getMessage
   * @returns {string} Formatted status message
   */
  const getMessage = (): string => {
    if (remaining >= 0) {
      return `${remaining} character${remaining !== 1 ? 's' : ''} remaining`;
    } else {
      return `Exceeds limit by ${Math.abs(remaining)} character${Math.abs(remaining) !== 1 ? 's' : ''}`;
    }
  };

  /**
   * Determine progress bar color based on status
   * 
   * @function getProgressBarColor
   * @returns {string} Tailwind CSS classes for progress bar color
   */
  const getProgressBarColor = (): string => {
    switch (status) {
      case 'normal': return 'bg-blue-600';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div 
      className={`text-sm ${colorClass} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Status message section - conditionally rendered */}
      {showMessage && (
        <div 
          className="flex items-center justify-between"
          aria-label={getMessage()}
        >
          <span>{getMessage()}</span>
          <span className="font-medium">
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
      
      {/* Visual progress bar */}
      <div 
        className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden"
        role="progressbar"
        aria-valuenow={currentLength}
        aria-valuemin={0}
        aria-valuemax={maxLength}
        aria-label={`Character usage: ${percentage.toFixed(0)}%`}
      >
        <div 
          className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
          style={{ 
            width: `${Math.min(percentage, 100)}%`,
            // Ensure minimum width for visibility when not empty
            minWidth: currentLength > 0 ? '0.25rem' : '0'
          }}
        />
      </div>
    </div>
  );
};

export default CharacterCounter;