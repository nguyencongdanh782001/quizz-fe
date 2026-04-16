import { cookies } from 'next/headers';

const SESSION_COOKIE = 'auth-session';

export interface SessionUser {
  id: string;
  role: string;
  email: string;
}

export function decodeSession(cookieValue: string): SessionUser | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(cookieValue))));
  } catch {
    return null;
  }
}

/** Server-side: reads the auth-session cookie and returns the user, or null if not logged in. */
export async function getServerSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}
