"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { setCafeRecipeSchema } from "@/lib/validations/panostation";
import { setCafeRecipe } from "@/app/actions/panostation";
import { Select, Input } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";

interface IngredientOption {
  id: string;
  name: string;
  unit: string;
}

type FormInput = z.input<typeof setCafeRecipeSchema>;
type FormOutput = z.output<typeof setCafeRecipeSchema>;

export function CafeRecipeEditor({
  productId,
  ingredients,
  initialItems,
}: {
  productId: string;
  ingredients: IngredientOption[];
  initialItems: { ingredientId: string; quantityRequired: number }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(setCafeRecipeSchema),
    defaultValues: { productId, items: initialItems },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const result = await setCafeRecipe(values);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.refresh();
  }

  if (ingredients.length === 0) {
    return (
      <p className="rounded-md bg-navy-50 px-3 py-2 text-xs text-navy-500">
        Ajoutez d&apos;abord des ingrédients pour définir une recette.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Select className="flex-1" {...register(`items.${index}.ingredientId`)}>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </Select>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              className="w-28"
              placeholder="Qté"
              {...register(`items.${index}.quantityRequired`)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-navy-400 hover:bg-navy-50 hover:text-action-coral"
              aria-label="Retirer cet ingrédient"
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {errors.items?.message ? (
        <p className="text-xs font-medium text-action-coral">{errors.items.message}</p>
      ) : null}

      <button
        type="button"
        onClick={() => append({ ingredientId: ingredients[0]?.id ?? "", quantityRequired: 1 })}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-panoryx-blue hover:text-[#1e4cf0]"
      >
        <Plus size={14} aria-hidden="true" />
        Ajouter un ingrédient
      </button>

      {serverError ? <p className="text-xs font-medium text-action-coral">{serverError}</p> : null}

      <div>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement…" : "Enregistrer la recette"}
        </Button>
      </div>
    </form>
  );
}
