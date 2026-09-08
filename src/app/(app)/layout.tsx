import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { VesselDetailSheet } from "@/components/vessels/VesselDetailSheet";
import { SidebarProvider } from "@/providers/sidebar-provider";
import { VesselDetailProvider } from "@/providers/vessel-detail-provider";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <VesselDetailProvider>
        <div className="flex h-dvh flex-col overflow-hidden">
          <AppHeader />
          <div className="flex min-h-0 flex-1">
            <div className="hidden md:block">
              <AppSidebar />
            </div>
            <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          </div>
          <StatusBar />
        </div>
        <VesselDetailSheet />
      </VesselDetailProvider>
    </SidebarProvider>
  );
}
