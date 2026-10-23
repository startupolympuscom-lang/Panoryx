/**
 * Trilingual copy for the /produits/panostation marketing landing page.
 *
 * This is scoped to that one page — it does not localize the rest of the
 * marketing site (header, footer, other pages stay French) — so it lives
 * next to the page rather than inside the site-wide `dictionaries.ts`.
 * Darija ("ary") is the default; French and English are selectable.
 */

export type PanostationLocale = "ary" | "fr" | "en";

export const panostationLocales: {
  code: PanostationLocale;
  label: string;
  dir: "rtl" | "ltr";
}[] = [
  { code: "ary", label: "الدارجة", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
];

export const defaultPanostationLocale: PanostationLocale = "ary";

interface PanostationCopy {
  metaDescription: string;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaDemo: string;
    ctaAccess: string;
  };
  benefits: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
  };
  modules: {
    eyebrow: string;
    title: string;
    items: { title: string; description: string }[];
  };
  dashboardSection: {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
  };
  dashboardPreview: {
    label: string;
    change: string;
  };
  workflow: {
    eyebrow: string;
    title: string;
    steps: string[];
  };
  roles: {
    eyebrow: string;
    title: string;
    description: string;
    accessBasedOnRoles: string;
    items: { role: string; access: string }[];
  };
  finalCta: {
    title: string;
    ctaDemo: string;
    ctaAccess: string;
  };
}

