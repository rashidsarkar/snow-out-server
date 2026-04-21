import express from 'express';
import ProviderController from './provider.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.const';

const router = express.Router();

router.post('/', ProviderController.createProvider);
router.get('/', ProviderController.getAllProviders);

router.patch(
  '/update-location',
  auth(USER_ROLE.PROVIDER),
  ProviderController.updateLocation,
);

router.get('/:id', ProviderController.getProviderById);

router.patch('/:id', ProviderController.updateProvider);
router.delete('/:id', ProviderController.deleteProvider);

export const ProviderRoutes = router;
