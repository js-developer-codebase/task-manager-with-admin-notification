import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// All task routes are protected by authentication middleware
router.use(authenticate);

router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export { router as taskRouter };
export default router;
