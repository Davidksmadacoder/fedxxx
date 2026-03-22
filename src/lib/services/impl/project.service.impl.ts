import { IProject, Project } from '../../models/project.model';
import { CreateProjectDto, UpdateProjectDto } from '../../dto/project.dto';
import { CustomError } from '../../utils/customError.utils';

export class ProjectService {
    async create(data: CreateProjectDto): Promise<IProject> {
        const project = new Project(data);
        await project.save();
        return project;
    }

    async getAll(): Promise<IProject[]> {
        return await Project.find().sort({ order: 1, createdAt: -1 });
    }

    async getActive(): Promise<IProject[]> {
        return await Project.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    }

    async getById(id: string): Promise<IProject> {
        const project = await Project.findById(id);
        if (!project) throw new CustomError(404, 'Project not found');
        return project;
    }

    async getBySlug(slug: string): Promise<IProject> {
        const project = await Project.findOne({ slug, isActive: true });
        if (!project) throw new CustomError(404, 'Project not found');
        return project;
    }

    async update(id: string, data: UpdateProjectDto): Promise<IProject> {
        const project = await Project.findById(id);
        if (!project) throw new CustomError(404, 'Project not found');
        Object.assign(project, data);
        await project.save();
        return project;
    }

    async delete(id: string): Promise<void> {
        const project = await Project.findById(id);
        if (!project) throw new CustomError(404, 'Project not found');
        await Project.findByIdAndDelete(id);
    }
}

export default new ProjectService();







