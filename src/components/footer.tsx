import { GithubIcon } from "@/components/github-icon";
import { InstagramIcon } from "@/components/instagram-icon";
import { XIcon } from "@/components/x-icon";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function Footer() {
	return (
		<footer className="relative w-full border-t">
			<div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-12">
					<div className="md:col-span-5">
						<a className="inline-block" href="/">
							<Logo className="h-6" />
						</a>
						<p className="mt-4 max-w-md text-muted-foreground text-sm leading-relaxed">
							Akses 37+ model AI premium melalui satu API OpenAI-compatible. Bayar via QRIS, mulai dari paket harian.
						</p>
						<div className="mt-6 flex gap-2">
							{socialLinks.map((item, index) => (
								<Button
									key={`social-${item.link}-${index}`}
									size="icon"
									variant="outline"
									render={<a href={item.link} target="_blank" rel="noopener noreferrer" />}
									nativeButton={false}
								>
									{item.icon}
								</Button>
							))}
						</div>
					</div>

					<div className="md:col-span-7">
						<div className="grid grid-cols-2 gap-8">
							<div>
								<h3 className="mb-4 font-semibold text-foreground text-sm">Sumber Daya</h3>
								<ul className="space-y-3">
									{resources.map(({ href, title }) => (
										<li key={title}>
											<a
												className="text-muted-foreground text-sm transition-colors hover:text-foreground"
												href={href}
											>
												{title}
											</a>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h3 className="mb-4 font-semibold text-foreground text-sm">Perusahaan</h3>
								<ul className="space-y-3">
									{company.map(({ href, title }) => (
										<li key={title}>
											<a
												className="text-muted-foreground text-sm transition-colors hover:text-foreground"
												href={href}
											>
												{title}
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>

				<div className="mt-12 border-t pt-8">
					<p className="text-center text-muted-foreground text-sm">
						&copy; {new Date().getFullYear()} Sribuai APIRouter. Seluruh hak cipta dilindungi.
					</p>
				</div>
			</div>
		</footer>
	);
}

const company = [
	{
		title: "Tentang Kami",
		href: "/tentang",
	},
	{
		title: "Karir",
		href: "/karir",
	},
	{
		title: "Kebijakan Privasi",
		href: "/privacy",
	},
	{
		title: "Syarat & Ketentuan",
		href: "/terms",
	},
];

const resources = [
	{
		title: "Dokumentasi",
		href: "/docs",
	},
	{
		title: "Model AI",
		href: "/#models",
	},
	{
		title: "Harga",
		href: "/#pricing",
	},
	{
		title: "FAQ",
		href: "/#faq",
	},
	{
		title: "Status API",
		href: "/status",
	},
];

const socialLinks = [
	{
		icon: <GithubIcon />,
		link: "#",
	},
	{
		icon: <InstagramIcon />,
		link: "#",
	},
	{
		icon: <XIcon />,
		link: "#",
	},
];
