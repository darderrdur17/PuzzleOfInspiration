export interface PuzzlePiece {
  id: string;
  index: number;
  row: number;
  col: number;
  width: number;
  height: number;
  top: number;
  left: number;
  shape: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  quote: string;
  isPlaced: boolean;
  currentX: number;
  currentY: number;
}

export interface PuzzleConfig {
  rows: number;
  cols: number;
  width: number;
  height: number;
}

// Generate random tab shapes: 1 (out), -1 (in), 0 (flat - for edges)
const getTab = () => Math.random() > 0.5 ? 1 : -1;

export function generatePuzzle(
  config: PuzzleConfig, 
  quotes: string[]
): PuzzlePiece[] {
  const { rows, cols, width, height } = config;
  const pieceWidth = width / cols;
  const pieceHeight = height / rows;
  const pieces: PuzzlePiece[] = [];
  
  let quoteIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col;
      
      // Determine shapes
      // Top: opposite of piece above, or flat if top row
      const top = row === 0 ? 0 : -pieces[(row - 1) * cols + col].shape.bottom;
      // Right: random if not last col, else flat
      const right = col === cols - 1 ? 0 : getTab();
      // Bottom: random if not last row, else flat
      const bottom = row === rows - 1 ? 0 : getTab();
      // Left: opposite of piece to left, or flat if first col
      const left = col === 0 ? 0 : -pieces[row * cols + (col - 1)].shape.right;

      // Assign a quote cyclically
      const quote = quotes[quoteIndex % quotes.length];
      quoteIndex++;

      // Random initial position (scattered)
      // We'll handle scattering in the component to keep this pure if needed, 
      // but for now let's just initialize them at 0,0 or let the UI handle scatter.
      // Actually, let's initialize them as "not placed" and let the UI scatter them.
      
      pieces.push({
        id: `piece-${index}`,
        index,
        row,
        col,
        width: pieceWidth,
        height: pieceHeight,
        top: row * pieceHeight,
        left: col * pieceWidth,
        shape: { top, right, bottom, left },
        quote,
        isPlaced: false,
        currentX: 0, // Will be set by scatter function
        currentY: 0,
      });
    }
  }

  return pieces;
}

// SVG Path generator for puzzle piece
export function getPiecePath(
  width: number, 
  height: number, 
  shape: { top: number; right: number; bottom: number; left: number }
): string {
  const tabSize = Math.min(width, height) * 0.25; // 25% of piece size
  
  let path = `M 0 0`;
  
  // Top edge
  if (shape.top !== 0) {
    path += ` L ${width / 2 - tabSize / 2} 0`;
    path += ` c 0 ${shape.top * -tabSize}, ${tabSize} ${shape.top * -tabSize}, ${tabSize} 0`;
    path += ` L ${width} 0`;
  } else {
    path += ` L ${width} 0`;
  }
  
  // Right edge
  if (shape.right !== 0) {
    path += ` L ${width} ${height / 2 - tabSize / 2}`;
    path += ` c ${shape.right * tabSize} 0, ${shape.right * tabSize} ${tabSize}, 0 ${tabSize}`;
    path += ` L ${width} ${height}`;
  } else {
    path += ` L ${width} ${height}`;
  }
  
  // Bottom edge
  if (shape.bottom !== 0) {
    path += ` L ${width / 2 + tabSize / 2} ${height}`;
    path += ` c 0 ${shape.bottom * -tabSize}, ${-tabSize} ${shape.bottom * -tabSize}, ${-tabSize} 0`;
    path += ` L 0 ${height}`;
  } else {
    path += ` L 0 ${height}`;
  }
  
  // Left edge
  if (shape.left !== 0) {
    path += ` L 0 ${height / 2 + tabSize / 2}`;
    path += ` c ${shape.left * tabSize} 0, ${shape.left * tabSize} ${-tabSize}, 0 ${-tabSize}`;
    path += ` Z`;
  } else {
    path += ` Z`;
  }
  
  return path;
}

// Helper to check if piece is close enough to snap
export function isCloseEnough(
  current: { x: number; y: number },
  target: { x: number; y: number },
  threshold: number = 20
): boolean {
  return Math.abs(current.x - target.x) < threshold && 
         Math.abs(current.y - target.y) < threshold;
}
