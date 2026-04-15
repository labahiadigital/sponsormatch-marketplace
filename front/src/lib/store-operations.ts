import type { Deal, SavedSearch, Message } from './types';
import { deals, savedSearches, messages } from './stores.svelte';

const MAX_SAVED_SEARCHES = 10;

interface CreateDealInput {
  clubId: number;
  amount: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export function createDeal(input: CreateDealInput): Deal {
  const maxId = deals.reduce((max, d) => Math.max(max, d.id), 0);
  const deal: Deal = {
    id: maxId + 1,
    brandIdentity: 'demo',
    clubId: input.clubId,
    status: 'pendiente',
    amount: input.amount,
    title: input.title,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: new Date().toISOString(),
  };
  deals.push(deal);
  return deal;
}

export function updateDealStatus(dealId: number, status: string): boolean {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return false;
  deal.status = status;
  return true;
}

export function updateDeal(dealId: number, updates: Partial<Omit<Deal, 'id' | 'brandIdentity' | 'createdAt'>>): boolean {
  const deal = deals.find(d => d.id === dealId);
  if (!deal) return false;
  Object.assign(deal, updates);
  return true;
}

export function deleteDeal(dealId: number): boolean {
  const index = deals.findIndex(d => d.id === dealId);
  if (index === -1) return false;
  deals.splice(index, 1);
  return true;
}

export function createSavedSearch(name: string, filters: Record<string, unknown> | object): SavedSearch {
  if (savedSearches.length >= MAX_SAVED_SEARCHES) {
    savedSearches.splice(0, savedSearches.length - MAX_SAVED_SEARCHES + 1);
  }
  const maxId = savedSearches.reduce((max, s) => Math.max(max, s.id), 0);
  const search: SavedSearch = {
    id: maxId + 1,
    brandIdentity: 'demo',
    name,
    filtersJson: JSON.stringify(filters),
    createdAt: new Date().toISOString(),
  };
  savedSearches.push(search);
  return search;
}

export function updateSavedSearch(searchId: number, name: string, filters: Record<string, unknown> | object): boolean {
  const search = savedSearches.find(s => s.id === searchId);
  if (!search) return false;
  search.name = name;
  search.filtersJson = JSON.stringify(filters);
  return true;
}

export function deleteSavedSearch(searchId: number): boolean {
  const index = savedSearches.findIndex(s => s.id === searchId);
  if (index === -1) return false;
  savedSearches.splice(index, 1);
  return true;
}

export function sendMessage(receiverIdentity: string, dealId: number, content: string): Message {
  const maxId = messages.reduce((max, m) => Math.max(max, m.id), 0);
  const msg: Message = {
    id: maxId + 1,
    senderIdentity: 'demo',
    receiverIdentity,
    dealId,
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };
  messages.push(msg);
  return msg;
}

export function markConversationRead(contactId: string): void {
  for (const msg of messages) {
    if (msg.senderIdentity === contactId && msg.receiverIdentity === 'demo') {
      msg.read = true;
    }
  }
}

export function deleteConversation(contactId: string): void {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.senderIdentity === contactId || m.receiverIdentity === contactId) {
      messages.splice(i, 1);
    }
  }
}
