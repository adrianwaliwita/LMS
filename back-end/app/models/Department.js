import prisma from '../utils/prisma.js';

class Department {
    constructor({ id, name, description, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async getDepartmentById(id) {
        const department = await prisma.department.findUnique({
            where: { id: Number(id) }
        });

        return department ? new Department(department) : null;
    }
    
    static async listDepartments({ name }) {
        const departments = await prisma.department.findMany({
            where: name ? {
                name: { contains: name }
            } : {}
        });

        return departments.map(department => new Department(department));
    }

    static async createDepartment({ name, description }) {
        const department = await prisma.department.create({
            data: {
                name,
                description
            }
        });

        return new Department(department);
    }

    static async updateDepartment({ id, name, description }) {
        const department = await prisma.department.update({
            where: { id: Number(id) },
            data: {
                name,
                description
            }
        });

        return new Department(department);
    }

    static async deleteDepartment(id) {
        await prisma.department.delete({
            where: { id: Number(id) }
        });
    }
}

export { Department }; 