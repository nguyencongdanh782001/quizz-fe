import { NextResponse } from 'next/server';

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isNewUser = searchParams.get('is_new_user') === 'true';
  const role = searchParams.get('role');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/login?error=oauth_failed', request.url));
  }

  if (isNewUser === true || !role) {
    return NextResponse.redirect(new URL('/role', request.url));
  }

  if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url));
  if (role === 'student') return NextResponse.redirect(new URL('/student', request.url));

  return NextResponse.redirect(new URL('/', request.url));
}