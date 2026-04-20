import { Types } from 'mongoose';
import Provider from '../provider/provider.model';
import Service from './service.model';

// 🔹 Get all service types
const getAllServices = async () => {
  return await Service.find().sort({ createdAt: -1 });
};

const addMyService = async (providerId: string, serviceId: string) => {
  const serviceObjectId = new Types.ObjectId(serviceId);

  const provider = await Provider.findByIdAndUpdate(
    providerId,
    {
      $addToSet: { serviceId: serviceObjectId }, // ✅ correct type
    },
    { new: true },
  );

  if (!provider) {
    throw new Error('Provider not found');
  }

  return provider;
};

const ServiceServices = {
  getAllServices,
  addMyService,
};

export default ServiceServices;
