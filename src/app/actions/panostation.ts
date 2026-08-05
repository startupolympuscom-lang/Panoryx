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
  addCreditCustomerSchema,
  recordCreditTransactionSchema,
  recordBankDepositSchema,
  recordBankMessageSchema,
  matchBankDepositSchema,
  addCafeProductSchema,
  addCafeIngredientSchema,
  setCafeRecipeSchema,
  recordCafeOrderSchema,
  recordCafeStockCountSchema,
  recordEmployeeAdvanceSchema,
  recordEmployeeFuelVoucherSchema,
  markFuelVoucherReimbursedSchema,
  recordTankGaugeCertificateSchema,
  recordDeliveryShortfallSchema,
  markDeliveryInvoiceReceivedSchema,
  addDeliveryDriverSchema,
  documentCategorySchema,
  addVoucherCompanySchema,
  issueCompanyVoucherSchema,
  markCompanyVoucherPaidSchema,
  recordVignetteUsageSchema,
  recordCustomerCheckSchema,
  markCustomerCheckStatusSchema,
  recordCompanyCheckSchema,
  markCompanyCheckClearedSchema,
  addLubricantProductSchema,
  upsertAccountingSettingSchema,
  setFuelPriceTrendSchema,
  createSocialPostSchema,
  markSocialPostPublishedSchema,
  createMessageChannelSchema,
  sendChannelMessageSchema,
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
    driver_id: parsed.data.driverId || null,
    ordered_quantity: parsed.data.orderedQuantity ?? null,
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

// --- Caisse des crédits clients (module 8) ---

export async function addCreditCustomer(
  input: z.infer<typeof addCreditCustomerSchema>
): Promise<ActionResult> {
  const parsed = addCreditCustomerSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("credit_customers").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    credit_limit: parsed.data.creditLimit ?? null,
  });

  if (error) return { error: "Impossible d'ajouter le client." };
  revalidatePath("/app/panostation/credits");
  return {};
}

