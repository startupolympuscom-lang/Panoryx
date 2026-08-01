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
});
