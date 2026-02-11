import bcrypt from "bcryptjs";
import crypto from "crypto";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import { users, passwordResetTokens } from "@shared/models/auth";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: sessionTtl,
      },
    })
  );
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  (req as any).user = user;
  next();
};

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    const { passwordHash, ...safeUser } = req.user;
    res.json(safeUser);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const [existing] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      if (existing) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }

      const hash = await bcrypt.hash(password, 12);
      
      const [user] = await db
        .insert(users)
        .values({
          email: email.toLowerCase(),
          firstName,
          lastName,
          passwordHash: hash,
        })
        .returning();

      req.session.userId = user.id;
      
      const { passwordHash, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register. Please try again." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in. Please try again." });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
      
      res.json({ message: "If an account with that email exists, a password reset link has been sent." });

      if (!user) return;

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      if (process.env.SMTP_HOST) {
        const { sendPasswordResetEmail } = await import("./mailer");
        const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
        await sendPasswordResetEmail(email, resetUrl);
      } else {
        console.log(`[DEV] Password reset link for ${email}: /reset-password?token=${token}`);
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false)
          )
        );

      if (!resetToken || new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }

      const hash = await bcrypt.hash(password, 12);

      await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, resetToken.userId));
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ message: "Password has been reset successfully. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password. Please try again." });
    }
  });
}
