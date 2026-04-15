<script lang="ts">
  import { appState, messages, deals, negotiationEvents } from '$lib/stores.svelte';
  import { sendClubMessage } from '$lib/club-operations';
  import { markConversationRead } from '$lib/store-operations';
  import { timeAgo, formatCurrency, formatDate, getStatusColor, getStatusBgColor } from '$lib/utils';

  const clubIdentity = $derived(`club${appState.activeClubId}`);

  interface Conversation {
    contactId: string;
    contactName: string;
    dealId: number;
    dealTitle: string;
    lastMessage: string;
    lastTimestamp: string;
    unread: number;
  }

  const conversations = $derived.by(() => {
    const convMap = new Map<string, Conversation>();
    for (const msg of messages) {
      if (msg.senderIdentity !== clubIdentity && msg.receiverIdentity !== clubIdentity) continue;
      const contactId = msg.senderIdentity === clubIdentity ? msg.receiverIdentity : msg.senderIdentity;
      const existing = convMap.get(contactId);
      const deal = deals.find(d => d.id === msg.dealId);
      if (!existing || new Date(msg.timestamp) > new Date(existing.lastTimestamp)) {
        const unread = messages.filter(m => m.senderIdentity === contactId && m.receiverIdentity === clubIdentity && !m.read).length;
        convMap.set(contactId, {
          contactId,
          contactName: contactId,
          dealId: msg.dealId,
          dealTitle: deal?.title ?? '',
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          unread,
        });
      }
    }
    return [...convMap.values()].sort((a, b) => new Date(b.lastTimestamp).getTime() - new Date(a.lastTimestamp).getTime());
  });

  let activeConversation = $state<string | null>(null);
  let newMessage = $state('');

  const activeMessages = $derived(
    activeConversation
      ? messages
          .filter(m =>
            (m.senderIdentity === clubIdentity && m.receiverIdentity === activeConversation) ||
            (m.receiverIdentity === clubIdentity && m.senderIdentity === activeConversation)
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : []
  );

  const activeContact = $derived(conversations.find(c => c.contactId === activeConversation));
  const activeDeal = $derived(activeContact ? deals.find(d => d.id === activeContact.dealId) : null);
  const activeEvents = $derived(activeDeal ? negotiationEvents.filter(e => e.dealId === activeDeal.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) : []);

  function selectConversation(contactId: string) {
    activeConversation = contactId;
    for (const msg of messages) {
      if (msg.senderIdentity === contactId && msg.receiverIdentity === clubIdentity && !msg.read) {
        msg.read = true;
      }
    }
  }

  function handleSend() {
    if (!newMessage.trim() || !activeConversation || !activeContact) return;
    sendClubMessage(appState.activeClubId, activeConversation, activeContact.dealId, newMessage);
    newMessage = '';
  }
</script>

<div class="flex h-screen">
  <div class="w-72 shrink-0 bg-surface overflow-y-auto" style="border-right: 1px solid rgba(67, 70, 85, 0.15);">
    <div class="p-6">
      <h1 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant">Negociaciones activas</h1>
    </div>
    <div class="px-3 pb-3">
      {#each conversations as conv}
        <button
          onclick={() => selectConversation(conv.contactId)}
          class="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all {activeConversation === conv.contactId ? 'bg-primary-container/15' : 'hover:bg-surface-container'}"
        >
          <div class="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
            <span class="text-xs font-bold text-on-surface-variant">{conv.contactName.slice(0, 2).toUpperCase()}</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between mb-0.5">
              <p class="text-sm font-semibold text-on-surface truncate">{conv.contactName}</p>
              <span class="text-[10px] text-on-surface-variant shrink-0">{timeAgo(conv.lastTimestamp)}</span>
            </div>
            <p class="text-xs text-on-surface-variant truncate">{conv.lastMessage}</p>
            {#if conv.unread > 0}
              <span class="inline-flex items-center justify-center mt-1 w-5 h-5 rounded-full bg-primary-container text-white text-[10px] font-bold">{conv.unread}</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <div class="flex-1 flex flex-col">
    {#if activeConversation && activeContact}
      <div class="flex items-center gap-4 px-6 py-4 bg-surface-container">
        <div class="w-10 h-10 rounded-lg bg-surface-high flex items-center justify-center">
          <span class="text-xs font-bold text-on-surface-variant">{activeContact.contactName.slice(0, 2).toUpperCase()}</span>
        </div>
        <div>
          <p class="text-sm font-bold text-on-surface">{activeContact.contactName}</p>
          <p class="text-xs text-on-surface-variant">{activeContact.dealTitle}</p>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        {#each activeMessages as msg}
          <div class="flex {msg.senderIdentity === clubIdentity ? 'justify-end' : 'justify-start'}">
            <div class="max-w-md px-4 py-3 rounded-2xl {msg.senderIdentity === clubIdentity ? 'bg-primary-container text-white rounded-br-md' : 'bg-surface-container text-on-surface rounded-bl-md'}">
              <p class="text-sm leading-relaxed">{msg.content}</p>
              <p class="text-[10px] mt-1 {msg.senderIdentity === clubIdentity ? 'text-white/60' : 'text-on-surface-variant'}">{timeAgo(msg.timestamp)}</p>
            </div>
          </div>
        {/each}
      </div>

      <div class="p-4 bg-surface-container">
        <form onsubmit={(e) => { e.preventDefault(); handleSend(); }} class="flex gap-3">
          <input bind:value={newMessage} placeholder="Escribe un mensaje o propuesta..." class="flex-1 px-4 py-3 rounded-xl bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50" />
          <button type="submit" class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all shrink-0">Enviar</button>
        </form>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          <p class="text-lg font-semibold text-on-surface mb-1">Selecciona una conversación</p>
          <p class="text-sm text-on-surface-variant">Elige un contacto del panel izquierdo</p>
        </div>
      </div>
    {/if}
  </div>

  {#if activeDeal}
    <div class="w-80 shrink-0 bg-surface overflow-y-auto p-6 space-y-6" style="border-left: 1px solid rgba(67, 70, 85, 0.15);">
      <div>
        <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Contract overview</h2>
        <div class="p-5 rounded-2xl bg-surface-container">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs uppercase tracking-widest text-on-surface-variant">Status</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase {getStatusColor(activeDeal.status)} {getStatusBgColor(activeDeal.status)}">{activeDeal.status}</span>
          </div>
          <h3 class="text-base font-bold text-on-surface mb-4">{activeDeal.title}</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Monto</span>
              <span class="font-bold text-on-surface">{formatCurrency(activeDeal.amount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-on-surface-variant">Duración</span>
              <span class="font-medium text-on-surface">{activeDeal.startDate} — {activeDeal.endDate}</span>
            </div>
          </div>
        </div>
      </div>

      {#if activeEvents.length > 0}
        <div>
          <h2 class="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-4">Historial de negociación</h2>
          <div class="space-y-4">
            {#each activeEvents as event}
              <div class="flex items-start gap-3">
                <div class="w-2.5 h-2.5 rounded-full mt-1 shrink-0 {event.type === 'accepted' ? 'bg-success' : event.type === 'rejected' ? 'bg-error' : 'bg-primary-container'}"></div>
                <div>
                  <p class="text-xs font-medium text-on-surface">{event.description}</p>
                  <p class="text-[10px] text-on-surface-variant">{formatDate(event.timestamp)}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
