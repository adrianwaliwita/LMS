import prisma from '../utils/prisma.js';
import { Module } from './Module.js';

const CourseLevels = Object.freeze({
    1: 'Diploma',
    2: 'Undergraduate',
    3: 'Postgraduate'
});

const CourseCategories = Object.freeze({
    1: 'IT',
    2: 'Business',
    3: 'Engineering',
    4: 'Science',
    5: 'Art'
});

class Course {
    constructor({ id, title, description, category, level, price, createdAt, updatedAt, modules }) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.level = level;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.modules = modules?.map(m => new Module(m.module)) || [];
    }

    static async getCourseById(id) {
        const course = await prisma.course.findUnique({
            where: { id: Number(id) },
            include: {
                modules: {
                    select: {
                        module: true
                    }
                }
            }
        });

        return course ? new Course(course) : null;
    }

    static async getAllCourses({ title, category, level }) {
        const courses = await prisma.course.findMany({
            where: {
                ...(title && { title: { contains: title } }),
                ...(category && { category: Number(category) }),
                ...(level && { level: Number(level) })
            },
            include: {
                modules: {
                    select: {
                        module: true
                    }
                }
            }
        });

        return courses.map(course => new Course(course));
    }

    static async createCourse({ title, description, category, level, price, moduleIds = [] }) {
        const newCourse = await prisma.$transaction(async (tx) => {
            const course = await tx.course.create({
                data: {
                    title,
                    description,
                    category: Number(category),
                    level: Number(level),
                    price: Number(price),
                    ...(moduleIds.length > 0 && {
                        modules: {
                            create: moduleIds.map(moduleId => ({
                                module: {
                                    connect: { id: moduleId }
                                }
                            }))
                        }
                    })
                },
                include: {
                    modules: {
                        select: {
                            module: true
                        }
                    }
                }
            });
            return course;
        });

        return new Course(newCourse);
    }

    static async updateCourse({ id, title, description, category, level, price, moduleIds }) {
        const updatedCourse = await prisma.course.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                category: category !== undefined ? Number(category) : undefined,
                level: level !== undefined ? Number(level) : undefined,
                price: price !== undefined ? Number(price) : undefined,
                ...(moduleIds !== undefined && {
                    modules: {
                        deleteMany: {},
                        create: moduleIds.map(moduleId => ({
                            module: {
                                connect: { id: moduleId }
                            }
                        }))
                    }
                })
            },
            include: {
                modules: {
                    select: {
                        module: true
                    }
                }
            }
        });

        return new Course(updatedCourse);
    }

    static async deleteCourse(id) {
        await prisma.course.delete({
            where: { id: Number(id) }
        });
    }
}

export { CourseLevels, CourseCategories, Course };
