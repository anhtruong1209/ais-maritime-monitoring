import { AppHeader } from "@/components/layout/AppHeader";
import { StatusBar } from "@/components/layout/StatusBar";
import { VesselDetailSheet } from "@/components/vessels/VesselDetailSheet";
import { VesselDetailProvider } from "@/providers/vessel-detail-provider";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <VesselDetailProvider>
      <div className="flex h-dvh flex-col overflow-hidden">
        <AppHeader />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <StatusBar />
      </div>
      <VesselDetailSheet />
    </VesselDetailProvider>
  );
}
