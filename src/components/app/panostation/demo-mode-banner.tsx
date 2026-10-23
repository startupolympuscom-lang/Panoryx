import { Sparkles } from "lucide-react";
import { exitDemoMode } from "@/lib/demo/demo-mode";

export function DemoModeBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pulse-orange/30 bg-pulse-orange/10 px-4 py-2 text-sm sm:px-6">
      <span className="flex items-center gap-2 font-semibold text-navy">
        <Sparkles size={14} className="text-pulse-orange" aria-hidden="true" />
        Mode démo — données fictives, non connectées à votre base réelle.
      </span>
      <form action={exitDemoMode}>
        <button type="submit" className="font-semibold text-panoryx-blue hover:underline">
          Quitter la démo
        </button>
      </form>
    </div>
  );
}
