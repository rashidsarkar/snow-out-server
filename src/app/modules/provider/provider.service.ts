import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IProvider } from '../provider/provider.interface';
import Provider from '../provider/provider.model';

// 🔹 Create
const createProvider = async (payload: IProvider) => {
  const result = await Provider.create(payload);
  return result;
};

// 🔹 Get All
const getAllProviders = async () => {
  return await Provider.find()
    .populate('userId')
    .populate('serviceId')
    .sort({ createdAt: -1 });
};

// 🔹 Get Single
const getProviderById = async (id: string) => {
  const result = await Provider.findById(id)
    .populate('userId')
    .populate('serviceId');

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return result;
};

// 🔹 Update
const updateProvider = async (id: string, payload: Partial<IProvider>) => {
  const isExist = await Provider.findById(id);

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return await Provider.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

// 🔹 Delete
const deleteProvider = async (id: string) => {
  const result = await Provider.findByIdAndDelete(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  return result;
};

const ProviderService = {
  createProvider,
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
};

export default ProviderService;
