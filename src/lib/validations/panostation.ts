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
