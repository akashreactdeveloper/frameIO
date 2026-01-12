'use client';

import React, { useState } from 'react';
import { Pencil, Save, X, Trash2, Palette } from 'lucide-react';

interface MarkupToolbarProps {
  isMarkupMode: boolean;
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onClear: () => void;
}

const PRESET_COLORS = [
  '#ff0000', // Red
  '#00ff00', // Green
  '#0000ff', // Blue
  '#ffff00', // Yellow
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
  '#ffffff', // White
  '#000000', // Black
  '#ff8800', // Orange
  '#8800ff', // Purple
];

const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12];

export const MarkupToolbar: React.FC<MarkupToolbarProps> = ({
  isMarkupMode,
  color,
  strokeWidth,
  onColorChange,
  onStrokeWidthChange,
  onSave,
  onCancel,
  onClear,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);

  if (!isMarkupMode) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-3">
      <div className="flex items-center gap-3">
        {/* Drawing Icon */}
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30">
          <Pencil className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm font-medium">Drawing Mode</span>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowStrokePicker(false);
            }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Choose color"
          >
            <div 
              className="w-6 h-6 rounded border-2 border-gray-600"
              style={{ backgroundColor: color }}
            />
            <Palette className="w-4 h-4 text-gray-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-2 left-0 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-3 min-w-[200px]">
              <div className="text-white text-xs font-medium mb-2">Select Color</div>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => {
                      onColorChange(presetColor);
                      setShowColorPicker(false);
                    }}
                    className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                      color === presetColor ? 'border-white ring-2 ring-blue-500' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stroke Width Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStrokePicker(!showStrokePicker);
              setShowColorPicker(false);
            }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Stroke width"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <div 
                className="rounded-full bg-white"
                style={{ width: `${strokeWidth * 2}px`, height: `${strokeWidth * 2}px` }}
              />
            </div>
            <span className="text-white text-sm">{strokeWidth}px</span>
          </button>

          {showStrokePicker && (
            <div className="absolute top-full mt-2 left-0 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-3 min-w-[150px]">
              <div className="text-white text-xs font-medium mb-2">Stroke Width</div>
              <div className="space-y-2">
                {STROKE_WIDTHS.map((width) => (
                  <button
                    key={width}
                    onClick={() => {
                      onStrokeWidthChange(width);
                      setShowStrokePicker(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded transition-colors ${
                      strokeWidth === width ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8">
                      <div 
                        className="rounded-full bg-white"
                        style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                      />
                    </div>
                    <span className="text-white text-sm">{width}px</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Clear Button */}
        <button
          onClick={onClear}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Clear drawing"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-700" />

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 text-gray-300 rounded-lg transition-colors text-sm font-medium"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>

        {/* Save Button */}
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Save Markup
        </button>
      </div>
    </div>
  );
};