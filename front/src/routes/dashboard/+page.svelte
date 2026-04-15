<script lang="ts">
  import MetricTile from '$lib/components/MetricTile.svelte';
  import ClubCard from '$lib/components/ClubCard.svelte';
  import { clubs, clubMetrics, deals, messages, savedSearches } from '$lib/stores.svelte';
  import { formatCurrency, timeAgo } from '$lib/utils';

  const pendingDeals = $derived(deals.filter(d => d.status === 'pendiente'));
  const unreadMessages = $derived(messages.filter(m => !m.read && m.receiverIdentity === 'demo'));
  const activeDeals = $derived(deals.filter(d => d.status === 'aceptado'));
  const totalDealValue = $derived(activeDeals.reduce((sum, d) => sum + d.amount, 0));
  const recentClubs = $derived(clubs.slice(0, 4));

  const recentActivity = [
    { type: 'deal', text: 'Acuerdo con Real Madrid CF aceptado', time: '2026-04-14T10:00:00Z' },
    { type: 'message', text: 'Nuevo mensaje de Real Betis', time: '2026-04-12T14:30:00Z' },
    { type: 'search', text: 'Búsqueda "Esports alto engagement" guardada', time: '2026-04-05T09:00:00Z' },
    { type: 'deal', text: 'Propuesta enviada a Movistar Riders', time: '2026-04-10T11:00:00Z' },
    { type: 'deal', text: 'Propuesta a Club Padel Nuestro rechazada', time: '2026-04-08T16:00:00Z' },
  ];
</script>

<div class="p-8">
  <div class="mb-8">
    <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Dashboard</h1>
    <p class="text-sm text-on-surface-variant mt-1">Resumen de tu actividad en SponsorMatch</p>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <MetricTile label="Búsquedas guardadas" value={savedSearches.length.toString()} />
    <MetricTile label="Acuerdos pendientes" value={pendingDeals.length.toString()} change="2 esta semana" positive={true} />
    <MetricTile label="Mensajes sin leer" value={unreadMessages.length.toString()} />
    <MetricTile label="Valor acuerdos activos" value={formatCurrency(totalDealValue)} change="+15% vs mes anterior" positive={true} />
  </div>

  <div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2">
      <h2 class="text-lg font-bold text-on-surface mb-4">Clubes recomendados</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        {#each recentClubs as club}
          <ClubCard {club} metrics={clubMetrics.get(club.id)} />
        {/each}
      </div>
    </div>

    <div>
      <h2 class="text-lg font-bold text-on-surface mb-4">Actividad reciente</h2>
      <div class="space-y-3">
        {#each recentActivity as activity}
          <div class="p-4 rounded-xl bg-surface-container">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 {
                activity.type === 'deal' ? 'bg-primary-container/15' :
                activity.type === 'message' ? 'bg-secondary/15' :
                'bg-tertiary/15'
              }">
                {#if activity.type === 'deal'}
                  <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                {:else if activity.type === 'message'}
                  <svg class="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                {:else}
                  <svg class="w-4 h-4 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                  </svg>
                {/if}
              </div>
              <div class="min-w-0">
                <p class="text-sm text-on-surface">{activity.text}</p>
                <p class="text-xs text-on-surface-variant mt-0.5">{timeAgo(activity.time)}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-6">
        <h2 class="text-lg font-bold text-on-surface mb-4">Accesos rápidos</h2>
        <div class="space-y-2">
          <a href="/marketplace" class="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all text-sm text-on-surface-variant hover:text-on-surface">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Explorar marketplace
          </a>
          <a href="/deals" class="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all text-sm text-on-surface-variant hover:text-on-surface">
            <svg class="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Crear nuevo acuerdo
          </a>
          <a href="/messages" class="flex items-center gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-bright transition-all text-sm text-on-surface-variant hover:text-on-surface">
            <svg class="w-5 h-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Ver mensajes
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
