<script lang="ts">
  import { stockTypes } from '$lib/stores/stockTypes';
  import { groups } from '$lib/stores/groups';
  import { stockSettings } from '$lib/stores/stockSettings';
  
  // Local state for form inputs
  let pieceLength = $state(1000);
  let selectedStockTypeId = $state($stockTypes[0]?.id || '');
  let selectedGroupId = $state($groups.length > 0 ? $groups[0].id : '');
  let quantity = $state(1);
  let kerf = $state($stockSettings.defaultKerf);
  let margin = $state(0);
  
  // Custom stock type input fields
  let isAddingCustomType = $state(false);
  let customStockWidth = $state(45);
  let customStockHeight = $state(45);
  let customStockName = $state('');
  
  // Helper function to generate stock type name from dimensions
  function generateStockName(width: number, height: number): string {
    return `${width}×${height}`;
  }
  
  // Toggle custom stock type inputs
  function toggleCustomStockTypeInputs(value: boolean) {
    isAddingCustomType = value;
    if (value) {
      customStockName = generateStockName(customStockWidth, customStockHeight);
    }
  }
  
  // Handle stock type selection change
  function handleStockTypeChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const value = select.value;
    
    if (value === 'add-custom') {
      toggleCustomStockTypeInputs(true);
    } else {
      selectedStockTypeId = value;
      toggleCustomStockTypeInputs(false);
    }
  }
  
  // Add custom stock type
  function addCustomStockType() {
    if (!customStockName.trim() || customStockWidth <= 0 || customStockHeight <= 0) {
      return;
    }
    
    // Add the custom stock type
    stockTypes.add(customStockName.trim(), customStockWidth, customStockHeight);
    
    // Set the selected stock type to the newly created one
    // We need to wait for the store to update, so we do this in the next tick
    setTimeout(() => {
      const newType = $stockTypes.find(t => 
        t.width === customStockWidth && 
        t.height === customStockHeight && 
        t.name === customStockName.trim()
      );
      
      if (newType) {
        selectedStockTypeId = newType.id;
        toggleCustomStockTypeInputs(false);
      }
    }, 0);
  }
  
  // Auto-update custom stock name when dimensions change
  $effect(() => {
    if (isAddingCustomType) {
      customStockName = generateStockName(customStockWidth, customStockHeight);
    }
  });
  
  // Sync kerf with global setting changes
  $effect(() => {
    kerf = $stockSettings.defaultKerf;
  });
  
  // Form submission handler
  function handleSubmit(e: Event) {
    e.preventDefault();
    
    // Handle custom stock type creation if needed
    if (isAddingCustomType) {
      addCustomStockType();
      return; // We'll submit the form after the stock type is created and selected
    }
    
    // Get the selected stock type object
    const selectedType = $stockTypes.find(type => type.id === selectedStockTypeId);
    
    if (!selectedType) {
      console.error('No stock type selected');
      return;
    }
    
    if (!selectedGroupId) {
      alert('Please select or create a group first');
      return;
    }
    
    // Create the new piece data
    const pieceData = {
      id: crypto.randomUUID(),
      length: pieceLength,
      stockType: selectedType,
      quantity: quantity,
      kerf: kerf,
      margin: margin,
      createdAt: Date.now()
    };
    
    // Add the piece to the selected group
    groups.addItem(selectedGroupId, pieceData);
  }
  
  // Check if we need to create a group first
  $effect(() => {
    if ($groups.length > 0 && !selectedGroupId) {
      selectedGroupId = $groups[0].id;
    }
  });
</script>

