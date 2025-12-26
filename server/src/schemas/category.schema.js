import { z } from "zod";

const createCategorySchema = z.object({
  name: z
    .string({ required_error: "Category name is required" })
    .min(1, "Category name must be at least 1 character")
    .max(50, "Category name must be at most 50 characters"),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  displayOrder: z
    .number({ invalid_type_error: "Display order must be a number" })
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = createCategorySchema.partial();

export { createCategorySchema, updateCategorySchema };
