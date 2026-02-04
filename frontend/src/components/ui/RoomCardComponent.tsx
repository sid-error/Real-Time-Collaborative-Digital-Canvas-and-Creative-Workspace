// src/components/ui/RoomCardComponent.tsx
import React from 'react';
import { Users, Lock, Globe, Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { Button } from './Button';
import { Link } from 'react-router-dom';

export interface RoomCardProps {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  ownerName: string;
  participantCount: number;
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  showJoinButton?: boolean;
  showOwnerInfo?: boolean;
  onClick?: () => void;
}

const RoomCardComponent: React.FC<RoomCardProps> = ({
  id,
  name,
  description,
  isPublic,
  ownerName,
  participantCount,
  maxParticipants,
  createdAt,
  updatedAt,
  thumbnail,
  showJoinButton = true,
  showOwnerInfo = true,
  onClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:translate-y-[-2px]"
      onClick={onClick}
    >
      {/* Room thumbnail/header */}
      <div className="h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative">
        {!isPublic && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs backdrop-blur-sm">
            <Lock size={12} />
            <span>Private</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800 dark:text-white">
            <Users size={16} />
            <span>{participantCount}/{maxParticipants}</span>
          </div>
        </div>
      </div>

      {/* Room content */}
      <div className="p-4">
        <div className="flex items-center gap-1">
          {isPublic ? (
            <span title="Public Room">
              <Globe className="w-4 h-4 text-green-500" />
            </span>
          ) : (
            <span title="Private Room">
              <Lock className="w-4 h-4 text-amber-500" />
            </span>
          )}
        </div>

        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
            {description}
          </p>
        )}

        {/* Room metadata */}
        <div className="space-y-2 mb-4">
          {showOwnerInfo && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <User size={14} />
              <span className="truncate">Created by {ownerName}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Created {formatDate(createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Updated {formatTimeAgo(updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showJoinButton ? (
            <Link to={`/room/${id}`} className="flex-1">
              <Button className="w-full gap-2">
                <ArrowRight size={16} />
                Enter Room
              </Button>
            </Link>
          ) : (
            <Link to={`/room/${id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Open
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCardComponent;