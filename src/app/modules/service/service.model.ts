import { model, Schema } from 'mongoose';
import { IService } from './service.interface';

const serviceSchema = new Schema<IService>(
  {
    type: {
      type: String,
      enum: [
        'snow-plowing',
        'snow-shoveling',
        'salting-deicing',
        'lawn-mowing',
        'landscaping',
        'seasonal-contracts',
      ],
      required: true,
    },
  },
  { timestamps: true },
);

const Service = model<IService>('Service', serviceSchema);
export default Service;
