'use client';

import React from 'react';
import { Folder, Upload, X, Image, Video, File } from 'lucide-react';
import { FolderItem } from '../types';

interface FilesDialogProps {
  folder: FolderItem | null;
  onClose: () => void;
  onFileUpload: (folderId: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
}

export const FilesDialog: React.FC<FilesDialogProps> = ({
  folder,
  onClose,
  onFileUpload,
  onDeleteFile,
}) => {
  if (!folder) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600 w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Folder className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">
              {folder.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/50 cursor-pointer text-sm">
              <Upload className="w-4 h-4" />
              Upload
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => {
                  onFileUpload(folder.id, e);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {folder.files.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {folder.files.map(file => (
                <div
                  key={file.id}
                  className="bg-slate-900 rounded-lg overflow-hidden border border-slate-600 hover:border-blue-500 transition-all group"
                >
                  <div className="aspect-video bg-slate-950 flex items-center justify-center relative overflow-hidden">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={file.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                    <div className="absolute top-1 left-1 bg-slate-900/90 backdrop-blur-sm px-1.5 py-0.5 rounded flex items-center gap-1">
                      {file.type === 'image' ? (
                        <Image className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Video className="w-3 h-3 text-purple-400" />
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteFile(folder.id, file.id)}
                      className="absolute top-1 right-1 p-1 bg-red-900/90 hover:bg-red-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No files in this folder</p>
                <p className="text-slate-500 text-sm mt-2">Upload some files to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
