// src/services/roomService.ts
import api from '../api/axios';

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
      const response = await api.post('/rooms/create', roomData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room'
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
      const response = await api.post('/rooms/join', joinData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to join room'
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

      const response = await api.get(`/rooms/public?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch rooms'
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
      const response = await api.get('/rooms/my-rooms');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch your rooms'
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
      const response = await api.get(`/rooms/${roomId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch room details'
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
      const response = await api.put(`/rooms/${roomId}`, updates);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update room'
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
      const response = await api.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete room'
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
      const response = await api.post(`/rooms/${roomId}/leave`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to leave room'
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
  async getParticipants(roomId: string): Promise<{ success: boolean; participants?: any[]; message?: string }> {
    try {
      const response = await api.get(`/rooms/${roomId}/participants`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch participants'
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
      const response = await api.post(`/rooms/${roomId}/participants/${userId}`, { action });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || `Failed to ${action} participant`
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
  async validateRoom(roomId: string): Promise<{ success: boolean; requiresPassword?: boolean; message?: string }> {
    try {
      const response = await api.get(`/rooms/${roomId}/validate`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Room not found'
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