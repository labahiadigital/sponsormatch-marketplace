<script lang="ts">
  import type { Deal, Club } from '$lib/types';
  import { formatCurrency, formatDate, getStatusColor, getStatusBgColor } from '$lib/utils';

  interface Props {
    deal: Deal;
    club?: Club;
  }

  let { deal, club }: Props = $props();
</script>

<div class="p-6 rounded-2xl bg-surface-container hover:bg-surface-bright transition-all duration-300">
  <div class="flex items-start justify-between mb-4">
    <div class="flex items-center gap-3">
      {#if club}
        <img src={club.logoUrl} alt={club.name} class="w-10 h-10 rounded-lg object-cover" />
      {/if}
      <div>
        <h3 class="text-sm font-bold text-on-surface">{deal.title}</h3>
        {#if club}
          <p class="text-xs text-on-surface-variant">{club.name}</p>
        {/if}
      </div>
    </div>
    <span class="text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wider {getStatusColor(deal.status)} {getStatusBgColor(deal.status)}">
      {deal.status}
    </span>
  </div>

  <p class="text-sm text-on-surface-variant mb-4">{deal.description}</p>

  <div class="grid grid-cols-3 gap-4">
    <div>
      <p class="text-xs uppercase tracking-widest text-on-surface-variant">Importe</p>
      <p class="text-sm font-bold text-on-surface">{formatCurrency(deal.amount)}</p>
    </div>
    <div>
      <p class="text-xs uppercase tracking-widest text-on-surface-variant">Inicio</p>
      <p class="text-sm font-bold text-on-surface">{formatDate(deal.startDate)}</p>
    </div>
    <div>
      <p class="text-xs uppercase tracking-widest text-on-surface-variant">Fin</p>
      <p class="text-sm font-bold text-on-surface">{formatDate(deal.endDate)}</p>
    </div>
  </div>
</div>
