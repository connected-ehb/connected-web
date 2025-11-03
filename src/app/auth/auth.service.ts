import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {RegistrationRequest} from './models/registration-request.model';

@Injectable({providedIn: 'root'})
export class AuthService {
    private http: HttpClient = inject(HttpClient);

    getCurrentUser(): Observable<any> {
        return this.http.get(`${environment.apiBaseUrl}/api/auth/user`, {withCredentials: true});
    }

    login(username: string, password: string): Observable<any> {
        const body = {
            email: username,
            password: password
        };

        // Sends JSON body - Spring Security will set the cookie upon successful authentication
        return this.http.post(`${environment.apiBaseUrl}/api/auth/login`, body, { withCredentials: true });
    }

    register(request: RegistrationRequest): Observable<any> {
        return this.http.post(`${environment.apiBaseUrl}/api/auth/register`, request, { withCredentials: true });
    }

    logoutRequest(): Observable<void> {
        return this.http.post<void>(`${environment.apiBaseUrl}/api/auth/logout`, {}, { withCredentials: true });
    }
}
