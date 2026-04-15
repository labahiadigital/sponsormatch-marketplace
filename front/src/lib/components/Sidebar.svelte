<script lang="ts">
  import { page } from '$app/state';
  import { appState } from '$lib/stores.svelte';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/marketplace', label: 'Marketplace', icon: 'marketplace' },
    { href: '/deals', label: 'Acuerdos', icon: 'deals' },
    { href: '/messages', label: 'Mensajes', icon: 'messages' },
  ];

  function isActive(href: string): boolean {
    return page.url.pathname.startsWith(href);
  }
</script>

<aside
  class="fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 bg-surface/60 backdrop-blur-2xl"
  class:w-64={!appState.sidebarCollapsed}
  class:w-20={appState.sidebarCollapsed}
>
  <div class="flex items-center gap-3 px-6 py-6">
    <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shrink-0">
      <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    {#if !appState.sidebarCollapsed}
      <span class="text-base font-bold text-on-surface tracking-tight">SponsorMatch</span>
    {/if}
  </div>

  <nav class="flex-1 px-3 py-4 space-y-1">
    {#each navItems as item}
      <a
        href={item.href}
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 {isActive(item.href) ? 'bg-primary-container/15 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'}"
      >
        <div class="w-5 h-5 shrink-0 flex items-center justify-center">
          {#if item.icon === 'dashboard'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
            </svg>
          {:else if item.icon === 'marketplace'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          {:else if item.icon === 'deals'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          {:else if item.icon === 'messages'}
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          {/if}
        </div>
        {#if !appState.sidebarCollapsed}
          <span>{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <div class="px-3 py-4">
    <button
      onclick={() => appState.sidebarCollapsed = !appState.sidebarCollapsed}
      class="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
    >
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="w-5 h-5 shrink-0 transition-transform {appState.sidebarCollapsed ? 'rotate-180' : ''}">
        <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
      </svg>
      {#if !appState.sidebarCollapsed}
        <span>Colapsar</span>
      {/if}
    </button>
  </div>
</aside>
