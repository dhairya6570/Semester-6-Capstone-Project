"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { createAsset } from "@/lib/api/assets";

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

export default function CreateAssetPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  useEffect(() => {
    async function checkAdministrator() {
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
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdministrator();
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createAsset({
        assetName: assetName.trim(),
        assetType,
        serialNumber: serialNumber.trim(),
        purchaseDate,
      });

      router.push("/admin/assets");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create asset."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <Link
        href="/admin/assets"
        className="text-blue-600 hover:underline"
      >
        ← Back to Asset Management
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Create Asset
      </h1>

      <p className="mt-2 text-gray-500">
        Register a new IT asset in the system.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded border p-6"
      >
        {error && (
          <p
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

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
            placeholder="e.g. Dell Latitude 5540"
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
            value={serialNumber}
            onChange={(event) => setSerialNumber(event.target.value)}
            required
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. DELL-LAT-001"
            className="w-full rounded border p-3"
          />
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
                const digits = event.target.value.replace(/\D/g, "").slice(0, 8);

                let formatted = digits.slice(0, 4);

                if (digits.length > 4) {
                    formatted += "-" + digits.slice(4, 6);
                }

                if (digits.length > 6) {
                    formatted += "-" + digits.slice(6, 8);
                }

                setPurchaseDate(formatted);
            }}
            required
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
            {isSubmitting ? "Creating..." : "Create Asset"}
          </button>

          <Link
            href="/admin/assets"
            className="rounded border px-5 py-3 hover:bg-gray-100 hover:text-black"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}