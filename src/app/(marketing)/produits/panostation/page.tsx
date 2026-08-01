import type { Metadata } from "next";
import Link from "next/link";
import {
  Fuel,
  Gauge,
  Users,
  Truck,
  Wallet,
  Wrench,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { PanoramicArcs } from "@/components/brand/graphic-devices";
import { formatMAD } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PanoStation — Le logiciel opérationnel pour vos stations-service",
  description:
    "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes de votre réseau de stations-service.",
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PanoStation",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes des réseaux de stations-service.",
  brand: { "@type": "Brand", name: "Panoryx" },
};

const benefits = [
  {
    title: "Fini les registres papier",
    description:
      "Relevés de pompes, quarts et rapprochements de caisse saisis directement sur le terrain, en quelques secondes.",
  },
  {
    title: "Stocks de carburant sous contrôle",
    description:
      "Suivez les niveaux de cuves en continu et recevez des alertes avant la rupture de stock.",
  },
  {
    title: "Comparaison multi-stations",
    description:
      "Visualisez la performance de chaque station de votre réseau sur un même tableau de bord.",
  },
];

const modules = [
  { icon: Fuel, title: "Ventes carburant", description: "Enregistrement des ventes par produit, par pompe et par quart." },
  { icon: Gauge, title: "Pompes & compteurs", description: "Relevés d'index de début et de fin de quart par buse." },
  { icon: Gauge, title: "Cuves & stocks", description: "Mesures de cuves, capacités et seuils d'alerte bas niveau." },
  { icon: Truck, title: "Livraisons", description: "Réception des livraisons de carburant et rapprochement avec les bons de commande." },
  { icon: Wallet, title: "Caisse", description: "Totaux de caisse en fin de quart et calcul automatique des écarts." },
  { icon: Users, title: "Équipe & présence", description: "Employés, quarts assignés et suivi de présence par station." },
  { icon: Truck, title: "Fournisseurs", description: "Répertoire fournisseurs et suivi des commandes d'achat." },
  { icon: Wrench, title: "Maintenance & incidents", description: "Tickets de maintenance et suivi des incidents opérationnels." },
  { icon: AlertTriangle, title: "Alertes", description: "Centre d'alertes pour les stocks bas, écarts de caisse et incidents ouverts." },
  { icon: BarChart3, title: "Rapports & analyses", description: "Tendances de ventes, mix carburant et comparatifs entre stations." },
];

const roles = [
  { role: "Propriétaire d'organisation", access: "Accès complet à toutes les stations et paramètres." },
  { role: "Responsable réseau", access: "Vue et pilotage sur l'ensemble des stations du réseau." },
  { role: "Responsable de station", access: "Gestion complète d'une ou plusieurs stations assignées." },
  { role: "Comptable", access: "Accès aux données de caisse, dépenses et rapports financiers." },
  { role: "Opérateur de station", access: "Saisie des ventes, relevés et opérations du quart en cours." },
  { role: "Lecteur", access: "Consultation seule des tableaux de bord et rapports." },
];

const workflow = [
  "Ouverture du quart et relevé des index de début",
  "Saisie des ventes carburant tout au long du quart",
  "Réception et enregistrement des livraisons si nécessaire",
  "Relevé des index de fin et calcul du volume vendu",
  "Comptage de caisse et rapprochement avec les ventes",
  "Clôture du quart et transmission au responsable",
];

export default function PanoStationPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <section className="relative overflow-hidden bg-navy py-20 sm:py-28">
        <PanoramicArcs
          strokeWidth={5}
          className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] opacity-50"
        />
        <Container className="relative">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-signal-cyan">
            Panoryx · Produit pour réseaux de stations-service
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pilotez chaque station. Maîtrisez chaque opération.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
            PanoStation centralise les ventes, les stocks de carburant, les équipes, les
            fournisseurs et les opérations quotidiennes de votre réseau de stations-service.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact?type=demo" size="lg">
              Demander une démo
            </Button>
            <Button
              href="/app/panostation"
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:border-signal-cyan hover:text-signal-cyan"
            >
              Accéder à PanoStation
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Bénéfices opérationnels"
            title="Une gestion de station enfin centralisée."
          />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-lg border border-navy-100 bg-white p-6">
                <h3 className="text-base font-semibold text-navy">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{b.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Modules fonctionnels" title="Tout ce qu'il faut pour piloter une station au quotidien." />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div key={m.title} className="flex gap-4 rounded-lg border border-navy-100 bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-panoryx-blue/10 text-panoryx-blue">
                  <m.icon size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy">{m.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-navy-500">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Aperçu du tableau de bord"
                title="Une visibilité en temps réel sur l'ensemble du réseau."
                description="Ventes, marge, écarts de caisse et niveaux de cuves : les indicateurs essentiels sont toujours à portée de vue, par station ou consolidés sur le réseau."
              />
              <ul className="mt-8 space-y-3">
                {["Ventes et volumes en temps réel", "Comparatif de performance multi-stations", "Centre d'alertes actionnable"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-navy-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-panoryx-blue" aria-hidden="true" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <DashboardPreview />
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy-50/50 py-20 sm:py-28">
        <Container>
          <SectionHeading eyebrow="Journée type" title="Le flux de travail d'un quart de station." />
          <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {workflow.map((step, i) => (
              <li key={step} className="rounded-lg border border-navy-100 bg-white p-5">
                <span className="brand-gradient-text text-xl font-extrabold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 text-sm font-medium text-navy-700">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="Multi-sites"
                title="Un réseau, une gouvernance."
                description="Ajoutez autant de stations que nécessaire. Chaque station conserve ses propres cuves, pompes, équipes et quarts, tout en remontant vers une vue consolidée au niveau du réseau."
              />
            </div>
            <div>
              <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-navy">
                <ShieldCheck size={18} className="text-panoryx-blue" aria-hidden="true" />
                Accès basé sur les rôles
              </div>
              <div className="overflow-hidden rounded-lg border border-navy-100">
                <table className="w-full text-left text-sm">
                  <tbody>
                    {roles.map((r, i) => (
                      <tr key={r.role} className={i % 2 === 0 ? "bg-white" : "bg-navy-50/50"}>
                        <td className="px-4 py-3 font-medium text-navy">{r.role}</td>
                        <td className="px-4 py-3 text-navy-500">{r.access}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-navy-100 bg-navy py-20 sm:py-28">
        <Container className="text-center">
          <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prêt à piloter votre réseau de stations ?
          </h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact?type=demo" size="lg">
              Demander une démo
            </Button>
            <Link
              href="/app/panostation"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-cyan hover:underline"
            >
              Accéder à PanoStation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

function DashboardPreview() {
  const stations = [
    { name: "Casablanca Centre", sales: 412800, margin: "8,4 %" },
    { name: "Rabat Agdal", sales: 298150, margin: "7,9 %" },
    { name: "Marrakech Guéliz", sales: 356900, margin: "8,1 %" },
    { name: "Tanger Centre", sales: 231400, margin: "7,6 %" },
  ];

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between border-b border-navy-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-navy-500">
            Ventes du jour — réseau
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">{formatMAD(1299250)}</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          +4,2 % vs hier
        </span>
      </div>
      <ul className="mt-4 divide-y divide-navy-100">
        {stations.map((s) => (
          <li key={s.name} className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-navy">{s.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-navy-500">{formatMAD(s.sales)}</span>
              <span className="w-14 text-right text-sm font-semibold text-panoryx-blue">
                {s.margin}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
