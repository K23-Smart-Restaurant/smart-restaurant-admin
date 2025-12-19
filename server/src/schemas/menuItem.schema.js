import { z } from "zod";

const createMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(["APPETIZER", "MAIN_COURSE", "DESSERT", "BEVERAGE"]),
  price: z.number().positive(),
  categoryId: z.string().uuid().optional(),
  preparationTime: z.number().int().positive().optional(),
  isAvailable: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  isChefRecommendation: z.boolean().default(false),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

const createModifierSchema = z.object({
  name: z.string().min(1),
  price: z.number().default(0),
  groupName: z.string().optional(),
});

export { createMenuItemSchema, updateMenuItemSchema, createModifierSchema };