<form class="piece-input space-y-3" onsubmit={handleSubmit}>
  <!-- Stock type selection - moved to top -->
  <div class="form-control">
    <label class="label py-1" for="stock-type">
      <span class="label-text">Stock Type</span>
    </label>
    <select 
      id="stock-type"
      class="select select-bordered select-sm w-full" 
      value={selectedStockTypeId}
      onchange={handleStockTypeChange}
      required
    >
      {#each $stockTypes as type (type.id)}
        <option value={type.id}>{type.name} ({type.width}×{type.height}mm)</option>
      {/each}
      <option value="add-custom">Add custom...</option>
    </select>
  </div>

  <!-- Custom stock type inputs (conditionally displayed) -->
  {#if isAddingCustomType}
    <div class="custom-stock-type-inputs bg-base-200 p-3 rounded-lg">
      <div class="form-control mb-2">
        <label class="label py-1" for="custom-stock-name">
          <span class="label-text">Name</span>
        </label>
        <input 
          id="custom-stock-name"
          type="text" 
          class="input input-bordered input-sm w-full" 
          value={customStockName}
          oninput={(e) => customStockName = e.currentTarget.value}
          required
        />
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div class="form-control">
          <label class="label py-1" for="custom-stock-width">
            <span class="label-text">Width (mm)</span>
          </label>
          <input 
            id="custom-stock-width"
            type="number" 
            class="input input-bordered input-sm w-full" 
            value={customStockWidth}
            min="1"
            oninput={(e) => customStockWidth = parseInt(e.currentTarget.value)}
            required
          />
        </div>
        
        <div class="form-control">
          <label class="label py-1" for="custom-stock-height">
            <span class="label-text">Height (mm)</span>
          </label>
          <input 
            id="custom-stock-height"
            type="number" 
            class="input input-bordered input-sm w-full" 
            value={customStockHeight}
            min="1"
            oninput={(e) => customStockHeight = parseInt(e.currentTarget.value)}
            required
          />
        </div>
      </div>
      
      <div class="flex justify-between mt-2">
        <button 
          type="button"
          class="btn btn-sm btn-ghost" 
          onclick={() => toggleCustomStockTypeInputs(false)}
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="btn btn-sm btn-primary"
          onclick={addCustomStockType}
        >
          Add Stock Type
        </button>
      </div>
    </div>
  {/if}

  <!-- Length input -->
  <div class="form-control">
    <label class="label py-1" for="piece-length">
      <span class="label-text">Length (mm)</span>
    </label>
    <input 
      id="piece-length"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={pieceLength}
      min="1"
      step="1"
      oninput={(e) => pieceLength = parseInt(e.currentTarget.value)}
      required
    />
  </div>
  
  <!-- Quantity input -->
  <div class="form-control">
    <label class="label py-1" for="piece-quantity">
      <span class="label-text">Quantity</span>
    </label>
    <input 
      id="piece-quantity"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={quantity}
      min="1"
      step="1"
      oninput={(e) => quantity = Math.max(1, parseInt(e.currentTarget.value))}
      required
    />
  </div>
  
  <!-- Kerf and margin inputs -->
  <div class="grid grid-cols-2 gap-2">
    <div class="form-control">
      <label class="label py-1" for="piece-kerf">
        <span class="label-text">Kerf ({$stockSettings.unit})</span>
      </label>
      <input 
        id="piece-kerf"
        type="number" 
        class="input input-bordered input-sm w-full" 
        value={kerf}
        min="0"
        step="0.5"
        oninput={(e) => kerf = Math.max(0, parseFloat(e.currentTarget.value))}
      />
    </div>
    
    <div class="form-control">
      <label class="label py-1" for="piece-margin">
        <span class="label-text">Margin ({$stockSettings.unit})</span>
      </label>
      <input 
        id="piece-margin"
        type="number" 
        class="input input-bordered input-sm w-full" 
        value={margin}
        min="0"
        step="1"
        oninput={(e) => margin = Math.max(0, parseFloat(e.currentTarget.value))}
      />
    </div>
  </div>
  
  <!-- Group selection -->
  <div class="form-control">
    <label class="label py-1" for="group-select">
      <span class="label-text">Add to Group</span>
    </label>
    {#if $groups.length === 0}
      <div class="text-sm text-warning mb-2">Please create a group first</div>
    {:else}
      <select 
        id="group-select"
        class="select select-bordered select-sm w-full" 
        value={selectedGroupId}
        onchange={(e) => selectedGroupId = e.currentTarget.value}
        required
      >
        {#each $groups as group (group.id)}
          <option value={group.id}>{group.name}</option>
        {/each}
      </select>
    {/if}
  </div>
  
  <!-- Submit button -->
  <button 
    type="submit" 
    class="btn btn-sm btn-primary w-full"
    disabled={$groups.length === 0 || isAddingCustomType}
  >
    Add Piece to Group
  </button>
</form>
