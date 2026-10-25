
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { createAsset } from "@/lib/api/assets";
import AppShell from "@/components/layout/AppShell";

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

type FieldErrors = {
  assetName?: string;
  assetType?: string;
  serialNumber?: string;
  purchaseDate?: string;
};

function formatPurchaseDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  let formatted = digits.slice(0, 4);

  if (digits.length > 4) {
    formatted += "-" + digits.slice(4, 6);
  }

  if (digits.length > 6) {
    formatted += "-" + digits.slice(6, 8);
  }

  return formatted;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = new Date(
    Date.UTC(year, month, 0)
  ).getUTCDate();

  return day >= 1 && day <= daysInMonth;
}

export default function CreateAssetPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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

        setIsAuthorized(true);
      } catch {
        router.replace("/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkAdministrator();
  }, [router]);

  function validateForm() {
    const errors: FieldErrors = {};

    if (!assetName.trim()) {
      errors.assetName = "Asset name is required.";
    } else if (assetName.trim().length > 100) {
      errors.assetName = "Asset name cannot exceed 100 characters.";
    }

    if (!assetType) {
      errors.assetType = "Please select an asset type.";
    } else if (!ASSET_TYPES.some((type) => type === assetType)) {
      errors.assetType = "Please select a valid asset type.";
    }

    if (!serialNumber.trim()) {
      errors.serialNumber = "Serial number is required.";
    } else if (serialNumber.trim().length > 100) {
      errors.serialNumber =
        "Serial number cannot exceed 100 characters.";
    }

    if (!purchaseDate) {
      errors.purchaseDate = "Purchase date is required.";
    } else if (!isValidDate(purchaseDate)) {
      errors.purchaseDate =
        "Enter a valid purchase date in YYYY-MM-DD format.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

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

  const inputClass =
    "min-h-12 w-full rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-sm text-[#101F2B] placeholder:text-[#72848E] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20 disabled:opacity-50";

  if (isLoading || !isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#405462]">
          {isLoading ? "Checking session..." : "Redirecting..."}
        </p>
      </main>
    );
  }

  return (
    <AppShell role="Administrator">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Administrator Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            Create Asset
          </h1>

          <p className="mt-3 text-base text-[#526672]">
            Register new IT equipment in the asset inventory.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
          <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
            <h2 className="text-xl font-bold text-[#101F2B]">
              Asset Information
            </h2>

            <p className="mt-2 text-sm text-[#526672]">
              Enter the details below to add an asset to the system.
              All fields are required.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-7 px-6 py-7 sm:px-8 sm:py-8"
          >
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
              >
                {error}
              </p>
            )}

            <div className="grid gap-7 md:grid-cols-2">
              <div>
                <label
                  htmlFor="assetName"
                  className="mb-2 block text-sm font-semibold text-[#101F2B]"
                >
                  Asset Name <span className="text-[#B4233B]">*</span>
                </label>

                <input
                  id="assetName"
                  type="text"
                  value={assetName}
                  onChange={(event) => {
                    setAssetName(event.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      assetName: undefined,
                    }));
                  }}
                  maxLength={100}
                  disabled={isSubmitting}
                  placeholder="e.g. Dell Latitude 5540"
                  aria-invalid={Boolean(fieldErrors.assetName)}
                  aria-describedby={
                    fieldErrors.assetName
                      ? "assetName-error"
                      : undefined
                  }
                  className={inputClass}
                />

                {fieldErrors.assetName && (
                  <p
                    id="assetName-error"
                    role="alert"
                    className="mt-2 text-sm text-[#B4233B]"
                  >
                    {fieldErrors.assetName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="assetType"
                  className="mb-2 block text-sm font-semibold text-[#101F2B]"
                >
                  Asset Type <span className="text-[#B4233B]">*</span>
                </label>

                <select
                  id="assetType"
                  value={assetType}
                  onChange={(event) => {
                    setAssetType(event.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      assetType: undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.assetType)}
                  aria-describedby={
                    fieldErrors.assetType
                      ? "assetType-error"
                      : undefined
                  }
                  className={inputClass}
                >
                  <option value="">Select an asset type</option>

                  {ASSET_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                {fieldErrors.assetType && (
                  <p
                    id="assetType-error"
                    role="alert"
                    className="mt-2 text-sm text-[#B4233B]"
                  >
                    {fieldErrors.assetType}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="serialNumber"
                  className="mb-2 block text-sm font-semibold text-[#101F2B]"
                >
                  Serial Number <span className="text-[#B4233B]">*</span>
                </label>

                <input
                  id="serialNumber"
                  type="text"
                  value={serialNumber}
                  onChange={(event) => {
                    setSerialNumber(event.target.value);
                    setFieldErrors((current) => ({
                      ...current,
                      serialNumber: undefined,
                    }));
                  }}
                  maxLength={100}
                  disabled={isSubmitting}
                  placeholder="e.g. DELL-LAT-001"
                  aria-invalid={Boolean(fieldErrors.serialNumber)}
                  aria-describedby={
                    fieldErrors.serialNumber
                      ? "serialNumber-error"
                      : undefined
                  }
                  className={inputClass}
                />

                {fieldErrors.serialNumber && (
                  <p
                    id="serialNumber-error"
                    role="alert"
                    className="mt-2 text-sm text-[#B4233B]"
                  >
                    {fieldErrors.serialNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="purchaseDate"
                  className="mb-2 block text-sm font-semibold text-[#101F2B]"
                >
                  Purchase Date <span className="text-[#B4233B]">*</span>
                </label>

                <input
                  id="purchaseDate"
                  type="text"
                  inputMode="numeric"
                  value={purchaseDate}
                  onChange={(event) => {
                    setPurchaseDate(
                      formatPurchaseDateInput(event.target.value)
                    );
                    setFieldErrors((current) => ({
                      ...current,
                      purchaseDate: undefined,
                    }));
                  }}
                  maxLength={10}
                  disabled={isSubmitting}
                  placeholder="YYYY-MM-DD"
                  aria-invalid={Boolean(fieldErrors.purchaseDate)}
                  aria-describedby={
                    fieldErrors.purchaseDate
                      ? "purchaseDate-error"
                      : "purchaseDate-help"
                  }
                  className={inputClass}
                />

                <p
                  id="purchaseDate-help"
                  className="mt-2 text-xs text-[#526672]"
                >
                  Enter the date as YYYY-MM-DD.
                </p>

                {fieldErrors.purchaseDate && (
                  <p
                    id="purchaseDate-error"
                    role="alert"
                    className="mt-2 text-sm text-[#B4233B]"
                  >
                    {fieldErrors.purchaseDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#E1E9EC] pt-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating Asset..." : "Create Asset"}
              </button>

              <Link
                href="/admin/assets"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-6 py-3 text-sm font-semibold text-[#101F2B] transition-colors hover:bg-[#F4F7F8]"
              >
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <p className="text-sm text-[#526672]">
          Asset codes are automatically generated when a new asset
          is registered.
        </p>
      </div>
    </AppShell>
  );
}
