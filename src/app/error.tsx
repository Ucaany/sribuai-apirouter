"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex min-h-[400px] flex-col items-center justify-center gap-4 px-4 text-center">
			<h2 className="font-semibold text-xl">Terjadi kesalahan</h2>
			<p className="text-muted-foreground text-sm">
				Sesuatu berjalan tidak semestinya. Silakan coba lagi.
			</p>
			<Button onClick={reset}>Coba Lagi</Button>
		</div>
	);
}
