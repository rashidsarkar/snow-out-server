import { z } from "zod";

export const updateReportTaskData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const ReportTaskValidations = { updateReportTaskData };
export default ReportTaskValidations;