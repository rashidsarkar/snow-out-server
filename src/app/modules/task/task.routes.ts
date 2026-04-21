import express, { NextFunction, Request, Response } from 'express';

import TaskController from './task.controller';
import validateRequest from '../../middlewares/validateRequest';
import TaskValidations from './task.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';
import { uploadFile } from '../../utils/fileUploader';

const router = express.Router();

router.get('/', TaskController.getAllTasks);
router.post(
  '/create-task',
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
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
router.get(
  '/provider-tasks',
  auth(USER_ROLE.PROVIDER),
  TaskController.providerTask,
);
router.get(
  '/customer-tasks',
  auth(USER_ROLE.CUSTOMER),
  TaskController.customerTask,
);
router.patch(
  '/accept-task/:taskId',
  auth(USER_ROLE.PROVIDER),
  TaskController.providerAcceptTask,
);
router.patch(
  '/before-after-photos/:taskId',

  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  auth(USER_ROLE.CUSTOMER, USER_ROLE.PROVIDER),

  TaskController.beforeAfterPhotos,
);
router.patch(
  '/complete-and-pay',
  auth(USER_ROLE.CUSTOMER),
  TaskController.customerCompleteAndPay,
);
router.patch('/:id', TaskController.updateTask);
router.get('/:id', TaskController.getTaskById);
export const TaskRoutes = router;
