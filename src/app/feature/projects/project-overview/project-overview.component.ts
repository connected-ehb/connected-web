import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ProjectcardComponent} from '../../../shared/components/projectcard/projectcard.component';
import {CommonModule} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {map, take,} from 'rxjs/operators';
import {Project} from '../../../shared/models/project.model';
import {ProjectService} from '../../../core/services/project.service';
import {ToastService} from '../../../core/services/toast.service';
import {ActiveAssignmentService} from '../../../core/services/active-assignment.service';
import {ActiveAssignment} from '../../../shared/models/activeAssignment.model';
import {ActiveAssignmentRoutingService} from '../../../core/services/active-assignment-routing.service';
import {ProjectStatusEnum} from '../../../shared/models/ProjectStatus.enum';
import {AuthorizationService} from '../../../core/services/authorization.service';
import {ButtonComponent} from '../../../shared/components/button/button.component';
import {StatuscardComponent} from '../../../shared/components/statuscard/statuscard.component';
import {
    ProjectStatusSelectComponent
} from '../../../shared/components/project-status-select/project-status-select.component';
import {ConfirmationModalComponent} from '../../../shared/components/confirmation-modal/confirmation-modal.component';

type TabValue = 'all' | 'global' | 'my projects' | 'imported';

type SortValue =
    | 'title-asc'
    | 'title-desc'
    | 'status-asc'
    | 'status-desc'
    | 'teamSize-asc'
    | 'teamSize-desc'
    | 'teamFill-asc'
    | 'teamFill-desc';

interface TabOption {
    label: string;
    value: TabValue;
}

interface SortOption {
    label: string;
    value: SortValue;
}

@Component({
    selector: 'app-project-overview',
    imports: [
        ProjectcardComponent,
        CommonModule,
        FormsModule,
        ButtonComponent,
        StatuscardComponent,
        ProjectStatusSelectComponent,
        ConfirmationModalComponent,
        RouterOutlet
    ],
    templateUrl: './project-overview.component.html',
    styleUrl: './project-overview.component.scss'
})
export class ProjectOverviewComponent implements OnInit, OnDestroy {
    private readonly projectService: ProjectService = inject(ProjectService);
    private readonly activeAssignmentService: ActiveAssignmentService = inject(ActiveAssignmentService);
    private readonly activeAssignmentRoutingService = inject(ActiveAssignmentRoutingService);
    private readonly router: Router = inject(Router);
    private readonly toastService = inject(ToastService);
    private readonly authorizationService: AuthorizationService = inject(AuthorizationService);

    showStatusUpdateModal = false;
    pendingStatusProject: Project | null = null;
    pendingStatus: ProjectStatusEnum | null = null;
    // Store original status so we can revert UI if the user cancels
    pendingOriginalStatus: ProjectStatusEnum | null = null;

    projects$: Observable<Project[]> | null = null;
    public isTeacher$: Observable<boolean> = this.authorizationService.isTeacher$();
    public isResearcher$: Observable<boolean> = this.authorizationService.isResearcher$();

    activeAssignment: ActiveAssignment | null = this.activeAssignmentService.getActiveAssignment();
    selectedTab: TabValue = 'all';
    viewType: 'card' | 'table' = 'card';
    showFilters = false;
    showSearch = false;

    private activeAssignmentSub?: Subscription;

    sortOptions: SortOption[] = [
        {label: 'Title (A-Z)', value: 'title-asc'},
        {label: 'Title (Z-A)', value: 'title-desc'},
        {label: 'Status (A-Z)', value: 'status-asc'},
        {label: 'Status (Z-A)', value: 'status-desc'},
        {label: 'Team Size (Largest)', value: 'teamSize-desc'},
        {label: 'Team Size (Smallest)', value: 'teamSize-asc'},
        {label: 'Team Fill (Most filled)', value: 'teamFill-desc'},
        {label: 'Team Fill (Most open)', value: 'teamFill-asc'}
    ];
    selectedSort: SortValue = 'title-asc';
    private readonly sortOption$ = new BehaviorSubject<SortValue>(this.selectedSort);
    minFreeSpots = 0;
    private readonly minFreeSpots$ = new BehaviorSubject<number>(this.minFreeSpots);
    selectedStatuses: ProjectStatusEnum[] = [];
    private readonly selectedStatuses$ = new BehaviorSubject<ProjectStatusEnum[]>(this.selectedStatuses);
    searchTerm = '';
    private readonly searchTerm$ = new BehaviorSubject<string>(this.searchTerm);
    protected readonly statusOptions = Object.values(ProjectStatusEnum);

