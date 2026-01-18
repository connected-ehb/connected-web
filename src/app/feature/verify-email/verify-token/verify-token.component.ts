import {Component, inject, OnInit, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {environment} from '../../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {AuthFacade} from '../../../auth/store/auth.facade';

@Component({
    selector: 'app-verify-token',
    imports: [
        CommonModule,
        ButtonComponent
    ],
    templateUrl: './verify-token.component.html',
    styleUrl: './verify-token.component.scss'
})
export class VerifyTokenComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly http = inject(HttpClient);
    private readonly authFacade = inject(AuthFacade);
    private readonly platformId = inject(PLATFORM_ID);

    isLoading: boolean = true;
    isError: boolean = false;
    message: string | null = null;
    showLoginButton: boolean = false;
    private verificationCalled: boolean = false;

    ngOnInit(): void {
        if (!isPlatformBrowser(this.platformId) || this.verificationCalled) {
            return;
        }

        const token = this.route.snapshot.queryParamMap.get('token');
        if (token) {
            this.verificationCalled = true;
            this.http.get(`${environment.apiBaseUrl}/api/users/verify?token=${token}`, { withCredentials: true })
                .subscribe({
                    next: () => {
                        this.isLoading = false;
                        this.isError = false;
                        this.message = 'Your email has been successfully verified. You can now proceed to the platform.';
                        this.showLoginButton = true;

                        // Clear the token from URL to prevent re-verification if component reloads
                        void this.router.navigate([], {
                            relativeTo: this.route,
                            queryParams: {},
                            replaceUrl: true
                        });
                    },
                    error: (err) => {
                        this.isLoading = false;
                        this.isError = true;
                        this.message = err.error?.message || 'Invalid or expired token. Please try again.';
                    }
                });
        } else {
            this.isLoading = false;
            this.isError = true;
            this.message = 'No verification token found.';
        }
    }

    goToPlatform() {
        setTimeout(() => {
            this.authFacade.loadSession().then(() => {
                void this.router.navigate(['/']);
            });
        }, 500);
    }
}
