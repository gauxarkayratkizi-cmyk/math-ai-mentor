
import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Sun, ZoomIn, RotateCcw } from 'lucide-react';

interface ImageEditorProps {
  imageSrc: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onCancel }) => {
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to a square viewport for consistent "cropping"
    const size = Math.min(window.innerWidth * 0.8, 500);
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `brightness(${brightness}%)`;

    const drawWidth = img.width * zoom;
    const drawHeight = img.height * zoom;
    
    // Center the image initially + add offset
    const x = (canvas.width - drawWidth) / 2 + offset.x;
    const y = (canvas.height - drawHeight) / 2 + offset.y;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  };

  useEffect(() => {
    renderCanvas();
  }, [brightness, zoom, offset]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/jpeg', 0.9));
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const reset = () => {
    setBrightness(100);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={onCancel} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="mb-8 relative bg-gray-800 rounded-lg overflow-hidden touch-none shadow-2xl"
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
           onTouchStart={handleMouseDown}
           onTouchMove={handleMouseMove}
           onTouchEnd={handleMouseUp}>
        <canvas ref={canvasRef} className="max-w-full cursor-move" />
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500/30"></div>
      </div>

      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-6 flex flex-col gap-6 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Sun className="w-5 h-5 text-yellow-400" />
            <input 
              type="range" min="50" max="200" value={brightness} 
              onChange={(e) => setBrightness(parseInt(e.target.value))}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-400 w-8">{brightness}%</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ZoomIn className="w-5 h-5 text-blue-400" />
            <input 
              type="range" min="0.1" max="3" step="0.1" value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-gray-400 w-8">{zoom.toFixed(1)}x</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <button onClick={reset} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
            Қалпына келтіру
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={onCancel} 
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Болдырмау
            </button>
            <button 
              onClick={handleSave} 
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              Сақтау
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
