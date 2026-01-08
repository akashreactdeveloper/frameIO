'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FolderPlus, Plus, Maximize2 } from 'lucide-react';
import { FolderItem, Position } from './types';
import { FolderCard } from './components/FolderCard';
import { FilesDialog } from './components/FilesDialog';
import { CanvasControls } from './components/CanvasControls';
import { InstructionsPanel } from './components/InstructionsPanel';

const FolderTreePage = () => {
  const [folders, setFolders] = useState<FolderItem[]>([
    {
      id: '1',
      name: 'Root Folder',
      x: 2000,
      y: 100,
      isOpen: true,
      parentId: null,
      children: ['2', '3'],
      files: []
    },
    {
      id: '2',
      name: 'Documents',
      x: 1700,
      y: 300,
      isOpen: false,
      parentId: '1',
      children: [],
      files: [
        { id: 'f1', name: 'Report.pdf', type: 'image', url: 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Report.pdf' },
        { id: 'f2', name: 'Presentation.pptx', type: 'video', url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Presentation' }
      ]
    },
    {
      id: '3',
      name: 'Projects',
      x: 2300,
      y: 300,
      isOpen: true,
      parentId: '1',
      children: ['4'],
      files: [
        { id: 'f3', name: 'Design.png', type: 'image', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Design.png' }
      ]
    },
    {
      id: '4',
      name: 'Web Dev',
      x: 2300,
      y: 500,
      isOpen: false,
      parentId: '3',
      children: [],
      files: []
    }
  ]);

  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [showFilesDialog, setShowFilesDialog] = useState<boolean>(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const findFolder = (id: string): FolderItem | undefined => folders.find(f => f.id === id);

  const layoutTree = useCallback(() => {
    const rootFolders = folders.filter(f => !f.parentId);
    const newFolders = [...folders];
    const levelHeight = 250;
    const horizontalSpacing = 280;

    const getSubtreeWidth = (folderId: string): number => {
      const folder = newFolders.find(f => f.id === folderId);
      if (!folder) return 1;

      const children = newFolders.filter(f => f.parentId === folderId);
      if (children.length === 0) return 1;

      return children.reduce((sum, child) => sum + getSubtreeWidth(child.id), 0);
    };

    const calculateLayout = (folderId: string, level: number, leftBound: number): number => {
      const folder = newFolders.find(f => f.id === folderId);
      if (!folder) return leftBound;

      const children = newFolders.filter(f => f.parentId === folderId);
      
      if (children.length === 0) {
        folder.x = leftBound;
        folder.y = 100 + level * levelHeight;
        return leftBound + horizontalSpacing;
      }

      let currentX = leftBound;
      const childPositions: number[] = [];
      
      children.forEach((child) => {
        const childFolder = newFolders.find(f => f.id === child.id);
        currentX = calculateLayout(child.id, level + 1, currentX);
        if (childFolder) {
          childPositions.push(childFolder.x);
        }
      });

      const leftmostChild = Math.min(...childPositions);
      const rightmostChild = Math.max(...childPositions);
      folder.x = (leftmostChild + rightmostChild) / 2;
      folder.y = 100 + level * levelHeight;

      return currentX;
    };

    let currentX = 1500;
    rootFolders.forEach((root) => {
      currentX = calculateLayout(root.id, 0, currentX);
      currentX += horizontalSpacing;
    });

    setFolders(newFolders);
  }, [folders]);

  const handleMouseDown = (e: React.MouseEvent, folderId: string) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return;
    if (e.button === 1 || e.button === 2) return;
    
    const folder = findFolder(folderId);
    if (!folder) return;
    
    setIsPanning(false);
    
    setDraggedFolder(folderId);
    setDragStart({
      x: e.clientX - folder.x * scale - pan.x,
      y: e.clientY - folder.y * scale - pan.y
    });
    e.stopPropagation();
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-folder-card]')) {
      return;
    }
    
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedFolder) {
      const newX = (e.clientX - pan.x - dragStart.x) / scale;
      const newY = (e.clientY - pan.y - dragStart.y) / scale;

      setFolders(prev => prev.map(folder =>
        folder.id === draggedFolder
          ? { ...folder, x: newX, y: newY }
          : folder
      ));
      
      const mouseX = (e.clientX - pan.x) / scale;
      const mouseY = (e.clientY - pan.y) / scale;
      
      const targetFolder = folders.find(folder => {
        if (folder.id === draggedFolder) return false;
        
        const folderLeft = folder.x;
        const folderTop = folder.y;
        const folderRight = folder.x + 200;
        const folderBottom = folder.y + 100;
        
        return mouseX >= folderLeft && mouseX <= folderRight &&
               mouseY >= folderTop && mouseY <= folderBottom;
      });
      
      setHoveredFolder(targetFolder ? targetFolder.id : null);
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [draggedFolder, dragStart, scale, pan, isPanning, panStart, folders]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedFolder) {
      const draggedFolderObj = findFolder(draggedFolder);
      if (draggedFolderObj) {
        const mouseX = (e.clientX - pan.x) / scale;
        const mouseY = (e.clientY - pan.y) / scale;
        
        const targetFolder = folders.find(folder => {
          if (folder.id === draggedFolder) return false;
          
          const folderLeft = folder.x;
          const folderTop = folder.y;
          const folderRight = folder.x + 200;
          const folderBottom = folder.y + 100;
          
          return mouseX >= folderLeft && mouseX <= folderRight &&
                 mouseY >= folderTop && mouseY <= folderBottom;
        });
        
        if (targetFolder) {
          attachFolder(draggedFolder, targetFolder.id);
        }
      }
    }
    
    setDraggedFolder(null);
    setHoveredFolder(null);
  }, [draggedFolder, isPanning, folders, scale, pan]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const worldX = (mouseX - pan.x) / scale;
    const worldY = (mouseY - pan.y) / scale;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(2, scale + delta));
    
    const newPanX = mouseX - worldX * newScale;
    const newPanY = mouseY - worldY * newScale;
    
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  }, [scale, pan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e);
    };

    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  const attachFolder = (childId: string, parentId: string) => {
    setFolders(prev => {
      const newFolders = [...prev];
      const parent = newFolders.find(f => f.id === parentId);
      const child = newFolders.find(f => f.id === childId);

      if (!parent || !child || parent.id === child.id) return prev;

      let current: FolderItem | undefined = parent;
      while (current) {
        if (current.id === childId) return prev;
        current = newFolders.find(f => f.id === current?.parentId);
      }

      const oldParent = newFolders.find(f => f.id === child.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== childId);
      }

      child.parentId = parentId;
      if (!parent.children.includes(childId)) {
        parent.children.push(childId);
      }

      return newFolders;
    });
  };

  const addFolder = (parentId: string | null = null) => {
    const newId = Date.now().toString();
    let newX: number;
    let newY: number;

    if (parentId) {
      const parent = findFolder(parentId);
      if (parent) {
        newX = parent.x;
        newY = parent.y + 200;
      } else {
        newX = 2000;
        newY = 100;
      }
    } else {
      newX = 2000;
      newY = 100;
    }

    const newFolder: FolderItem = {
      id: newId,
      name: 'New Folder',
      x: newX,
      y: newY,
      isOpen: false,
      parentId: parentId,
      children: [],
      files: []
    };

    setFolders(prev => {
      const updated = [...prev, newFolder];
      
      if (parentId) {
        const parent = updated.find(f => f.id === parentId);
        if (parent && !parent.children.includes(newId)) {
          parent.children.push(newId);
        }
      }
      
      return updated;
    });

    setEditingFolder(newId);
  };

  const openFilesDialog = (folderId: string) => {
    setSelectedFolder(folderId);
    setShowFilesDialog(true);
  };

  const closeFilesDialog = () => {
    setShowFilesDialog(false);
    setSelectedFolder(null);
  };

  const handleFileUpload = (folderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
          url: e.target?.result as string
        };

        setFolders(prev => prev.map(folder =>
          folder.id === folderId
            ? { ...folder, files: [...folder.files, newFile] }
            : folder
        ));
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteFile = (folderId: string, fileId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, files: folder.files.filter(f => f.id !== fileId) }
        : folder
    ));
  };

  const deleteFolder = (folderId: string) => {
    setFolders(prev => {
      const folder = prev.find(f => f.id === folderId);
      if (!folder) return prev;

      const getAllDescendants = (id: string) => {
        const folder = prev.find(f => f.id === id);
        if (!folder) return [];
        
        let descendants = [id];
        folder.children.forEach(childId => {
          descendants = [...descendants, ...getAllDescendants(childId)];
        });
        return descendants;
      };

      const toDelete = getAllDescendants(folderId);
      const newFolders = prev.filter(f => !toDelete.includes(f.id));
      
      if (folder.parentId) {
        const parent = newFolders.find(f => f.id === folder.parentId);
        if (parent) {
          parent.children = parent.children.filter(id => id !== folderId);
        }
      }

      return newFolders;
    });
  };

  const toggleFolder = (folderId: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, isOpen: !folder.isOpen }
        : folder
    ));
  };

  const updateFolderName = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, name: newName }
        : folder
    ));
  };

  const handleZoom = (delta: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const worldX = (centerX - pan.x) / scale;
    const worldY = (centerY - pan.y) / scale;
    
    const newScale = Math.max(0.1, Math.min(2, scale + delta));
    
    const newPanX = centerX - worldX * newScale;
    const newPanY = centerY - worldY * newScale;
    
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const drawConnections = () => {
    return folders
      .filter(folder => folder.parentId)
      .map(folder => {
        const parent = findFolder(folder.parentId!);
        if (!parent) return null;

        const startX = parent.x + 100;
        const startY = parent.y + 40;
        const endX = folder.x + 100;
        const endY = folder.y;
        
        const midY = (startY + endY) / 2;

        return (
          <path
            key={`${parent.id}-${folder.id}`}
            d={`M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            opacity="0.6"
            style={{ pointerEvents: 'none' }}
          />
        );
      });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
      onMouseDown={handleCanvasMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm shadow-lg border-b border-slate-700 p-4 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <FolderPlus className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Folder Tree Manager</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => layoutTree()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              Auto Layout
            </button>
            <button
              onClick={() => addFolder(null)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Root Folder
            </button>
          </div>
        </div>
      </div>

      <CanvasControls
        scale={scale}
        onZoomIn={() => handleZoom(0.1)}
        onZoomOut={() => handleZoom(-0.1)}
        onReset={resetView}
      />

      <div 
        className="canvas-area relative w-full h-full pt-20"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: draggedFolder || isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <svg
          ref={canvasRef}
          className="absolute pointer-events-none"
          style={{ 
            left: 0,
            top: 0,
            width: '5000px',
            height: '5000px',
            zIndex: 0 
          }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" opacity="0.6" />
            </marker>
          </defs>
          {drawConnections()}
        </svg>

        {folders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            isDragging={draggedFolder === folder.id}
            isHovered={hoveredFolder === folder.id && draggedFolder !== null && draggedFolder !== folder.id}
            isEditing={editingFolder === folder.id}
            onMouseDown={handleMouseDown}
            onToggle={toggleFolder}
            onStartEdit={setEditingFolder}
            onUpdateName={updateFolderName}
            onStopEdit={() => setEditingFolder(null)}
            onDelete={deleteFolder}
            onAddChild={addFolder}
            onOpenFiles={openFilesDialog}
          />
        ))}
      </div>

      <InstructionsPanel />

      {showFilesDialog && selectedFolder && (
        <FilesDialog
          folder={findFolder(selectedFolder) || null}
          onClose={closeFilesDialog}
          onFileUpload={handleFileUpload}
          onDeleteFile={deleteFile}
        />
      )}

      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
    </div>
  );
};

export default FolderTreePage;