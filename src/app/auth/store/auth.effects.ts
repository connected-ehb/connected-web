import {inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import {AuthService} from '../auth.service';
import {catchError, map, mergeMap, of, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';


@Injectable()
export class AuthEffects {
    private readonly actions$: Actions = inject(Actions);
    private readonly router: Router = inject(Router);
    private readonly authService: AuthService = inject(AuthService);
    private readonly PLATFORM_ID: Object = inject(PLATFORM_ID);

    // Effect to load the current session by calling /auth/user
    readonly loadSession$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadSession),
            mergeMap(() =>
                this.authService.getCurrentUser().pipe(
                    map(user => AuthActions.loadSessionSuccess({user})),
                    catchError(error =>
                        of(AuthActions.loadSessionFailure({error}))
                    )
                )
            )
        )
    );

    // Effect to redirect to the login page
    readonly redirectToLogin$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(AuthActions.redirectToLogin),
          tap(() => {
            // Only navigate if running in the browser.
            if (isPlatformBrowser(this.PLATFORM_ID)) {
              this.router.navigate(['/login']);
            } else {
              console.warn('Server-side rendering active: Skipping redirect to login.');
            }
          })
        ),
      { dispatch: false }
    );

    // Effect to redirect to the OAuth2 authorization endpoint if needed
    readonly redirectToCanvasLogin$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.redirectToCanvasLogin),
                tap(() => {
                    // Only navigate if running in the browser.
                    if (isPlatformBrowser(this.PLATFORM_ID)) {
                        window.location.href = `${environment.apiBaseUrl}/oauth2/authorization/canvas`;
                    } else {
                        console.warn('Server-side rendering active: Skipping redirect to login.');
                    }
                })
            ),
        { dispatch: false }
    );

    readonly login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            mergeMap(({ username, password }) =>
                this.authService.login(username, password).pipe(
                    // Once login is successful, load the current session.
                    mergeMap(() => [
                        AuthActions.loginSuccess(), // you could dispatch this action
                        AuthActions.loadSession() // trigger load of user details
                    ]),
                    catchError(error => of(AuthActions.loginFailure({ error })))
                )
            )
        )
    );

    readonly loginRedirect$ = createEffect(() =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                tap(() => {
                    this.router.navigate(['/']);
                })
            ),
        { dispatch: false }
    );

    readonly logout$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.logout),
            mergeMap(() =>
                this.authService.logoutRequest().pipe(   // rename to avoid confusion
                    map(() => AuthActions.logoutSuccess()),
                    catchError(error => of(AuthActions.logoutFailure({ error })))
                )
            )
        )
    );

    readonly logoutRedirect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logoutSuccess),
                tap(() => {
                    this.router.navigate(['/login']);
                })
            ),
        { dispatch: false }
    );

    readonly register$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.register),
            mergeMap(({ request }) =>
                this.authService.register(request).pipe(
                    map(user => AuthActions.registerSuccess({ user })),
                    catchError(error => of(AuthActions.registerFailure({ error })))
                )
            )
        )
    );

    readonly registerRedirect$ = createEffect(() =>
            this.actions$.pipe(
                ofType(AuthActions.registerSuccess),
                tap(() => {
                    this.router.navigate(['/guest']);
                })
            ),
        { dispatch: false }
    );
}
