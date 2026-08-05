"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCompanyVoucherPaid } from "@/app/actions/panostation";
import { Select } from "@/components/ui/form-fields";

export function MarkVoucherPaidForm({ voucherId }: { voucherId: string }) {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await markCompanyVoucherPaid({
        voucherId,
        paymentMethod: paymentMethod as "cash" | "check" | "transfer",
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <Select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        className="h-8 w-28 text-xs"
      >
        <option value="cash">Cash</option>
        <option value="check">Chèque</option>
        <option value="transfer">Virement</option>
      </Select>
      <button
        type="submit"
        disabled={isPending}
        className="text-xs font-semibold text-panoryx-blue hover:text-[#1e4cf0] disabled:opacity-50"
      >
        {isPending ? "…" : "Marquer payé"}
      </button>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </form>
  );
}