    tabOptions: TabOption[] = [];

    ngOnInit(): void {
        combineLatest([this.isResearcher$, this.isTeacher$]).subscribe(([isResearcher, isTeacher]) => {

            if (isResearcher) {
                this.tabOptions = [
                    { label: 'My Global Projects', value: 'global' },
                    { label: 'Imported Projects', value: 'imported' }
                ];
                this.selectedTab = 'global';
                this.loadGlobalProjects();
                return;
            }

            this.tabOptions = [
                { label: 'All projects', value: 'all' },
                { label: 'Researcher projects', value: 'global' },
                { label: 'My projects', value: 'my projects' }
            ];

            this.activeAssignmentSub = this.activeAssignmentService.activeAssignment$
                .subscribe(activeAssignment => {
                    this.activeAssignment = activeAssignment;
                    if (activeAssignment?.assignment) {
                        this.loadProjects();
                    }
                });

            this.viewType = isTeacher ? 'table' : 'card';
        });
    }

    ngOnDestroy(): void {
        this.activeAssignmentSub?.unsubscribe();
    }

    navigateToProjectCreate(): void {
        const builtRoute = this.activeAssignmentRoutingService.buildRoute('projects', 'create');
        this.router.navigate(builtRoute);
    }

    changeTab(tab: TabValue): void {
        this.selectedTab = tab;
        switch (tab) {
            case 'all':
                this.loadProjects();
                break;
            case 'global':
                this.loadGlobalProjects();
                break;
            case 'imported':
                this.setProjects(this.projectService.getImportedProjects());
                break;
            case 'my projects':
                this.loadMyProjects();
                break;
        }
    }

    changeSort(sortValue: SortValue): void {
        this.selectedSort = sortValue;
        this.sortOption$.next(sortValue);
    }

    toggleView(): void {
        this.viewType = this.viewType === 'card' ? 'table' : 'card';
    }

    toggleFilters(): void {
        this.showFilters = !this.showFilters;
    }

    toggleSearch(): void {
        this.showSearch = !this.showSearch;
    }

    onSearchTermChange(value: string): void {
        this.searchTerm = value;
        this.searchTerm$.next(value);
    }

    clearSearch(): void {
        if (this.searchTerm) {
            this.searchTerm = '';
            this.searchTerm$.next('');
        }
    }

    private setProjects(projectStream: Observable<Project[]>): void {
        this.projects$ = combineLatest([
            projectStream,
            this.sortOption$,
            this.minFreeSpots$,
            this.selectedStatuses$,
            this.searchTerm$
        ]).pipe(
            map(([projects, sortOption, minFreeSpots, statuses, searchTerm]) => {
                const filteredProjects = this.filterProjects(projects, minFreeSpots, statuses, searchTerm);
                return this.sortProjects(filteredProjects, sortOption);
            })
        );
    }

    loadProjects(): void {
        const assignmentId = this.activeAssignmentService.getActiveAssignment()?.assignment.id;
        if (assignmentId) {
            this.isTeacher$.pipe(take(1)).subscribe(isTeacher => {
                const projectStream = isTeacher
                    ? this.projectService.getAllProjects(assignmentId)
                    : this.projectService.getAllPublishedProjects(assignmentId);
                this.setProjects(projectStream);
            });
        }
    }

    loadMyProjects(): void {
        const assignmentId = this.activeAssignmentService.getActiveAssignment()?.assignment.id;
        if (assignmentId) {
            this.setProjects(this.projectService.getMyProjects(assignmentId));
        }
    }

