import express from 'express';
import TaskController from './task.controller';

const router = express.Router();

router.get('/', TaskController.getAllTasks);
router.post('/', TaskController.createTask);
router.patch('/:id', TaskController.updateTask);
router.get('/:id', TaskController.getTaskById);

export const TaskRoutes = router;
