"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/desktop-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserIcon, CreditCardIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserInfo = { name: string; email: string; avatar: string } | null | undefined;

export function Header() {
	const scrolled = useScroll(10);
	const [userInfo, setUserInfo] = useState<UserInfo>(undefined);
	const router = useRouter();
	const supabase = createClient();

	useEffect(() => {
		supabase.auth.getUser().then(({ data }) => {
			if (data.user) {
				const seed = data.user.id;
				setUserInfo({
					name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
					email: data.user.email || "",
					avatar: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
				});
			} else {
				setUserInfo(null);
			}
		});
	}, []);

	async function handleLogout() {
		await supabase.auth.signOut();
		router.push("/login");
	}

	return (
		<header
			className={cn("sticky top-0 z-50 w-full border-transparent border-b", {
				"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50":
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
				<div className="flex items-center gap-5">
			<a
					className="rounded-lg px-3 py-2.5 hover:bg-muted dark:hover:bg-muted/50"
					href="/"
				>
					<Logo className="h-4" />
				</a>
					<DesktopNav />
				</div>
				<div className="hidden items-center gap-2 md:flex">
					{userInfo === (undefined as unknown as UserInfo) ? (
						<div className="size-8 rounded-full bg-muted animate-pulse" />
					) : userInfo ? (
						<DropdownMenu>
							<DropdownMenuTrigger render={<button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />}>
								<Avatar className="size-8">
									<AvatarImage src={userInfo.avatar} />
									<AvatarFallback className="text-xs font-semibold">{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-60">
								<div className="flex items-center gap-3 px-2 py-2">
									<Avatar className="size-10">
										<AvatarImage src={userInfo.avatar} />
										<AvatarFallback>{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
									</Avatar>
									<div className="min-w-0">
										<p className="font-medium text-sm text-foreground truncate">{userInfo.name}</p>
										<p className="text-xs text-muted-foreground truncate">{userInfo.email}</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href="/dashboard" />}>
									<UserIcon /> Dashboard
								</DropdownMenuItem>
								<DropdownMenuItem render={<Link href="/dashboard/subscription" />}>
									<CreditCardIcon /> Subscription
								</DropdownMenuItem>
								<DropdownMenuItem render={<Link href="/dashboard/settings" />}>
									<SettingsIcon /> Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="w-full cursor-pointer" variant="destructive" onClick={handleLogout}>
									<LogOutIcon /> Keluar
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button variant="outline" render={<a href="/login" />} nativeButton={false}>Login</Button>
							<Button render={<a href="/register" />} nativeButton={false}>Mulai Gratis</Button>
						</>
					)}
				</div>
				<MobileNav userInfo={userInfo} onLogout={handleLogout} />
			</nav>
		</header>
	);
}
