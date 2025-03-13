import prisma from '../utils/prisma.js';
import logger from '../utils/logger.js';

class Module {
    constructor({ id, title, description, createdAt, updatedAt }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async createModule({ title, description }) {
        const module = await prisma.module.create({
            data: {
                title,
                description
            }
        });

        return new Module(module);
    }

    static async getModuleById(id) {
        const module = await prisma.module.findUnique({
            where: { id: Number(id) }
        });

        return module ? new Module(module) : null;
    }

    static async listModules({ title }) {
        const modules = await prisma.module.findMany({
            where: {
                title: title ? { contains: title } : undefined
            }
        });

        return modules.map(module => new Module(module));
    }

    static async updateModule({ id, title, description }) {
        return await prisma.module.update({
            where: { id: Number(id) },
            data: {
                title,
                description
            }
        });
    }

    static async deleteModule(id) {
        await prisma.module.delete({
            where: { id: Number(id) }
        });
    }
}

export default Module;