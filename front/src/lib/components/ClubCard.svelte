<script lang="ts">
  import type { Club, ClubMetrics } from '$lib/types';
  import { formatNumber, formatCurrency } from '$lib/utils';

  interface Props {
    club: Club;
    metrics?: ClubMetrics;
  }

  let { club, metrics }: Props = $props();
</script>

<a
  href="/marketplace/{club.id}"
  class="group block p-6 rounded-2xl bg-surface-container hover:bg-surface-bright transition-all duration-300 hover:shadow-[0_0_40px_rgba(37,99,235,0.08)]"
>
  <div class="flex items-start gap-4 mb-4">
    <img
      src={club.logoUrl}
      alt={club.name}
      class="w-14 h-14 rounded-xl object-cover shrink-0"
    />
    <div class="min-w-0 flex-1">
      <h3 class="text-base font-bold text-on-surface truncate group-hover:text-primary transition-colors">
        {club.name}
      </h3>
      <div class="flex items-center gap-2 mt-1">
        <span class="text-xs px-2 py-0.5 rounded-md bg-surface-high text-on-surface-variant">{club.sport}</span>
        <span class="text-xs text-on-surface-variant">{club.location}</span>
      </div>
    </div>
  </div>

  <p class="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">{club.description}</p>

  {#if metrics}
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div>
        <p class="text-xs uppercase tracking-widest text-on-surface-variant">Seguidores</p>
        <p class="text-sm font-bold text-on-surface">{formatNumber(metrics.followers)}</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-on-surface-variant">Engagement</p>
        <p class="text-sm font-bold text-secondary">{metrics.engagementRate}%</p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-widest text-on-surface-variant">Crecimiento</p>
        <p class="text-sm font-bold text-success">+{metrics.growthPercent}%</p>
      </div>
    </div>
  {/if}

  <div class="flex items-center justify-between pt-4" style="border-top: 1px solid rgba(67, 70, 85, 0.15);">
    <p class="text-xs text-on-surface-variant">
      {formatCurrency(club.budgetMin)} - {formatCurrency(club.budgetMax)}
    </p>
    <span class="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      Ver perfil →
    </span>
  </div>
</a>
