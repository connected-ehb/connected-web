import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Project} from '../../../shared/models/project.model';
import {ProjectService} from '../../../core/services/project.service';
import {AuthorizationService} from '../../../core/services/authorization.service';
import {ICONS} from '../../../shared/constants/icons';
import {ActiveAssignmentRoutingService} from '../../../core/services/active-assignment-routing.service';
import {ButtonComponent} from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-project-details',
    imports: [
        CommonModule,
        RouterModule,
        ButtonComponent
    ],
    templateUrl: './project-details.component.html',
    styleUrl: './project-details.component.scss'
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
    private readonly projectService: ProjectService = inject(ProjectService);
    public authorizationService: AuthorizationService = inject(AuthorizationService);
    private readonly router: Router = inject(Router);
    private readonly route: ActivatedRoute = inject(ActivatedRoute);
    private readonly activeAssignmentRoutingService: ActiveAssignmentRoutingService = inject(ActiveAssignmentRoutingService);

    public project$: Observable<Project> | null = null;
    public canManageProject$!: Observable<boolean>;
    public isTeacher$!: Observable<boolean>;
    public isOwner$!: Observable<boolean>;
    public isCreatedByTeacher$!: Observable<boolean>;
    icons = ICONS;

    private subscriptions: Subscription[] = [];

    ngOnInit() {
        const routeSubscription = this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.project$ = this.projectService.getProjectById(id);

                const projectSubscription = this.project$.subscribe(project => {
                    this.isOwner$ = this.authorizationService.isOwner$(project);
                    this.isTeacher$ = this.authorizationService.isTeacher$();
                    this.canManageProject$ = this.authorizationService.canManageProject$(project);
                    this.isCreatedByTeacher$ = this.authorizationService.isCreatedByTeacher$(project);
                });

                this.subscriptions.push(projectSubscription);
            }
        });

        this.subscriptions.push(routeSubscription);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
    navigateBack() {
        this.router.navigate(this.activeAssignmentRoutingService.buildRoute('projects'));
    }
}
