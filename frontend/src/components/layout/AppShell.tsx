
import type { ReactNode } from "react";
import AppSidebar from "./AppSidebar";

type AppShellProps = {
  role: "Administrator" | "Employee";
  children: ReactNode;
};

export default function AppShell({
  role,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F4F7F8]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-[#172C37] focus:shadow-lg"
      >
        Skip to main content
      </a>

      <AppSidebar role={role} />

      <div className="min-w-0 lg:pl-64">
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
