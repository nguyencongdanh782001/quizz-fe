import { NextResponse } from 'next/server';

export function proxy() {
  // Auth gating now relies on server-side session checks in layouts/pages.
  // Keeping proxy passive avoids redirect loops from stale optimistic cookies
  // and local host normalization during development.
  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*'],
};
