import { ProjectEventType } from './project-event-type.enum';

import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
    faPlusCircle,
    faUserPlus,
    faUserMinus,
    faRightFromBracket,
    faInbox,
    faHandshakeAngle,
    faGear,
    faDownload,
    faArrowsRotate,
    faPenToSquare,
} from '@fortawesome/free-solid-svg-icons';

export interface ProjectEventDetails {
    type: ProjectEventType;
    message: string;
    username: string | null;
    date: string;
}

export const ProjectEventIconMap: Record<ProjectEventType, IconDefinition> = {
    PROJECT_CREATED: faPlusCircle,
    USER_APPLIED: faInbox,
    USER_JOINED: faUserPlus,
    USER_LEFT: faRightFromBracket,
    MEMBER_REMOVED: faUserMinus,
    PROJECT_CLAIMED: faHandshakeAngle,
    STATUS_CHANGED: faArrowsRotate,
    PROJECT_IMPORTED: faDownload,
    PRODUCT_OWNER_REASSIGNED: faGear,
    PROJECT_UPDATED: faPenToSquare
};
