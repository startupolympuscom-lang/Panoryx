import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DocumentUploadForm, documentCategoryLabels } from "@/components/app/panostation/document-upload-form";
import { DeleteDocumentButton } from "@/components/app/panostation/delete-document-button";
import { formatDateFr } from "@/lib/utils";

export const metadata: Metadata = { title: "PanoStation — Documents" };

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();
  if (!user || !org) redirect("/app/onboarding");

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  const stationIds = (stations ?? []).map((s) => s.id);
  const stationNameById = new Map((stations ?? []).map((s) => [s.id, s.name] as const));

  const { data: documents } = stationIds.length
    ? await supabase
        .from("documents")
        .select("id, station_id, category, file_path, file_name, document_date, supplier_name")
        .in("station_id", stationIds)
        .order("document_date", { ascending: false })
        .limit(100)
    : { data: [] };

  const withUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("station-documents")
        .createSignedUrl(doc.file_path, 3600);
      return { ...doc, signedUrl: data?.signedUrl ?? null };
    })
  );

  const groups = new Map<string, typeof withUrls>();
  for (const doc of withUrls) {
    const d = new Date(doc.document_date);
    const key = `${d.getFullYear()}-${monthNames[d.getMonth()]}`;
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">Documents</h1>
        <p className="mt-1 text-sm text-navy-500">
          Factures, bons signés et photos, classés automatiquement par année et par mois.
        </p>
      </div>

      <div className="rounded-lg border border-navy-100 bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Téléverser un document</h2>
        <div className="mt-4">
          <DocumentUploadForm userId={user.id} stations={stations ?? []} />
        </div>
      </div>

      {groups.size === 0 ? (
        <div className="rounded-lg border border-navy-100 bg-white p-5">
          <p className="text-sm text-navy-500">Aucun document téléversé.</p>
        </div>
      ) : (
        Array.from(groups.entries()).map(([key, docs]) => (
          <div key={key} className="rounded-lg border border-navy-100 bg-white p-5">
            <h2 className="text-sm font-semibold text-navy">
              {key.split("-")[1]} {key.split("-")[0]} ({docs.length})
            </h2>
            <ul className="mt-4 divide-y divide-navy-100">
              {docs.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{doc.file_name}</p>
                    <p className="text-xs text-navy-500">
                      {formatDateFr(doc.document_date)} · {documentCategoryLabels[doc.category]} ·{" "}
                      {stationNameById.get(doc.station_id)}
                      {doc.supplier_name ? ` · ${doc.supplier_name}` : ""}
                    </p>
                  </div>
                  {doc.signedUrl ? (
                    <a
                      href={doc.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-xs font-semibold text-panoryx-blue hover:text-[#1e4cf0]"
                    >
                      Voir
                    </a>
                  ) : null}
                  <DeleteDocumentButton documentId={doc.id} filePath={doc.file_path} />
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
