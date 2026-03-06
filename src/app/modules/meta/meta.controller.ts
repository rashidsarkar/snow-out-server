import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import MetaService from './meta.service';

const getDashboardMetaData = catchAsync(async (req, res) => {
  const result = await MetaService.getDashboardMetaData();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard meta data retrieved successfully',
    data: result,
  });
});

const getNormalUserChartData = catchAsync(async (req, res) => {
  const result = await MetaService.getNormalUserChartData(
    Number(req?.query.year),
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Normal User chart data retrieved successfully',
    data: result,
  });
});

const getInsuredCartDataWithTrend = catchAsync(async (req, res) => {
  const result = await MetaService.getInsuredCartDataWithTrend();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Insurer chart data with trend retrieved successfully',
    data: result,
  });
});

const MetaController = {
  getDashboardMetaData,
  getNormalUserChartData,
  getInsuredCartDataWithTrend,
  // getProviderChartData,
};

export default MetaController;
