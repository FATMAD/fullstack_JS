import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// ✅ Définition des schémas Zod
export const createUserZodSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const updateUserZodSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }).optional(),
});

// ✅ Conversion en JSON Schema compatible avec Fastify
export const createUserSchema = {
  body: {
    type: "object",
    ...zodToJsonSchema(createUserZodSchema, { $refStrategy: "none" }),
  },
};

export const updateUserSchema = {
  body: {
    type: "object",
    ...zodToJsonSchema(updateUserZodSchema, { $refStrategy: "none" }),
  },
};
