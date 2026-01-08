'use client';

import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Version } from '../types';
import { VideoControls } from './VideoControls';

interface VideoPlayerProps {
  selectedVersion: Version;
  versions: Version[];
  compareMode: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackSpeed: number;
  showControls: boolean;
  onExitCompare: () => void;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSpeedChange: (speed: number) => void;
  onSkip: (seconds: number) => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  selectedVersion,
  versions,
  compareMode,
  isPlaying,
  isMuted,
  currentTime,
  duration,
  volume,
  playbackSpeed,
  showControls,
  onExitCompare,
  onPlayPause,
  onMuteToggle,
  onSeek,
  onVolumeChange,
  onSpeedChange,
  onSkip,
  onTimeUpdate,
  onLoadedMetadata,
}) => {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    if (isPlaying) {
      videoRef1.current?.play();
      videoRef2.current?.play();
    } else {
      videoRef1.current?.pause();
      videoRef2.current?.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef1.current) {
      onTimeUpdate(videoRef1.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef1.current) {
      onLoadedMetadata(videoRef1.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    onSeek(time);
    if (videoRef1.current) videoRef1.current.currentTime = time;
    if (videoRef2.current) videoRef2.current.currentTime = time;
  };

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
            <div className={`absolute top-4 left-4 z-10 px-3 py-2 bg-blue-600/90 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              v2
            </div>
            <video
              ref={videoRef1}
              src={versions[0].url}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>
          <div className="flex-1 relative">
            <div className={`absolute top-4 left-4 z-10 px-3 py-2 bg-purple-600/90 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}>
              v1
            </div>
            <video
              ref={videoRef2}
              src={versions[1].url}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {selectedVersion.type === 'video' ? (
            <video
              ref={videoRef1}
              src={selectedVersion.url}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
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
          showControls={showControls}
          onPlayPause={onPlayPause}
          onMuteToggle={onMuteToggle}
          onSeek={handleSeek}
          onVolumeChange={onVolumeChange}
          onSpeedChange={onSpeedChange}
          onSkip={onSkip}
        />
      )}
    </>
  );
};
