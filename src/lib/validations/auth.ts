import { z } from "zod";

const emailField = z
  .string()
  .trim()
  .min(1, "Veuillez indiquer votre adresse e-mail.")
  .email("Adresse e-mail invalide.");

const passwordField = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre.")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre.");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Veuillez indiquer votre mot de passe."),
});

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Veuillez indiquer votre nom complet."),
    companyName: z.string().trim().min(2, "Veuillez indiquer le nom de votre entreprise."),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
    consent: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les conditions d'utilisation pour continuer.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const organizationSchema = z.object({
  organizationName: z.string().trim().min(2, "Veuillez indiquer le nom de votre organisation."),
});
