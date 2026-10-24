import type { MetadataRoute } from "next";
import { pages } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", ...Object.keys(pages), "contato", "agendar-apresentacao"].map(
    (p) => ({
      url: `${base}/${p}`,
      changeFrequency: "monthly",
      priority: p ? 0.7 : 1,
    }),
  );
}
