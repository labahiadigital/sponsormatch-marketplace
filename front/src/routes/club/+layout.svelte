<script lang="ts">
  import '../../app.css';
  import ClubSidebar from '$lib/components/ClubSidebar.svelte';
  import { appState } from '$lib/stores.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen bg-base">
  <ClubSidebar />
  <main
    class="transition-all duration-300 min-h-screen"
    class:ml-64={!appState.sidebarCollapsed}
    class:ml-20={appState.sidebarCollapsed}
  >
    {@render children()}
  </main>
</div>
