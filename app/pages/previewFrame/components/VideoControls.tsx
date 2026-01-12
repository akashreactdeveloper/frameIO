'use client';

import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize2 } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  showControls: boolean;
  markups?: Array<{ id: string; timestamp: number; color: string }>;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onSkip: (seconds: number) => void;
  onMarkupClick?: (markup: any) => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  showControls,
  markups = [],
  onPlayPause,
  onMuteToggle,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onSkip,
  onMarkupClick,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="max-w-full space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime || 0}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer 
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
              }}
            />
            
            {/* Markup Indicators */}
            {markups.map((markup) => {
              const position = (markup.timestamp / duration) * 100;
              return (
                <div
                  key={markup.id}
                  className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full shadow-lg cursor-pointer hover:scale-150 transition-transform z-10"
                  style={{
                    left: `${position}%`,
                    backgroundColor: markup.color,
                    border: '2px solid white',
                  }}
                  title={`Markup at ${formatTime(markup.timestamp)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onMarkupClick) {
                      onMarkupClick(markup);
                    } else {
                      onSeek(markup.timestamp);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onPlayPause}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>

            <button
              onClick={() => onSkip(-10)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <SkipBack className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={() => onSkip(10)}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <SkipForward className="w-4 h-4 text-white" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-3 py-1 hover:bg-white/10 rounded transition-colors text-white text-sm font-medium"
              >
                {playbackSpeed}x
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full mb-2 left-0 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 py-1 min-w-[80px]">
                  {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        onSpeedChange(speed);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800 transition-colors ${
                        playbackSpeed === speed ? 'text-blue-400 bg-gray-800' : 'text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onMuteToggle}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 
                [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />

            <span className="text-white text-sm font-mono ml-2">
              {formatTime(currentTime)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-mono">
              {formatTime(duration)}
            </span>
            <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};