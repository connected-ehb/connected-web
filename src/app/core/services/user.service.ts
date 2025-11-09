import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {User} from '../../auth/models/user.model';
import {catchError} from 'rxjs/operators';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly baseUrl = environment.apiBaseUrl

    constructor(private http: HttpClient) {
    }

    getUserProfile(id: number): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/api/users/${id}`, {withCredentials: true});
    }

    //TODO change any type to userupdate type
    updateUserProfile(updatedUser: Partial<User>): Observable<User> {

        return this.http.patch<User>(
            `${this.baseUrl}/api/users/me`,
            updatedUser,
            {
                withCredentials: true
            }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('UserService - Error details:', {
                    status: error.status,
                    message: error.message,
                    error: error.error
                });
                throw error;
            })
        );
    }
}
