import { model, Schema } from 'mongoose';
import { IReportTask } from './reportTask.interface';
import { USER_ROLE } from '../user/user.const';

const reportTaskSchema = new Schema<IReportTask>(
  {
    taskId: { type: Schema.Types.ObjectId, required: true, ref: 'Task' },
    reporterId: { type: String, required: true },
    reporterRole: { type: String, enum: USER_ROLE, required: true },
    reason: { type: String, required: true },
    evedence: { type: [String], default: [] },
    note: { type: String },
    status: {
      type: String,

      default: 'pending',
    },
  },
  { timestamps: true },
);

const ReportTask = model<IReportTask>('ReportTask', reportTaskSchema);
export default ReportTask;
