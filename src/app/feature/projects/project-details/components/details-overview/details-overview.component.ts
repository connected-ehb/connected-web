import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { LinkcardComponent } from '../../../../../shared/components/linkcard/linkcard.component';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { ProjectService } from '../../../../../core/services/project.service';
import { ActivatedRoute, Router } from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { Project } from '../../../../../shared/models/project.model';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { ActiveAssignmentRoutingService } from '../../../../../core/services/active-assignment-routing.service';
import {AuthorizationService} from '../../../../../core/services/authorization.service';
import {ProjectStatusEnum} from '../../../../../shared/models/ProjectStatus.enum';
import { tag } from '../../../../../shared/models/tag.model';
import { TagcardComponent } from "../../../../../shared/components/tagcard/tagcard.component";
import {ActiveAssignmentService} from '../../../../../core/services/active-assignment.service';
import {ActiveAssignment} from '../../../../../shared/models/activeAssignment.model';
import {ToastService} from '../../../../../core/services/toast.service';
import {Role} from '../../../../../auth/models/role.model';
import {Assignment} from '../../../../../shared/models/assignment.model';
import {
    ProjectStatusSelectComponent
} from '../../../../../shared/components/project-status-select/project-status-select.component';
import {StatuscardComponent} from '../../../../../shared/components/statuscard/statuscard.component';
import {
    ConfirmationModalComponent
} from '../../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
    selector: 'app-details-overview',
    imports: [
        LinkcardComponent,
        CommonModule,
        MarkdownModule,
        ButtonComponent,
        TagcardComponent,
        ProjectStatusSelectComponent,
        StatuscardComponent,
        ConfirmationModalComponent,
    ],
    templateUrl: './details-overview.component.html',
    styleUrl: './details-overview.component.scss'
})
export class DetailsOverviewComponent implements OnInit, OnDestroy {
    private readonly projectService: ProjectService = inject(ProjectService);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    public authorizationService: AuthorizationService = inject(AuthorizationService);
    private readonly activeAssignmentRoutingService: ActiveAssignmentRoutingService = inject(ActiveAssignmentRoutingService);
    private readonly router: Router = inject(Router);
    private readonly activeAssignmentService: ActiveAssignmentService = inject(ActiveAssignmentService);
    private readonly toastService: ToastService = inject(ToastService);
    protected readonly ProjectStatusEnum = ProjectStatusEnum;

    public project$: Observable<Project> | null = null;
    public canManageProject$!: Observable<boolean>;
    public isMember$!: Observable<boolean>;
    public isTeacher$!: Observable<boolean>;
    public isResearcher$!: Observable<boolean>;
    public hasApplied$!: Observable<boolean>;
    public repositoryUrl: string = '';
    public boardUrl: string = '';
    public tags: tag[] = [];
    public assignment: Assignment | null = null;
    protected readonly Role = Role;


    private activeAssignment: ActiveAssignment | null = null;

    private projectId: number | null = null;
    private subscriptions: Subscription[] = [];

    showLeaveModal: boolean = false;

    ngOnInit() {
        const routeSubscription = this.route.parent?.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.projectId = id;
                const projectSubscription = this.projectService.getProjectById(id).subscribe({
                    next: project => {
                        this.project$ = new Observable<Project>(subscriber => subscriber.next(project));
                        this.canManageProject$ = this.authorizationService.canManageProject$(project);
                        this.isMember$ = this.authorizationService.isMember$(project);
                        this.isTeacher$ = this.authorizationService.isTeacher$();
                        this.isResearcher$ = this.authorizationService.isResearcher$();
                        this.hasApplied$ = this.authorizationService.hasApplied$(project);
                        this.repositoryUrl = project.repositoryUrl;
                        this.boardUrl = project.boardUrl;
                        this.tags = project.tags;
                    },
                    error: () => {
                        this.router.navigate(this.activeAssignmentRoutingService.buildRoute('projects'));
                    }
                });

                this.subscriptions.push(projectSubscription);
            }
        });

        if (routeSubscription) {
            this.subscriptions.push(routeSubscription);
        }

        const activeAssignmentSubscription = this.activeAssignmentService.activeAssignment$.subscribe(activeAssignment => {
            if (activeAssignment) {
                this.activeAssignment = activeAssignment;
            }
        });
        this.subscriptions.push(activeAssignmentSubscription);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    applyForProject() {
        if (this.projectId) {
            this.router.navigate(this.activeAssignmentRoutingService.buildRoute('projects', this.projectId.toString(), 'apply'));
        }
    }

    getFilteredMembers(members: any[], owner: any): any[] {
        return members.filter(member => member.id !== owner.id);
    }

    updateProjectStatus(_t4: Project, status: ProjectStatusEnum) {
        if (this.projectId) {
            this.projectService.updateProjectStatus(this.projectId, status).subscribe(
                (updatedProject: Project) => {
                    this.project$ = new Observable<Project>(subscriber => subscriber.next(updatedProject));
                    this.toastService.showToast('success', 'Project status set to ' + status.toLowerCase());
                }
            );
        }
    }

    claimProject() {
        if (this.projectId) {
            this.projectService.claimProject(this.projectId).subscribe(
                (updatedProject: Project) => {
                    this.project$ = new Observable<Project>(subscriber => subscriber.next(updatedProject));
                }
            );
        }
    }

    importProject() {
        if (this.projectId && this.activeAssignment?.assignment.id) {
            this.projectService.importProject(this.projectId, this.activeAssignment?.assignment.id).subscribe(
                (updatedProject: Project) => {
                    this.toastService.showToast('success', 'Project imported successfully');
                    this.router.navigate(this.activeAssignmentRoutingService.buildRoute('projects', updatedProject.id.toString()));
                }
            );
        }
    }

    openLeaveModal() {
        this.showLeaveModal = true;
    }

    closeLeaveModal() {
        this.showLeaveModal = false;
    }

    confirmLeave() {
        if (this.projectId) {
            this.projectService.leaveProject(this.projectId).subscribe(() => {
                this.toastService.showToast('success', 'You have left the project.');
                this.closeLeaveModal();

                this.router.navigate(
                    this.activeAssignmentRoutingService.buildRoute('projects')
                );
            });
        }
    }
}
