"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import { getAsset, updateAsset, type Asset } from "@/lib/api/assets";
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

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

        setIsAuthorized(true);

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
        setError(err instanceof Error ? err.message : "Unable to load asset.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAsset();
  }, [params.id, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!asset || isSubmitting) return;

    setError("");
    const errors: Record<string, string> = {};
    const name = assetName.trim();

    if (!name) errors.assetName = "Asset name is required.";
    else if (name.length > 100) errors.assetName = "Asset name must be 100 characters or fewer.";

    if (!ASSET_TYPES.some((type) => type === assetType)) {
      errors.assetType = "Please select a valid asset type.";
    }

    if (purchaseDate && !isValidDate(purchaseDate)) {
      errors.purchaseDate = "Enter a valid date in YYYY-MM-DD format.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await updateAsset(asset.id, {
        assetName: name,
        assetType,
        purchaseDate: purchaseDate || null,
      });
      router.push(`/admin/assets/${asset.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update asset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAuthorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7F8] px-5">
        <p role="status" className="text-sm text-[#405462]">
          {isLoading ? "Checking session..." : "Redirecting..."}
        </p>
      </main>
    );
  }

  const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-sm text-[#101F2B] outline-none focus:border-[#087F70] focus:ring-2 focus:ring-[#087F70]/20 disabled:opacity-60";
  const readOnlyClass = "mt-2 min-h-12 w-full rounded-xl border border-[#DCE6E9] bg-[#F4F7F8] px-4 py-3 text-sm text-[#526672]";

  return (
    <AppShell role="Administrator">
      <div className="space-y-8">
        <header>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
            Administrator Workspace
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
            Edit Asset
          </h1>
          <p className="mt-3 text-base text-[#526672]">
            Update the information for an existing IT asset.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]">
            {error}
          </p>
        )}

        {isLoading && <p role="status" className="text-sm text-[#526672]">Loading asset...</p>}

        {asset && (
          <form onSubmit={handleSubmit} noValidate className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
            <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
              <h2 className="text-xl font-bold text-[#101F2B]">Asset Information</h2>
              <p className="mt-2 text-sm text-[#526672]">
                Edit the fields below. Asset code and serial number cannot be changed.
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-7 px-6 py-8 sm:grid-cols-2 sm:px-8">
              <div>
                <label htmlFor="assetCode" className="block text-sm font-semibold text-[#101F2B]">Asset Code</label>
                <input id="assetCode" value={asset.asset_code} readOnly className={readOnlyClass} />
                <p className="mt-2 text-xs text-[#526672]">The asset code cannot be changed.</p>
              </div>

              <div>
                <label htmlFor="serialNumber" className="block text-sm font-semibold text-[#101F2B]">Serial Number</label>
                <input id="serialNumber" value={asset.serial_number} readOnly className={readOnlyClass} />
                <p className="mt-2 text-xs text-[#526672]">The serial number cannot be changed.</p>
              </div>

              <div>
                <label htmlFor="assetName" className="block text-sm font-semibold text-[#101F2B]">Asset Name <span className="text-[#B4233B]">*</span></label>
                <input
                  id="assetName"
                  value={assetName}
                  onChange={(event) => { setAssetName(event.target.value); setFieldErrors((prev) => ({ ...prev, assetName: "" })); }}
                  maxLength={100}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.assetName)}
                  aria-describedby={fieldErrors.assetName ? "assetNameError" : undefined}
                  className={inputClass}
                />
                {fieldErrors.assetName && <p id="assetNameError" role="alert" className="mt-2 text-sm text-[#B4233B]">{fieldErrors.assetName}</p>}
              </div>

              <div>
                <label htmlFor="assetType" className="block text-sm font-semibold text-[#101F2B]">Asset Type <span className="text-[#B4233B]">*</span></label>
                <select
                  id="assetType"
                  value={assetType}
                  onChange={(event) => { setAssetType(event.target.value); setFieldErrors((prev) => ({ ...prev, assetType: "" })); }}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(fieldErrors.assetType)}
                  aria-describedby={fieldErrors.assetType ? "assetTypeError" : undefined}
                  className={inputClass}
                >
                  <option value="">Select an asset type</option>
                  {ASSET_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                {fieldErrors.assetType && <p id="assetTypeError" role="alert" className="mt-2 text-sm text-[#B4233B]">{fieldErrors.assetType}</p>}
              </div>

              <div className="sm:col-span-2 sm:max-w-md">
                <label htmlFor="purchaseDate" className="block text-sm font-semibold text-[#101F2B]">Purchase Date <span className="font-normal text-[#526672]">(optional)</span></label>
                <input
                  id="purchaseDate"
                  type="text"
                  value={purchaseDate}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
                    let formatted = digits.slice(0, 4);
                    if (digits.length > 4) formatted += "-" + digits.slice(4, 6);
                    if (digits.length > 6) formatted += "-" + digits.slice(6, 8);
                    setPurchaseDate(formatted);
                    setFieldErrors((prev) => ({ ...prev, purchaseDate: "" }));
                  }}
                  disabled={isSubmitting}
                  placeholder="YYYY-MM-DD"
                  maxLength={10}
                  inputMode="numeric"
                  aria-invalid={Boolean(fieldErrors.purchaseDate)}
                  aria-describedby={fieldErrors.purchaseDate ? "purchaseDateError" : "purchaseDateHint"}
                  className={inputClass}
                />
                <p id="purchaseDateHint" className="mt-2 text-xs text-[#526672]">Format: YYYY-MM-DD</p>
                {fieldErrors.purchaseDate && <p id="purchaseDateError" role="alert" className="mt-2 text-sm text-[#B4233B]">{fieldErrors.purchaseDate}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#E1E9EC] bg-[#FAFCFC] px-6 py-6 sm:px-8">
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-50">
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </button>
              <Link href={`/admin/assets/${asset.id}`} aria-disabled={isSubmitting} tabIndex={isSubmitting ? -1 : undefined} className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-6 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8] ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}>
                Cancel
              </Link>
            </div>
          </form>
        )}

        <Link
          href={asset ? `/admin/assets/${asset.id}` : "/admin/assets"}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-6 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8]"
        >
          ← Back to Asset Details
        </Link>
      </div>
    </AppShell>
  );
}