export const panostationCopy: Record<PanostationLocale, PanostationCopy> = {
  ary: {
    metaDescription:
      "PanoStation كيجمع ليك البيع، الستوك ديال البنزين، الإكيپ، الموردين، والخدمة ديال كل نهار فشبكة محطات البنزين ديالك.",
    hero: {
      eyebrow: "Panoryx · منتج لشبكات محطات البنزين",
      title: "قَوَّد كل محطة. تحكّم فكل عملية.",
      subtitle:
        "PanoStation كيجمع ليك البيع، الستوك ديال البنزين، الإكيپ، الموردين، والخدمة ديال كل نهار فشبكة محطات البنزين ديالك، فبلاصة واحدة.",
      ctaDemo: "طلب ديمو",
      ctaAccess: "ادخل لـ PanoStation",
    },
    benefits: {
      eyebrow: "الفوائد العملية",
      title: "تسيير المحطة، أخيرا، فبلاصة وحدة.",
      items: [
        {
          title: "سالا للكراريس الورقية",
          description:
            "الريليفي ديال البومبات، الكيات، والحسبة ديال الكاسة كتدخلهم مباشرة من فوق الأرض، فشي ثواني.",
        },
        {
          title: "الستوك ديال البنزين تحت المراقبة",
          description: "تبع مستوى الكوفا بلا توقف وجيك إشعار قبل ما تنقص المادة.",
        },
        {
          title: "مقارنة بين عدة محطات",
          description: "شوف الأداء ديال كل محطة فالشبكة ديالك فتابلو واحد.",
        },
      ],
    },
    modules: {
      eyebrow: "الموديولات الوظيفية",
      title: "كلشي اللي خاصك باش تسيّر محطة كل نهار.",
      items: [
        { title: "بيع البنزين", description: "تسجيل البيع حسب المنتوج، البومبة، والكيط." },
        { title: "البومبات والعدادات", description: "ريليفي البداية والنهاية ديال الكيط لكل بوز." },
        { title: "الكوفا والستوك", description: "قياسات الكوفا، السّعة، وحدود الإشعار ديال النقص." },
        { title: "التوصيلات", description: "استقبال توصيلات البنزين ومقارنتها مع بونات الطلب." },
        { title: "الكاسة", description: "مجموع الكاسة فآخر الكيط وحساب الفرق أوطوماتيكيا." },
        { title: "الإكيپ والحضور", description: "الموظفين، الكيات المخصصة، وتتبع الحضور فكل محطة." },
        { title: "الموردين", description: "دليل الموردين وتتبع بونات الطلب." },
        { title: "الصيانة والحوادث", description: "تيكيات الصيانة وتتبع الحوادث العملية." },
        {
          title: "الإشعارات",
          description: "مركز الإشعارات ديال النقص فالستوك، فرق الكاسة، والحوادث المفتوحة.",
        },
        { title: "التقارير والتحليلات", description: "اتجاهات البيع، مزيج البنزين، ومقارنة بين المحطات." },
      ],
    },
    dashboardSection: {
      eyebrow: "نظرة على التابلو دو بورد",
      title: "رؤية فالوقت الحقيقي على مجموع الشبكة.",
      description:
        "البيع، المارج، فرق الكاسة، ومستوى الكوفا: المؤشرات المهمة ديما قدام عينيك، حسب كل محطة أو مجمعة على الشبكة.",
      bullets: [
        "البيع والحجم فالوقت الحقيقي",
        "مقارنة الأداء بين عدة محطات",
        "مركز إشعارات قابل للتصرف فيه",
      ],
    },
    dashboardPreview: {
      label: "بيع اليوم — الشبكة",
      change: "+4.2% مقارنة مع البارح",
    },
    workflow: {
      eyebrow: "نهار عادي",
      title: "مسار الخدمة ديال كيط فمحطة.",
      steps: [
        "فتح الكيط وريليفي البداية",
        "تسجيل بيع البنزين طول الكيط",
        "استقبال وتسجيل التوصيلات إلا كان لازم",
        "ريليفي النهاية وحساب الحجم اللي تباع",
        "حساب الكاسة ومقارنتها مع البيع",
        "سد الكيط وإرسال التقرير للمسؤول",
      ],
    },
    roles: {
      eyebrow: "متعدد المواقع",
      title: "شبكة وحدة، تسيير وحدة.",
      description:
        "زيد قد ما بغيتي من محطات. كل محطة كتحتفظ بالكوفا، البومبات، الإكيپ، والكيات ديالها، وفنفس الوقت كتطلع لرؤية مجمعة على مستوى الشبكة.",
      accessBasedOnRoles: "الولوج حسب الدور",
      items: [
        { role: "مالك المنظمة", access: "ولوج كامل لجميع المحطات والإعدادات." },
        { role: "مسؤول الشبكة", access: "رؤية وتسيير على مجموع محطات الشبكة." },
        { role: "مسؤول المحطة", access: "تسيير كامل لمحطة واحدة أو عدة محطات مخصصة ليه." },
        { role: "المحاسب", access: "ولوج لمعطيات الكاسة، المصاريف، والتقارير المالية." },
        { role: "عامل المحطة", access: "تسجيل البيع، الريليفي، والعمليات ديال الكيط الجاري." },
        { role: "مشاهد فقط", access: "الاطلاع فقط على التابلوهات والتقارير." },
      ],
    },
    finalCta: {
      title: "واجد باش تسيّر شبكة المحطات ديالك؟",
      ctaDemo: "طلب ديمو",
      ctaAccess: "ادخل لـ PanoStation",
    },
  },
  fr: {
    metaDescription:
      "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes de votre réseau de stations-service.",
    hero: {
      eyebrow: "Panoryx · Produit pour réseaux de stations-service",
      title: "Pilotez chaque station. Maîtrisez chaque opération.",
      subtitle:
        "PanoStation centralise les ventes, les stocks de carburant, les équipes, les fournisseurs et les opérations quotidiennes de votre réseau de stations-service.",
      ctaDemo: "Demander une démo",
      ctaAccess: "Accéder à PanoStation",
    },
    benefits: {
      eyebrow: "Bénéfices opérationnels",
      title: "Une gestion de station enfin centralisée.",
      items: [
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
      ],
    },
    modules: {
      eyebrow: "Modules fonctionnels",
      title: "Tout ce qu'il faut pour piloter une station au quotidien.",
      items: [
        { title: "Ventes carburant", description: "Enregistrement des ventes par produit, par pompe et par quart." },
        { title: "Pompes & compteurs", description: "Relevés d'index de début et de fin de quart par buse." },
        { title: "Cuves & stocks", description: "Mesures de cuves, capacités et seuils d'alerte bas niveau." },
        {
          title: "Livraisons",
          description: "Réception des livraisons de carburant et rapprochement avec les bons de commande.",
        },
        { title: "Caisse", description: "Totaux de caisse en fin de quart et calcul automatique des écarts." },
        {
          title: "Équipe & présence",
          description: "Employés, quarts assignés et suivi de présence par station.",
        },
        { title: "Fournisseurs", description: "Répertoire fournisseurs et suivi des commandes d'achat." },
        {
          title: "Maintenance & incidents",
          description: "Tickets de maintenance et suivi des incidents opérationnels.",
        },
        {
          title: "Alertes",
          description: "Centre d'alertes pour les stocks bas, écarts de caisse et incidents ouverts.",
        },
        {
          title: "Rapports & analyses",
          description: "Tendances de ventes, mix carburant et comparatifs entre stations.",
        },
      ],
    },
    dashboardSection: {
      eyebrow: "Aperçu du tableau de bord",
      title: "Une visibilité en temps réel sur l'ensemble du réseau.",
      description:
        "Ventes, marge, écarts de caisse et niveaux de cuves : les indicateurs essentiels sont toujours à portée de vue, par station ou consolidés sur le réseau.",
      bullets: [
        "Ventes et volumes en temps réel",
        "Comparatif de performance multi-stations",
        "Centre d'alertes actionnable",
      ],
    },
    dashboardPreview: {
      label: "Ventes du jour — réseau",
      change: "+4,2 % vs hier",
    },
    workflow: {
      eyebrow: "Journée type",
      title: "Le flux de travail d'un quart de station.",
      steps: [
        "Ouverture du quart et relevé des index de début",
        "Saisie des ventes carburant tout au long du quart",
        "Réception et enregistrement des livraisons si nécessaire",
        "Relevé des index de fin et calcul du volume vendu",
        "Comptage de caisse et rapprochement avec les ventes",
        "Clôture du quart et transmission au responsable",
      ],
    },
    roles: {
      eyebrow: "Multi-sites",
      title: "Un réseau, une gouvernance.",
      description:
        "Ajoutez autant de stations que nécessaire. Chaque station conserve ses propres cuves, pompes, équipes et quarts, tout en remontant vers une vue consolidée au niveau du réseau.",
      accessBasedOnRoles: "Accès basé sur les rôles",
      items: [
        { role: "Propriétaire d'organisation", access: "Accès complet à toutes les stations et paramètres." },
        { role: "Responsable réseau", access: "Vue et pilotage sur l'ensemble des stations du réseau." },
        { role: "Responsable de station", access: "Gestion complète d'une ou plusieurs stations assignées." },
        { role: "Comptable", access: "Accès aux données de caisse, dépenses et rapports financiers." },
        { role: "Opérateur de station", access: "Saisie des ventes, relevés et opérations du quart en cours." },
        { role: "Lecteur", access: "Consultation seule des tableaux de bord et rapports." },
      ],
    },
    finalCta: {
      title: "Prêt à piloter votre réseau de stations ?",
      ctaDemo: "Demander une démo",
      ctaAccess: "Accéder à PanoStation",
    },
  },
  en: {
    metaDescription:
      "PanoStation centralizes sales, fuel inventory, teams, suppliers, and the daily operations of your fuel station network.",
    hero: {
      eyebrow: "Panoryx · Product for fuel station networks",
      title: "Run every station. Control every operation.",
      subtitle:
        "PanoStation centralizes sales, fuel inventory, teams, suppliers, and the daily operations of your fuel station network.",
      ctaDemo: "Request a demo",
      ctaAccess: "Access PanoStation",
    },
    benefits: {
      eyebrow: "Operational benefits",
      title: "Station management, finally centralized.",
      items: [
        {
          title: "No more paper logs",
          description:
            "Pump readings, shifts, and cash reconciliations entered directly in the field, in seconds.",
        },
        {
          title: "Fuel stock under control",
          description: "Track tank levels continuously and get alerted before you run out.",
        },
        {
          title: "Multi-station comparison",
          description: "View the performance of every station in your network on a single dashboard.",
        },
      ],
    },
    modules: {
      eyebrow: "Functional modules",
      title: "Everything you need to run a station day to day.",
      items: [
        { title: "Fuel sales", description: "Sales recorded by product, by pump, and by shift." },
        { title: "Pumps & meters", description: "Start and end-of-shift index readings by nozzle." },
        { title: "Tanks & stock", description: "Tank measurements, capacities, and low-level alert thresholds." },
        {
          title: "Deliveries",
          description: "Fuel delivery receiving and reconciliation against purchase orders.",
        },
        { title: "Cash", description: "End-of-shift cash totals with automatic variance calculation." },
        {
          title: "Team & attendance",
          description: "Employees, assigned shifts, and attendance tracking per station.",
        },
        { title: "Suppliers", description: "Supplier directory and purchase order tracking." },
        {
          title: "Maintenance & incidents",
          description: "Maintenance tickets and operational incident tracking.",
        },
        {
          title: "Alerts",
          description: "Alert center for low stock, cash variances, and open incidents.",
        },
        {
          title: "Reports & analytics",
          description: "Sales trends, fuel mix, and station comparisons.",
        },
      ],
    },
    dashboardSection: {
      eyebrow: "Dashboard preview",
      title: "Real-time visibility across your network.",
      description:
        "Sales, margin, cash variances, and tank levels: the essential indicators are always within view, per station or consolidated across the network.",
      bullets: [
        "Real-time sales and volumes",
        "Multi-station performance comparison",
        "Actionable alert center",
      ],
    },
    dashboardPreview: {
      label: "Today's sales — network",
      change: "+4.2% vs yesterday",
    },
    workflow: {
      eyebrow: "A typical day",
      title: "A station shift's workflow.",
      steps: [
        "Opening the shift and reading starting indexes",
        "Recording fuel sales throughout the shift",
        "Receiving and logging deliveries when needed",
        "Reading ending indexes and calculating volume sold",
        "Cash count and reconciliation against sales",
        "Closing the shift and reporting to the manager",
      ],
    },
    roles: {
      eyebrow: "Multi-site",
      title: "One network, one governance.",
      description:
        "Add as many stations as you need. Each station keeps its own tanks, pumps, teams, and shifts, while rolling up into a consolidated network-wide view.",
      accessBasedOnRoles: "Role-based access",
      items: [
        { role: "Organization owner", access: "Full access to all stations and settings." },
        { role: "Network manager", access: "View and manage the entire network of stations." },
        { role: "Station manager", access: "Full management of one or more assigned stations." },
        { role: "Accountant", access: "Access to cash, expense, and financial report data." },
        { role: "Station operator", access: "Enters sales, readings, and operations for the current shift." },
        { role: "Viewer", access: "Read-only access to dashboards and reports." },
      ],
    },
    finalCta: {
      title: "Ready to run your station network?",
      ctaDemo: "Request a demo",
      ctaAccess: "Access PanoStation",
    },
  },
};
