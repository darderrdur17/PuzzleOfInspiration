import { useDraggable } from '@dnd-kit/core';
import { PuzzlePiece as PieceType, getPiecePath } from '@/lib/puzzle';
import { cn } from '@/lib/utils';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface PuzzlePieceProps {
  piece: PieceType;
  image: string;
  themeColor: string;
  isDragging?: boolean;
}

export function PuzzlePiece({ piece, image, themeColor, isDragging }: PuzzlePieceProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: piece.id,
    data: piece,
    disabled: piece.isPlaced,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 100 : piece.isPlaced ? 1 : 10,
    position: 'absolute' as const,
    left: piece.isPlaced ? piece.left : piece.currentX,
    top: piece.isPlaced ? piece.top : piece.currentY,
    width: piece.width,
    height: piece.height,
    filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' : piece.isPlaced ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  };

  const path = getPiecePath(piece.width, piece.height, piece.shape);
  
  // Calculate clip path for the image
  // We need to expand the container slightly to accommodate tabs sticking out
  // But for simplicity in this implementation, we'll use SVG mask/clipPath
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "touch-none transition-shadow duration-200 cursor-grab active:cursor-grabbing",
        piece.isPlaced && "cursor-default pointer-events-none transition-all duration-500"
      )}
    >
      <div className="relative w-full h-full">
        <svg 
          width={piece.width} 
          height={piece.height} 
          viewBox={`0 0 ${piece.width} ${piece.height}`}
          className="overflow-visible"
        >
          <defs>
            <clipPath id={`clip-${piece.id}`}>
              <path d={path} />
            </clipPath>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background Image masked by piece shape */}
          <g clipPath={`url(#clip-${piece.id})`}>
            <image 
              href={image} 
              x={-piece.left} 
              y={-piece.top} 
              width={piece.width * 4} // Assuming 4x4 grid for now, will adjust dynamically
              height={piece.height * 3} // Assuming 3 rows
              preserveAspectRatio="none"
            />
            
            {/* Overlay for text readability */}
            <rect x="0" y="0" width={piece.width} height={piece.height} fill="rgba(0,0,0,0.4)" />
            
            {/* Quote Text */}
            <foreignObject x="10%" y="10%" width="80%" height="80%">
              <div className="w-full h-full flex items-center justify-center text-center">
                <p 
                  className="text-white font-body text-[10px] leading-tight select-none drop-shadow-md"
                  style={{ 
                    fontSize: `${Math.max(8, Math.min(14, 1000 / piece.quote.length))}px` 
                  }}
                >
                  {piece.quote}
                </p>
              </div>
            </foreignObject>
          </g>
          
          {/* Border/Stroke */}
          <path 
            d={path} 
            fill="none" 
            stroke={piece.isPlaced ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)"} 
            strokeWidth="1"
            className={cn(isDragging && "stroke-white stroke-2")}
          />
          
          {/* Highlight effect on hover/drag */}
          {isDragging && (
             <path d={path} fill="url(#glow)" stroke={themeColor} strokeWidth="2" opacity="0.5" />
          )}
        </svg>
      </div>
    </div>
  );
}
