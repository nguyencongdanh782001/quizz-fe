/**
 * Typed event emitter for auth-related events.
 * Bridges the gap between non-React code (axios interceptors)
 * and React components (toast notifications).
 */

type AuthEventType = "SESSION_EXPIRED";

interface AuthEvent {
  type: AuthEventType;
}

const listeners = new Set<(event: AuthEvent) => void>();

/** Emit an auth event to all registered listeners. */
export function emitAuthEvent(type: AuthEventType): void {
  listeners.forEach((fn) => fn({ type }));
}

/**
 * Register a listener for auth events.
 * Returns an unsubscribe function.
 */
export function onAuthEvent(fn: (event: AuthEvent) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
