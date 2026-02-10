import React from 'react';

/**
 * Interface defining the properties for the PasswordStrengthMeter component
 * 
 * @interface PasswordStrengthMeterProps
 * @property {string} password - The password string to evaluate for strength
 * @property {boolean} [showLabel=true] - Whether to display the strength label and title
 * @property {string} [className=''] - Additional CSS classes for the container
 */
export interface PasswordStrengthMeterProps {
  /** The password string to evaluate for strength */
  password: string;
  /** Whether to display the strength label and title */
  showLabel?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Interface for the password strength calculation result
 * 
 * @interface StrengthResult
 * @property {number} score - Numeric strength score (0-100)
 * @property {string} label - Human-readable strength label (Weak/Fair/Good/Strong)
 * @property {string} color - Tailwind CSS class for the progress bar color
 * @property {string} width - CSS width value for the progress bar (e.g., "75%")
 */
interface StrengthResult {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  width: string;
}

/**
 * PasswordStrengthMeter Component
 * 
 * @component
 * @description
 * A visual password strength indicator that evaluates password complexity
 * and displays the result as a colored progress bar with strength label.
 * Includes a checklist of password requirements with real-time validation.
 * 
 * @features
 * - **Real-time Evaluation**: Dynamically calculates strength as user types
 * - **Visual Feedback**: Color-coded progress bar (Red/Yellow/Blue/Green)
 * - **Strength Categories**: Weak (0-29), Fair (30-69), Good (70-89), Strong (90-100)
 * - **Requirements Checklist**: Shows which password criteria are met
 * - **Accessibility**: ARIA attributes for screen readers
 * - **Smooth Animations**: Progress bar transitions
 * - **Customizable**: Show/hide labels, custom CSS classes
 * 
 * @algorithm
 * The strength calculation uses a weighted scoring system:
 * - Length: 25 points for ≥8 chars, +10 for ≥12 chars
 * - Complexity: 15 points each for uppercase, lowercase, numbers, special chars
 * - Penalties: -10 for repeated chars, -15 for common patterns
 * - Score capped between 0-100
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <PasswordStrengthMeter password={password} />
 * 
 * // Without label
 * <PasswordStrengthMeter password={password} showLabel={false} />
 * 
 * // With custom styling
 * <PasswordStrengthMeter 
 *   password={password}
 *   showLabel={true}
 *   className="mt-4"
 * />
 * ```
 * 
 * @param {PasswordStrengthMeterProps} props - Component properties
 * @param {string} props.password - Password to evaluate
 * @param {boolean} [props.showLabel=true] - Show/hide strength label
 * @param {string} [props.className=''] - Additional CSS classes
 * 
 * @returns {JSX.Element} Password strength meter UI
 */
export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showLabel = true,
  className = '',
}) => {
  /**
   * Calculates password strength based on multiple criteria using a weighted scoring system
   * 
   * @function calculatePasswordStrength
   * @param {string} pass - Password string to evaluate
   * @returns {StrengthResult} Object containing strength score, label, color, and width
   * 
   * @remarks
   * The algorithm uses positive points for meeting criteria and negative points
   * for weak patterns to provide a more accurate strength assessment.
   */
  const calculatePasswordStrength = (pass: string): StrengthResult => {
    // Return empty state for no password
    if (!pass) return { 
      score: 0, 
      label: "Weak", 
      color: "bg-slate-200 dark:bg-slate-700", 
      width: "0%" 
    };

    let score = 0;
    
    // Length-based scoring (max 35 points)
    if (pass.length >= 8) score += 25; // Minimum length
    if (pass.length >= 12) score += 10; // Bonus for longer passwords
    
    // Character type scoring (max 65 points)
    if (/[A-Z]/.test(pass)) score += 15; // Has uppercase letters
    if (/[a-z]/.test(pass)) score += 15; // Has lowercase letters
    if (/[0-9]/.test(pass)) score += 15; // Has numbers
    if (/[^A-Za-z0-9]/.test(pass)) score += 20; // Has special characters (bonus weight)
    
    // Penalties for weak patterns
    if (/(.)\1{2,}/.test(pass)) score -= 10; // Repeated characters (e.g., "aaa")
    if (/(123|abc|password|qwerty)/i.test(pass)) score -= 15; // Common weak patterns
    
    // Ensure score stays within 0-100 range
    score = Math.max(0, Math.min(100, score));

    // Categorize strength based on score
    if (score < 30) {
      return { 
        score, 
        label: "Weak" as const, 
        color: "bg-red-500 dark:bg-red-600", 
        width: `${score}%` 
      };
    } else if (score < 70) {
      return { 
        score, 
        label: "Fair" as const, 
        color: "bg-yellow-500 dark:bg-yellow-600", 
        width: `${score}%` 
      };
    } else if (score < 90) {
      return { 
        score, 
        label: "Good" as const, 
        color: "bg-blue-500 dark:bg-blue-600", 
        width: `${score}%` 
      };
    } else {
      return { 
        score, 
        label: "Strong" as const, 
        color: "bg-green-500 dark:bg-green-600", 
        width: `${score}%` 
      };
    }
  };

  // Calculate current password strength
  const strength = calculatePasswordStrength(password);

  return (
    <div 
      className={`space-y-1 ${className}`} 
      aria-live="polite" 
      aria-atomic="true"
    >
      {/* Strength label and title section */}
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Password Strength
          </span>
          {password && (
            <span className={`text-xs font-semibold ${
              strength.label === "Weak" ? "text-red-600 dark:text-red-400" :
              strength.label === "Fair" ? "text-yellow-600 dark:text-yellow-400" :
              strength.label === "Good" ? "text-blue-600 dark:text-blue-400" :
              "text-green-600 dark:text-green-400"
            }`}>
              {strength.label}
            </span>
          )}
        </div>
      )}
      
      {/* Visual progress bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${strength.color}`}
          style={{ width: strength.width }}
          role="progressbar"
          aria-valuenow={strength.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${strength.label}`}
        />
      </div>
      
      {/* Password requirements checklist - shown only when password has content */}
      {password && (
        <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-2">
          <li className={`flex items-center ${password.length >= 8 ? "text-green-600 dark:text-green-400" : ""}`}>
            <span className="mr-1">•</span> At least 8 characters
          </li>
          <li className={`flex items-center ${/[A-Z]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}>
            <span className="mr-1">•</span> Contains uppercase letter
          </li>
          <li className={`flex items-center ${/[a-z]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}>
            <span className="mr-1">•</span> Contains lowercase letter
          </li>
          <li className={`flex items-center ${/[0-9]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}>
            <span className="mr-1">•</span> Contains number
          </li>
          <li className={`flex items-center ${/[^A-Za-z0-9]/.test(password) ? "text-green-600 dark:text-green-400" : ""}`}>
            <span className="mr-1">•</span> Contains special character
          </li>
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;