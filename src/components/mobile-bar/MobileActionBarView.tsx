import { MessageCircle, Phone } from "lucide-react";

type MobileActionBarViewProps = {
  whatsappLink: string;
  phoneLink: string;
};

/**
 * Fixed bottom action bar for small screens. The site layout reserves matching
 * bottom padding so it never covers page content.
 */
function MobileActionBarView({
  whatsappLink,
  phoneLink,
}: MobileActionBarViewProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <nav aria-label="Quick contact" className="grid grid-cols-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2 bg-primary text-sm font-medium text-primary-foreground"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          WhatsApp
        </a>
        <a
          href={phoneLink}
          className="flex h-14 items-center justify-center gap-2 border-l border-border text-sm font-medium"
        >
          <Phone className="size-4" aria-hidden="true" />
          Call
        </a>
      </nav>
    </div>
  );
}

export { MobileActionBarView };
export type { MobileActionBarViewProps };
