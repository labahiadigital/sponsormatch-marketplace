<script lang="ts">
  import { page } from '$app/state';
  import MetricTile from '$lib/components/MetricTile.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { clubs, clubMetrics, deals } from '$lib/stores.svelte';
  import { formatNumber, formatCurrency } from '$lib/utils';

  const clubId = $derived(Number(page.params.clubId));
  const club = $derived(clubs.find(c => c.id === clubId));
  const metrics = $derived(clubMetrics.get(clubId));
  const clubDeals = $derived(deals.filter(d => d.clubId === clubId));

  let showDealModal = $state(false);
  let dealTitle = $state('');
  let dealDescription = $state('');
  let dealAmount = $state(50000);
  let dealStartDate = $state('2026-07-01');
  let dealEndDate = $state('2027-06-30');
  let toastMessage = $state('');
  let toastVisible = $state(false);

  function createDeal() {
    if (!dealTitle.trim() || !club) return;
    deals.push({
      id: deals.length + 1,
      brandIdentity: 'demo',
      clubId: club.id,
      status: 'pendiente',
      amount: dealAmount,
      title: dealTitle,
      description: dealDescription,
      startDate: dealStartDate,
      endDate: dealEndDate,
      createdAt: new Date().toISOString(),
    });
    showDealModal = false;
    dealTitle = '';
    dealDescription = '';
    toastMessage = 'Propuesta de acuerdo enviada';
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }

  const sparklineData = [35, 42, 38, 55, 48, 60, 52, 65, 70, 68, 75, 80];
</script>

{#if club}
  <div class="p-8">
    <a href="/marketplace" class="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Volver al marketplace
    </a>

    <div class="rounded-2xl bg-surface-container overflow-hidden mb-8">
      <div class="h-48 bg-gradient-to-r from-primary-container/30 to-secondary-container/20 relative">
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container/80 to-transparent"></div>
      </div>
      <div class="px-8 pb-8 -mt-16 relative">
        <div class="flex items-end gap-6 mb-6">
          <img src={club.logoUrl} alt={club.name} class="w-24 h-24 rounded-2xl object-cover shadow-xl" />
          <div class="flex-1 pb-1">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">{club.name}</h1>
              <span class="text-xs px-3 py-1 rounded-full bg-surface-high text-on-surface-variant">{club.sport}</span>
            </div>
            <p class="text-sm text-on-surface-variant">{club.location} · Fundado en {club.foundedYear}</p>
          </div>
          <button
            onclick={() => showDealModal = true}
            class="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all shrink-0"
          >
            Proponer acuerdo
          </button>
        </div>
        <p class="text-base text-on-surface-variant leading-relaxed max-w-3xl">{club.description}</p>
      </div>
    </div>

    {#if metrics}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricTile label="Seguidores" value={formatNumber(metrics.followers)} change="+{metrics.growthPercent}% mensual" positive={true} />
        <MetricTile label="Engagement Rate" value="{metrics.engagementRate}%" />
        <MetricTile label="Alcance" value={formatNumber(metrics.reach)} />
        <MetricTile label="Likes promedio" value={formatNumber(metrics.avgLikes)} />
      </div>
    {/if}

    <div class="grid lg:grid-cols-2 gap-8 mb-8">
      <div class="p-6 rounded-2xl bg-surface-container">
        <h2 class="text-lg font-bold text-on-surface mb-4">Tendencia de engagement</h2>
        <div class="flex items-end gap-1.5 h-32">
          {#each sparklineData as val, i}
            <div
              class="flex-1 rounded-t-md bg-gradient-to-t from-primary-container/60 to-primary-container transition-all duration-300 hover:from-primary-container hover:to-secondary-container"
              style="height: {val}%"
              title="Mes {i + 1}: {val}%"
            ></div>
          {/each}
        </div>
        <div class="flex justify-between mt-2">
          <span class="text-xs text-on-surface-variant">Ene</span>
          <span class="text-xs text-on-surface-variant">Dic</span>
        </div>
      </div>

      <div class="p-6 rounded-2xl bg-surface-container">
        <h2 class="text-lg font-bold text-on-surface mb-4">Información</h2>
        <dl class="space-y-4">
          <div class="flex justify-between">
            <dt class="text-sm text-on-surface-variant">Rango presupuestario</dt>
            <dd class="text-sm font-medium text-on-surface">{formatCurrency(club.budgetMin)} - {formatCurrency(club.budgetMax)}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-on-surface-variant">Audiencia (edad)</dt>
            <dd class="text-sm font-medium text-on-surface">{club.audienceAge}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-on-surface-variant">Audiencia (género)</dt>
            <dd class="text-sm font-medium text-on-surface">{club.audienceGender}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-sm text-on-surface-variant">Web</dt>
            <dd class="text-sm font-medium text-primary">{club.website}</dd>
          </div>
          {#if metrics}
            <div class="flex justify-between">
              <dt class="text-sm text-on-surface-variant">Comentarios promedio</dt>
              <dd class="text-sm font-medium text-on-surface">{formatNumber(metrics.avgComments)}</dd>
            </div>
          {/if}
        </dl>
      </div>
    </div>

    {#if clubDeals.length > 0}
      <div class="mb-8">
        <h2 class="text-lg font-bold text-on-surface mb-4">Tus acuerdos con este club</h2>
        <div class="space-y-3">
          {#each clubDeals as deal}
            <div class="p-4 rounded-xl bg-surface-container flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-on-surface">{deal.title}</p>
                <p class="text-xs text-on-surface-variant">{formatCurrency(deal.amount)}</p>
              </div>
              <span class="text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider {
                deal.status === 'aceptado' ? 'text-success bg-success/10' :
                deal.status === 'pendiente' ? 'text-warning bg-warning/10' :
                'text-error bg-error/10'
              }">
                {deal.status}
              </span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  {#if showDealModal}
    <div class="fixed inset-0 z-50 flex items-center justify-center">
      <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showDealModal = false} aria-label="Cerrar modal"></button>
      <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
        <h2 class="text-xl font-bold text-on-surface mb-2">Proponer acuerdo</h2>
        <p class="text-sm text-on-surface-variant mb-6">Envía una propuesta de patrocinio a {club.name}</p>

        <div class="space-y-4">
          <div>
            <label for="dealTitle" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Título</label>
            <input id="dealTitle" bind:value={dealTitle} placeholder="Ej: Patrocinio camiseta 26/27" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
          <div>
            <label for="dealDesc" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Descripción</label>
            <textarea id="dealDesc" bind:value={dealDescription} rows="3" placeholder="Describe la propuesta..." class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
          </div>
          <div>
            <label for="dealAmount" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Importe (€)</label>
            <input id="dealAmount" type="number" bind:value={dealAmount} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="dealStart" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Inicio</label>
              <input id="dealStart" type="date" bind:value={dealStartDate} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
            </div>
            <div>
              <label for="dealEnd" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Fin</label>
              <input id="dealEnd" type="date" bind:value={dealEndDate} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 justify-end mt-6">
          <button onclick={() => showDealModal = false} class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">
            Cancelar
          </button>
          <button onclick={createDeal} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
            Enviar propuesta
          </button>
        </div>
      </div>
    </div>
  {/if}
{:else}
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <p class="text-lg font-semibold text-on-surface mb-2">Club no encontrado</p>
      <a href="/marketplace" class="text-sm text-primary hover:underline">Volver al marketplace</a>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
