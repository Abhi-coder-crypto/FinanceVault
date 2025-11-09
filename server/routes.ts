import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { sessionMiddleware } from "./session";
import { requireAuth, requireAdmin } from "./middleware/auth";
import { loginSchema, registerSchema, updateAdminProfileSchema, uploadDocumentSchema } from "@shared/schema";

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
      const registeredClients = await storage.getAllClients();
      const documents = await storage.getAllDocuments();
      
      // Group documents by phone number
      const phoneNumberMap = new Map<string, { name?: string, documentCount: number, _id?: string, role?: string }>();
      
      // Add registered clients
      registeredClients.forEach(client => {
        phoneNumberMap.set(client.phoneNumber, {
          name: client.name,
          documentCount: 0,
          _id: client._id,
          role: client.role
        });
      });
      
      // Count documents for each phone number (including unregistered)
      documents.forEach(doc => {
        const existing = phoneNumberMap.get(doc.clientPhoneNumber);
        if (existing) {
          existing.documentCount++;
        } else {
          // Client has documents but hasn't registered yet
          phoneNumberMap.set(doc.clientPhoneNumber, {
            name: undefined,
            documentCount: 1,
            _id: doc.clientPhoneNumber, // Use phone as ID for unregistered
            role: undefined
          });
        }
      });
      
      // Convert map to array
      const clientsWithCounts = Array.from(phoneNumberMap.entries()).map(([phoneNumber, data]) => ({
        _id: data._id || phoneNumber,
        phoneNumber,
        role: data.role || 'client',
        name: data.name,
        documentCount: data.documentCount,
      }));
      
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
    let fileHandle = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Validate phone number
      const validation = uploadDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ 
          error: validation.error.errors[0]?.message || "Invalid phone number format"
        });
      }

      const { clientPhoneNumber } = validation.data;

      // Create a read stream from the uploaded file
      fileHandle = await fs.open(req.file.path, 'r');
      const readStream = fileHandle.createReadStream();

      // Upload to filesystem storage
      const document = await storage.createDocumentFromStream({
        fileName: req.file.originalname,
        clientPhoneNumber,
        fileSize: req.file.size,
        uploadedBy: req.session.userId!,
      }, readStream, req.file.mimetype);

      res.json({ document });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    } finally {
      // Clean up file handle and temporary file
      if (fileHandle) {
        try {
          await fileHandle.close();
        } catch (closeError) {
          console.error("Error closing file handle:", closeError);
        }
      }
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temp file:", unlinkError);
        }
      }
    }
  });

  // Batch upload - multiple files for one client (supports up to 1000 files)
  app.post("/api/documents/batch-upload", requireAdmin, upload.array("files", 1000), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      // Validate phone number
      const validation = uploadDocumentSchema.safeParse(req.body);
      if (!validation.success) {
        // Clean up all uploaded files
        for (const file of req.files) {
          try {
            await fs.unlink(file.path);
          } catch {}
        }
        return res.status(400).json({ 
          error: validation.error.errors[0]?.message || "Invalid phone number format"
        });
      }

      const { clientPhoneNumber } = validation.data;

      const uploadedDocuments = [];
      const errors = [];

      for (const file of req.files) {
        let fileHandle = null;
        try {
          // Create a read stream from the uploaded file
          fileHandle = await fs.open(file.path, 'r');
          const readStream = fileHandle.createReadStream();

          // Upload to filesystem storage
          const document = await storage.createDocumentFromStream({
            fileName: file.originalname,
            clientPhoneNumber,
            fileSize: file.size,
            uploadedBy: req.session.userId!,
          }, readStream, file.mimetype);

          uploadedDocuments.push(document);
        } catch (error) {
          console.error(`Error uploading ${file.originalname}:`, error);
          errors.push({ fileName: file.originalname, error: "Upload failed" });
        } finally {
          // Clean up file handle and temporary file
          if (fileHandle) {
            try {
              await fileHandle.close();
            } catch (closeError) {
              console.error(`Error closing file handle for ${file.originalname}:`, closeError);
            }
          }
          try {
            await fs.unlink(file.path);
          } catch (unlinkError) {
            console.error(`Error deleting temp file for ${file.originalname}:`, unlinkError);
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

      // Stream file from filesystem for inline display (preview in browser)
      const fileStream = await storage.getDocumentStream(document.filePath);
      
      if (!fileStream) {
        return res.status(404).json({ error: "File not found in storage" });
      }

      res.setHeader("Content-Type", document.contentType);
      res.setHeader("Content-Disposition", `inline; filename="${document.fileName}"`);
      fileStream.pipe(res);
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

      // Stream file from filesystem as download (saves to computer)
      const fileStream = await storage.getDocumentStream(document.filePath);
      
      if (!fileStream) {
        return res.status(404).json({ error: "File not found in storage" });
      }

      res.setHeader("Content-Type", document.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
      fileStream.pipe(res);
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

      // Delete from database and filesystem (handled by storage layer)
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
