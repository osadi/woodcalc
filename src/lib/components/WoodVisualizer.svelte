<script lang="ts">
  // First, extract the possibly undefined values
  let { 
    stockLength: initialStockLength, 
    pieces: initialPieces, 
    margins: initialMargins, 
    kerf: initialKerf, 
    unit: initialUnit 
  }: {
    stockLength?: number;
    pieces?: number[];
    margins?: number[];
    kerf?: number;
    unit?: string;
  } = $props();

  // Then create new variables with definite types
  let stockLength: number = initialStockLength || 1000;
  let pieces: number[] = initialPieces || [250, 300, 200];
  let margins: number[] = initialMargins || [10, 10, 10];
  let kerf: number = initialKerf || 3;
  let unit: string = initialUnit || "mm";
  
  // Calculate total used length including kerfs and margins
  const usedLength = pieces.reduce((acc, piece, index) => {
    // Add margin between pieces (except after the last)
    const marginToAdd = index < pieces.length - 1 ? margins[index] : 0;
    // Add kerf after every piece including the last one
    return acc + piece + kerf + marginToAdd;
  }, 0);
  
  // Calculate waste
  const waste = Math.max(0, stockLength - usedLength);
  
  // Calculate waste percentage
  const wastePercentage = (waste / stockLength) * 100;
  
  // Helper to calculate position and width percentage
  function getPercentage(value: number) {
    return (value / stockLength) * 100;
  }
</script>

<div class="wood-visualizer my-6">
  <!-- Standard length measurement header spanning full width -->
  <div class="flex items-center mb-1">
    <div class="text-sm font-medium mr-1">|</div>
    <div class="flex-1 border-t border-base-content"></div>
    <div class="text-sm font-medium mx-1">Stock: {stockLength}{unit}</div>
    <div class="flex-1 border-t border-base-content"></div>
    <div class="text-sm font-medium ml-1">|</div>
  </div>
  
  <!-- Stock and waste info - moved waste info only -->
  <div class="flex justify-end mb-2">
    <span class="text-sm text-error font-medium">
      Waste: {waste}{unit} ({wastePercentage.toFixed(1)}%)
    </span>
  </div>
  
  <!-- Visual representation with extended kerfs and margins -->
  <div class="relative">
    <!-- Main visualization container with extra padding to accommodate extensions -->
    <div class="relative pt-6 pb-6">
      <!-- Main wood visualization -->
      <div class="relative h-16 bg-amber-800 rounded overflow-visible shadow-md">
        <!-- Render each piece, kerf, and margin -->
        {#each pieces as piece, i}
          {@const prevPiecesLength = pieces.slice(0, i).reduce((acc, p, idx) => {
            const prevKerf = kerf; // Always add kerf
            const prevMargin = idx < i ? margins[idx] : 0;
            return acc + p + prevKerf + prevMargin;
          }, 0)}
          
          {@const posPercentage = getPercentage(prevPiecesLength)}
          {@const widthPercentage = getPercentage(piece)}
          
          <!-- Individual wood piece -->
          <div 
            class="absolute top-0 bottom-0 bg-amber-600 border-r border-amber-900"
            style="left: {posPercentage}%; width: {widthPercentage}%;"
          >
            <div class="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
              {piece}{unit}
            </div>
          </div>
          
          <!-- Kerf after every piece, including the last one - now with higher contrast -->
          {@const kerfPos = getPercentage(prevPiecesLength + piece)}
          {@const kerfWidth = getPercentage(kerf)}
          
          <div 
            class="absolute bottom-0 bg-base-content border border-base-content/80 border-dashed"
            style="left: {kerfPos}%; width: {kerfWidth}%; height: 120%; bottom: 0; top: -20%;"
          >
            <!-- Kerf label above the extension -->
            <div class="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-base-content whitespace-nowrap bg-base-100 px-1 rounded-sm">
              {kerf}{unit}
            </div>
          </div>
          
          <!-- Margin between pieces (except after the last) -->
          {#if i < pieces.length - 1}
            {@const marginPos = getPercentage(prevPiecesLength + piece + kerf)}
            {@const marginWidth = getPercentage(margins[i])}
            
            <div 
              class="absolute top-0 bg-secondary border border-secondary/80 border-dashed"
              style="left: {marginPos}%; width: {marginWidth}%; height: 120%; top: 0; bottom: -20%;"
            >
              <!-- Margin label below the extension -->
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-secondary whitespace-nowrap bg-base-100 px-1 rounded-sm">
                {margins[i]}{unit}
              </div>
            </div>
          {/if}
        {/each}
        
        <!-- Waste section -->
        {#if waste > 0}
          {@const wastePos = getPercentage(usedLength)}
          {@const wasteWidth = getPercentage(waste)}
          
          <div 
            class="absolute top-0 bottom-0 bg-error"
            style="left: {wastePos}%; width: {wasteWidth}%;"
          >
            <div class="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
              {#if wasteWidth > 5}Waste: {waste}{unit}{/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Legend - showing more accurate margin info -->
  <div class="flex flex-wrap gap-x-4 mt-3 text-xs">
    <div class="flex items-center">
      <span class="inline-block w-3 h-3 bg-base-content mr-1 border border-base-content/80"></span>
      <span>Kerf (saw cut): {kerf}{unit}</span>
    </div>
    <div class="flex items-center">
      <span class="inline-block w-3 h-3 bg-secondary mr-1 border border-secondary/80"></span>
      <span>Margin (between pieces): {margins[0]}{unit}</span>
    </div>
  </div>
</div>
