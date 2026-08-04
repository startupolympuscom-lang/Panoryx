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
