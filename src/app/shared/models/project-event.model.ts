import { ProjectEventType } from './project-event-type.enum';

export interface ProjectEventDetails {
    type: ProjectEventType;
    message: string;
    username: string | null;
    date: string;
}
