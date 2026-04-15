<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/dashboard');
  });
</script>

<div class="flex items-center justify-center min-h-screen">
  <div class="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
</div>
