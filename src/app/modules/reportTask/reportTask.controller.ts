import { StatusCodes } from 'http-status-codes';
import ReportTaskServices from './reportTask.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';

const createReportTask = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'report_image' in files) {
    req.body.report_image = files['report_image'][0].path;
  }

  const result = await ReportTaskServices.createReportTask({
    ...req.body,
    reporterId: req.user.profileId,
    reporterRole: req.user.role,
  });
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Report updated successfully',
    data: result,
  });
});

const getAllReports = catchAsync(async (req, res) => {
  const result = await ReportTaskServices.getAllReports();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reports fetched successfully',
    data: result,
  });
});

const getSingleReport = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReportTaskServices.getSingleReport(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Report fetched successfully',
    data: result,
  });
});
const ReportTaskController = {
  createReportTask,
  getAllReports,
  getSingleReport,
};
export default ReportTaskController;
