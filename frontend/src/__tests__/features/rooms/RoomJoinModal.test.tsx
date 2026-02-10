import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomJoinModal from '../../../features/rooms/RoomJoinModal';
import roomService from '../../../services/roomService';
import { BrowserRouter } from 'react-router-dom';

// Mock roomService API
jest.mock('../../services/roomService', () => ({
  validateRoom: jest.fn(),
  joinRoom: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('RoomJoinModal', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderModal = (isOpen = true) => {
    render(
      <BrowserRouter>
        <RoomJoinModal isOpen={isOpen} onClose={onClose} />
      </BrowserRouter>
    );
  };

  it('does not render when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText(/Enter Room Code/i)).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    renderModal();
    expect(screen.getByText(/Enter Room Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Code/i)).toBeInTheDocument();
  });

  it('shows error if room code is empty and validateRoom is clicked', async () => {
    renderModal();
    fireEvent.click(screen.getByLabelText(/Validate room code/i));
    expect(await screen.findByText(/Please enter a room code/i)).toBeInTheDocument();
  });

  it('calls validateRoom API and proceeds if room does not require password', async () => {
    (roomService.validateRoom as jest.Mock).mockResolvedValue({
      success: true,
      requiresPassword: false
    });
    (roomService.joinRoom as jest.Mock).mockResolvedValue({ success: true });

    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Validate room code/i));

    await waitFor(() => {
      expect(roomService.validateRoom).toHaveBeenCalledWith('ABC123');
      expect(roomService.joinRoom).toHaveBeenCalledWith({ roomId: 'ABC123', password: undefined });
      expect(mockNavigate).toHaveBeenCalledWith('/room/ABC123');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows password input if room requires password', async () => {
    (roomService.validateRoom as jest.Mock).mockResolvedValue({
      success: true,
      requiresPassword: true
    });

    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Validate room code/i));

    expect(await screen.findByLabelText(/Room Password/i)).toBeInTheDocument();
  });

  it('shows error if joinRoom fails', async () => {
    (roomService.validateRoom as jest.Mock).mockResolvedValue({
      success: true,
      requiresPassword: true
    });
    (roomService.joinRoom as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Wrong password'
    });

    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Validate room code/i));

    fireEvent.change(await screen.findByLabelText(/Room Password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByLabelText(/Join room/i));

    expect(await screen.findByText(/Wrong password/i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error if join attempted with empty password on protected room', async () => {
    (roomService.validateRoom as jest.Mock).mockResolvedValue({
      success: true,
      requiresPassword: true
    });

    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Validate room code/i));

    fireEvent.click(screen.getByLabelText(/Join room/i));
    expect(await screen.findByText(/Password is required for this room/i)).toBeInTheDocument();
  });

  it('resets form when modal is closed', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Close modal/i));
    expect(onClose).toHaveBeenCalled();
    renderModal(); // Re-render to simulate reopening
    expect(screen.getByLabelText(/Room Code/i)).toHaveValue('');
  });

  it('allows going back from password step to room code entry', async () => {
    (roomService.validateRoom as jest.Mock).mockResolvedValue({
      success: true,
      requiresPassword: true
    });

    renderModal();
    fireEvent.change(screen.getByLabelText(/Room Code/i), { target: { value: 'ABC123' } });
    fireEvent.click(screen.getByLabelText(/Validate room code/i));

    const backButton = await screen.findByLabelText(/Go back to room code entry/i);
    fireEvent.click(backButton);

    expect(screen.getByLabelText(/Room Code/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Room Password/i)).not.toBeInTheDocument();
  });

  it('formats room code input to uppercase and removes invalid characters', () => {
    renderModal();
    const input = screen.getByLabelText(/Room Code/i);
    fireEvent.change(input, { target: { value: 'abc-123$%' } });
    expect(input).toHaveValue('ABC-123');
  });
});
