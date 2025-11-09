import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {ProjectEventDetails} from '../../shared/models/project-event.model';

@Injectable({ providedIn: 'root' })
export class ProjectEventService {

    private readonly http = inject(HttpClient);

    getEvents(projectId: number): Observable<ProjectEventDetails[]> {
        return this.http.get<ProjectEventDetails[]>(
            `${environment.apiBaseUrl}/api/projects/${projectId}/events`,
            {
                withCredentials: true
            }
        );
    }
}
