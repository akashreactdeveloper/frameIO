'use client';

import React from 'react';
import { GripVertical, FolderOpen, Folder, Plus, X } from 'lucide-react';
import { FolderItem } from '../types';

interface FolderCardProps {
  folder: FolderItem;
  isDragging: boolean;
  isHovered: boolean;
  isEditing: boolean;
  onMouseDown: (e: React.MouseEvent, folderId: string) => void;
  onToggle: (folderId: string) => void;
  onStartEdit: (folderId: string) => void;
  onUpdateName: (folderId: string, name: string) => void;
  onStopEdit: () => void;
  onDelete: (folderId: string) => void;
  onAddChild: (parentId: string) => void;
  onOpenFiles: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isDragging,
  isHovered,
  isEditing,
  onMouseDown,
  onToggle,
  onStartEdit,
  onUpdateName,
  onStopEdit,
  onDelete,
  onAddChild,
  onOpenFiles,
}) => {
  return (
    <div
      data-folder-card
      className={`absolute transition-shadow ${
        isDragging 
          ? 'cursor-grabbing scale-105 z-50 shadow-2xl' 
          : 'cursor-move z-10'
      } ${
        isHovered 
          ? 'ring-4 ring-blue-500 ring-opacity-50' 
          : ''
      }`}
      style={{
        left: `${folder.x}px`,
        top: `${folder.y}px`,
        willChange: isDragging ? 'transform' : 'auto',
      }}
      onMouseDown={(e) => onMouseDown(e, folder.id)}
    >
      <div className="bg-slate-800 rounded-lg shadow-xl border-2 border-slate-600 p-3 min-w-[200px] hover:shadow-2xl hover:border-blue-500 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
          <button
            onClick={() => onToggle(folder.id)}
            className="hover:bg-slate-700 rounded p-1 transition-colors cursor-pointer"
          >
            {folder.isOpen ? (
              <FolderOpen className="w-5 h-5 text-blue-400" />
            ) : (
              <Folder className="w-5 h-5 text-blue-400" />
            )}
          </button>
          
          {isEditing ? (
            <input
              type="text"
              defaultValue={folder.name}
              autoFocus
              onBlur={(e) => {
                onUpdateName(folder.id, e.target.value || 'New Folder');
                onStopEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdateName(folder.id, (e.target as HTMLInputElement).value || 'New Folder');
                  onStopEdit();
                }
                if (e.key === 'Escape') {
                  onStopEdit();
                }
              }}
              className="flex-1 px-2 py-1 text-sm font-medium bg-slate-700 text-white border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(folder.id);
              }}
              className="flex-1 text-sm font-medium text-white cursor-pointer hover:text-blue-400 transition-colors"
            >
              {folder.name}
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(folder.id);
            }}
            className="p-1 hover:bg-red-900/50 rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>

        <div className="flex gap-1 pt-2 border-t border-slate-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(folder.id);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors border border-blue-500/30 cursor-pointer"
            title="Add child folder"
          >
            <Plus className="w-3 h-3" />
            Add Child
          </button>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
          {folder.children.length > 0 && (
            <div className="text-xs text-slate-400">
              {folder.children.length} child{folder.children.length !== 1 ? 'ren' : ''}
            </div>
          )}
          {folder.files.length > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFiles(folder.id);
              }}
              className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors text-left cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenFiles(folder.id);
              }}
              className="w-full text-xs text-slate-400 hover:text-blue-300 transition-colors text-left cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add files
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
