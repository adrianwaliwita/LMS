import { Router } from 'express';
import { listAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../../../controllers/announcement.js';

const announcementsRouter = Router();

// Announcements routes
announcementsRouter.get('/', listAnnouncements);
announcementsRouter.get('/:id', getAnnouncementById);
announcementsRouter.post('/', createAnnouncement);
announcementsRouter.patch('/:id', updateAnnouncement);
announcementsRouter.delete('/:id', deleteAnnouncement);

export default announcementsRouter; 