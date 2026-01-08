'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { useVideoControls } from './hooks/useVideoControls';
import { Version } from './types';

const PreviewFramePage = () => {
  const [versions] = useState<Version[]>([
    {
      id: 'v2',
      name: 'final_football_analysis_v2 (1).mp4',
      timestamp: 'Jan 07, 2025',
      author: 'Faiz Ali',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail: 'https://placehold.co/80x60/3b82f6/ffffff?text=v2'
    },
    {
      id: 'v1',
      name: 'final_football_analysis_v7.si...',
      timestamp: 'Jan 07, 2025',
      author: 'Faiz Ali',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail: 'https://placehold.co/80x60/8b5cf6/ffffff?text=v1'
    }
  ]);

  const [selectedVersion, setSelectedVersion] = useState<Version>(versions[0]);
  const [compareMode, setCompareMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'fields'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    currentTime,
    duration,
    volume,
    isMuted,
    playbackSpeed,
    showControls,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setPlaybackSpeed,
    handleMouseMove,
    cursorTimeoutRef,
  } = useVideoControls(isPlaying);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseMove);
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseMove);
        if (cursorTimeoutRef.current) {
          clearTimeout(cursorTimeoutRef.current);
        }
      };
    }
  }, [isPlaying, handleMouseMove, cursorTimeoutRef]);

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    setIsPlaying(false);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleLoadedMetadata = (dur: number) => {
    setDuration(dur);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Header
        selectedVersion={selectedVersion}
        versions={versions}
        onVersionSelect={handleVersionSelect}
        onCompareModeToggle={() => setCompareMode(!compareMode)}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-black relative">
          <div ref={containerRef} className="flex-1 relative">
            <VideoPlayer
              selectedVersion={selectedVersion}
              versions={versions}
              compareMode={compareMode}
              isPlaying={isPlaying}
              isMuted={isMuted}
              currentTime={currentTime}
              duration={duration}
              volume={volume}
              playbackSpeed={playbackSpeed}
              showControls={showControls}
              onExitCompare={() => setCompareMode(false)}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onMuteToggle={() => setIsMuted(!isMuted)}
              onSeek={setCurrentTime}
              onVolumeChange={handleVolumeChange}
              onSpeedChange={setPlaybackSpeed}
              onSkip={handleSkip}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>
        </div>

        <Sidebar
          activeTab={activeTab}
          commentText={commentText}
          onTabChange={setActiveTab}
          onCommentChange={setCommentText}
        />
      </div>
    </div>
  );
};

export default PreviewFramePage;