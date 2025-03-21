<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { serializeState, deserializeState, applyDeserializedState, stateProcessed } from '$lib/utils/shareState';

  let shareUrl = $state('');
  let copied = $state(false);
  let showShareDialog = $state(false);
  
  // Generate the share URL
  function generateShareUrl() {
    if (!browser) return '';
    
    const serialized = serializeState();
    const url = new URL(window.location.href);
    url.search = `?state=${serialized}`;
    
    return url.toString();
  }
  
  function toggleShareDialog() {
    showShareDialog = !showShareDialog;
    if (showShareDialog) {
      shareUrl = generateShareUrl();
      copied = false;
    }
  }
  
  function copyToClipboard() {
    if (!browser || !shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        copied = true;
        setTimeout(() => {
          copied = false;
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy URL: ', err);
      });
  }
  
  // Function to close dialog when clicking outside
  function handleClickOutside(e: MouseEvent) {
    if (showShareDialog && e.target && !e.defaultPrevented) {
      const target = e.target as HTMLElement;
      if (!target.closest('.share-dialog') && !target.closest('.share-button')) {
        showShareDialog = false;
      }
    }
  }
  
  // Check for state parameter when component mounts
  onMount(() => {
    if (browser) {
      // Add click outside handler
      document.addEventListener('click', handleClickOutside);
      
      // Check if we have a state to load AND it hasn't been processed yet
      if ($page.url.searchParams.has('state') && !$stateProcessed) {
        // Mark state as processed globally to prevent double handling
        stateProcessed.set(true);
        
        const serialized = $page.url.searchParams.get('state') || '';
        const state = deserializeState(serialized);
        
        if (state) {
          // Ask user if they want to load the shared state
          if (confirm('Do you want to load the shared cutting plan?')) {
            applyDeserializedState(state);
          }
          
          // Remove state from URL to avoid accidental reloads
          const url = new URL(window.location.href);
          url.searchParams.delete('state');
          window.history.replaceState({}, '', url.toString());
        }
      }
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<div class="share-button-wrapper relative">
  <button 
    class="btn btn-primary btn-sm share-button"
    onclick={toggleShareDialog}
    aria-label="Share"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
      <polyline points="16 6 12 2 8 6"></polyline>
      <line x1="12" y1="2" x2="12" y2="15"></line>
    </svg>
    Share
  </button>
  
  {#if showShareDialog}
    <div class="share-dialog card absolute right-0 top-full mt-2 p-4 bg-base-100 shadow-lg z-50 w-80">
      <h3 class="text-lg font-semibold mb-2">Share your cutting plan</h3>
      <p class="text-sm mb-3">Copy this link to share your current cutting plan:</p>
      
      <div class="flex gap-2 mb-3">
        <input
          type="text"
          readonly
          value={shareUrl}
          class="input input-bordered input-sm flex-1"
          onclick={(e) => e.currentTarget.select()}
        />
        <button 
          class="btn btn-sm" 
          onclick={copyToClipboard}
          aria-label="Copy URL"
        >
          {#if copied}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-success">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          {/if}
        </button>
      </div>
      
      <div class="text-xs text-base-content/70">
        <p>This link includes all your groups, pieces, and settings.</p>
      </div>
      
      <div class="flex justify-end mt-3">
        <button 
          class="btn btn-sm btn-ghost" 
          onclick={toggleShareDialog}
        >
          Close
        </button>
      </div>
    </div>
  {/if}
</div>
