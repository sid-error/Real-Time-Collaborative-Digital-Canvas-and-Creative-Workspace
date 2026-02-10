/**
 * Password Reset Service
 * 
 * Mock service for password reset functionality
 * In production, this would call actual backend APIs
 * 
 * @module PasswordResetService
 */

/**
 * Interface for password reset request data
 * @interface PasswordResetRequest
 */
export interface PasswordResetRequest {
  /** User's email address for password reset */
  email: string;
}

/**
 * Interface for password reset response data
 * @interface PasswordResetResponse
 */
export interface PasswordResetResponse {
  /** Indicates if the reset request was successful */
  success: boolean;
  /** Response message from the server */
  message: string;
  /** Reset token (if successful) */
  resetToken?: string;
  /** Token expiration timestamp (if successful) */
  expiresAt?: string;
}

/**
 * Interface for password reset confirmation data
 * @interface PasswordResetConfirm
 */
export interface PasswordResetConfirm {
  /** Reset token received via email */
  token: string;
  /** New password to set */
  newPassword: string;
}

/**
 * Mock function to request a password reset
 * 
 * In production, this would call: POST /api/auth/forgot-password
 * 
 * @async
 * @function requestPasswordReset
 * @param {string} email - User's email address
 * @returns {Promise<PasswordResetResponse>} Response object with success status and message
 * 
 * @example
 * ```typescript
 * // Request password reset
 * const response = await requestPasswordReset('user@example.com');
 * 
 * if (response.success) {
 *   console.log('Reset email sent successfully');
 * } else {
 *   console.error('Reset request failed:', response.message);
 * }
 * ```
 */
export const requestPasswordReset = async (
  email: string
): Promise<PasswordResetResponse> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock email validation
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please provide a valid email address'
      };
    }
    
    // Mock successful response - generate reset token
    const resetToken = `reset-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
    
    // Store token in localStorage for demo purposes
    // In production, backend would handle token storage and email sending
    localStorage.setItem('reset_token', resetToken);
    localStorage.setItem('reset_token_expires', expiresAt);
    localStorage.setItem('reset_email', email);
    
    // Log for debugging/demo purposes
    console.log(`Password reset requested for: ${email}`);
    console.log(`Mock reset token: ${resetToken}`);
    
    return {
      success: true,
      message: 'Password reset email sent successfully',
      resetToken,
      expiresAt
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'Failed to send reset email. Please try again.'
    };
  }
};

/**
 * Mock function to validate a password reset token
 * 
 * In production, this would call: GET /api/auth/validate-reset-token/:token
 * 
 * @async
 * @function validateResetToken
 * @param {string} token - Reset token to validate
 * @returns {Promise<{valid: boolean, message: string, email?: string}>} Validation result
 * 
 * @example
 * ```typescript
 * // Validate reset token
 * const validation = await validateResetToken('reset-token-12345');
 * 
 * if (validation.valid) {
 *   console.log('Token is valid for email:', validation.email);
 * } else {
 *   console.error('Invalid token:', validation.message);
 * }
 * ```
 */
export const validateResetToken = async (
  token: string
): Promise<{ valid: boolean; message: string; email?: string }> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock token validation against localStorage
    const storedToken = localStorage.getItem('reset_token');
    const storedExpires = localStorage.getItem('reset_token_expires');
    
    // Check if token matches stored token
    if (!storedToken || storedToken !== token) {
      return {
        valid: false,
        message: 'Invalid reset token'
      };
    }
    
    // Check if token has expired
    if (storedExpires && new Date(storedExpires) < new Date()) {
      return {
        valid: false,
        message: 'Reset token has expired'
      };
    }
    
    // Retrieve email associated with the token
    const email = localStorage.getItem('reset_email');
    
    return {
      valid: true,
      message: 'Valid reset token',
      email: email || 'user@example.com'
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      valid: false,
      message: 'Unable to validate token'
    };
  }
};

/**
 * Mock function to reset password using a valid token
 * 
 * In production, this would call: POST /api/auth/reset-password
 * 
 * @async
 * @function resetPassword
 * @param {string} token - Valid reset token
 * @param {string} newPassword - New password to set
 * @returns {Promise<{success: boolean, message: string}>} Reset result
 * 
 * @example
 * ```typescript
 * // Reset password with token
 * const result = await resetPassword('valid-token-123', 'NewPassword123!');
 * 
 * if (result.success) {
 *   console.log('Password reset successfully');
 * } else {
 *   console.error('Reset failed:', result.message);
 * }
 * ```
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Validate token first
    const validation = await validateResetToken(token);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }
    
    // Mock password validation
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    
    // Mock successful password reset
    console.log(`Password reset for email: ${validation.email}`);
    console.log(`New password set: ${newPassword}`);
    
    // Clear reset tokens from localStorage after successful reset
    localStorage.removeItem('reset_token');
    localStorage.removeItem('reset_token_expires');
    localStorage.removeItem('reset_email');
    
    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'Failed to reset password. Please try again.'
    };
  }
};

/**
 * Checks if a user can request another password reset
 * 
 * Prevents rapid consecutive reset requests by enforcing a cooldown period
 * In production, rate limiting would be handled on the backend
 * 
 * @function canRequestReset
 * @param {string} email - User's email address
 * @returns {boolean} True if user can request reset, false if in cooldown period
 * 
 * @example
 * ```typescript
 * // Check if user can request reset
 * if (canRequestReset('user@example.com')) {
 *   await requestPasswordReset('user@example.com');
 * } else {
 *   console.log('Please wait before requesting another reset');
 * }
 * ```
 */
export const canRequestReset = (email: string): boolean => {
  const lastRequestTime = localStorage.getItem(`reset_request_${email}`);
  
  // If no previous request, allow reset
  if (!lastRequestTime) {
    return true;
  }
  
  // Calculate time since last request
  const lastRequest = new Date(lastRequestTime).getTime();
  const now = Date.now();
  const cooldownPeriod = 5 * 60 * 1000; // 5 minutes cooldown
  
  // Allow reset if cooldown period has passed
  return now - lastRequest > cooldownPeriod;
};

/**
 * Tracks a password reset request for rate limiting
 * 
 * Stores the timestamp of the reset request in localStorage
 * 
 * @function trackResetRequest
 * @param {string} email - User's email address
 * @returns {void}
 * 
 * @example
 * ```typescript
 * // Track reset request
 * trackResetRequest('user@example.com');
 * ```
 */
export const trackResetRequest = (email: string): void => {
  localStorage.setItem(`reset_request_${email}`, new Date().toISOString());
};