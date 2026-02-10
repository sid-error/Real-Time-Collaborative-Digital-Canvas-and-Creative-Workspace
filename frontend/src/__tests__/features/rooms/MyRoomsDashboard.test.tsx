import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyRoomsDashboard from '../../../features/rooms/MyRoomsDashboard';
import roomService from '../../../services/roomService';

// ---- Mocks ----
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../../../services/roomService', () => ({
  __esModule: true,
  default: {
    getMyRooms: jest.fn(),
    leaveRoom: jest.fn()
  }
}));

/**
 * Mock RoomCardComponent so we don't depend on its internal UI.
 * We only care that clicking triggers onClick.
 */
jest.mock('../../../components/ui/RoomCardComponent', () => {
  return function MockRoomCardComponent(props: any) {
    return (
      <button onClick={props.onClick} aria-label={`room-${props.id}`}>
        {props.name}
      </button>
    );
  };
});

describe('MyRoomsDashboard', () => {
  const onClose = jest.fn();
  const onRoomSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MyRoomsDashboard isOpen={false} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('calls roomService.getMyRooms when opened', async () => {
    (roomService.getMyRooms as jest.Mock).mockResolvedValue({
      success: true,
      rooms: []
    });

    render(
      <MyRoomsDashboard isOpen={true} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    await waitFor(() => {
      expect(roomService.getMyRooms).toHaveBeenCalledTimes(1);
    });
  });

  test('shows loading state initially', async () => {
    // Make it hang for a moment
    (roomService.getMyRooms as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <MyRoomsDashboard isOpen={true} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    expect(screen.getByText(/Loading your rooms/i)).toBeInTheDocument();
  });

  test('renders rooms returned by service', async () => {
    (roomService.getMyRooms as jest.Mock).mockResolvedValue({
      success: true,
      rooms: [
        {
          id: 'room-1',
          name: 'Alpha Room',
          description: 'First room',
          isPublic: true,
          ownerId: 'user-1',
          ownerName: 'Alice',
          participantCount: 3,
          maxParticipants: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'room-2',
          name: 'Beta Room',
          description: 'Second room',
          isPublic: false,
          ownerId: 'user-2',
          ownerName: 'Bob',
          participantCount: 1,
          maxParticipants: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });

    render(
      <MyRoomsDashboard isOpen={true} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    // Wait until rooms appear
    expect(await screen.findByText('Alpha Room')).toBeInTheDocument();
    expect(screen.getByText('Beta Room')).toBeInTheDocument();
  });

  test('clicking a room triggers onRoomSelect with correct id', async () => {
    (roomService.getMyRooms as jest.Mock).mockResolvedValue({
      success: true,
      rooms: [
        {
          id: 'room-99',
          name: 'Click Me Room',
          description: '',
          isPublic: true,
          ownerId: 'user-1',
          ownerName: 'Alice',
          participantCount: 2,
          maxParticipants: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    });

    render(
      <MyRoomsDashboard isOpen={true} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    const roomBtn = await screen.findByRole('button', { name: 'room-room-99' });
    fireEvent.click(roomBtn);

    expect(onRoomSelect).toHaveBeenCalledWith('room-99');
  });

  test('clicking close triggers onClose', async () => {
    (roomService.getMyRooms as jest.Mock).mockResolvedValue({
      success: true,
      rooms: []
    });

    render(
      <MyRoomsDashboard isOpen={true} onClose={onClose} onRoomSelect={onRoomSelect} />
    );

    const closeBtn = screen.getByLabelText(/Close dashboard/i);
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
