"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertAccountingSetting } from "@/app/actions/panostation";
import { Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { formatDateTimeFr } from "@/lib/utils";

export function AccountingSettingRow({
  organizationId,
  userId,
  settingKey,
  label,
  value,
  updatedAt,
  editable,
}: {
  organizationId: string;
  userId: string;
  settingKey: string;
  label: string;
  value: number | null;
  updatedAt: string | null;
  editable: boolean;
}) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(value != null ? String(value) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const numeric = Number(inputValue);
    if (Number.isNaN(numeric)) {
      setError("Valeur invalide.");
      return;
    }
    setIsSubmitting(true);
    const result = await upsertAccountingSetting(organizationId, userId, {
      settingKey,
      label,
      value: numeric,
    });
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        {updatedAt ? (
          <p className="text-xs text-navy-400">Mis à jour le {formatDateTimeFr(updatedAt)}</p>
        ) : (
          <p className="text-xs text-navy-400">Non défini</p>
        )}
      </div>
      {editable ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-9 w-28"
          />
          <span className="text-sm text-navy-500">%</span>
          <Button type="submit" size="sm" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? "…" : "Enregistrer"}
          </Button>
          {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
        </form>
      ) : (
        <span className="text-sm font-semibold text-navy">{value != null ? `${value} %` : "—"}</span>
      )}
    </div>
  );
}
