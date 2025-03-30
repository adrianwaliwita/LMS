import prisma from '../utils/prisma.js';
import { AnnouncementCategory } from '@prisma/client';
import { User } from './User.js';
import { Batch } from './Batch.js';

class Announcement {
    constructor({ id, title, content, category, createdBy, targetBatchId, isActive, createdAt, updatedAt, batch, creator }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.category = category;
        this.createdBy = createdBy;
        this.targetBatchId = targetBatchId;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.batch = batch ? new Batch(batch) : null;
        this.creator = creator ? new User(creator) : null;
    }

    static async getAnnouncementById(id) {
        const announcement = await prisma.announcement.findUnique({
            where: { id: Number(id) },
            include: {
                batch: true,
                creator: true
            }
        });

        return announcement ? new Announcement(announcement) : null;
    }

    static async listAnnouncements({ targetBatchId, category, isActive = true }) {
        const announcements = await prisma.announcement.findMany({
            where: {
                ...(targetBatchId && { targetBatchId: Number(targetBatchId) }),
                ...(category && { category }),
                isActive
            },
            include: {
                batch: true,
                creator: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return announcements.map(announcement => new Announcement(announcement));
    }

    static async createAnnouncement({ title, content, category, createdBy, targetBatchId, isActive = true }) {
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                category: category || AnnouncementCategory.ANNOUNCEMENT,
                createdBy: Number(createdBy),
                targetBatchId: targetBatchId ? Number(targetBatchId) : null,
                isActive
            },
            include: {
                batch: true,
                creator: true
            }
        });

        return new Announcement(announcement);
    }

    static async updateAnnouncement(id, { title, content, category, isActive, targetBatchId }) {
        const announcement = await prisma.announcement.update({
            where: { id: Number(id) },
            data: {
                title: title !== undefined ? title : undefined,
                content: content !== undefined ? content : undefined,
                category: category !== undefined ? category : undefined,
                isActive: isActive !== undefined ? isActive : undefined,
                targetBatchId: targetBatchId !== undefined ? (targetBatchId ? Number(targetBatchId) : null) : undefined
            },
            include: {
                batch: true,
                creator: true
            }
        });

        return new Announcement(announcement);
    }

    static async deleteAnnouncement(id) {
        await prisma.announcement.delete({
            where: { id: Number(id) }
        });
    }
}

export { AnnouncementCategory, Announcement };