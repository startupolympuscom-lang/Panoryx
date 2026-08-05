import { z } from "zod";

export const createStationSchema = z.object({
  name: z.string().trim().min(2, "Nom requis."),
  city: z.string().trim().min(2, "Ville requise."),
  address: z.string().trim().optional().or(z.literal("")),
});

export const createTankSchema = z.object({
  stationId: z.string().uuid(),
  label: z.string().trim().min(1, "Libellé requis."),
  fuelType: z.enum(["gasoil", "sp95", "sp98"]),
  capacityLiters: z.coerce.number().positive("Capacité invalide."),
  currentVolumeLiters: z.coerce.number().min(0, "Volume invalide."),
  lowLevelThresholdLiters: z.coerce.number().min(0, "Seuil invalide."),
});

export const createPumpSchema = z.object({
  stationId: z.string().uuid(),
  label: z.string().trim().min(1, "Libellé requis."),
});

export const createNozzleSchema = z.object({
  pumpId: z.string().uuid(),
  stationId: z.string().uuid(),
  tankId: z.string().uuid(),
  label: z.string().trim().min(1, "Libellé requis."),
  fuelType: z.enum(["gasoil", "sp95", "sp98"]),
  lastIndexLiters: z.coerce.number().min(0, "Index invalide."),
});

export const openShiftSchema = z.object({
  stationId: z.string().uuid(),
  notes: z.string().trim().optional().or(z.literal("")),
  readings: z
    .array(
      z.object({
        nozzleId: z.string().uuid(),
        openingIndex: z.coerce.number().min(0, "Index invalide."),
      })
    )
    .min(1, "Au moins un relevé de buse est requis."),
});

export const closeShiftSchema = z.object({
  shiftId: z.string().uuid(),
  readings: z
    .array(
      z.object({
        readingId: z.string().uuid(),
        closingIndex: z.coerce.number().min(0, "Index invalide."),
      })
    )
    .min(1, "Au moins un relevé de buse est requis."),
});

export const recordFuelSaleSchema = z.object({
  stationId: z.string().uuid(),
  shiftId: z.string().uuid(),
  nozzleId: z.string().uuid().optional(),
  fuelType: z.enum(["gasoil", "sp95", "sp98"]),
  liters: z.coerce.number().positive("Volume invalide."),
  unitPrice: z.coerce.number().positive("Prix invalide."),
  paymentMethod: z.enum(["cash", "card", "credit_account", "mobile"]),
});

export const recordDeliverySchema = z.object({
  stationId: z.string().uuid(),
  tankId: z.string().uuid(),
  supplierId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  orderedQuantity: z.coerce.number().positive("Quantité commandée invalide.").optional(),
  liters: z.coerce.number().positive("Volume invalide."),
  unitCost: z.coerce.number().positive("Coût invalide.").optional(),
  deliveryNoteRef: z.string().trim().optional().or(z.literal("")),
});

export const recordTankMeasurementSchema = z.object({
  tankId: z.string().uuid(),
  currentVolumeLiters: z.coerce.number().min(0, "Volume invalide."),
});

