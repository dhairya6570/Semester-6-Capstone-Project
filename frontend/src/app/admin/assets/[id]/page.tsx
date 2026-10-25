"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/api/auth";
import {
  assignAsset,
  deleteAsset,
  getAsset,
  unassignAsset,
  type Asset,
} from "@/lib/api/assets";
import { getEmployees, type Employee } from "@/lib/api/users";
import AppShell from "@/components/layout/AppShell";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function formatPurchaseDate(value: string | null | undefined) {
  if (!value) return "Not provided";

  const date = new Date(`${value}T00:00:00`);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString();
}

export default function AdminAssetDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingAssignment, setIsUpdatingAssignment] =
    useState(false);

  const [showUnassignConfirmation, setShowUnassignConfirmation] =
    useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

        const [assetData, employeeData] = await Promise.all([
          getAsset(id),
          getEmployees(),
        ]);

        setAsset(assetData);
        setEmployees(employeeData);
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

  async function handleAssignAsset() {
    if (
      !asset ||
      !selectedEmployee ||
      isUpdatingAssignment ||
      isDeleting
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setIsUpdatingAssignment(true);

    try {
      await assignAsset(asset.id, {
        userId: selectedEmployee,
      });

      const updatedAsset = await getAsset(asset.id);

      setAsset(updatedAsset);
      setSelectedEmployee("");
      setSuccess("Asset assigned successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to assign asset."
      );
    } finally {
      setIsUpdatingAssignment(false);
    }
  }

  async function handleUnassignAsset() {
    if (
      !asset ||
      isUpdatingAssignment ||
      isDeleting ||
      !showUnassignConfirmation
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setIsUpdatingAssignment(true);

    try {
      await unassignAsset(asset.id);

      const updatedAsset = await getAsset(asset.id);

      setAsset(updatedAsset);
      setShowUnassignConfirmation(false);
      setSuccess("Asset unassigned successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to unassign asset."
      );
    } finally {
      setIsUpdatingAssignment(false);
    }
  }

  async function handleDeleteAsset() {
    if (
      !asset ||
      isDeleting ||
      isUpdatingAssignment ||
      !showDeleteConfirmation
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      await deleteAsset(asset.id);
      router.push("/admin/assets");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete asset."
      );
      setIsDeleting(false);
    }
  }

  function getEmployeeLabel(employee: Employee) {
    const name = employee.full_name.trim() || "Unnamed Employee";

    return `${name} (${employee.id.slice(0, 8)})`;
  }

  const assignedEmployee = employees.find(
    (employee) => employee.id === asset?.assigned_user
  );

  if (!isAuthorized) {
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
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#087F70]">
              Administrator Workspace
            </p>

            <p className="mb-2 text-sm font-semibold text-[#526672]">
              {asset ? `Asset ${asset.asset_code}` : "Asset Details"}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#101F2B] sm:text-4xl">
              {asset?.asset_name ?? "Asset Details"}
            </h1>

            <p className="mt-3 text-base text-[#526672]">
              Review asset information and manage its assignment.
            </p>
          </div>

          {asset && (
            <Link
              href={`/admin/assets/${asset.id}/edit`}
              aria-disabled={isDeleting || isUpdatingAssignment}
              tabIndex={
                isDeleting || isUpdatingAssignment ? -1 : undefined
              }
              className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white hover:bg-[#06695D] ${
                isDeleting || isUpdatingAssignment
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              Edit Asset
            </Link>
          )}
        </header>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] px-5 py-4 text-sm text-[#B4233B]"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="rounded-xl border border-[#B8E5D3] bg-[#E4F7ED] px-5 py-4 text-sm text-[#086B55]"
          >
            {success}
          </p>
        )}

        {isLoading && (
          <p role="status" className="text-sm text-[#526672]">
            Loading asset...
          </p>
        )}

        {asset && (
          <>
            <section className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
              <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
                <h2 className="text-xl font-bold text-[#101F2B]">
                  Asset Information
                </h2>
                <p className="mt-2 text-sm text-[#526672]">
                  Registered equipment details and current assignment.
                </p>
              </div>

              <dl className="grid gap-x-8 gap-y-7 px-6 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Asset Code
                  </dt>
                  <dd className="mt-2 font-semibold text-[#101F2B]">
                    {asset.asset_code}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Asset Type
                  </dt>
                  <dd className="mt-2 text-[#101F2B]">
                    {asset.asset_type}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Assignment Status
                  </dt>
                  <dd className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        asset.assignment_status === "Assigned"
                          ? "bg-[#E7F0FF] text-[#2458A6]"
                          : asset.assignment_status === "Available"
                            ? "bg-[#E4F4EF] text-[#086B55]"
                            : "bg-[#E9EEF1] text-[#435662]"
                      }`}
                    >
                      {asset.assignment_status ?? "Unknown"}
                    </span>
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Asset Name
                  </dt>
                  <dd className="mt-2 break-words text-[#101F2B]">
                    {asset.asset_name}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Serial Number
                  </dt>
                  <dd className="mt-2 break-all text-[#101F2B]">
                    {asset.serial_number}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Purchase Date
                  </dt>
                  <dd className="mt-2 text-[#101F2B]">
                    {formatPurchaseDate(asset.purchase_date)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Assigned Employee
                  </dt>
                  <dd className="mt-2 break-words text-[#101F2B]">
                    {assignedEmployee
                      ? getEmployeeLabel(assignedEmployee)
                      : asset.assigned_user ?? "Not assigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Assigned Date
                  </dt>
                  <dd className="mt-2 text-[#101F2B]">
                    {asset.assigned_date
                      ? formatDate(asset.assigned_date)
                      : "Not assigned"}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Asset ID
                  </dt>
                  <dd className="mt-2 text-[#101F2B]">
                    {asset.id}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-semibold text-[#526672]">
                    Created On
                  </dt>
                  <dd className="mt-2 text-[#101F2B]">
                    {formatDate(asset.created_at)}
                  </dd>
                </div>

                {asset.updated_at && (
                  <div>
                    <dt className="text-sm font-semibold text-[#526672]">
                      Last Updated
                    </dt>
                    <dd className="mt-2 text-[#101F2B]">
                      {formatDate(asset.updated_at)}
                    </dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#DCE6E9] bg-white shadow-sm">
              <div className="border-b border-[#E1E9EC] px-6 py-6 sm:px-8">
                <h2 className="text-xl font-bold text-[#101F2B]">
                  Asset Assignment
                </h2>
                <p className="mt-2 text-sm text-[#526672]">
                  Assign equipment to an employee or return it to
                  the available inventory.
                </p>
              </div>

              <div className="px-6 py-7 sm:px-8">
                {asset.assignment_status === "Assigned" ? (
                  <div className="space-y-5">
                    <p className="text-sm leading-6 text-[#526672]">
                      This asset is currently assigned to an employee.
                      Unassign it before assigning it to someone else.
                    </p>

                    {!showUnassignConfirmation ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowUnassignConfirmation(true);
                          setShowDeleteConfirmation(false);
                        }}
                        disabled={isUpdatingAssignment || isDeleting}
                        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#B87820] px-6 py-3 text-sm font-semibold text-white hover:bg-[#996018] disabled:opacity-50"
                      >
                        Unassign Asset
                      </button>
                    ) : (
                      <div className="rounded-xl border border-[#F2D6A6] bg-[#FFF8E9] p-5">
                        <h3 className="font-bold text-[#85550E]">
                          Unassign {asset.asset_code}?
                        </h3>
                        <p className="mt-2 text-sm text-[#85550E]">
                          This asset will become available for another
                          employee.
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleUnassignAsset}
                            disabled={isUpdatingAssignment}
                            className="rounded-xl bg-[#B87820] px-5 py-3 text-sm font-semibold text-white hover:bg-[#996018] disabled:opacity-50"
                          >
                            {isUpdatingAssignment
                              ? "Unassigning..."
                              : "Yes, Unassign Asset"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setShowUnassignConfirmation(false)
                            }
                            disabled={isUpdatingAssignment}
                            className="rounded-xl border border-[#CBDDE1] bg-white px-5 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : asset.assignment_status === "Available" ? (
                  <div>
                    <p className="text-sm text-[#526672]">
                      Select an employee to assign this asset.
                    </p>

                    <label
                      htmlFor="employee"
                      className="mt-5 block text-sm font-semibold text-[#101F2B]"
                    >
                      Employee
                    </label>

                    <select
                      id="employee"
                      value={selectedEmployee}
                      onChange={(event) =>
                        setSelectedEmployee(event.target.value)
                      }
                      disabled={isUpdatingAssignment || isDeleting}
                      className="mt-2 min-h-12 w-full max-w-xl rounded-xl border border-[#CBDDE1] bg-white px-4 py-3 text-sm text-[#101F2B] focus:border-[#087F70] focus:outline-none focus:ring-2 focus:ring-[#087F70]/20"
                    >
                      <option value="">Select an employee</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {getEmployeeLabel(employee)}
                        </option>
                      ))}
                    </select>

                    {employees.length === 0 && (
                      <p className="mt-2 text-sm text-[#526672]">
                        No employees are available.
                      </p>
                    )}

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={handleAssignAsset}
                        disabled={
                          !selectedEmployee ||
                          isUpdatingAssignment ||
                          isDeleting
                        }
                        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#087F70] px-6 py-3 text-sm font-semibold text-white hover:bg-[#06695D] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdatingAssignment
                          ? "Assigning..."
                          : "Assign Asset"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#526672]">
                    Assignment status is unavailable.
                  </p>
                )}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#F1C9CF] bg-white shadow-sm">
              <div className="border-b border-[#F1C9CF] px-6 py-6 sm:px-8">
                <h2 className="text-xl font-bold text-[#B4233B]">
                  Delete Asset
                </h2>
                <p className="mt-2 text-sm text-[#526672]">
                  Permanently remove this asset from the system.
                  This action cannot be undone.
                </p>
              </div>

              <div className="space-y-5 px-6 py-7 sm:px-8">
                <p className="text-sm text-[#526672]">
                  Assets with active or historical assignments
                  cannot be deleted.
                </p>

                {!showDeleteConfirmation ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirmation(true);
                      setShowUnassignConfirmation(false);
                    }}
                    disabled={isDeleting || isUpdatingAssignment}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#B4233B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#951B31] disabled:opacity-50"
                  >
                    Delete Asset
                  </button>
                ) : (
                  <div className="rounded-xl border border-[#F1C9CF] bg-[#FFF1F2] p-5">
                    <h3 className="font-bold text-[#B4233B]">
                      Are you sure you want to delete {asset.asset_code}?
                    </h3>

                    <p className="mt-2 text-sm text-[#B4233B]">
                      This action is permanent and cannot be undone.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleDeleteAsset}
                        disabled={isDeleting}
                        className="rounded-xl bg-[#B4233B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#951B31] disabled:opacity-50"
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Yes, Delete Asset"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setShowDeleteConfirmation(false)
                        }
                        disabled={isDeleting}
                        className="rounded-xl border border-[#CBDDE1] bg-white px-5 py-3 text-sm font-semibold text-[#101F2B] hover:bg-[#F4F7F8]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <div>
          <Link
            href="/admin/assets"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#CBDDE1] bg-white px-5 py-3 text-sm font-semibold text-[#101F2B] transition-colors hover:bg-[#EAF3F2]"
          >
            ← Back to Asset Management
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
