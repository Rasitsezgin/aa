import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        const session = await auth();
        
        if (!session?.user?.id) {
            // Redirect to login if not authenticated
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Optional: Check for admin role
        // In production, you should check user.role === 'admin'
        // For now, any authenticated user can access admin routes
        
        // If you have role-based access, uncomment this:
        /*
        if (session.user.role !== 'admin') {
            const unauthorizedUrl = new URL('/unauthorized', request.url);
            return NextResponse.redirect(unauthorizedUrl);
        }
        */
    }

    // Protect dashboard routes (if needed)
    if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/')) {
        const session = await auth();
        
        if (!session?.user?.id) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/dashboard/:path*'
    ]
};
