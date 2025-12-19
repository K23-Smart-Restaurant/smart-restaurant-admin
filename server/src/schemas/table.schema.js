import { z } from "zod";

const createTableSchema = z.object({
    tableNumber: z.number().int().positive(),
    capacity: z.number().int().positive(),
    location: z.string().optional(),
    status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"]).default("AVAILABLE"),
});

const updateTableSchema = createTableSchema.partial();

export { createTableSchema, updateTableSchema };
