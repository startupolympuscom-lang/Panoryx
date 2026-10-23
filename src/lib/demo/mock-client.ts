/**
 * A minimal in-memory stand-in for the Supabase JS client, used only in
 * demo mode (see demo-mode.ts). It supports exactly the query shapes this
 * codebase actually uses against Postgrest — eq/neq/in/gte/lte/gt/lt,
 * order, limit, maybeSingle/single, insert/update/upsert/delete, plus the
 * handful of embedded-resource selects (`table!inner(cols)` / `table(cols)`)
 * and the one dotted-filter case (`.eq("relation.col", value)`) that the
 * real pages rely on — rather than a general Postgrest reimplementation.
 */

import { DEMO_USER, getDemoStore, type DemoStore } from "./seed-data";

type Row = Record<string, unknown>;
type TableName = keyof DemoStore;

interface Relation {
  fk: string;
  target: TableName;
}

// table -> { embedNameUsedInSelect: relation }
const RELATIONS: Partial<Record<TableName, Record<string, Relation>>> = {
  organization_members: { organizations: { fk: "organization_id", target: "organizations" } },
  organization_products: { products: { fk: "product_id", target: "products" } },
  customer_checks: { credit_customers: { fk: "customer_id", target: "credit_customers" } },
  credit_transactions: { credit_customers: { fk: "customer_id", target: "credit_customers" } },
  tank_gauge_certificates: { tanks: { fk: "tank_id", target: "tanks" } },
  fuel_deliveries: {
    tanks: { fk: "tank_id", target: "tanks" },
    delivery_drivers: { fk: "driver_id", target: "delivery_drivers" },
  },
  cafe_stock_counts: { cafe_ingredients: { fk: "ingredient_id", target: "cafe_ingredients" } },
  shift_readings: { nozzles: { fk: "nozzle_id", target: "nozzles" } },
  shop_sales: { shop_products: { fk: "product_id", target: "shop_products" } },
  channel_messages: { profiles: { fk: "author_id", target: "profiles" } },
  accounting_settings_history: { profiles: { fk: "changed_by", target: "profiles" } },
  fuel_price_trend_settings: { profiles: { fk: "set_by", target: "profiles" } },
  employees: { suppliers: { fk: "supplier_id", target: "suppliers" } },
};

const EMBED_PATTERN = /([a-z_]+)(!inner)?\(([^)]*)\)/g;

function resolveEmbeds(store: DemoStore, table: TableName, row: Row, selectStr: string): Row {
  const relations = RELATIONS[table];
  if (!relations) return row;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(EMBED_PATTERN);
  const result: Row = { ...row };
  while ((match = pattern.exec(selectStr))) {
    const embedName = match[1];
    const relation = relations[embedName];
    if (!relation) continue;
    const fkValue = row[relation.fk];
    const targetRows = store[relation.target] as unknown as Row[];
    const related = targetRows.find((r) => r.id === fkValue) ?? null;
    result[embedName] = related;
  }
  return result;
}

function applyFilter(store: DemoStore, table: TableName, row: Row, col: string, op: string, val: unknown): boolean {
  let actual: unknown;
  if (col.includes(".")) {
    const [relName, subCol] = col.split(".");
    const relation = RELATIONS[table]?.[relName];
    if (!relation) return false;
    const targetRows = store[relation.target] as unknown as Row[];
    const related = targetRows.find((r) => r.id === row[relation.fk]);
    actual = related?.[subCol];
  } else {
    actual = row[col];
  }

  const baseOp = op.startsWith("not-") ? op.slice(4) : op;
  const matched = matchOp(actual, baseOp, val);
  return op.startsWith("not-") ? !matched : matched;
}

function matchOp(actual: unknown, op: string, val: unknown): boolean {
  switch (op) {
    case "eq":
      return actual === val;
    case "neq":
      return actual !== val;
    case "in":
      return Array.isArray(val) && (val as unknown[]).includes(actual);
    case "gte":
      return actual != null && (actual as string | number) >= (val as string | number);
    case "lte":
      return actual != null && (actual as string | number) <= (val as string | number);
    case "gt":
      return actual != null && (actual as string | number) > (val as string | number);
    case "lt":
      return actual != null && (actual as string | number) < (val as string | number);
    case "is":
      return val === null ? actual == null : actual === val;
    default:
      return true;
  }
}

let idCounter = 0;
function generateId(table: string) {
  idCounter += 1;
  return `${table}-demo-${Date.now()}-${idCounter}`;
}

type Filter = { col: string; op: string; val: unknown };

