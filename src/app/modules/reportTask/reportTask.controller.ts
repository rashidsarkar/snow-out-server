import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import reportTaskServices from './reportTask.service';
import ReportTaskServices from './reportTask.service';

const createReportTask = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    req.body.profile_image = files['profile_image'][0].path;
  }

  const result = await ReportTaskServices.createReportTask({
    ...req.body,
    reporterId: req.user.profileId,
    reporterRole: req.user.role,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Report updated successfully',
    data: result,
  });
});

const getAllReports = catchAsync(async (req, res) => {
  const result = await ReportTaskServices.getAllReports();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reports fetched successfully',
    data: result,
  });
});

const getSingleReport = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ReportTaskServices.getSingleReport(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
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
