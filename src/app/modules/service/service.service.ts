import Service from './service.model';

// 🔹 Get all service types
const getAllServices = async () => {
  return await Service.find().sort({ createdAt: -1 });
};

const ServiceServices = {
  getAllServices,
};

export default ServiceServices;
