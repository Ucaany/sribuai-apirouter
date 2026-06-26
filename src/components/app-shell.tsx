import { AppHeader } from "@/components/app-header";
import type { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row']

export function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile | null }) {
	return (
		<>
			<AppHeader profile={profile} />
			<div className="flex flex-col gap-4 p-4 md:p-6 flex-1 min-h-0 overflow-y-auto">
				{children}
			</div>
		</>
	);
}
