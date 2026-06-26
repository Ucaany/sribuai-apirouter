import { cn } from "@/lib/utils";

export function FullWidthDivider({
	position = "bottom",
	className,
}: {
	position?: "top" | "bottom";
	className?: string;
}) {
	return (
		<div
			className={cn(
				"absolute left-1/2 w-screen -translate-x-1/2 border-t",
				position === "top" ? "top-0" : "bottom-0",
				className
			)}
		/>
	);
}