export async function recordCreditTransaction(
  userId: string,
  input: z.infer<typeof recordCreditTransactionSchema>
): Promise<ActionResult> {
  const parsed = recordCreditTransactionSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("credit_transactions").insert({
    customer_id: parsed.data.customerId,
    station_id: parsed.data.stationId,
    type: parsed.data.type,
    amount: parsed.data.amount,
    note: parsed.data.note || null,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer l'opération." };
  revalidatePath("/app/panostation/credits");
  return {};
}

// --- Rapprochement bancaire (modules 9 et 10.1) ---

export async function recordBankDeposit(
  userId: string,
  input: z.infer<typeof recordBankDepositSchema>
): Promise<ActionResult> {
  const parsed = recordBankDepositSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("bank_deposits").insert({
    station_id: parsed.data.stationId,
    depositor_name: parsed.data.depositorName,
    amount: parsed.data.amount,
    deposit_date: parsed.data.depositDate || new Date().toISOString().slice(0, 10),
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le versement." };
  revalidatePath("/app/panostation/banque");
  return {};
}

export async function recordBankMessage(
  userId: string,
  input: z.infer<typeof recordBankMessageSchema>
): Promise<ActionResult> {
  const parsed = recordBankMessageSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("bank_messages").insert({
    station_id: parsed.data.stationId,
    message_type: parsed.data.messageType,
    amount: parsed.data.amount ?? null,
    raw_text: parsed.data.rawText,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le message." };
  revalidatePath("/app/panostation/banque");
  return {};
}

export async function matchBankDeposit(
  input: z.infer<typeof matchBankDepositSchema>
): Promise<ActionResult> {
  const parsed = matchBankDepositSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error: messageError } = await supabase
    .from("bank_messages")
    .update({ matched_deposit_id: parsed.data.depositId })
    .eq("id", parsed.data.messageId);

  if (messageError) return { error: "Impossible de rapprocher le message." };

  const { error: depositError } = await supabase
    .from("bank_deposits")
    .update({ status: "matched" })
    .eq("id", parsed.data.depositId);

  if (depositError) return { error: "Impossible de mettre à jour le versement." };

  revalidatePath("/app/panostation/banque");
  return {};
}

// --- Point de vente Café / Restaurant (module 14) ---

export async function addCafeProduct(
  input: z.infer<typeof addCafeProductSchema>
): Promise<ActionResult> {
  const parsed = addCafeProductSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("cafe_products").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    category: parsed.data.category || null,
    price: parsed.data.price,
  });

  if (error) return { error: "Impossible d'ajouter le produit." };
  revalidatePath("/app/panostation/cafe");
  return {};
}

export async function addCafeIngredient(
  input: z.infer<typeof addCafeIngredientSchema>
): Promise<ActionResult> {
  const parsed = addCafeIngredientSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("cafe_ingredients").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    unit: parsed.data.unit,
    stock_quantity: parsed.data.stockQuantity ?? 0,
    cost_per_unit: parsed.data.costPerUnit ?? 0,
    low_stock_threshold: parsed.data.lowStockThreshold ?? null,
  });

  if (error) return { error: "Impossible d'ajouter l'ingrédient." };
  revalidatePath("/app/panostation/cafe");
  return {};
}

export async function setCafeRecipe(
  input: z.infer<typeof setCafeRecipeSchema>
): Promise<ActionResult> {
  const parsed = setCafeRecipeSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("cafe_recipe_items")
    .delete()
    .eq("product_id", parsed.data.productId);

  if (deleteError) return { error: "Impossible de mettre à jour la recette." };

  if (parsed.data.items.length > 0) {
    const { error: insertError } = await supabase.from("cafe_recipe_items").insert(
      parsed.data.items.map((item) => ({
        product_id: parsed.data.productId,
        ingredient_id: item.ingredientId,
        quantity_required: item.quantityRequired,
      }))
    );
    if (insertError) return { error: "Impossible d'enregistrer la recette." };
  }

  revalidatePath("/app/panostation/cafe");
  return {};
}

export async function recordCafeOrder(
  userId: string,
  input: z.infer<typeof recordCafeOrderSchema>
): Promise<ActionResult> {
  const parsed = recordCafeOrderSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const productIds = [...new Set(parsed.data.items.map((i) => i.productId))];
  const { data: products, error: productsError } = await supabase
    .from("cafe_products")
    .select("id, price")
    .in("id", productIds);

  if (productsError || !products || products.length !== productIds.length) {
    return { error: "Un ou plusieurs produits sont introuvables." };
  }

  const priceById = new Map(products.map((p) => [p.id, Number(p.price)]));
  const totalAmount = parsed.data.items.reduce(
    (sum, item) => sum + (priceById.get(item.productId) ?? 0) * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
    .from("cafe_orders")
    .insert({
      station_id: parsed.data.stationId,
      total_amount: Math.round(totalAmount * 100) / 100,
      recorded_by: userId,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: "Impossible de créer la commande." };

  const { error: itemsError } = await supabase.from("cafe_order_items").insert(
    parsed.data.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: priceById.get(item.productId) ?? 0,
    }))
  );

  if (itemsError) return { error: "Commande créée, mais l'enregistrement des articles a échoué." };

  const { data: recipeItems } = await supabase
    .from("cafe_recipe_items")
    .select("product_id, ingredient_id, quantity_required")
    .in("product_id", productIds);

  if (recipeItems && recipeItems.length > 0) {
    const consumptionByIngredient = new Map<string, number>();
    for (const item of parsed.data.items) {
      for (const recipe of recipeItems) {
        if (recipe.product_id !== item.productId) continue;
        const current = consumptionByIngredient.get(recipe.ingredient_id) ?? 0;
        consumptionByIngredient.set(
          recipe.ingredient_id,
          current + Number(recipe.quantity_required) * item.quantity
        );
      }
    }

    for (const [ingredientId, consumed] of consumptionByIngredient) {
      const { data: ingredient } = await supabase
        .from("cafe_ingredients")
        .select("stock_quantity")
        .eq("id", ingredientId)
        .single();
      if (!ingredient) continue;
      await supabase
        .from("cafe_ingredients")
        .update({ stock_quantity: Math.max(0, Number(ingredient.stock_quantity) - consumed) })
        .eq("id", ingredientId);
    }
  }

  revalidatePath("/app/panostation/cafe");
  return {};
}

