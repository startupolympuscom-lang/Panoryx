/**
 * Panoryx is French-first. This dictionary centralizes shared chrome strings
 * (navigation, footer, auth, common actions) so an `en` dictionary can be
 * added later without touching component code — components should read
 * strings from `useDictionary()` / `getDictionary()` rather than hardcoding
 * them. Long-form marketing page copy stays inline in French in the page
 * files, since translating full pages is a content task, not a routing one;
 * when English is introduced, add `src/app/[locale]/...` routes that read
 * `getDictionary("en")` the same way.
 */

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const dictionaries = {
  fr: {
    nav: {
      home: "Accueil",
      products: "Produits",
      whyPanoryx: "Pourquoi Panoryx",
      about: "À propos",
      contact: "Contact",
      login: "Connexion",
      requestDemo: "Demander une démo",
      openApp: "Accéder à l'application",
    },
    footer: {
      tagline: "Le système d'exploitation des entreprises modernes.",
      product: "Produit",
      company: "Entreprise",
      legal: "Légal",
      products: "Produits",
      panostation: "PanoStation",
      about: "À propos",
      contact: "Contact",
      login: "Connexion",
      signup: "Créer un compte",
      privacy: "Confidentialité",
      terms: "Conditions d'utilisation",
      legalNotice: "Mentions légales",
      rights: "Tous droits réservés.",
    },
    common: {
      requestDemo: "Demander une démo",
      discoverPanostation: "Découvrir PanoStation",
      learnMore: "En savoir plus",
      accessPanostation: "Accéder à PanoStation",
      comingSoon: "Bientôt disponible",
      loading: "Chargement…",
      save: "Enregistrer",
      cancel: "Annuler",
      back: "Retour",
      continue: "Continuer",
    },
    auth: {
      email: "Adresse e-mail",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      fullName: "Nom complet",
      companyName: "Nom de l'entreprise",
      login: "Se connecter",
      signup: "Créer mon compte",
      forgotPassword: "Mot de passe oublié ?",
      resetPassword: "Réinitialiser le mot de passe",
      noAccount: "Pas encore de compte ?",
      hasAccount: "Vous avez déjà un compte ?",
      createAccount: "Créer un compte",
      logout: "Déconnexion",
    },
  },
  en: {
    nav: {
      home: "Home",
      products: "Products",
      whyPanoryx: "Why Panoryx",
      about: "About",
      contact: "Contact",
      login: "Log in",
      requestDemo: "Request a demo",
      openApp: "Open app",
    },
    footer: {
      tagline: "The operating system for modern businesses.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      products: "Products",
      panostation: "PanoStation",
      about: "About",
      contact: "Contact",
      login: "Log in",
      signup: "Create an account",
      privacy: "Privacy",
      terms: "Terms of use",
      legalNotice: "Legal notice",
      rights: "All rights reserved.",
    },
    common: {
      requestDemo: "Request a demo",
      discoverPanostation: "Discover PanoStation",
      learnMore: "Learn more",
      accessPanostation: "Access PanoStation",
      comingSoon: "Coming soon",
      loading: "Loading…",
      save: "Save",
      cancel: "Cancel",
      back: "Back",
      continue: "Continue",
    },
    auth: {
      email: "Email address",
      password: "Password",
      confirmPassword: "Confirm password",
      fullName: "Full name",
      companyName: "Company name",
      login: "Log in",
      signup: "Create my account",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset password",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createAccount: "Create an account",
      logout: "Log out",
    },
  },
} as const satisfies Record<Locale, unknown>;

export function getDictionary(locale: Locale = defaultLocale) {
  return dictionaries[locale];
}
