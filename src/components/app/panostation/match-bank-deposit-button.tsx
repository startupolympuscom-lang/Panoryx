"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { matchBankDeposit } from "@/app/actions/panostation";
import { Button } from "@/components/ui/button";

export function MatchBankDepositButton({
  depositId,
  messageId,
}: {
  depositId: string;
  messageId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await matchBankDeposit({ depositId, messageId });
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? "Rapprochement…" : "Rapprocher"}
      </Button>
      {error ? <p className="text-xs font-medium text-action-coral">{error}</p> : null}
    </div>
  );
}