export async function recordCafeStockCount(
  userId: string,
  input: z.infer<typeof recordCafeStockCountSchema>
): Promise<ActionResult> {
  const parsed = recordCafeStockCountSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: ingredient, error: ingredientError } = await supabase
    .from("cafe_ingredients")
    .select("stock_quantity")
    .eq("id", parsed.data.ingredientId)
    .single();

  if (ingredientError || !ingredient) return { error: "Ingrédient introuvable." };

  const { error } = await supabase.from("cafe_stock_counts").insert({
    ingredient_id: parsed.data.ingredientId,
    station_id: parsed.data.stationId,
    theoretical_quantity: ingredient.stock_quantity,
    counted_quantity: parsed.data.countedQuantity,
    counted_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le comptage." };

  await supabase
    .from("cafe_ingredients")
    .update({ stock_quantity: parsed.data.countedQuantity })
    .eq("id", parsed.data.ingredientId);

  revalidatePath("/app/panostation/cafe");
  return {};
}

// --- Salaires et Bons employés (module 17) ---

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end, startIso: start.toISOString().slice(0, 10) };
}

async function amountTakenThisMonth(
  supabase: Awaited<ReturnType<typeof createClient>>,
  employeeId: string
): Promise<number> {
  const { start, end, startIso } = currentMonthRange();

  const [{ data: advances }, { data: vouchers }] = await Promise.all([
    supabase.from("employee_advances").select("amount").eq("employee_id", employeeId).eq("period_month", startIso),
    supabase
      .from("employee_fuel_vouchers")
      .select("amount")
      .eq("employee_id", employeeId)
      .eq("is_reimbursed", false)
      .gte("voucher_date", start.toISOString().slice(0, 10))
      .lt("voucher_date", end.toISOString().slice(0, 10)),
  ]);

  const advancesTotal = (advances ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  const vouchersTotal = (vouchers ?? []).reduce((sum, v) => sum + Number(v.amount), 0);
  return advancesTotal + vouchersTotal;
}

export async function recordEmployeeAdvance(
  organizationId: string,
  userId: string,
  input: z.infer<typeof recordEmployeeAdvanceSchema>
): Promise<ActionResult> {
  const parsed = recordEmployeeAdvanceSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("salary")
    .eq("id", parsed.data.employeeId)
    .single();

  if (employeeError || !employee) return { error: "Employé introuvable." };

  if (employee.salary != null) {
    const takenSoFar = await amountTakenThisMonth(supabase, parsed.data.employeeId);
    if (takenSoFar + parsed.data.amount > Number(employee.salary)) {
      return { error: "Cette avance dépasserait le salaire de l'employé pour ce mois." };
    }
  }

  const { startIso } = currentMonthRange();
  const { error } = await supabase.from("employee_advances").insert({
    employee_id: parsed.data.employeeId,
    organization_id: organizationId,
    amount: parsed.data.amount,
    period_month: startIso,
    note: parsed.data.note || null,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer l'avance." };
  revalidatePath("/app/panostation/salaires");
  return {};
}

export async function recordEmployeeFuelVoucher(
  organizationId: string,
  userId: string,
  input: z.infer<typeof recordEmployeeFuelVoucherSchema>
): Promise<ActionResult> {
  const parsed = recordEmployeeFuelVoucherSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("salary")
    .eq("id", parsed.data.employeeId)
    .single();

  if (employeeError || !employee) return { error: "Employé introuvable." };

  if (employee.salary != null) {
    const takenSoFar = await amountTakenThisMonth(supabase, parsed.data.employeeId);
    if (takenSoFar + parsed.data.amount > Number(employee.salary)) {
      return { error: "Ce bon dépasserait le salaire de l'employé pour ce mois." };
    }
  }

  const { error } = await supabase.from("employee_fuel_vouchers").insert({
    employee_id: parsed.data.employeeId,
    organization_id: organizationId,
    station_id: parsed.data.stationId,
    amount: parsed.data.amount,
    product_description: parsed.data.productDescription,
    beneficiary_name: parsed.data.beneficiaryName || null,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le bon." };
  revalidatePath("/app/panostation/salaires");
  return {};
}

export async function markFuelVoucherReimbursed(
  input: z.infer<typeof markFuelVoucherReimbursedSchema>
): Promise<ActionResult> {
  const parsed = markFuelVoucherReimbursedSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("employee_fuel_vouchers")
    .update({ is_reimbursed: true })
    .eq("id", parsed.data.voucherId);

  if (error) return { error: "Impossible de mettre à jour le bon." };
  revalidatePath("/app/panostation/salaires");
  return {};
}

// --- La Jauge : certificats de cuves et facture manquante (module 18) ---

export async function recordTankGaugeCertificate(
  userId: string,
  input: z.infer<typeof recordTankGaugeCertificateSchema>
): Promise<ActionResult> {
  const parsed = recordTankGaugeCertificateSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: tank, error: tankError } = await supabase
    .from("tanks")
    .select("current_volume_liters")
    .eq("id", parsed.data.tankId)
    .single();

  if (tankError || !tank) return { error: "Cuve introuvable." };

  const { error } = await supabase.from("tank_gauge_certificates").insert({
    tank_id: parsed.data.tankId,
    station_id: parsed.data.stationId,
    measured_quantity: parsed.data.measuredQuantity,
    theoretical_quantity: tank.current_volume_liters,
    certified_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le certificat de jauge." };

  await supabase
    .from("tanks")
    .update({ current_volume_liters: parsed.data.measuredQuantity })
    .eq("id", parsed.data.tankId);

  revalidatePath("/app/panostation/jauge");
  revalidatePath("/app/panostation/cuves");
  return {};
}

export async function recordDeliveryShortfall(
  userId: string,
  input: z.infer<typeof recordDeliveryShortfallSchema>
): Promise<ActionResult> {
  const parsed = recordDeliveryShortfallSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("delivery_shortfall_reports").insert({
    delivery_id: parsed.data.deliveryId,
    station_id: parsed.data.stationId,
    missing_quantity: parsed.data.missingQuantity,
    driver_name: parsed.data.driverName,
    signature_note: parsed.data.signatureNote || null,
    reported_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer la facture manque." };
  revalidatePath("/app/panostation/jauge");
  revalidatePath("/app/panostation/livraisons");
  return {};
}

export async function markDeliveryInvoiceReceived(
  input: z.infer<typeof markDeliveryInvoiceReceivedSchema>
): Promise<ActionResult> {
  const parsed = markDeliveryInvoiceReceivedSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("fuel_deliveries")
    .update({
      invoice_received: true,
      invoice_received_at: new Date().toISOString(),
      invoice_reference: parsed.data.invoiceReference || null,
    })
    .eq("id", parsed.data.deliveryId);

  if (error) return { error: "Impossible de mettre à jour la livraison." };
  revalidatePath("/app/panostation/jauge");
  revalidatePath("/app/panostation/livraisons");
  return {};
}

// --- Gestion des livreurs (module 19) ---

export async function addDeliveryDriver(
  organizationId: string,
  input: z.infer<typeof addDeliveryDriverSchema>
): Promise<ActionResult> {
  const parsed = addDeliveryDriverSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("delivery_drivers").insert({
    organization_id: organizationId,
    full_name: parsed.data.fullName,
    supplier_id: parsed.data.supplierId || null,
    phone: parsed.data.phone || null,
  });

  if (error) return { error: "Impossible d'ajouter le livreur." };
  revalidatePath("/app/panostation/livreurs");
  revalidatePath("/app/panostation/livraisons");
  return {};
}

// --- Gestion documentaire des factures (module 6) ---

export async function uploadDocument(userId: string, formData: FormData): Promise<ActionResult> {
  const file = formData.get("file");
  const stationId = formData.get("stationId");
  const category = formData.get("category");
  const documentDate = formData.get("documentDate");
  const supplierName = formData.get("supplierName");
  const relatedTable = formData.get("relatedTable");
  const relatedId = formData.get("relatedId");

  if (!(file instanceof File) || file.size === 0) return { error: "Sélectionnez un fichier." };
  if (typeof stationId !== "string" || !stationId) return { error: "Station requise." };

  const parsedCategory = documentCategorySchema.safeParse(category);
  if (!parsedCategory.success) return { error: "Catégorie invalide." };

  const supabase = await createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${stationId}/${parsedCategory.data}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("station-documents")
    .upload(path, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) return { error: "Impossible de téléverser le fichier." };

  const { error: insertError } = await supabase.from("documents").insert({
    station_id: stationId,
    category: parsedCategory.data,
    file_path: path,
    file_name: file.name,
    document_date:
      typeof documentDate === "string" && documentDate ? documentDate : new Date().toISOString().slice(0, 10),
    supplier_name: typeof supplierName === "string" && supplierName ? supplierName : null,
    related_table: typeof relatedTable === "string" && relatedTable ? relatedTable : null,
    related_id: typeof relatedId === "string" && relatedId ? relatedId : null,
    uploaded_by: userId,
  });

  if (insertError) {
    await supabase.storage.from("station-documents").remove([path]);
    return { error: "Fichier téléversé, mais l'enregistrement a échoué." };
  }

  revalidatePath("/app/panostation/documents");
  return {};
}

export async function deleteDocument(documentId: string, filePath: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId);
  if (deleteError) return { error: "Impossible de supprimer le document." };

  await supabase.storage.from("station-documents").remove([filePath]);
  revalidatePath("/app/panostation/documents");
  return {};
}

// --- Bons Société et Vignettes (module 7) ---

export async function addVoucherCompany(
  input: z.infer<typeof addVoucherCompanySchema>
): Promise<ActionResult> {
  const parsed = addVoucherCompanySchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("voucher_companies").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    phone: parsed.data.phone || null,
  });

  if (error) return { error: "Impossible d'ajouter l'entreprise." };
  revalidatePath("/app/panostation/bons");
  return {};
}

export async function issueCompanyVoucher(
  userId: string,
  input: z.infer<typeof issueCompanyVoucherSchema>
): Promise<ActionResult> {
  const parsed = issueCompanyVoucherSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("company_vouchers").insert({
    company_id: parsed.data.companyId,
    station_id: parsed.data.stationId,
    amount: parsed.data.amount,
    product_description: parsed.data.productDescription,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le bon." };
  revalidatePath("/app/panostation/bons");
  return {};
}

export async function markCompanyVoucherPaid(
  input: z.infer<typeof markCompanyVoucherPaidSchema>
): Promise<ActionResult> {
  const parsed = markCompanyVoucherPaidSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_vouchers")
    .update({
      status: "paid",
      payment_method: parsed.data.paymentMethod,
      paid_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.voucherId);

  if (error) return { error: "Impossible de mettre à jour le bon." };
  revalidatePath("/app/panostation/bons");
  return {};
}

export async function recordVignetteUsage(
  userId: string,
  input: z.infer<typeof recordVignetteUsageSchema>
): Promise<ActionResult> {
  const parsed = recordVignetteUsageSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("vignette_usages").insert({
    company_id: parsed.data.companyId,
    station_id: parsed.data.stationId,
    vignette_type: parsed.data.vignetteType,
    amount: parsed.data.amount,
    product_description: parsed.data.productDescription || null,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer l'utilisation de vignette." };
  revalidatePath("/app/panostation/bons");
  return {};
}

// --- Chèques clients et société (modules 11 et 12) ---

export async function recordCustomerCheck(
  userId: string,
  input: z.infer<typeof recordCustomerCheckSchema>
): Promise<ActionResult> {
  const parsed = recordCustomerCheckSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("customer_checks").insert({
    customer_id: parsed.data.customerId,
    station_id: parsed.data.stationId,
    amount: parsed.data.amount,
    check_number: parsed.data.checkNumber,
    due_date: parsed.data.dueDate || null,
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le chèque." };
  revalidatePath("/app/panostation/cheques");
  return {};
}

export async function markCustomerCheckStatus(
  userId: string,
  input: z.infer<typeof markCustomerCheckStatusSchema>
): Promise<ActionResult> {
  const parsed = markCustomerCheckStatusSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: check, error: checkError } = await supabase
    .from("customer_checks")
    .select("customer_id, station_id, amount, check_number, status")
    .eq("id", parsed.data.checkId)
    .single();

  if (checkError || !check) return { error: "Chèque introuvable." };
  if (check.status !== "pending") return { error: "Ce chèque a déjà été traité." };

  const { error } = await supabase
    .from("customer_checks")
    .update({
      status: parsed.data.status,
      cleared_at: parsed.data.status === "cleared" ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.checkId);

  if (error) return { error: "Impossible de mettre à jour le chèque." };

  if (parsed.data.status === "cleared") {
    await supabase.from("credit_transactions").insert({
      customer_id: check.customer_id,
      station_id: check.station_id,
      type: "advance",
      amount: check.amount,
      note: `Chèque n°${check.check_number} encaissé`,
      recorded_by: userId,
    });
  }

  revalidatePath("/app/panostation/cheques");
  revalidatePath("/app/panostation/credits");
  return {};
}

export async function recordCompanyCheck(
  userId: string,
  input: z.infer<typeof recordCompanyCheckSchema>
): Promise<ActionResult> {
  const parsed = recordCompanyCheckSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("company_checks").insert({
    station_id: parsed.data.stationId,
    beneficiary: parsed.data.beneficiary,
    category: parsed.data.category,
    amount: parsed.data.amount,
    check_number: parsed.data.checkNumber,
    issued_date: parsed.data.issuedDate || new Date().toISOString().slice(0, 10),
    recorded_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer le chèque." };
  revalidatePath("/app/panostation/cheques");
  return {};
}

export async function markCompanyCheckCleared(
  input: z.infer<typeof markCompanyCheckClearedSchema>
): Promise<ActionResult> {
  const parsed = markCompanyCheckClearedSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_checks")
    .update({ status: "cleared" })
    .eq("id", parsed.data.checkId);

  if (error) return { error: "Impossible de mettre à jour le chèque." };
  revalidatePath("/app/panostation/cheques");
  return {};
}

// --- Stock de lubrifiants avec photo (module 13) ---

export async function addLubricantProduct(formData: FormData): Promise<ActionResult> {
  const parsed = addLubricantProductSchema.safeParse({
    stationId: formData.get("stationId"),
    name: formData.get("name"),
    reference: formData.get("reference"),
    costPrice: formData.get("costPrice"),
    retailPrice: formData.get("retailPrice"),
    stockQuantity: formData.get("stockQuantity") || undefined,
  });
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  let photoPath: string | null = null;

  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${parsed.data.stationId}/lubricant_photo/${Date.now()}_${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("station-documents")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (uploadError) return { error: "Impossible de téléverser la photo." };
    photoPath = path;
  }

  const { error } = await supabase.from("shop_products").insert({
    station_id: parsed.data.stationId,
    name: parsed.data.name,
    reference: parsed.data.reference || null,
    cost_price: parsed.data.costPrice,
    retail_price: parsed.data.retailPrice,
    stock_quantity: parsed.data.stockQuantity ?? 0,
    category: "lubricant",
    photo_path: photoPath,
  });

  if (error) {
    if (photoPath) await supabase.storage.from("station-documents").remove([photoPath]);
    return { error: "Impossible d'ajouter le produit." };
  }

  revalidatePath("/app/panostation/lubrifiants");
  return {};
}

// --- Droits d'accès aux pourcentages comptables (module 4) ---

export async function upsertAccountingSetting(
  organizationId: string,
  userId: string,
  input: z.infer<typeof upsertAccountingSettingSchema>
): Promise<ActionResult> {
  const parsed = upsertAccountingSettingSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("accounting_settings")
    .select("value")
    .eq("organization_id", organizationId)
    .eq("setting_key", parsed.data.settingKey)
    .maybeSingle();

  const { error } = await supabase.from("accounting_settings").upsert(
    {
      organization_id: organizationId,
      setting_key: parsed.data.settingKey,
      label: parsed.data.label,
      value: parsed.data.value,
      updated_by: userId,
    },
    { onConflict: "organization_id,setting_key" }
  );

  if (error) return { error: "Impossible d'enregistrer ce paramètre. Rôle Comptable requis." };

  await supabase.from("accounting_settings_history").insert({
    organization_id: organizationId,
    setting_key: parsed.data.settingKey,
    old_value: existing?.value ?? null,
    new_value: parsed.data.value,
    changed_by: userId,
  });

  revalidatePath("/app/panostation/parametres-comptables");
  return {};
}

// --- Veille des prix mondiaux (module 5) ---

export async function setFuelPriceTrend(
  organizationId: string,
  userId: string,
  input: z.infer<typeof setFuelPriceTrendSchema>
): Promise<ActionResult> {
  const parsed = setFuelPriceTrendSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("fuel_price_trend_settings").insert({
    organization_id: organizationId,
    trend: parsed.data.trend,
    note: parsed.data.note || null,
    set_by: userId,
  });

  if (error) return { error: "Impossible d'enregistrer la tendance." };
  revalidatePath("/app/panostation/veille-prix");
  return {};
}

// --- Planification réseaux sociaux (module 15) ---

export async function createSocialPost(
  organizationId: string,
  userId: string,
  input: z.infer<typeof createSocialPostSchema>
): Promise<ActionResult> {
  const parsed = createSocialPostSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("social_posts").insert({
    organization_id: organizationId,
    station_id: parsed.data.stationId || null,
    title: parsed.data.title,
    content: parsed.data.content,
    platform: parsed.data.platform,
    status: parsed.data.status,
    scheduled_for: parsed.data.scheduledFor || null,
    created_by: userId,
  });

  if (error) return { error: "Impossible de créer la publication." };
  revalidatePath("/app/panostation/marketing");
  return {};
}

export async function markSocialPostPublished(
  input: z.infer<typeof markSocialPostPublishedSchema>
): Promise<ActionResult> {
  const parsed = markSocialPostPublishedSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("social_posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", parsed.data.postId);

  if (error) return { error: "Impossible de mettre à jour la publication." };
  revalidatePath("/app/panostation/marketing");
  return {};
}

// --- Messagerie interne (module 16) ---

export async function createMessageChannel(
  organizationId: string,
  userId: string,
  input: z.infer<typeof createMessageChannelSchema>
): Promise<ActionResult> {
  const parsed = createMessageChannelSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("message_channels").insert({
    organization_id: organizationId,
    name: parsed.data.name,
    created_by: userId,
  });

  if (error) return { error: "Impossible de créer ce canal (nom déjà utilisé ?)." };
  revalidatePath("/app/panostation/messagerie");
  return {};
}

export async function sendChannelMessage(
  userId: string,
  input: z.infer<typeof sendChannelMessageSchema>
): Promise<ActionResult> {
  const parsed = sendChannelMessageSchema.safeParse(input);
  if (!parsed.success) return { error: firstIssueMessage(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("channel_messages").insert({
    channel_id: parsed.data.channelId,
    author_id: userId,
    body: parsed.data.body,
  });

  if (error) return { error: "Impossible d'envoyer le message." };
  revalidatePath("/app/panostation/messagerie");
  return {};
}
