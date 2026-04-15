<script lang="ts">
  import { messages, clubs, deals } from '$lib/stores.svelte';
  import { sendMessage, markConversationRead, deleteConversation } from '$lib/store-operations';
  import { timeAgo } from '$lib/utils';

  interface Conversation {
    contactId: string;
    contactName: string;
    contactLogo: string;
    dealId: number;
    dealTitle: string;
    lastMessage: string;
    lastTimestamp: string;
    unread: number;
  }

  const conversations = $derived.by(() => {
    const convMap = new Map<string, Conversation>();
    for (const msg of messages) {
      const contactId = msg.senderIdentity === 'demo' ? msg.receiverIdentity : msg.senderIdentity;
      const existing = convMap.get(contactId);

      const deal = deals.find(d => d.id === msg.dealId);
      const clubId = deal?.clubId;
      const club = clubId ? clubs.find(c => c.id === clubId) : undefined;

      if (!existing || new Date(msg.timestamp) > new Date(existing.lastTimestamp)) {
        const unread = messages.filter(m => m.senderIdentity === contactId && m.receiverIdentity === 'demo' && !m.read).length;
        convMap.set(contactId, {
          contactId,
          contactName: club?.name ?? contactId,
          contactLogo: club?.logoUrl ?? '',
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
            (m.senderIdentity === 'demo' && m.receiverIdentity === activeConversation) ||
            (m.receiverIdentity === 'demo' && m.senderIdentity === activeConversation)
          )
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : []
  );

  const activeContact = $derived(conversations.find(c => c.contactId === activeConversation));

  function selectConversation(contactId: string) {
    activeConversation = contactId;
    markConversationRead(contactId);
  }

  function sendNewMessage() {
    if (!newMessage.trim() || !activeConversation || !activeContact) return;
    sendMessage(activeConversation, activeContact.dealId, newMessage);
    newMessage = '';
  }

  function handleDeleteConversation(contactId: string) {
    deleteConversation(contactId);
    if (activeConversation === contactId) {
      activeConversation = null;
    }
  }
</script>

<div class="flex h-screen">
  <div class="w-80 shrink-0 bg-surface overflow-y-auto" style="border-right: 1px solid rgba(67, 70, 85, 0.15);">
    <div class="p-6">
      <h1 class="text-xl font-black text-on-surface tracking-tight" style="letter-spacing: -0.03em;">Mensajes</h1>
    </div>

    <div class="px-3 pb-3">
      {#each conversations as conv}
        <button
          onclick={() => selectConversation(conv.contactId)}
          class="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all {
            activeConversation === conv.contactId
              ? 'bg-primary-container/15'
              : 'hover:bg-surface-container'
          }"
        >
          <img src={conv.contactLogo} alt={conv.contactName} class="w-10 h-10 rounded-lg object-cover shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between mb-0.5">
              <p class="text-sm font-semibold text-on-surface truncate">{conv.contactName}</p>
              <span class="text-[10px] text-on-surface-variant shrink-0">{timeAgo(conv.lastTimestamp)}</span>
            </div>
            <p class="text-xs text-on-surface-variant truncate">{conv.lastMessage}</p>
            {#if conv.unread > 0}
              <span class="inline-flex items-center justify-center mt-1 w-5 h-5 rounded-full bg-primary-container text-white text-[10px] font-bold">
                {conv.unread}
              </span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>

  <div class="flex-1 flex flex-col">
    {#if activeConversation && activeContact}
      <div class="flex items-center justify-between px-6 py-4 bg-surface-container">
        <div class="flex items-center gap-4">
          <img src={activeContact.contactLogo} alt={activeContact.contactName} class="w-10 h-10 rounded-lg object-cover" />
          <div>
            <p class="text-sm font-bold text-on-surface">{activeContact.contactName}</p>
            <p class="text-xs text-on-surface-variant">{activeContact.dealTitle}</p>
          </div>
        </div>
        <button
          onclick={() => handleDeleteConversation(activeContact!.contactId)}
          class="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-colors"
          aria-label="Eliminar conversación"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        {#each activeMessages as msg}
          <div class="flex {msg.senderIdentity === 'demo' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-md px-4 py-3 rounded-2xl {
              msg.senderIdentity === 'demo'
                ? 'bg-primary-container text-white rounded-br-md'
                : 'bg-surface-container text-on-surface rounded-bl-md'
            }">
              <p class="text-sm leading-relaxed">{msg.content}</p>
              <p class="text-[10px] mt-1 {
                msg.senderIdentity === 'demo' ? 'text-white/60' : 'text-on-surface-variant'
              }">
                {timeAgo(msg.timestamp)}
              </p>
            </div>
          </div>
        {/each}
      </div>

      <div class="p-4 bg-surface-container">
        <form onsubmit={(e) => { e.preventDefault(); sendNewMessage(); }} class="flex gap-3">
          <input
            bind:value={newMessage}
            placeholder="Escribe un mensaje..."
            class="flex-1 px-4 py-3 rounded-xl bg-surface-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container/50"
          />
          <button
            type="submit"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all shrink-0"
          >
            Enviar
          </button>
        </form>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <svg class="w-16 h-16 text-outline-variant mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
          </svg>
          <p class="text-lg font-semibold text-on-surface mb-1">Selecciona una conversación</p>
          <p class="text-sm text-on-surface-variant">Elige un contacto del panel izquierdo para ver los mensajes</p>
        </div>
      </div>
    {/if}
  </div>
</div>
