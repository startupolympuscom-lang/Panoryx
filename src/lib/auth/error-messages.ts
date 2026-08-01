/**
 * Supabase Auth returns English error messages/codes. This maps the ones
 * users are likely to hit to friendly French copy; anything unrecognized
 * falls back to a generic message rather than leaking raw provider text.
 */
export function translateAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("invalid login credentials")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Veuillez confirmer votre adresse e-mail avant de vous connecter. Vérifiez votre boîte de réception.";
  }
  if (m.includes("user already registered") || m.includes("already registered")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }
  if (m.includes("password should be at least")) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (m.includes("rate limit")) {
    return "Trop de tentatives. Veuillez réessayer dans quelques instants.";
  }
  if (m.includes("same password")) {
    return "Le nouveau mot de passe doit être différent de l'ancien.";
  }

  return "Une erreur est survenue. Veuillez réessayer.";
}
