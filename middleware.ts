import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-edge'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  // Define route groups
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password')
  const isProtectedPage =
    pathname.startsWith('/home') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/find') ||
    pathname.startsWith('/saved-lists') ||
    pathname.startsWith('/friends') ||
    pathname.startsWith('/history') ||
    pathname.startsWith('/account')

  // No token and trying to access protected page -> redirect to login
  if (!token && isProtectedPage) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has token -> verify it
  if (token) {
    const payload = await verifyToken(token)

    // Token is invalid and trying to access protected page -> redirect to login
    if (!payload && isProtectedPage) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Token is valid and trying to access auth page -> redirect to home
    if (payload && isAuthPage) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
