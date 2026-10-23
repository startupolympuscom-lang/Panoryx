"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

export const documentCategoryLabels: Record<string, string> = {
  invoice: "Facture",
  bon_signature: "Bon signé (cachet/signature)",
  lubricant_photo: "Photo produit lubrifiant",
  delivery_signature: "Signature livraison",
  other: "Autre",
};

export function DocumentUploadForm({
  userId,
  stations,
}: {
  userId: string;
  stations: DashboardStation[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setError("Sélectionnez un fichier.");
      return;
    }
    startTransition(async () => {
      const result = await uploadDocument(userId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  if (stations.length === 0) return null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Station" htmlFor="docStationId">
          <Select id="docStationId" name="stationId" defaultValue={stations[0]?.id}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Catégorie" htmlFor="docCategory">
          <Select id="docCategory" name="category" defaultValue="invoice">
            {Object.entries(documentCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date du document" htmlFor="docDate">
          <Input id="docDate" name="documentDate" type="date" defaultValue={today} max={today} />
        </Field>
        <Field label="Fournisseur" htmlFor="docSupplier" hint="Facultatif">
          <Input id="docSupplier" name="supplierName" placeholder="Ex. Winxo" />
        </Field>
      </div>
      <Field label="Fichier (photo ou scan)" htmlFor="docFile">
        <input
          id="docFile"
          name="file"
          type="file"
          accept="image/*,.pdf"
          className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-panoryx-blue/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-panoryx-blue"
        />
      </Field>

      {error ? <p className="text-sm font-medium text-action-coral">{error}</p> : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Téléversement…" : "Téléverser le document"}
      </Button>
    </form>
  );
}
