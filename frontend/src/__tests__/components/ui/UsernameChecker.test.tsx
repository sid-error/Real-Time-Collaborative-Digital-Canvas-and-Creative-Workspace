import React from 'react';
import { render, screen, act } from '@testing-library/react';
import UsernameChecker from '../../../components/ui/UsernameChecker';
import { checkUsernameAvailability } from '../../../utils/authService';

jest.mock('../../../utils/authService', () => ({
  checkUsernameAvailability: jest.fn()
}));

const mockedCheck = checkUsernameAvailability as jest.Mock;

describe('UsernameChecker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('returns null when username is empty', () => {
    const { container } = render(
      <UsernameChecker username="" onAvailabilityChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders when username has at least 1 character', () => {
    render(<UsernameChecker username="a" onAvailabilityChange={jest.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/1 character/i)).toBeInTheDocument();
  });

  test('shows minimum 3 characters message when username < 3', () => {
    render(<UsernameChecker username="ab" onAvailabilityChange={jest.fn()} />);

    expect(screen.getByText(/2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/\(minimum 3 required\)/i)).toBeInTheDocument();
  });

  test('does NOT call API when username < 3', () => {
    render(<UsernameChecker username="ab" onAvailabilityChange={jest.fn()} />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockedCheck).not.toHaveBeenCalled();
  });

  test('calls API after debounce when username >= 3', async () => {
    mockedCheck.mockResolvedValueOnce({
      available: true,
      message: 'Available'
    });

    render(<UsernameChecker username="abc" onAvailabilityChange={jest.fn()} />);

    // Debounce is 500ms default
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockedCheck).toHaveBeenCalledTimes(1);
    expect(mockedCheck).toHaveBeenCalledWith('abc');
  });

  test('shows loading text immediately when username >= 3', () => {
    render(<UsernameChecker username="abc" onAvailabilityChange={jest.fn()} />);
    expect(screen.getByText(/Checking username availability/i)).toBeInTheDocument();
  });

  test('renders available state after API success', async () => {
    mockedCheck.mockResolvedValueOnce({
      available: true,
      message: 'Username is available'
    });

    render(<UsernameChecker username="abc" onAvailabilityChange={jest.fn()} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText(/Username is available/i)).toBeInTheDocument();
  });

  test('calls onAvailabilityChange(true) when username is available', async () => {
    const onAvailabilityChange = jest.fn();

    mockedCheck.mockResolvedValueOnce({
      available: true,
      message: 'Available'
    });

    render(<UsernameChecker username="abc" onAvailabilityChange={onAvailabilityChange} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(onAvailabilityChange).toHaveBeenCalledWith(true);
  });

  test('renders unavailable state and suggestions when not available', async () => {
    mockedCheck.mockResolvedValueOnce({
      available: false,
      message: 'Taken',
      suggestions: ['abc123', 'abc_dev']
    });

    render(<UsernameChecker username="abc" onAvailabilityChange={jest.fn()} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText(/Taken/i)).toBeInTheDocument();
    expect(screen.getByText(/Try these alternatives/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Suggested username: abc123/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Suggested username: abc_dev/i)).toBeInTheDocument();
  });

  test('calls onAvailabilityChange(false) when username is NOT available', async () => {
    const onAvailabilityChange = jest.fn();

    mockedCheck.mockResolvedValueOnce({
      available: false,
      message: 'Taken',
      suggestions: ['abc123']
    });

    render(<UsernameChecker username="abc" onAvailabilityChange={onAvailabilityChange} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(onAvailabilityChange).toHaveBeenCalledWith(false);
  });

  test('renders error message when API throws', async () => {
    mockedCheck.mockRejectedValueOnce(new Error('Network error'));

    render(<UsernameChecker username="abc" onAvailabilityChange={jest.fn()} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText(/Unable to check username availability/i)).toBeInTheDocument();
  });

  test('debounce prevents multiple API calls for rapid typing', async () => {
    mockedCheck.mockResolvedValue({
      available: true,
      message: 'Available'
    });

    const { rerender } = render(
      <UsernameChecker username="abc" onAvailabilityChange={jest.fn()} debounceTime={500} />
    );

    // user types fast -> component rerenders quickly
    rerender(<UsernameChecker username="abcd" onAvailabilityChange={jest.fn()} debounceTime={500} />);
    rerender(<UsernameChecker username="abcde" onAvailabilityChange={jest.fn()} debounceTime={500} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Only last value should be checked
    expect(mockedCheck).toHaveBeenCalledTimes(1);
    expect(mockedCheck).toHaveBeenCalledWith('abcde');
  });

  test('trims username before calling API', async () => {
    mockedCheck.mockResolvedValueOnce({
      available: true,
      message: 'Available'
    });

    render(<UsernameChecker username="   abc   " onAvailabilityChange={jest.fn()} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockedCheck).toHaveBeenCalledWith('abc');
  });
});
