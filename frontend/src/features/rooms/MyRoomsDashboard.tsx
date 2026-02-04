// src/features/rooms/MyRoomsDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Grid, List, Search, Filter, Clock, Star, Bookmark,
  Users, Lock, Globe, Calendar, Trash2, Archive, Eye, EyeOff,
  RefreshCw, MoreVertical, ChevronRight, Loader2, FolderOpen
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import RoomCardComponent from '../../components/ui/RoomCardComponent';
import type{ Room } from '../../services/roomService';
import roomService from '../../services/roomService';
import { useNavigate } from 'react-router-dom';

interface MyRoomsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomSelect: (roomId: string) => void;
}

const MyRoomsDashboard: React.FC<MyRoomsDashboardProps> = ({
  isOpen,
  onClose,
  onRoomSelect
}) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'participants'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'owner' | 'member'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomActions, setShowRoomActions] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  useEffect(() => {
    let filtered = rooms;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'owner') {
      // In production, filter by owner status
      filtered = filtered.filter(room => room.ownerId === 'current-user-id');
    } else if (filterType === 'member') {
      // In production, filter by member status
      filtered = filtered.filter(room => room.ownerId !== 'current-user-id');
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'participants':
          return b.participantCount - a.participantCount;
        default:
          return 0;
      }
    });

    setFilteredRooms(filtered);
  }, [rooms, searchQuery, sortBy, filterType]);

  const loadRooms = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await roomService.getMyRooms();
      if (result.success && result.rooms) {
        setRooms(result.rooms);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRoomAction = async (action: string, room: Room) => {
    switch (action) {
      case 'open':
        onRoomSelect(room.id);
        onClose();
        break;
      case 'leave':
        if (window.confirm(`Are you sure you want to leave "${room.name}"?`)) {
          try {
            await roomService.leaveRoom(room.id);
            setRooms(prev => prev.filter(r => r.id !== room.id));
          } catch (error) {
            console.error('Failed to leave room:', error);
          }
        }
        break;
      case 'bookmark':
        // Toggle bookmark status
        console.log('Toggle bookmark for:', room.id);
        break;
      case 'archive':
        // Archive room
        console.log('Archive room:', room.id);
        break;
    }
    setShowRoomActions(null);
  };

  const handleRefresh = () => {
    loadRooms(true);
  };

  const getRoomStatus = (room: Room) => {
    const lastActive = new Date(room.updatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) return { label: 'Active now', color: 'text-green-500' };
    if (hoursDiff < 24) return { label: 'Today', color: 'text-blue-500' };
    if (hoursDiff < 168) return { label: 'This week', color: 'text-amber-500' };
    return { label: 'Older', color: 'text-slate-400' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                My Rooms Dashboard
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Access and manage all your collaborative rooms
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh rooms"
            >
              <RefreshCw className={`w-5 h-5 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close dashboard"
            >
              <ChevronRight className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          {/* Stats and Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-semibold text-slate-800 dark:text-white">{rooms.length}</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">rooms total</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  All Rooms
                </button>
                <button
                  onClick={() => setFilterType('owner')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    filterType === 'owner'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Star size={14} /> My Rooms
                </button>
                <button
                  onClick={() => setFilterType('member')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
                    filterType === 'member'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Users size={14} /> Joined Rooms
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Show Archived
              </label>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search your rooms by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-10 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Recently Active</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="participants">Most Participants</option>
                </select>
                <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={20} />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                  aria-label="Grid view"
                >
                  <Grid size={20} className={viewMode === 'grid' ? 'text-blue-600' : 'text-slate-400'} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                  aria-label="List view"
                >
                  <List size={20} className={viewMode === 'list' ? 'text-blue-600' : 'text-slate-400'} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-260px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Loading your rooms...</p>
              </div>
            </div>
          ) : filteredRooms.length > 0 ? (
            <>
              {/* Rooms Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => {
                    const status = getRoomStatus(room);
                    return (
                      <div key={room.id} className="relative group">
                        <RoomCardComponent
                          id={room.id}
                          name={room.name}
                          description={room.description}
                          isPublic={room.isPublic}
                          ownerName={room.ownerName}
                          participantCount={room.participantCount}
                          maxParticipants={room.maxParticipants}
                          createdAt={room.createdAt}
                          updatedAt={room.updatedAt}
                          showJoinButton={false}
                          showOwnerInfo={filterType === 'all' || filterType === 'member'}
                          onClick={() => onRoomSelect(room.id)}
                        />
                        
                        {/* Room Status Badge */}
                        <div className={`absolute top-3 left-3 px-2 py-1 text-xs rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm ${status.color}`}>
                          {status.label}
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                setShowRoomActions(room.id);
                              }}
                              className="p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg hover:bg-white dark:hover:bg-slate-800"
                              aria-label="Room actions"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRooms.map((room) => {
                    const status = getRoomStatus(room);
                    return (
                      <div
                        key={room.id}
                        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                        onClick={() => onRoomSelect(room.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {room.name.charAt(0)}
                              </div>
                              <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs rounded-full bg-white dark:bg-slate-900 border ${status.color}`}>
                                {status.label}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900 dark:text-white">{room.name}</h3>
                                {room.isPublic ? (
                                  <Globe className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Lock className="w-4 h-4 text-amber-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Users size={14} />
                                  {room.participantCount} participants
                                </span>
                                <span>•</span>
                                <span>By {room.ownerName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  Updated {new Date(room.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {room.participantCount}/{room.maxParticipants}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                participants
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                setShowRoomActions(room.id);
                              }}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                              aria-label="Room actions"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty State for filtered results */}
              {filteredRooms.length === 0 && searchQuery && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No rooms found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Rooms Yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                {filterType === 'owner'
                  ? "You haven't created any rooms yet. Start by creating your first room!"
                  : "You haven't joined any rooms yet. Join a public room or ask for an invite!"}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Browse Public Rooms
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Create New Room
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {rooms.length > 0 ? (
                <>
                  Showing {filteredRooms.length} of {rooms.length} rooms •{' '}
                  {rooms.filter(r => r.participantCount > 0).length} currently active
                </>
              ) : (
                'Create or join rooms to start collaborating'
              )}
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Room Actions Menu */}
        {selectedRoom && showRoomActions && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm">
              <div className="p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  {selectedRoom.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {selectedRoom.isPublic ? 'Public Room' : 'Private Room'} • {selectedRoom.participantCount} participants
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleRoomAction('open', selectedRoom)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Open Room</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Enter the room workspace</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoomAction('bookmark', selectedRoom)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Bookmark Room</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Add to favorites for quick access</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoomAction('archive', selectedRoom)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Archive className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Archive Room</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Move to archived rooms</p>
                    </div>
                  </button>

                  {selectedRoom.ownerId !== 'current-user-id' && (
                    <button
                      onClick={() => handleRoomAction('leave', selectedRoom)}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Leave Room</p>
                        <p className="text-xs">Remove yourself from this room</p>
                      </div>
                    </button>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Button
                    onClick={() => setShowRoomActions(null)}
                    className="flex-1"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      onRoomSelect(selectedRoom.id);
                      onClose();
                    }}
                    className="flex-1"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRoomsDashboard;