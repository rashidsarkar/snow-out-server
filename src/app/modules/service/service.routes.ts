import express from 'express';
import ServiceController from './service.controller';

const router = express.Router();

router.get('/', ServiceController.getAllServices);

export const ServiceRoutes = router;
