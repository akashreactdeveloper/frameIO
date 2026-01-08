'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Grid3x3 } from 'lucide-react';
import { Version } from '../types';

interface VersionDropdownProps {
  selectedVersion: Version;
  versions: Version[];
  onVersionSelect: (version: Version) => void;
  onCompareModeToggle: () => void;
}

export const VersionDropdown: React.FC<VersionDropdownProps> = ({
  selectedVersion,
  versions,
  onVersionSelect,
  onCompareModeToggle,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showVersionsSubmenu, setShowVersionsSubmenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setShowVersionsSubmenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, []);

  const handleVersionsMouseEnter = () => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setShowVersionsSubmenu(true);
  };

  const handleVersionsMouseLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setShowVersionsSubmenu(false);
    }, 300);
  };

  const handleVersionSelect = (version: Version) => {
    onVersionSelect(version);
    setShowDropdown(false);
    setShowVersionsSubmenu(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-800 rounded transition-colors"
      >
        <span className="text-white text-sm font-medium">{selectedVersion.name}</span>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors">
          {selectedVersion.id}
          <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-[#2a2a2a] rounded-lg shadow-2xl border border-gray-700 overflow-visible z-[70]">
          <div
            onMouseEnter={handleVersionsMouseEnter}
            onMouseLeave={handleVersionsMouseLeave}
            className="relative"
          >
            <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <span className="text-white text-sm font-medium">Versions</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
            </button>

            {showVersionsSubmenu && (
              <div 
                className="absolute left-full top-0 ml-2 w-80 bg-[#2a2a2a] rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-[80]"
                onMouseEnter={handleVersionsMouseEnter}
                onMouseLeave={handleVersionsMouseLeave}
              >
                <div className="px-4 py-3 border-b border-gray-700">
                  <h3 className="text-white text-sm font-medium">All Versions</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      onClick={() => handleVersionSelect(version)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left ${
                        selectedVersion.id === version.id ? 'bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center min-w-[2rem] h-8 bg-blue-600/20 rounded text-blue-400 text-xs font-medium px-2">
                        {version.id}
                      </div>
                      <img 
                        src={version.thumbnail} 
                        alt={version.name}
                        className="w-16 h-12 object-cover rounded border border-gray-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm font-medium truncate">
                          {version.name}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {version.author} · {version.timestamp}
                        </div>
                      </div>
                      {selectedVersion.id === version.id && (
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onCompareModeToggle();
              setShowDropdown(false);
              setShowVersionsSubmenu(false);
            }}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                <Grid3x3 className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white text-sm font-medium">Compare versions</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
