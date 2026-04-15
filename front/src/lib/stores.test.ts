import { describe, test, expect } from 'vitest';
import { clubs, clubMetrics, deals, messages, savedSearches } from './stores.svelte';

describe('clubs store', () => {
  test('contains 20 clubs', () => {
    expect(clubs).toHaveLength(20);
  });

  test('each club has required fields', () => {
    for (const club of clubs) {
      expect(club.id).toBeGreaterThan(0);
      expect(club.name).toBeTruthy();
      expect(club.sport).toBeTruthy();
      expect(club.location).toBeTruthy();
      expect(club.budgetMin).toBeGreaterThanOrEqual(0);
      expect(club.budgetMax).toBeGreaterThan(club.budgetMin);
    }
  });

  test('club IDs are unique', () => {
    const ids = clubs.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('contains expected sports', () => {
    const sports = [...new Set(clubs.map((c) => c.sport))];
    expect(sports).toContain('Fútbol');
    expect(sports).toContain('Baloncesto');
    expect(sports).toContain('Pádel');
    expect(sports).toContain('Esports');
  });
});

describe('clubMetrics store', () => {
  test('has metric for every club', () => {
    for (const club of clubs) {
      expect(clubMetrics.has(club.id)).toBe(true);
    }
  });

  test('metrics have valid engagement rates', () => {
    for (const [, metrics] of clubMetrics) {
      expect(metrics.engagementRate).toBeGreaterThan(0);
      expect(metrics.engagementRate).toBeLessThan(100);
    }
  });

  test('metrics followers are positive', () => {
    for (const [, metrics] of clubMetrics) {
      expect(metrics.followers).toBeGreaterThan(0);
    }
  });
});

describe('deals store', () => {
  test('contains initial demo deals', () => {
    expect(deals.length).toBeGreaterThan(0);
  });

  test('each deal has valid status', () => {
    const validStatuses = ['aceptado', 'pendiente', 'rechazado', 'cancelado'];
    for (const deal of deals) {
      expect(validStatuses).toContain(deal.status);
    }
  });

  test('deal amounts are positive', () => {
    for (const deal of deals) {
      expect(deal.amount).toBeGreaterThan(0);
    }
  });

  test('deal dates are valid ISO strings', () => {
    for (const deal of deals) {
      expect(new Date(deal.startDate).toString()).not.toBe('Invalid Date');
      expect(new Date(deal.endDate).toString()).not.toBe('Invalid Date');
    }
  });
});

describe('messages store', () => {
  test('contains initial messages', () => {
    expect(messages.length).toBeGreaterThan(0);
  });

  test('each message has content and timestamp', () => {
    for (const msg of messages) {
      expect(msg.content).toBeTruthy();
      expect(new Date(msg.timestamp).toString()).not.toBe('Invalid Date');
    }
  });

  test('messages reference valid deal IDs', () => {
    const dealIds = deals.map((d) => d.id);
    for (const msg of messages) {
      expect(dealIds).toContain(msg.dealId);
    }
  });
});

describe('savedSearches store', () => {
  test('contains initial saved searches', () => {
    expect(savedSearches.length).toBeGreaterThan(0);
  });

  test('each saved search has parseable JSON filters', () => {
    for (const search of savedSearches) {
      expect(() => JSON.parse(search.filtersJson)).not.toThrow();
    }
  });

  test('saved search names are non-empty', () => {
    for (const search of savedSearches) {
      expect(search.name).toBeTruthy();
    }
  });
});
