import { HttpRequest, HttpEvent, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * CSRF Interceptor for Spring Security 6 with cross-origin support
 *
 * This interceptor handles CSRF token management for Angular + Spring Security
 * in cross-origin scenarios where cookies cannot be read by JavaScript:
 * 1. Reads CSRF token from response headers (X-XSRF-TOKEN) sent by backend filter
 * 2. Caches the token in memory
 * 3. Adds it as the X-XSRF-TOKEN header on state-changing requests (POST, PUT, DELETE, PATCH)
 *
 * Backend Requirements:
 * - CookieCsrfTokenRepository.withHttpOnlyFalse() configured
 * - CsrfTokenResponseHeaderFilter that adds X-XSRF-TOKEN to all response headers
 * - CORS config must expose X-XSRF-TOKEN header
 * - Backend expects token in header named 'X-XSRF-TOKEN'
 */

// In-memory cache for CSRF token
let cachedCsrfToken: string | null = null;

export function csrfInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const METHOD_REQUIRES_CSRF = ['POST', 'PUT', 'DELETE', 'PATCH'];

    // Capture CSRF token from any response header
    const captureToken = (event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
            const csrfToken = event.headers.get('X-XSRF-TOKEN');
            if (csrfToken && csrfToken !== cachedCsrfToken) {
                console.log('[CSRF Interceptor] Cached token from response header:', csrfToken);
                cachedCsrfToken = csrfToken;
            }
        }
    };

    // For non-mutating requests, just capture the token if present
    if (!METHOD_REQUIRES_CSRF.includes(req.method)) {
        return next(req).pipe(tap(captureToken));
    }

    // For mutating requests, add the CSRF token if available
    console.log('[CSRF Interceptor] Request:', req.method, req.url);

    // Try cached token first
    if (cachedCsrfToken) {
        console.log('[CSRF Interceptor] Using cached token:', cachedCsrfToken);
        const clonedReq = req.clone({
            headers: req.headers.set('X-XSRF-TOKEN', cachedCsrfToken)
        });
        return next(clonedReq).pipe(tap(captureToken));
    }

    // Try to read from cookie (works for same-origin scenarios)
    const cookieToken = getCsrfTokenFromCookie();
    if (cookieToken) {
        console.log('[CSRF Interceptor] Found token in cookie:', cookieToken);
        cachedCsrfToken = cookieToken;
        const clonedReq = req.clone({
            headers: req.headers.set('X-XSRF-TOKEN', cookieToken)
        });
        return next(clonedReq).pipe(tap(captureToken));
    }

    // No token available yet - proceed without it
    // Backend will send 403, but will include the token in the response header
    // User will need to retry after token is captured
    console.warn('[CSRF Interceptor] No token available - request will likely fail with 403');
    console.warn('[CSRF Interceptor] Token will be captured from response for next request');
    return next(req).pipe(tap(captureToken));
}

/**
 * Extracts the CSRF token from browser cookies (for same-origin scenarios)
 * @returns The CSRF token value or null if not found
 */
function getCsrfTokenFromCookie(): string | null {
    const name = 'XSRF-TOKEN=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length);
        }
    }
    return null;
}

/**
 * Clears the cached CSRF token (useful for logout scenarios)
 */
export function clearCsrfToken(): void {
    cachedCsrfToken = null;
    console.log('[CSRF Interceptor] Token cache cleared');
}
