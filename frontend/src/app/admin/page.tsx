"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";

export default function AdminPage() {
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

        if (session.user.role !== "Administrator") {
          router.replace("/dashboard");
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
      <h1>Admin Dashboard</h1>
      <p>Manage IT assets, support tickets, and users.</p>
    </main>
  );
}