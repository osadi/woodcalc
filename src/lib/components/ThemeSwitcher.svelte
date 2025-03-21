<script lang="ts">
  import { theme, themes, setTheme } from '$lib/stores/theme';
  
  function handleChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    setTheme(select.value);
  }
</script>

<div class="theme-switcher">
  <select 
    class="select select-bordered select-sm w-full" 
    value={$theme} 
    on:change={handleChange}
  >
    {#each themes as t}
      <option value={t.value}>{t.name}</option>
    {/each}
  </select>
</div>
