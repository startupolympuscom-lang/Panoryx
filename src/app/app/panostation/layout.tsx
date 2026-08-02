import { redirect } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { getCurrentOrg, hasProductAccess } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { AccessRequest } from "@/components/app/access-request";
import { PanoStationSidebar } from "@/components/app/panostation/sidebar";
import { PanoStationMobileNav } from "@/components/app/panostation/mobile-sidebar";
import { StationSwitcher } from "@/components/app/panostation/station-switcher";

export default async function PanoStationLayout({ children }: { children: React.ReactNode }) {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/onboarding");

  const access = await hasProductAccess(org.organizationId, "panostation");
  if (!access.hasAccess) {
    return <AccessRequest productName="PanoStation" organizationName={org.organizationName} />;
  }

  const supabase = await createClient();
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, city")
    .eq("organization_id", org.organizationId)
    .order("name");

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-navy-100 bg-white p-4 lg:block">
        <Image
          src="/brand/panostation/panostation-logo-light.png"
          alt="PanoStation"
          width={1744}
          height={887}
          priority
          className="mb-5 ml-1 h-6 w-auto"
        />
        <PanoStationSidebar />
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-navy-100 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <PanoStationMobileNav />
            <Image
              src="/brand/panostation/panostation-logo-light.png"
              alt="PanoStation"
              width={1744}
              height={887}
              className="h-5 w-auto lg:hidden"
            />
          </div>
          <Suspense fallback={null}>
            <StationSwitcher stations={stations ?? []} />
          </Suspense>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
