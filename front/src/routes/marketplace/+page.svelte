<script lang="ts">
  import ClubCard from '$lib/components/ClubCard.svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { clubs, clubMetrics, savedSearches } from '$lib/stores.svelte';
  import { createSavedSearch, deleteSavedSearch } from '$lib/store-operations';
  import type { Filters } from '$lib/types';

  let filters: Filters = $state({
    sport: '',
    location: '',
    budgetMin: 0,
    budgetMax: 5000000,
    query: '',
  });

  let showSaveModal = $state(false);
  let searchName = $state('');
  let toastMessage = $state('');
  let toastVisible = $state(false);
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

  function saveCurrentSearch() {
    if (!searchName.trim()) return;
    createSavedSearch(searchName, filters);
    showSaveModal = false;
    searchName = '';
    toastMessage = 'Búsqueda guardada correctamente';
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }

  function loadSearch(filtersJson: string) {
    filters = { ...filters, ...JSON.parse(filtersJson) };
    currentPage = 1;
  }

  function deleteSearch(id: number) {
    deleteSavedSearch(id);
  }
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Marketplace</h1>
      <p class="text-sm text-on-surface-variant mt-1">{filteredClubs.length} clubes encontrados</p>
    </div>
    <button
      onclick={() => showSaveModal = true}
      class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
      Guardar búsqueda
    </button>
  </div>

  <div class="grid lg:grid-cols-4 gap-8">
    <div class="lg:col-span-1 space-y-6">
      <FilterPanel {filters} onchange={handleFilterChange} />

      {#if savedSearches.length > 0}
        <div class="p-6 rounded-2xl bg-surface-container">
          <h3 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Búsquedas guardadas</h3>
          <div class="space-y-2">
            {#each savedSearches as search}
              <div class="flex items-center justify-between gap-2 p-3 rounded-lg bg-surface-high group">
                <button
                  onclick={() => loadSearch(search.filtersJson)}
                  class="text-sm text-on-surface-variant hover:text-on-surface transition-colors text-left truncate"
                >
                  {search.name}
                </button>
                <button
                  onclick={() => deleteSearch(search.id)}
                  class="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  aria-label="Eliminar búsqueda guardada"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="lg:col-span-3">
      <div class="grid sm:grid-cols-2 gap-4 mb-8">
        {#each paginatedClubs as club}
          <ClubCard {club} metrics={clubMetrics.get(club.id)} />
        {/each}
      </div>

      {#if filteredClubs.length === 0}
        <div class="text-center py-20">
          <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p class="text-lg font-semibold text-on-surface mb-1">Sin resultados</p>
          <p class="text-sm text-on-surface-variant">Prueba ajustando los filtros de búsqueda</p>
        </div>
      {/if}

      {#if totalPages > 1}
        <div class="flex items-center justify-center gap-2">
          <button
            onclick={() => currentPage = Math.max(1, currentPage - 1)}
            disabled={currentPage === 1}
            class="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
          >
            ← Anterior
          </button>
          {#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
            <button
              onclick={() => currentPage = p}
              class="w-9 h-9 rounded-lg text-sm font-medium transition-all {currentPage === p ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
            >
              {p}
            </button>
          {/each}
          <button
            onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
            disabled={currentPage === totalPages}
            class="px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface disabled:opacity-30 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

{#if showSaveModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showSaveModal = false} aria-label="Cerrar modal"></button>
    <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
      <h2 class="text-xl font-bold text-on-surface mb-2">Guardar búsqueda</h2>
      <p class="text-sm text-on-surface-variant mb-6">Nombra esta configuración de filtros para reutilizarla después.</p>
      <input
        bind:value={searchName}
        placeholder="Nombre de la búsqueda..."
        class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 mb-6"
      />
      <div class="flex gap-3 justify-end">
        <button
          onclick={() => showSaveModal = false}
          class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Cancelar
        </button>
        <button
          onclick={saveCurrentSearch}
          class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
        >
          Guardar
        </button>
      </div>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
