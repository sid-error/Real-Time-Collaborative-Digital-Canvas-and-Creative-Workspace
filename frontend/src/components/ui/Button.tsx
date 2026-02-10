import React from 'react';

/**
 * Interface defining the properties for the Button component
 * Extends native button attributes for full HTML button compatibility
 * 
 * @interface ButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 * 
 * @property {'primary' | 'secondary' | 'outline'} [variant='primary'] - Visual style variant of the button
 * @property {boolean} [isLoading=false] - Loading state - shows spinner and disables button
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {React.ReactNode} children - Button content (text, icons, etc.)
 * @property {boolean} [disabled] - Whether the button is disabled
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Loading state - shows spinner and disables button */
  isLoading?: boolean;
}

/**
 * Button Component
 * 
 * @component
 * @description
 * A reusable, accessible button component with multiple visual variants and loading state support.
 * Implements consistent styling, focus management, and disabled state handling across the application.
 * 
 * @features
 * - **Multiple Variants**: Primary, Secondary, and Outline styles
 * - **Loading State**: Shows spinner and disables interaction
 * - **Accessibility**: Proper ARIA attributes and keyboard navigation
 * - **Responsive**: Consistent sizing and hover/focus states
 * - **Extensible**: Accepts all native button attributes
 * 
 * @example
 * ```tsx
 * // Primary button with loading state
 * <Button 
 *   variant="primary" 
 *   isLoading={isSubmitting}
 *   onClick={handleSubmit}
 * >
 *   Submit
 * </Button>
 * 
 * // Secondary button
 * <Button variant="secondary">
 *   Cancel
 * </Button>
 * 
 * // Outline button with custom class
 * <Button variant="outline" className="w-full">
 *   Learn More
 * </Button>
 * ```
 * 
 * @param {ButtonProps} props - Component properties
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'outline'} [props.variant='primary'] - Button style variant
 * @param {boolean} [props.isLoading=false] - Loading state indicator
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ButtonHTMLAttributes<HTMLButtonElement>} props - All standard button attributes
 * 
 * @returns {JSX.Element} A styled button element
 */
export const Button = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className, 
  ...props 
}: ButtonProps) => {
  /**
   * Base button styles - applied to all button variants
   * Includes padding, rounding, transitions, and disabled state styling
   * 
   * @constant {string} baseStyles
   * @description Common styles shared by all button variants
   */
  const baseStyles: string = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
  
  /**
   * Variant-specific styles - defines visual appearance for each variant
   * 
   * @constant {Record<string, string>} variants
   * @property {string} primary - Primary action button (blue background)
   * @property {string} secondary - Secondary action button (dark background)
   * @property {string} outline - Outline button with border
   */
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:bg-blue-800",
    secondary: "bg-slate-800 text-white hover:bg-slate-900 shadow-sm hover:shadow-md active:bg-slate-950",
    outline: "border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
  };

  /**
   * Combines all CSS classes for the button
   * 
   * @constant {string} buttonClasses
   * @description Merges base styles, variant styles, and custom classes
   */
  const buttonClasses: string = `${baseStyles} ${variants[variant]} ${className || ''}`.trim();

  /**
   * Determines if the button should be disabled
   * Button is disabled when explicitly set or when in loading state
   * 
   * @constant {boolean} isDisabled
   */
  const isDisabled: boolean = isLoading || props.disabled || false;

  return (
    <button 
      className={buttonClasses} 
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        /**
         * Loading spinner - shown when isLoading is true
         * Provides visual feedback that an action is in progress
         */
        <div 
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" 
          aria-label="Loading"
          role="status"
        />
      ) : (
        /**
         * Button content - shown when not loading
         * Can be text, icons, or any React nodes
         */
        children
      )}
    </button>
  );
};