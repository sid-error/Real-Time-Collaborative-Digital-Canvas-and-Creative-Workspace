// src/services/roomService.ts
import api from '../api/axios';
import { AxiosError } from 'axios';


/**
 * Interface representing a room object
 * @interface Room
 */
export interface Room {
  /** Unique identifier for the room */
  id: string;
  /** Display name of the room */
  name: string;
  /** Description of the room's purpose */
  description: string;
  /** ID of the room owner */
  ownerId: string;
  /** Display name of the room owner */
  ownerName: string;
  /** Whether the room is publicly accessible */
  isPublic: boolean;
  /** Whether the room requires a password to join */
  hasPassword: boolean;
  /** Current number of participants in the room */
  participantCount: number;
  /** Maximum allowed participants in the room */
  maxParticipants: number;
  /** ISO timestamp when the room was created */
  createdAt: string;
  /** ISO timestamp when the room was last updated */
  updatedAt: string;
  /** Optional thumbnail URL for the room */
  thumbnail?: string;
  /** Unique join code for the room (optional depending on backend) */
  roomCode?: string;
}

/**
 * Interface for creating a new room
 * @interface CreateRoomData
 */
export interface CreateRoomData {
  /** Name for the new room (required) */
  name: string;
  /** Optional description of the room */
  description?: string;
  /** Whether the room should be public or private */
  isPublic: boolean;
  /** Password for private rooms (required if isPublic is false) */
  password?: string;
  /** Maximum number of participants (default: 10) */
  maxParticipants?: number;
}

/**
 * Interface for joining an existing room
 * @interface JoinRoomData
 */
export interface JoinRoomData {
  /** ID of the room to join */
  roomId: string;
  /** Password for private rooms (required if room has password) */
  password?: string;
}

/**
 * Interface representing a raw room object from the backend
 */
interface BackendRoom {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  owner?: string | { _id?: string; id?: string; username?: string; fullName?: string };
  ownerName?: string;
  isPublic?: boolean;
  visibility?: 'public' | 'private';
  participantCount?: number;
  participants?: unknown[];
  password?: string;
  hasPassword?: boolean;
  requiresPassword?: boolean;
  maxParticipants?: number;
  createdAt?: string;
  updatedAt?: string;
  thumbnail?: string;
  roomCode?: string;
}

/**
 * Maps a raw backend room document to the frontend Room interface.
 * Backend returns different field names/types than what the UI expects:
 *   - `_id` instead of `id`
 *   - `visibility: "public"|"private"` instead of `isPublic: boolean`
 *   - `owner: { _id, username }` (populated) or `owner: string` (ObjectId)
 *   - `participants: ObjectId[]` instead of `participantCount`
 *   - `password` (hashed string) instead of `hasPassword`
 */
function mapBackendRoom(raw: BackendRoom): Room {

  // Handle owner — can be a populated object or a plain ObjectId string
  let ownerId = '';
  let ownerName = 'Unknown';
  if (raw.owner && typeof raw.owner === 'object') {
    ownerId = raw.owner._id || raw.owner.id || '';
    ownerName = raw.owner.username || raw.owner.fullName || 'Unknown';
  } else if (typeof raw.owner === 'string') {
    ownerId = raw.owner;
    ownerName = raw.ownerName || 'Unknown';
  }

  // Determine visibility
  const isPublic =
    raw.isPublic !== undefined
      ? raw.isPublic
      : raw.visibility === 'public';

  // Determine participant count
  const participantCount =
    raw.participantCount ??
    (Array.isArray(raw.participants) ? raw.participants.length : 0);

  return {
    id: raw._id || raw.id || '',
    name: raw.name || '',
    description: raw.description || '',
    ownerId,
    ownerName,
    isPublic,
    hasPassword: raw.hasPassword ?? raw.requiresPassword ?? (raw.visibility === 'private' && !!raw.password),
    participantCount,
    maxParticipants: raw.maxParticipants ?? 50,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
    thumbnail: raw.thumbnail,
    roomCode: raw.roomCode,
  };
}

/**
 * Service class for managing room operations
 * 
 * This service provides methods for creating, joining, and managing rooms
 * through API calls to the backend server.
 * 
 * @class RoomService
 */
class RoomService {
  /**
   * Creates a new room with the specified settings
   * 
   * @async
   * @method createRoom
   * @param {CreateRoomData} roomData - Data for the new room
   * @returns {Promise<{success: boolean; room?: Room; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.createRoom({
   *   name: 'My New Room',
   *   description: 'A room for collaboration',
   *   isPublic: true,
   *   maxParticipants: 20
   * });
   * 
   * if (result.success) {
   *   console.log('Room created:', result.room);
   * } else {
   *   console.error('Failed:', result.message);
   * }
   * ```
   */
  async createRoom(roomData: CreateRoomData): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.post<{ success?: boolean; room?: BackendRoom; message?: string }>('/rooms/create', {
        name: roomData.name,
        description: roomData.description,
        visibility: roomData.isPublic ? 'public' : 'private',
        password: roomData.password,
      });


