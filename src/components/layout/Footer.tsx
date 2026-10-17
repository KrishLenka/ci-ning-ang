import { footer } from "@/content/site";
import { Credit } from "@/components/ui/Credit";

export function Footer() {
  return (
    <footer className="bg-ink px-5 py-6 text-cream sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p className="text-sm text-cream/90">{footer.copyright}</p>
        <Credit className="text-2xl text-cream" />
      </div>
    </footer>
  );
}
