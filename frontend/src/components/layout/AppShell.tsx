
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
      <AppSidebar role={role} />

      <div className="min-w-0 lg:pl-64">
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
