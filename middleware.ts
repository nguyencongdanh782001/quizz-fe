import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TEACHER_ROUTES = ['/teacher'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

function decodeSession(cookieValue: string): { role: string } | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(cookieValue))));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get('auth-session');

  if (TEACHER_ROUTES.some(r => pathname.startsWith(r))) {
    if (!rawCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const session = decodeSession(rawCookie.value);
    if (!session || session.role !== 'teacher') {
      // Not a teacher — redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (rawCookie && AUTH_ROUTES.some(r => pathname === r)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/auth/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
