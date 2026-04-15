import { describe, test, expect, beforeEach } from 'vitest';
import {
  createDeal,
  updateDealStatus,
  updateDeal,
  deleteDeal,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  sendMessage,
  markConversationRead,
  deleteConversation,
} from './store-operations';
import { deals, savedSearches, messages } from './stores.svelte';

function resetDeals() {
  deals.length = 0;
  deals.push(
    { id: 1, brandIdentity: 'demo', clubId: 1, status: 'aceptado', amount: 250000, title: 'Patrocinio camiseta', description: 'Logo en camiseta', startDate: '2026-07-01', endDate: '2027-06-30', createdAt: '2026-03-15' },
    { id: 2, brandIdentity: 'demo', clubId: 5, status: 'pendiente', amount: 50000, title: 'Cantera', description: 'Equipamiento', startDate: '2026-09-01', endDate: '2027-06-30', createdAt: '2026-04-01' },
  );
}

function resetSearches() {
  savedSearches.length = 0;
  savedSearches.push(
    { id: 1, brandIdentity: 'demo', name: 'Fútbol', filtersJson: '{"sport":"Fútbol"}', createdAt: '2026-04-01' },
  );
}

function resetMessages() {
  messages.length = 0;
  messages.push(
    { id: 1, senderIdentity: 'demo', receiverIdentity: 'club1', dealId: 1, content: 'Hola', timestamp: '2026-04-10T10:00:00Z', read: true },
    { id: 2, senderIdentity: 'club1', receiverIdentity: 'demo', dealId: 1, content: 'Hola!', timestamp: '2026-04-10T11:00:00Z', read: false },
    { id: 3, senderIdentity: 'demo', receiverIdentity: 'club5', dealId: 2, content: 'Info', timestamp: '2026-04-12T09:00:00Z', read: true },
  );
}

describe('createDeal', () => {
  beforeEach(resetDeals);

  test('adds a new deal to the store', () => {
    const before = deals.length;
    createDeal({ clubId: 13, amount: 80000, title: 'Esports naming', description: 'Naming LVP', startDate: '2026-06-01', endDate: '2026-12-31' });
    expect(deals.length).toBe(before + 1);
  });

  test('new deal has pending status', () => {
    createDeal({ clubId: 13, amount: 80000, title: 'Esports naming', description: 'Naming LVP', startDate: '2026-06-01', endDate: '2026-12-31' });
    const last = deals[deals.length - 1];
    expect(last.status).toBe('pendiente');
  });

  test('new deal has auto-incremented id', () => {
    createDeal({ clubId: 13, amount: 80000, title: 'Esports naming', description: 'Naming LVP', startDate: '2026-06-01', endDate: '2026-12-31' });
    const last = deals[deals.length - 1];
    expect(last.id).toBeGreaterThan(2);
  });

  test('returns the created deal', () => {
    const deal = createDeal({ clubId: 10, amount: 15000, title: 'Pádel', description: 'Torneo', startDate: '2026-05-01', endDate: '2026-05-03' });
    expect(deal.title).toBe('Pádel');
    expect(deal.clubId).toBe(10);
  });
});

describe('updateDealStatus', () => {
  beforeEach(resetDeals);

  test('changes deal status', () => {
    const result = updateDealStatus(2, 'aceptado');
    expect(result).toBe(true);
    expect(deals.find(d => d.id === 2)!.status).toBe('aceptado');
  });

  test('returns false for non-existent deal', () => {
    expect(updateDealStatus(999, 'aceptado')).toBe(false);
  });
});

describe('updateDeal', () => {
  beforeEach(resetDeals);

  test('updates deal fields', () => {
    const result = updateDeal(2, { amount: 75000, title: 'Cantera actualizado' });
    expect(result).toBe(true);
    const deal = deals.find(d => d.id === 2)!;
    expect(deal.amount).toBe(75000);
    expect(deal.title).toBe('Cantera actualizado');
  });

  test('does not modify unspecified fields', () => {
    updateDeal(2, { amount: 60000 });
    const deal = deals.find(d => d.id === 2)!;
    expect(deal.title).toBe('Cantera');
    expect(deal.description).toBe('Equipamiento');
  });

  test('returns false for non-existent deal', () => {
    expect(updateDeal(999, { amount: 100 })).toBe(false);
  });
});

