import {
  AlertTriangle,
  LayoutDashboard,
  type LucideIcon,
  Map,
  Route,
  Sparkles,
  Ship,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vessels", label: "Vessels", icon: Ship },
  { href: "/fleets", label: "Fleets", icon: Users },
  { href: "/map", label: "Map", icon: Map },
  { href: "/voyages", label: "Voyages", icon: Route },
  { href: "/predictions", label: "Predictions", icon: Sparkles },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
];
