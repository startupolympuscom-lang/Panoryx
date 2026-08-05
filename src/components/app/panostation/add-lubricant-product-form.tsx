"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLubricantProduct } from "@/app/actions/panostation";
import { Field, Input, Select } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import type { DashboardStation } from "@/lib/data/panostation-dashboard";

export function AddLubricantProductForm({ stations }: { stations: DashboardStation[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addLubricantProduct(formData);
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Station" htmlFor="lubStationId">
          <Select id="lubStationId" name="stationId" defaultValue={stations[0]?.id}>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nom du produit" htmlFor="lubName">
          <Input id="lubName" name="name" placeholder="Ex. Huile 5W30 1L" required />
        </Field>
        <Field label="Référence" htmlFor="lubReference" hint="Facultatif">
          <Input id="lubReference" name="reference" placeholder="Code interne/fournisseur" />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Prix d'achat (MAD)" htmlFor="lubCostPrice">
          <Input id="lubCostPrice" name="costPrice" type="number" step="0.01" min="0" required />
        </Field>
        <Field label="Prix de vente (MAD)" htmlFor="lubRetailPrice">
          <Input id="lubRetailPrice" name="retailPrice" type="number" step="0.01" min="0" required />
        </Field>
        <Field label="Stock initial" htmlFor="lubStock" hint="Facultatif">
          <Input id="lubStock" name="stockQuantity" type="number" step="1" min="0" />
        </Field>
      </div>
      <Field label="Photo du produit" htmlFor="lubPhoto" hint="Facultatif">
        <input
          id="lubPhoto"
          name="photo"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-navy-700 file:mr-3 file:rounded-md file:border-0 file:bg-panoryx-blue/10 file:px-3.5 file:py-2 file:text-sm file:font-medium file:text-panoryx-blue"
        />
      </Field>

      {error ? <p className="text-sm font-medium text-action-coral">{error}</p> : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Ajout…" : "Ajouter le produit"}
      </Button>
    </form>
  );
}
