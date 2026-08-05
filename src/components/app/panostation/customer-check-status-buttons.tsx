"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCustomerCheckStatus } from "@/app/actions/panostation";

export function CustomerCheckStatusButtons({ userId, checkId }: { userId: string; checkId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick(status: "cleared" | "bounced") {
    setError(null);
    startTransition(async () => {
      const result = await markCustomerCheckStatus(userId, { checkId, status });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleClick("cleared")}
          disabled={isPending}
          className="text-xs font-semibold text-panoryx-blue hover:text-[#1e4cf0] disabled:opacity-50"
        >
          Encaissé
        </button>
        <button
          type="button"
          onClick={() => handleClick("bounced")}
          disabled={isPending}
          className="text-xs font-semibold text-action-coral hover:text-red-700 disabled:opacity-50"
        >
          Rejeté
        </button>
      </div>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </div>
  );
}
