import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectEventService } from '../../../../../core/services/project-event.service';
import { ProjectEventDetails } from '../../../../../shared/models/project-event.model';

@Component({
    selector: 'app-project-events',
    standalone: true,
    imports: [CommonModule],
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
}
