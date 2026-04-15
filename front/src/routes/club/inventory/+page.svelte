<script lang="ts">
  import { appState } from '$lib/stores.svelte';
  import { getClubAssets, createAsset, updateAsset, deleteAsset, toggleAssetAvailability } from '$lib/club-operations';
  import { formatCurrency } from '$lib/utils';
  import Toast from '$lib/components/Toast.svelte';

  const assets = $derived(getClubAssets(appState.activeClubId));
  const openCount = $derived(assets.filter(a => a.available).length);

  let showModal = $state(false);
  let editingId = $state<number | null>(null);
  let formName = $state('');
  let formDescription = $state('');
  let formPrice = $state(50000);
  let formPricePeriod = $state('Temporada');
  let formCategory = $state('naming');
  let formTags = $state('');
  let toastMessage = $state('');
  let toastVisible = $state(false);

  const categories = ['naming', 'experience', 'content', 'digital', 'csr', 'sub-brand'];

  function openCreate() {
    editingId = null;
    formName = '';
    formDescription = '';
    formPrice = 50000;
    formPricePeriod = 'Temporada';
    formCategory = 'naming';
    formTags = '';
    showModal = true;
  }

  function openEdit(assetId: number) {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;
    editingId = assetId;
    formName = asset.name;
    formDescription = asset.description;
    formPrice = asset.price;
    formPricePeriod = asset.pricePeriod;
    formCategory = asset.category;
    formTags = asset.tags.join(', ');
    showModal = true;
  }

  function handleSave() {
    if (!formName.trim()) return;
    const tags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingId) {
      updateAsset(editingId, { name: formName, description: formDescription, price: formPrice, pricePeriod: formPricePeriod, category: formCategory, tags });
      showToast('Asset actualizado');
    } else {
      createAsset({ clubId: appState.activeClubId, name: formName, description: formDescription, price: formPrice, pricePeriod: formPricePeriod, category: formCategory, tags });
      showToast('Asset creado');
    }
    showModal = false;
  }

  function handleDelete(id: number) {
    deleteAsset(id);
    showToast('Asset eliminado');
  }

  function handleToggle(id: number) {
    toggleAssetAvailability(id);
  }

  function showToast(msg: string) {
    toastMessage = msg;
    toastVisible = true;
    setTimeout(() => toastVisible = false, 3000);
  }
</script>

<div class="p-8">
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Inventario de Assets</h1>
      <p class="text-sm text-on-surface-variant mt-1">{assets.length} assets · {openCount} disponibles</p>
    </div>
    <button onclick={openCreate} class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      Crear listing
    </button>
  </div>

  <div class="space-y-4">
    {#each assets as asset (asset.id)}
      <div class="p-6 rounded-2xl bg-surface-container hover:bg-surface-bright transition-all duration-300">
        <div class="flex items-start justify-between mb-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-bold text-on-surface">{asset.name}</h3>
              {#if asset.available}
                <span class="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase">Disponible</span>
              {:else}
                <span class="px-2 py-0.5 rounded-full bg-outline/10 text-outline text-[10px] font-bold uppercase">No disponible</span>
              {/if}
            </div>
            <p class="text-sm text-on-surface-variant">{asset.description}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-lg font-black text-on-surface">{formatCurrency(asset.price)}</p>
            <p class="text-xs text-on-surface-variant">{asset.pricePeriod}</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-wrap gap-1">
            <span class="px-2 py-0.5 rounded text-[10px] text-primary bg-primary-container/10 uppercase font-medium">{asset.category}</span>
            {#each asset.tags as tag}
              <span class="px-2 py-0.5 rounded text-[10px] text-on-surface-variant bg-surface-high uppercase">{tag}</span>
            {/each}
          </div>
          <div class="flex items-center gap-1">
            <button onclick={() => handleToggle(asset.id)} class="p-1.5 rounded-lg hover:bg-surface-high text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Cambiar disponibilidad">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button onclick={() => openEdit(asset.id)} class="p-1.5 rounded-lg hover:bg-surface-high text-on-surface-variant hover:text-on-surface transition-colors" aria-label="Editar asset">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg>
            </button>
            <button onclick={() => handleDelete(asset.id)} class="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors" aria-label="Eliminar asset">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if assets.length === 0}
    <div class="text-center py-20">
      <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
      <p class="text-lg font-semibold text-on-surface mb-1">Sin assets</p>
      <p class="text-sm text-on-surface-variant">Crea tu primer listing de patrocinio</p>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick={() => showModal = false} aria-label="Cerrar modal"></button>
    <div class="relative bg-surface-container rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
      <h2 class="text-xl font-bold text-on-surface mb-6">{editingId ? 'Editar asset' : 'Nuevo listing'}</h2>
      <div class="space-y-4">
        <div>
          <label for="assetName" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Nombre</label>
          <input id="assetName" bind:value={formName} placeholder="Kit Sleeve Branding" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
        </div>
        <div>
          <label for="assetDesc" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Descripción</label>
          <textarea id="assetDesc" bind:value={formDescription} rows="2" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="assetPrice" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Precio (€)</label>
            <input id="assetPrice" type="number" bind:value={formPrice} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
          <div>
            <label for="assetPeriod" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Periodo</label>
            <input id="assetPeriod" bind:value={formPricePeriod} placeholder="Temporada" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          </div>
        </div>
        <div>
          <label for="assetCat" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Categoría</label>
          <select id="assetCat" bind:value={formCategory} class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary-container/50">
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>
        <div>
          <label for="assetTags" class="block text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-2">Tags (separados por coma)</label>
          <input id="assetTags" bind:value={formTags} placeholder="digital reach, tv exposure" class="w-full px-4 py-3 rounded-lg bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
        </div>
      </div>
      <div class="flex gap-3 justify-end mt-6">
        <button onclick={() => showModal = false} class="px-5 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-on-surface transition-colors">Cancelar</button>
        <button onclick={handleSave} class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
          {editingId ? 'Guardar' : 'Crear'}
        </button>
      </div>
    </div>
  </div>
{/if}

<Toast message={toastMessage} type="success" visible={toastVisible} />
