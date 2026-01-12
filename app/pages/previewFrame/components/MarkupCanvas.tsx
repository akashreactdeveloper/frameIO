'use client';

import React, { useEffect, useRef } from 'react';

interface MarkupCanvasProps {
  width: number;
  height: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isMarkupMode: boolean;
  showCanvas: boolean; // New prop to control visibility
  onInitialize: (canvas: HTMLCanvasElement, width: number, height: number) => void;
  onStartDrawing: (x: number, y: number) => void;
  onDraw: (x: number, y: number) => void;
  onStopDrawing: () => void;
}

export const MarkupCanvas: React.FC<MarkupCanvasProps> = ({
  width,
  height,
  canvasRef,
  isMarkupMode,
  showCanvas,
  onInitialize,
  onStartDrawing,
  onDraw,
  onStopDrawing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize canvas on mount or size change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && width && height) {
      onInitialize(canvas, width, height);
    }
  }, [width, height, canvasRef, onInitialize]);

  // Get coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMarkupMode) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    onStartDrawing(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMarkupMode) return;
    const { x, y } = getCoordinates(e);
    onDraw(x, y);
  };

  const handleMouseUp = () => {
    if (!isMarkupMode) return;
    onStopDrawing();
  };

  const handleMouseLeave = () => {
    if (!isMarkupMode) return;
    onStopDrawing();
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMarkupMode) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    onStartDrawing(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMarkupMode) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    onDraw(x, y);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMarkupMode) return;
    e.preventDefault();
    onStopDrawing();
  };

  if (!showCanvas) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-30 pointer-events-none"
      style={{ 
        cursor: isMarkupMode ? 'crosshair' : 'default',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundColor: isMarkupMode ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
          pointerEvents: isMarkupMode ? 'auto' : 'none',
        }}
      />
    </div>
  );
};