    loadGlobalProjects(): void {
        this.setProjects(this.projectService.getAllGlobalProjects());
    }

    private sortProjects(projects: Project[], sortOption: SortValue): Project[] {
        const sortedProjects = [...projects];
        switch (sortOption) {
            case 'title-desc':
                return sortedProjects.sort((a, b) => this.compareStrings(b.title, a.title));
            case 'status-asc':
                return sortedProjects.sort((a, b) => this.compareStrings(a.status, b.status));
            case 'status-desc':
                return sortedProjects.sort((a, b) => this.compareStrings(b.status, a.status));
            case 'teamSize-asc':
                return sortedProjects.sort((a, b) => (a.teamSize ?? 0) - (b.teamSize ?? 0));
            case 'teamSize-desc':
                return sortedProjects.sort((a, b) => (b.teamSize ?? 0) - (a.teamSize ?? 0));
            case 'teamFill-asc':
                return sortedProjects.sort((a, b) => this.compareTeamFill(a, b, 'asc'));
            case 'teamFill-desc':
                return sortedProjects.sort((a, b) => this.compareTeamFill(a, b, 'desc'));
            case 'title-asc':
            default:
                return sortedProjects.sort((a, b) => this.compareStrings(a.title, b.title));
        }
    }

    private compareStrings(a?: string | null, b?: string | null): number {
        return (a ?? '').localeCompare(b ?? '', undefined, {sensitivity: 'base', numeric: true});
    }

    private filterProjects(
        projects: Project[],
        minFreeSpots: number,
        selectedStatuses: ProjectStatusEnum[],
        searchTerm: string
    ): Project[] {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return projects.filter(project => {
            const hasRequiredSpace = this.hasRequiredFreeSpots(project, minFreeSpots);
            const matchesStatus =
                selectedStatuses.length === 0 || selectedStatuses.includes(project.status);
            const matchesSearch = this.matchesSearchTerm(project, normalizedSearch);
            return hasRequiredSpace && matchesStatus && matchesSearch;
        });
    }

    private hasRequiredFreeSpots(project: Project, minFreeSpots: number): boolean {
        return this.getTeamVacancyCount(project) >= minFreeSpots;
    }

    private compareTeamFill(a: Project, b: Project, direction: 'asc' | 'desc'): number {
        const fillA = this.getTeamFillRatio(a);
        const fillB = this.getTeamFillRatio(b);
        const fillComparison = this.compareNumbers(fillA, fillB);

        if (fillComparison !== 0) {
            return direction === 'asc' ? fillComparison : -fillComparison;
        }

        const vacancyA = this.getTeamVacancyCount(a);
        const vacancyB = this.getTeamVacancyCount(b);
        const vacancyComparison = this.compareNumbers(vacancyA, vacancyB);

        if (vacancyComparison !== 0) {
            return direction === 'asc' ? vacancyComparison : -vacancyComparison;
        }

        return this.compareStrings(a.title, b.title);
    }

    private getTeamFillRatio(project: Project): number {
        const capacity = project.teamSize ?? 0;
        const memberCount = project.members?.length ?? 0;

        if (capacity <= 0) {
            return memberCount > 0 ? 1 : 0;
        }

        return memberCount / capacity;
    }

    private getTeamVacancyCount(project: Project): number {
        const capacity = project.teamSize ?? 0;
        const memberCount = project.members?.length ?? 0;

        return Math.max(capacity - memberCount, 0);
    }

    private compareNumbers(a: number, b: number): number {
        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    }

    onMinFreeSpotsChange(value: number | string): void {
        const parsedValue = Number(value);
        this.minFreeSpots = Number.isFinite(parsedValue) && parsedValue >= 0 ? Math.floor(parsedValue) : 0;
        this.minFreeSpots$.next(this.minFreeSpots);
    }

    private toggleStatusFilter(status: ProjectStatusEnum, selected: boolean): void {
        if (selected) {
            if (!this.selectedStatuses.includes(status)) {
                this.selectedStatuses = [...this.selectedStatuses, status];
            }
        } else {
            this.selectedStatuses = this.selectedStatuses.filter(item => item !== status);
        }

        this.selectedStatuses$.next([...this.selectedStatuses]);
    }

