import { CourseLevels, CourseCategories, Course } from '../models/Course.js';
import logger from '../utils/logger.js';

export const getCourseById = async (req, res) => {
    const { id } = req.params;

    try {
        const course = await Course.getCourseById(id);

        if (!course) {
            return res.status(404).json({
                error: 'Course not found',
                message: 'No course found with the provided ID'
            });
        }

        res.json(course);
    } catch (error) {
        logger.error(`[course.getCourseById] Failed to retrieve course for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const listCourses = async (req, res) => {
    const { title, category, level } = req.query;

    try {
        const courses = await Course.getAllCourses({ title, category, level });

        res.json(courses);
    } catch (error) {
        logger.error(`[course.listCourses] Failed to retrieve courses: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const createCourse = async (req, res) => {
    const { title, description, category, level, price, moduleIds = [] } = req.body;

    // Validate required fields
    if (!title || !description || category === undefined || level === undefined || price === undefined) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'title, description, category, level, and price are required'
        });
    }

    // Validate string fields are not empty after trimming
    if (!title.trim() || !description.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'title and description cannot be empty'
        });
    }

    // Validate price
    if (typeof price !== 'number' || price < 0) {
        return res.status(400).json({
            error: 'Invalid price',
            message: 'price must be a non-negative number'
        });
    }

    // Validate category
    const validCategories = Object.keys(CourseCategories).map(Number);
    if (!validCategories.includes(Number(category))) {
        return res.status(400).json({
            error: 'Invalid category',
            message: `category must be one of: ${Object.entries(CourseCategories).map(([key, value]) => `${key} (${value})`).join(', ')}`
        });
    }

    // Validate level
    const validLevels = Object.keys(CourseLevels).map(Number);
    if (!validLevels.includes(Number(level))) {
        return res.status(400).json({
            error: 'Invalid level',
            message: `level must be one of: ${Object.entries(CourseLevels).map(([key, value]) => `${key} (${value})`).join(', ')}`
        });
    }

    // Validate moduleIds is an array if provided
    if (moduleIds && !Array.isArray(moduleIds)) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'moduleIds must be an array'
        });
    }

    // Validate moduleIds contains only numbers if provided
    if (moduleIds && moduleIds.some(id => typeof id !== 'number' || id <= 0)) {
        return res.status(400).json({
            error: 'Invalid input',
            message: 'moduleIds must contain only positive numbers'
        });
    }

    try {
        const course = await Course.createCourse({
            title,
            description,
            category,
            level,
            price,
            moduleIds
        });

        logger.info(`[course.createCourse] Course created successfully: '${title}'`);
        res.status(201).json(course);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Duplicate title',
                message: 'A course with this title already exists'
            });
        }

        if (error.code === 'P2025') {
            return res.status(400).json({
                error: 'Invalid input',
                message: error.toString()
            });
        }

        logger.error(`[course.createCourse] Failed to create course: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const updateCourse = async (req, res) => {
    const { id } = req.params;
    const { title, description, category, level, price, moduleIds } = req.body;

    // Validate that at least one field is provided for update
    if (!title && !description && category === undefined && level === undefined && price === undefined && !moduleIds) {
        return res.status(400).json({
            error: 'Missing fields',
            message: 'At least one field (title, description, category, level, price, or moduleIds) must be provided for update'
        });
    }

    // Validate title and description if provided
    if (!title?.trim() || !description?.trim()) {
        return res.status(400).json({
            error: 'Invalid input',
            message: `${!title?.trim() ? 'title' : 'description'} cannot be empty`
        });
    }

    // Validate category if provided
    if (category !== undefined) {
        const validCategories = Object.keys(CourseCategories).map(Number);
        if (!validCategories.includes(Number(category))) {
            return res.status(400).json({
                error: 'Invalid category',
                message: `category must be one of: ${Object.entries(CourseCategories).map(([key, value]) => `${key} (${value})`).join(', ')}`
            });
        }
    }

    // Validate level if provided
    if (level !== undefined) {
        const validLevels = Object.keys(CourseLevels).map(Number);
        if (!validLevels.includes(Number(level))) {
            return res.status(400).json({
                error: 'Invalid level',
                message: `level must be one of: ${Object.entries(CourseLevels).map(([key, value]) => `${key} (${value})`).join(', ')}`
            });
        }
    }

    // Validate price if provided
    if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
            return res.status(400).json({
                error: 'Invalid price',
                message: 'price must be a non-negative number'
            });
        }
    }

    // Validate moduleIds if provided
    if (moduleIds !== undefined) {
        if (!Array.isArray(moduleIds)) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'moduleIds must be an array'
            });
        }

        if (moduleIds.some(id => typeof id !== 'number' || id <= 0)) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'moduleIds must contain only positive numbers'
            });
        }
    }

    try {
        const course = await Course.updateCourse({
            id: Number(id),
            title,
            description,
            category,
            level,
            price,
            moduleIds
        });

        logger.info(`[course.updateCourse] Course updated successfully for ID: '${id}'`);
        res.json(course);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Course not found',
                message: 'No course found with the provided ID'
            });
        }

        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Title already exists',
                message: 'A course with this title already exists'
            });
        }

        logger.error(`[course.updateCourse] Failed to update course for ID: '${id}'`, error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
};

export const deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        await Course.deleteCourse(id);

        logger.info(`[course.deleteCourse] Course deleted successfully: ${id}`);
        res.status(204).send();
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Course not found',
                message: 'No course found with the provided ID'
            });
        }

        logger.error(`[course.deleteCourse] Failed to delete course: ${error.message}`);
        res.status(500).json({
            error: 'Internal server error',
            message: error.toString()
        });
    }
}; 