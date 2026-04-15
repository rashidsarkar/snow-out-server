import express from 'express';
import TaskController from './task.controller';
import validateRequest from '../../middlewares/validateRequest';
import TaskValidations from './task.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';

const router = express.Router();

router.get('/', TaskController.getAllTasks);
router.post(
  '/create-task',
  auth(USER_ROLE.CUSTOMER),
  validateRequest(TaskValidations.createTaskData),
  TaskController.createTask,
);
router.patch('/counter-offer', TaskController.counterOfferForTask);
router.patch('/:id', TaskController.updateTask);
router.get('/:id', TaskController.getTaskById);
export const TaskRoutes = router;
