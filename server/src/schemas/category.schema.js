import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  displayOrder: z.number().int().default(0),
});

const updateCategorySchema = createCategorySchema.partial();

export { createCategorySchema, updateCategorySchema };
