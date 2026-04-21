import Customer from './customer.model';

const getAllCustomers = async (query: Record<string, unknown>) => {
  //   const queryObj = { ...query };
  //   const page = Number(query.page) || 1;
  //   const limit = Number(query.limit) || 10;
  //   const skip = (page - 1) * limit;
  //   const search = query.search || '';
  //   const searchAbleFields = ['title', 'content'];
  //   const excludeField = ['search', 'sortOrder', 'sortBy'];
  //   excludeField.forEach((key) => delete queryObj[key]);
  //   const filters: any = {};
  //   Object.keys(query).forEach((key) => {
  //     if (
  //       ![
  //         'searchTerm',
  //         'page',
  //         'limit',
  //         'sortBy',
  //         'sortOrder',
  //         'isBlocked',
  //       ].includes(key)
  //     ) {
  //       filters[key] = query[key];
  //     }
  //   });
  const result = await Customer.find();
  return result;
};

const CustomerServices = { getAllCustomers };
export default CustomerServices;
