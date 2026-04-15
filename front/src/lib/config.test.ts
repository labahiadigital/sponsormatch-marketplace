import { describe, test, expect } from 'vitest';
import { SPACETIMEDB_URI, MODULE_NAME } from './config';

describe('config', () => {
  test('SPACETIMEDB_URI is a valid WebSocket URL', () => {
    expect(SPACETIMEDB_URI).toMatch(/^wss?:\/\//);
  });

  test('MODULE_NAME is a non-empty string', () => {
    expect(MODULE_NAME).toBeTruthy();
    expect(typeof MODULE_NAME).toBe('string');
  });
});
