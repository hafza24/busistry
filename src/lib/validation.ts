import { z } from "zod";

/** Trim + collapse internal whitespace. */
export const normalize = (v: string) => v.trim().replace(/\s+/g, " ");

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email")
    .max(255),
  subject: z.string().trim().min(2, "Subject is required").max(150),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const step5ContactSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30)
    .regex(/^[+0-9()\-\s]+$/, "Phone may only contain digits, spaces, +, -, ()"),
  whatsapp: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9()\-\s]*$/, "WhatsApp may only contain digits, spaces, +, -, ()")
    .optional()
    .or(z.literal("")),
  business_address: z.string().trim().max(300).optional().or(z.literal("")),
});
export type Step5ContactValues = z.infer<typeof step5ContactSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must include a letter")
    .regex(/[0-9]/, "Password must include a number"),
});
