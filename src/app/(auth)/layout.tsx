import Link from "next/link";
import { LogoLink } from "@/components/brand/logo";
import { PanoramicArcs, Flowlines } from "@/components/brand/graphic-devices";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-navy-50/40">
      <div className="relative overflow-hidden border-b border-navy-100 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5 sm:px-8">
          <LogoLink height={26} />
        </div>
      </div>

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-14 sm:py-20">
        <PanoramicArcs
          strokeWidth={5}
          className="pointer-events-none absolute -right-40 -top-32 h-[480px] w-[480px] opacity-[0.08]"
        />
        <Flowlines
          strokeWidth={5}
          className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 opacity-[0.08]"
        />
        <div className="relative w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t border-navy-100 bg-white py-6">
        <p className="text-center text-xs text-navy-500">
          <Link href="/" className="hover:text-panoryx-blue">
            ← Retour au site Panoryx
          </Link>
        </p>
      </footer>
    </div>
  );
}
