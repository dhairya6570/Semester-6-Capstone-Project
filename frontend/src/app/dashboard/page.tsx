"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession();

        if (!session.authenticated || !session.user) {
          router.replace("/login");
          return;
        }

        setIsCheckingSession(false);
      } catch {
        router.replace("/login");
      }
    }

    checkSession();
  }, [router]);

  if (isCheckingSession) {
    return (
      <main>
        <p>Checking session...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Employee Dashboard</h1>
      <p>Welcome to the IT Asset & Support Ticket Management System.</p>
    </main>
  );
}