import { describe, test, expect } from 'vitest';
import {
  formatNumber,
  formatCurrency,
  formatDate,
  timeAgo,
  getStatusColor,
  getStatusBgColor,
} from './utils';

describe('formatNumber', () => {
  test('formats millions with M suffix', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M');
  });

  test('formats exact million', () => {
    expect(formatNumber(1_000_000)).toBe('1.0M');
  });

  test('formats thousands with K suffix', () => {
    expect(formatNumber(45_000)).toBe('45.0K');
  });

  test('formats exact thousand', () => {
    expect(formatNumber(1_000)).toBe('1.0K');
  });

  test('returns raw number below thousand', () => {
    expect(formatNumber(999)).toBe('999');
  });

  test('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  test('formats large millions', () => {
    expect(formatNumber(150_000_000)).toBe('150.0M');
  });
});

describe('formatCurrency', () => {
  test('formats euros with ES locale', () => {
    const result = formatCurrency(250000);
    expect(result).toContain('250.000');
    expect(result).toContain('€');
  });

  test('formats zero euros', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });
});

describe('formatDate', () => {
  test('formats ISO date to Spanish locale', () => {
    const result = formatDate('2026-04-15');
    expect(result).toMatch(/15/);
    expect(result).toMatch(/abr/i);
    expect(result).toMatch(/2026/);
  });
});

describe('timeAgo', () => {
  test('returns minutes for recent times', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('hace 5min');
  });

  test('returns hours for times under 24h', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('hace 3h');
  });

  test('returns days for times over 24h', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe('hace 2d');
  });
});

describe('getStatusColor', () => {
  test('returns success color for aceptado', () => {
    expect(getStatusColor('aceptado')).toBe('text-success');
  });

  test('returns warning color for pendiente', () => {
    expect(getStatusColor('pendiente')).toBe('text-warning');
  });

  test('returns error color for rechazado', () => {
    expect(getStatusColor('rechazado')).toBe('text-error');
  });

  test('returns outline color for cancelado', () => {
    expect(getStatusColor('cancelado')).toBe('text-outline');
  });

  test('returns default color for unknown status', () => {
    expect(getStatusColor('desconocido')).toBe('text-on-surface-variant');
  });
});

describe('getStatusBgColor', () => {
  test('returns success bg for aceptado', () => {
    expect(getStatusBgColor('aceptado')).toBe('bg-success/10');
  });

  test('returns warning bg for pendiente', () => {
    expect(getStatusBgColor('pendiente')).toBe('bg-warning/10');
  });

  test('returns error bg for rechazado', () => {
    expect(getStatusBgColor('rechazado')).toBe('bg-error/10');
  });

  test('returns outline bg for cancelado', () => {
    expect(getStatusBgColor('cancelado')).toBe('bg-outline/10');
  });

  test('returns default bg for unknown status', () => {
    expect(getStatusBgColor('desconocido')).toBe('bg-surface-container');
  });
});
