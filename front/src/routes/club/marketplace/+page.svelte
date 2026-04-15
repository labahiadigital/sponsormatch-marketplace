<script lang="ts">
  import ClubCard from '$lib/components/ClubCard.svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import { clubs, clubMetrics } from '$lib/stores.svelte';
  import type { Filters } from '$lib/types';

  let filters: Filters = $state({ sport: '', location: '', budgetMin: 0, budgetMax: 5000000, query: '' });
  let currentPage = $state(1);
  const pageSize = 8;

  const filteredClubs = $derived(
    clubs.filter((club) => {
      if (filters.sport && club.sport !== filters.sport) return false;
      if (filters.location && club.location !== filters.location) return false;
      if (club.budgetMax < filters.budgetMin) return false;
      if (club.budgetMin > filters.budgetMax) return false;
      if (filters.query && !club.name.toLowerCase().includes(filters.query.toLowerCase())) return false;
      return true;
    })
  );

  const totalPages = $derived(Math.ceil(filteredClubs.length / pageSize));
  const paginatedClubs = $derived(filteredClubs.slice((currentPage - 1) * pageSize, currentPage * pageSize));

  function handleFilterChange(newFilters: Filters) {
    filters = newFilters;
    currentPage = 1;
  }
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Marketplace</h1>
    <p class="text-sm text-on-surface-variant mt-1">Explora otros clubes y sus métricas</p>
  </div>

  <div class="grid lg:grid-cols-4 gap-8">
    <div class="lg:col-span-1">
      <FilterPanel {filters} onchange={handleFilterChange} />
    </div>
    <div class="lg:col-span-3">
      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        {#each paginatedClubs as club}
          <ClubCard {club} metrics={clubMetrics.get(club.id)} />
        {/each}
      </div>
      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-2">
          <button onclick={() => currentPage = Math.max(1, currentPage - 1)} disabled={currentPage === 1} class="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors">← Anterior</button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
            <button onclick={() => currentPage = p} class="w-9 h-9 rounded-lg text-sm font-medium transition-all {currentPage === p ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}">{p}</button>
          {/each}
          <button onclick={() => currentPage = Math.min(totalPages, currentPage + 1)} disabled={currentPage === totalPages} class="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors">Siguiente →</button>
        </div>
      {/if}
    </div>
  </div>
</div>
