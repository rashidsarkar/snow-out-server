import { z } from "zod";

export const updateCustomerData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const CustomerValidations = { updateCustomerData };
export default CustomerValidations;