import type { LinkItemType } from "@/components/sheard";
import { ZapIcon, ShieldIcon, BarChart3Icon, RefreshCwIcon, CreditCardIcon, Code2Icon, BookOpenIcon, FileTextIcon, RotateCcwIcon, HelpCircleIcon, UsersIcon, StarIcon } from "lucide-react";

export const productLinks: LinkItemType[] = [
	{
		label: "37+ Model AI",
		href: "/models",
		description: "Claude, GPT-4, Gemini, DeepSeek dan banyak lagi",
		icon: <ZapIcon />,
	},
	{
		label: "OpenAI Compatible",
		href: "/docs",
		description: "Drop-in replacement, ganti 1 baris kode",
		icon: <Code2Icon />,
	},
	{
		label: "Usage Dashboard",
		href: "/dashboard",
		description: "Pantau token, request, dan cost realtime",
		icon: <BarChart3Icon />,
	},
	{
		label: "Auto Fallback",
		href: "#features",
		description: "Otomatis fallback jika satu model gagal",
		icon: <RefreshCwIcon />,
	},
	{
		label: "API Key Manager",
		href: "/dashboard/api-keys",
		description: "IP whitelist, expiry, dan usage monitoring",
		icon: <ShieldIcon />,
	},
	{
		label: "Bayar via QRIS",
		href: "#pricing",
		description: "Topup lokal tanpa kartu kredit internasional",
		icon: <CreditCardIcon />,
	},
];

export const companyLinks: LinkItemType[] = [
	{
		label: "Dokumentasi",
		href: "/docs",
		description: "Panduan integrasi dan referensi API",
		icon: <BookOpenIcon />,
	},
	{
		label: "Model List",
		href: "/models",
		description: "Lihat semua model AI yang tersedia",
		icon: <StarIcon />,
	},
	{
		label: "Tentang Kami",
		href: "#",
		description: "Cerita di balik Sribuai APIRouter",
		icon: <UsersIcon />,
	},
];

export const companyLinks2: LinkItemType[] = [
	{
		label: "API Reference",
		href: "/docs/api",
		icon: <FileTextIcon />,
	},
	{
		label: "Privacy Policy",
		href: "#",
		icon: <ShieldIcon />,
	},
	{
		label: "Refund Policy",
		href: "#",
		icon: <RotateCcwIcon />,
	},
	{
		label: "Help Center",
		href: "#",
		icon: <HelpCircleIcon />,
	},
];
