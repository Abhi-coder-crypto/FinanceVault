import { z } from "zod";

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
  dropboxPath: z.string(),
  uploadedBy: z.string(),
});

export const insertDocumentSchema = documentSchema.omit({ _id: true, uploadDate: true });

export type Document = z.infer<typeof documentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
