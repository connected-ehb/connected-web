import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * CSRF Interceptor for Spring Security 6 integration
 *
 * This interceptor handles CSRF token management for Angular + Spring Security:
 * 1. Reads the XSRF-TOKEN cookie set by Spring Security
 * 2. Adds it as the X-XSRF-TOKEN header on state-changing requests (POST, PUT, DELETE, PATCH)
 *
 * Spring Security Configuration Requirements:
 * - CookieCsrfTokenRepository.withHttpOnlyFalse() must be configured
 * - Backend sends CSRF token in cookie named 'XSRF-TOKEN'
 * - Backend expects token in header named 'X-XSRF-TOKEN'
 */
export function csrfInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    // Only add CSRF token for state-changing requests
    const requiresCsrf = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method);

    console.log('[CSRF Interceptor] Request:', req.method, req.url, 'Requires CSRF:', requiresCsrf);

    if (!requiresCsrf) {
        return next(req);
    }

    // Read CSRF token from cookie
    const csrfToken = getCsrfTokenFromCookie();
    console.log('[CSRF Interceptor] All cookies:', document.cookie);
    console.log('[CSRF Interceptor] CSRF Token found:', csrfToken);

    if (csrfToken) {
        // Clone request and add CSRF header
        const clonedReq = req.clone({
            headers: req.headers.set('X-XSRF-TOKEN', csrfToken)
        });
        console.log('[CSRF Interceptor] Added X-XSRF-TOKEN header:', csrfToken);
        return next(clonedReq);
    }

    // If no token found, proceed without it
    // Spring Security will reject the request if CSRF is required
    console.warn('[CSRF Interceptor] No CSRF token found in cookies!');
    return next(req);
}

/**
 * Extracts the CSRF token from browser cookies
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
