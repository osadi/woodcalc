import type { Piece } from '$lib/stores/groups';
import type { StockSettings } from '$lib/stores/stockSettings';
import type { StockType } from '$lib/stores/stockTypes';

// Represents a piece after optimization (might be an original piece or a split piece)
export interface OptimizedPiece {
  id: string;
  originalId: string; // Reference to original piece
  length: number;
  position: number; // Position on the stock
  stockType: StockType;
  quantity: number;
  kerf: number;
  margin: number;
  isJoinPart?: boolean; // True if this is part of a split piece
  joinPartNumber?: number; // If split, which part number (1, 2, etc.)
  totalJoinParts?: number; // If split, how many total parts
  stockLength?: number; // The actual stock length this piece comes from (for split pieces)
}

// Represents a stock piece with placed pieces
export interface OptimizedStock {
  id: string;
  length: number;
  pieces: OptimizedPiece[];
  remainingLength: number;
  stockType: StockType;
  utilization: number; // 0-100%
}

// Represents a complete cutting plan for a group of pieces
export interface CuttingPlan {
  stocks: OptimizedStock[];
  oversizedPieces: OptimizedPiece[][]; // Groups of split pieces
  totalWaste: number;
  totalUsed: number;
  overallUtilization: number; // 0-100%
}

export function optimizeCutting(
  pieces: Piece[],
  stockSettings: StockSettings,
  stockType: StockType
): CuttingPlan {
  // Filter pieces by stock type
  const filteredPieces = pieces.filter(p => p.stockType.id === stockType.id);
  
  // Preprocess pieces - handle quantities
  const expandedPieces: Piece[] = [];
  filteredPieces.forEach(piece => {
    for (let i = 0; i < piece.quantity; i++) {
      expandedPieces.push({...piece, quantity: 1});
    }
  });
  
  // Sort pieces by length (decreasing)
  const sortedPieces = [...expandedPieces].sort((a, b) => b.length - a.length);
  
  // Available stock lengths
  const stockLengths: number[] = [];
  for (let len = stockSettings.minLength; len <= stockSettings.maxLength; len += stockSettings.increment) {
    stockLengths.push(len);
  }
  
  const maxStockLength = stockSettings.maxLength;
  const stocks: OptimizedStock[] = [];
  const oversizedPieces: OptimizedPiece[][] = [];
  
  // Process each piece
  for (const piece of sortedPieces) {
    // Check if piece is oversized
    if (piece.length > maxStockLength) {
      handleOversizedPiece(piece, oversizedPieces, maxStockLength, stockType, stockLengths);
      continue;
    }
    
    // Try to place the piece in an existing stock
    let placed = false;
    for (const stock of stocks) {
      // Only fit pieces of the same stock type
      if (stock.stockType.id !== piece.stockType.id) continue;
      
      const effectiveLength = piece.length + (stock.pieces.length > 0 ? piece.kerf : 0);
      
      // Add margin between pieces (always add margin except for the last piece of the stock)
      // Check if this would be the last piece that perfectly fits
      const wouldBePerfectFit = stock.remainingLength === effectiveLength;
      
      // Always add margin if there are already pieces in the stock and this isn't a perfect fit
      const marginToAdd = (stock.pieces.length > 0 && !wouldBePerfectFit) ? piece.margin : 0;
      
      if (stock.remainingLength >= effectiveLength + marginToAdd) {
        // Place the piece
        const position = stock.length - stock.remainingLength;
        
        const optimizedPiece: OptimizedPiece = {
          id: crypto.randomUUID(),
          originalId: piece.id,
          length: piece.length,
          position: position,
          stockType: piece.stockType,
          quantity: 1,
          kerf: piece.kerf,
          margin: piece.margin // Store the full margin value for visualization
        };
        
        stock.pieces.push(optimizedPiece);
        stock.remainingLength -= (effectiveLength + marginToAdd);
        stock.utilization = ((stock.length - stock.remainingLength) / stock.length) * 100;
        placed = true;
        break;
      }
    }
    
    // If piece couldn't fit in any existing stock, create a new one
    if (!placed) {
      // Find the smallest stock that can fit this piece
      const suitableLength = stockLengths.find(len => len >= piece.length);
      
      if (suitableLength) {
        const newStock: OptimizedStock = {
          id: crypto.randomUUID(),
          length: suitableLength,
          pieces: [],
          remainingLength: suitableLength,
          stockType: piece.stockType,
          utilization: 0
        };
        
        const optimizedPiece: OptimizedPiece = {
          id: crypto.randomUUID(),
          originalId: piece.id,
          length: piece.length,
          position: 0,
          stockType: piece.stockType,
          quantity: 1,
          kerf: piece.kerf,
          margin: piece.margin // Ensure margin is passed here as well
        };
        
        newStock.pieces.push(optimizedPiece);
        newStock.remainingLength -= (piece.length + piece.kerf + piece.margin);
        newStock.utilization = ((newStock.length - newStock.remainingLength) / newStock.length) * 100;
        stocks.push(newStock);
      }
    }
  }
  
  // Calculate totals
  let totalUsed = 0;
  let totalStockLength = 0;
  
  stocks.forEach(stock => {
    totalStockLength += stock.length;
    totalUsed += (stock.length - stock.remainingLength);
  });
  
  const totalWaste = totalStockLength - totalUsed;
  const overallUtilization = totalStockLength > 0 ? (totalUsed / totalStockLength) * 100 : 0;
  
  return {
    stocks,
    oversizedPieces,
    totalWaste,
    totalUsed,
    overallUtilization
  };
}

// Helper function to handle oversized pieces
function handleOversizedPiece(
  piece: Piece, 
  oversizedPieces: OptimizedPiece[][], 
  maxStockLength: number,
  stockType: StockType,
  stockLengths: number[]
): void {
  // Calculate how many parts we need
  let remainingLength = piece.length;
  const splitPieces: OptimizedPiece[] = [];
  let partCount = 0;
  
  // Keep allocating parts until the entire piece is accounted for
  while (remainingLength > 0) {
    partCount++;
    let partLength: number;
    let stockLength: number;
    
    if (remainingLength <= maxStockLength) {
      // Find the smallest stock that can fit the remaining length
      const suitableLength = stockLengths.find(len => len >= remainingLength);
      
      if (suitableLength) {
        // Use a valid stock length
        stockLength = suitableLength;
        partLength = remainingLength; // Actual piece length is the remaining length
      } else {
        // If no suitable length found (shouldn't happen normally), use max length
        stockLength = maxStockLength;
        partLength = remainingLength;
      }
    } else {
      // If remaining length is still greater than max, use full stock
      stockLength = maxStockLength;
      partLength = maxStockLength;
    }
    
    splitPieces.push({
      id: crypto.randomUUID(),
      originalId: piece.id,
      length: partLength,
      position: 0,
      stockType: piece.stockType,
      quantity: 1,
      // Only set kerf for parts that need joining
      kerf: remainingLength > partLength ? piece.kerf : 0,
      margin: piece.margin,
      isJoinPart: true,
      joinPartNumber: partCount,
      totalJoinParts: 0, // Will update after we know the total
      stockLength: stockLength // Store the actual stock length this comes from
    });
    
    remainingLength -= partLength;
  }
  
  // Update total parts count now that we know it
  splitPieces.forEach(part => {
    part.totalJoinParts = partCount;
  });
  
  oversizedPieces.push(splitPieces);
}
