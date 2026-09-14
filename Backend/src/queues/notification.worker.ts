import { Worker } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { getIO } from '../socket.js';

const startNotificationWorker = () => {
  const worker = new Worker(
    'notifications',
    async (job) => {
      console.log(`[BullMQ Worker] Processing job ${job.id}:`, job.data);
      const { title, message } = job.data;

      // 1. Save to MongoDB (ensures offline users receive it upon visiting)
      const savedNotification = await notificationRepository.create({ title, message });

      const notificationPayload = {
        _id: savedNotification._id,
        title: savedNotification.title,
        message: savedNotification.message,
        isRead: false,
        createdAt: savedNotification.createdAt,
        updatedAt: savedNotification.updatedAt,
      };

      // 2. Real-time push via Socket.io to all online users & admins
      try {
        getIO().emit('new_notification', notificationPayload);
        console.log(`[Socket.io] Real-time notification emitted: ${title}`);
      } catch (socketErr) {
        console.warn('[Socket.io] Socket emit skipped:', socketErr);
      }

      return notificationPayload;
    },
    { connection: redisConfig }
  );

  worker.on('completed', (job) => {
    console.log(`[BullMQ Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err);
  });

  return worker;
};

export { startNotificationWorker };
export default startNotificationWorker;
