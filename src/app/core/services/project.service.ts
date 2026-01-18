import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {Project} from '../../shared/models/project.model';
import {Application} from '../../shared/models/application.model';
import {ApplicationCreate} from '../../shared/models/application.model';
import {ProjectStatusEnum} from '../../shared/models/ProjectStatus.enum';
import {createFeedback, Feedback} from '../../shared/models/feedback.model';
import {ApplicationStatusEnum} from '../../shared/models/ApplicationStatus.enum';

@Injectable({providedIn: 'root'})
export class ProjectService {
    private http = inject(HttpClient);

    getAllProjects(assignmentId: number): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiBaseUrl}/api/projects/assignment/${assignmentId.toString()}`, {
            withCredentials: true
        });
    }

    getAllGlobalProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiBaseUrl}/api/projects/global`, {
                withCredentials: true
            }
        );
    }

    getMyProjects(assignmentId: number): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiBaseUrl}/api/projects/my-projects/${assignmentId}`, {
            withCredentials: true
        });
    }

    getImportedProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiBaseUrl}/api/projects/global/imported`, {
            withCredentials: true,
        });
    }

    importProject(projectId: number, assignmentId: number): Observable<Project> {
        return this.http.post<Project>(`${environment.apiBaseUrl}/api/projects/${projectId}/import/${assignmentId}`, {}, {
            withCredentials: true
        });
    }

    getAllPublishedProjects(assignmentId: number): Observable<Project[]> {
        return this.http.get<Project[]>(`${environment.apiBaseUrl}/api/projects/${assignmentId.toString()}/published`, {
            withCredentials: true
        });
    }

    createProject(
        assignmentId: number,
        projectData: Project
    ): Observable<Project> {
        return this.http.post<Project>(`${environment.apiBaseUrl}/api/projects/${assignmentId}`, projectData, {
            withCredentials: true
        });
    }

    createGlobalProject(projectData: Project): Observable<Project> {
        return this.http.post<Project>(`${environment.apiBaseUrl}/api/projects/global`, projectData, {
            withCredentials: true
        });
    }

    updateProject(projectId: number, projectData: Project): Observable<Project> {
        return this.http.patch<Project>(`${environment.apiBaseUrl}/api/projects/${projectId}`, projectData, {
            withCredentials: true
        });
    }

    getProjectById(projectId: string): Observable<Project> {
        if (!projectId) {
            throw new Error('Project ID is required');
        }
        return this.http.get<Project>(`${environment.apiBaseUrl}/api/projects/${projectId}`, {
            withCredentials: true
        });
    }

    getProjectByUserAndAssignmentId(assignmentId: string): Observable<Project> {
        return this.http.get<Project>(`${environment.apiBaseUrl}/api/projects/member/assignment/${assignmentId}`, {
            withCredentials: true
        });
    }

    getProjectApplications(projectId: string): Observable<Application[]> {
        return this.http.get<Application[]>(`${environment.apiBaseUrl}/api/projects/${projectId}/applications`, {
            withCredentials: true
        });
    }

    reviewApplication(applicationId: number, status: ApplicationStatusEnum): Observable<Application> {
        const headers: HttpHeaders = new HttpHeaders()
            .set('status', status);
        return this.http.post<Application>(`${environment.apiBaseUrl}/api/applications/${applicationId}/review`, {}, {
            withCredentials: true,
            headers: headers
        });
    }

    joinProject(applicationId: number): Observable<Application> {
        return this.http.post<Application>(`${environment.apiBaseUrl}/api/applications/${applicationId}/join`, {}, {
            withCredentials: true
        });
    }

    claimProject(projectId: number): Observable<Project> {
        return this.http.post<Project>(`${environment.apiBaseUrl}/api/projects/${projectId}/claim`, {}, {
            withCredentials: true
        });
    }

    getFeedback(projectId: string): Observable<Feedback[]> {
        return this.http.get<Feedback[]>(`${environment.apiBaseUrl}/api/projects/${projectId}/feedback`, {
            withCredentials: true
        });
    }

    submitFeedback(projectId: string, feedback: createFeedback): Observable<void> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this.http.post<void>(`${environment.apiBaseUrl}/api/projects/${projectId}/feedback`, feedback, {
            withCredentials: true,
            headers: headers
        });
    }

    updateFeedbackByTeacher(feedbackId: number, feedback: Feedback): Observable<Feedback> {
        return this.http.put<Feedback>(`${environment.apiBaseUrl}/api/feedback/${feedbackId}`, feedback, {
            withCredentials: true
        });
    }

    deleteFeedbackByTeacher(feedbackId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiBaseUrl}/api/feedback/${feedbackId}`, {
            withCredentials: true
        });
    }

    updateProjectStatus(projectId: number, status: ProjectStatusEnum): Observable<Project> {
        const headers: HttpHeaders = new HttpHeaders()
            .set('status', status);
        return this.http.post<Project>(`${environment.apiBaseUrl}/api/projects/${projectId}/status`, {}, {
            withCredentials: true,
            headers: headers
        });
    }

    publishAllProjects(assignmentId: number): Observable<Project[]> {
        const headers: HttpHeaders = new HttpHeaders().set('assignmentId', assignmentId.toString());
        return this.http.post<Project[]>(`${environment.apiBaseUrl}/api/projects/${assignmentId}/publish`, {}, {
            withCredentials: true,
            headers: headers
        });
    }


    applyForProject(projectId: string, application: ApplicationCreate): Observable<Application> {
        const headers = new HttpHeaders().set('Content-Type', 'application/json');

        return this.http.post<Application>(`${environment.apiBaseUrl}/api/projects/${projectId}/apply`, application, {
            withCredentials: true,
            headers: headers
        });
    }

    removeMember(projectId: string, memberId: string): Observable<void> {
        return this.http.delete<void>(`${environment.apiBaseUrl}/api/projects/${projectId}/members/${memberId}`, {
            withCredentials: true
        });
    }

    leaveProject(projectId: number): Observable<void> {
        return this.http.delete<void>(`${environment.apiBaseUrl}/api/projects/${projectId}/leave`, {
            withCredentials: true
        });
    }
}