      const data = response.data;
      return {
        success: data.success ?? true,
        room: data.room ? mapBackendRoom(data.room) : undefined,
        message: data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to create room',
      };
    }

  }

  /**
   * Joins an existing room with optional password
   * 
   * @async
   * @method joinRoom
   * @param {JoinRoomData} joinData - Room ID and optional password
   * @returns {Promise<{success: boolean; room?: Room; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.joinRoom({
   *   roomId: 'room-123',
   *   password: 'secret123' // Required for private rooms
   * });
   * ```
   */
  async joinRoom(joinData: JoinRoomData): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.post<{ success?: boolean; room?: BackendRoom; message?: string }>('/rooms/join', {
        roomCode: joinData.roomId,
        password: joinData.password,
      });


      const data = response.data;
      return {
        success: data.success ?? true,
        room: data.room ? mapBackendRoom(data.room) : undefined,
        message: data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to join room',
      };
    }

  }

  /**
   * Retrieves a list of public rooms with optional filtering and pagination
   * 
   * @async
   * @method getPublicRooms
   * @param {Object} [options] - Optional parameters for filtering
   * @param {string} [options.search] - Search query for room names/descriptions
   * @param {'newest' | 'popular' | 'name'} [options.sort] - Sort order
   * @param {number} [options.limit] - Maximum number of rooms to return
   * @param {number} [options.page] - Page number for pagination
   * @returns {Promise<{success: boolean; rooms?: Room[]; total?: number; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.getPublicRooms({
   *   search: 'art',
   *   sort: 'popular',
   *   limit: 20,
   *   page: 1
   * });
   * ```
   */
  async getPublicRooms(options?: {
    search?: string;
    sort?: 'newest' | 'popular' | 'name';
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; rooms?: Room[]; total?: number; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (options?.search) params.append('search', options.search);
      if (options?.sort) params.append('sort', options.sort);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.page) params.append('page', options.page.toString());

      const response = await api.get<{ rooms?: BackendRoom[]; pagination?: { total: number }; message?: string }>(`/rooms/public?${params.toString()}`);

      const data = response.data;

      // Backend returns { rooms, pagination } without `success`
      const rawRooms = data.rooms || [];
      return {
        success: true,
        rooms: rawRooms.map(mapBackendRoom),
        total: data.pagination?.total ?? rawRooms.length,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to fetch rooms',
      };
    }

  }

  /**
   * Retrieves all rooms that the current user owns or has joined
   * 
   * @async
   * @method getMyRooms
   * @returns {Promise<{success: boolean; rooms?: Room[]; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.getMyRooms();
   * if (result.success) {
   *   console.log('My rooms:', result.rooms);
   * }
   * ```
   */
  async getMyRooms(): Promise<{ success: boolean; rooms?: Room[]; message?: string }> {
    try {
      const response = await api.get<{ rooms?: BackendRoom[]; message?: string }>('/rooms/my-rooms');

      const data = response.data;

      const rawRooms = data.rooms || [];
      return {
        success: true,
        rooms: rawRooms.map(mapBackendRoom),
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to fetch your rooms',
      };
    }

  }

  /**
   * Retrieves detailed information about a specific room
   * 
   * @async
   * @method getRoom
   * @param {string} roomId - ID of the room to retrieve
   * @returns {Promise<{success: boolean; room?: Room; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const room = await roomService.getRoom('room-123');
   * ```
   */
  async getRoom(roomId: string): Promise<{ success: boolean; room?: Room; message?: string }> {
    try {
      const response = await api.get<{ success?: boolean; room?: BackendRoom; message?: string }>(`/rooms/${roomId}/validate`);

      const data = response.data;

      return {
        success: data.success ?? true,
        room: data.room ? mapBackendRoom(data.room) : undefined,
        message: data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to fetch room details',
      };
    }

  }

  /**
   * Updates settings for an existing room
   * 
   * @async
   * @method updateRoom
   * @param {string} roomId - ID of the room to update
   * @param {Partial<CreateRoomData>} updates - Partial room data to update
   * @returns {Promise<{success: boolean; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.updateRoom('room-123', {
   *   name: 'Updated Room Name',
   *   maxParticipants: 30
   * });
   * ```
   */
  async updateRoom(roomId: string, updates: Partial<CreateRoomData>): Promise<{ success: boolean; message?: string }> {
    try {
      const backendUpdates: Record<string, unknown> = { ...updates };
      if (updates.isPublic !== undefined) {
        backendUpdates.visibility = updates.isPublic ? 'public' : 'private';
        delete backendUpdates.isPublic;
      }

      const response = await api.put<{ success?: boolean; message?: string }>(`/rooms/${roomId}`, backendUpdates);

      return {
        success: response.data.success ?? true,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to update room',
      };
    }

  }

  /**
   * Permanently deletes a room (room owner only)
   * 
   * @async
   * @method deleteRoom
   * @param {string} roomId - ID of the room to delete
   * @returns {Promise<{success: boolean; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.deleteRoom('room-123');
   * ```
   */
  async deleteRoom(roomId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete<{ success?: boolean; message?: string }>(`/rooms/${roomId}`);

      return {
        success: response.data.success ?? true,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to delete room',
      };
    }

  }

  /**
   * Removes the current user from a room
   * 
   * @async
   * @method leaveRoom
   * @param {string} roomId - ID of the room to leave
   * @returns {Promise<{success: boolean; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.leaveRoom('room-123');
   * ```
   */
  async leaveRoom(roomId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post<{ success?: boolean; message?: string }>(`/rooms/${roomId}/leave`);

      return {
        success: response.data.success ?? true,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to leave room',
      };
    }

  }

  /**
   * Retrieves the list of participants in a room
   * 
   * @async
   * @method getParticipants
   * @param {string} roomId - ID of the room
   * @returns {Promise<{success: boolean; participants?: any[]; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const result = await roomService.getParticipants('room-123');
   * if (result.success) {
   *   console.log('Participants:', result.participants);
   * }
   * ```
   */
  async getParticipants(roomId: string): Promise<{ success: boolean; participants?: unknown[]; message?: string }> {
    try {
      const response = await api.get<{ success?: boolean; participants?: unknown[]; message?: string }>(`/rooms/${roomId}/participants`);

      return {
        success: response.data.success ?? true,
        participants: response.data.participants,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to fetch participants',
      };
    }

  }

  /**
   * Manages a participant in a room (kick, ban, promote, demote)
   * 
   * @async
   * @method manageParticipant
   * @param {string} roomId - ID of the room
   * @param {string} userId - ID of the participant to manage
   * @param {'kick' | 'ban' | 'promote' | 'demote'} action - Action to perform
   * @returns {Promise<{success: boolean; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * // Kick a participant
   * await roomService.manageParticipant('room-123', 'user-456', 'kick');
   * 
   * // Promote to moderator
   * await roomService.manageParticipant('room-123', 'user-456', 'promote');
   * ```
   */
  async manageParticipant(
    roomId: string,
    userId: string,
    action: 'kick' | 'ban' | 'promote' | 'demote'
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post<{ success?: boolean; message?: string }>(`/rooms/${roomId}/participants/${userId}`, { action });

      return {
        success: response.data.success ?? true,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || `Failed to ${action} participant`,
      };
    }

  }

  /**
   * Validates a room code and checks if password is required
   * 
   * @async
   * @method validateRoom
   * @param {string} roomId - Room ID or code to validate
   * @returns {Promise<{success: boolean; requiresPassword?: boolean; message?: string}>} Response object
   * 
   * @example
   * ```typescript
   * const validation = await roomService.validateRoom('ABC-123');
   * if (validation.success) {
   *   console.log('Password required:', validation.requiresPassword);
   * }
   * ```
   */
  async validateRoom(roomId: string): Promise<{
    success: boolean;
    requiresPassword?: boolean;
    room?: Room;
    message?: string;
  }> {
    try {
      const response = await api.get<{ success?: boolean; room?: BackendRoom; message?: string }>(`/rooms/${roomId}/validate`);

      const data = response.data;
      return {
        success: data.success ?? true,
        requiresPassword:
          data.room?.requiresPassword ??
          data.room?.hasPassword ??
          (data.room?.visibility === 'private' && !!data.room?.password) ??
          false,
        room: data.room ? mapBackendRoom(data.room) : undefined,
        message: data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Room not found',
      };
    }

  }

  /**
   * Invite users to a room.
   */
  async inviteUsers(roomId: string, userIds: string[]): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.post<{ success?: boolean; message?: string }>(`/rooms/${roomId}/invite`, { userIds });

      return {
        success: response.data.success ?? true,
        message: response.data.message,
      };
    } catch (error) {
      const err = error as AxiosError<{ error?: string; message?: string }>;
      return {
        success: false,
        message: err.response?.data?.error || err.response?.data?.message || 'Failed to invite users',
      };
    }

  }
}

/**
 * Singleton instance of RoomService
 * 
 * @constant {RoomService} roomService
 */
export default new RoomService();