describe('deleteDeal', () => {
  beforeEach(resetDeals);

  test('removes the deal from store', () => {
    const before = deals.length;
    const result = deleteDeal(2);
    expect(result).toBe(true);
    expect(deals.length).toBe(before - 1);
    expect(deals.find(d => d.id === 2)).toBeUndefined();
  });

  test('returns false for non-existent deal', () => {
    expect(deleteDeal(999)).toBe(false);
  });
});

describe('createSavedSearch', () => {
  beforeEach(resetSearches);

  test('adds a new saved search', () => {
    const before = savedSearches.length;
    createSavedSearch('Esports', { sport: 'Esports', budgetMin: 50000 });
    expect(savedSearches.length).toBe(before + 1);
  });

  test('stores filters as JSON string', () => {
    createSavedSearch('Pádel barato', { sport: 'Pádel', budgetMax: 30000 });
    const last = savedSearches[savedSearches.length - 1];
    const parsed = JSON.parse(last.filtersJson);
    expect(parsed.sport).toBe('Pádel');
    expect(parsed.budgetMax).toBe(30000);
  });

  test('enforces max 10 saved searches', () => {
    for (let i = 0; i < 12; i++) {
      createSavedSearch(`Search ${i}`, { sport: 'Test' });
    }
    expect(savedSearches.length).toBeLessThanOrEqual(10);
  });
});

describe('updateSavedSearch', () => {
  beforeEach(resetSearches);

  test('updates name and filters', () => {
    const result = updateSavedSearch(1, 'Fútbol Premium', { sport: 'Fútbol', budgetMin: 500000 });
    expect(result).toBe(true);
    const search = savedSearches.find(s => s.id === 1)!;
    expect(search.name).toBe('Fútbol Premium');
    expect(JSON.parse(search.filtersJson).budgetMin).toBe(500000);
  });

  test('returns false for non-existent search', () => {
    expect(updateSavedSearch(999, 'Nope', {})).toBe(false);
  });
});

describe('deleteSavedSearch', () => {
  beforeEach(resetSearches);

  test('removes the saved search', () => {
    const result = deleteSavedSearch(1);
    expect(result).toBe(true);
    expect(savedSearches.find(s => s.id === 1)).toBeUndefined();
  });

  test('returns false for non-existent search', () => {
    expect(deleteSavedSearch(999)).toBe(false);
  });
});

describe('sendMessage', () => {
  beforeEach(resetMessages);

  test('adds message to store', () => {
    const before = messages.length;
    sendMessage('club1', 1, '¿Qué tal el jueves?');
    expect(messages.length).toBe(before + 1);
  });

  test('new message has correct sender and receiver', () => {
    sendMessage('club5', 2, 'Más info por favor');
    const last = messages[messages.length - 1];
    expect(last.senderIdentity).toBe('demo');
    expect(last.receiverIdentity).toBe('club5');
    expect(last.dealId).toBe(2);
  });

  test('new message is not read', () => {
    sendMessage('club1', 1, 'Test');
    const last = messages[messages.length - 1];
    expect(last.read).toBe(false);
  });
});

describe('markConversationRead', () => {
  beforeEach(resetMessages);

  test('marks all messages from contact as read', () => {
    markConversationRead('club1');
    const fromClub1 = messages.filter(m => m.senderIdentity === 'club1' && m.receiverIdentity === 'demo');
    for (const msg of fromClub1) {
      expect(msg.read).toBe(true);
    }
  });

  test('does not affect messages from other contacts', () => {
    messages.push({ id: 4, senderIdentity: 'club5', receiverIdentity: 'demo', dealId: 2, content: 'Hey', timestamp: '2026-04-13T10:00:00Z', read: false });
    markConversationRead('club1');
    const club5Msg = messages.find(m => m.id === 4)!;
    expect(club5Msg.read).toBe(false);
  });
});

describe('deleteConversation', () => {
  beforeEach(resetMessages);

  test('removes all messages with a contact', () => {
    deleteConversation('club1');
    const remaining = messages.filter(m => m.senderIdentity === 'club1' || m.receiverIdentity === 'club1');
    expect(remaining.length).toBe(0);
  });

  test('does not remove messages from other contacts', () => {
    deleteConversation('club1');
    expect(messages.length).toBeGreaterThan(0);
    expect(messages.some(m => m.receiverIdentity === 'club5')).toBe(true);
  });
});
