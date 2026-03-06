import express from 'express';
import auth from '../../middlewares/auth';
import notificationController from './notification.controller';
import { USER_ROLE } from '../user/user.const';
const router = express.Router();

router.get(
  '/get-notifications',
  auth(USER_ROLE.ADMIN, USER_ROLE.NORMALUSER, USER_ROLE.USER),
  notificationController.getAllNotification,
);
router.patch(
  '/see-notifications',
  auth(USER_ROLE.ADMIN, USER_ROLE.NORMALUSER, USER_ROLE.USER),
  notificationController.seeNotification,
);
router.delete(
  '/delete-notification/:id',
  auth(
    USER_ROLE.ADMIN,
    USER_ROLE.NORMALUSER,

    USER_ROLE.USER,
  ),
  notificationController.deleteNotification,
);
//
export const notificationRoutes = router;
