'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FolderPlus, Folder, FolderOpen, Plus, X, GripVertical, ZoomIn, ZoomOut, Maximize2, File, Upload, Image, Video } from 'lucide-react';

const FolderTreePage = () => {
  const [folders, setFolders] = useState([
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

  const [draggedFolder, setDraggedFolder] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredFolder, setHoveredFolder] = useState(null);
  const [editingFolder, setEditingFolder] = useState(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const findFolder = (id) => folders.find(f => f.id === id);

  const layoutTree = useCallback(() => {
    const rootFolders = folders.filter(f => !f.parentId);
    const newFolders = [...folders];
    const levelHeight = 250;
    const horizontalSpacing = 280;

    // Calculate the width (number of leaf nodes) each subtree needs
    const getSubtreeWidth = (folderId) => {
      const folder = newFolders.find(f => f.id === folderId);
      if (!folder) return 1;

      const children = newFolders.filter(f => f.parentId === folderId);
      if (children.length === 0) return 1;

      return children.reduce((sum, child) => sum + getSubtreeWidth(child.id), 0);
    };

    // Layout each node and its children
    const calculateLayout = (folderId, level, leftBound) => {
      const folder = newFolders.find(f => f.id === folderId);
      if (!folder) return leftBound;

      const children = newFolders.filter(f => f.parentId === folderId);
      
      if (children.length === 0) {
        // Leaf node - place at leftBound
        folder.x = leftBound;
        folder.y = 100 + level * levelHeight;
        return leftBound + horizontalSpacing;
      }

      // Layout children first
      let currentX = leftBound;
      const childPositions = [];
      
      children.forEach((child) => {
        const childFolder = newFolders.find(f => f.id === child.id);
        const childWidth = getSubtreeWidth(child.id);
        currentX = calculateLayout(child.id, level + 1, currentX);
        childPositions.push(childFolder.x);
      });

      // Position parent centered above children
      const leftmostChild = Math.min(...childPositions);
      const rightmostChild = Math.max(...childPositions);
      folder.x = (leftmostChild + rightmostChild) / 2;
      folder.y = 100 + level * levelHeight;

      return currentX;
    };

    // Layout each root and its subtree
    let currentX = 1500;
    rootFolders.forEach((root) => {
      currentX = calculateLayout(root.id, 0, currentX);
      currentX += horizontalSpacing; // Add spacing between root trees
    });

    setFolders(newFolders);
  }, [folders]);

  const handleMouseDown = (e, folderId) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    if (e.button === 1 || e.button === 2) return; // Ignore middle and right click
    
    const folder = findFolder(folderId);
    if (!folder) return;
    
    // Stop any panning when starting to drag a folder
    setIsPanning(false);
    
    setDraggedFolder(folderId);
    setDragStart({
      x: e.clientX - folder.x * scale - pan.x,
      y: e.clientY - folder.y * scale - pan.y
    });
    e.stopPropagation();
  };

  const handleCanvasMouseDown = (e) => {
    // Don't interfere with folder dragging
    if (e.target.closest('[data-folder-card]')) {
      return;
    }
    
    // Start panning when clicking on empty area
    setIsPanning(true);
    setPanStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    // Handle folder dragging first (higher priority)
    if (draggedFolder) {
      const newX = (e.clientX - pan.x - dragStart.x) / scale;
      const newY = (e.clientY - pan.y - dragStart.y) / scale;

      setFolders(prev => prev.map(folder =>
        folder.id === draggedFolder
          ? { ...folder, x: newX, y: newY }
          : folder
      ));
      
      // Update hovered folder based on mouse position
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

    // Handle panning only if not dragging a folder
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [draggedFolder, dragStart, scale, pan, isPanning, panStart, folders]);

  const handleMouseUp = useCallback((e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggedFolder) {
      // Find which folder (if any) the mouse is currently over
      const draggedFolderObj = findFolder(draggedFolder);
      if (draggedFolderObj) {
        const mouseX = (e.clientX - pan.x) / scale;
        const mouseY = (e.clientY - pan.y) / scale;
        
        // Check if mouse is over any folder
        const targetFolder = folders.find(folder => {
          if (folder.id === draggedFolder) return false;
          
          const folderLeft = folder.x;
          const folderTop = folder.y;
          const folderRight = folder.x + 200; // approximate folder width
          const folderBottom = folder.y + 100; // approximate folder height
          
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

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    // Get mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the point in world coordinates before zoom
    const worldX = (mouseX - pan.x) / scale;
    const worldY = (mouseY - pan.y) / scale;
    
    // Determine zoom direction and amount
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.1, Math.min(2, scale + delta));
    
    // Calculate new pan to keep the world point under the mouse
    const newPanX = mouseX - worldX * newScale;
    const newPanY = mouseY - worldY * newScale;
    
    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  }, [scale, pan]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e) => {
      e.preventDefault();
      handleWheel(e);
    };

    // Add with { passive: false } to allow preventDefault
    container.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [handleWheel]);

  const attachFolder = (childId, parentId) => {
    setFolders(prev => {
      const newFolders = [...prev];
      const parent = newFolders.find(f => f.id === parentId);
      const child = newFolders.find(f => f.id === childId);

      if (!parent || !child || parent.id === child.id) return prev;

      // Check if would create circular reference
      let current = parent;
      while (current) {
        if (current.id === childId) return prev;
        current = newFolders.find(f => f.id === current.parentId);
      }

      // Remove child from old parent
      const oldParent = newFolders.find(f => f.id === child.parentId);
      if (oldParent) {
        oldParent.children = oldParent.children.filter(id => id !== childId);
      }

      // Add to new parent
      child.parentId = parentId;
      if (!parent.children.includes(childId)) {
        parent.children.push(childId);
      }

      return newFolders;
    });
  };

  const addFolder = (parentId = null) => {
    const newId = Date.now().toString();
    let newX, newY;

    if (parentId) {
      const parent = findFolder(parentId);
      // Position below parent
      newX = parent.x;
      newY = parent.y + 200;
    } else {
      // Add root folder
      newX = 2000;
      newY = 100;
    }

    const newFolder = {
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

  const openFilesDialog = (folderId) => {
    setSelectedFolder(folderId);
    setShowFilesDialog(true);
  };

  const closeFilesDialog = () => {
    setShowFilesDialog(false);
    setSelectedFolder(null);
  };

  const handleFileUpload = (folderId, event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: e.target.result
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

  const deleteFile = (folderId, fileId) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, files: folder.files.filter(f => f.id !== fileId) }
        : folder
    ));
  };

  const deleteFolder = (folderId) => {
    setFolders(prev => {
      const folder = prev.find(f => f.id === folderId);
      if (!folder) return prev;

      // Recursively get all descendant IDs
      const getAllDescendants = (id) => {
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
      
      // Remove from parent's children
      if (folder.parentId) {
        const parent = newFolders.find(f => f.id === folder.parentId);
        if (parent) {
          parent.children = parent.children.filter(id => id !== folderId);
        }
      }

      return newFolders;
    });
  };

  const toggleFolder = (folderId) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, isOpen: !folder.isOpen }
        : folder
    ));
  };

  const updateFolderName = (folderId, newName) => {
    setFolders(prev => prev.map(folder =>
      folder.id === folderId
        ? { ...folder, name: newName }
        : folder
    ));
  };

  const handleZoom = (delta) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate the point in world coordinates before zoom
    const worldX = (centerX - pan.x) / scale;
    const worldY = (centerY - pan.y) / scale;
    
    const newScale = Math.max(0.1, Math.min(2, scale + delta));
    
    // Calculate new pan to keep the center point stable
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
        const parent = findFolder(folder.parentId);
        if (!parent) return null;

        // Calculate curve for smoother connections
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
      {/* Header */}
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

      {/* Zoom Controls */}
      <div className="absolute top-24 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700 p-2 z-50 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(0.1)}
          className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <div className="text-xs text-center text-slate-300 py-1">
          {Math.round(scale * 100)}%
        </div>
        <button
          onClick={() => handleZoom(-0.1)}
          className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <div className="border-t border-slate-700 my-1"></div>
        <button
          onClick={resetView}
          className="p-2 hover:bg-slate-700 rounded transition-colors text-white"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Large Canvas */}
      <div 
        className="canvas-area relative w-full h-full pt-20"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: draggedFolder || isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {/* SVG for connections */}
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

        {/* Folders */}
        {folders.map(folder => (
          <div
            key={folder.id}
            data-folder-card
            className={`absolute transition-shadow ${
              draggedFolder === folder.id 
                ? 'cursor-grabbing scale-105 z-50 shadow-2xl' 
                : 'cursor-move z-10'
            } ${
              hoveredFolder === folder.id && draggedFolder && draggedFolder !== folder.id 
                ? 'ring-4 ring-blue-500 ring-opacity-50' 
                : ''
            }`}
            style={{
              left: `${folder.x}px`,
              top: `${folder.y}px`,
              willChange: draggedFolder === folder.id ? 'transform' : 'auto',
            }}
            onMouseDown={(e) => handleMouseDown(e, folder.id)}
          >
            <div className="bg-slate-800 rounded-lg shadow-xl border-2 border-slate-600 p-3 min-w-[200px] hover:shadow-2xl hover:border-blue-500 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="hover:bg-slate-700 rounded p-1 transition-colors cursor-pointer"
                >
                  {folder.isOpen ? (
                    <FolderOpen className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Folder className="w-5 h-5 text-blue-400" />
                  )}
                </button>
                
                {editingFolder === folder.id ? (
                  <input
                    type="text"
                    defaultValue={folder.name}
                    autoFocus
                    onBlur={(e) => {
                      updateFolderName(folder.id, e.target.value || 'New Folder');
                      setEditingFolder(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateFolderName(folder.id, e.target.value || 'New Folder');
                        setEditingFolder(null);
                      }
                      if (e.key === 'Escape') {
                        setEditingFolder(null);
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm font-medium bg-slate-700 text-white border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-text"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolder(folder.id);
                    }}
                    className="flex-1 text-sm font-medium text-white cursor-pointer hover:text-blue-400 transition-colors"
                  >
                    {folder.name}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder.id);
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
                    addFolder(folder.id);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-blue-600/20 text-blue-300 rounded hover:bg-blue-600/30 transition-colors border border-blue-500/30 cursor-pointer"
                  title="Add child folder"
                >
                  <Plus className="w-3 h-3" />
                  Add Child
                </button>
              </div>

              {(folder.children.length > 0 || folder.files.length > 0) && (
                <div className="mt-2 pt-2 border-t border-slate-700 space-y-1">
                  {folder.children.length > 0 && (
                    <div className="text-xs text-slate-400">
                      {folder.children.length} child{folder.children.length !== 1 ? 'ren' : ''}
                    </div>
                  )}
                  {folder.files.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openFilesDialog(folder.id);
                      }}
                      className="w-full text-xs text-blue-400 hover:text-blue-300 transition-colors text-left cursor-pointer flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
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

      {/* Files Dialog */}
      {showFilesDialog && selectedFolder && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]"
          onClick={closeFilesDialog}
        >
          <div 
            className="bg-slate-800 rounded-xl shadow-2xl border-2 border-slate-600 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Folder className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">
                  {findFolder(selectedFolder)?.name} - Files
                </h2>
              </div>
              <button
                onClick={closeFilesDialog}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Upload Section */}
            <div className="mb-6">
              <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors border-2 border-dashed border-blue-500/50 cursor-pointer">
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload Files (Images/Videos)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    handleFileUpload(selectedFolder, e);
                    e.target.value = ''; // Reset input
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {/* Files Grid */}
            {findFolder(selectedFolder)?.files.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {findFolder(selectedFolder)?.files.map(file => (
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
                      <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1">
                        {file.type === 'image' ? (
                          <Image className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Video className="w-3 h-3 text-purple-400" />
                        )}
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">
                          {file.type}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteFile(selectedFolder, file.id)}
                        className="p-1.5 hover:bg-red-900/50 rounded transition-colors ml-2 flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No files in this folder</p>
                <p className="text-slate-500 text-sm mt-2">Upload some files to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid background */}
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