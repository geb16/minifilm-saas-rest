import { z } from "zod";

// Registration input validation
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8) // SaaS minimum
});

// Login validation
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Film creation validation
export const filmSchema = z.object({
  title: z.string().min(1)
});
