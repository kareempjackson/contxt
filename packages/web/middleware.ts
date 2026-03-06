import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes — redirect unauthenticated users to /auth/login
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated but non-onboarded users from /dashboard to /onboarding
  if (pathname.startsWith('/dashboard') && user && user.user_metadata?.onboarded !== true) {
    const onboardingUrl = request.nextUrl.clone();
    onboardingUrl.pathname = '/onboarding';
    return NextResponse.redirect(onboardingUrl);
  }

  // Protect /onboarding — must be authenticated
  if (pathname === '/onboarding' && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    return NextResponse.redirect(loginUrl);
  }

  // Already-onboarded users visiting /onboarding go to dashboard
  if (pathname === '/onboarding' && user?.user_metadata?.onboarded === true) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect already-authenticated users away from /auth/login and /auth/signup
  if ((pathname === '/auth/login' || pathname === '/auth/signup') && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
