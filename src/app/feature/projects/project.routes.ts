import {Routes} from '@angular/router';

const loadProjectOverview = () => import('./project-overview/project-overview.component').then(m => m.ProjectOverviewComponent);
const loadProjectCreate = () => import('./project-create/project-create.component').then(m => m.ProjectCreateComponent);
const loadProjectDetails = () => import('./project-details/project-details.component').then(m => m.ProjectDetailsComponent);
const loadDetailsOverview = () => import('./project-details/components/details-overview/details-overview.component').then(m => m.DetailsOverviewComponent);
const loadFeedback = () => import('./project-details/components/feedback/feedback.component').then(m => m.FeedbackComponent);
const loadMembers = () => import('./project-details/components/members/members.component').then(m => m.MembersComponent);
const loadApplications = () => import('./project-details/components/applications/applications.component').then(m => m.ApplicationsComponent);
const loadProjectUpdate = () => import('./project-update/project-update.component').then(m => m.ProjectUpdateComponent);
const loadProjectApply = () => import('../applications-create/applications-create.component').then(m => m.ApplicationsCreateComponent);
const loadEvents = () => import('./project-details/components/events/events.component').then(m => m.EventsComponent);
export const PROJECT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: loadProjectOverview
    },
    {
        path: 'create',
        loadComponent: loadProjectCreate
    },
    {
        path: ':id/apply',
        loadComponent: loadProjectApply
    },
    {
        path: ':id',
        loadComponent: loadProjectDetails,
        children: [
            {path: 'overview', loadComponent: loadDetailsOverview},
            {path: 'feedback', loadComponent: loadFeedback},
            {path: 'members', loadComponent: loadMembers},
            {path: 'applications', loadComponent: loadApplications},
            {path: 'events', loadComponent: loadEvents},
            {path: 'edit', loadComponent: loadProjectUpdate},
            {path: '', redirectTo: 'overview', pathMatch: 'full'}
        ]
    }
];
