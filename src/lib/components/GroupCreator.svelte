<script lang="ts">
  import { groups } from '$lib/stores/groups';
  
  let newGroupName = $state('');
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (newGroupName.trim()) {
      groups.add(newGroupName.trim());
      newGroupName = '';
    }
  }
</script>

<form onsubmit={handleSubmit} class="flex items-center gap-2 w-full">
  <input
    type="text"
    placeholder="New group name"
    class="input input-sm input-bordered flex-1"
    value={newGroupName}
    oninput={(e) => newGroupName = e.currentTarget.value}
  />
  <button 
    type="submit" 
    class="btn btn-sm btn-primary"
    disabled={!newGroupName.trim()}
  >
    Add
  </button>
</form>
