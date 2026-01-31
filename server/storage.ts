import { 
  userProfiles, 
  documents, 
  contactInquiries,
  type UserProfile, 
  type InsertUserProfile,
  type UpdateUserProfile,
  type Document,
  type InsertDocument,
  type ContactInquiry,
  type InsertContactInquiry,
} from "@shared/schema";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getProfile(userId: string): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, data: UpdateUserProfile): Promise<UserProfile | undefined>;
  getDocuments(userId: string): Promise<Document[]>;
  createDocument(doc: InsertDocument): Promise<Document>;
  deleteDocument(id: string, userId: string): Promise<boolean>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;
  getAllProfiles(): Promise<UserProfile[]>;
  updateProfileStatus(id: string, status: string): Promise<UserProfile | undefined>;
  updateDocumentStatus(id: string, status: string): Promise<Document | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const isComplete = !!(
      profile.fullName &&
      profile.dateOfBirth &&
      profile.gender &&
      profile.nationality &&
      profile.address &&
      profile.phoneNumber
    );

    const [created] = await db
      .insert(userProfiles)
      .values({ ...profile, isProfileComplete: isComplete })
      .returning();
    return created;
  }

  async updateProfile(userId: string, data: UpdateUserProfile): Promise<UserProfile | undefined> {
    const existing = await this.getProfile(userId);
    
    const mergedData = { ...existing, ...data };
    const isComplete = !!(
      mergedData.fullName &&
      mergedData.dateOfBirth &&
      mergedData.gender &&
      mergedData.nationality &&
      mergedData.address &&
      mergedData.phoneNumber
    );

    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ ...data, isProfileComplete: isComplete, updatedAt: new Date() })
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      return this.createProfile({ userId, ...data } as InsertUserProfile);
    }
  }

  async getDocuments(userId: string): Promise<Document[]> {
    return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.uploadedAt));
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const existing = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, doc.userId))
      .then(docs => docs.find(d => d.documentType === doc.documentType));

    if (existing) {
      const [updated] = await db
        .update(documents)
        .set({ ...doc, uploadedAt: new Date(), status: "pending" })
        .where(eq(documents.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(documents).values(doc).returning();
    return created;
  }

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(documents)
      .where(eq(documents.id, id))
      .returning();
    return result.length > 0;
  }

  async createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry> {
    const [created] = await db.insert(contactInquiries).values(inquiry).returning();
    return created;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return db.select().from(contactInquiries).orderBy(desc(contactInquiries.createdAt));
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    return db.select().from(userProfiles).orderBy(desc(userProfiles.createdAt));
  }

  async updateProfileStatus(id: string, status: string): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ applicationStatus: status as any, updatedAt: new Date() })
      .where(eq(userProfiles.id, id))
      .returning();
    return updated;
  }

  async updateDocumentStatus(id: string, status: string): Promise<Document | undefined> {
    const [updated] = await db
      .update(documents)
      .set({ status: status as any })
      .where(eq(documents.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
