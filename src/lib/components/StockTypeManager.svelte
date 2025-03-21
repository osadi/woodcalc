<script lang="ts">
  import { stockTypes } from '$lib/stores/stockTypes';
  
  let newName = $state('');
  let newWidth = $state(45);
  let newHeight = $state(45);
  let showAddForm = $state(false);
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (newName.trim() && newWidth > 0 && newHeight > 0) {
      stockTypes.add(newName.trim(), newWidth, newHeight);
      // Reset form
      newName = '';
      newWidth = 45;
      newHeight = 45;
      showAddForm = false;
    }
  }
  
  function toggleAddForm() {
    showAddForm = !showAddForm;
  }
  
  function handleRemove(id: string) {
    stockTypes.remove(id);
  }
  
  function handleReset() {
    if (confirm('This will remove all custom stock types. Are you sure?')) {
      stockTypes.reset();
    }
  }
</script>

<div class="stock-type-manager">
  <!-- Display existing stock types -->
  <div class="overflow-x-auto mb-2">
    <table class="table table-xs table-compact w-full">
      <thead>
        <tr>
          <th>Name</th>
          <th>Width</th>
          <th>Height</th>
          <th class="w-10"></th>
        </tr>
      </thead>
      <tbody>
        {#each $stockTypes as type (type.id)}
          <tr class={type.isDefault ? 'bg-base-200' : ''}>
            <td>{type.name}</td>
            <td>{type.width} mm</td>
            <td>{type.height} mm</td>
            <td>
              {#if !type.isDefault}
                <button 
                  class="btn btn-ghost btn-xs text-error"
                  onclick={() => handleRemove(type.id)}
                  aria-label="Remove stock type"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  
  <!-- Add custom stock type button and form -->
  {#if !showAddForm}
    <button 
      class="btn btn-sm btn-primary w-full mb-2" 
      onclick={toggleAddForm}
    >
      Add Custom Stock Type
    </button>
  {:else}
    <form onsubmit={handleSubmit} class="card bg-base-100 shadow-sm p-2 mb-2">
      <div class="form-control mb-2">
        <label class="label py-0" for="stock-type-name">
          <span class="label-text">Name</span>
        </label>
        <input 
          id="stock-type-name"
          type="text" 
          class="input input-bordered input-sm w-full" 
          placeholder="e.g. 70×95"
          value={newName}
          oninput={(e) => newName = e.currentTarget.value}
          required
        />
      </div>
      
      <div class="grid grid-cols-2 gap-2">
        <div class="form-control">
          <label class="label py-0" for="stock-type-width">
            <span class="label-text">Width (mm)</span>
          </label>
          <input 
            id="stock-type-width"
            type="number" 
            class="input input-bordered input-sm w-full" 
            value={newWidth}
            min="1"
            oninput={(e) => newWidth = parseInt(e.currentTarget.value)}
            required
          />
        </div>
        
        <div class="form-control">
          <label class="label py-0" for="stock-type-height">
            <span class="label-text">Height (mm)</span>
          </label>
          <input 
            id="stock-type-height"
            type="number" 
            class="input input-bordered input-sm w-full" 
            value={newHeight}
            min="1"
            oninput={(e) => newHeight = parseInt(e.currentTarget.value)}
            required
          />
        </div>
      </div>
      
      <div class="flex justify-between mt-2">
        <button 
          type="button"
          class="btn btn-sm btn-ghost" 
          onclick={toggleAddForm}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          class="btn btn-sm btn-primary"
        >
          Add
        </button>
      </div>
    </form>
  {/if}
  
  <!-- Reset button -->
  <button 
    class="btn btn-sm btn-outline btn-error w-full" 
    onclick={handleReset}
  >
    Reset to Default Types
  </button>
</div>
