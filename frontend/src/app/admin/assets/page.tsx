"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getAssets, type Asset } from "@/lib/api/assets";

export default function AdminAssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading assets...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-blue-600 hover:underline"
        >
          ← Back to Admin Dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            Asset Management
          </h1>

          <Link
            href="/admin/assets/new"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Create Asset
          </Link>
        </div>

        <p className="mt-2 text-gray-600">
          View and manage IT assets registered in the system.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!error && assets.length === 0 && (
        <div className="rounded border p-6">
          <p>No assets have been registered yet.</p>
        </div>
      )}

      {!error && assets.length > 0 && (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="p-4">Asset Code</th>
                <th scope="col" className="p-4">Name</th>
                <th scope="col" className="p-4">Type</th>
                <th scope="col" className="p-4">Serial Number</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Purchase Date</th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id} className="border-t">
                  <td className="p-4 font-medium">
                    {asset.asset_code}
                  </td>

                  <td className="p-4">
                    {asset.asset_name}
                  </td>

                  <td className="p-4">
                    {asset.asset_type}
                  </td>

                  <td className="p-4">
                    {asset.serial_number}
                  </td>

                  <td className="p-4">
                    {asset.assignment_status ?? "Available"}
                  </td>

                  <td className="p-4">
                    {asset.purchase_date
                      ? new Date(
                          `${asset.purchase_date}T00:00:00`
                        ).toLocaleDateString()
                      : "Not provided"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}