import { MotionConfig } from "framer-motion";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </MotionConfig>
  );
}
