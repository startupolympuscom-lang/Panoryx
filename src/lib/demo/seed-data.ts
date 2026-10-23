/**
 * Static seed data for PanoStation's demo mode. This is a self-contained
 * substitute for the real Postgres database — it exists so the product can
 * be clicked through end to end (for founder/client validation) without
 * depending on Supabase auth or network access at all, since that's the
 * part currently broken in production.
 *
 * IDs are plain readable strings rather than real UUIDs; nothing here is
 * validated against a uuid format since it never reaches Postgres.
 */

const DAY = 24 * 60 * 60 * 1000;
const now = () => new Date();
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();

export const DEMO_USER_ID = "demo-user";
export const DEMO_ORG_ID = "demo-org";
export const DEMO_STATION_CASA = "station-casa";
export const DEMO_STATION_RABAT = "station-rabat";

export const DEMO_USER = {
  id: DEMO_USER_ID,
  email: "demo@panoryx.ma",
  user_metadata: { full_name: "Visiteur Démo" },
  app_metadata: {},
};

function makeStore() {
  return {
    profiles: [
      { id: DEMO_USER_ID, full_name: "Visiteur Démo", email: "demo@panoryx.ma", is_super_admin: false, created_at: daysAgo(90), updated_at: daysAgo(1) },
    ],
    organizations: [
      { id: DEMO_ORG_ID, name: "Station Demo Panoryx", slug: "demo-panoryx", created_by: DEMO_USER_ID, created_at: daysAgo(90), updated_at: daysAgo(1) },
    ],
    organization_members: [
      { id: "om-1", organization_id: DEMO_ORG_ID, user_id: DEMO_USER_ID, role: "owner", created_at: daysAgo(90) },
    ],
    products: [
      { id: "product-panostation", slug: "panostation", name: "PanoStation", description: "", created_at: daysAgo(400) },
    ],
    organization_products: [
      { id: "op-1", organization_id: DEMO_ORG_ID, product_id: "product-panostation", status: "active", trial_ends_at: null, activated_at: daysAgo(90), created_at: daysAgo(90), updated_at: daysAgo(90) },
    ],

    stations: [
      { id: DEMO_STATION_CASA, organization_id: DEMO_ORG_ID, name: "Casablanca Centre", city: "Casablanca", address: "12 Bd Mohammed V", timezone: "Africa/Casablanca", is_active: true, created_at: daysAgo(90), updated_at: daysAgo(90) },
      { id: DEMO_STATION_RABAT, organization_id: DEMO_ORG_ID, name: "Rabat Agdal", city: "Rabat", address: "Avenue Hassan II", timezone: "Africa/Casablanca", is_active: true, created_at: daysAgo(60), updated_at: daysAgo(60) },
    ],

    tanks: [
      { id: "tank-casa-sp95", station_id: DEMO_STATION_CASA, label: "Cuve 1 — SP95", fuel_type: "sp95", capacity_liters: 20000, current_volume_liters: 8400, low_level_threshold_liters: 3000, created_at: daysAgo(90), updated_at: hoursAgo(5) },
      { id: "tank-casa-gasoil", station_id: DEMO_STATION_CASA, label: "Cuve 2 — Gasoil", fuel_type: "gasoil", capacity_liters: 30000, current_volume_liters: 11200, low_level_threshold_liters: 5000, created_at: daysAgo(90), updated_at: hoursAgo(5) },
      { id: "tank-casa-sp98", station_id: DEMO_STATION_CASA, label: "Cuve 3 — SP98", fuel_type: "sp98", capacity_liters: 15000, current_volume_liters: 2100, low_level_threshold_liters: 2500, created_at: daysAgo(90), updated_at: hoursAgo(5) },
      { id: "tank-rabat-sp95", station_id: DEMO_STATION_RABAT, label: "Cuve 1 — SP95", fuel_type: "sp95", capacity_liters: 18000, current_volume_liters: 9600, low_level_threshold_liters: 3000, created_at: daysAgo(60), updated_at: hoursAgo(8) },
      { id: "tank-rabat-gasoil", station_id: DEMO_STATION_RABAT, label: "Cuve 2 — Gasoil", fuel_type: "gasoil", capacity_liters: 25000, current_volume_liters: 14300, low_level_threshold_liters: 5000, created_at: daysAgo(60), updated_at: hoursAgo(8) },
    ],

    pumps: [
      { id: "pump-casa-1", station_id: DEMO_STATION_CASA, label: "Pompe 1", created_at: daysAgo(90) },
      { id: "pump-casa-2", station_id: DEMO_STATION_CASA, label: "Pompe 2", created_at: daysAgo(90) },
      { id: "pump-rabat-1", station_id: DEMO_STATION_RABAT, label: "Pompe 1", created_at: daysAgo(60) },
    ],

    nozzles: [
      { id: "nozzle-casa-1a", pump_id: "pump-casa-1", station_id: DEMO_STATION_CASA, tank_id: "tank-casa-sp95", label: "1A — SP95", fuel_type: "sp95", last_index_liters: 184320, created_at: daysAgo(90), updated_at: hoursAgo(2) },
      { id: "nozzle-casa-1b", pump_id: "pump-casa-1", station_id: DEMO_STATION_CASA, tank_id: "tank-casa-gasoil", label: "1B — Gasoil", fuel_type: "gasoil", last_index_liters: 302140, created_at: daysAgo(90), updated_at: hoursAgo(2) },
      { id: "nozzle-casa-2a", pump_id: "pump-casa-2", station_id: DEMO_STATION_CASA, tank_id: "tank-casa-sp98", label: "2A — SP98", fuel_type: "sp98", last_index_liters: 94210, created_at: daysAgo(90), updated_at: hoursAgo(2) },
      { id: "nozzle-casa-2b", pump_id: "pump-casa-2", station_id: DEMO_STATION_CASA, tank_id: "tank-casa-gasoil", label: "2B — Gasoil", fuel_type: "gasoil", last_index_liters: 276050, created_at: daysAgo(90), updated_at: hoursAgo(2) },
      { id: "nozzle-rabat-1a", pump_id: "pump-rabat-1", station_id: DEMO_STATION_RABAT, tank_id: "tank-rabat-sp95", label: "1A — SP95", fuel_type: "sp95", last_index_liters: 142880, created_at: daysAgo(60), updated_at: hoursAgo(3) },
      { id: "nozzle-rabat-1b", pump_id: "pump-rabat-1", station_id: DEMO_STATION_RABAT, tank_id: "tank-rabat-gasoil", label: "1B — Gasoil", fuel_type: "gasoil", last_index_liters: 198430, created_at: daysAgo(60), updated_at: hoursAgo(3) },
    ],

    shifts: [
      { id: "shift-casa-open", station_id: DEMO_STATION_CASA, opened_by: DEMO_USER_ID, closed_by: null, status: "open", opened_at: hoursAgo(5), closed_at: null, notes: null, created_at: hoursAgo(5) },
      { id: "shift-casa-closed-1", station_id: DEMO_STATION_CASA, opened_by: DEMO_USER_ID, closed_by: DEMO_USER_ID, status: "closed", opened_at: hoursAgo(29), closed_at: hoursAgo(21), notes: "RAS", created_at: hoursAgo(29) },
      { id: "shift-rabat-open", station_id: DEMO_STATION_RABAT, opened_by: DEMO_USER_ID, closed_by: null, status: "open", opened_at: hoursAgo(6), closed_at: null, notes: null, created_at: hoursAgo(6) },
    ],

    shift_readings: [
      { id: "sr-1", shift_id: "shift-casa-open", nozzle_id: "nozzle-casa-1a", opening_index: 184000, closing_index: null, recorded_by: DEMO_USER_ID, created_at: hoursAgo(5), updated_at: hoursAgo(5) },
      { id: "sr-2", shift_id: "shift-casa-open", nozzle_id: "nozzle-casa-1b", opening_index: 301800, closing_index: null, recorded_by: DEMO_USER_ID, created_at: hoursAgo(5), updated_at: hoursAgo(5) },
      { id: "sr-3", shift_id: "shift-casa-closed-1", nozzle_id: "nozzle-casa-2a", opening_index: 93950, closing_index: 94210, recorded_by: DEMO_USER_ID, created_at: hoursAgo(29), updated_at: hoursAgo(21) },
    ],

    fuel_sales: Array.from({ length: 14 }).flatMap((_, i) => {
      const station = i % 3 === 0 ? DEMO_STATION_RABAT : DEMO_STATION_CASA;
      const shift = station === DEMO_STATION_CASA ? "shift-casa-open" : "shift-rabat-open";
      const fuelType = i % 3 === 1 ? "gasoil" : i % 3 === 2 ? "sp98" : "sp95";
      const price = fuelType === "gasoil" ? 10.85 : fuelType === "sp98" ? 13.4 : 12.95;
      const liters = 20 + ((i * 7) % 40);
      return [
        {
          id: `sale-${i}`,
          station_id: station,
          shift_id: shift,
          nozzle_id: null,
          fuel_type: fuelType,
          liters,
          unit_price: price,
          total_amount: Math.round(liters * price * 100) / 100,
          payment_method: i % 4 === 0 ? "card" : "cash",
          recorded_by: DEMO_USER_ID,
          sold_at: hoursAgo(i),
        },
      ];
    }),

    suppliers: [
      { id: "supplier-1", organization_id: DEMO_ORG_ID, name: "Winxo Distribution", contact_name: "Youssef Amrani", phone: "0522-00-00-00", email: "contact@winxo.ma", created_at: daysAgo(90), updated_at: daysAgo(90) },
      { id: "supplier-2", organization_id: DEMO_ORG_ID, name: "Atlas Lubrifiants", contact_name: "Salma El Idrissi", phone: "0537-00-00-00", email: "contact@atlas-lub.ma", created_at: daysAgo(80), updated_at: daysAgo(80) },
    ],

    purchase_orders: [],

    fuel_deliveries: [
      {
        id: "delivery-1", station_id: DEMO_STATION_CASA, tank_id: "tank-casa-gasoil", supplier_id: "supplier-1",
        liters: 12000, unit_cost: 9.9, delivery_note_ref: "BL-20451", delivered_at: daysAgo(2),
        received_by: DEMO_USER_ID, created_at: daysAgo(2),
        ordered_quantity: 12000, driver_id: "driver-1", invoice_received: true, invoice_received_at: daysAgo(1), invoice_reference: "FAC-8821",
      },
      {
        id: "delivery-2", station_id: DEMO_STATION_RABAT, tank_id: "tank-rabat-sp95", supplier_id: "supplier-1",
        liters: 8000, unit_cost: 11.6, delivery_note_ref: "BL-20460", delivered_at: daysAgo(5),
        received_by: DEMO_USER_ID, created_at: daysAgo(5),
        ordered_quantity: 8200, driver_id: "driver-2", invoice_received: false, invoice_received_at: null, invoice_reference: null,
      },
    ],

    cash_reconciliations: [
      { id: "cash-1", shift_id: "shift-casa-closed-1", station_id: DEMO_STATION_CASA, expected_amount: 4820, counted_amount: 4795, difference: -25, notes: "Petite monnaie manquante", recorded_by: DEMO_USER_ID, created_at: hoursAgo(21) },
    ],

    employees: [
      { id: "emp-1", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, full_name: "Karim Benjelloun", role_title: "Pompiste", phone: "0661-00-00-01", email: null, hired_at: "2023-03-01", is_active: true, created_at: daysAgo(400), updated_at: daysAgo(400) },
      { id: "emp-2", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, full_name: "Fatima Zahra Idrissi", role_title: "Responsable de station", phone: "0661-00-00-02", email: null, hired_at: "2022-06-15", is_active: true, created_at: daysAgo(500), updated_at: daysAgo(500) },
      { id: "emp-3", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_RABAT, full_name: "Hamza Ouazzani", role_title: "Pompiste", phone: "0661-00-00-03", email: null, hired_at: "2023-09-10", is_active: true, created_at: daysAgo(200), updated_at: daysAgo(200) },
    ],

    attendance_records: [],
    expenses: [],

    maintenance_tickets: [
      { id: "ticket-1", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, title: "Pompe 2 — fuite légère", description: "Fuite constatée au raccord du tuyau 2B.", status: "open", priority: "high", reported_by: DEMO_USER_ID, assigned_to: null, created_at: daysAgo(2), updated_at: daysAgo(2), resolved_at: null },
      { id: "ticket-2", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_RABAT, title: "Éclairage auvent HS", description: "Deux projecteurs à remplacer.", status: "resolved", priority: "medium", reported_by: DEMO_USER_ID, assigned_to: DEMO_USER_ID, created_at: daysAgo(10), updated_at: daysAgo(3), resolved_at: daysAgo(3) },
    ],

    operational_alerts: [
      { id: "alert-1", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, type: "low_stock", severity: "warning", message: "Cuve SP98 sous le seuil d'alerte.", is_resolved: false, related_table: "tanks", related_id: "tank-casa-sp98", created_at: hoursAgo(4), resolved_at: null },
      { id: "alert-2", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, type: "cash_variance", severity: "info", message: "Écart de caisse de -25 MAD détecté.", is_resolved: false, related_table: "cash_reconciliations", related_id: "cash-1", created_at: hoursAgo(21), resolved_at: null },
    ],

    shop_products: [
      { id: "shop-1", station_id: DEMO_STATION_CASA, name: "Eau minérale 0.5L", cost_price: 2.5, retail_price: 5, stock_quantity: 120, created_at: daysAgo(60), updated_at: daysAgo(1), category: "boutique", reference: null, photo_path: null },
      { id: "shop-2", station_id: DEMO_STATION_CASA, name: "Café expresso", cost_price: 1.2, retail_price: 8, stock_quantity: 500, created_at: daysAgo(60), updated_at: daysAgo(1), category: "boutique", reference: null, photo_path: null },
      { id: "shop-3", station_id: DEMO_STATION_CASA, name: "Huile moteur 5W30 1L", cost_price: 45, retail_price: 79, stock_quantity: 18, created_at: daysAgo(60), updated_at: daysAgo(1), category: "lubricant", reference: "ATL-5W30", photo_path: null },
    ],
    shop_sales: [
      { id: "shopsale-1", station_id: DEMO_STATION_CASA, product_id: "shop-1", quantity: 2, unit_cost: 2.5, unit_price: 5, total_amount: 10, total_profit: 5, sold_at: hoursAgo(3), recorded_by: DEMO_USER_ID, created_at: hoursAgo(3) },
      { id: "shopsale-2", station_id: DEMO_STATION_CASA, product_id: "shop-3", quantity: 1, unit_cost: 45, unit_price: 79, total_amount: 79, total_profit: 34, sold_at: hoursAgo(6), recorded_by: DEMO_USER_ID, created_at: hoursAgo(6) },
    ],

    credit_customers: [
      { id: "customer-1", station_id: DEMO_STATION_CASA, name: "Transport Benali SARL", phone: "0661-11-22-33", credit_limit: 20000, balance: 6400, created_at: daysAgo(120), updated_at: daysAgo(1) },
      { id: "customer-2", station_id: DEMO_STATION_CASA, name: "Taxi Idrissi", phone: "0661-44-55-66", credit_limit: 5000, balance: 1200, created_at: daysAgo(90), updated_at: daysAgo(2) },
    ],
    credit_transactions: [
      { id: "credit-tx-1", customer_id: "customer-1", station_id: DEMO_STATION_CASA, type: "charge", amount: 2400, note: "Plein flotte", recorded_by: DEMO_USER_ID, created_at: daysAgo(1) },
      { id: "credit-tx-2", customer_id: "customer-1", station_id: DEMO_STATION_CASA, type: "advance", amount: 1000, note: "Règlement partiel", recorded_by: DEMO_USER_ID, created_at: daysAgo(5) },
    ],

    bank_deposits: [
      { id: "deposit-1", station_id: DEMO_STATION_CASA, depositor_name: "Fatima Zahra Idrissi", amount: 15000, deposit_date: daysAgo(1).slice(0, 10), status: "matched", recorded_by: DEMO_USER_ID, created_at: daysAgo(1) },
      { id: "deposit-2", station_id: DEMO_STATION_CASA, depositor_name: "Fatima Zahra Idrissi", amount: 9800, deposit_date: now().toISOString().slice(0, 10), status: "pending", recorded_by: DEMO_USER_ID, created_at: hoursAgo(2) },
    ],
    bank_messages: [
      { id: "bankmsg-1", station_id: DEMO_STATION_CASA, message_type: "deposit", amount: 15000, raw_text: "Dépôt espèces 15 000,00 MAD compte ****1234", received_at: daysAgo(1), matched_deposit_id: "deposit-1", recorded_by: DEMO_USER_ID, created_at: daysAgo(1) },
    ],

    cafe_products: [
      { id: "cafe-prod-1", station_id: DEMO_STATION_CASA, name: "Café noir", category: "boisson", price: 8, is_active: true, created_at: daysAgo(60), updated_at: daysAgo(60) },
      { id: "cafe-prod-2", station_id: DEMO_STATION_CASA, name: "Sandwich thon", category: "snack", price: 25, is_active: true, created_at: daysAgo(60), updated_at: daysAgo(60) },
    ],
    cafe_ingredients: [
      { id: "cafe-ing-1", station_id: DEMO_STATION_CASA, name: "Café en grains", unit: "kg", stock_quantity: 8, cost_per_unit: 120, low_stock_threshold: 2, created_at: daysAgo(60), updated_at: daysAgo(1) },
      { id: "cafe-ing-2", station_id: DEMO_STATION_CASA, name: "Pain", unit: "unité", stock_quantity: 40, cost_per_unit: 2.5, low_stock_threshold: 10, created_at: daysAgo(60), updated_at: daysAgo(1) },
    ],
    cafe_recipe_items: [
      { id: "cafe-recipe-1", product_id: "cafe-prod-1", ingredient_id: "cafe-ing-1", quantity_required: 0.02 },
      { id: "cafe-recipe-2", product_id: "cafe-prod-2", ingredient_id: "cafe-ing-2", quantity_required: 1 },
    ],
    cafe_orders: [
      { id: "cafe-order-1", station_id: DEMO_STATION_CASA, status: "completed", total_amount: 33, recorded_by: DEMO_USER_ID, created_at: hoursAgo(2) },
    ],
    cafe_order_items: [
      { id: "cafe-order-item-1", order_id: "cafe-order-1", product_id: "cafe-prod-1", quantity: 1, unit_price: 8, total_amount: 8 },
      { id: "cafe-order-item-2", order_id: "cafe-order-1", product_id: "cafe-prod-2", quantity: 1, unit_price: 25, total_amount: 25 },
    ],
    cafe_stock_counts: [],

    employee_advances: [
      { id: "advance-1", employee_id: "emp-1", organization_id: DEMO_ORG_ID, amount: 500, period_month: now().toISOString().slice(0, 7) + "-01", note: "Avance mensuelle", recorded_by: DEMO_USER_ID, created_at: daysAgo(10) },
    ],
    employee_fuel_vouchers: [
      { id: "voucher-emp-1", employee_id: "emp-2", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, amount: 300, product_description: "Bon carburant mensuel", beneficiary_name: "Fatima Zahra Idrissi", is_reimbursed: false, voucher_date: now().toISOString().slice(0, 10), recorded_by: DEMO_USER_ID, created_at: daysAgo(3) },
    ],

    delivery_drivers: [
      { id: "driver-1", organization_id: DEMO_ORG_ID, full_name: "Rachid Tazi", supplier_id: "supplier-1", phone: "0662-00-00-01", created_at: daysAgo(90), updated_at: daysAgo(90) },
      { id: "driver-2", organization_id: DEMO_ORG_ID, full_name: "Mehdi Saadi", supplier_id: "supplier-1", phone: "0662-00-00-02", created_at: daysAgo(90), updated_at: daysAgo(90) },
    ],
    tank_gauge_certificates: [
      { id: "gauge-1", tank_id: "tank-casa-gasoil", station_id: DEMO_STATION_CASA, measured_quantity: 11200, theoretical_quantity: 11350, variance: -150, certified_by: DEMO_USER_ID, certified_at: hoursAgo(5) },
    ],
    delivery_shortfall_reports: [
      { id: "shortfall-1", delivery_id: "delivery-2", station_id: DEMO_STATION_RABAT, missing_quantity: 200, driver_name: "Mehdi Saadi", signature_note: "Bon papier signé classé au bureau.", report_date: daysAgo(5).slice(0, 10), reported_by: DEMO_USER_ID, created_at: daysAgo(5) },
    ],

    documents: [
      { id: "doc-1", station_id: DEMO_STATION_CASA, category: "invoice", file_path: "demo/invoice-1.pdf", file_name: "Facture Winxo Octobre.pdf", document_date: daysAgo(2).slice(0, 10), supplier_name: "Winxo Distribution", related_table: null, related_id: null, uploaded_by: DEMO_USER_ID, created_at: daysAgo(2) },
    ],

    voucher_companies: [
      { id: "voucher-co-1", station_id: DEMO_STATION_CASA, name: "Société Al Baraka Transport", phone: "0522-11-22-33", created_at: daysAgo(60), updated_at: daysAgo(60) },
    ],
    company_vouchers: [
      { id: "company-voucher-1", company_id: "voucher-co-1", station_id: DEMO_STATION_CASA, amount: 1500, product_description: "Carburant flotte", status: "unpaid", payment_method: null, paid_at: null, issued_at: daysAgo(3), recorded_by: DEMO_USER_ID, created_at: daysAgo(3) },
    ],
    vignette_usages: [
      { id: "vignette-1", company_id: "voucher-co-1", station_id: DEMO_STATION_CASA, vignette_type: "fuel", amount: 450, product_description: "Gasoil", used_at: hoursAgo(10), recorded_by: DEMO_USER_ID, created_at: hoursAgo(10) },
    ],

    customer_checks: [
      { id: "check-customer-1", customer_id: "customer-1", station_id: DEMO_STATION_CASA, amount: 3000, check_number: "0451123", due_date: daysAgo(-10).slice(0, 10), status: "pending", recorded_by: DEMO_USER_ID, created_at: daysAgo(4), cleared_at: null },
    ],
    company_checks: [
      { id: "check-company-1", station_id: DEMO_STATION_CASA, beneficiary: "Lydec", category: "Électricité", amount: 2200, check_number: "0987654", issued_date: daysAgo(2).slice(0, 10), status: "pending", recorded_by: DEMO_USER_ID, created_at: daysAgo(2) },
    ],

    accounting_settings: [
      { id: "setting-1", organization_id: DEMO_ORG_ID, setting_key: "target_margin_fuel", label: "Marge cible carburant (%)", value: 8.5, updated_by: DEMO_USER_ID, created_at: daysAgo(60), updated_at: daysAgo(10) },
      { id: "setting-2", organization_id: DEMO_ORG_ID, setting_key: "target_margin_boutique", label: "Marge cible boutique (%)", value: 35, updated_by: DEMO_USER_ID, created_at: daysAgo(60), updated_at: daysAgo(10) },
      { id: "setting-3", organization_id: DEMO_ORG_ID, setting_key: "target_margin_lubricant", label: "Marge cible lubrifiants (%)", value: 42, updated_by: DEMO_USER_ID, created_at: daysAgo(60), updated_at: daysAgo(10) },
      { id: "setting-4", organization_id: DEMO_ORG_ID, setting_key: "cash_variance_tolerance", label: "Tolérance écart de caisse (MAD)", value: 50, updated_by: DEMO_USER_ID, created_at: daysAgo(60), updated_at: daysAgo(10) },
    ],
    accounting_settings_history: [
      { id: "setting-hist-1", organization_id: DEMO_ORG_ID, setting_key: "target_margin_fuel", old_value: 8, new_value: 8.5, changed_by: DEMO_USER_ID, created_at: daysAgo(10) },
    ],

    fuel_price_trend_settings: [
      { id: "trend-1", organization_id: DEMO_ORG_ID, trend: "stable", note: "Pas de changement notable cette semaine.", set_by: DEMO_USER_ID, set_at: daysAgo(1) },
    ],

    social_posts: [
      { id: "post-1", organization_id: DEMO_ORG_ID, station_id: DEMO_STATION_CASA, title: "Promo café du matin", content: "Café + viennoiserie à 15 MAD tous les matins cette semaine !", platform: "facebook", status: "published", scheduled_for: null, published_at: daysAgo(2), created_by: DEMO_USER_ID, created_at: daysAgo(3), updated_at: daysAgo(2) },
      { id: "post-2", organization_id: DEMO_ORG_ID, station_id: null, title: "Nouveaux horaires", content: "Notre boutique est désormais ouverte 24h/24.", platform: "instagram", status: "draft", scheduled_for: null, published_at: null, created_by: DEMO_USER_ID, created_at: daysAgo(1), updated_at: daysAgo(1) },
    ],
    message_channels: [
      { id: "channel-1", organization_id: DEMO_ORG_ID, name: "Équipe station", created_by: DEMO_USER_ID, created_at: daysAgo(60) },
      { id: "channel-2", organization_id: DEMO_ORG_ID, name: "Fournisseurs", created_by: DEMO_USER_ID, created_at: daysAgo(60) },
    ],
    channel_messages: [
      { id: "chmsg-1", channel_id: "channel-1", author_id: DEMO_USER_ID, body: "Pensez à faire le relevé de la cuve 3 ce soir.", created_at: hoursAgo(5) },
      { id: "chmsg-2", channel_id: "channel-1", author_id: DEMO_USER_ID, body: "Reçu, c'est noté.", created_at: hoursAgo(4) },
    ],

    contact_requests: [],
    demo_requests: [],
  };
}

export type DemoStore = ReturnType<typeof makeStore>;

// Module-level singleton so writes made during the demo (adding a sale,
// closing a shift, etc.) are visible for the rest of that server process's
// lifetime. On serverless, a new process means a fresh copy of this seed —
// expected and fine for a click-through demo, not meant as durable storage.
let store: DemoStore | null = null;

export function getDemoStore(): DemoStore {
  if (!store) store = makeStore();
  return store;
}

export function resetDemoStore() {
  store = makeStore();
}
