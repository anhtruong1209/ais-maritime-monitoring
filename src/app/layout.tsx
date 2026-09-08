import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

// Be Vietnam Pro: designed with full Vietnamese-diacritic coverage and a
// tall x-height that stays legible at the small sizes a data-dense ops
// console relies on. Variable name matches the `--font-sans` theme token
// in globals.css exactly — renaming it silently breaks that mapping.
const fontSans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIS Maritime Monitoring",
  description:
    "Maritime vessel monitoring and trajectory intelligence platform for Vietnamese waters.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${geistMono.variable} h-full antialiased`}
      // The app is single-theme (light) now, so the `dark` class is gone —
      // it was a leftover from the earlier dark palette and did nothing
      // once .dark and :root held the same colors. suppressHydrationWarning
      // is for a separate, unrelated class of warning: browser extensions
      // (Dark Reader, translators, etc.) commonly inject attributes into
      // <html> before hydration, which React then flags as a mismatch even
      // though it's not something this app's code caused.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <TooltipProvider delay={150}>
            {children}
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
