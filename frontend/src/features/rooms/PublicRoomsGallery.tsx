// src/features/rooms/PublicRoomsGallery.tsx
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Globe, Users, Clock, TrendingUp, Grid, List,
  Loader2, RefreshCw, X, Star, Bookmark
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import RoomCardComponent from '../../components/ui/RoomCardComponent';
import type { Room } from '../../services/roomService';
import roomService from '../../services/roomService';
import { useNavigate } from 'react-router-dom';

interface PublicRoomsGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
}

const PublicRoomsGallery: React.FC<PublicRoomsGalleryProps> = ({
  isOpen,
  onClose,
  onJoinRoom
}) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'participants'>('popular');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen, sortBy, categoryFilter]);

  useEffect(() => {
    const filtered = rooms.filter(room => 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredRooms(filtered);
  }, [searchQuery, rooms]);

  const loadRooms = async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
      setPage(1);
    } else {
      setIsLoading(true);
    }

    try {
      const apiSort = sortBy === 'participants' ? 'popular' : sortBy;
    
      const result = await roomService.getPublicRooms({
        search: searchQuery || undefined,
        sort: apiSort, // Use mapped value
        page: refresh ? 1 : page,
        limit: 20
      });

      if (result.success && result.rooms) {
        if (refresh || page === 1) {
          setRooms(result.rooms);
        } else {
          setRooms(prev => [...prev, ...result.rooms!]);
        }
        setHasMore((result.rooms?.length || 0) === 20);
      }
    } catch (error) {
      console.error('Failed to load public rooms:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadRooms(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      setPage(prev => prev + 1);
      loadRooms();
    }
  };

  const handleJoinRoom = (roomId: string) => {
    onJoinRoom(roomId);
    onClose();
  };

  const handleRoomClick = (room: Room) => {
    if (room.isPublic) {
      handleJoinRoom(room.id);
    } else {
      // For private rooms, show password prompt
      const password = prompt('This room requires a password. Please enter the password:');
      if (password) {
        // In production, validate password through API
        handleJoinRoom(room.id);
      }
    }
  };

  const categories = [
    { id: 'all', label: 'All Rooms', icon: Globe },
    { id: 'popular', label: 'Most Popular', icon: TrendingUp },
    { id: 'creative', label: 'Creative', icon: Star },
    { id: 'education', label: 'Education', icon: Bookmark },
    { id: 'business', label: 'Business', icon: Users },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Public Rooms Gallery
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Discover and join collaborative drawing spaces
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
              aria-label="Close gallery"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    categoryFilter === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                placeholder="Search rooms by name, description, or owner..."
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
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest First</option>
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
                <p className="text-slate-500 dark:text-slate-400">Loading public rooms...</p>
              </div>
            </div>
          ) : filteredRooms.length > 0 ? (
            <>
              {/* Stats */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {filteredRooms.length} {filteredRooms.length === 1 ? 'Room' : 'Rooms'} Available
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {rooms.reduce((sum, room) => sum + room.participantCount, 0)} active collaborators
                  </p>
                </div>
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>

              {/* Rooms Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <RoomCardComponent
                      key={room.id}
                      id={room.id}
                      name={room.name}
                      description={room.description}
                      isPublic={room.isPublic}
                      ownerName={room.ownerName}
                      participantCount={room.participantCount}
                      maxParticipants={room.maxParticipants}
                      createdAt={room.createdAt}
                      updatedAt={room.updatedAt}
                      showJoinButton={true}
                      showOwnerInfo={true}
                      onClick={() => handleRoomClick(room)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      onClick={() => handleRoomClick(room)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {room.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-slate-900 dark:text-white">{room.name}</h3>
                              {room.isPublic ? (
                                <Globe className="w-4 h-4 text-green-500" />
                              ) : (
                                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                                  Private
                                </span>
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
                                <Clock size={14} />
                                Updated {new Date(room.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button onClick={() => handleRoomClick(room)}>
                            Join Room
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    variant="outline"
                    className="gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Load More Rooms'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Globe className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Public Rooms Found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'No rooms match your search criteria. Try different keywords.'
                  : 'There are currently no public rooms available. Be the first to create one!'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Create Your Own Room
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Looking for a specific room? Ask the owner for an invite link.
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Create New Room
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRoomsGallery;