"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordCafeStockCount } from "@/app/actions/panostation";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

export function RecordCafeStockCountForm({
  userId,
  ingredientId,
  stationId,
  unit,
}: {
  userId: string;
  ingredientId: string;
  stationId: string;
  unit: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const countedQuantity = Number(value);
    if (Number.isNaN(countedQuantity) || countedQuantity < 0) {
      setError("Quantité invalide.");
      return;
    }
    startTransition(async () => {
      const result = await recordCafeStockCount(userId, { ingredientId, stationId, countedQuantity });
      if (result.error) {
        setError(result.error);
        return;
      }
      setValue("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder={`Compté (${unit})`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-32"
      />
      <Button type="submit" size="sm" variant="outline" disabled={isPending || value === ""}>
        {isPending ? "…" : "Compter"}
      </Button>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </form>
  );
}
