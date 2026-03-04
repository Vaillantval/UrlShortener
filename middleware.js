import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export default async function middleware(req) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({
            request: { headers: req.headers },
          })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // getUser() est plus fiable que getSession() côté serveur
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Protège /dashboard — redirige vers /login si pas connecté
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Évite d'aller sur /login si déjà connecté
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  // Exclut fichiers statiques, images et routes API pour éviter les boucles
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/callback).*)',
  ],
}