import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  // Check if the request is for an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Get the JWT token from the request
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token) {
        // No token found, redirect to signin
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Check if user is admin by calling our admin verification API
      const adminCheckResponse = await fetch(`${request.nextUrl.origin}/api/admin/verify`, {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Cookie': request.headers.get('cookie') || ''
        }
      })

      if (!adminCheckResponse.ok) {
        // User is not admin, redirect to home page
        return NextResponse.redirect(new URL('/', request.url))
      }

      // User is admin, allow the request to proceed
      return NextResponse.next()
    } catch (error) {
      console.error('Admin middleware error:', error)
      // On error, redirect to home page for security
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // For non-admin routes, just continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all admin routes
    '/admin/:path*',
    // Match admin API routes
    '/api/admin/:path*'
  ]
} 