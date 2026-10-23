import { Sparkles } from "lucide-react";
import { enterDemoMode } from "@/lib/demo/demo-mode";

/**
 * Temporary workaround for the live login issue: lets a visitor skip
 * real authentication entirely and explore PanoStation against seeded
 * demo data. Remove once Supabase auth is confirmed working again.
 */
export function DemoAccess({ next }: { next: string }) {
  return (
    <div className="mt-6 border-t border-navy-100 pt-6">
      <p className="mb-3 text-xs text-navy-500">
        Problème pour vous connecter ? Explorez PanoStation en mode démo, sans compte.
      </p>
      <form action={enterDemoMode}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-navy-200 bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-panoryx-blue hover:text-panoryx-blue"
        >
          <Sparkles size={15} aria-hidden="true" />
          Essayer en mode démo
        </button>
      </form>
    </div>
  );
}
