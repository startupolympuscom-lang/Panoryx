import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { MobileNav } from "@/components/marketing/mobile-nav";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Produits" },
  { href: "/#pourquoi-panoryx", label: "Pourquoi Panoryx" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export async function MarketingHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/85 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between sm:h-18">
        <LogoLink height={28} />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3.5 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-navy-50 hover:text-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button href={user ? "/app" : "/connexion"} variant="ghost" size="sm">
            {user ? "Mon espace" : "Connexion"}
          </Button>
          <Button href="/contact?type=demo" variant="primary" size="sm">
            Demander une démo
          </Button>
        </div>

        <MobileNav isAuthed={Boolean(user)} />
      </Container>
    </header>
  );
}
