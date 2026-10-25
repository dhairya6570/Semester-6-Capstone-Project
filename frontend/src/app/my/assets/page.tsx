"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getMyAssets, type AssignedAsset } from "@/lib/api/assets";
import AppShell from "@/components/layout/AppShell";

function formatAssignedDate(value: string | null | undefined) {
  if (!value) return "Not available";

  const dateOnly = value.slice(0, 10);
  const parts = dateOnly.split("-").map(Number);

  if (parts.length !== 3) return value;

  const [year, month, day] = parts;

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return value;
  }

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function MyAssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<AssignedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyAssets() {
      try {
        const session = await getSession();

        if (!session.authenticated || !session.user) {
          router.replace("/login");
          return;
        }

        if (session.user.role !== "Employee") {
          router.replace("/admin");
          return;
        }

        setIsAuthorized(true);
        const assignedAssets = await getMyAssets();
        setAssets(assignedAssets);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your assigned assets."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMyAssets();
  }, [router]);

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#526672]">
          {isLoading ? "Checking session..." : "Redirecting..."}
        </p>
      </main>
    );
  }

  return (
    <AppShell role="Employee">
      <div className="space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Employee Workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            My Assigned Assets
          </h1>
          <p className="mt-3 text-base text-[#526672]">
            View the IT equipment currently assigned to you.
          </p>
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
          >
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-[#101F2B]">
              Assigned Equipment
            </h2>
            <p className="mt-2 text-sm text-[#526672]">
              {isLoading
                ? "Loading your assigned equipment..."
                : `${assets.length} ${
                    assets.length === 1 ? "asset" : "assets"
                  } currently assigned to you.`}
            </p>
          </div>

          {isLoading ? (
            <div className="px-6 py-10 sm:px-8">
              <p role="status" className="text-sm text-[#526672]">
                Loading your assigned assets...
              </p>
            </div>
          ) : error ? (
            <div className="px-6 py-10 sm:px-8">
              <p className="text-sm text-[#526672]">
                Your assigned assets could not be displayed.
              </p>
            </div>
          ) : assets.length === 0 ? (
            <div className="px-6 py-12 text-center sm:px-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E4F4EF] text-[#087F70]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-7 w-7"
                >
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-bold text-[#101F2B]">
                No assigned assets
              </h3>
              <p className="mt-2 text-sm text-[#526672]">
                You currently have no IT equipment assigned to you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#F4F7F8] text-xs uppercase tracking-wide text-[#526672]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold sm:pl-8"
                    >
                      Asset Code
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Asset Name
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Asset Type
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Serial Number
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      Assigned Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 font-semibold sm:pr-8"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E9EC]">
                  {assets.map((asset) => (
                    <tr
                      key={asset.assignment_id}
                      className="hover:bg-[#F8FAFA]"
                    >
                      <td className="whitespace-nowrap px-6 py-5 font-bold text-[#087F70] sm:pl-8">
                        {asset.asset_code}
                      </td>
                      <td className="px-6 py-5 font-semibold text-[#101F2B]">
                        {asset.asset_name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-[#405462]">
                        {asset.asset_type}
                      </td>
                      <td className="px-6 py-5 text-[#405462]">
                        {asset.serial_number}
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-[#405462]">
                        {formatAssignedDate(asset.assigned_date)}
                      </td>
                      <td className="px-6 py-5 sm:pr-8">
                        <span className="inline-flex rounded-full bg-[#E7F0FF] px-3 py-1 text-xs font-semibold text-[#2458A6]">
                          {asset.assignment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <Link
          href="/dashboard"
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-6 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8]"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </AppShell>
  );
}