    isStatusSelected(status: ProjectStatusEnum): boolean {
        return this.selectedStatuses.includes(status);
    }

    toggleStatusFilterByClick(status: ProjectStatusEnum): void {
        const shouldSelect = !this.isStatusSelected(status);
        this.toggleStatusFilter(status, shouldSelect);
    }

    private matchesSearchTerm(project: Project, normalizedSearch: string): boolean {
        if (!normalizedSearch) {
            return true;
        }

        const searchableValues: (string | null | undefined)[] = [
            project.title,
            project.shortDescription,
            project.description,
            project.courseName,
            project.assignmentName,
            project.productOwner
                ? `${project.productOwner.firstName} ${project.productOwner.lastName}`
                : undefined,
            project.createdBy
                ? `${project.createdBy.firstName} ${project.createdBy.lastName}`
                : undefined
        ];

        const hasFieldMatch = searchableValues.some(value =>
            value?.toLowerCase().includes(normalizedSearch)
        );

        if (hasFieldMatch) {
            return true;
        }

        const hasMemberMatch =
            project.members?.some(member =>
                `${member.firstName} ${member.lastName}`.toLowerCase().includes(normalizedSearch)
            ) ?? false;

        if (hasMemberMatch) {
            return true;
        }

        return project.tags?.some(tagItem =>
            tagItem.name?.toLowerCase().includes(normalizedSearch)
        ) ?? false;
    }

    /**
     * Show confirmation modal only when changing status to REJECTED.
     * For other statuses update immediately.
     */
    promptStatusUpdate(project: Project, status: ProjectStatusEnum): void {
        // store original status so we can revert if cancelled
        this.pendingOriginalStatus = project.status as ProjectStatusEnum;

        if(status === ProjectStatusEnum.REJECTED) {
            this.pendingStatusProject = project;
            this.pendingStatus = status;
            this.showStatusUpdateModal = true;
        }else {
            this.projectService.updateProjectStatus(project.id, status).subscribe(() => {
                this.toastService.showToast('success', 'Project status updated ');
                this.reloadCurrentTabProjects();
            });
        }
    }


    confirmStatusUpdate(): void {
        if (this.pendingStatusProject && this.pendingStatus !== null) {
            this.projectService.updateProjectStatus(this.pendingStatusProject.id, this.pendingStatus).subscribe(() => {
                this.toastService.showToast('success', 'Project status updated ');
                this.reloadCurrentTabProjects();
            });
        }
        this.showStatusUpdateModal = false;
        this.pendingStatusProject = null;
        this.pendingStatus = null;
        this.pendingOriginalStatus = null;
    }

    cancelStatusUpdate(): void {
        // revert any UI change by reloading the current tab projects
        this.showStatusUpdateModal = false;
        this.pendingStatusProject = null;
        this.pendingStatus = null;
        this.pendingOriginalStatus = null;
        this.reloadCurrentTabProjects();
    }

    private reloadCurrentTabProjects(): void {
        if (this.selectedTab === 'all') {
            this.loadProjects();
        } else if (this.selectedTab === 'global') {
            this.loadGlobalProjects();
        } else if (this.selectedTab === 'my projects') {
            this.loadMyProjects();
        }
    }

    publishAllProjects(): void {
        if (this.activeAssignment) {
            this.projectService.publishAllProjects(this.activeAssignment.assignment.id).subscribe(() => {
                this.toastService.showToast('success', 'All approved projects were published');
                this.loadProjects();
            });
        }
    }

    get pendingStatusLabel(): string {
        if (this.pendingStatus === null) return '';
        return (ProjectStatusEnum as any)[this.pendingStatus] ?? String(this.pendingStatus);
    }

    navigateToProject(project: Project): void {
        this.router.navigate(this.activeAssignmentRoutingService.buildRoute('projects', project.id.toString()));
    }
}
