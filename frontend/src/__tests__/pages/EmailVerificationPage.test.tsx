import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import EmailVerificationPage from '../../pages/EmailVerificationPage';

// MOCK: react-router-dom hooks
const mockNavigate = vi.fn();

let mockSearchParamsToken: string | null = null;
let mockPathToken: string | undefined = undefined;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: mockPathToken }),
    useSearchParams: () => [
      {
        get: (key: string) => {
          if (key === 'token') return mockSearchParamsToken;
          return null;
        }
      }
    ]
  };
});

// MOCK: API
const mockVerifyEmailToken = vi.fn();

vi.mock('../../utils/authService', () => ({
  verifyEmailToken: (token: string) => mockVerifyEmailToken(token)
}));

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSearchParamsToken = null;
    mockPathToken = undefined;
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('shows loading state initially', async () => {
    mockSearchParamsToken = 'abc123';
    mockVerifyEmailToken.mockImplementation(
      () => new Promise(() => {}) // never resolves
    );

    render(<EmailVerificationPage />);

    expect(screen.getByText(/Verifying Your Account/i)).toBeInTheDocument();
  });

  test('fails immediately if no token exists', async () => {
    mockSearchParamsToken = null;
    mockPathToken = undefined;

    render(<EmailVerificationPage />);

    expect(await screen.findByText(/Activation Failed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No verification token found/i)
    ).toBeInTheDocument();

    expect(mockVerifyEmailToken).not.toHaveBeenCalled();
  });

  test('uses query token (?token=) over path token', async () => {
    mockSearchParamsToken = 'queryToken';
    mockPathToken = 'pathToken';

    mockVerifyEmailToken.mockResolvedValue({
      success: false,
      message: 'Invalid token'
    });

    render(<EmailVerificationPage />);

    await waitFor(() => {
      expect(mockVerifyEmailToken).toHaveBeenCalledWith('queryToken');
    });
  });

  test('uses path token if query token is missing', async () => {
    mockSearchParamsToken = null;
    mockPathToken = 'pathTokenOnly';

    mockVerifyEmailToken.mockResolvedValue({
      success: false,
      message: 'Invalid token'
    });

    render(<EmailVerificationPage />);

    await waitFor(() => {
      expect(mockVerifyEmailToken).toHaveBeenCalledWith('pathTokenOnly');
    });
  });

  test('shows success UI when API returns success=true', async () => {
    mockSearchParamsToken = 'abc123';

    mockVerifyEmailToken.mockResolvedValue({
      success: true,
      message: 'Email verified successfully!'
    });

    render(<EmailVerificationPage />);

    expect(await screen.findByText(/Success!/i)).toBeInTheDocument();
    expect(screen.getByText(/Email verified successfully!/i)).toBeInTheDocument();
  });

  test('redirects to /login after 3 seconds on success', async () => {
    mockSearchParamsToken = 'abc123';

    mockVerifyEmailToken.mockResolvedValue({
      success: true,
      message: 'Verified'
    });

    render(<EmailVerificationPage />);

    // Wait until success state appears
    expect(await screen.findByText(/Success!/i)).toBeInTheDocument();

    // Navigate should not happen immediately
    expect(mockNavigate).not.toHaveBeenCalled();

    // Advance timers by 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('shows failed UI when API returns success=false with message', async () => {
    mockSearchParamsToken = 'badtoken';

    mockVerifyEmailToken.mockResolvedValue({
      success: false,
      message: 'Token expired'
    });

    render(<EmailVerificationPage />);

    expect(await screen.findByText(/Activation Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Token expired/i)).toBeInTheDocument();
  });

  test('shows default failed message when API returns success=false without message', async () => {
    mockSearchParamsToken = 'badtoken';

    mockVerifyEmailToken.mockResolvedValue({
      success: false
    });

    render(<EmailVerificationPage />);

    expect(await screen.findByText(/Activation Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Verification failed\./i)).toBeInTheDocument();
  });

  test('shows connection error when verifyEmailToken throws', async () => {
    mockSearchParamsToken = 'abc123';

    mockVerifyEmailToken.mockRejectedValue(new Error('Network error'));

    render(<EmailVerificationPage />);

    expect(await screen.findByText(/Activation Failed/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Connection error\. Please try again\./i)
    ).toBeInTheDocument();
  });

  test('prevents double API calls (StrictMode protection via useRef)', async () => {
    mockSearchParamsToken = 'abc123';

    mockVerifyEmailToken.mockResolvedValue({
      success: true,
      message: 'Verified'
    });

    render(<EmailVerificationPage />);

    await waitFor(() => {
      expect(mockVerifyEmailToken).toHaveBeenCalledTimes(1);
    });
  });
});