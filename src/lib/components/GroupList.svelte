<script lang="ts">
  import { groups } from '$lib/stores/groups';
  import { slide } from 'svelte/transition';
  import GroupItem from '$lib/components/GroupItem.svelte';
  
  // Remove the unused children prop
</script>

<div class="group-list w-full">
  {#if $groups.length === 0}
    <div class="text-center p-4 text-base-content/60">
      No groups yet. Create one above.
    </div>
  {:else}
    <div class="space-y-2 w-full">
      {#each $groups as group (group.id)}
        <div transition:slide={{ duration: 200 }} class="w-full">
          <GroupItem id={group.id} name={group.name} color={group.color} items={group.items} />
        </div>
      {/each}
    </div>
  {/if}
</div>
