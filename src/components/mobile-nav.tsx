import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "@/components/ui/button";
import { Portal, PortalBackdrop } from "@/components/portal";
import { companyLinks, companyLinks2, productLinks } from "@/components/nav-links";
import { LinkItem } from "@/components/sheard";
import { XIcon, MenuIcon, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserInfo = { name: string; email: string; avatar: string } | null;

interface MobileNavProps {
	userInfo?: UserInfo;
	onLogout?: () => void;
}

export function MobileNav({ userInfo, onLogout }: MobileNavProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				<div
					className={cn(
						"transition-all",
						open ? "scale-100 opacity-100" : "scale-0 opacity-0"
					)}
				>
					<XIcon />
				</div>
				<div
					className={cn(
						"absolute transition-all",
						open ? "scale-0 opacity-0" : "scale-100 opacity-100"
					)}
				>
					<MenuIcon />
				</div>
			</Button>
			{open && (
				<Portal className="top-14">
					<PortalBackdrop />
					<div
						className={cn(
							"size-full overflow-y-auto p-4",
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="flex w-full flex-col gap-y-2">
							<span className="text-sm">Produk</span>
							{productLinks.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`product-${link.label}`}
									{...link}
								/>
							))}
							<span className="text-sm">Perusahaan</span>
							{companyLinks.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`company-${link.label}`}
									{...link}
								/>
							))}
							{companyLinks2.map((link) => (
								<LinkItem
									className="rounded-lg p-2 active:bg-muted dark:active:bg-muted/50"
									key={`company-${link.label}`}
									{...link}
								/>
							))}
						</div>
						<div className="mt-5 flex flex-col gap-2">
							{userInfo ? (
								<>
									<div className="flex items-center gap-3 rounded-lg border px-3 py-2">
										<Avatar className="size-8 shrink-0">
											<AvatarImage src={userInfo.avatar} />
											<AvatarFallback className="text-xs font-semibold">{userInfo.name.charAt(0).toUpperCase()}</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">{userInfo.name}</p>
											<p className="truncate text-xs text-muted-foreground">{userInfo.email}</p>
										</div>
									</div>
									<Button className="w-full" variant="outline" render={<a href="/dashboard" />} nativeButton={false}>Dashboard</Button>
									<Button className="w-full" variant="destructive" onClick={onLogout}>
										<LogOutIcon className="size-4" /> Keluar
									</Button>
								</>
							) : (
								<>
									<Button className="w-full" variant="outline" render={<a href="/login" />} nativeButton={false}>Login</Button>
									<Button className="w-full" render={<a href="/register" />} nativeButton={false}>Mulai Gratis</Button>
								</>
							)}
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
