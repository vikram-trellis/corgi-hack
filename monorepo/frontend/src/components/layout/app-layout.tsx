"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, User, Settings, Home, LogOut, Inbox, Mail } from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarInset,
} from "@/components/layout/sidebar";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        <SidebarProvider>
          <div className="flex h-screen">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xl">Corgi Insurance</span>
                  </div>
                  <div className="flex-1" />
                  <SidebarTrigger />
                </div>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === "/"}
                      tooltip="Dashboard"
                    >
                      <Link href="/">
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === "/claims" || pathname.startsWith("/claims/")
                      }
                      tooltip="Claims"
                    >
                      <Link href="/claims">
                        <ClipboardList className="h-5 w-5" />
                        <span>Claims</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === "/inbox" || pathname.startsWith("/inbox/")
                      }
                      tooltip="Inbox"
                    >
                      <Link href="/inbox">
                        <Inbox className="h-5 w-5" />
                        <span>Inbox</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname === "/policyholders" ||
                        pathname.startsWith("/policyholders/")
                      }
                      tooltip="Policyholders"
                    >
                      <Link href="/policyholders">
                        <User className="h-5 w-5" />
                        <span>Policyholders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>

                <SidebarSeparator />

                <SidebarGroup>
                  <SidebarGroupLabel>Settings</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === "/settings"}
                          tooltip="Settings"
                        >
                          <Link href="/settings">
                            <Settings className="h-5 w-5" />
                            <span>Settings</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>AG</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Admin User</span>
                    <span className="text-xs text-gray-500">admin@example.com</span>
                  </div>
                  <div className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Log out</span>
                  </Button>
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset>
              <div className="flex flex-col h-full w-full">
                <header className="border-b border-gray-200 dark:border-gray-800 p-4 w-full">
                  <div className="flex items-center justify-between w-full max-w-full">
                    <div className="flex flex-col">
                      <h1 className="text-xl font-semibold">
                        {pathname === "/" && "Dashboard"}
                        {pathname === "/claims" && "Claims"}
                        {pathname === "/inbox" && "Inbox"}
                        {pathname === "/policyholders" && "Policyholders"}
                        {pathname === "/settings" && "Settings"}
                      </h1>
                      {pathname === "/inbox" && (
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 font-mono">
                            test@sandbox52877c6747fa4aa6a31c2bf1d48ed332.mailgun.org
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </header>
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
