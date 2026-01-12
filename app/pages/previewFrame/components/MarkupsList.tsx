'use client';

import React from 'react';
import { Clock, Trash2, Eye } from 'lucide-react';
import { Markup } from '../hooks/useMarkupTool';

interface MarkupsListProps {
  markups: Markup[];
  currentTime: number;
  onMarkupClick: (markup: Markup) => void;
  onMarkupDelete: (markupId: string) => void;
}

export const MarkupsList: React.FC<MarkupsListProps> = ({
  markups = [], // Add default value
  currentTime,
  onMarkupClick,
  onMarkupDelete,
}) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (markups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-gray-600" />
        </div>
        <p className="text-gray-400 text-sm text-center mb-2">No markups yet</p>
        <p className="text-gray-500 text-xs text-center">
          Pause the video and click the markup button to annotate
        </p>
      </div>
    );
  }

  // Sort markups by timestamp (newest first)
  const sortedMarkups = [...markups].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1 mb-3">
        <span className="text-sm text-gray-400">All Markups ({markups.length})</span>
      </div>
      
      {sortedMarkups.map((markup) => (
        <div
          key={markup.id}
          className="group relative bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all cursor-pointer overflow-hidden"
        >
          <div 
            onClick={() => onMarkupClick(markup)}
            className="p-3"
          >
            <div className="flex items-start gap-3">
              {/* Thumbnail */}
              {markup.thumbnail && (
                <div className="relative flex-shrink-0">
                  <img
                    src={markup.thumbnail}
                    alt="Markup thumbnail"
                    className="w-20 h-14 object-cover rounded border border-gray-600"
                  />
                  {/* Timestamp badge on thumbnail */}
                  <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                    {formatTime(markup.timestamp)}
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-400 font-mono">
                      {formatTime(markup.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(markup.createdAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: markup.color }}
                  />
                  <span className="text-xs text-gray-400">
                    {markup.strokeWidth}px stroke
                  </span>
                </div>

                <div className="text-xs text-gray-500">
                  by {markup.author}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkupDelete(markup.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-600/20 rounded text-red-400 hover:text-red-300"
                title="Delete markup"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Active indicator */}
            {Math.abs(currentTime - markup.timestamp) < 0.5 && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};