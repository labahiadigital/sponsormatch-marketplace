import {
  DbConnection,
  type SubscriptionEventContext,
  type ErrorContext,
} from './module_bindings';
import type { Identity } from 'spacetimedb';

const SPACETIMEDB_URI = 'ws://127.0.0.1:3000';
const DB_NAME = 'sponsormatch-server-v2xmo';

let connection: DbConnection | null = null;

export function getConnection(): DbConnection | null {
  return connection;
}

export function connect(callbacks: {
  onConnect: (conn: DbConnection, identity: string, token: string) => void;
  onError: (error: Error) => void;
  onSubscriptionApplied: (ctx: SubscriptionEventContext) => void;
}): DbConnection {
  const savedToken = localStorage.getItem('sponsormatch_token') ?? undefined;

  const conn = DbConnection.builder()
    .withUri(SPACETIMEDB_URI)
    .withDatabaseName(DB_NAME)
    .withToken(savedToken)
    .onConnect((connInstance: DbConnection, identity: Identity, token: string) => {
      localStorage.setItem('sponsormatch_token', token);
      connection = connInstance;
      callbacks.onConnect(connInstance, identity.toHexString(), token);

      connInstance.subscriptionBuilder()
        .onApplied(callbacks.onSubscriptionApplied)
        .onError((ctx: ErrorContext) => callbacks.onError(new Error('Subscription error')))
        .subscribeToAllTables();
    })
    .onConnectError((_ctx: ErrorContext, err: Error) => {
      console.warn('SpacetimeDB connection error, using mock data:', err.message);
      callbacks.onError(err);
    })
    .onDisconnect(() => {
      connection = null;
    })
    .build();

  return conn;
}

export function disconnect() {
  connection = null;
}
