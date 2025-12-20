import { z } from "zod";

// Predefined locations - can be extended as needed
const VALID_LOCATIONS = [
    "Main Floor",
    "Patio",
    "Private Room A",
    "Private Room B",
    "Bar Area",
    "Window Section",
    "Garden",
    "VIP Area",
    "Terrace",
    "Lounge"
];

const createTableSchema = z.object({
    tableNumber: z.number().int().positive("Table number must be a positive integer"),
    capacity: z.number()
        .int("Capacity must be an integer")
        .min(1, "Capacity must be at least 1")
        .max(20, "Capacity cannot exceed 20"),
    location: z.string()
        .min(1, "Location is required")
        .max(100, "Location must be at most 100 characters"),
    description: z.string()
        .max(500, "Description must be at most 500 characters")
        .optional(),
    status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED"])
        .default("AVAILABLE"),
});

const updateTableSchema = createTableSchema.partial();

export { createTableSchema, updateTableSchema, VALID_LOCATIONS };
