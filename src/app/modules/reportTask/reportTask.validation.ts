import { z } from 'zod';

const createReportTaskData = z.object({
  body: z.object({
    taskId: z.string({
      required_error: 'Task ID is required',
    }),

    reason: z.string({
      required_error: 'Reason is required',
    }),

    evidence: z.array(z.string()).optional(), // keep same typo as schema

    note: z.string().optional(),

    status: z
      .enum(['payment_to_provider', 'refund_customer', 'pending'])
      .optional(),
  }),
});
const ReportTaskValidations = { createReportTaskData };
export default ReportTaskValidations;
