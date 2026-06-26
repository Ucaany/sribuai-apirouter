import { Button } from "@/components/ui/button";
import { DecorIcon } from "@/components/decor-icon";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export function CallToAction() {
	return (
		<div className="relative mx-auto flex w-full max-w-3xl flex-col justify-between gap-y-4 border-y px-4 py-8 dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.08),transparent)]">
			<DecorIcon className="size-4" position="top-left" />
			<DecorIcon className="size-4" position="top-right" />
			<DecorIcon className="size-4" position="bottom-left" />
			<DecorIcon className="size-4" position="bottom-right" />

			<div className="pointer-events-none absolute -inset-y-6 -left-px w-px border-l" />
			<div className="pointer-events-none absolute -inset-y-6 -right-px w-px border-r" />

			<div className="absolute top-0 left-1/2 -z-10 h-full border-l border-dashed" />

			<h2 className="text-center font-semibold text-xl md:text-3xl">
				Mulai Coding dengan <span className="font-serif">AI Premium</span> Sekarang
			</h2>
			<p className="text-balance text-center font-medium text-muted-foreground text-sm md:text-base">
				<span className="font-serif">Gratis</span>. Tidak perlu kartu kredit. Setup dalam 2 menit. Akses <span className="font-serif">37+ model AI premium</span> via satu API.
			</p>

			<div className="flex items-center justify-center gap-2">
				<Button variant="outline" render={<Link href="/docs" />} nativeButton={false}>Lihat Dokumentasi</Button>
				<Button render={<Link href="/register" />} nativeButton={false}>
					Daftar Gratis{" "}
					<ArrowRightIcon data-icon="inline-end" />
				</Button>
			</div>
		</div>
	);
}
