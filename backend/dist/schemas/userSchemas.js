"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = require("zod");
const zod_to_json_schema_1 = require("zod-to-json-schema");
// ✅ Définition des schémas Zod
exports.createUserZodSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    birthdate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
});
exports.updateUserZodSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    birthdate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }).optional(),
});
// ✅ Conversion en JSON Schema compatible avec Fastify
exports.createUserSchema = {
    body: Object.assign({ type: "object" }, (0, zod_to_json_schema_1.zodToJsonSchema)(exports.createUserZodSchema, { $refStrategy: "none" })),
};
exports.updateUserSchema = {
    body: Object.assign({ type: "object" }, (0, zod_to_json_schema_1.zodToJsonSchema)(exports.updateUserZodSchema, { $refStrategy: "none" })),
};
