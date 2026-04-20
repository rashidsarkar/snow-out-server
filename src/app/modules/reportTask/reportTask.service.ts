import mongoose from 'mongoose';
import { IReportTask } from './reportTask.interface';
import ReportTask from './reportTask.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';

const createReportTask = async (payload: IReportTask) => {
  const result = await ReportTask.create(payload);
  return result;
};
const getAllReports = async () => {
  return await ReportTask.find().populate('taskId');
};

const getSingleReport = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid report ID');
  }

  const result = await ReportTask.findById(id).populate('taskId');

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
  }

  return result;
};
const ReportTaskServices = { createReportTask, getAllReports, getSingleReport };
export default ReportTaskServices;
