'use client';

import React from 'react';

export const InstructionsPanel: React.FC = () => {
  return (
    <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl p-4 max-w-sm border border-slate-700 z-50">
      <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
        How to use:
      </h3>
      <ul className="text-sm text-slate-300 space-y-2">
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Drag folders</strong> to reposition them</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Drop on another folder</strong> to attach as child</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Click name</strong> to rename</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Scroll wheel</strong> or use buttons to zoom</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Drag empty area</strong> to pan the canvas</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-blue-400 mt-0.5">•</span>
          <span><strong>Auto Layout</strong> organizes tree structure</span>
        </li>
      </ul>
    </div>
  );
};
