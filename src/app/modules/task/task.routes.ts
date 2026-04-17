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
router.patch(
  '/counter-offer',
  auth(USER_ROLE.CUSTOMER, USER_ROLE.PROVIDER),
  TaskController.counterOfferForTask,
);
router.patch(
  '/cancel-task',
  auth(USER_ROLE.CUSTOMER), // usually only customer cancels
  TaskController.cancelRequestForTask,
);
router.patch(
  '/find-another-provider',
  auth(USER_ROLE.CUSTOMER), // only customer should do this
  TaskController.findAnotherProviderForTask,
);
router.patch('/:id', TaskController.updateTask);
router.get('/:id', TaskController.getTaskById);
export const TaskRoutes = router;
