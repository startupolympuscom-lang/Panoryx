"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  createStationSchema,
  createTankSchema,
  createPumpSchema,
  createNozzleSchema,
  openShiftSchema,
  closeShiftSchema,
  recordFuelSaleSchema,
  recordDeliverySchema,
  recordTankMeasurementSchema,
  recordCashReconciliationSchema,
  addSupplierSchema,
  createMaintenanceTicketSchema,
  updateMaintenanceTicketSchema,
  addEmployeeSchema,
  addShopProductSchema,
  recordShopSaleSchema,
} from "@/lib/validations/panostation";
import type { z } from "zod";

export interface ActionResult {
  error?: string;
}

function firstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Données invalides.";
}

export async function createStation(
  organizationId: string,
  input: z.infer<typeof createStationSchema>
): Promise<ActionResult> {
  const parsed = createStationSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("stations").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    city: parsed.data.city,
    address: parsed.data.address || null,
  });

  if (error) return { error: "Impossible de créer la station." };
  revalidatePath("/app/panostation/parametres");
  revalidatePath("/app/panostation");
  return {};
}

export async function createTank(input: z.infer<typeof createTankSchema>): Promise<ActionResult> {
  const parsed = createTankSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("tanks").insert({
    station_id: parsed.data.stationId,
    label: parsed.data.label,
    fuel_type: parsed.data.fuelType,
    capacity_liters: parsed.data.capacityLiters,
    current_volume_liters: parsed.data.currentVolumeLiters,
    low_level_threshold_liters: parsed.data.lowLevelThresholdLiters,
  });

  if (error) return { error: "Impossible de créer la cuve." };
  revalidatePath("/app/panostation/cuves");
  revalidatePath("/app/panostation");
  return {};
}

export async function createPump(input: z.infer<typeof createPumpSchema>): Promise<ActionResult> {
  const parsed = createPumpSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("pumps").insert({
    station_id: parsed.data.stationId,
    label: parsed.data.label,
  });

  if (error) return { error: "Impossible de créer la pompe." };
  revalidatePath("/app/panostation/pompes");
  return {};
}

export async function createNozzle(input: z.infer<typeof createNozzleSchema>): Promise<ActionResult> {
  const parsed = createNozzleSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("nozzles").insert({
    pump_id: parsed.data.pumpId,
    station_id: parsed.data.stationId,
    tank_id: parsed.data.tankId,
    label: parsed.data.label,
    fuel_type: parsed.data.fuelType,
    last_index_liters: parsed.data.lastIndexLiters,
  });

  if (error) return { error: "Impossible de créer la buse." };
  revalidatePath("/app/panostation/pompes");
  return {};
}

export async function openShift(
  userId: string,
  input: z.infer<typeof openShiftSchema>
): Promise<ActionResult> {
  const parsed = openShiftSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: shift, error } = await supabase
    .from("shifts")
    .insert({ station_id: parsed.data.stationId, opened_by: userId, notes: parsed.data.notes || null })
    .select("id")
    .single();

  if (error || !shift) {
    return {
      error:
        error?.code === "23505"
          ? "Un quart est déjà ouvert pour cette station."
          : "Impossible d'ouvrir le quart.",
    };
  }

  const { error: readingsError } = await supabase.from("shift_readings").insert(
    parsed.data.readings.map((r) => ({
      shift_id: shift.id,
      nozzle_id: r.nozzleId,
      opening_index: r.openingIndex,
      recorded_by: userId,
    }))
  );

  if (readingsError) return { error: "Quart ouvert, mais l'enregistrement des relevés a échoué." };

  revalidatePath("/app/panostation/quarts");
  revalidatePath("/app/panostation");
  return {};
}

export async function closeShift(
  userId: string,
  input: z.infer<typeof closeShiftSchema>
): Promise<ActionResult> {
  const parsed = closeShiftSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();

  for (const r of parsed.data.readings) {
    const { error: readingError } = await supabase
      .from("shift_readings")
      .update({ closing_index: r.closingIndex })
      .eq("id", r.readingId);
    if (readingError) return { error: "Impossible d'enregistrer les relevés de fin de quart." };
  }

  const { error } = await supabase
    .from("shifts")
    .update({ status: "closed", closed_at: new Date().toISOString(), closed_by: userId })
    .eq("id", parsed.data.shiftId);

  if (error) return { error: "Impossible de clôturer le quart." };

  revalidatePath("/app/panostation/quarts");
  revalidatePath("/app/panostation");
  return {};
}