export const recordCashReconciliationSchema = z.object({
  shiftId: z.string().uuid(),
  stationId: z.string().uuid(),
  expectedAmount: z.coerce.number().min(0, "Montant invalide."),
  countedAmount: z.coerce.number().min(0, "Montant invalide."),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const addSupplierSchema = z.object({
  name: z.string().trim().min(2, "Nom requis."),
  contactName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("E-mail invalide.").optional().or(z.literal("")),
});

export const createMaintenanceTicketSchema = z.object({
  stationId: z.string().uuid(),
  title: z.string().trim().min(2, "Titre requis."),
  description: z.string().trim().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

export const updateMaintenanceTicketSchema = z.object({
  ticketId: z.string().uuid(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
});

export const addEmployeeSchema = z.object({
  stationId: z.string().uuid().optional(),
  fullName: z.string().trim().min(2, "Nom requis."),
  roleTitle: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  salary: z.coerce.number().min(0, "Salaire invalide.").optional(),
  hiredAt: z.string().trim().optional().or(z.literal("")),
});

export const addShopProductSchema = z
  .object({
    stationId: z.string().uuid(),
    name: z.string().trim().min(1, "Nom du produit requis."),
    costPrice: z.coerce.number().min(0, "Prix d'achat invalide."),
    retailPrice: z.coerce.number().positive("Prix de vente invalide."),
    stockQuantity: z.coerce.number().min(0, "Quantité invalide.").optional(),
  })
  .refine((d) => d.retailPrice > d.costPrice, {
    message: "Le prix de vente doit être supérieur au prix d'achat.",
    path: ["retailPrice"],
  });

export const recordShopSaleSchema = z.object({
  stationId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.coerce.number().positive("Quantité invalide."),
  soldAt: z.string().trim().optional().or(z.literal("")),
});

// --- Caisse des crédits clients (module 8) ---

export const addCreditCustomerSchema = z.object({
  stationId: z.string().uuid(),
  name: z.string().trim().min(2, "Nom requis."),
  phone: z.string().trim().optional().or(z.literal("")),
  creditLimit: z.coerce.number().min(0, "Plafond invalide.").optional(),
});

export const recordCreditTransactionSchema = z.object({
  customerId: z.string().uuid(),
  stationId: z.string().uuid(),
  type: z.enum(["charge", "advance"]),
  amount: z.coerce.number().positive("Montant invalide."),
  note: z.string().trim().optional().or(z.literal("")),
});

// --- Rapprochement bancaire (modules 9 et 10.1) ---

export const recordBankDepositSchema = z.object({
  stationId: z.string().uuid(),
  depositorName: z.string().trim().min(2, "Nom requis."),
  amount: z.coerce.number().positive("Montant invalide."),
  depositDate: z.string().trim().optional().or(z.literal("")),
});

export const recordBankMessageSchema = z.object({
  stationId: z.string().uuid(),
  messageType: z.enum(["debit", "credit", "info"]),
  amount: z.coerce.number().positive("Montant invalide.").optional(),
  rawText: z.string().trim().min(1, "Texte du message requis."),
});

export const matchBankDepositSchema = z.object({
  depositId: z.string().uuid(),
  messageId: z.string().uuid(),
});

// --- Point de vente Café / Restaurant (module 14) ---

export const addCafeProductSchema = z.object({
  stationId: z.string().uuid(),
  name: z.string().trim().min(1, "Nom requis."),
  category: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().positive("Prix invalide."),
});

export const addCafeIngredientSchema = z.object({
  stationId: z.string().uuid(),
  name: z.string().trim().min(1, "Nom requis."),
  unit: z.string().trim().min(1, "Unité requise."),
  stockQuantity: z.coerce.number().min(0, "Quantité invalide.").optional(),
  costPerUnit: z.coerce.number().min(0, "Coût invalide.").optional(),
  lowStockThreshold: z.coerce.number().min(0, "Seuil invalide.").optional(),
});

export const setCafeRecipeSchema = z.object({
  productId: z.string().uuid(),
  items: z.array(
    z.object({
      ingredientId: z.string().uuid(),
      quantityRequired: z.coerce.number().positive("Quantité invalide."),
    })
  ),
});

export const recordCafeOrderSchema = z.object({
  stationId: z.string().uuid(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().positive("Quantité invalide."),
      })
    )
    .min(1, "Ajoutez au moins un article à la commande."),
});

export const recordCafeStockCountSchema = z.object({
  ingredientId: z.string().uuid(),
  stationId: z.string().uuid(),
  countedQuantity: z.coerce.number().min(0, "Quantité invalide."),
});

// --- Salaires et Bons employés (module 17) ---

export const recordEmployeeAdvanceSchema = z.object({
  employeeId: z.string().uuid(),
  amount: z.coerce.number().positive("Montant invalide."),
  note: z.string().trim().optional().or(z.literal("")),
});

export const recordEmployeeFuelVoucherSchema = z.object({
  employeeId: z.string().uuid(),
  stationId: z.string().uuid(),
  amount: z.coerce.number().positive("Montant invalide."),
  productDescription: z.string().trim().min(1, "Description requise."),
  beneficiaryName: z.string().trim().optional().or(z.literal("")),
});

export const markFuelVoucherReimbursedSchema = z.object({
  voucherId: z.string().uuid(),
});

// --- La Jauge : certificats de cuves et facture manquante (module 18) ---

export const recordTankGaugeCertificateSchema = z.object({
  tankId: z.string().uuid(),
  stationId: z.string().uuid(),
  measuredQuantity: z.coerce.number().min(0, "Quantité invalide."),
});

export const recordDeliveryShortfallSchema = z.object({
  deliveryId: z.string().uuid(),
  stationId: z.string().uuid(),
  missingQuantity: z.coerce.number().positive("Quantité manquante invalide."),
  driverName: z.string().trim().min(2, "Nom du chauffeur requis."),
  signatureNote: z.string().trim().optional().or(z.literal("")),
});

export const markDeliveryInvoiceReceivedSchema = z.object({
  deliveryId: z.string().uuid(),
  invoiceReference: z.string().trim().optional().or(z.literal("")),
});

// --- Gestion des livreurs (module 19) ---

export const addDeliveryDriverSchema = z.object({
  fullName: z.string().trim().min(2, "Nom requis."),
  supplierId: z.string().uuid().optional(),
  phone: z.string().trim().optional().or(z.literal("")),
});

// --- Gestion documentaire des factures (module 6) ---

export const documentCategorySchema = z.enum([
  "invoice",
  "bon_signature",
  "lubricant_photo",
  "delivery_signature",
  "other",
]);

// --- Bons Société et Vignettes (module 7) ---

export const addVoucherCompanySchema = z.object({
  stationId: z.string().uuid(),
  name: z.string().trim().min(2, "Nom requis."),
  phone: z.string().trim().optional().or(z.literal("")),
});

export const issueCompanyVoucherSchema = z.object({
  companyId: z.string().uuid(),
  stationId: z.string().uuid(),
  amount: z.coerce.number().positive("Montant invalide."),
  productDescription: z.string().trim().min(1, "Description requise."),
});

export const markCompanyVoucherPaidSchema = z.object({
  voucherId: z.string().uuid(),
  paymentMethod: z.enum(["cash", "check", "transfer"]),
});

export const recordVignetteUsageSchema = z.object({
  companyId: z.string().uuid(),
  stationId: z.string().uuid(),
  vignetteType: z.enum(["fuel", "cafe_boutique"]),
  amount: z.coerce.number().positive("Montant invalide."),
  productDescription: z.string().trim().optional().or(z.literal("")),
});

// --- Chèques clients et société (modules 11 et 12) ---

export const recordCustomerCheckSchema = z.object({
  customerId: z.string().uuid(),
  stationId: z.string().uuid(),
  amount: z.coerce.number().positive("Montant invalide."),
  checkNumber: z.string().trim().min(1, "Numéro de chèque requis."),
  dueDate: z.string().trim().optional().or(z.literal("")),
});

export const markCustomerCheckStatusSchema = z.object({
  checkId: z.string().uuid(),
  status: z.enum(["cleared", "bounced"]),
});

export const recordCompanyCheckSchema = z.object({
  stationId: z.string().uuid(),
  beneficiary: z.string().trim().min(1, "Bénéficiaire requis."),
  category: z.string().trim().min(1, "Catégorie requise."),
  amount: z.coerce.number().positive("Montant invalide."),
  checkNumber: z.string().trim().min(1, "Numéro de chèque requis."),
  issuedDate: z.string().trim().optional().or(z.literal("")),
});

export const markCompanyCheckClearedSchema = z.object({
  checkId: z.string().uuid(),
});

// --- Stock de lubrifiants avec photo (module 13) ---

export const addLubricantProductSchema = z
  .object({
    stationId: z.string().uuid(),
    name: z.string().trim().min(1, "Nom du produit requis."),
    reference: z.string().trim().optional().or(z.literal("")),
    costPrice: z.coerce.number().min(0, "Prix d'achat invalide."),
    retailPrice: z.coerce.number().positive("Prix de vente invalide."),
    stockQuantity: z.coerce.number().min(0, "Quantité invalide.").optional(),
  })
  .refine((d) => d.retailPrice > d.costPrice, {
    message: "Le prix de vente doit être supérieur au prix d'achat.",
    path: ["retailPrice"],
  });

// --- Droits d'accès aux pourcentages comptables (module 4) ---

export const upsertAccountingSettingSchema = z.object({
  settingKey: z.string().trim().min(1),
  label: z.string().trim().min(1),
  value: z.coerce.number(),
});

// --- Veille des prix mondiaux (module 5) ---

export const setFuelPriceTrendSchema = z.object({
  trend: z.enum(["rising", "falling", "stable"]),
  note: z.string().trim().optional().or(z.literal("")),
});

// --- Planification réseaux sociaux (module 15) ---

export const createSocialPostSchema = z.object({
  stationId: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Titre requis."),
  content: z.string().trim().min(1, "Contenu requis."),
  platform: z.enum(["facebook", "instagram", "autre"]),
  status: z.enum(["draft", "scheduled"]),
  scheduledFor: z.string().trim().optional().or(z.literal("")),
});

export const markSocialPostPublishedSchema = z.object({
  postId: z.string().uuid(),
});

// --- Messagerie interne (module 16) ---

export const createMessageChannelSchema = z.object({
  name: z.string().trim().min(1, "Nom du canal requis."),
});

export const sendChannelMessageSchema = z.object({
  channelId: z.string().uuid(),
  body: z.string().trim().min(1, "Message vide."),
});
