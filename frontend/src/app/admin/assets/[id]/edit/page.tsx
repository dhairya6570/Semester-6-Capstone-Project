
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  getAsset,
  updateAsset,
  type Asset,
} from "@/lib/api/assets";

const ASSET_TYPES = [
  "Desktop Computer",
  "Laptop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Printer",
  "Software License",
  "Other",
] as const;

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  useEffect(() => {
    async function loadAsset() {
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

        const id = Number(params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
          setError("Invalid asset ID.");
          return;
        }

        const assetData = await getAsset(id);

        setAsset(assetData);
        setAssetName(assetData.asset_name);
        setAssetType(assetData.asset_type);
        setPurchaseDate(assetData.purchase_date ?? "");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load asset."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAsset();
  }, [params.id, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!asset) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await updateAsset(asset.id, {
        assetName: assetName.trim(),
        assetType,
        purchaseDate: purchaseDate || null,
      });

      router.push(`/admin/assets/${asset.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update asset."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading asset...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href={asset ? `/admin/assets/${asset.id}` : "/admin/assets"}
        className="text-blue-600 hover:underline"
      >
        ← Back to Asset Details
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Edit Asset
      </h1>

      <p className="mt-2 text-gray-500">
        Update the information for an existing IT asset.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {asset && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded border p-6"
        >
          <div>
            <label
              htmlFor="assetCode"
              className="mb-2 block font-medium"
            >
              Asset Code
            </label>

            <input
              id="assetCode"
              type="text"
              value={asset.asset_code}
              readOnly
              className="w-full rounded border bg-gray-100 p-3 text-gray-700"
            />

            <p className="mt-1 text-sm text-gray-500">
              The asset code cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="assetName"
              className="mb-2 block font-medium"
            >
              Asset Name
            </label>

            <input
              id="assetName"
              type="text"
              value={assetName}
              onChange={(event) => setAssetName(event.target.value)}
              required
              maxLength={100}
              disabled={isSubmitting}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label
              htmlFor="assetType"
              className="mb-2 block font-medium"
            >
              Asset Type
            </label>

            <select
              id="assetType"
              value={assetType}
              onChange={(event) => setAssetType(event.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded border p-3"
            >
              <option value="">Select an asset type</option>

              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="serialNumber"
              className="mb-2 block font-medium"
            >
              Serial Number
            </label>

            <input
              id="serialNumber"
              type="text"
              value={asset.serial_number}
              readOnly
              className="w-full rounded border bg-gray-100 p-3 text-gray-700"
            />

            <p className="mt-1 text-sm text-gray-500">
              The serial number cannot be changed.
            </p>
          </div>

          <div>
            <label
              htmlFor="purchaseDate"
              className="mb-2 block font-medium"
            >
              Purchase Date
            </label>

            <input
              id="purchaseDate"
              type="text"
              value={purchaseDate}
              onChange={(event) => {
                const digits = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8);

                let formatted = digits.slice(0, 4);

                if (digits.length > 4) {
                  formatted += "-" + digits.slice(4, 6);
                }

                if (digits.length > 6) {
                  formatted += "-" + digits.slice(6, 8);
                }

                setPurchaseDate(formatted);
              }}
              disabled={isSubmitting}
              placeholder="YYYY-MM-DD"
              pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
              maxLength={10}
              title="Enter the purchase date in YYYY-MM-DD format"
              className="w-full rounded border p-3"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>

            <Link
              href={`/admin/assets/${asset.id}`}
              className="rounded border px-5 py-3 hover:bg-gray-100 hover:text-black"
            >
              Cancel
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}
