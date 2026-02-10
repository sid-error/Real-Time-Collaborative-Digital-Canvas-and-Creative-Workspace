// __tests__/components/DeletionSurveyModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DeletionSurveyModal from '../../components/DeletionSurveyModal';
import { submitDeletionFeedback } from '../../services/accountDeletionService';

jest.mock('../../services/accountDeletionService', () => ({
  submitDeletionFeedback: jest.fn(),
}));

// Mock Modal so tests don't depend on its internal UI
jest.mock('../../components/ui/Modal', () => ({
  Modal: ({ isOpen, title, children }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h1>{title}</h1>
        {children}
      </div>
    );
  },
}));

// Mock Button so loading/variant doesn't break tests
jest.mock('../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, isLoading, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} {...rest}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

const mockedSubmit = submitDeletionFeedback as jest.Mock;

describe('DeletionSurveyModal', () => {
  const onClose = jest.fn();
  const onComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (window.alert as jest.Mock).mockRestore();
  });

  it('does not render when isOpen is false', () => {
    render(
      <DeletionSurveyModal
        isOpen={false}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText("We're Sorry to See You Go")).toBeInTheDocument();
    expect(
      screen.getByText(/Your account deletion has been processed/i)
    ).toBeInTheDocument();
  });

  it('submit button is disabled when no reason selected', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });
    expect(submitBtn).toBeDisabled();
  });

  it('selecting a reason enables submit button', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const reasonBtn = screen.getByRole('radio', { name: /privacy concerns/i });
    fireEvent.click(reasonBtn);

    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('fills feedback + suggestions fields correctly', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const feedback = screen.getByLabelText(/additional feedback/i);
    const suggestions = screen.getByLabelText(/suggestions for improvement/i);

    fireEvent.change(feedback, { target: { value: 'This is my feedback' } });
    fireEvent.change(suggestions, { target: { value: 'Add more features' } });

    expect(feedback).toHaveValue('This is my feedback');
    expect(suggestions).toHaveValue('Add more features');
  });

  it('checks and unchecks optional checkboxes', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const participate = screen.getByLabelText(
      /willing to participate in future user research/i
    ) as HTMLInputElement;

    const contact = screen.getByLabelText(
      /permission to contact for follow-up feedback/i
    ) as HTMLInputElement;

    expect(participate.checked).toBe(false);
    expect(contact.checked).toBe(false);

    fireEvent.click(participate);
    fireEvent.click(contact);

    expect(participate.checked).toBe(true);
    expect(contact.checked).toBe(true);

    fireEvent.click(participate);
    fireEvent.click(contact);

    expect(participate.checked).toBe(false);
    expect(contact.checked).toBe(false);
  });

  it('calls onComplete when Skip Feedback is clicked', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /skip feedback/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('submits survey successfully and shows success UI', async () => {
    mockedSubmit.mockResolvedValueOnce({ success: true });

    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    // select reason
    fireEvent.click(screen.getByRole('radio', { name: /temporary account/i }));

    // fill feedback
    fireEvent.change(screen.getByLabelText(/additional feedback/i), {
      target: { value: 'Feedback text' },
    });

    fireEvent.change(screen.getByLabelText(/suggestions for improvement/i), {
      target: { value: 'Suggestion text' },
    });

    // tick checkboxes
    fireEvent.click(
      screen.getByLabelText(/willing to participate in future user research/i)
    );
    fireEvent.click(
      screen.getByLabelText(/permission to contact for follow-up feedback/i)
    );

    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledTimes(1);
    });

    // verify payload
    expect(mockedSubmit).toHaveBeenCalledWith({
      reason: 'temporary',
      feedback: 'Feedback text',
      improvementSuggestions: 'Suggestion text',
      willingToParticipate: true,
      contactForFeedback: true,
    });

    // success UI
    expect(await screen.findByText(/Thank You!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your feedback has been submitted/i)
    ).toBeInTheDocument();

    // after 2s -> onComplete + onClose
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('alerts if API returns success:false', async () => {
    mockedSubmit.mockResolvedValueOnce({ success: false, message: 'Bad request' });

    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /other reason/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledTimes(1);
    });

    expect(window.alert).toHaveBeenCalledWith('Bad request');
    expect(onComplete).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('alerts on submit failure (throws)', async () => {
    mockedSubmit.mockRejectedValueOnce(new Error('Network fail'));

    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /too complicated to use/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit feedback/i }));

    await waitFor(() => {
      expect(mockedSubmit).toHaveBeenCalledTimes(1);
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Failed to submit survey. Please try again.'
    );
  });

  it('allows selecting reason with keyboard (Enter)', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const reasonBtn = screen.getByRole('radio', { name: /found a better alternative/i });

    fireEvent.keyDown(reasonBtn, { key: 'Enter' });

    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('allows selecting reason with keyboard (Space)', () => {
    render(
      <DeletionSurveyModal
        isOpen={true}
        onClose={onClose}
        onComplete={onComplete}
        userEmail="test@example.com"
      />
    );

    const reasonBtn = screen.getByRole('radio', { name: /didn't find it useful/i });

    fireEvent.keyDown(reasonBtn, { key: ' ' });

    const submitBtn = screen.getByRole('button', { name: /submit feedback/i });
    expect(submitBtn).not.toBeDisabled();
  });
});
