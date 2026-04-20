import express from 'express';
import auth from '../../middlewares/auth';
import { uploadFile } from '../../utils/fileUploader';
import { USER_ROLE } from '../user/user.const';
import ReportTaskController from './reportTask.controller';

const router = express.Router();

router.post(
  '/create-report-task',
  auth(USER_ROLE.CUSTOMER, USER_ROLE.PROVIDER),
  uploadFile(),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },

  ReportTaskController.createReportTask,
);
// Get all
router.get('/', auth(USER_ROLE.ADMIN), ReportTaskController.getAllReports);

// Get single
router.get(
  'single-task/:id',
  auth(USER_ROLE.ADMIN),
  ReportTaskController.getSingleReport,
);
export const reportTaskRoutes = router;
