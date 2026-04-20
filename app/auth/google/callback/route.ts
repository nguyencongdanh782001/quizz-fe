import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const incoming = new URL(request.url);
  const target = new URL('/auth/callback', incoming.origin);

  incoming.searchParams.forEach((value, key) => {
    if (key === 'is_new_user' && value === 'true') {
      target.searchParams.set('needs_onboarding', 'true');
      return;
    }

    target.searchParams.append(key, value);
  });

  return NextResponse.redirect(target);
}
