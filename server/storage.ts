import {
  type Contact,
  type InsertContact,
  type MessageTemplate,
  type InsertTemplate,
} from "@shared/schema";

export interface IStorage {
  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: InsertContact): Promise<Contact>;
  deleteContact(id: number): Promise<void>;

  // Templates
  getTemplates(): Promise<MessageTemplate[]>;
  getTemplate(id: number): Promise<MessageTemplate | undefined>;
  createTemplate(template: InsertTemplate): Promise<MessageTemplate>;
  updateTemplate(id: number, template: InsertTemplate): Promise<MessageTemplate>;
  deleteTemplate(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private templates: Map<number, MessageTemplate>;
  private contactId: number;
  private templateId: number;

  constructor() {
    this.contacts = new Map();
    this.templates = new Map();
    this.contactId = 2; // Start from 2 since we're adding one contact
    this.templateId = 2; // Start from 2 since we're adding one template

    // Add test contact
    this.contacts.set(1, {
      id: 1,
      name: "Nikhil",
      phoneNumber: "919768199882" // Note: Added without + as it'll be formatted in whatsapp.ts
    });

    // Add test template
    this.templates.set(1, {
      id: 1,
      name: "Test Message",
      content: "Hello World! This is a test message.",
      category: "General"
    });
  }

  // Rest of the methods remain unchanged
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactId++;
    const contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, insertContact: InsertContact): Promise<Contact> {
    const contact = { ...insertContact, id };
    this.contacts.set(id, contact);
    return contact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  // Templates
  async getTemplates(): Promise<MessageTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<MessageTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<MessageTemplate> {
    const id = this.templateId++;
    const template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(
    id: number,
    insertTemplate: InsertTemplate,
  ): Promise<MessageTemplate> {
    const template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    this.templates.delete(id);
  }
}

export const storage = new MemStorage();