import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  userType: varchar("user_type", { enum: ["student", "patient"] }).notNull(),
  fullName: varchar("full_name"),
  dateOfBirth: varchar("date_of_birth"),
  gender: varchar("gender", { enum: ["male", "female", "other"] }),
  nationality: varchar("nationality"),
  address: text("address"),
  phoneNumber: varchar("phone_number"),
  isProfileComplete: boolean("is_profile_complete").default(false),
  applicationStatus: varchar("application_status", { 
    enum: ["pending", "in_review", "approved", "rejected", "resubmission_required"] 
  }).default("pending"),
  medicalHistory: text("medical_history"),
  diagnosis: text("diagnosis"),
  symptoms: text("symptoms"),
  pastTreatments: text("past_treatments"),
  reasonForPakistan: text("reason_for_pakistan"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  documentType: varchar("document_type").notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  status: varchar("status", { enum: ["pending", "verified", "rejected"] }).default("pending"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [index("documents_user_id_idx").on(table.userId)]);

export const contactInquiries = pgTable("contact_inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status", { enum: ["new", "read", "replied"] }).default("new"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserProfileSchema = insertUserProfileSchema.partial();

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertContactInquirySchema = createInsertSchema(contactInquiries).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ContactInquiry = typeof contactInquiries.$inferSelect;
export type InsertContactInquiry = z.infer<typeof insertContactInquirySchema>;
