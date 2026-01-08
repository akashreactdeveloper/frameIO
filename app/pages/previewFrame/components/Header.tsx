'use client';

import React from 'react';
import { ChevronLeft, Settings, Download, MoreVertical } from 'lucide-react';
import { VersionDropdown } from './VersionDropdown';
import { Version } from '../types';

interface HeaderProps {
  selectedVersion: Version;
  onVersionSelect: (version: Version) => void;
  onCompareModeToggle: () => void;
  versions: Version[];
}

export const Header: React.FC<HeaderProps> = ({
  selectedVersion,
  onVersionSelect,
  onCompareModeToggle,
  versions,
}) => {
  return (
    <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-3 flex items-center justify-between relative z-50">
      <div className="flex items-center gap-3">
        <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </button>
        
        <button className="p-1.5 hover:bg-gray-800 rounded transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-2 ml-2">
          <span className="text-gray-400 text-sm">final_football_analysis_v2 (1)</span>
          <span className="text-gray-600">/</span>
          <VersionDropdown
            selectedVersion={selectedVersion}
            versions={versions}
            onVersionSelect={onVersionSelect}
            onCompareModeToggle={onCompareModeToggle}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Download
        </button>
        <button className="p-2 hover:bg-gray-800 rounded transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
};
