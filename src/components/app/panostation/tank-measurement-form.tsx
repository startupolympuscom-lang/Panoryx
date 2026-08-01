"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordTankMeasurement } from "@/app/actions/panostation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-fields";

export function TankMeasurementForm({
  tankId,
  currentVolumeLiters,
}: {
  tankId: string;
  currentVolumeLiters: number;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(currentVolumeLiters));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await recordTankMeasurement({ tankId, currentVolumeLiters: Number(value) });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <Input
        type="number"
        step="1"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-28"
        aria-label="Nouveau volume mesuré (L)"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "…" : "Mettre à jour"}
      </Button>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </form>
  );
}
