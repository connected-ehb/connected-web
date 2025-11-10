import { tag } from './tag.model';
import { User } from '../../auth/models/user.model';
import { ProjectStatusEnum } from "./ProjectStatus.enum"

export interface Project {
    id: number;
    gid?: string;
    title: string;
    description: string;
    shortDescription: string;
    status: ProjectStatusEnum;
    repositoryUrl: string;
    boardUrl: string;
    backgroundImage: string;
    teamSize: number;

    assignmentId: number | null;
    tags: tag[];
    createdBy: User;
    productOwner: User;
    members: User[];
    courseName?: string;
    assignmentName?: string;
}
