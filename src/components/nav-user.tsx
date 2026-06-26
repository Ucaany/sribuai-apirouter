"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserIcon,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  HelpCircleIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import type { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row']

export function NavUser({ profile }: { profile?: Profile | null }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    if (profile) {
      const seed = (profile as { id?: string }).id || btoa(profile.email).replace(/=/g, '').slice(0, 16)
      setUser({
        name: profile.full_name || profile.email.split('@')[0] || 'User',
        email: profile.email,
        avatar: profile.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
      });
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const seed = data.user.id
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/8.x/thumbs/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!user) {
    return (
      <div className="flex w-full items-center gap-3 px-2 py-2 h-12">
        <div className="size-8 shrink-0 rounded-full bg-muted animate-pulse" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className="h-2.5 w-32 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring transition-colors" />
        }
      >
        <Avatar className="size-8 shrink-0 rounded-full">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-xs font-semibold">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-medium leading-tight text-sidebar-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs leading-tight text-muted-foreground">
            {user.email}
          </p>
        </div>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm text-foreground">{user.name}</p>
            <p className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <UserIcon /> Profil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/subscription" />}>
          <CreditCardIcon /> Subscription
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
          <SettingsIcon /> Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/docs" />}>
          <HelpCircleIcon /> Bantuan
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full cursor-pointer"
          variant="destructive"
          onClick={handleLogout}
        >
          <LogOutIcon /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
