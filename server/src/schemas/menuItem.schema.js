import { z } from "zod";

const createMenuItemSchema = z.object({
  name: z
    .string({ required_error: "Menu item name is required" })
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional(),
  category: z.enum(["APPETIZER", "MAIN_COURSE", "DESSERT", "BEVERAGE"], {
    required_error: "Category is required",
    invalid_type_error:
      "Invalid category. Must be one of: APPETIZER, MAIN_COURSE, DESSERT, BEVERAGE",
  }),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0"),
  categoryId: z.string().uuid("Category ID must be a valid UUID").optional(),
  preparationTime: z
    .number({ invalid_type_error: "Preparation time must be a number" })
    .int("Preparation time must be an integer")
    .min(0, "Preparation time must be at least 0 minutes")
    .max(240, "Preparation time must be at most 240 minutes")
    .optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  isChefRecommendation: z.boolean().default(false),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

const createModifierSchema = z.object({
  name: z
    .string({ required_error: "Modifier name is required" })
    .min(1, "Modifier name must be at least 1 character"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .min(0, "Price must be non-negative")
    .default(0),
  groupName: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  displayOrder: z.number().int().min(0).default(0),
});

export { createMenuItemSchema, updateMenuItemSchema, createModifierSchema };
