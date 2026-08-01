import Link from "next/link";
import { Container } from "@/components/ui/container";
import { PanoryxLogo } from "@/components/brand/logo";
import { GradientBands } from "@/components/brand/graphic-devices";

const columns = [
  {
    title: "Produits",
    links: [
      { href: "/produits", label: "Tous les produits" },
      { href: "/produits/panostation", label: "PanoStation" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { href: "/a-propos", label: "À propos" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/connexion", label: "Connexion" },
      { href: "/inscription", label: "Créer un compte" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/conditions", label: "Conditions d'utilisation" },
    ],
  },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-navy-100 bg-navy-50/60">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-2">
            <PanoryxLogo height={26} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-500">
              Le système d&apos;exploitation des entreprises modernes. Panoryx réunit vos
              équipes, vos processus et vos données dans une plateforme modulaire.
            </p>
            <GradientBands className="mt-6 h-10 w-32 opacity-80" />
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-navy-700 hover:text-panoryx-blue"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-8 sm:flex-row">
          <p className="text-xs text-navy-500">
            © {year} Panoryx. Tous droits réservés.
          </p>
          <p className="text-xs text-navy-500">Casablanca, Maroc</p>
        </div>
      </Container>
    </footer>
  );
}
