'use client';

import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Version } from '../types';
import { VideoControls } from './VideoControls';
import { CompareVersionSelector } from './CompareVersionSelector';

interface VideoPlayerProps {
  leftVideoKey: number;
  rightVideoKey: number;
  selectedVersion: Version;
  versions: Version[];
  compareMode: boolean;
  leftWindowVersion: Version;
  rightWindowVersion: Version;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  showControls: boolean;
  displayedMarkup: any | null;
  markups: Array<{ id: string; timestamp: number; color: string }>;
  onExitCompare: () => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onSkip: (seconds: number) => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onLeftVersionChange: (version: Version) => void;
  onRightVersionChange: (version: Version) => void;
  onVideoRefReady: (ref: HTMLVideoElement | null) => void;
  onMarkupClick: (markup: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  leftVideoKey,
  rightVideoKey,
  selectedVersion,
  versions,
  compareMode,
  leftWindowVersion,
  rightWindowVersion,
  isPlaying,
  isMuted,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  showControls,
  displayedMarkup,
  markups,
  onExitCompare,
  onPlayPause,
  onMuteToggle,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onSkip,
  onTimeUpdate,
  onLoadedMetadata,
  onLeftVersionChange,
  onRightVersionChange,
  onVideoRefReady,
  onMarkupClick,
}) => {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  // Notify parent component of video ref
  useEffect(() => {
    if (videoRef1.current) {
      onVideoRefReady(videoRef1.current);
    }
    return () => {
      onVideoRefReady(null);
    };
  }, [onVideoRefReady, selectedVersion.url, leftWindowVersion.url]);

  // Initialize duration when video element is ready
  useEffect(() => {
    const video = videoRef1.current;
    if (video) {
      const initDuration = () => {
        if (video.duration && !isNaN(video.duration)) {
          onLoadedMetadata(video.duration);
        }
      };
      
      // Try to get duration immediately if already loaded
      initDuration();
      
      // Also listen for loadedmetadata event
      video.addEventListener('loadedmetadata', initDuration);
      video.addEventListener('durationchange', initDuration);
      
      return () => {
        video.removeEventListener('loadedmetadata', initDuration);
        video.removeEventListener('durationchange', initDuration);
      };
    }
  }, [selectedVersion.url, leftWindowVersion.url, onLoadedMetadata]);

  // Sync volume, mute, and playback speed
  useEffect(() => {
    if (videoRef1.current) {
      videoRef1.current.volume = volume;
      videoRef1.current.muted = isMuted;
      videoRef1.current.playbackRate = playbackSpeed;
    }
    if (videoRef2.current) {
      videoRef2.current.volume = volume;
      videoRef2.current.muted = isMuted;
      videoRef2.current.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed]);

  // Sync play/pause state
  useEffect(() => {
    if (isPlaying) {
      videoRef1.current?.play().catch(() => {});
      videoRef2.current?.play().catch(() => {});
    } else {
      videoRef1.current?.pause();
      videoRef2.current?.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef1.current && !isNaN(videoRef1.current.currentTime)) {
      onTimeUpdate(videoRef1.current.currentTime);
      
      // Sync second video to first video in compare mode
      if (compareMode && videoRef2.current) {
        const timeDiff = Math.abs(videoRef2.current.currentTime - videoRef1.current.currentTime);
        if (timeDiff > 0.3) {
          videoRef2.current.currentTime = videoRef1.current.currentTime;
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef1.current) {
      onLoadedMetadata(videoRef1.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    onSeek(time);
    if (videoRef1.current) {
      videoRef1.current.currentTime = time;
    }
    if (videoRef2.current && compareMode) {
      videoRef2.current.currentTime = time;
    }
  };

  // Pause and seek when markup is displayed
  useEffect(() => {
    if (displayedMarkup) {
      // Pause the video
      if (videoRef1.current) {
        videoRef1.current.pause();
      }
      if (videoRef2.current) {
        videoRef2.current.pause();
      }
      
      // Seek to markup timestamp
      if (displayedMarkup.timestamp !== undefined) {
        handleSeek(displayedMarkup.timestamp);
      }
    }
  }, [displayedMarkup]);

  return (
    <>
      {compareMode ? (
        <div className="flex h-full w-full">
          <button
            onClick={onExitCompare}
            className="absolute top-4 right-4 z-20 p-2 bg-gray-900/90 hover:bg-gray-800 rounded-lg transition-colors backdrop-blur-sm border border-gray-700"
            title="Exit compare mode"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 relative border-r-2 border-gray-800">
            <div className={`absolute top-4 left-4 z-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <CompareVersionSelector
                selectedVersion={leftWindowVersion}
                versions={versions}
                onVersionSelect={onLeftVersionChange}
                label="Left"
                accentColor="blue"
              />
            </div>
            <video
              key={leftVideoKey}
              ref={videoRef1}
              src={leftWindowVersion.url}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleLoadedMetadata}
              crossOrigin="anonymous"
            />
          </div>
          <div className="flex-1 relative">
            <div className={`absolute top-4 left-4 z-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              <CompareVersionSelector
                selectedVersion={rightWindowVersion}
                versions={versions}
                onVersionSelect={onRightVersionChange}
                label="Right"
                accentColor="purple"
              />
            </div>
            <video
              key={rightVideoKey}
              ref={videoRef2}
              src={rightWindowVersion.url}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center relative">
          {selectedVersion.type === 'video' ? (
            <>
              <video
                key={leftVideoKey}
                ref={videoRef1}
                src={selectedVersion.url}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleLoadedMetadata}
                crossOrigin="anonymous"
              />
              
              {/* Markup Thumbnail Overlay */}
              {displayedMarkup && displayedMarkup.thumbnail && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <img
                    src={displayedMarkup.thumbnail}
                    alt="Markup preview"
                    className="w-full h-full object-contain opacity-90"
                  />
                  <div className="absolute top-4 left-4 bg-purple-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg">
                    Markup Preview
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={selectedVersion.url}
              alt={selectedVersion.name}
              className="w-full h-full object-contain"
            />
          )}
        </div>
      )}

      {selectedVersion.type === 'video' && (
        <VideoControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          playbackSpeed={playbackSpeed}
          showControls={showControls || displayedMarkup !== null}
          markups={markups}
          onPlayPause={onPlayPause}
          onMuteToggle={onMuteToggle}
          onSeek={handleSeek}
          onVolumeChange={onVolumeChange}
          onSpeedChange={onSpeedChange}
          onSkip={onSkip}
          onMarkupClick={onMarkupClick}
        />
      )}
    </>
  );
};