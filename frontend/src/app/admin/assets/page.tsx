
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getAssets, type Asset } from "@/lib/api/assets";
import AppShell from "@/components/layout/AppShell";

function getAssignmentStatusClass(status: string | null) {
  switch (status) {
    case "Assigned":
      return "bg-[#E7F0FF] text-[#2458A6]";
    case "Available":
      return "bg-[#E4F4EF] text-[#086B55]";
    default:
      return "bg-[#E9EEF1] text-[#435662]";
  }
}

function formatPurchaseDate(value: string | null) {
  if (!value) {
    return "Not provided";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

export default function AdminAssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssets() {
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

        setIsAuthorized(true);

        const assetData = await getAssets();
        setAssets(assetData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assets."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAssets();
  }, [router]);

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#405462]">
          Checking session...
        </p>
      </main>
    );
  }

  return (
    <AppShell role="Administrator">
      <div className="space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Administrator Workspace
          </p>

          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
                Asset Management
              </h1>

              <p className="mt-3 text-base text-[#526672]">
                View and manage IT assets registered in the system.
              </p>
            </div>

            <Link
              href="/admin/assets/new"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#06695D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F70]"
            >
              + Create Asset
            </Link>
          </div>
        </header>

        <section
          aria-labelledby="asset-list-heading"
          className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E1E9EC] px-6 py-5">
            <div>
              <h2
                id="asset-list-heading"
                className="text-lg font-bold text-[#101F2B]"
              >
                Registered Assets
              </h2>

              <p className="mt-1 text-sm text-[#526672]">
                Inventory of IT equipment and its assignment status.
              </p>
            </div>

            {!isLoading && !error && (
              <span className="rounded-full bg-[#E4F4EF] px-3 py-1 text-xs font-semibold text-[#086B55]">
                {assets.length}{" "}
                {assets.length === 1 ? "Asset" : "Assets"}
              </span>
            )}
          </div>

          {error && (
            <div className="p-6">
              <p
                role="alert"
                className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-4 py-3 text-sm text-[#B4233B]"
              >
                {error}
              </p>
            </div>
          )}

          {isLoading && (
            <div className="px-6 py-12 text-center">
              <p role="status" className="text-sm text-[#526672]">
                Loading assets...
              </p>
            </div>
          )}

          {!isLoading && !error && assets.length === 0 && (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E4F4EF] text-[#087F70]">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#101F2B]">
                No assets registered yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#526672]">
                Create your first IT asset to start building the
                equipment inventory.
              </p>

              <Link
                href="/admin/assets/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#087F70] px-5 py-3 text-sm font-semibold text-white hover:bg-[#06695D]"
              >
                Create First Asset
              </Link>
            </div>
          )}

          {!isLoading && !error && assets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-[#F4F7F8] text-xs uppercase tracking-wider text-[#526672]">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Asset Code
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Name
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Type
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Serial Number
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Purchase Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#E1E9EC]">
                  {assets.map((asset) => {
                    const status =
                      asset.assignment_status ?? "Available";

                    return (
                      <tr
                        key={asset.id}
                        className="transition-colors hover:bg-[#F8FAFB]"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#526672]">
                          {asset.asset_code}
                        </td>

                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/assets/${asset.id}`}
                            className="font-semibold text-[#087F70] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F70]"
                          >
                            {asset.asset_name}
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-[#405462]">
                          {asset.asset_type}
                        </td>

                        <td className="px-5 py-4 text-[#405462]">
                          {asset.serial_number}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getAssignmentStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-[#526672]">
                          {formatPurchaseDate(asset.purchase_date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
