import { SiteChrome } from "@/components/site-chrome";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
