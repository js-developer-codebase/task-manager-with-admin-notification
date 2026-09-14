import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.js';

const notificationQueue = new Queue('notifications', {
  connection: redisConfig,
});

const addNotificationJob = async (title: string, message: string) => {
  return await notificationQueue.add('send-notification', { title, message });
};

export { notificationQueue, addNotificationJob };
export default notificationQueue;
