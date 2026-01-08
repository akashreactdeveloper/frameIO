import { useState, useRef, useEffect } from 'react';

export const useVideoControls = (isPlaying: boolean) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showControls, setShowControls] = useState(true);
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
    
    cursorTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return {
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
  };
};
