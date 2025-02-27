import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull(),
});

export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).pick({
  name: true,
  phoneNumber: true,
});

export const insertTemplateSchema = createInsertSchema(messageTemplates).pick({
  name: true,
  content: true,
  category: true,
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