export async function recordFuelSale(
  userId: string,
  input: z.infer<typeof recordFuelSaleSchema>
): Promise<ActionResult> {
  const parsed = recordFuelSaleSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("fuel_sales").insert({
    station_id: parsed.data.stationId,
    shift_id: parsed.data.shiftId,
    nozzle_id: parsed.data.nozzleId || null,
    fuel_type: parsed.data.fuelType,
    liters: parsed.data.liters,
    unit_price: parsed.data.unitPrice,
    payment_method: parsed.data.paymentMethod,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer la vente." };
  revalidatePath("/app/panostation/ventes");
  revalidatePath("/app/panostation");
  return {};
}

export async function recordDelivery(
  userId: string,
  input: z.infer<typeof recordDeliverySchema>
): Promise<ActionResult> {
  const parsed = recordDeliverySchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("fuel_deliveries").insert({
    station_id: parsed.data.stationId,
    tank_id: parsed.data.tankId,
    supplier_id: parsed.data.supplierId || null,
    liters: parsed.data.liters,
    unit_cost: parsed.data.unitCost ?? null,
    delivery_note_ref: parsed.data.deliveryNoteRef || null,
    received_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer la livraison." };

  const { data: tank } = await supabase
    .from("tanks")
    .select("current_volume_liters")
    .eq("id", parsed.data.tankId)
    .single();

  if (tank) {
    await supabase
      .from("tanks")
      .update({ current_volume_liters: Number(tank.current_volume_liters) + parsed.data.liters })
      .eq("id", parsed.data.tankId);
  }

  revalidatePath("/app/panostation/livraisons");
  revalidatePath("/app/panostation/cuves");
  revalidatePath("/app/panostation");
  return {};
}

export async function recordTankMeasurement(
  input: z.infer<typeof recordTankMeasurementSchema>
): Promise<ActionResult> {
  const parsed = recordTankMeasurementSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("tanks")
    .update({ current_volume_liters: parsed.data.currentVolumeLiters })
    .eq("id", parsed.data.tankId);

  if (error) return { error: "Impossible d'enregistrer la mesure." };
  revalidatePath("/app/panostation/cuves");
  revalidatePath("/app/panostation");
  return {};
}

export async function recordCashReconciliation(
  userId: string,
  input: z.infer<typeof recordCashReconciliationSchema>
): Promise<ActionResult> {
  const parsed = recordCashReconciliationSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("cash_reconciliations").insert({
    shift_id: parsed.data.shiftId,
    station_id: parsed.data.stationId,
    expected_amount: parsed.data.expectedAmount,
    counted_amount: parsed.data.countedAmount,
    notes: parsed.data.notes || null,
    recorded_by: userId,
  });

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "Un rapprochement de caisse existe déjà pour ce quart."
          : "Impossible d'enregistrer le rapprochement de caisse.",
    };
  }

  revalidatePath("/app/panostation/caisse");
  revalidatePath("/app/panostation");
  return {};
}

export async function addSupplier(
  organizationId: string,
  input: z.infer<typeof addSupplierSchema>
): Promise<ActionResult> {
  const parsed = addSupplierSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    contact_name: parsed.data.contactName || null,
    phone: parsed.data.phone || null,
    email: parsed.data.email || null,
  });

  if (error) return { error: "Impossible d'ajouter le fournisseur." };
  revalidatePath("/app/panostation/fournisseurs");
  return {};
}

export async function createMaintenanceTicket(
  organizationId: string,
  userId: string,
  input: z.infer<typeof createMaintenanceTicketSchema>
): Promise<ActionResult> {
  const parsed = createMaintenanceTicketSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("maintenance_tickets").insert({
    organization_id: organizationId,
    station_id: parsed.data.stationId,
    title: parsed.data.title,
    description: parsed.data.description || null,
    priority: parsed.data.priority,
    reported_by: userId,
  });

  if (error) return { error: "Impossible de créer le ticket." };
  revalidatePath("/app/panostation/maintenance");
  revalidatePath("/app/panostation");
  return {};
}

export async function updateMaintenanceTicket(
  input: z.infer<typeof updateMaintenanceTicketSchema>
): Promise<ActionResult> {
  const parsed = updateMaintenanceTicketSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("maintenance_tickets")
    .update({
      status: parsed.data.status,
      resolved_at: ["resolved", "closed"].includes(parsed.data.status)
        ? new Date().toISOString()
        : null,
    })
    .eq("id", parsed.data.ticketId);

  if (error) return { error: "Impossible de mettre à jour le ticket." };
  revalidatePath("/app/panostation/maintenance");
  revalidatePath("/app/panostation");
  return {};
}

export async function addEmployee(
  organizationId: string,
  input: z.infer<typeof addEmployeeSchema>
): Promise<ActionResult> {
  const parsed = addEmployeeSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("employees").insert({
    organization_id: organizationId,
    station_id: parsed.data.stationId || null,
    full_name: parsed.data.fullName,
    role_title: parsed.data.roleTitle || null,
    phone: parsed.data.phone || null,
    salary: parsed.data.salary ?? null,
    hired_at: parsed.data.hiredAt || null,
  });

  if (error) return { error: "Impossible d'ajouter l'employé." };
  revalidatePath("/app/panostation/equipe");
  return {};
}

export async function addShopProduct(
  input: z.infer<typeof addShopProductSchema>
): Promise<ActionResult> {
  const parsed = addShopProductSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("shop_products").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    cost_price: parsed.data.costPrice,
    retail_price: parsed.data.retailPrice,
    stock_quantity: parsed.data.stockQuantity ?? 0,
  });

  if (error) return { error: "Impossible d'ajouter le produit." };
  revalidatePath("/app/panostation/boutique");
  return {};
}

export async function recordShopSale(
  userId: string,
  input: z.infer<typeof recordShopSaleSchema>
): Promise<ActionResult> {
  const parsed = recordShopSaleSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("shop_products")
    .select("cost_price, retail_price, stock_quantity")
    .eq("id", parsed.data.productId)
    .single();

  if (productError || !product) return { error: "Produit introuvable." };

  const { error } = await supabase.from("shop_sales").insert({
    station_id: parsed.data.stationId,
    product_id: parsed.data.productId,
    quantity: parsed.data.quantity,
    unit_cost: product.cost_price,
    unit_price: product.retail_price,
    sold_at: parsed.data.soldAt ? new Date(parsed.data.soldAt).toISOString() : new Date().toISOString(),
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer la vente." };

  await supabase
    .from("shop_products")
    .update({
      stock_quantity: Math.max(0, Number(product.stock_quantity) - parsed.data.quantity),
    })
    .eq("id", parsed.data.productId);

  revalidatePath("/app/panostation/boutique");
  revalidatePath("/app/panostation/rapports");
  return {};
}
