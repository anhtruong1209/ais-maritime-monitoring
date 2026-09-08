"use client";

import { useLocale } from "@/providers/locale-provider";

/** Translates a static English string inline, so a Server Component page
 * can have translated headings/labels without itself becoming a Client
 * Component (locale is client-side state — see LocaleProvider). */
export function T({ children }: { children: string }) {
  const { t } = useLocale();
  return t(children);
}
