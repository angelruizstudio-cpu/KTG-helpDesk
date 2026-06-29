import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});

export const createTicketSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(1).max(5000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  type: z.enum(["SUPPORT", "TASK"]).default("SUPPORT"),
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().nullable().optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(3000),
});
