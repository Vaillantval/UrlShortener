import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

// Changement 1: Le nom de la fonction passe de "middleware" à "proxy"
export async function proxy(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();

  // Si pas de session et qu'on essaie d'accéder au dashboard
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Si session existante et qu'on essaie d'accéder à login
  if (session && req.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Changement 2: La configuration reste la même
export const config = {
  matcher: ['/dashboard/:path*', '/login']
};