class MockQueryBuilder implements PromiseLike<{ data: unknown; error: { message: string } | null }> {
  private table: TableName;
  private selectStr = "*";
  private filters: Filter[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private singleMode: "maybe" | "one" | null = null;
  private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private payload: Row | Row[] | null = null;
  private upsertOnConflict: string | null = null;

  constructor(table: TableName) {
    this.table = table;
  }

  select(str = "*") {
    this.selectStr = str;
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push({ col, op: "eq", val });
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push({ col, op: "neq", val });
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push({ col, op: "in", val: vals });
    return this;
  }
  gte(col: string, val: unknown) {
    this.filters.push({ col, op: "gte", val });
    return this;
  }
  lte(col: string, val: unknown) {
    this.filters.push({ col, op: "lte", val });
    return this;
  }
  gt(col: string, val: unknown) {
    this.filters.push({ col, op: "gt", val });
    return this;
  }
  lt(col: string, val: unknown) {
    this.filters.push({ col, op: "lt", val });
    return this;
  }
  is(col: string, val: unknown) {
    this.filters.push({ col, op: "is", val });
    return this;
  }
  not(col: string, op: string, val: unknown) {
    this.filters.push({ col, op: `not-${op}`, val });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  maybeSingle() {
    this.singleMode = "maybe";
    return this;
  }
  single() {
    this.singleMode = "one";
    return this;
  }
  insert(payload: Row | Row[]) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: Row) {
    this.op = "update";
    this.payload = payload;
    return this;
  }
  upsert(payload: Row | Row[], opts?: { onConflict?: string }) {
    this.op = "upsert";
    this.payload = payload;
    this.upsertOnConflict = opts?.onConflict ?? null;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }

  then<TResult1 = { data: unknown; error: { message: string } | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown; error: { message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private matchingRows(store: DemoStore): Row[] {
    const rows = store[this.table] as unknown as Row[];
    return rows.filter((row) => this.filters.every((f) => applyFilter(store, this.table, row, f.col, f.op, f.val)));
  }

  private execute(): { data: unknown; error: { message: string } | null } {
    const store = getDemoStore();

    if (this.op === "insert") {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]).filter(Boolean) as Row[];
      const inserted = rows.map((r) => ({ id: generateId(this.table), created_at: new Date().toISOString(), ...r }));
      (store[this.table] as unknown as Row[]).push(...inserted);
      return { data: inserted.length === 1 ? inserted[0] : inserted, error: null };
    }

    if (this.op === "update") {
      const matches = this.matchingRows(store);
      matches.forEach((row) => Object.assign(row, this.payload));
      return { data: matches, error: null };
    }

    if (this.op === "upsert") {
      const rows = (Array.isArray(this.payload) ? this.payload : [this.payload]).filter(Boolean) as Row[];
      const table = store[this.table] as unknown as Row[];
      const conflictCols = this.upsertOnConflict?.split(",").map((c) => c.trim()) ?? ["id"];
      const results: Row[] = [];
      for (const incoming of rows) {
        const existing = table.find((row) => conflictCols.every((c) => row[c] === incoming[c]));
        if (existing) {
          Object.assign(existing, incoming);
          results.push(existing);
        } else {
          const created = { id: generateId(this.table), created_at: new Date().toISOString(), ...incoming };
          table.push(created);
          results.push(created);
        }
      }
      return { data: results.length === 1 ? results[0] : results, error: null };
    }

    if (this.op === "delete") {
      const table = store[this.table] as unknown as Row[];
      const matches = this.matchingRows(store);
      const matchSet = new Set(matches);
      const remaining = table.filter((row) => !matchSet.has(row));
      (store[this.table] as unknown as Row[]).length = 0;
      (store[this.table] as unknown as Row[]).push(...remaining);
      return { data: null, error: null };
    }

    // select
    let rows = this.matchingRows(store).map((row) => resolveEmbeds(store, this.table, row, this.selectStr));

    if (this.orderCol) {
      const col = this.orderCol;
      const dir = this.orderAsc ? 1 : -1;
      rows = [...rows].sort((a, b) => {
        const av = a[col] as string | number | null;
        const bv = b[col] as string | number | null;
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        return av > bv ? dir : av < bv ? -dir : 0;
      });
    }

    if (this.limitN != null) rows = rows.slice(0, this.limitN);

    if (this.singleMode) {
      const [first] = rows;
      if (!first && this.singleMode === "one") {
        return { data: null, error: { message: "No rows found" } };
      }
      return { data: first ?? null, error: null };
    }

    return { data: rows, error: null };
  }
}

const PLACEHOLDER_SIGNED_URL = "/brand/panoryx-mark-192.png";

function mockStorageBucket() {
  return {
    async upload(path: string) {
      return { data: { path }, error: null };
    },
    async createSignedUrl() {
      return { data: { signedUrl: PLACEHOLDER_SIGNED_URL }, error: null };
    },
    async remove() {
      return { data: null, error: null };
    },
  };
}

export function createDemoClient() {
  return {
    from(table: string) {
      return new MockQueryBuilder(table as TableName);
    },
    storage: {
      from() {
        return mockStorageBucket();
      },
    },
    auth: {
      async getUser() {
        return { data: { user: DEMO_USER }, error: null };
      },
      async signOut() {
        return { error: null };
      },
    },
    async rpc() {
      return { data: null, error: { message: "Not available in demo mode." } };
    },
  };
}

export type DemoSupabaseClient = ReturnType<typeof createDemoClient>;
