<script lang="ts">
  import type { Filters } from '$lib/types';

  interface Props {
    filters: Filters;
    onchange: (filters: Filters) => void;
  }

  let { filters, onchange }: Props = $props();

  const sports = ['Todos', 'Fútbol', 'Baloncesto', 'Pádel', 'Esports', 'Tenis', 'Natación', 'Surf', 'Triatlón', 'Atletismo', 'Rugby'];
  const locations = ['Todas', 'Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Vitoria', 'San Sebastián', 'Málaga', 'Murcia', 'Castellón', 'Valladolid', 'Zarautz'];

  function updateFilter(key: keyof Filters, value: string | number) {
    onchange({ ...filters, [key]: value });
  }
</script>

<div class="p-6 rounded-2xl bg-surface-container space-y-6">
  <div>
    <label for="search" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Buscar</label>
    <input
      id="search"
      type="text"
      value={filters.query}
      oninput={(e) => updateFilter('query', e.currentTarget.value)}
      placeholder="Nombre del club..."
      class="w-full px-4 py-2.5 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all"
    />
  </div>

  <div>
    <label for="sport" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Deporte</label>
    <select
      id="sport"
      value={filters.sport}
      onchange={(e) => updateFilter('sport', e.currentTarget.value)}
      class="w-full px-4 py-2.5 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all appearance-none"
    >
      {#each sports as sport}
        <option value={sport === 'Todos' ? '' : sport}>{sport}</option>
      {/each}
    </select>
  </div>

  <div>
    <label for="location" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Ubicación</label>
    <select
      id="location"
      value={filters.location}
      onchange={(e) => updateFilter('location', e.currentTarget.value)}
      class="w-full px-4 py-2.5 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 transition-all appearance-none"
    >
      {#each locations as loc}
        <option value={loc === 'Todas' ? '' : loc}>{loc}</option>
      {/each}
    </select>
  </div>

  <div>
    <label class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Presupuesto mínimo</label>
    <input
      type="range"
      min="0"
      max="1000000"
      step="10000"
      value={filters.budgetMin}
      oninput={(e) => updateFilter('budgetMin', Number(e.currentTarget.value))}
      class="w-full accent-primary-container"
    />
    <p class="text-xs text-on-surface-variant mt-1">€{filters.budgetMin.toLocaleString('es-ES')}</p>
  </div>

  <div>
    <label class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Presupuesto máximo</label>
    <input
      type="range"
      min="0"
      max="5000000"
      step="50000"
      value={filters.budgetMax}
      oninput={(e) => updateFilter('budgetMax', Number(e.currentTarget.value))}
      class="w-full accent-primary-container"
    />
    <p class="text-xs text-on-surface-variant mt-1">€{filters.budgetMax.toLocaleString('es-ES')}</p>
  </div>

  <button
    onclick={() => onchange({ sport: '', location: '', budgetMin: 0, budgetMax: 5000000, query: '' })}
    class="w-full py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors"
    style="border: 1px solid rgba(67, 70, 85, 0.15);"
  >
    Limpiar filtros
  </button>
</div>
