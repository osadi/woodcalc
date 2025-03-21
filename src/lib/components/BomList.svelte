<script lang="ts">
  import { groups } from '$lib/stores/groups';
  import { stockSettings } from '$lib/stores/stockSettings';
  import type { Piece } from '$lib/stores/groups';
  import type { StockType } from '$lib/stores/stockTypes';
  import { optimizeCutting, type OptimizedStock } from '$lib/utils/cuttingOptimizer';
  
  // A BOM entry representing physical stock needed with its dimensions and length
  interface BomEntry {
    stockType: StockType;
    stockLength: number;
    quantity: number; // Number of physical stock pieces needed
  }
  
  // Compute the cutting plans to determine actual stocks needed
  $: bomEntries = generateBom($groups, $stockSettings);
  
  function generateBom(groupsList: typeof $groups, settings: typeof $stockSettings): BomEntry[] {
    // Map to track stocks needed by type and length
    const stocksNeeded: Record<string, BomEntry> = {};
    
    // Process each group and collect all the physical stocks needed
    groupsList.forEach(group => {
      // Get unique stock types in this group
      const stockTypes = new Map();
      group.items.forEach(piece => {
        stockTypes.set(piece.stockType.id, piece.stockType);
      });
      
      // For each stock type, get the cutting plan
      Array.from(stockTypes.values()).forEach(stockType => {
        const cuttingPlan = optimizeCutting(group.items, settings, stockType);
        
        // Add regular stocks
        cuttingPlan.stocks.forEach(stock => {
          const key = `${stock.stockType.id}_${stock.length}`;
          
          if (!stocksNeeded[key]) {
            stocksNeeded[key] = {
              stockType: stock.stockType,
              stockLength: stock.length,
              quantity: 0
            };
          }
          
          stocksNeeded[key].quantity += 1;
        });
        
        // Add oversized pieces (which each need their own stock)
        cuttingPlan.oversizedPieces.forEach(splitPiece => {
          splitPiece.forEach(part => {
            const stockLength = part.stockLength || part.length;
            const key = `${part.stockType.id}_${stockLength}`;
            
            if (!stocksNeeded[key]) {
              stocksNeeded[key] = {
                stockType: part.stockType,
                stockLength: stockLength,
                quantity: 0
              };
            }
            
            stocksNeeded[key].quantity += 1;
          });
        });
      });
    });
    
    // Convert to array and sort
    return Object.values(stocksNeeded).sort((a, b) => {
      // First sort by stock type (area)
      const areaA = a.stockType.width * a.stockType.height;
      const areaB = b.stockType.width * b.stockType.height;
      
      if (areaA !== areaB) {
        return areaB - areaA; // Largest area first
      }
      
      // Then by stock length
      return b.stockLength - a.stockLength; // Longest stock first
    });
  }
  
  // Format length in meters if over 1000mm
  function formatLength(mm: number): string {
    if (mm >= 1000) {
      return `${(mm / 1000).toFixed(2)}m`;
    }
    return `${mm}mm`;
  }
  
  // Calculate total length (stock length * quantity)
  function calculateTotalLength(stockLength: number, quantity: number): string {
    return formatLength(stockLength * quantity);
  }
</script>

<div class="bom-list w-full">
  {#if bomEntries.length === 0}
    <div class="text-center p-4 text-base-content/60">
      No materials added yet.
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-xs w-full">
        <thead>
          <tr>
            <th>Stock Type</th>
            <th>Length</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {#each bomEntries as entry (entry.stockType.id + '_' + entry.stockLength)}
            <tr class="hover:bg-base-200">
              <td>{entry.stockType.width}×{entry.stockType.height}mm ({entry.stockType.name})</td>
              <td>{entry.stockLength}mm</td>
              <td class="text-right">{entry.quantity}</td>
              <td class="text-right font-medium">{calculateTotalLength(entry.stockLength, entry.quantity)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
