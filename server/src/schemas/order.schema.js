import { z } from "zod";

const updateOrderStatusSchema = z.object({
    status: z.enum([
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "SERVED",
        "PAID",
        "CANCELLED",
    ]),
});

const orderFilterSchema = z.object({
    status: z
        .enum([
            "PENDING",
            "CONFIRMED",
            "PREPARING",
            "READY",
            "SERVED",
            "PAID",
            "CANCELLED",
        ])
        .optional(),
    tableId: z.string().optional(),
    sortBy: z.enum(["createdAt", "totalAmount", "status"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
});

export { updateOrderStatusSchema, orderFilterSchema };
