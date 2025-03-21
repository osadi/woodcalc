<script lang="ts">
  import { stockSettings } from '$lib/stores/stockSettings';
  
  // Local state to handle form values
  let minLength = $state($stockSettings.minLength);
  let maxLength = $state($stockSettings.maxLength);
  let increment = $state($stockSettings.increment);
  let defaultKerf = $state($stockSettings.defaultKerf);
  
  // Update store when values change
  function handleMinChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(value) && value > 0) {
      minLength = value;
      stockSettings.update({ minLength });
    }
  }
  
  function handleMaxChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(value) && value >= minLength) {
      maxLength = value;
      stockSettings.update({ maxLength });
    }
  }
  
  function handleIncrementChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(value) && value > 0) {
      increment = value;
      stockSettings.update({ increment });
    }
  }
  
  function handleKerfChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (!isNaN(value) && value >= 0) {
      defaultKerf = value;
      stockSettings.update({ defaultKerf });
    }
  }
  
  function handleReset() {
    stockSettings.reset();
    minLength = $stockSettings.minLength;
    maxLength = $stockSettings.maxLength;
    increment = $stockSettings.increment;
  }
</script>

<div class="stock-settings space-y-2">
  <div class="form-control">
    <label class="label" for="min-stock-length">
      <span class="label-text">Minimum Stock Length ({$stockSettings.unit})</span>
    </label>
    <input 
      id="min-stock-length"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={minLength}
      min="100"
      step="100"
      onchange={handleMinChange}
    />
  </div>
  
  <div class="form-control">
    <label class="label" for="max-stock-length">
      <span class="label-text">Maximum Stock Length ({$stockSettings.unit})</span>
    </label>
    <input 
      id="max-stock-length"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={maxLength}
      min={minLength}
      step="100"
      onchange={handleMaxChange}
    />
  </div>
  
  <div class="form-control">
    <label class="label" for="stock-length-increment">
      <span class="label-text">Length Increments ({$stockSettings.unit})</span>
    </label>
    <input 
      id="stock-length-increment"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={increment}
      min="1"
      step="10"
      onchange={handleIncrementChange}
    />
  </div>
  
  <!-- Default kerf setting -->
  <div class="form-control">
    <label class="label" for="default-kerf">
      <span class="label-text">Default Kerf ({$stockSettings.unit})</span>
    </label>
    <input 
      id="default-kerf"
      type="number" 
      class="input input-bordered input-sm w-full" 
      value={defaultKerf}
      min="0"
      step="0.5"
      onchange={handleKerfChange}
    />
  </div>
  
  <div class="form-control mt-2">
    <button 
      class="btn btn-sm btn-outline" 
      onclick={handleReset}
    >
      Reset to Defaults
    </button>
  </div>
  
  <div class="text-xs text-base-content/70 mt-1">
    Available lengths: {minLength} to {maxLength} in steps of {increment}{$stockSettings.unit}
    <br>Default kerf: {defaultKerf}{$stockSettings.unit}
  </div>
</div>
