
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

type UserRole = "Administrator" | "Employee";

type AppSidebarProps = {
  role: UserRole;
};

type NavigationItem = {
  label: string;
  href: string;
  icon: "dashboard" | "tickets" | "plus" | "assets" | "profile";
};

const adminNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Manage Tickets", href: "/admin/tickets", icon: "tickets" },
  { label: "Manage Assets", href: "/admin/assets", icon: "assets" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

const employeeNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "My Tickets", href: "/tickets", icon: "tickets" },
  { label: "Create Ticket", href: "/tickets/new", icon: "plus" },
  { label: "My Assets", href: "/my/assets", icon: "assets" },
  { label: "Profile", href: "/profile", icon: "profile" },
];

function NavigationIcon({
  name,
}: {
  name: NavigationItem["icon"];
}) {
  const common = {
    className: "h-5 w-5 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "tickets":
      return (
        <svg {...common}>
          <path d="M4 5h16v14H4z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );

    case "assets":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M8 21h8M12 18v3" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
  }
}

export default function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const navigation =
    role === "Administrator"
      ? adminNavigation
      : employeeNavigation;

  function isActiveLink(href: string) {
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href;
    }

    if (href === "/tickets") {
      return pathname === "/tickets" ||
        (pathname.startsWith("/tickets/") &&
          !pathname.startsWith("/tickets/new"));
    }

    if (href === "/tickets/new") {
      return pathname === "/tickets/new";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setLogoutError("");
    setIsLoggingOut(true);

    try {
      await logout();

      setIsMobileOpen(false);
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="flex items-center justify-between bg-[#101F2B] px-5 py-4 text-white lg:hidden">
        <Link
          href={role === "Administrator" ? "/admin" : "/dashboard"}
          className="flex items-center gap-3 font-bold"
          onClick={() => setIsMobileOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#087F70] text-sm">
            IT
          </span>
          <span>IT ServiceDesk</span>
        </Link>

        <button
          type="button"
          aria-label={
            isMobileOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-lg border border-white/30 p-2 text-white"
        >
          {isMobileOpen ? (
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      <aside
        id="mobile-navigation"
        className={`z-30 w-full bg-[#101F2B] text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col ${
          isMobileOpen ? "block" : "hidden lg:flex"
        }`}
      >
        <div className="hidden items-center gap-3 border-b border-white/10 px-6 py-7 lg:flex">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087F70] font-bold">
            IT
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">
              IT ServiceDesk
            </p>
            <p className="text-xs text-[#C7D5DB]">
              Support &amp; Assets
            </p>
          </div>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#C7D5DB]">
            Workspace
          </p>
          <p className="mt-2 text-sm font-medium text-white">
            {role === "Administrator"
              ? "IT Administrator"
              : "Employee"}
          </p>
        </div>

        <nav
          aria-label="Main navigation"
          className="space-y-1 px-3 py-5 lg:flex-1"
        >
          {navigation.map((item) => {
            const isActive = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#087F70] text-white"
                    : "text-[#C7D5DB] hover:bg-[#1C3945] hover:text-white"
                }`}
              >
                <NavigationIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          {logoutError && (
            <p role="alert" className="mb-3 text-sm">
              {logoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-[#F5C4C9] transition-colors hover:bg-white/10 disabled:opacity-60"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 17l5-5-5-5M15 12H3" />
              <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
            </svg>
            {isLoggingOut ? "Logging out..." : "Log Out"}
          </button>

          <p className="mt-4 px-4 text-xs text-[#C7D5DB]">
            IT ServiceDesk
          </p>
        </div>
      </aside>
    </>
  );
}
