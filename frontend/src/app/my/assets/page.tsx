"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  getMyAssets,
  type AssignedAsset,
} from "@/lib/api/assets";

export default function MyAssetsPage() {
  const router = useRouter();

  const [assets, setAssets] = useState<AssignedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
          router.replace("/login");
          return;
        }

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

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading your assigned assets...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <Link
        href="/dashboard"
        className="text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        My Assigned Assets
      </h1>

      <p className="mt-2 text-gray-500">
        View the IT equipment currently assigned to you.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {!error && assets.length === 0 && (
        <div className="mt-8 rounded border p-6">
          <p>You currently have no assigned assets.</p>
        </div>
      )}

      {!error && assets.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded border">
          <table className="w-full text-left">
            <thead className="border-b">
              <tr>
                <th scope="col" className="p-4">
                  Asset Code
                </th>
                <th scope="col" className="p-4">
                  Asset Name
                </th>
                <th scope="col" className="p-4">
                  Asset Type
                </th>
                <th scope="col" className="p-4">
                  Serial Number
                </th>
                <th scope="col" className="p-4">
                  Assigned Date
                </th>
                <th scope="col" className="p-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {assets.map((asset) => (
                <tr
                  key={asset.assignment_id}
                  className="border-b last:border-b-0"
                >
                  <td className="p-4">
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
                    {asset.assigned_date}
                  </td>

                  <td className="p-4">
                    {asset.assignment_status}
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