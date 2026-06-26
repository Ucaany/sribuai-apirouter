"use client";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { StarIcon, CheckIcon, ZapIcon } from "lucide-react";

type Plan = {
	name: string;
	info: string;
	price: number;
	features: string[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
	badge?: string;
};

const plans: Plan[] = [
	{
		name: "Starter",
		info: "Untuk penggunaan ringan",
		price: 10000,
		features: [
			"40 juta token / 24 jam",
			"Semua 37+ model AI",
			"Endpoint OpenAI-compatible",
			"API key management",
			"Usage dashboard",
			"Bayar via QRIS",
		],
		btn: {
			text: "Beli Sekarang",
			href: "/register",
		},
	},
	{
		highlighted: true,
		badge: "Paling Populer",
		name: "Pro",
		info: "Untuk developer aktif",
		price: 15900,
		features: [
			"80 juta token / 24 jam",
			"Semua 37+ model AI",
			"Endpoint OpenAI-compatible",
			"API key management",
			"Usage analytics lengkap",
			"Bayar via QRIS",
			"2x lebih banyak token",
		],
		btn: {
			text: "Beli Sekarang",
			href: "/register",
		},
	},
	{
		badge: "Best Value",
		name: "Ultra",
		info: "Untuk penggunaan intensif",
		price: 20000,
		features: [
			"150 juta token / 24 jam",
			"Semua 37+ model AI",
			"Endpoint OpenAI-compatible",
			"API key management",
			"Usage analytics lengkap",
			"Bayar via QRIS",
			"Best value per token",
		],
		btn: {
			text: "Beli Sekarang",
			href: "/register",
		},
	},
];

export function PricingSection() {
	return (
		<div className="flex w-full flex-col items-center justify-center space-y-10 p-4">
			<div className="mx-auto max-w-2xl space-y-4 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
					<ZapIcon className="size-4 text-primary" />
					Paket Harian
				</div>
				<h2 className="font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
					Pilih Paket yang <span className="font-serif">Sesuai</span>
				</h2>
				<p className="text-muted-foreground text-base md:text-lg">
					Semua paket akses penuh ke <span className="font-serif">37+ model AI premium</span>. Durasi 24 jam dari waktu pembayaran dikonfirmasi. Bayar via QRIS tanpa kartu kredit.
				</p>
			</div>

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
				{plans.map((plan, idx) => (
					<PricingCard key={plan.name} plan={plan} index={idx} />
				))}
			</div>

			<p className="text-center text-muted-foreground text-sm">
				Semua harga dalam Rupiah (IDR). Butuh paket enterprise?{" "}
				<Link href="/contact" className="text-primary underline-offset-4 hover:underline">
					Hubungi kami
				</Link>
			</p>
		</div>
	);
}

type PricingCardProps = {
	plan: Plan;
	index: number;
};

export function PricingCard({ plan, index }: PricingCardProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.1 }}
			viewport={{ once: true }}
			className={cn(
				"relative flex w-full flex-col rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md",
				plan.highlighted && "border-primary shadow-lg scale-[1.02] md:scale-105"
			)}
		>
			{plan.badge && (
				<div className="flex justify-center">
					<div
						className={cn(
							"-mt-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shadow-sm",
							plan.highlighted
								? "bg-primary text-primary-foreground"
								: "bg-muted text-foreground border"
						)}
					>
						{plan.highlighted && <StarIcon className="size-3 fill-current" />}
						{plan.badge}
					</div>
				</div>
			)}

			<div className={cn("p-6", plan.badge ? "pt-3" : "pt-6")}>
				<h3 className="mb-2 font-semibold text-2xl">{plan.name}</h3>
				<p className="mb-6 text-muted-foreground text-sm">{plan.info}</p>

				<div className="mb-6">
					<div className="flex items-baseline gap-1">
						<span className="font-bold text-4xl">
							{new Intl.NumberFormat("id-ID", {
								style: "currency",
								currency: "IDR",
								maximumFractionDigits: 0,
							}).format(plan.price)}
						</span>
						<span className="text-muted-foreground text-sm">/24 jam</span>
					</div>
					<p className="mt-1 text-muted-foreground text-xs">
						Aktif dari waktu pembayaran
					</p>
				</div>

				<Button
					className="mb-6 w-full"
					variant={plan.highlighted ? "default" : "outline"}
					size="lg"
					render={<Link href={plan.btn.href} />}
					nativeButton={false}
				>
					{plan.btn.text}
				</Button>

				<div className="space-y-3">
					{plan.features.map((feature) => (
						<div className="flex items-start gap-3" key={feature}>
							<CheckIcon className="mt-0.5 size-5 shrink-0 text-primary" />
							<span className="text-sm">{feature}</span>
						</div>
					))}
				</div>
			</div>
		</motion.div>
	);
}
