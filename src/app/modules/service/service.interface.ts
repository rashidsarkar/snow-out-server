export type ServiceType =
  | 'snow-plowing'
  | 'snow-shoveling'
  | 'salting-deicing'
  | 'lawn-mowing'
  | 'landscaping'
  | 'seasonal-contracts';

export interface IService {
  type: ServiceType;
  createdAt?: Date;
  updatedAt?: Date;
}
