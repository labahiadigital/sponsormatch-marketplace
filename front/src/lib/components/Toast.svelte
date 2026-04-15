<script lang="ts">
  interface Props {
    message: string;
    type?: 'success' | 'error' | 'info';
    visible: boolean;
  }

  let { message, type = 'info', visible }: Props = $props();
</script>

{#if visible}
  <div
    class="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease] {
      type === 'success' ? 'bg-success/15 text-success' :
      type === 'error' ? 'bg-error/15 text-error' :
      'bg-primary-container/15 text-primary'
    }"
  >
    {message}
  </div>
{/if}

<style>
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
