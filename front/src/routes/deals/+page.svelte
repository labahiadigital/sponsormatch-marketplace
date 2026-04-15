<script lang="ts">
  import DealCard from '$lib/components/DealCard.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { deals, clubs } from '$lib/stores.svelte';
  import { updateDealStatus, updateDeal, deleteDeal, createDeal } from '$lib/store-operations';
  import { formatCurrency } from '$lib/utils';

  let filterStatus = $state('todos');
  let showCreateModal = $state(false);
  let editingDealId = $state<number | null>(null);
  let toastMessage = $state('');
  let toastVisible = $state(false);

  let formTitle = $state('');
  let formDescription = $state('');
  let formAmount = $state(50000);
  let formClubId = $state(1);
  let formStartDate = $state('2026-07-01');
  let formEndDate = $state('2027-06-30');

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

  function openCreate() {
    editingDealId = null;
    formTitle = '';
    formDescription = '';
    formAmount = 50000;
    formClubId = clubs[0]?.id ?? 1;
    formStartDate = '2026-07-01';
    formEndDate = '2027-06-30';
    showCreateModal = true;
  }

  function openEdit(dealId: number) {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;
    editingDealId = dealId;
    formTitle = deal.title;
    formDescription = deal.description;
    formAmount = deal.amount;
    formClubId = deal.clubId;
    formStartDate = deal.startDate;
    formEndDate = deal.endDate;
    showCreateModal = true;
  }

  function handleSave() {
    if (!formTitle.trim()) return;
    if (editingDealId) {
      updateDeal(editingDealId, {
        title: formTitle,
        description: formDescription,
        amount: formAmount,
        clubId: formClubId,
        startDate: formStartDate,
        endDate: formEndDate,
      });
      showToast('Acuerdo actualizado');
    } else {
      createDeal({
        clubId: formClubId,
        amount: formAmount,
        title: formTitle,
        description: formDescription,
        startDate: formStartDate,
        endDate: formEndDate,
      });
      showToast('Propuesta de acuerdo creada');
    }
    showCreateModal = false;
  }

  function handleStatusChange(dealId: number, newStatus: string) {
    updateDealStatus(dealId, newStatus);
    showToast(`Estado cambiado a "${newStatus}"`);
  }

  function handleDelete(dealId: number) {
    deleteDeal(dealId);
    showToast('Acuerdo eliminado');
  }

  function showToast(msg: string) {
    toastMessage = msg;
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Gestión de Acuerdos</h1>
      <p class="text-sm text-on-surface-variant mt-1">Administra tus propuestas y acuerdos de patrocinio</p>
    </div>
    <button onclick={openCreate} class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      Nueva propuesta
    </button>
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
        {formatCurrency(totalValue)}
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
    {#each filteredDeals as deal (deal.id)}
      <div class="p-6 rounded-2xl bg-surface-container hover:bg-surface-bright transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            {#if getClub(deal.clubId)}
              <img src={getClub(deal.clubId)!.logoUrl} alt={getClub(deal.clubId)!.name} class="w-10 h-10 rounded-lg object-cover" />
            {/if}
            <div>
              <h3 class="text-sm font-bold text-on-surface">{deal.title}</h3>
              {#if getClub(deal.clubId)}
                <p class="text-xs text-on-surface-variant">{getClub(deal.clubId)!.name}</p>
              {/if}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <select
              value={deal.status}
              onchange={(e) => handleStatusChange(deal.id, (e.target as HTMLSelectElement).value)}
              class="text-xs px-3 py-1.5 rounded-lg bg-surface-high text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary-container/50"
              aria-label="Cambiar estado del acuerdo"
            >
              <option value="pendiente">Pendiente</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <button onclick={() => openEdit(deal.id)} class="p-1.5 rounded-lg hover:bg-surface-high text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Editar acuerdo">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            </button>
            <button onclick={() => handleDelete(deal.id)} class="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors" aria-label="Eliminar acuerdo">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
        </div>
        <p class="text-sm text-on-surface-variant mb-4">{deal.description}</p>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <p class="text-xs uppercase tracking-widest text-on-surface-variant">Importe</p>
            <p class="text-sm font-bold text-on-surface">{formatCurrency(deal.amount)}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-widest text-on-surface-variant">Inicio</p>
            <p class="text-sm font-bold text-on-surface">{deal.startDate}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-widest text-on-surface-variant">Fin</p>
            <p class="text-sm font-bold text-on-surface">{deal.endDate}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if filteredDeals.length === 0}
    <div class="text-center py-20">
      <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
      <p class="text-lg font-semibold text-on-surface mb-1">Sin acuerdos</p>
      <p class="text-sm text-on-surface-variant">
        {filterStatus === 'todos' ? 'No tienes acuerdos aún. Crea una nueva propuesta.' : `No hay acuerdos con estado "${filterStatus}".`}
      </p>
    </div>
  {/if}
</div>

{#if showCreateModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showCreateModal = false} aria-label="Cerrar modal"></button>
    <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
      <h2 class="text-xl font-bold text-on-surface mb-2">{editingDealId ? 'Editar acuerdo' : 'Nueva propuesta'}</h2>
      <p class="text-sm text-on-surface-variant mb-6">{editingDealId ? 'Modifica los detalles del acuerdo' : 'Crea una nueva propuesta de patrocinio'}</p>

      <div class="space-y-4">
        <div>
          <label for="formClub" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Club</label>
          <select id="formClub" bind:value={formClubId} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50">
            {#each clubs as club}
              <option value={club.id}>{club.name} ({club.sport})</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="formTitle" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Título</label>
          <input id="formTitle" bind:value={formTitle} placeholder="Ej: Patrocinio camiseta 26/27" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
        </div>
        <div>
          <label for="formDesc" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Descripción</label>
          <textarea id="formDesc" bind:value={formDescription} rows="3" placeholder="Describe la propuesta..." class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
        <div>
          <label for="formAmount" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Importe (€)</label>
          <input id="formAmount" type="number" bind:value={formAmount} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="formStart" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Inicio</label>
            <input id="formStart" type="date" bind:value={formStartDate} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
          <div>
            <label for="formEnd" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Fin</label>
            <input id="formEnd" type="date" bind:value={formEndDate} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-end mt-6">
        <button onclick={() => showCreateModal = false} class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cancelar</button>
        <button onclick={handleSave} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
          {editingDealId ? 'Guardar cambios' : 'Crear propuesta'}
        </button>
      </div>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
