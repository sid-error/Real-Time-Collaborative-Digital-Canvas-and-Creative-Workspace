import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AtSign } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { UsernameChecker } from '../components/ui/UsernameChecker';
import { Modal } from '../components/ui/Modal';
import { TermsOfServiceContent } from '../components/legal/TermsOfServiceContent';
import { PrivacyPolicyContent } from '../components/legal/PrivacyPolicyContent';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { registerUser } from '../utils/authService';
import { validateEmailFormat } from '../utils/emailValidation';

/**
 * Interface for email validation results
 * @interface EmailValidationResult
 */
interface EmailValidationResult {
  /** Whether the email is valid */
  valid: boolean;
  /** Validation message for the user */
  message: string;
}

/**
 * Registration form data interface
 * @interface RegistrationFormData
 */
interface RegistrationFormData {
  /** User's full name */
  fullName: string;
  /** Desired username */
  username: string;
  /** Email address */
  email: string;
  /** Password */
  password: string;
}

/**
 * RegisterPage component - User registration interface
 * 
 * Provides a complete user registration form with real-time validation for:
 * - Full name input
 * - Username availability checking
 * - Email format validation
 * - Password strength assessment
 * - Terms and conditions agreement
 * 
 * The component includes real-time feedback and connects to backend authentication services.
 * 
 * @component
 * @example
 * ```tsx
 * // In your router configuration
 * <Route path="/register" element={<RegisterPage />} />
 * ```
 * 
 * @returns {JSX.Element} A fully featured registration form with validation
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // Form state management
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(false);
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>(
    { valid: false, message: '' }
  );

  // Modal state management
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  /**
   * Opens Terms of Service modal
   * 
   * @example
   * ```typescript
   * openTermsOfService();
   * ```
   */
  const openTermsOfService = (): void => setShowTermsModal(true);

  /**
   * Opens Privacy Policy modal
   * 
   * @example
   * ```typescript
   * openPrivacyPolicy();
   * ```
   */
  const openPrivacyPolicy = (): void => setShowPrivacyModal(true);

  /**
   * Handles email input changes and validates format in real-time
   * 
   * @param {string} newEmail - The email value to validate
   * 
   * @example
   * ```typescript
   * handleEmailChange('user@example.com');
   * ```
   */
  const handleEmailChange = (newEmail: string): void => {
    setEmail(newEmail);
    const validation = validateEmailFormat(newEmail);
    setEmailValidation(validation);
  };

  /**
   * Handles registration form submission with comprehensive validation
   * 
   * Performs multiple validation steps before sending data to the backend:
   * 1. Basic field presence validation
   * 2. Username availability confirmation
   * 3. Email format validation
   * 4. Terms agreement verification
   * 5. Minimum password length check
   * 
   * @async
   * @param {React.FormEvent} e - Form submission event
   * @returns {Promise<void>}
   * 
   * @throws {Error} When registration fails or validation errors occur
   * 
   * @example
   * ```typescript
   * // This function is called when the form is submitted
   * handleSubmit(event);
   * ```
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // 1. Basic Field Validation
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // 2. Specialized Validation
    if (!isUsernameAvailable) {
      alert('Please choose an available username');
      return;
    }

    if (!emailValidation.valid) {
      alert(emailValidation.message || 'Please enter a valid email address');
      return;
    }

    if (!agreeToTerms) {
      alert('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare registration data
      const registrationData: RegistrationFormData = {
        fullName,
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password
      };

      // Connect to backend authentication service
      const result = await registerUser(registrationData);

      if (result.success) {
        // Redirect to the success notice page we created earlier
        navigate('/registration-success', {
          state: {
            email,
            message: 'Registration successful! Please check your email.'
          }
        });
      } else {
        alert(result.message);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">

        {/* Header section with icon */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-blue-600" size={32} aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-slate-500">Join the Collaborative Canvas platform</p>
        </div>

        {/* Registration form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>

          {/* Full name input */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={20} aria-hidden="true" />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              disabled={isLoading}
              aria-label="Full name"
            />
          </div>

          {/* Username input */}
          <div className="relative">
            <AtSign className="absolute left-3 top-3 text-slate-400" size={20} aria-hidden="true" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              disabled={isLoading}
              aria-label="Username"
            />
          </div>

          {/* Username availability checker component */}
          <UsernameChecker
            username={username}
            onAvailabilityChange={setIsUsernameAvailable}
          />

          {/* Email input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={20} aria-hidden="true" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleEmailChange(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${email && !emailValidation.valid ? 'border-red-300' : 'border-slate-200'
                }`}
              required
              disabled={isLoading}
              aria-label="Email address"
              aria-invalid={email && !emailValidation.valid ? "true" : "false"}
              aria-describedby={email && !emailValidation.valid ? "email-error" : undefined}
            />
          </div>

          {/* Email validation error message */}
          {email && !emailValidation.valid && (
            <div
              id="email-error"
              className="text-xs text-red-600 px-1"
              role="alert"
            >
              {emailValidation.message}
            </div>
          )}

          {/* Password input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={20} aria-hidden="true" />
            <input
              type="password"
              placeholder="Password (min. 8 characters)"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              required
              minLength={8}
              disabled={isLoading}
              aria-label="Password"
            />
          </div>

          {/* Password strength meter component */}
          <PasswordStrengthMeter password={password} className="mt-2" />

          {/* Terms and conditions agreement */}
          <div className="flex items-start gap-2 py-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeToTerms}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setAgreeToTerms(e.target.checked)}
              className="mt-1"
              required
              disabled={isLoading}
              aria-label="Agree to terms and conditions"
              aria-checked={agreeToTerms}
            />
            <label htmlFor="terms" className="text-sm text-slate-500">
              I agree to the{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline focus:outline-none"
                onClick={openTermsOfService}
                aria-label="Open Terms of Service"
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline focus:outline-none"
                onClick={openPrivacyPolicy}
                aria-label="Open Privacy Policy"
              >
                Privacy Policy
              </button>.
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full py-3 text-lg"
            isLoading={isLoading}
            disabled={isLoading || !isUsernameAvailable || !emailValidation.valid || !agreeToTerms}
            aria-label={isLoading ? "Creating account..." : "Sign up"}
          >
            Sign Up
          </Button>
        </form>

        {/* Login link for existing users */}
        <p className="text-center mt-6 text-slate-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
            aria-label="Go to login page"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>
    </div>
  );
};

export default RegisterPage;