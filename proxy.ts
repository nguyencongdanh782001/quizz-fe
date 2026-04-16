import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TEACHER_ROUTES = ['/teacher'];
const STUDENT_ROUTES = ['/student'];
const AUTH_ROUTES = ['/login', '/register'];
const LANDING = '/';

function decodeSession(cookieValue: string): { role: string } | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(cookieValue))));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawCookie = request.cookies.get('auth-session');
  const session = rawCookie ? decodeSession(rawCookie.value) : null;

  // Teacher routes — require teacher session
  if (TEACHER_ROUTES.some(r => pathname.startsWith(r))) {
    if (!session || session.role !== 'teacher') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Student routes — require student session
  if (STUDENT_ROUTES.some(r => pathname.startsWith(r))) {
    if (!session || session.role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users away from auth/landing pages
  if (session && (AUTH_ROUTES.includes(pathname) || pathname === LANDING)) {
    const destination = session.role === 'teacher' ? '/teacher' : '/student';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/login', '/register', '/'],
};
