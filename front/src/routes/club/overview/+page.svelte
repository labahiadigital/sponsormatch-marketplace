<script lang="ts">
  import { appState, clubs, clubMetrics, clubProfiles, sponsorshipAssets, deals } from '$lib/stores.svelte';
  import { getClubAssets, getClubDeals, updateClubProfile } from '$lib/club-operations';
  import { formatNumber, formatCurrency } from '$lib/utils';
  import { getAudienceSegments } from '$lib/sponsorship';
  import Toast from '$lib/components/Toast.svelte';

  const club = $derived(clubs.find(c => c.id === appState.activeClubId));
  const metrics = $derived(clubMetrics.get(appState.activeClubId));
  const profile = $derived(clubProfiles.get(appState.activeClubId));
  const assets = $derived(getClubAssets(appState.activeClubId));
  const clubDeals = $derived(getClubDeals(appState.activeClubId));
  const openAssets = $derived(assets.filter(a => a.available).length);
  const activeDeals = $derived(clubDeals.filter(d => d.status === 'aceptado'));
  const totalValue = $derived(activeDeals.reduce((s, d) => s + d.amount, 0));
  const audienceSegments = $derived(club && metrics ? getAudienceSegments(club.audienceAge, club.audienceGender, metrics.followers) : []);
  const sponsorshipROI = $derived(metrics ? (totalValue > 0 ? (totalValue * 4.2 / totalValue).toFixed(1) : '0.0') : '0.0');

  let showEditModal = $state(false);
  let editTerritory = $state('');
  let editPurpose = $state('');
  let editPillars = $state('');
  let editAudiences = $state('');
  let toastMessage = $state('');
  let toastVisible = $state(false);

  function openEdit() {
    if (!profile) return;
    editTerritory = profile.territory;
    editPurpose = profile.purpose;
    editPillars = profile.contentPillars.join('\n');
    editAudiences = profile.targetAudiences.join('\n');
    showEditModal = true;
  }

  function handleSaveProfile() {
    updateClubProfile(appState.activeClubId, {
      territory: editTerritory,
      purpose: editPurpose,
      contentPillars: editPillars.split('\n').filter(l => l.trim()),
      targetAudiences: editAudiences.split('\n').filter(l => l.trim()),
    });
    showEditModal = false;
    toastMessage = 'Perfil actualizado';
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }
</script>

{#if club && metrics}
<div class="p-8">
  <div class="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-surface-container via-surface-low to-surface-container p-8">
    <div class="flex items-start gap-6">
      <img src={club.logoUrl} alt={club.name} class="w-20 h-20 rounded-2xl object-cover shadow-lg" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-medium uppercase tracking-widest text-on-surface-variant">{club.sport}</span>
          <span class="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wider">Verificado</span>
        </div>
        <h1 class="text-4xl font-black text-on-surface tracking-tight mb-2" style="letter-spacing: -0.03em;">{club.name}</h1>
        <div class="flex items-center gap-6 text-sm text-on-surface-variant">
          <span>{club.location}</span>
          <span>{formatNumber(metrics.followers)} Alcance Global</span>
          <span>{activeDeals.length} Patrocinadores Activos</span>
        </div>
      </div>
      <button onclick={openEdit} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
        Editar perfil
      </button>
    </div>
  </div>

  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Valor total</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">{formatCurrency(totalValue)}</p>
      <p class="text-xs text-success mt-1">+12.4% vs último año</p>
    </div>
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Crecimiento audiencia</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">{formatNumber(metrics.followers * metrics.growthPercent / 100)}</p>
      <p class="text-xs text-secondary mt-1">Nuevos seguidores</p>
    </div>
    <div class="p-6 rounded-2xl bg-surface-container">
      <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Sponsorship ROI</p>
      <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">{sponsorshipROI}x</p>
      <p class="text-xs text-tertiary mt-1">Industry Top 8%</p>
    </div>
  </div>

  <div class="grid lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-8">
      <div class="p-6 rounded-2xl bg-surface-container">
        <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Engagement Trajectory</h2>
        <div class="h-48 flex items-end gap-1">
          {#each [65, 72, 58, 80, 75, 90, 85, 95, 88, 92, 97, 100] as val, i}
            <div class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-t-sm bg-gradient-to-t from-primary-container/40 to-primary-container/80" style="height: {val * 1.5}px"></div>
              <span class="text-[9px] text-on-surface-variant">{['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}</span>
            </div>
          {/each}
        </div>
      </div>

      {#if profile}
        <div class="p-6 rounded-2xl bg-surface-container">
          <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Visión estratégica</h2>
          <blockquote class="text-lg text-on-surface italic leading-relaxed">
            "{profile.territory}"
          </blockquote>
          <p class="text-sm text-on-surface-variant mt-4">{profile.purpose}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            {#each profile.contentPillars as pillar}
              <span class="px-3 py-1 rounded-full bg-surface-high text-xs text-on-surface-variant">{pillar}</span>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="space-y-8">
      <div class="p-6 rounded-2xl bg-surface-container">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant">Assets disponibles</h2>
          <span class="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold">{openAssets} Abiertos</span>
        </div>
        <div class="space-y-4">
          {#each assets.slice(0, 3) as asset}
            <div class="p-4 rounded-xl bg-surface-high">
              <div class="flex items-start justify-between mb-1">
                <h3 class="text-sm font-bold text-on-surface">{asset.name}</h3>
                <span class="text-sm font-bold text-on-surface">{formatCurrency(asset.price)}</span>
              </div>
              <p class="text-xs text-on-surface-variant mb-2">{asset.description}</p>
              <div class="flex flex-wrap gap-1">
                {#each asset.tags as tag}
                  <span class="px-2 py-0.5 rounded text-[10px] text-on-surface-variant bg-surface-container uppercase">{tag}</span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
        <a href="/club/inventory" class="block text-center text-sm text-primary hover:text-on-surface transition-colors mt-4 py-2 rounded-lg bg-surface-high">
          Ver todos los {assets.length} assets
        </a>
      </div>

      <div class="p-6 rounded-2xl bg-surface-container">
        <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Audience archetype</h2>
        <div class="space-y-3">
          {#each audienceSegments.slice(0, 4) as seg}
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-on-surface">{seg.name}</span>
                <span class="text-xs text-on-surface-variant">{seg.percentage}%</span>
              </div>
              <div class="h-2 rounded-full bg-surface-high overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container" style="width: {seg.percentage}%"></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

{#if showEditModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showEditModal = false} aria-label="Cerrar modal"></button>
    <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-xl font-bold text-on-surface mb-6">Editar perfil del club</h2>
      <div class="space-y-4">
        <div>
          <label for="editTerritory" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Territorio único</label>
          <textarea id="editTerritory" bind:value={editTerritory} rows="2" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
        <div>
          <label for="editPurpose" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Propósito superior</label>
          <textarea id="editPurpose" bind:value={editPurpose} rows="2" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
        <div>
          <label for="editPillars" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Pilares de contenido (uno por línea)</label>
          <textarea id="editPillars" bind:value={editPillars} rows="4" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
        <div>
          <label for="editAudiences" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Audiencias objetivo (una por línea)</label>
          <textarea id="editAudiences" bind:value={editAudiences} rows="4" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
      </div>
      <div class="flex gap-3 justify-end mt-6">
        <button onclick={() => showEditModal = false} class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cancelar</button>
        <button onclick={handleSaveProfile} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
          Guardar cambios
        </button>
      </div>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
