import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertTemplateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Contacts
  app.get("/api/contacts", async (req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    const contact = insertContactSchema.parse(req.body);
    const created = await storage.createContact(contact);
    res.json(created);
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    const contact = insertContactSchema.parse(req.body);
    const updated = await storage.updateContact(Number(req.params.id), contact);
    res.json(updated);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    await storage.deleteContact(Number(req.params.id));
    res.status(204).end();
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    const templates = await storage.getTemplates();
    res.json(templates);
  });

  app.post("/api/templates", async (req, res) => {
    const template = insertTemplateSchema.parse(req.body);
    const created = await storage.createTemplate(template);
    res.json(created);
  });

  app.patch("/api/templates/:id", async (req, res) => {
    const template = insertTemplateSchema.parse(req.body);
    const updated = await storage.updateTemplate(Number(req.params.id), template);
    res.json(updated);
  });

  app.delete("/api/templates/:id", async (req, res) => {
    await storage.deleteTemplate(Number(req.params.id));
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
