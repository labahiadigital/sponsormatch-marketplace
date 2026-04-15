<script lang="ts">
  import DealCard from '$lib/components/DealCard.svelte';
  import { deals, clubs } from '$lib/stores.svelte';

  let filterStatus = $state('todos');

  const statusOptions = ['todos', 'pendiente', 'aceptado', 'rechazado', 'cancelado'];

  const filteredDeals = $derived(
    filterStatus === 'todos'
      ? deals
      : deals.filter(d => d.status === filterStatus)
  );

  function getClub(clubId: number) {
    return clubs.find(c => c.id === clubId);
  }

  const totalValue = $derived(deals.filter(d => d.status === 'aceptado').reduce((s, d) => s + d.amount, 0));
  const pendingCount = $derived(deals.filter(d => d.status === 'pendiente').length);
  const acceptedCount = $derived(deals.filter(d => d.status === 'aceptado').length);
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Gestión de Acuerdos</h1>
    <p class="text-sm text-on-surface-variant mt-1">Administra tus propuestas y acuerdos de patrocinio</p>
  </div>

  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Total acuerdos</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">{deals.length}</p>
    </div>
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Pendientes / Aceptados</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">
        <span class="text-warning">{pendingCount}</span>
        <span class="text-outline mx-1">/</span>
        <span class="text-success">{acceptedCount}</span>
      </p>
    </div>
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Valor acuerdos activos</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">
        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalValue)}
      </p>
    </div>
  </div>

  <div class="flex items-center gap-2 mb-6">
    {#each statusOptions as status}
      <button
        onclick={() => filterStatus = status}
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all {
          filterStatus === status
            ? 'bg-primary-container text-white'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
        }"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    {#each filteredDeals as deal}
      <DealCard {deal} club={getClub(deal.clubId)} />
    {/each}
  </div>

  {#if filteredDeals.length === 0}
    <div class="text-center py-20">
      <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
      <p class="text-lg font-semibold text-on-surface mb-1">Sin acuerdos</p>
      <p class="text-sm text-on-surface-variant">
        {filterStatus === 'todos' ? 'No tienes acuerdos aún. Explora el marketplace para empezar.' : `No hay acuerdos con estado "${filterStatus}".`}
      </p>
    </div>
  {/if}
</div>
