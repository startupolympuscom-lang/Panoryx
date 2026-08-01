import { getCurrentUser, getCurrentOrg } from "@/lib/auth/session";
import { AppTopbar } from "@/components/app/app-topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const org = await getCurrentOrg();

  return (
    <div className="flex min-h-screen flex-col bg-navy-50/40">
      <AppTopbar
        organizationName={org?.organizationName}
        userLabel={user?.email ?? undefined}
      />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
