import { inject } from '@angular/core';
import {
    HttpRequest,
    HttpEvent,
    HttpErrorResponse,
    HttpHandlerFn,
    HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ToastService } from '../../core/services/toast.service';
import {AuthFacade} from '../store/auth.facade';

export function authInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
    const toastService: ToastService = inject(ToastService);
    const authFacade: AuthFacade = inject(AuthFacade);

    return next(req).pipe(
        tap(event => {
            if (event instanceof HttpResponse) {
                // normal response, no-op
            }
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                const currentPath = window.location.pathname;
                if (
                    !currentPath.startsWith('/login') &&
                    !currentPath.startsWith('/register') &&
                    !currentPath.startsWith('/guest') &&
                    !currentPath.startsWith('/verify')
                ) {
                    toastService.showToast("error", 'Session expired, please login again');
                    authFacade.logout();
                }
            } else if (error.status === 404) {
                toastService.showToast("error", 'Resource not found');
            } else if (error.status >= 400 && error.status < 500) {
                toastService.showToast("error", error.error?.detail || 'Client error occurred');
            } else {
                toastService.showToast("error", 'Something went wrong, please try again');
            }

            return throwError(() => error);
        })
    );
}
