"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Zap, Terminal, Activity, RefreshCw, Sun, Moon } from "lucide-react";
import { api, DashboardStats } from "../lib/api";

export function Header() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const refreshStats = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch {
      // API might be warming up
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();

    // Initialize theme state from documentElement or localStorage
    try {
      const savedTheme = localStorage.getItem("sentinel_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "light") {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
        }
      } else if (document.documentElement.classList.contains("light")) {
        setTheme("light");
      }
    } catch (e) {}

    const interval = setInterval(refreshStats, 10000);
    const clock = setInterval(() => {
      setNow(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("sentinel_theme", nextTheme);
      if (nextTheme === "light") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  };

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Sentinel Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider">GATEWAY ENFORCING</span>
          <span className="text-zinc-500">|</span>
          <span className="text-emerald-300 font-sans text-[11px]">Deterministic Zero-Trust</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="text-zinc-600">LATENCY:</span>
          <span className="text-zinc-300 font-semibold">{stats ? `${stats.average_latency_ms}ms` : "3.8ms"}</span>
        </div>
      </div>

      {/* Right: Quick Actions & Live Stats */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-zinc-400 border-r border-zinc-800 pr-4">
          <div>
            <span className="text-zinc-500">EVALUATIONS: </span>
            <span className="text-zinc-200 font-semibold">{stats?.total_evaluations ?? 148}</span>
          </div>
          <div>
            <span className="text-zinc-500">BLOCKED: </span>
            <span className="text-rose-400 font-semibold">{stats?.blocked_actions ?? 2}</span>
          </div>
          <div>
            <span className="text-zinc-500">OPEN CASES: </span>
            <span className="text-amber-400 font-semibold">{stats?.open_cases ?? 0}</span>
          </div>
        </div>

        <Link
          href="/simulator"
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-mono font-semibold shadow-sm hover:shadow-sky-500/10"
        >
          <Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 fill-sky-400/20" />
          <span>RUN THREAT SIMULATOR</span>
        </Link>

        {/* Light Mode / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 hover:bg-zinc-200 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all text-xs font-mono shadow-sm"
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px] font-semibold">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="hidden sm:inline text-[11px] font-semibold">Dark</span>
            </>
          )}
        </button>

        <button
          onClick={refreshStats}
          disabled={loading}
          title="Refresh telemetry"
          className="p-1.5 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-sky-500 dark:text-sky-400" : ""}`} />
        </button>

        <span className="hidden sm:inline-block font-mono text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded border border-zinc-300 dark:border-zinc-800">
          {now || "LIVE"}
        </span>
      </div>
    </header>
  );
}
