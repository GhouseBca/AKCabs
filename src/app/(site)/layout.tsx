import { Suspense } from "react";
import { Footer } from "@/components/footer/Footer";
import { MobileActionBar } from "@/components/mobile-bar/MobileActionBar";
import { MobileActionBarView } from "@/components/mobile-bar/MobileActionBarView";
import { Navbar } from "@/components/navbar/Navbar";
import { getPhoneLink, getWhatsAppLink } from "@/lib/whatsapp";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-svh flex-col pb-[calc(3.5rem_+_env(safe-area-inset-bottom))] md:pb-0">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer />
      <Suspense
        fallback={
          <MobileActionBarView
            whatsappLink={getWhatsAppLink()}
            phoneLink={getPhoneLink()}
          />
        }
      >
        <MobileActionBar />
      </Suspense>
    </div>
  );
}
