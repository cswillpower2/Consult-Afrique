import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import { insertContactInquirySchema, updateUserProfileSchema, insertNewsArticleSchema, updateNewsArticleSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Admin emails - add admin user emails here
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

// Middleware to check if user is admin
const isAdmin = (req: any, res: Response, next: NextFunction) => {
  const userEmail = req.user?.email?.toLowerCase();
  if (!userEmail || !ADMIN_EMAILS.includes(userEmail)) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

const uploadDir = "./uploads";
const newsUploadDir = "./uploads/news";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(newsUploadDir)) {
  fs.mkdirSync(newsUploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

const newsImageUpload = multer({
  storage: multer.diskStorage({
    destination: newsUploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getProfile(userId);
      if (profile) {
        res.json(profile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const parsed = updateUserProfileSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const profile = await storage.updateProfile(userId, { ...parsed.data, userId });
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const docs = await storage.getDocuments(userId);
      res.json(docs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", isAuthenticated, upload.single("file"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;
      const documentType = req.body.documentType;

      if (!file || !documentType) {
        return res.status(400).json({ message: "File and document type are required" });
      }

      const doc = await storage.createDocument({
        userId,
        documentType,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
      });

      res.json(doc);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const success = await storage.deleteDocument(req.params.id, userId);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const parsed = insertContactInquirySchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.errors });
      }

      const inquiry = await storage.createContactInquiry(parsed.data);
      res.json(inquiry);
    } catch (error) {
      console.error("Error creating contact inquiry:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/uploads/:filename", isAuthenticated, (req: any, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    res.setHeader("Content-Disposition", "inline");
    res.sendFile(path.resolve(filePath));
  });

  // Check if current user is admin
  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    const userEmail = req.user?.email?.toLowerCase();
    const isAdminUser = userEmail && ADMIN_EMAILS.includes(userEmail);
    res.json({ isAdmin: isAdminUser });
  });

  app.get("/api/admin/profiles", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  app.patch("/api/admin/profiles/:id/status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "in_review", "approved", "rejected", "resubmission_required"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const profile = await storage.updateProfileStatus(req.params.id, status);
      if (profile) {
        res.json(profile);
      } else {
        res.status(404).json({ message: "Profile not found" });
      }
    } catch (error) {
      console.error("Error updating profile status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.get("/api/admin/documents", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.query.userId as string;
      if (userId) {
        const docs = await storage.getDocuments(userId);
        res.json(docs);
      } else {
        res.status(400).json({ message: "userId query parameter required" });
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.patch("/api/admin/documents/:id/status", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["pending", "verified", "rejected"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const doc = await storage.updateDocumentStatus(req.params.id, status);
      if (doc) {
        res.json(doc);
      } else {
        res.status(404).json({ message: "Document not found" });
      }
    } catch (error) {
      console.error("Error updating document status:", error);
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.get("/api/admin/inquiries", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const inquiries = await storage.getContactInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });

  app.get("/uploads/news/:filename", (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(newsUploadDir, filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Public news endpoints
  app.get("/api/news", async (req, res) => {
    try {
      const articles = await storage.getPublishedNews();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const article = await storage.getNewsById(req.params.id);
      if (article && article.isPublished) {
        res.json(article);
      } else {
        res.status(404).json({ message: "Article not found" });
      }
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  // Admin news endpoints
  app.get("/api/admin/news", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const articles = await storage.getAllNews();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post("/api/admin/news", isAuthenticated, isAdmin, newsImageUpload.single("image"), async (req: any, res) => {
    try {
      const data = {
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        isPublished: req.body.isPublished === "true" || req.body.isPublished === true,
        publishedAt: (req.body.isPublished === "true" || req.body.isPublished === true) ? new Date() : null,
        imageUrl: req.file ? `/uploads/news/${req.file.filename}` : null,
        authorId: req.user.id,
      };
      if (!data.title || !data.summary || !data.content) {
        return res.status(400).json({ message: "Title, summary, and content are required" });
      }
      const article = await storage.createNews(data);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.patch("/api/admin/news/:id", isAuthenticated, isAdmin, newsImageUpload.single("image"), async (req: any, res) => {
    try {
      const data: any = {};
      if (req.body.title !== undefined) data.title = req.body.title;
      if (req.body.summary !== undefined) data.summary = req.body.summary;
      if (req.body.content !== undefined) data.content = req.body.content;
      if (req.body.isPublished !== undefined) {
        data.isPublished = req.body.isPublished === "true" || req.body.isPublished === true;
        data.publishedAt = data.isPublished ? new Date() : null;
      }
      if (req.file) {
        const existing = await storage.getNewsById(req.params.id);
        if (existing?.imageUrl) {
          const oldPath = path.join(".", existing.imageUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        data.imageUrl = `/uploads/news/${req.file.filename}`;
      }
      if (req.body.removeImage === "true") {
        const existing = await storage.getNewsById(req.params.id);
        if (existing?.imageUrl) {
          const oldPath = path.join(".", existing.imageUrl);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        data.imageUrl = null;
      }
      const article = await storage.updateNews(req.params.id, data);
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ message: "Article not found" });
      }
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/admin/news/:id", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const existing = await storage.getNewsById(req.params.id);
      if (existing?.imageUrl) {
        const oldPath = path.join(".", existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const success = await storage.deleteNews(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Article not found" });
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  return httpServer;
}
