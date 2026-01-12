import { useState, useRef, useCallback } from 'react';

export interface MarkupPoint {
  x: number;
  y: number;
}

export interface Markup {
  id: string;
  videoId: string;
  timestamp: number;
  color: string;
  strokeWidth: number;
  points: MarkupPoint[];
  author: string;
  createdAt: string;
  thumbnail?: string;
}

export interface DrawingState {
  color: string;
  strokeWidth: number;
  isDrawing: boolean;
  currentPoints: MarkupPoint[];
}

export const useMarkupTool = () => {
  const [isMarkupMode, setIsMarkupMode] = useState(false);
  const [markups, setMarkups] = useState<Markup[]>([]);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    color: '#ff0000',
    strokeWidth: 3,
    isDrawing: false,
    currentPoints: [],
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const currentMarkupPoints = useRef<MarkupPoint[]>([]);

  // Initialize canvas
  const initializeCanvas = useCallback((canvas: HTMLCanvasElement, containerWidth: number, containerHeight: number) => {
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = drawingState.color;
      ctx.lineWidth = drawingState.strokeWidth;
      contextRef.current = ctx;
    }
  }, [drawingState.color, drawingState.strokeWidth]);

  // Start drawing
  const startDrawing = useCallback((x: number, y: number) => {
    if (!contextRef.current) return;
    
    setDrawingState(prev => ({ ...prev, isDrawing: true }));
    currentMarkupPoints.current = [{ x, y }];
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  }, []);

  // Draw
  const draw = useCallback((x: number, y: number) => {
    if (!drawingState.isDrawing || !contextRef.current) return;
    
    currentMarkupPoints.current.push({ x, y });
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  }, [drawingState.isDrawing]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (!contextRef.current) return;
    
    contextRef.current.closePath();
    setDrawingState(prev => ({ 
      ...prev, 
      isDrawing: false,
      currentPoints: currentMarkupPoints.current 
    }));
  }, []);

  // Save current markup
  const saveMarkup = useCallback((videoId: string, timestamp: number, author: string, videoElement?: HTMLVideoElement) => {
    if (currentMarkupPoints.current.length === 0) return null;

    let thumbnail: string | undefined;
    
    // Create a temporary canvas to combine video frame + drawing
    if (canvasRef.current && videoElement) {
      try {
        const tempCanvas = document.createElement('canvas');
        const videoWidth = videoElement.videoWidth || videoElement.offsetWidth;
        const videoHeight = videoElement.videoHeight || videoElement.offsetHeight;
        
        tempCanvas.width = videoWidth;
        tempCanvas.height = videoHeight;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        if (tempCtx) {
          // Draw the video frame
          try {
            tempCtx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
            
            // Calculate scale factor between canvas and video
            const scaleX = videoWidth / canvasRef.current.width;
            const scaleY = videoHeight / canvasRef.current.height;
            
            // Draw the markup on top of video frame
            tempCtx.strokeStyle = drawingState.color;
            tempCtx.lineWidth = drawingState.strokeWidth * Math.max(scaleX, scaleY);
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            
            tempCtx.beginPath();
            const firstPoint = currentMarkupPoints.current[0];
            tempCtx.moveTo(firstPoint.x * scaleX, firstPoint.y * scaleY);
            
            for (let i = 1; i < currentMarkupPoints.current.length; i++) {
              const point = currentMarkupPoints.current[i];
              tempCtx.lineTo(point.x * scaleX, point.y * scaleY);
            }
            
            tempCtx.stroke();
            
            // Get the combined screenshot
            thumbnail = tempCanvas.toDataURL('image/png');
          } catch (drawError) {
            console.warn('Could not capture video frame (CORS), using drawing only:', drawError);
            // Fallback: Just use the drawing canvas
            thumbnail = canvasRef.current?.toDataURL('image/png');
          }
        }
      } catch (error) {
        console.error('Error creating thumbnail:', error);
        // Fallback to just the drawing
        try {
          thumbnail = canvasRef.current?.toDataURL('image/png');
        } catch (e) {
          console.error('Could not create thumbnail at all:', e);
        }
      }
    }

    const markup: Markup = {
      id: `markup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      videoId,
      timestamp,
      color: drawingState.color,
      strokeWidth: drawingState.strokeWidth,
      points: [...currentMarkupPoints.current],
      author,
      createdAt: new Date().toISOString(),
      thumbnail,
    };

    setMarkups(prev => [...prev, markup]);
    currentMarkupPoints.current = [];
    
    return markup;
  }, [drawingState.color, drawingState.strokeWidth]);

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    currentMarkupPoints.current = [];
    setDrawingState(prev => ({ ...prev, currentPoints: [] }));
  }, []);

  // Render a saved markup on canvas
  const renderMarkup = useCallback((markup: Markup) => {
    if (!contextRef.current || markup.points.length === 0) return;
    
    const ctx = contextRef.current;
    
    ctx.strokeStyle = markup.color;
    ctx.lineWidth = markup.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(markup.points[0].x, markup.points[0].y);
    
    for (let i = 1; i < markup.points.length; i++) {
      ctx.lineTo(markup.points[i].x, markup.points[i].y);
    }
    
    ctx.stroke();
    ctx.closePath();
    
    // Restore current drawing settings
    ctx.strokeStyle = drawingState.color;
    ctx.lineWidth = drawingState.strokeWidth;
  }, [drawingState.color, drawingState.strokeWidth]);

  // Render multiple markups
  const renderMarkups = useCallback((markupsToRender: Markup[]) => {
    clearCanvas();
    markupsToRender.forEach(markup => renderMarkup(markup));
  }, [clearCanvas, renderMarkup]);

  // Delete a markup
  const deleteMarkup = useCallback((markupId: string) => {
    setMarkups(prev => prev.filter(m => m.id !== markupId));
  }, []);

  // Change color
  const setColor = useCallback((color: string) => {
    setDrawingState(prev => ({ ...prev, color }));
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
  }, []);

  // Change stroke width
  const setStrokeWidth = useCallback((width: number) => {
    setDrawingState(prev => ({ ...prev, strokeWidth: width }));
    if (contextRef.current) {
      contextRef.current.lineWidth = width;
    }
  }, []);

  // Toggle markup mode
  const toggleMarkupMode = useCallback(() => {
    setIsMarkupMode(prev => !prev);
    if (isMarkupMode) {
      clearCanvas();
    }
  }, [isMarkupMode, clearCanvas]);

  // Get markups for specific timestamp (within a range)
  const getMarkupsAtTimestamp = useCallback((timestamp: number, range: number = 0.5) => {
    return markups.filter(
      m => Math.abs(m.timestamp - timestamp) <= range
    );
  }, [markups]);

  return {
    // State
    isMarkupMode,
    markups,
    drawingState,
    canvasRef,
    contextRef,
    
    // Actions
    initializeCanvas,
    startDrawing,
    draw,
    stopDrawing,
    saveMarkup,
    clearCanvas,
    renderMarkup,
    renderMarkups,
    deleteMarkup,
    setColor,
    setStrokeWidth,
    toggleMarkupMode,
    getMarkupsAtTimestamp,
  };
};