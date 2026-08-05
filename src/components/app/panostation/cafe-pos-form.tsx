"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { recordCafeOrder } from "@/app/actions/panostation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form-fields";
import { formatMAD } from "@/lib/utils";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

interface CafeProductOption {
  id: string;
  stationId: string;
  name: string;
  category: string | null;
  price: number;
}

export function CafePosForm({
  userId,
  stations,
  products,
}: {
  userId: string;
  stations: DashboardStation[];
  products: CafeProductOption[];
}) {
  const router = useRouter();
  const [stationId, setStationId] = useState(stations[0]?.id ?? "");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const stationProducts = products.filter((p) => p.stationId === stationId);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const total = Object.entries(cart).reduce((sum, [productId, qty]) => {
    const price = productById.get(productId)?.price ?? 0;
    return sum + price * qty;
  }, 0);

  function addToCart(productId: string) {
    setCart((c) => ({ ...c, [productId]: (c[productId] ?? 0) + 1 }));
  }

  function adjustQty(productId: string, delta: number) {
    setCart((c) => {
      const next = { ...c };
      const qty = (next[productId] ?? 0) + delta;
      if (qty <= 0) delete next[productId];
      else next[productId] = qty;
      return next;
    });
  }

  function removeFromCart(productId: string) {
    setCart((c) => {
      const next = { ...c };
      delete next[productId];
      return next;
    });
  }

  function checkout() {
    setError(null);
    const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
    if (items.length === 0) return;

    startTransition(async () => {
      const result = await recordCafeOrder(userId, { stationId, items });
      if (result.error) {
        setError(result.error);
        return;
      }
      setCart({});
      router.refresh();
    });
  }

  if (stations.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 max-w-xs">
          <Select value={stationId} onChange={(e) => setStationId(e.target.value)}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        {stationProducts.length === 0 ? (
          <p className="rounded-md bg-navy-50 px-3 py-2 text-sm text-navy-500">
            Ajoutez des produits au menu de cette station pour commencer à encaisser.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stationProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p.id)}
                className="flex flex-col items-start rounded-lg border border-navy-100 bg-white p-3.5 text-left transition-colors hover:border-panoryx-blue hover:bg-panoryx-blue/5"
              >
                <span className="text-sm font-semibold text-navy">{p.name}</span>
                {p.category ? <span className="text-xs text-navy-400">{p.category}</span> : null}
                <span className="mt-2 text-sm font-bold text-panoryx-blue">{formatMAD(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-navy-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-navy">Commande en cours</h3>
        </div>

        {Object.keys(cart).length === 0 ? (
          <p className="mt-4 text-sm text-navy-500">Sélectionnez des articles pour démarrer.</p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {Object.entries(cart).map(([productId, qty]) => {
              const product = productById.get(productId);
              if (!product) return null;
              return (
                <li key={productId} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{product.name}</p>
                    <p className="text-xs text-navy-500">{formatMAD(product.price * qty)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => adjustQty(productId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-navy-200 text-navy-500 hover:bg-navy-50"
                      aria-label="Diminuer la quantité"
                    >
                      <Minus size={12} aria-hidden="true" />
                    </button>
                    <span className="w-5 text-center text-sm font-medium text-navy">{qty}</span>
                    <button
                      type="button"
                      onClick={() => adjustQty(productId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-navy-200 text-navy-500 hover:bg-navy-50"
                      aria-label="Augmenter la quantité"
                    >
                      <Plus size={12} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(productId)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-md text-navy-400 hover:text-action-coral"
                      aria-label="Retirer l'article"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-navy-100 pt-3">
          <span className="text-sm font-semibold text-navy">Total</span>
          <span className="text-lg font-bold text-navy">{formatMAD(total)}</span>
        </div>

        {error ? <p className="mt-2 text-xs font-medium text-action-coral">{error}</p> : null}

        <Button
          type="button"
          className="mt-3 w-full justify-center"
          onClick={checkout}
          disabled={isPending || Object.keys(cart).length === 0}
        >
          {isPending ? "Encaissement…" : "Encaisser"}
        </Button>
      </div>
    </div>
  );
}
