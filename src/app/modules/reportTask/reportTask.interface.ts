import { Types } from 'mongoose';
import { USER_ROLE } from '../user/user.const';

export type DecisionType =
  | 'payment_to_provider'
  | 'refund_customer'
  | 'pending';
export interface IReportTask {
  taskId: Types.ObjectId;

  reporterId: string;

  reporterRole: (typeof USER_ROLE)[keyof typeof USER_ROLE];

  reason: string;

  evidence?: string[];

  note?: string;

  decisionType?: DecisionType;

  createdAt?: Date;
  updatedAt?: Date;
}
