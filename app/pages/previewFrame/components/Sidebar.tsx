'use client';

import React from 'react';
import { MessageSquare, Search, Plus, MoreVertical, Send, Clock } from 'lucide-react';

interface SidebarProps {
  activeTab: 'comments' | 'fields';
  commentText: string;
  compareMode: boolean;
  currentTime: number; // This will be the captured/frozen time
  timestampInComment: boolean;
  onTabChange: (tab: 'comments' | 'fields') => void;
  onCommentChange: (text: string) => void;
  onCaptureTimestamp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  commentText,
  compareMode,
  currentTime,
  timestampInComment,
  onTabChange,
  onCommentChange,
  onCaptureTimestamp,
}) => {
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-96 bg-[#1a1a1a] border-l border-gray-800 flex flex-col">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTabChange('comments')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'comments'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Comments
          </button>
          <button
            onClick={() => onTabChange('fields')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'fields'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Fields
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'comments' ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 text-sm mb-4">No comments - yet</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-400">All comments</div>
          </div>
        )}
      </div>

      {/* Comment Input */}
      {activeTab === 'comments' && (
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              {timestampInComment && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-mono pointer-events-none">
                  {formatTime(currentTime)}
                </div>
              )}
              <input
                type="text"
                placeholder="Leave your comment..."
                value={commentText}
                onChange={(e) => onCommentChange(e.target.value)}
                className={`w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  timestampInComment ? 'pl-24' : ''
                }`}
              />
            </div>
            <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {!compareMode && (
              <button
                onClick={onCaptureTimestamp}
                className={`p-1.5 rounded transition-colors ${
                  timestampInComment 
                    ? 'bg-yellow-600/20 text-yellow-400' 
                    : 'hover:bg-gray-800 text-gray-400'
                }`}
                title={timestampInComment ? "Remove timestamp" : "Add timestamp"}
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
            <button className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400">
              <span className="text-xl">😊</span>
            </button>
            <button className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400">
              <span className="text-xl">👍</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};