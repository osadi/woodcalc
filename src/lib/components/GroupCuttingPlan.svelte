<script lang="ts">
  import { stockSettings } from '$lib/stores/stockSettings';
  import type { Group, Piece } from '$lib/stores/groups';
  import WoodVisualizer from './WoodVisualizer.svelte';
  import { optimizeCutting, type CuttingPlan, type OptimizedStock, type OptimizedPiece } from '$lib/utils/cuttingOptimizer';
  
  let { group }: { group: Group } = $props();
  
  // Group pieces by stock type
  let stockTypes = $derived(getUniqueStockTypes(group.items));
  let cuttingPlans = $derived(generateCuttingPlans(group.items, $stockSettings, stockTypes));
  
  // Get unique stock types from pieces
  function getUniqueStockTypes(pieces: Piece[]) {
    const types = new Map();
    pieces.forEach(piece => {
      types.set(piece.stockType.id, piece.stockType);
    });
    return Array.from(types.values());
  }
  
  // Generate cutting plans for each stock type
  function generateCuttingPlans(pieces: Piece[], settings: typeof $stockSettings, types: any[]) {
    const plans: Record<string, CuttingPlan> = {};
    
    types.forEach(stockType => {
      plans[stockType.id] = optimizeCutting(pieces, settings, stockType);
    });
    
    return plans;
  }

  // Generate piece data for visualization with proper margins
  function preparePiecesForVisualizer(stock: OptimizedStock) {
    // Extract lengths
    const lengths = stock.pieces.map((p: OptimizedPiece) => p.length);
    
    // Extract margins (one per piece)
    const margins = stock.pieces.map((p: OptimizedPiece) => p.margin);
    
    return { lengths, margins };
  }

  let isOpen = $state(true);

  function toggleOpen() {
    isOpen = !isOpen;
  }
  
  // Add keyboard handler for accessibility
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  }

  // Helper function to ensure text color has good contrast with background
  function getTextColor(backgroundColor: string): string {
    // Simple contrast calculation (can be improved with proper luminance calculation)
    const r = parseInt(backgroundColor.substr(1, 2), 16);
    const g = parseInt(backgroundColor.substr(3, 2), 16);
    const b = parseInt(backgroundColor.substr(5, 2), 16);
    
    // Calculate luminance (simplified)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Use white text for dark backgrounds, black for light backgrounds
    return luminance > 0.6 ? "#000000" : "#FFFFFF";
  }
  
  const textColor = getTextColor(group.color);
</script>

<div class="card mb-6 rounded-lg overflow-hidden not-prose" style="border: 1px solid {group.color}">
  <button 
    type="button"
    class="w-full text-left card-title p-2 px-4 cursor-pointer flex items-center justify-between"
    style="background-color: {group.color}; color: {textColor}"
    onclick={toggleOpen}
    onkeydown={handleKeyDown}
    aria-expanded={isOpen}
  >
    <h2 class="text-base font-bold m-0 p-0">{group.name} - Cutting Plan</h2>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  </button>
  
  {#if isOpen}
    <div class="card-body p-4 bg-base-100">
      {#if !stockTypes.length}
        <div class="bg-base-200 p-4 text-center rounded-lg">
          <p>No pieces added to this group yet.</p>
        </div>
      {:else}
        {#each stockTypes as stockType (stockType.id)}
          <div class="stock-type-section mb-4">
            <h3 class="text-lg font-semibold mb-2">
              {stockType.name} ({stockType.width}×{stockType.height}mm)
            </h3>
            
            <div class="stats shadow w-full mb-4">
              <div class="stat">
                <div class="stat-title">Stocks Used</div>
                <div class="stat-value">{cuttingPlans[stockType.id].stocks.length}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Material Usage</div>
                <div class="stat-value">{cuttingPlans[stockType.id].overallUtilization.toFixed(1)}%</div>
              </div>
              <div class="stat">
                <div class="stat-title">Waste</div>
                <div class="stat-value text-error">{cuttingPlans[stockType.id].totalWaste}mm</div>
              </div>
            </div>
            
            <!-- Regular stocks -->
            {#each cuttingPlans[stockType.id].stocks as stock, i (stock.id)}
              {#if stock}
                {@const pieceData = preparePiecesForVisualizer(stock)}
                <div class="stock-layout mb-6">
                  <h4 class="text-base p-2 bg-base-300 rounded-t-md mb-0 font-medium flex items-center">
                    <span class="badge badge-sm mr-2" style="background-color: {group.color}; color: {textColor};">
                      #{i+1}
                    </span>
                    Stock - {stock.length}mm
                  </h4>
                  
                  <div class="border border-base-300 border-t-0 rounded-b-md">
                    <WoodVisualizer
                      stockLength={stock.length}
                      pieces={pieceData.lengths}
                      margins={pieceData.margins}
                      kerf={stock.pieces[0]?.kerf || $stockSettings.defaultKerf}
                      unit="mm"
                    />
                  </div>
                </div>
              {/if}
            {/each}
            
            <!-- Oversized pieces (if any) -->
            {#if cuttingPlans[stockType.id].oversizedPieces.length > 0}
              <div class="oversized-pieces mt-4">
                <h4 class="text-base font-semibold mb-2">Oversized Pieces (require joining)</h4>
                
                {#each cuttingPlans[stockType.id].oversizedPieces as splitPiece, i}
                  <div class="split-piece mb-6 border border-base-300 rounded-lg">
                    <h5 class="text-sm p-2 bg-base-300 rounded-t-lg mb-0 font-medium flex items-center">
                      <span class="badge badge-sm mr-2" style="background-color: {group.color}; color: {textColor};">
                        Join #{i+1}
                      </span>
                      Total Length: {splitPiece.reduce((sum: number, p: OptimizedPiece) => sum + p.length, 0)}mm
                    </h5>
                    
                    <div class="p-3 bg-base-100">
                      <!-- Use WoodVisualizer for each part -->
                      {#each splitPiece as part, j}
                        <div class="mb-3 last:mb-0">
                          <div class="text-sm font-medium mb-1 flex justify-between">
                            <span>Part {j+1} of {splitPiece.length} - {part.length}mm</span>
                            <span class="text-base-content/60">Stock: {part.stockLength || part.length}mm</span>
                          </div>
                          
                          <div class="border border-base-200 rounded-md">
                            <WoodVisualizer
                              stockLength={part.stockLength || part.length}
                              pieces={[part.length]}
                              margins={[0]}
                              kerf={part.kerf}
                              unit="mm"
                            />
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>
