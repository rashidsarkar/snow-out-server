import express from 'express';
import ProviderController from './provider.controller';

const router = express.Router();

router.post('/', ProviderController.createProvider);
router.get('/', ProviderController.getAllProviders);
router.get('/:id', ProviderController.getProviderById);
router.patch('/:id', ProviderController.updateProvider);
router.delete('/:id', ProviderController.deleteProvider);

export const ProviderRoutes = router;
