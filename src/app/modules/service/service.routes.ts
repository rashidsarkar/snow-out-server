import express from 'express';
import ServiceController from './service.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';

const router = express.Router();

router.get('/', ServiceController.getAllServices);
router.patch(
  '/add-service',
  auth(USER_ROLE.PROVIDER),
  ServiceController.addMyService,
);

export const ServiceRoutes = router;
