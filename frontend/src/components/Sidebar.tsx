"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Shield,
  LayoutDashboard,
  Zap,
  FolderGit2,
  Bot,
  Terminal,
  FileCheck,
  Cpu,
  Lock,
  Flame,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Security Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Attack Simulator",
    href: "/simulator",
    icon: Zap,
    badge: "5 ATTACKS",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  {
    label: "Forensic Cases",
    href: "/cases",
    icon: FolderGit2,
    badge: "LIVE",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    label: "Fleet Agents",
    href: "/agents",
    icon: Bot,
  },
  {
    label: "Sessions & Logs",
    href: "/sessions",
    icon: Terminal,
  },
  {
    label: "Security Policies",
    href: "/policies",
    icon: FileCheck,
    badge: "STRICT",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    label: "Tools & MCP Registry",
    href: "/tools",
    icon: Cpu,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Logo / Branding */}
        <div className="h-14 border-b border-zinc-800 px-5 flex items-center gap-3 bg-zinc-900/30">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Shield className="w-4 h-4 fill-sky-400/20" />
          </div>
          <div>
            <div className="font-mono text-sm font-bold tracking-wider text-zinc-100 flex items-center gap-1.5">
              <span>AGENT SENTINEL</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 tracking-tight uppercase">
              Runtime Security & Forensics
            </div>
          </div>
        </div>

        {/* Navigation Group */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
            Security Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group",
                  isActive
                    ? "bg-sky-500/10 text-sky-300 border border-sky-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={clsx(
                      "w-4 h-4 transition-colors",
                      isActive ? "text-sky-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={clsx(
                      "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border",
                      item.badgeColor || "bg-zinc-800 text-zinc-400 border-zinc-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Info: Architecture Guarantee */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/20">
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-medium mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>ENFORCEMENT ACTIVE</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
            Deterministic zero-trust engine sitting inline between agents and tools.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
            <span>VERSION 1.0.0</span>
            <span className="text-zinc-400 font-medium">FAST-PATH ON</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
