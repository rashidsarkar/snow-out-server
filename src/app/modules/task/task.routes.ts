import express from 'express';
import TaskController from './task.controller';
import validateRequest from '../../middlewares/validateRequest';
import TaskValidations from './task.validation';

const router = express.Router();

router.get('/', TaskController.getAllTasks);
router.post(
  '/',
  validateRequest(TaskValidations.createTaskData),
  TaskController.createTask,
);
router.patch('/:id', TaskController.updateTask);
router.get('/:id', TaskController.getTaskById);

export const TaskRoutes = router;
