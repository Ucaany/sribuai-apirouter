"use client";

import { useEffect } from "react";

export default function GlobalError({
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
		<html lang="id">
			<body>
				<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
					<h2 className="font-semibold text-xl">Terjadi kesalahan kritis</h2>
					<p className="text-sm">Silakan muat ulang halaman.</p>
					<button
						className="rounded-md border px-4 py-2 text-sm hover:bg-gray-100"
						onClick={reset}
						type="button"
					>
						Muat Ulang
					</button>
				</div>
			</body>
		</html>
	);
}
