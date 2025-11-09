import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectEventService } from '../../../../../core/services/project-event.service';
import {ProjectEventDetails, ProjectEventIconMap} from '../../../../../shared/models/project-event.model';
import {ProjectEventType} from '../../../../../shared/models/project-event-type.enum';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-project-events',
    standalone: true,
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {

    private readonly projectEventService = inject(ProjectEventService);
    private readonly route = inject(ActivatedRoute);

    events: ProjectEventDetails[] = [];

    ngOnInit(): void {
        const projectId = this.route.parent?.snapshot.params['id'];

        if (projectId) {
            this.projectEventService.getEvents(projectId).subscribe({
                next: (events) => (this.events = events),
                error: () => (this.events = []),
            });
        }
    }

    getIcon(type: ProjectEventType) {
        return ProjectEventIconMap[type];
    }
}
