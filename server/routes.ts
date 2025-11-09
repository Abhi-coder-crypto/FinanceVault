import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Validation schemas
const loginSchema = z.object({
  phoneNumber: z.string().min(1),
  password: z.string().min(1),
});

const registerSchema = z.object({
  phoneNumber: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["admin", "client"]),
  name: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, password } = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(phoneNumber, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid phone number or password" });
      }

      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhoneNumber(data.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "User with this phone number already exists" });
      }

      const user = await storage.createUser(data);
      
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Document routes
  app.post("/api/documents/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { clientPhoneNumber, uploadedBy } = req.body;
      
      if (!clientPhoneNumber || !uploadedBy) {
        // Clean up uploaded file
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Store file with original name in uploads directory
      const newPath = path.join("uploads", `${Date.now()}_${req.file.originalname}`);
      await fs.rename(req.file.path, newPath);

      const document = await storage.createDocument({
        fileName: req.file.originalname,
        clientPhoneNumber,
        fileSize: req.file.size,
        dropboxPath: newPath, // Will be Dropbox path when integrated
        uploadedBy,
      });

      res.json({ document });
    } catch (error) {
      console.error("Upload error:", error);
      // Clean up file if it exists
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {}
      }
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/documents", async (req, res) => {
    try {
      const { clientPhoneNumber } = req.query;

      if (clientPhoneNumber) {
        // Get documents for specific client
        const documents = await storage.getDocumentsByClient(clientPhoneNumber as string);
        res.json({ documents });
      } else {
        // Get all documents (admin only)
        const documents = await storage.getAllDocuments();
        res.json({ documents });
      }
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Send the file
      res.download(document.dropboxPath, document.fileName);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Delete file from disk
      try {
        await fs.unlink(document.dropboxPath);
      } catch (error) {
        console.error("File deletion error:", error);
      }

      // Delete from database
      const success = await storage.deleteDocument(id);

      if (success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: "Failed to delete document" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
