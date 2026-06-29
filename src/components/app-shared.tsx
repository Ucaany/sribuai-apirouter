import type { ReactNode } from "react";
import {
  LayoutGridIcon,
  KeyIcon,
  BarChart3Icon,
  CpuIcon,
  CreditCardIcon,
  ShoppingCartIcon,
  SettingsIcon,
  HelpCircleIcon,
  ActivityIcon,
  UsersIcon,
  ShieldAlertIcon,
  ReceiptIcon,
  SlidersIcon,
  TagIcon,
  WebhookIcon,
  FlaskConicalIcon,
  BellIcon,
} from "lucide-react";

export type SidebarNavItem = {
  title: string;
  path?: string;
  icon?: ReactNode;
  isActive?: boolean;
  subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
  {
    label: "Utama",
    items: [
      {
        title: "Overview",
        path: "/dashboard",
        icon: <LayoutGridIcon />,
        isActive: true,
      },
      {
        title: "API Keys",
        path: "/dashboard/api-keys",
        icon: <KeyIcon />,
      },
      {
        title: "Usage",
        path: "/dashboard/usage",
        icon: <BarChart3Icon />,
      },
      {
        title: "Models",
        path: "/dashboard/models",
        icon: <CpuIcon />,
      },
      {
        title: "Playground",
        path: "/dashboard/playground",
        icon: <FlaskConicalIcon />,
      },
    ],
  },
  {
    label: "Billing",
    items: [
      {
        title: "Subscription",
        path: "/dashboard/subscription",
        icon: <CreditCardIcon />,
      },
      {
        title: "Beli Paket",
        path: "/dashboard/topup",
        icon: <ShoppingCartIcon />,
      },
    ],
  },
];

export const footerNavLinks: SidebarNavItem[] = [
  {
    title: "Bantuan",
    path: "/docs",
    icon: <HelpCircleIcon />,
  },
  {
    title: "Settings",
    path: "/dashboard/settings",
    icon: <SettingsIcon />,
  },
];

export const adminNavGroups: SidebarNavGroup[] = [
  {
    label: "Admin",
    items: [
      {
        title: "Dashboard",
        path: "/admin",
        icon: <LayoutGridIcon />,
        isActive: true,
      },
      {
        title: "Users",
        path: "/admin/users",
        icon: <UsersIcon />,
      },
      {
        title: "Transactions",
        path: "/admin/transactions",
        icon: <ReceiptIcon />,
      },
      {
        title: "Usage Analytics",
        path: "/admin/usage",
        icon: <BarChart3Icon />,
      },
    ],
  },
  {
    label: "Konfigurasi",
    items: [
      {
        title: "Models",
        path: "/admin/models",
        icon: <CpuIcon />,
      },
      {
        title: "Settings",
        path: "/admin/settings",
        icon: <SlidersIcon />,
      },
      {
        title: "Promo Codes",
        path: "/admin/promos",
        icon: <TagIcon />,
      },
      {
        title: "Notifikasi",
        path: "/admin/notifications",
        icon: <BellIcon />,
      },
    ],
  },
  {
    label: "Monitoring",
    items: [
      {
        title: "Webhook Logs",
        path: "/admin/logs",
        icon: <WebhookIcon />,
      },
      {
        title: "Fraud Detection",
        path: "/admin/fraud",
        icon: <ShieldAlertIcon />,
      },
    ],
  },
];

export const adminFooterNavLinks: SidebarNavItem[] = [
  {
    title: "Platform Status",
    path: "/api/internal/health",
    icon: <ActivityIcon />,
  },
];

export const navLinks: SidebarNavItem[] = [
  ...navGroups.flatMap((group) =>
    group.items.flatMap((item) =>
      item.subItems?.length ? [item, ...item.subItems] : [item]
    )
  ),
  ...footerNavLinks,
];
