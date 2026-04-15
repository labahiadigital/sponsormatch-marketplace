import { describe, test, expect, beforeEach } from 'vitest';
import {
  updateClubProfile,
  createAsset,
  updateAsset,
  deleteAsset,
  toggleAssetAvailability,
  getClubDeals,
  respondToDeal,
  addNegotiationEvent,
  getClubAssets,
  sendClubMessage,
} from './club-operations';
import { clubs, clubProfiles, deals, messages } from './stores.svelte';
import type { SponsorshipAsset, NegotiationEvent } from './types';

let { sponsorshipAssets, negotiationEvents } = await import('./stores.svelte');

function resetAssets() {
  sponsorshipAssets.length = 0;
  sponsorshipAssets.push(
    { id: 1, clubId: 1, name: 'Kit Sleeve', description: 'Sleeve branding', price: 2400000, pricePeriod: 'Temporada', category: 'naming', tags: ['tv'], available: true },
    { id: 2, clubId: 1, name: 'Stadium Naming', description: 'Naming rights', price: 12000000, pricePeriod: '5 Años', category: 'naming', tags: ['naming'], available: true },
    { id: 3, clubId: 5, name: 'Camiseta', description: 'Logo camiseta', price: 200000, pricePeriod: 'Temporada', category: 'naming', tags: ['branding'], available: true },
  );
}

function resetDeals() {
  deals.length = 0;
  deals.push(
    { id: 1, brandIdentity: 'demo', clubId: 1, status: 'aceptado', amount: 250000, title: 'Camiseta 26/27', description: 'Logo camiseta', startDate: '2026-07-01', endDate: '2027-06-30', createdAt: '2026-03-15' },
    { id: 2, brandIdentity: 'demo', clubId: 5, status: 'pendiente', amount: 50000, title: 'Cantera', description: 'Equipamiento', startDate: '2026-09-01', endDate: '2027-06-30', createdAt: '2026-04-01' },
    { id: 3, brandIdentity: 'brand2', clubId: 1, status: 'pendiente', amount: 100000, title: 'Digital Partner', description: 'Content', startDate: '2026-06-01', endDate: '2026-12-31', createdAt: '2026-04-10' },
  );
}

function resetMessages() {
  messages.length = 0;
  messages.push(
    { id: 1, senderIdentity: 'demo', receiverIdentity: 'club1', dealId: 1, content: 'Hola', timestamp: '2026-04-10T10:00:00Z', read: true },
    { id: 2, senderIdentity: 'club1', receiverIdentity: 'demo', dealId: 1, content: 'Hola!', timestamp: '2026-04-10T11:00:00Z', read: false },
  );
}

function resetNegotiations() {
  negotiationEvents.length = 0;
  negotiationEvents.push(
    { id: 1, dealId: 1, type: 'created', description: 'Propuesta inicial', timestamp: '2026-03-15T10:00:00Z' },
  );
}

describe('updateClubProfile', () => {
  test('updates territory and purpose', () => {
    const result = updateClubProfile(1, { territory: 'Nuevo territorio', purpose: 'Nuevo propósito' });
    expect(result).toBe(true);
    const profile = clubProfiles.get(1)!;
    expect(profile.territory).toBe('Nuevo territorio');
    expect(profile.purpose).toBe('Nuevo propósito');
  });

  test('updates partial fields only', () => {
    const original = clubProfiles.get(1)!;
    const origPillars = [...original.contentPillars];
    updateClubProfile(1, { territory: 'Solo territorio' });
    const updated = clubProfiles.get(1)!;
    expect(updated.territory).toBe('Solo territorio');
    expect(updated.contentPillars).toEqual(origPillars);
  });

  test('returns false for non-existent club', () => {
    expect(updateClubProfile(999, { territory: 'X' })).toBe(false);
  });
});

describe('createAsset', () => {
  beforeEach(resetAssets);

  test('adds a new asset to the store', () => {
    const before = sponsorshipAssets.length;
    createAsset({ clubId: 1, name: 'VIP Box', description: 'VIP access', price: 500000, pricePeriod: 'Temporada', category: 'experience', tags: ['hospitality'] });
    expect(sponsorshipAssets.length).toBe(before + 1);
  });

  test('new asset is available by default', () => {
    const asset = createAsset({ clubId: 1, name: 'VIP Box', description: 'VIP', price: 500000, pricePeriod: 'Season', category: 'experience', tags: [] });
    expect(asset.available).toBe(true);
  });

  test('returns the created asset with id', () => {
    const asset = createAsset({ clubId: 1, name: 'Test', description: 'Test', price: 1000, pricePeriod: 'Event', category: 'test', tags: [] });
    expect(asset.id).toBeGreaterThan(0);
    expect(asset.name).toBe('Test');
  });
});

