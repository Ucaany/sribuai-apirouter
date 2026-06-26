"use client";

import { LogoIcon } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/nav-group";
import { adminFooterNavLinks, adminNavGroups } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import { LayoutGridIcon } from "lucide-react";

import type { Database } from "@/types/database";

type Profile = Database['public']['Tables']['profiles']['Row']

export function AdminSidebar({ profile }: { profile?: Profile | null }) {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader className="h-14 justify-center">
        <SidebarMenuButton render={<Link href="/admin" />}>
          <LogoIcon />
          <span className="font-semibold">Admin Panel</span>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {adminNavGroups.map((group, index) => (
          <NavGroup key={`admin-sidebar-group-${index}`} {...group} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {adminFooterNavLinks.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                className="text-muted-foreground"
                size="sm"
                render={<Link href={item.path ?? "#"} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              className="text-muted-foreground"
              size="sm"
              render={<Link href="/dashboard" />}
            >
              <LayoutGridIcon />
              <span>User Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser profile={profile} />
      </SidebarFooter>
    </Sidebar>
  );
}
