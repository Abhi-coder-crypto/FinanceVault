import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { sessionMiddleware } from "./session";
import { requireAuth, requireAdmin } from "./middleware/auth";
import { loginSchema, registerSchema, updateAdminProfileSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add session middleware
  app.use(sessionMiddleware);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, password } = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(phoneNumber, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid phone number or password" });
      }

      // Set session data
      req.session.userId = user._id;
      req.session.phoneNumber = user.phoneNumber;
      req.session.role = user.role;

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

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhoneNumber(data.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ error: "User with this phone number already exists" });
      }

      // All new users are clients - only admins can create admin accounts
      const user = await storage.createUser({
        ...data,
        role: "client",
      });
      
      // Automatically log in the new user
      req.session.userId = user._id;
      req.session.phoneNumber = user.phoneNumber;
      req.session.role = user.role;

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

  // Get current user session
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all clients with document counts (admin only)
  app.get("/api/clients", requireAdmin, async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      const documents = await storage.getAllDocuments();
      
      // Calculate document count for each client server-side
      const clientsWithCounts = clients.map(client => {
        const documentCount = documents.filter(
          doc => doc.clientPhoneNumber === client.phoneNumber
        ).length;
        return {
          _id: client._id,
          phoneNumber: client.phoneNumber,
          role: client.role,
          name: client.name,
          documentCount,
        };
      });
      
      res.json({ clients: clientsWithCounts });
    } catch (error) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Update admin profile
  app.patch("/api/admin/profile", requireAdmin, async (req, res) => {
    try {
      const data = updateAdminProfileSchema.parse(req.body);
      
      const updates: Partial<typeof data> & { password?: string } = {};
      if (data.name) updates.name = data.name;
      if (data.phoneNumber) {
        const existingUser = await storage.getUserByPhoneNumber(data.phoneNumber);
        if (existingUser && existingUser._id !== req.session.userId) {
          return res.status(400).json({ error: "Phone number already in use" });
        }
        updates.phoneNumber = data.phoneNumber;
      }
      if (data.password) updates.password = data.password;

      const updatedUser = await storage.updateUser(req.session.userId!, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (updates.phoneNumber) {
        req.session.phoneNumber = updates.phoneNumber;
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Document routes - all require authentication
  app.post("/api/documents/upload", requireAdmin, upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { clientPhoneNumber } = req.body;
      
      if (!clientPhoneNumber) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ error: "Client phone number is required" });
      }

      // Store file with original name in uploads directory
      const newPath = path.join("uploads", `${Date.now()}_${req.file.originalname}`);
      await fs.rename(req.file.path, newPath);

      const document = await storage.createDocument({
        fileName: req.file.originalname,
        clientPhoneNumber,
        fileSize: req.file.size,
        dropboxPath: newPath,
        uploadedBy: req.session.userId!,
      });

      res.json({ document });
    } catch (error) {
      console.error("Upload error:", error);
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {}
      }
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Batch upload - multiple files for one client (supports up to 1000 files)
  app.post("/api/documents/batch-upload", requireAdmin, upload.array("files", 1000), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const { clientPhoneNumber } = req.body;
      
      if (!clientPhoneNumber) {
        // Clean up all uploaded files
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch {}
        }
        return res.status(400).json({ error: "Client phone number is required" });
      }

      const uploadedDocuments = [];
      const errors = [];

      for (const file of req.files) {
        let newPath = "";
        try {
          // Store file with original name in uploads directory
          newPath = path.join("uploads", `${Date.now()}_${file.originalname}`);
          await fs.rename(file.path, newPath);

          const document = await storage.createDocument({
            fileName: file.originalname,
            clientPhoneNumber,
            fileSize: file.size,
            dropboxPath: newPath,
            uploadedBy: req.session.userId!,
          });

          uploadedDocuments.push(document);
        } catch (error) {
          console.error(`Error uploading ${file.originalname}:`, error);
          errors.push({ fileName: file.originalname, error: "Upload failed" });
          // Clean up the file (use newPath if rename succeeded, file.path if it didn't)
          try {
            if (newPath) {
              await fs.unlink(newPath);
            } else {
              await fs.unlink(file.path);
            }
          } catch (cleanupError) {
            console.error(`Cleanup failed for ${file.originalname}:`, cleanupError);
          }
        }
      }

      res.json({ 
        documents: uploadedDocuments,
        errors: errors.length > 0 ? errors : undefined,
        totalFiles: req.files.length,
        successCount: uploadedDocuments.length,
        errorCount: errors.length
      });
    } catch (error) {
      console.error("Batch upload error:", error);
      // Clean up any uploaded files
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch {}
        }
      }
      res.status(500).json({ error: "Failed to upload documents" });
    }
  });

  app.get("/api/documents", requireAuth, async (req, res) => {
    try {
      const isAdmin = req.session.role === "admin";
      
      if (isAdmin) {
        // Admin can get all documents or filter by client
        const { clientPhoneNumber } = req.query;
        
        if (clientPhoneNumber) {
          const documents = await storage.getDocumentsByClient(clientPhoneNumber as string);
          res.json({ documents });
        } else {
          const documents = await storage.getAllDocuments();
          res.json({ documents });
        }
      } else {
        // Clients can only see their own documents
        const documents = await storage.getDocumentsByClient(req.session.phoneNumber!);
        res.json({ documents });
      }
    } catch (error) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id/preview", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check access: admin can preview any, client can only preview their own
      const isAdmin = req.session.role === "admin";
      const isOwner = document.clientPhoneNumber === req.session.phoneNumber;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Send file for inline display (preview in browser)
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);
      res.sendFile(path.resolve(document.dropboxPath));
    } catch (error) {
      console.error("Preview error:", error);
      res.status(500).json({ error: "Failed to preview document" });
    }
  });

  app.get("/api/documents/:id/download", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check access: admin can download any, client can only download their own
      const isAdmin = req.session.role === "admin";
      const isOwner = document.clientPhoneNumber === req.session.phoneNumber;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Send the file as download (saves to computer)
      res.download(document.dropboxPath, document.fileName);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Failed to download document" });
    }
  });

  app.delete("/api/documents/:id", requireAdmin, async (req, res) => {
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
