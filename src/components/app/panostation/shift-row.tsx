"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloseShiftForm } from "./close-shift-form";
import { formatDateTimeFr } from "@/lib/utils";

interface ReadingRow {
  readingId: string;
  nozzleLabel: string;
  openingIndex: number;
}

export function ShiftRow({
  userId,
  shiftId,
  stationName,
  openedAt,
  readings,
}: {
  userId: string;
  shiftId: string;
  stationName: string;
  openedAt: string;
  readings: ReadingRow[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-navy">{stationName}</p>
          <p className="text-xs text-navy-500">Ouvert le {formatDateTimeFr(openedAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="warning">Ouvert</Badge>
          <Button size="sm" variant="outline" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Annuler" : "Clôturer"}
          </Button>
        </div>
      </div>
      {expanded ? (
        <div className="mt-3">
          <CloseShiftForm
            userId={userId}
            shiftId={shiftId}
            readings={readings}
            onDone={() => setExpanded(false)}
          />
        </div>
      ) : null}
    </li>
  );
}