describe('updateAsset', () => {
  beforeEach(resetAssets);

  test('updates asset fields', () => {
    const result = updateAsset(1, { name: 'Updated Sleeve', price: 3000000 });
    expect(result).toBe(true);
    const asset = sponsorshipAssets.find(a => a.id === 1)!;
    expect(asset.name).toBe('Updated Sleeve');
    expect(asset.price).toBe(3000000);
  });

  test('does not modify unspecified fields', () => {
    updateAsset(1, { price: 5000000 });
    const asset = sponsorshipAssets.find(a => a.id === 1)!;
    expect(asset.name).toBe('Kit Sleeve');
  });

  test('returns false for non-existent asset', () => {
    expect(updateAsset(999, { name: 'X' })).toBe(false);
  });
});

describe('deleteAsset', () => {
  beforeEach(resetAssets);

  test('removes asset from store', () => {
    const before = sponsorshipAssets.length;
    expect(deleteAsset(1)).toBe(true);
    expect(sponsorshipAssets.length).toBe(before - 1);
    expect(sponsorshipAssets.find(a => a.id === 1)).toBeUndefined();
  });

  test('returns false for non-existent', () => {
    expect(deleteAsset(999)).toBe(false);
  });
});

describe('toggleAssetAvailability', () => {
  beforeEach(resetAssets);

  test('toggles available to false', () => {
    expect(toggleAssetAvailability(1)).toBe(true);
    expect(sponsorshipAssets.find(a => a.id === 1)!.available).toBe(false);
  });

  test('toggles available back to true', () => {
    toggleAssetAvailability(1);
    toggleAssetAvailability(1);
    expect(sponsorshipAssets.find(a => a.id === 1)!.available).toBe(true);
  });
});

describe('getClubAssets', () => {
  beforeEach(resetAssets);

  test('returns only assets for the given club', () => {
    const assets = getClubAssets(1);
    expect(assets.length).toBe(2);
    expect(assets.every(a => a.clubId === 1)).toBe(true);
  });

  test('returns empty array for club with no assets', () => {
    expect(getClubAssets(999).length).toBe(0);
  });
});

describe('getClubDeals', () => {
  beforeEach(resetDeals);

  test('returns deals for the given club', () => {
    const clubDeals = getClubDeals(1);
    expect(clubDeals.length).toBe(2);
    expect(clubDeals.every(d => d.clubId === 1)).toBe(true);
  });

  test('returns empty for club with no deals', () => {
    expect(getClubDeals(999).length).toBe(0);
  });
});

describe('respondToDeal', () => {
  beforeEach(() => { resetDeals(); resetNegotiations(); });

  test('accepts a pending deal', () => {
    const result = respondToDeal(2, 'accepted', 'Aceptamos la propuesta');
    expect(result).toBe(true);
    expect(deals.find(d => d.id === 2)!.status).toBe('aceptado');
  });

  test('rejects a pending deal', () => {
    respondToDeal(2, 'rejected', 'No encaja');
    expect(deals.find(d => d.id === 2)!.status).toBe('rechazado');
  });

  test('creates a counter offer', () => {
    respondToDeal(2, 'counter', 'Proponemos 60.000 €');
    expect(deals.find(d => d.id === 2)!.status).toBe('pendiente');
  });

  test('adds negotiation event', () => {
    const before = negotiationEvents.length;
    respondToDeal(2, 'accepted', 'Aceptamos');
    expect(negotiationEvents.length).toBe(before + 1);
    const last = negotiationEvents[negotiationEvents.length - 1];
    expect(last.dealId).toBe(2);
    expect(last.type).toBe('accepted');
  });

  test('returns false for non-existent deal', () => {
    expect(respondToDeal(999, 'accepted', 'OK')).toBe(false);
  });
});

describe('addNegotiationEvent', () => {
  beforeEach(resetNegotiations);

  test('adds an event to store', () => {
    const before = negotiationEvents.length;
    addNegotiationEvent(1, 'modified', 'Cambio de condiciones');
    expect(negotiationEvents.length).toBe(before + 1);
  });
});

describe('sendClubMessage', () => {
  beforeEach(resetMessages);

  test('sends message from club identity', () => {
    sendClubMessage(1, 'demo', 1, 'Respuesta del club');
    const last = messages[messages.length - 1];
    expect(last.senderIdentity).toBe('club1');
    expect(last.receiverIdentity).toBe('demo');
    expect(last.content).toBe('Respuesta del club');
  });
});
