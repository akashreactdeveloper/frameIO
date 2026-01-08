'use client';

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface CanvasControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  scale,
  onZoomIn,
  onZoomOut,
  onReset,
}) => {
  return (
    <div className="absolute top-24 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700 p-2 z-50 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
      <div className="text-xs text-center text-slate-300 py-1">
        {Math.round(scale * 100)}%
      </div>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5" />
      </button>
      <div className="border-t border-slate-700 my-1"></div>
      <button
        onClick={onReset}
        className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
        title="Reset View"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
};
