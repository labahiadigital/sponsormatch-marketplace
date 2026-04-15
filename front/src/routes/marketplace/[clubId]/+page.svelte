<script lang="ts">
  import { page } from '$app/state';
  import MetricTile from '$lib/components/MetricTile.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { clubs, clubMetrics, deals, clubProfiles } from '$lib/stores.svelte';
  import { createDeal } from '$lib/store-operations';
  import { formatNumber, formatCurrency } from '$lib/utils';
  import { calculateROI, getMatchScore, getAudienceSegments } from '$lib/sponsorship';
  import { calculateContentMetrics, compareWithLocalMedia } from '$lib/content-metrics';
  import { generateActivationPlan } from '$lib/activation';
  import type { SponsorObjective } from '$lib/sponsorship';

  const clubId = $derived(Number(page.params.clubId));
  const club = $derived(clubs.find(c => c.id === clubId));
  const metrics = $derived(clubMetrics.get(clubId));
  const clubDeals = $derived(deals.filter(d => d.clubId === clubId));
  const profile = $derived(clubProfiles.get(clubId));

  const roiData = $derived(metrics && club ? calculateROI({
    investmentAmount: Math.round((club.budgetMin + club.budgetMax) / 2),
    followers: metrics.followers,
    engagementRate: metrics.engagementRate,
    reach: metrics.reach,
    growthPercent: metrics.growthPercent,
  }) : null);

  const matchScore = $derived(club && metrics ? getMatchScore(
    { sector: 'Tecnología', budget: 200_000, objectives: ['branding', 'content', 'experience'] as SponsorObjective[] },
    { sport: club.sport, followers: metrics.followers, engagementRate: metrics.engagementRate, budgetMin: club.budgetMin, budgetMax: club.budgetMax, audienceAge: club.audienceAge, growthPercent: metrics.growthPercent }
  ) : 0);

  const audienceSegments = $derived(club && metrics ? getAudienceSegments(club.audienceAge, club.audienceGender, metrics.followers) : []);

  const contentData = $derived(metrics ? calculateContentMetrics(metrics.followers, metrics.engagementRate, metrics.avgLikes, metrics.avgComments) : null);

  const mediaComparison = $derived(contentData && club ? compareWithLocalMedia(contentData, club.location) : []);

  const activationPlan = $derived(club && profile ? generateActivationPlan(club.sport, Math.round((club.budgetMin + club.budgetMax) / 2), profile.activationObjectives as SponsorObjective[]) : []);

  let activeTab = $state<'overview' | 'roi' | 'audiences' | 'activation' | 'content'>('overview');

  let showDealModal = $state(false);
  let dealTitle = $state('');
  let dealDescription = $state('');
  let dealAmount = $state(50000);
  let dealStartDate = $state('2026-07-01');
  let dealEndDate = $state('2027-06-30');
  let toastMessage = $state('');
  let toastVisible = $state(false);

  function handleCreateDeal() {
    if (!dealTitle.trim() || !club) return;
    createDeal({
      clubId: club.id,
      amount: dealAmount,
      title: dealTitle,
      description: dealDescription,
      startDate: dealStartDate,
      endDate: dealEndDate,
    });
    showDealModal = false;
    dealTitle = '';
    dealDescription = '';
    toastMessage = 'Propuesta de acuerdo enviada';
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }

  const sparklineData = [35, 42, 38, 55, 48, 60, 52, 65, 70, 68, 75, 80];

  function getScoreColor(score: number): string {
    if (score >= 75) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-error';
  }

  function getScoreBg(score: number): string {
    if (score >= 75) return 'from-success/20 to-success/5';
    if (score >= 50) return 'from-warning/20 to-warning/5';
    return 'from-error/20 to-error/5';
  }
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

    <div class="flex items-center gap-3 mb-6">
      <div class="flex-1 p-4 rounded-xl bg-gradient-to-r {getScoreBg(matchScore)}">
        <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1">MATCH SCORE</p>
        <p class="text-3xl font-black {getScoreColor(matchScore)}">{matchScore}<span class="text-lg">/100</span></p>
      </div>
      {#if roiData}
        <div class="flex-1 p-4 rounded-xl bg-surface-container">
          <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1">ROI ESTIMADO</p>
          <p class="text-3xl font-black {roiData.estimatedROI > 0 ? 'text-success' : 'text-error'}">{roiData.estimatedROI > 0 ? '+' : ''}{roiData.estimatedROI}%</p>
        </div>
        <div class="flex-1 p-4 rounded-xl bg-surface-container">
          <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1">VALOR MEDIÁTICO</p>
          <p class="text-3xl font-black text-secondary">{formatCurrency(roiData.mediaValue)}</p>
        </div>
      {/if}
    </div>

    {#if profile}
      <div class="p-5 rounded-2xl bg-surface-container mb-6">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-lg bg-tertiary-container/20 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-widest text-tertiary mb-1">TERRITORIO ÚNICO</p>
            <p class="text-sm text-on-surface leading-relaxed">{profile.territory}</p>
            <p class="text-xs text-on-surface-variant mt-2"><span class="font-medium">Propósito:</span> {profile.purpose}</p>
          </div>
        </div>
      </div>
    {/if}

    <div class="flex gap-1 mb-6 overflow-x-auto">
      {#each [
        { id: 'overview', label: 'Resumen' },
        { id: 'roi', label: 'ROI y Métricas' },
        { id: 'audiences', label: 'Audiencias' },
        { id: 'activation', label: 'Plan de Activación' },
        { id: 'content', label: 'Contenido' },
      ] as tab}
        <button
          onclick={() => activeTab = tab.id as typeof activeTab}
          class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap {activeTab === tab.id ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-high hover:text-on-surface'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>

    {#if activeTab === 'overview'}
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
          </dl>
        </div>
      </div>

      {#if profile}
        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="p-6 rounded-2xl bg-surface-container">
            <h2 class="text-lg font-bold text-on-surface mb-4">Pilares de contenido</h2>
            <div class="flex flex-wrap gap-2">
              {#each profile.contentPillars as pillar}
                <span class="px-3 py-1.5 rounded-lg bg-surface-high text-sm text-on-surface-variant">{pillar}</span>
              {/each}
            </div>
          </div>
          <div class="p-6 rounded-2xl bg-surface-container">
            <h2 class="text-lg font-bold text-on-surface mb-4">Audiencias objetivo</h2>
            <div class="flex flex-wrap gap-2">
              {#each profile.targetAudiences as audience}
                <span class="px-3 py-1.5 rounded-lg bg-secondary/10 text-sm text-secondary">{audience}</span>
              {/each}
            </div>
          </div>
        </div>
      {/if}

    {:else if activeTab === 'roi'}
      {#if roiData && metrics}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricTile label="ROI Estimado" value="{roiData.estimatedROI > 0 ? '+' : ''}{roiData.estimatedROI}%" positive={roiData.estimatedROI > 0} />
          <MetricTile label="Valor mediático anual" value={formatCurrency(roiData.mediaValue)} />
          <MetricTile label="Alcance audiencia anual" value={formatNumber(roiData.audienceReach)} />
          <MetricTile label="Coste por impresión" value="€{roiData.costPerImpression}" />
        </div>
        <div class="p-6 rounded-2xl bg-surface-container mb-8">
          <h2 class="text-lg font-bold text-on-surface mb-4">Análisis de retorno</h2>
          <p class="text-sm text-on-surface-variant mb-4">Estimación basada en inversión media de {formatCurrency(Math.round((club!.budgetMin + club!.budgetMax) / 2))} con {formatNumber(metrics.followers)} seguidores y {metrics.engagementRate}% de engagement.</p>
          <div class="grid lg:grid-cols-3 gap-6">
            <div class="p-4 rounded-xl bg-surface-high">
              <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">CONSIDERACIÓN</p>
              <p class="text-sm text-on-surface">Ideal para reforzar posicionamiento de marca entre {formatNumber(metrics.followers)} seguidores con un engagement rate del {metrics.engagementRate}%</p>
            </div>
            <div class="p-4 rounded-xl bg-surface-high">
              <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">CONVERSIÓN</p>
              <p class="text-sm text-on-surface">Potencial de generar {formatNumber(Math.round(metrics.reach * metrics.engagementRate / 100))} interacciones mensuales directas con tu marca</p>
            </div>
            <div class="p-4 rounded-xl bg-surface-high">
              <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">CRECIMIENTO</p>
              <p class="text-sm text-on-surface">Con un crecimiento del {metrics.growthPercent}% mensual, la audiencia se proyecta a {formatNumber(Math.round(metrics.followers * (1 + metrics.growthPercent / 100) * 12))} en 12 meses</p>
            </div>
          </div>
        </div>
      {/if}

    {:else if activeTab === 'audiences'}
      <div class="grid lg:grid-cols-2 gap-8 mb-8">
        <div class="p-6 rounded-2xl bg-surface-container">
          <h2 class="text-lg font-bold text-on-surface mb-4">Segmentación de audiencia</h2>
          <div class="space-y-3">
            {#each audienceSegments as segment}
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-sm text-on-surface">{segment.name}</span>
                  <span class="text-sm font-medium text-on-surface-variant">{segment.percentage}% · {formatNumber(segment.size)}</span>
                </div>
                <div class="h-2 rounded-full bg-surface-high overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container transition-all" style="width: {segment.percentage}%"></div>
                </div>
              </div>
            {/each}
          </div>
        </div>
        {#if profile}
          <div class="p-6 rounded-2xl bg-surface-container">
            <h2 class="text-lg font-bold text-on-surface mb-4">Mapa de audiencias del club</h2>
            <p class="text-sm text-on-surface-variant mb-4">Audiencias identificadas para este club según su territorio, deporte y ubicación.</p>
            <div class="space-y-3">
              {#each profile.targetAudiences as audience, i}
                <div class="flex items-center gap-3 p-3 rounded-xl bg-surface-high">
                  <div class="w-8 h-8 rounded-lg bg-{['primary-container', 'secondary-container', 'tertiary-container', 'success'][i % 4]}/20 flex items-center justify-center text-sm font-bold text-on-surface-variant">{i + 1}</div>
                  <span class="text-sm text-on-surface">{audience}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

    {:else if activeTab === 'activation'}
      <div class="space-y-6 mb-8">
        {#each activationPlan as phase}
          <div class="p-6 rounded-2xl bg-surface-container">
            <h2 class="text-lg font-bold text-on-surface mb-1 capitalize">{phase.phase.replace('-', ' ')}</h2>
            <p class="text-xs text-on-surface-variant mb-4 uppercase tracking-widest">{phase.actions.length} acciones planificadas</p>
            <div class="space-y-3">
              {#each phase.actions as action}
                <div class="p-4 rounded-xl bg-surface-high">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <p class="text-sm font-semibold text-on-surface">{action.name}</p>
                      <p class="text-xs text-on-surface-variant mt-1">{action.description}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-xs px-2 py-1 rounded-md bg-surface-container text-on-surface-variant">{action.channel}</span>
                      {#if action.estimatedCost > 0}
                        <p class="text-xs text-on-surface-variant mt-1">{formatCurrency(action.estimatedCost)}</p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>

    {:else if activeTab === 'content'}
      {#if contentData}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricTile label="Impresiones mensuales" value={formatNumber(contentData.monthlyImpressions)} />
          <MetricTile label="Alcance mensual" value={formatNumber(contentData.monthlyReach)} />
          <MetricTile label="Valor mediático mensual" value={formatCurrency(contentData.estimatedMonthlyMediaValue)} />
          <MetricTile label="Posts recomendados/semana" value={contentData.recommendedPostsPerWeek.toString()} />
        </div>
      {/if}

      {#if mediaComparison.length > 0}
        <div class="p-6 rounded-2xl bg-surface-container mb-8">
          <h2 class="text-lg font-bold text-on-surface mb-2">Comparativa con medios locales</h2>
          <p class="text-xs text-on-surface-variant mb-4">Cómo se compara el alcance de este club como "medio" frente a medios tradicionales en {club?.location}</p>
          <div class="grid sm:grid-cols-2 gap-4">
            {#each mediaComparison as comp}
              <div class="p-4 rounded-xl bg-surface-high">
                <p class="text-xs font-medium uppercase tracking-widest text-secondary mb-1">{comp.mediaType}</p>
                <p class="text-2xl font-black text-on-surface mb-1">{comp.equivalentValue}</p>
                <p class="text-xs text-on-surface-variant">{comp.description}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if profile}
        <div class="p-6 rounded-2xl bg-surface-container mb-8">
          <h2 class="text-lg font-bold text-on-surface mb-4">Estrategia de contenido recomendada</h2>
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {#each profile.contentPillars as pillar}
              <div class="p-4 rounded-xl bg-surface-high text-center">
                <p class="text-sm font-semibold text-on-surface">{pillar}</p>
                <p class="text-xs text-on-surface-variant mt-1">Pilar de contenido</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}

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
          <button onclick={handleCreateDeal} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
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
