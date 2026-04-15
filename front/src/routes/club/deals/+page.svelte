<script lang="ts">
  import { appState, negotiationEvents } from '$lib/stores.svelte';
  import { getClubDeals, respondToDeal } from '$lib/club-operations';
  import { formatCurrency, formatDate, getStatusColor, getStatusBgColor } from '$lib/utils';
  import Toast from '$lib/components/Toast.svelte';

  const clubDeals = $derived(getClubDeals(appState.activeClubId));
  const pendingDeals = $derived(clubDeals.filter(d => d.status === 'pendiente'));
  const activeDeals = $derived(clubDeals.filter(d => d.status === 'aceptado'));

  let showCounterModal = $state(false);
  let counterDealId = $state(0);
  let counterNote = $state('');
  let toastMessage = $state('');
  let toastVisible = $state(false);

  function handleAccept(dealId: number) {
    respondToDeal(dealId, 'accepted', 'Propuesta aceptada por el club');
    showToast('Propuesta aceptada');
  }

  function handleReject(dealId: number) {
    respondToDeal(dealId, 'rejected', 'Propuesta rechazada por el club');
    showToast('Propuesta rechazada');
  }

  function openCounter(dealId: number) {
    counterDealId = dealId;
    counterNote = '';
    showCounterModal = true;
  }

  function handleCounter() {
    if (!counterNote.trim()) return;
    respondToDeal(counterDealId, 'counter', counterNote);
    showCounterModal = false;
    showToast('Contraoferta enviada');
  }

  function getDealEvents(dealId: number) {
    return negotiationEvents.filter(e => e.dealId === dealId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  function showToast(msg: string) {
    toastMessage = msg;
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Propuestas recibidas</h1>
    <p class="text-sm text-on-surface-variant mt-1">{pendingDeals.length} pendientes · {activeDeals.length} activos</p>
  </div>

  {#if pendingDeals.length > 0}
    <h2 class="text-xs font-medium uppercase tracking-widest text-warning mb-4">Pendientes de respuesta</h2>
    <div class="space-y-4 mb-10">
      {#each pendingDeals as deal (deal.id)}
        <div class="p-6 rounded-2xl bg-surface-container">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-on-surface">{deal.title}</h3>
              <p class="text-xs text-on-surface-variant">Marca: {deal.brandIdentity}</p>
            </div>
            <span class="text-xl font-black text-on-surface">{formatCurrency(deal.amount)}</span>
          </div>
          <p class="text-sm text-on-surface-variant mb-4">{deal.description}</p>
          <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span class="text-xs uppercase tracking-widest text-on-surface-variant">Duración</span>
              <p class="font-medium text-on-surface">{deal.startDate} → {deal.endDate}</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button onclick={() => handleAccept(deal.id)} class="flex-1 py-2.5 rounded-lg bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors">Aceptar oferta</button>
            <button onclick={() => openCounter(deal.id)} class="flex-1 py-2.5 rounded-lg text-on-surface text-sm font-semibold transition-colors hover:bg-surface-high" style="border: 1px solid rgba(67, 70, 85, 0.15);">Contraoferta</button>
            <button onclick={() => handleReject(deal.id)} class="px-5 py-2.5 rounded-lg text-error text-sm font-medium hover:bg-error/10 transition-colors">Rechazar</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Historial de acuerdos</h2>
  <div class="space-y-4">
    {#each clubDeals as deal (deal.id)}
      <div class="p-6 rounded-2xl bg-surface-container">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-on-surface">{deal.title}</h3>
              <span class="text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider {getStatusColor(deal.status)} {getStatusBgColor(deal.status)}">{deal.status}</span>
            </div>
            <p class="text-xs text-on-surface-variant">{deal.brandIdentity} · {formatCurrency(deal.amount)}</p>
          </div>
        </div>
        {#if getDealEvents(deal.id).length > 0}
          <div class="mt-3 pt-3" style="border-top: 1px solid rgba(67, 70, 85, 0.1);">
            <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Historial de negociación</p>
            <div class="space-y-2">
              {#each getDealEvents(deal.id) as event}
                <div class="flex items-start gap-2">
                  <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 {event.type === 'accepted' ? 'bg-success' : event.type === 'rejected' ? 'bg-error' : 'bg-primary-container'}"></div>
                  <div>
                    <p class="text-xs text-on-surface">{event.description}</p>
                    <p class="text-[10px] text-on-surface-variant">{formatDate(event.timestamp)}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if clubDeals.length === 0}
    <div class="text-center py-20">
      <p class="text-lg font-semibold text-on-surface mb-1">Sin propuestas</p>
      <p class="text-sm text-on-surface-variant">Aún no has recibido propuestas de patrocinio</p>
    </div>
  {/if}
</div>

{#if showCounterModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showCounterModal = false} aria-label="Cerrar modal"></button>
    <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
      <h2 class="text-xl font-bold text-on-surface mb-2">Contraoferta</h2>
      <p class="text-sm text-on-surface-variant mb-6">Describe las condiciones que propondrías</p>
      <textarea bind:value={counterNote} rows="4" placeholder="Ej: Aceptamos por 60.000 € incluyendo 2 pases VIP..." class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none mb-6"></textarea>
      <div class="flex gap-3 justify-end">
        <button onclick={() => showCounterModal = false} class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cancelar</button>
        <button onclick={handleCounter} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
          Enviar contraoferta
        </button>
      </div>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
