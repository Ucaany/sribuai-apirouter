"use client";

import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { NavUser } from "@/components/nav-user";
import { NotificationBell } from "@/components/notification-bell";
import { usePathname } from "next/navigation";
import { navLinks, adminNavGroups, footerNavLinks } from "@/components/app-shared";
import type { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row']

export function AppHeader({ profile }: { profile?: Profile | null }) {
	const pathname = usePathname();

	const allLinks = [
		...navLinks,
		...adminNavGroups.flatMap((g) => g.items),
		...footerNavLinks,
	];
	const activeItem = allLinks.find((item) => item.path === pathname);

	return (
		<header className="flex items-center justify-between gap-2 border-b bg-background px-4 py-3 md:px-6 shrink-0">
			<div className="flex items-center gap-3 min-w-0">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-2 shrink-0">
				<NotificationBell />
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser profile={profile} />
			</div>
		</header>
	);
}
