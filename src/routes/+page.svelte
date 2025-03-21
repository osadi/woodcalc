<script lang="ts">
  import { groups } from '$lib/stores/groups';
  import GroupCuttingPlan from '$lib/components/GroupCuttingPlan.svelte';
</script>

<h1 class="text-2xl font-bold mb-4">Wood Cutting Optimizer</h1>

<p class="mb-6">
  This tool helps you visualize how to efficiently cut wood pieces from stock with minimal waste.
</p>

{#if $groups.length === 0}
  <div class="card bg-base-200 shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">Get Started</h2>
    <p>Start by creating a group and adding pieces to it from the sidebar.</p>
    <p class="mt-2">Each group will have its own cutting plan optimized to minimize waste.</p>
  </div>
{:else}
  {#each $groups as group (group.id)}
    <GroupCuttingPlan group={group} />
  {/each}
{/if}

<div class="mt-8 prose">
  <h2>How The Cutting Optimizer Works</h2>
  <p>
    The optimizer uses a bin packing algorithm with the first-fit decreasing heuristic:
  </p>
  <ul>
    <li>Pieces are sorted by length (longest first)</li>
    <li>Each piece is placed in the first stock that can fit it</li>
    <li>Kerfs (saw width) and margins (error buffer) are considered in the layout</li>
    <li>Pieces that are larger than the maximum stock length are automatically split into joinable parts</li>
    <li>Only pieces of the same stock type can be optimized together</li>
    <li>Perfect fits are allowed without margins for the last piece in a stock</li>
  </ul>
  
  <p class="mt-4">
    To improve your cutting plan:
  </p>
  <ul>
    <li>Group related pieces together</li>
    <li>Adjust the kerf based on your saw blade width</li>
    <li>Consider adding margins for cutting error if needed</li>
    <li>Try different stock lengths in the settings</li>
  </ul>
</div>
