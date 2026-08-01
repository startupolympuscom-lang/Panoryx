import Link from "next/link";
import { LogOut } from "lucide-react";
import { LogoLink } from "@/components/brand/logo";
import { signOut } from "@/app/actions/auth";

export function AppTopbar({
  organizationName,
  userLabel,
}: {
  organizationName?: string;
  userLabel?: string;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-navy-100 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <LogoLink href="/app" height={22} />
        {organizationName ? (
          <>
            <span className="hidden h-5 w-px bg-navy-200 sm:block" aria-hidden="true" />
            <span className="hidden text-sm font-medium text-navy-700 sm:block">
              {organizationName}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/produits"
          className="hidden text-sm font-medium text-navy-500 hover:text-panoryx-blue sm:block"
        >
          Tous les produits
        </Link>
        {userLabel ? (
          <span className="hidden text-sm text-navy-500 sm:block">{userLabel}</span>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50"
          >
            <LogOut size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </header>
  );
}
