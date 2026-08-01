import { z } from "zod";

const baseFields = {
  fullName: z.string().trim().min(2, "Veuillez indiquer votre nom complet."),
  companyName: z.string().trim().min(2, "Veuillez indiquer le nom de votre entreprise."),
  professionalEmail: z
    .string()
    .trim()
    .min(1, "Veuillez indiquer votre adresse e-mail.")
    .email("Adresse e-mail invalide."),
  phone: z.string().trim().optional().or(z.literal("")),
  sitesCount: z
    .string()
    .optional()
    .refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 0), {
      message: "Veuillez indiquer un nombre valide.",
    }),
  productInterest: z.string().trim().optional().or(z.literal("")),
  consent: z.boolean().refine((v) => v === true, {
    message: "Vous devez accepter d'être contacté pour continuer.",
  }),
  // Honeypot field: real users never fill this in; bots typically do.
  website: z.string().max(0).optional().or(z.literal("")),
};

export const contactFormSchema = z.object({
  ...baseFields,
  message: z.string().trim().min(10, "Votre message doit contenir au moins 10 caractères."),
});

export const demoFormSchema = z.object({
  ...baseFields,
  message: z.string().trim().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type DemoFormValues = z.infer<typeof demoFormSchema>;
