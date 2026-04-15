<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { appState } from '$lib/stores.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <title>SponsorMatch</title>
</svelte:head>

<div class="min-h-screen bg-base">
  <Sidebar />
  <main
    class="transition-all duration-300 min-h-screen"
    class:ml-64={!appState.sidebarCollapsed}
    class:ml-20={appState.sidebarCollapsed}
  >
    {@render children()}
  </main>
</div>
