import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoomCreationModal from '../../../features/rooms/RoomCreationModal';
import roomService from '../../../services/roomService';

// Mock the roomService
jest.mock('../../services/roomService', () => ({
  createRoom: jest.fn()
}));

describe('RoomCreationModal', () => {
  const onClose = jest.fn();
  const onRoomCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<RoomCreationModal isOpen={false} onClose={onClose} onRoomCreated={onRoomCreated} />);
    expect(screen.queryByText(/Create New Room/i)).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', () => {
    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    expect(screen.getByText(/Create New Room/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Room Name \*/i)).toBeInTheDocument();
  });

  it('validates empty room name', async () => {
    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.click(screen.getByText(/Create Room/i));
    expect(await screen.findByText(/Room name is required/i)).toBeInTheDocument();
  });

  it('validates room name length', async () => {
    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText(/Create Room/i));
    expect(await screen.findByText(/Room name must be between 3 and 50 characters/i)).toBeInTheDocument();
  });

  it('validates password for private room', async () => {
    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    // switch to private
    fireEvent.click(screen.getByLabelText(/Private room - Password required to join/i));
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'Test Room' } });
    fireEvent.click(screen.getByText(/Create Room/i));
    expect(await screen.findByText(/Password is required for private rooms/i)).toBeInTheDocument();
  });

  it('calls API and onRoomCreated for valid public room', async () => {
    (roomService.createRoom as jest.Mock).mockResolvedValue({
      success: true,
      room: { id: 'room123' }
    });

    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'My Room' } });
    fireEvent.click(screen.getByText(/Create Room/i));

    await waitFor(() => {
      expect(roomService.createRoom).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Room',
        isPublic: true
      }));
      expect(onRoomCreated).toHaveBeenCalledWith('room123');
    });
  });

  it('shows API error message on failure', async () => {
    (roomService.createRoom as jest.Mock).mockResolvedValue({
      success: false,
      message: 'API error'
    });

    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'Room Fail' } });
    fireEvent.click(screen.getByText(/Create Room/i));

    expect(await screen.findByText(/API error/i)).toBeInTheDocument();
  });

  it('resets form when cancel is clicked', () => {
    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'Temp Room' } });
    fireEvent.click(screen.getByText(/Cancel room creation/i));
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByLabelText(/Room Name \*/i)).toHaveValue('');
  });

  it('disables inputs while creating', async () => {
    let resolvePromise: any;
    (roomService.createRoom as jest.Mock).mockImplementation(
      () => new Promise(res => resolvePromise = res)
    );

    render(<RoomCreationModal isOpen={true} onClose={onClose} onRoomCreated={onRoomCreated} />);
    fireEvent.change(screen.getByLabelText(/Room Name \*/i), { target: { value: 'My Room' } });
    fireEvent.click(screen.getByText(/Create Room/i));

    expect(screen.getByLabelText(/Room Name \*/i)).toBeDisabled();
    resolvePromise({ success: true, room: { id: 'room123' } });
  });
});
