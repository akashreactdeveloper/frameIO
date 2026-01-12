'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { Sidebar } from './components/Sidebar';
import { MarkupCanvas } from './components/MarkupCanvas';
import { MarkupToolbar } from './components/MarkupToolbar';
import { useVideoControls } from './hooks/useVideoControls';
import { useMarkupTool } from './hooks/useMarkupTool';
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
    },
    {
      id: 'v3',
      name: 'final_football_analysis_v3.mp4',
      timestamp: 'Jan 06, 2025',
      author: 'Faiz Ali',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail: 'https://placehold.co/80x60/10b981/ffffff?text=v3'
    },
    {
      id: 'v4',
      name: 'final_football_analysis_v4.mp4',
      timestamp: 'Jan 05, 2025',
      author: 'Faiz Ali',
      type: 'video',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail: 'https://placehold.co/80x60/f59e0b/ffffff?text=v4'
    }
  ]);

  const [selectedVersion, setSelectedVersion] = useState<Version>(versions[0]);
  const [compareMode, setCompareMode] = useState(false);
  const [leftWindowVersion, setLeftWindowVersion] = useState<Version>(versions[0]);
  const [rightWindowVersion, setRightWindowVersion] = useState<Version>(versions[1]);
  const [activeTab, setActiveTab] = useState<'comments' | 'fields' | 'markups'>('comments');
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [leftVideoKey, setLeftVideoKey] = useState(0); // Key for left video
  const [rightVideoKey, setRightVideoKey] = useState(0); // Key for right video
  const [timestampInComment, setTimestampInComment] = useState(false);
  const [capturedTime, setCapturedTime] = useState(0); // Store the captured timestamp
  const [showMarkupCanvas, setShowMarkupCanvas] = useState(false); // Control canvas visibility
  const [displayedMarkup, setDisplayedMarkup] = useState<any>(null); // Store currently displayed markup

  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null); // Reference to video element

  // Initialize markup tool
  const {
    isMarkupMode,
    markups,
    drawingState,
    canvasRef,
    contextRef,
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    saveMarkup,
    clearCanvas,
    renderMarkup,
    renderMarkups,
    setColor,
    setStrokeWidth,
    toggleMarkupMode,
    deleteMarkup,
    getMarkupsAtTimestamp,
  } = useMarkupTool();

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

  // Reset timestamp state when video version changes
  useEffect(() => {
    setTimestampInComment(false);
    setCapturedTime(0);
    setDisplayedMarkup(null);
  }, [selectedVersion.id, leftWindowVersion.id, rightWindowVersion.id]);

  // Show canvas when entering markup mode, hide displayed markup
  useEffect(() => {
    if (isMarkupMode) {
      setShowMarkupCanvas(true);
      setDisplayedMarkup(null); // Hide thumbnail when drawing
    }
  }, [isMarkupMode]);

  // Clear displayed markup when video plays and moves away from markup time
  useEffect(() => {
    if (displayedMarkup && isPlaying) {
      const timeDiff = Math.abs(currentTime - displayedMarkup.timestamp);
      if (timeDiff > 3) { // Give 3 seconds buffer before hiding
        setDisplayedMarkup(null);
      }
    }
  }, [currentTime, isPlaying, displayedMarkup]);

  const handleVersionSelect = (version: Version) => {
    setSelectedVersion(version);
    setIsPlaying(false);
    setCurrentTime(0);
    setLeftVideoKey(prev => prev + 1); // Force video reload
  };

  const handleCompareModeToggle = () => {
    if (!compareMode) {
      // Entering compare mode - set left to current selected, right to next version
      setLeftWindowVersion(selectedVersion);
      const currentIndex = versions.findIndex(v => v.id === selectedVersion.id);
      const nextVersion = versions[(currentIndex + 1) % versions.length];
      setRightWindowVersion(nextVersion);
    }
    setCompareMode(!compareMode);
    setIsPlaying(false);
    setCurrentTime(0);
    setLeftVideoKey(prev => prev + 1); // Force left video reload
    setRightVideoKey(prev => prev + 1); // Force right video reload
  };

  const handleLeftVersionChange = (version: Version) => {
    setLeftWindowVersion(version);
    setIsPlaying(false);
    setCurrentTime(0);
    setLeftVideoKey(prev => prev + 1); // Force left video reload
    setRightVideoKey(prev => prev + 1); // Also reload right video to sync
  };

  const handleRightVersionChange = (version: Version) => {
    setRightWindowVersion(version);
    setIsPlaying(false);
    setCurrentTime(0);
    setLeftVideoKey(prev => prev + 1); // Also reload left video to sync
    setRightVideoKey(prev => prev + 1); // Force right video reload
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

  const handleCaptureTimestamp = () => {
    if (timestampInComment) {
      // Remove timestamp
      setTimestampInComment(false);
      setCapturedTime(0);
    } else {
      // Capture current time and freeze it
      setCapturedTime(currentTime);
      setTimestampInComment(true);
    }
  };

  // Markup handlers
  const handleMarkupButtonClick = () => {
    if (!isMarkupMode) {
      // Entering markup mode - pause video
      setIsPlaying(false);
      setCapturedTime(currentTime);
    }
    toggleMarkupMode();
  };

  const handleSaveMarkup = () => {
    const videoId = compareMode ? 
      `${leftWindowVersion.id}-${rightWindowVersion.id}` : 
      selectedVersion.id;
    
    const markup = saveMarkup(videoId, capturedTime, 'Faiz Ali', videoElementRef.current || undefined);
    
    if (markup) {
      toggleMarkupMode();
      setActiveTab('markups');
    }
  };

  const handleCancelMarkup = () => {
    clearCanvas();
    toggleMarkupMode();
    setShowMarkupCanvas(false);
  };

  const handleMarkupClick = (markup: any) => {
    // Seek to the markup timestamp
    setCurrentTime(markup.timestamp);
    
    // Store the markup to display its thumbnail
    setDisplayedMarkup(markup);
    setShowMarkupCanvas(false); // Hide canvas, we'll show thumbnail instead
    
    // Pause the video but keep controls visible
    setIsPlaying(false);
    
    // Force controls to show and stay visible
    handleMouseMove();
  };

  const handleMarkupDelete = (markupId: string) => {
    deleteMarkup(markupId);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <Header
        selectedVersion={selectedVersion}
        versions={versions}
        onVersionSelect={handleVersionSelect}
        onCompareModeToggle={handleCompareModeToggle}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col bg-black relative">
          <div ref={containerRef} className="flex-1 relative">
            <div ref={videoContainerRef} className="w-full h-full">
              <VideoPlayer
                leftVideoKey={leftVideoKey}
                rightVideoKey={rightVideoKey}
                selectedVersion={selectedVersion}
                versions={versions}
                compareMode={compareMode}
                leftWindowVersion={leftWindowVersion}
                rightWindowVersion={rightWindowVersion}
                isPlaying={isPlaying}
                isMuted={isMuted}
                currentTime={currentTime}
                duration={duration}
                volume={volume}
                playbackSpeed={playbackSpeed}
                showControls={showControls || displayedMarkup !== null}
                displayedMarkup={displayedMarkup}
                markups={markups}
                onExitCompare={() => setCompareMode(false)}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onMuteToggle={() => setIsMuted(!isMuted)}
                onSeek={setCurrentTime}
                onVolumeChange={handleVolumeChange}
                onSpeedChange={setPlaybackSpeed}
                onSkip={handleSkip}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onLeftVersionChange={handleLeftVersionChange}
                onRightVersionChange={handleRightVersionChange}
                onVideoRefReady={(ref) => { videoElementRef.current = ref; }}
                onMarkupClick={handleMarkupClick}
              />

              {/* Markup Canvas Overlay */}
              {videoContainerRef.current && (
                <MarkupCanvas
                  width={videoContainerRef.current.offsetWidth}
                  height={videoContainerRef.current.offsetHeight}
                  canvasRef={canvasRef}
                  isMarkupMode={isMarkupMode}
                  showCanvas={showMarkupCanvas}
                  onInitialize={initializeCanvas}
                  onStartDrawing={startDrawing}
                  onDraw={draw}
                  onStopDrawing={stopDrawing}
                />
              )}

              {/* Markup Toolbar */}
              <MarkupToolbar
                isMarkupMode={isMarkupMode}
                color={drawingState.color}
                strokeWidth={drawingState.strokeWidth}
                onColorChange={setColor}
                onStrokeWidthChange={setStrokeWidth}
                onSave={handleSaveMarkup}
                onCancel={handleCancelMarkup}
                onClear={clearCanvas}
              />

              {/* Markup Button (when not in markup mode) */}
              {!isMarkupMode && !compareMode && selectedVersion.type === 'video' && (
                <button
                  onClick={handleMarkupButtonClick}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 bg-purple-600/90 hover:bg-purple-600 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all shadow-lg ${
                    showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                  }`}
                  title="Add markup annotation"
                >
                  <Pencil className="w-4 h-4" />
                  Add Markup
                </button>
              )}
            </div>
          </div>
        </div>

        <Sidebar
          activeTab={activeTab}
          commentText={commentText}
          compareMode={compareMode}
          currentTime={capturedTime}
          timestampInComment={timestampInComment}
          markups={markups}
          onTabChange={setActiveTab}
          onCommentChange={setCommentText}
          onCaptureTimestamp={handleCaptureTimestamp}
          onMarkupClick={handleMarkupClick}
          onMarkupDelete={handleMarkupDelete}
        />
      </div>
    </div>
  );
};

export default PreviewFramePage;