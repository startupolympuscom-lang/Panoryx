import { getCurrentUser } from "@/lib/auth/session";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { MobileNav } from "@/components/marketing/mobile-nav";
import { NavLinks } from "@/components/marketing/nav-links";
import { HeaderFrame } from "@/components/marketing/header-frame";

export async function MarketingHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderFrame>
      <Container className="flex h-16 items-center justify-between sm:h-18">
        <LogoLink height={28} />

        <NavLinks />

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
    </HeaderFrame>
  );
}
