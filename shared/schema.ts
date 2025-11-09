import { z } from "zod";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

export const clientSchema = z.object({
  _id: z.string(),
  phoneNumber: z.string(),
  password: z.string(),
  name: z.string().optional(),
});

export const insertClientSchema = clientSchema.omit({ _id: true });

export type Client = z.infer<typeof clientSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;

export const adminSchema = z.object({
  _id: z.string(),
  phoneNumber: z.string(),
  password: z.string(),
  name: z.string().optional(),
});

export const insertAdminSchema = adminSchema.omit({ _id: true });

export type Admin = z.infer<typeof adminSchema>;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export const userSchema = z.object({
  _id: z.string(),
  phoneNumber: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'client']),
  name: z.string().optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const documentSchema = z.object({
  _id: z.string(),
  fileName: z.string(),
  clientPhoneNumber: z.string(),
  uploadDate: z.string(),
  fileSize: z.number(),
  gridFsFileId: z.string(),
  contentType: z.string().default("application/pdf"),
  uploadedBy: z.string(),
});

export const insertDocumentSchema = documentSchema.omit({ _id: true, uploadDate: true });

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

// Phone number validation with country support
export const phoneNumberSchema = z.string()
  .min(1, "Phone number is required")
  .refine((phone) => {
    try {
      return isValidPhoneNumber(phone);
    } catch {
      return false;
    }
  }, {
    message: "Please enter a valid phone number with country code (e.g., +1234567890)"
  });

// Strong password validation
export const strongPasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters long")
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter"
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter"
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number"
  })
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), {
    message: "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
  });

// Login schema (basic validation)
export const loginSchema = z.object({
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

// Register schema (strict validation)
export const registerSchema = z.object({
  phoneNumber: phoneNumberSchema,
  password: strongPasswordSchema,
  name: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const updateAdminProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phoneNumber: phoneNumberSchema.optional(),
  password: strongPasswordSchema.optional(),
}).refine((data) => data.name || data.phoneNumber || data.password, {
  message: "At least one field must be provided",
});

export type UpdateAdminProfile = z.infer<typeof updateAdminProfileSchema>;
