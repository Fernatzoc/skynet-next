import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    exp: number;
}

// Helper para decodificar base64 (compatible con Edge Runtime)
function decodeBase64(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8');
}

// Rutas que requieren autenticación
const protectedRoutes = ['/dashboard'];

// Rutas públicas (no requieren autenticación)
const publicRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar si la ruta actual requiere protección
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    const isPublicRoute = publicRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Obtener el token de las cookies
    const token = request.cookies.get('auth_token')?.value;

    // Si es una ruta protegida
    if (isProtectedRoute) {
        // Si no hay token, redirigir al login
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            // Intentar decodificar el token
            let decoded: JWTPayload;

            try {
                // Intentar como JWT real
                decoded = jwtDecode<JWTPayload>(token);
            } catch (jwtError) {
                // Si falla, intentar como token demo (base64)
                try {
                    decoded = JSON.parse(decodeBase64(token));
                } catch (base64Error) {
                    throw new Error('Invalid token format');
                }
            }

            const currentTime = Date.now() / 1000;

            if (decoded.exp < currentTime) {
                // Token expirado, redirigir al login
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('from', pathname);
                loginUrl.searchParams.set('expired', 'true');

                const response = NextResponse.redirect(loginUrl);
                response.cookies.delete('auth_token');
                response.cookies.delete('refresh_token');
                return response;
            }
        } catch (error) {
            // Token inválido, redirigir al login
            console.error('Invalid token:', error);
            const loginUrl = new URL('/login', request.url);

            const response = NextResponse.redirect(loginUrl);
            response.cookies.delete('auth_token');
            response.cookies.delete('refresh_token');
            return response;
        }
    }

    // Si es una ruta pública y el usuario ya está autenticado, redirigir al dashboard
    if (isPublicRoute && token) {
        try {
            let decoded: JWTPayload;

            try {
                // Intentar como JWT real
                decoded = jwtDecode<JWTPayload>(token);
            } catch (jwtError) {
                // Si falla, intentar como token demo (base64)
                try {
                    decoded = JSON.parse(decodeBase64(token));
                } catch (base64Error) {
                    // Token inválido, permitir acceso a la ruta pública
                    return NextResponse.next();
                }
            }

            const currentTime = Date.now() / 1000;

            // Si el token es válido, redirigir al dashboard
            if (decoded.exp > currentTime) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } catch (error) {
            // Token inválido, permitir acceso a la ruta pública
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
