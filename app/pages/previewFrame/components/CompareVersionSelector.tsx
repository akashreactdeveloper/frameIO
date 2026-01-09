'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Version } from '../types';

interface CompareVersionSelectorProps {
  selectedVersion: Version;
  versions: Version[];
  onVersionSelect: (version: Version) => void;
  label: string;
  accentColor: string;
}

export const CompareVersionSelector: React.FC<CompareVersionSelectorProps> = ({
  selectedVersion,
  versions,
  onVersionSelect,
  label,
  accentColor,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVersionSelect = (version: Version) => {
    onVersionSelect(version);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-4 py-2 bg-${accentColor}-600/90 hover:bg-${accentColor}-600 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all shadow-lg`}
        style={{
          backgroundColor: accentColor === 'blue' ? 'rgba(37, 99, 235, 0.9)' : 'rgba(147, 51, 234, 0.9)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = accentColor === 'blue' ? 'rgb(37, 99, 235)' : 'rgb(147, 51, 234)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = accentColor === 'blue' ? 'rgba(37, 99, 235, 0.9)' : 'rgba(147, 51, 234, 0.9)';
        }}
      >
        <span>{label}: {selectedVersion.id}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-[#2a2a2a] rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-white text-sm font-medium">Select Version for {label}</h3>
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
                <div 
                  className={`flex items-center justify-center min-w-[2rem] h-8 rounded text-xs font-medium px-2`}
                  style={{
                    backgroundColor: accentColor === 'blue' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(147, 51, 234, 0.2)',
                    color: accentColor === 'blue' ? 'rgb(96, 165, 250)' : 'rgb(192, 132, 252)',
                  }}
                >
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
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                    style={{ color: accentColor === 'blue' ? 'rgb(59, 130, 246)' : 'rgb(168, 85, 247)' }}
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};