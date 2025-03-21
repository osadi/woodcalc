<script lang="ts">
  import { groups } from '$lib/stores/groups';
  import type { Piece } from '$lib/stores/groups';
  
  let { id, name, color, items }: { 
    id: string;
    name: string;
    color: string;
    items: Piece[];
  } = $props();
  
  // Explicitly annotate items to help TypeScript
  const itemsArray: Piece[] = items;
  
  let isEditing = $state(false);
  let editedName = $state(name);
  let isOpen = $state(true);
  
  $effect(() => {
    editedName = name;
  });
  
  function toggleEdit() {
    isEditing = !isEditing;
    if (isEditing) {
      editedName = name;
    }
  }
  
  function saveEdit() {
    if (editedName.trim() && editedName !== name) {
      groups.update(id, { name: editedName.trim() });
    }
    isEditing = false;
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      isEditing = false;
      editedName = name;
    }
  }
  
  function deleteGroup() {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      groups.remove(id);
    }
  }
  
  function toggleOpen() {
    isOpen = !isOpen;
  }

  // Enhanced function to remove a piece from the group
  function removePiece(pieceId: string, pieceName: string) {
    if (confirm(`Are you sure you want to remove this piece (${pieceName})?`)) {
      groups.removeItem(id, pieceId);
      
      // Show feedback
      const toast = document.getElementById("toast-feedback");
      if (toast) {
        toast.classList.remove("hidden");
        setTimeout(() => {
          toast.classList.add("hidden");
        }, 3000);
      }
    }
  }

  // Generate a piece display name
  function getPieceName(piece: Piece): string {
    return `${piece.length}mm ${piece.stockType.name} (×${piece.quantity})`;
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
  
  const textColor = getTextColor(color);

  // Add state for inline editing
  let editingField: { pieceId: string, field: 'kerf' | 'margin' } | null = $state(null);
  let editingValue = $state('');
  
  // Start editing a field
  function startEditing(pieceId: string, field: 'kerf' | 'margin', currentValue: number) {
    editingField = { pieceId, field };
    editingValue = currentValue.toString();
    
    // Focus the input after it's rendered
    setTimeout(() => {
      const input = document.getElementById(`edit-${field}-${pieceId}`);
      if (input) {
        input.focus();
      }
    }, 0);
  }
  
  // Cancel editing
  function cancelEditing() {
    editingField = null;
  }
  
  // Save edited value
  function saveEditedValue() {
    if (!editingField) return;
    
    const { pieceId, field } = editingField;
    const numValue = parseFloat(editingValue);
    
    if (isNaN(numValue) || numValue < 0) {
      // Invalid input, cancel editing
      editingField = null;
      return;
    }
    
    // Find the piece to update - using itemsArray instead of items
    const pieceIndex = itemsArray.findIndex(p => p.id === pieceId);
    if (pieceIndex === -1) {
      editingField = null;
      return;
    }
    
    // Create a copy of items array
    const updatedItems = [...itemsArray];
    
    // Update the specific field
    updatedItems[pieceIndex] = {
      ...updatedItems[pieceIndex],
      [field]: numValue
    };
    
    // Update the group
    groups.update(id, { items: updatedItems });
    
    // Reset editing state
    editingField = null;
  }
  
  // Handle keyboard events for the editing field
  function handleEditKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedValue();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  }
</script>

<div class="group-item w-full border rounded-md overflow-hidden" style="border-color: {color}">
  <div class="group-header flex items-center justify-between p-2" style="background-color: {color}">
    {#if isEditing}
      <input
        type="text"
        class="input input-sm input-bordered flex-1 bg-base-100 text-base-content"
        value={editedName}
        oninput={(e) => editedName = e.currentTarget.value}
        onblur={saveEdit}
        onkeydown={handleKeyDown}
        autofocus
      />
    {:else}
      <button 
        class="flex-1 text-left font-medium"
        onclick={toggleOpen}
        aria-expanded={isOpen}
        style="color: {textColor}"
      >
        {name}
      </button>
    {/if}
    
    <div class="flex gap-1">
      <button 
        class="btn btn-xs btn-ghost"
        onclick={toggleEdit}
        aria-label={isEditing ? "Cancel editing" : "Edit group name"}
        style="color: {textColor}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          {#if isEditing}
            <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
          {:else}
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
          {/if}
        </svg>
      </button>
      
      <button 
        class="btn btn-xs btn-ghost"
        onclick={deleteGroup}
        aria-label="Delete group"
        style="color: {textColor}"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
          <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
  
  {#if isOpen}
    <div class="group-content bg-base-100 p-2">
      {#if items.length === 0}
        <p class="text-sm text-base-content/60 text-center py-2">No pieces in this group yet.</p>
      {:else}
        <div class="overflow-x-auto">
          <table class="table table-xs w-full">
            <thead>
              <tr>
                <th>Stock</th>
                <th>Length</th>
                <th>Qty</th>
                <th>Kerf</th>
                <th>Margin</th>
                <th class="w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each items as piece (piece.id)}
                <tr class="hover:bg-base-200">
                  <td>{piece.stockType.name}</td>
                  <td>{piece.length}mm</td>
                  <td>{piece.quantity}</td>
                  <td ondblclick={() => startEditing(piece.id, 'kerf', piece.kerf || 0)}>
                    {#if editingField && editingField.pieceId === piece.id && editingField.field === 'kerf'}
                      <input 
                        id={`edit-kerf-${piece.id}`}
                        type="number" 
                        class="input input-xs input-bordered w-16"
                        value={editingValue}
                        min="0"
                        step="0.5"
                        onblur={saveEditedValue}
                        onkeydown={handleEditKeyDown}
                        oninput={(e) => editingValue = e.currentTarget.value}
                      />
                    {:else}
                      <span class="cursor-pointer hover:underline">{piece.kerf || 0}mm</span>
                    {/if}
                  </td>
                  <td ondblclick={() => startEditing(piece.id, 'margin', piece.margin || 0)}>
                    {#if editingField && editingField.pieceId === piece.id && editingField.field === 'margin'}
                      <input 
                        id={`edit-margin-${piece.id}`}
                        type="number" 
                        class="input input-xs input-bordered w-16"
                        value={editingValue}
                        min="0"
                        step="1"
                        onblur={saveEditedValue}
                        onkeydown={handleEditKeyDown}
                        oninput={(e) => editingValue = e.currentTarget.value}
                      />
                    {:else}
                      <span class="cursor-pointer hover:underline">{piece.margin || 0}mm</span>
                    {/if}
                  </td>
                  <td>
                    <div class="flex gap-1">
                      <button 
                        class="btn btn-ghost btn-xs text-error tooltip" 
                        data-tip="Remove"
                        onclick={() => removePiece(piece.id, getPieceName(piece))}
                        aria-label="Remove piece"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      
      <!-- Removed the "Add Item" placeholder button -->
    </div>
  {/if}
</div>

<!-- Toast notification -->
<div id="toast-feedback" class="toast toast-end hidden">
  <div class="alert alert-success">
    <span>Piece removed successfully!</span>
  </div>
</div>
