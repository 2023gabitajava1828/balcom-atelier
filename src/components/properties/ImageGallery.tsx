import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onShare?: () => void;
  title?: string;
}

export const ImageGallery = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  onShare,
  title,
}: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });
  const lastTapRef = useRef(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const initialPinchDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);

  // Reset state when opening or changing images
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetZoom();
      showControlsTemporarily();
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (scale === 1) setShowControls(false);
    }, 3000);
  }, [scale]);

  const nextImage = useCallback(() => {
    if (scale > 1) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    showControlsTemporarily();
  }, [images.length, scale, showControlsTemporarily]);

  const prevImage = useCallback(() => {
    if (scale > 1) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    showControlsTemporarily();
  }, [images.length, scale, showControlsTemporarily]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
    showControlsTemporarily();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1);
    setScale(newScale);
    if (newScale === 1) resetZoom();
    showControlsTemporarily();
  };

  // Double tap to zoom
  const handleDoubleTap = (e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (scale > 1) {
        resetZoom();
      } else {
        setScale(2.5);
        // Center zoom on tap position
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = "touches" in e ? e.touches[0]?.clientX ?? rect.width / 2 : e.clientX;
          const clientY = "touches" in e ? e.touches[0]?.clientY ?? rect.height / 2 : e.clientY;
          const x = (rect.width / 2 - clientX) * 1.5;
          const y = (rect.height / 2 - clientY) * 1.5;
          setPosition({ x, y });
        }
      }
    }
    lastTapRef.current = now;
    showControlsTemporarily();
  };

  // Touch handlers for swipe and pinch
  const handleTouchStart = (e: React.TouchEvent) => {
    showControlsTemporarily();
    
    if (e.touches.length === 2) {
      // Pinch start
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistanceRef.current = distance;
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: 0,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.min(
        Math.max(initialScaleRef.current * (distance / initialPinchDistanceRef.current), 1),
        4
      );
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && isDragging) {
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      if (scale > 1) {
        // Pan when zoomed
        setPosition((prev) => ({
          x: prev.x + deltaX * 0.5,
          y: prev.y + deltaY * 0.5,
        }));
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          distance: 0,
        };
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0 && isDragging && scale === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      
      // Swipe detection
      if (Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
        if (deltaX > 0) {
          prevImage();
        } else {
          nextImage();
        }
      }
      
      // Pull down to close
      if (deltaY > 100 && Math.abs(deltaX) < 50) {
        onClose();
      }
    }
    setIsDragging(false);
  };

  const handleContainerClick = () => {
    if (scale === 1) {
      setShowControls((prev) => !prev);
    }
    showControlsTemporarily();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black touch-none select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
    >
      {/* Top Controls */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <X className="w-6 h-6" />
          </Button>
          
          <div className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
          
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        
        {title && (
          <p className="text-white/80 text-sm mt-2 truncate">{title}</p>
        )}
      </div>

      {/* Main Image */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        onDoubleClick={handleDoubleTap}
      >
        <img
          ref={imageRef}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          draggable={false}
        />
      </div>

      {/* Side Navigation Arrows */}
      {images.length > 1 && scale === 1 && (
        <>
          <button
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-300 hover:bg-black/70",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity duration-300 hover:bg-black/70",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Zoom Controls */}
        <div className="flex justify-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            disabled={scale <= 1}
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
          <span className="text-white text-sm flex items-center min-w-[60px] justify-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            disabled={scale >= 4}
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {images.slice(0, 15).map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  resetZoom();
                }}
                className={cn(
                  "flex-shrink-0 w-14 h-10 rounded overflow-hidden border-2 transition-all",
                  idx === currentIndex
                    ? "border-white ring-2 ring-white/50"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            {images.length > 15 && (
              <div className="flex-shrink-0 w-14 h-10 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs">+{images.length - 15}</span>
              </div>
            )}
          </div>
        )}

        {/* Hint Text */}
        <p className="text-white/50 text-xs text-center mt-2">
          {scale > 1 ? "Pinch or double-tap to reset" : "Swipe to navigate • Double-tap to zoom • Pull down to close"}
        </p>
      </div>
    </div>
  );
};

export default ImageGallery;