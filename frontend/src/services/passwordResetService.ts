/**
 * Password Reset Service
 * 
 * Real backend integration for password reset functionality
 * Calls actual backend APIs at /api/auth/*
 * 
 * @module PasswordResetService
 */

import api from '../api/axios';

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
 * Request password reset — calls POST /api/auth/forgot-password
 * 
 * @async
 * @function requestPasswordReset
 * @param {string} email - User's email address
 * @returns {Promise<PasswordResetResponse>} Response object with success status and message
 * 
 * @example
 * ```typescript
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
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please provide a valid email address',
      };
    }

    const response = await api.post('/auth/forgot-password', { email });
    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Password reset email sent successfully',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Failed to send reset email. Please try again.',
    };
  }
};

/**
 * Validate reset token — calls POST /api/auth/validate-reset-token
 * Falls back gracefully if the endpoint doesn't exist
 * 
 * @async
 * @function validateResetToken
 * @param {string} token - Reset token to validate
 * @returns {Promise<{valid: boolean, message: string, email?: string}>} Validation result
 * 
 * @example
 * ```typescript
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
    const response = await api.post('/auth/validate-reset-token', { token });
    return {
      valid: response.data.valid ?? response.data.success ?? true,
      message: response.data.message || 'Valid reset token',
      email: response.data.email,
    };
  } catch (error: any) {
    // If the endpoint doesn't exist yet, assume token is valid
    // and let the actual reset call validate it
    if (error.response?.status === 404) {
      return {
        valid: true,
        message: 'Token will be validated on reset',
      };
    }
    return {
      valid: false,
      message:
        error.response?.data?.message || 'Unable to validate token',
    };
  }
};

/**
 * Reset password — calls POST /api/auth/reset-password
 * 
 * @async
 * @function resetPassword
 * @param {string} token - Valid reset token
 * @param {string} newPassword - New password to set
 * @returns {Promise<{success: boolean, message: string}>} Reset result
 * 
 * @example
 * ```typescript
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
    if (!newPassword || newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long',
      };
    }

    const response = await api.post('/auth/reset-password', {
      token,
      password: newPassword,
    });

    return {
      success: response.data.success ?? true,
      message: response.data.message || 'Password has been reset successfully',
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Failed to reset password. Please try again.',
    };
  }
};

/**
 * Checks if a user can request another password reset
 * 
 * Prevents rapid consecutive reset requests by enforcing a cooldown period
 * In production, rate limiting would also be handled on the backend
 * 
 * @function canRequestReset
 * @param {string} email - User's email address
 * @returns {boolean} True if user can request reset, false if in cooldown period
 * 
 * @example
 * ```typescript
 * if (canRequestReset('user@example.com')) {
 *   await requestPasswordReset('user@example.com');
 * } else {
 *   console.log('Please wait before requesting another reset');
 * }
 * ```
 */
export const canRequestReset = (email: string): boolean => {
  const lastRequestTime = localStorage.getItem(`reset_request_${email}`);

  if (!lastRequestTime) {
    return true;
  }

  const lastRequest = new Date(lastRequestTime).getTime();
  const now = Date.now();
  const cooldownPeriod = 5 * 60 * 1000; // 5 minutes cooldown

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
 * trackResetRequest('user@example.com');
 * ```
 */
export const trackResetRequest = (email: string): void => {
  localStorage.setItem(`reset_request_${email}`, new Date().toISOString());
};