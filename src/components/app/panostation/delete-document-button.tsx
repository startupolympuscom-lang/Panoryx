"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "@/app/actions/panostation";

export function DeleteDocumentButton({ documentId, filePath }: { documentId: string; filePath: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await deleteDocument(documentId, filePath);
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
        className="flex h-7 w-7 items-center justify-center rounded-md text-navy-400 hover:bg-navy-50 hover:text-action-coral disabled:opacity-50"
        aria-label="Supprimer le document"
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
      {error ? <span className="text-xs font-medium text-action-coral">{error}</span> : null}
    </div>
  );
}
