import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all notification routes with JWT authentication
router.use(authenticate);

// Only Admins can create and broadcast notifications
router.post('/', authorizeRoles('admin'), notificationController.createNotification);

// All authenticated users can view and mark notifications as read
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);

export { router as notificationRouter };
export default router;
