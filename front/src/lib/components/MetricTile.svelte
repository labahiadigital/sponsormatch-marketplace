<script lang="ts">
  interface Props {
    label: string;
    value: string;
    change?: string;
    positive?: boolean;
  }

  let { label, value, change, positive = true }: Props = $props();
</script>

<div class="p-6 rounded-2xl bg-surface-container hover:bg-surface-bright transition-all duration-300">
  <p class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
  <p class="text-3xl font-black text-on-surface" style="letter-spacing: -0.03em;">{value}</p>
  {#if change}
    <p class="text-xs mt-2 {positive ? 'text-success' : 'text-error'}">
      {positive ? '↑' : '↓'} {change}
    </p>
  {/if}
</div>
