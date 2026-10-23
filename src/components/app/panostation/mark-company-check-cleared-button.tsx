"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { markCompanyCheckCleared } from "@/app/actions/panostation";

export function MarkCompanyCheckClearedButton({ checkId }: { checkId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await markCompanyCheckCleared({ checkId });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-semibold text-panoryx-blue hover:text-[#1e4cf0] disabled:opacity-50"
      >
        {isPending ? "…" : "Marquer débité"}
      </button>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </div>
  );
}
