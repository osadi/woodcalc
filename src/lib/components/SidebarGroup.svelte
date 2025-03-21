<script lang="ts">
  let { title, collapsible, initiallyOpen, children }: {
    title?: string;
    collapsible?: boolean;
    initiallyOpen?: boolean;
    children: any;
  } = $props();
  
  let isOpen = $state(initiallyOpen);
  
  function toggle() {
    if (collapsible) {
      isOpen = !isOpen;
    }
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    if (collapsible && e.key === 'Enter') {
      toggle();
    }
  }
</script>

<div class="sidebar-group w-full">
  <!-- Group header -->
  {#if title}
    {#if collapsible}
      <button 
        type="button"
        class="flex items-center justify-between w-full px-3 py-2 cursor-pointer bg-base-300"
        onclick={toggle}
        onkeydown={handleKeyDown}
        aria-expanded={isOpen}
      >
        <h3 class="text-sm font-semibold">{title}</h3>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
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
    {:else}
      <div class="px-3 py-2 w-full">
        <h3 class="text-sm font-semibold">{title}</h3>
      </div>
    {/if}
  {/if}
  
  <!-- Group content with optional collapse - removing max height constraint -->
  <div class={`
    transition-all duration-300 overflow-hidden w-full
    ${!isOpen ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'}
  `}>
    <div class={`w-full ${collapsible ? 'bg-base-100 p-2 border-b border-base-300' : ''}`}>
      {@render children()}
    </div>
  </div>
</div>
