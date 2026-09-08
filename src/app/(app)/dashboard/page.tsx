import { Activity, AlertTriangle, Anchor, Navigation, Ship, WifiOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { VesselTypeChart } from "@/components/dashboard/VesselTypeChart";
import { RecentActivityList } from "@/components/dashboard/RecentActivityList";
import { RecentAlertsList } from "@/components/dashboard/RecentAlertsList";
import { T } from "@/components/shared/T";
import {
  getDashboardStats,
  getRecentActivity,
  getRecentAlerts,
} from "@/lib/data/dashboard";

export default async function DashboardPage() {
  const [stats, recentActivity, recentAlerts] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(8),
    getRecentAlerts(6),
  ]);

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total Vessels" value={stats.totalVessels} icon={Ship} />
        <StatCard
          label="Moving"
          value={stats.moving}
          icon={Navigation}
          accentClassName="bg-emerald-500/15 text-emerald-400"
        />
        <StatCard
          label="Anchored"
          value={stats.anchored}
          icon={Anchor}
          accentClassName="bg-sky-500/15 text-sky-400"
        />
        <StatCard
          label="Stopped"
          value={stats.stopped}
          icon={Activity}
          accentClassName="bg-amber-500/15 text-amber-400"
        />
        <StatCard
          label="Offline"
          value={stats.offline}
          icon={WifiOff}
          accentClassName="bg-slate-500/15 text-slate-400"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium"><T>Vessels by Type</T></CardTitle>
          </CardHeader>
          <CardContent>
            <VesselTypeChart byShipType={stats.byShipType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4" /> <T>Recent Activity</T>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivityList items={recentActivity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="size-4" /> <T>Recent Alerts</T>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAlertsList items={recentAlerts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
