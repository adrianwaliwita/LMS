import prisma from '../utils/prisma.js';

class Classroom {
    constructor({ id, name, capacity, createdAt, updatedAt }) {
        this.id = id;
        this.name = name;
        this.capacity = capacity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async getClassroomById(id) {
        const classroom = await prisma.classroom.findUnique({
            where: { id: Number(id) }
        });

        return classroom ? new Classroom(classroom) : null;
    }
    
    static async listClassrooms({ name }) {
        const classrooms = await prisma.classroom.findMany({
            where: name ? {
                name: { contains: name }
            } : {}
        });

        return classrooms.map(classroom => new Classroom(classroom));
    }

    static async createClassroom({ name, capacity }) {
        const classroom = await prisma.classroom.create({
            data: {
                name,
                capacity: Number(capacity)
            }
        });

        return new Classroom(classroom);
    }

    static async updateClassroom({ id, name, capacity }) {
        const classroom = await prisma.classroom.update({
            where: { id: Number(id) },
            data: {
                name,
                capacity: capacity !== undefined ? Number(capacity) : undefined
            }
        });

        return new Classroom(classroom);
    }

    static async deleteClassroom(id) {
        await prisma.classroom.delete({
            where: { id: Number(id) }
        });
    }
}

export { Classroom }; 