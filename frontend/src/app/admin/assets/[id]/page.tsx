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
import {
  getEmployees,
  type Employee,
} from "@/lib/api/users";

export default function AdminAssetDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingAssignment, setIsUpdatingAssignment] =
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
    if (!asset || isUpdatingAssignment || isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to unassign ${asset.asset_code} (${asset.asset_name})?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setIsUpdatingAssignment(true);

    try {
      await unassignAsset(asset.id);

      const updatedAsset = await getAsset(asset.id);

      setAsset(updatedAsset);
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
    if (!asset || isDeleting || isUpdatingAssignment) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete asset ${asset.asset_code} (${asset.asset_name})? This action cannot be undone.`
    );

    if (!confirmed) {
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
        href="/admin/assets"
        className="text-blue-600 hover:underline"
      >
        ← Back to Asset Management
      </Link>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded border border-red-300 bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          className="mt-6 rounded border border-green-300 bg-green-50 p-4 text-green-700"
        >
          {success}
        </p>
      )}

      {asset && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                Asset Code: {asset.asset_code}
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                {asset.asset_name}
              </h1>
            </div>

            <Link
              href={`/admin/assets/${asset.id}/edit`}
              aria-disabled={
                isDeleting || isUpdatingAssignment
              }
              className={`rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
                isDeleting || isUpdatingAssignment
                  ? "pointer-events-none opacity-50"
                  : ""
              }`}
            >
              Edit Asset
            </Link>
          </div>

          <div className="mt-8 rounded border p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Asset Information
            </h2>

            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Asset ID</dt>
                <dd className="mt-1">{asset.id}</dd>
              </div>

              <div>
                <dt className="font-semibold">Asset Code</dt>
                <dd className="mt-1">{asset.asset_code}</dd>
              </div>

              <div>
                <dt className="font-semibold">Asset Name</dt>
                <dd className="mt-1">{asset.asset_name}</dd>
              </div>

              <div>
                <dt className="font-semibold">Asset Type</dt>
                <dd className="mt-1">{asset.asset_type}</dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Serial Number
                </dt>
                <dd className="mt-1">
                  {asset.serial_number}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Assignment Status
                </dt>
                <dd className="mt-1">
                  {asset.assignment_status ?? "Unknown"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Purchase Date
                </dt>
                <dd className="mt-1">
                  {asset.purchase_date ?? "Not provided"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Assigned User
                </dt>
                <dd className="mt-1">
                  {assignedEmployee
                    ? getEmployeeLabel(assignedEmployee)
                    : asset.assigned_user ?? "Not assigned"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">
                  Assigned Date
                </dt>
                <dd className="mt-1">
                  {asset.assigned_date ?? "Not assigned"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold">Created</dt>
                <dd className="mt-1">
                  {new Date(asset.created_at).toLocaleString()}
                </dd>
              </div>

              {asset.updated_at && (
                <div>
                  <dt className="font-semibold">
                    Last Updated
                  </dt>
                  <dd className="mt-1">
                    {new Date(
                      asset.updated_at
                    ).toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>

            <section className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Asset Assignment
              </h2>

              {asset.assignment_status === "Assigned" ? (
                <>
                  <p className="mt-2 text-sm text-gray-600">
                    This asset is currently assigned to an
                    employee. Unassign it before assigning it
                    to someone else.
                  </p>

                  <button
                    type="button"
                    onClick={handleUnassignAsset}
                    disabled={
                      isUpdatingAssignment || isDeleting
                    }
                    className="mt-4 rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingAssignment
                      ? "Unassigning..."
                      : "Unassign Asset"}
                  </button>
                </>
              ) : asset.assignment_status === "Available" ? (
                <>
                  <p className="mt-2 text-sm text-gray-600">
                    Select an employee to assign this asset.
                  </p>

                  <label
                    htmlFor="employee"
                    className="mt-4 block font-medium"
                  >
                    Employee
                  </label>

                  <select
                    id="employee"
                    value={selectedEmployee}
                    onChange={(event) =>
                      setSelectedEmployee(event.target.value)
                    }
                    disabled={
                      isUpdatingAssignment || isDeleting
                    }
                    className="mt-2 w-full rounded border border-gray-300 p-2"
                  >
                    <option value="">
                      Select an employee
                    </option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {getEmployeeLabel(employee)}
                      </option>
                    ))}
                  </select>

                  {employees.length === 0 && (
                    <p className="mt-2 text-sm text-gray-600">
                      No employees are available.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleAssignAsset}
                    disabled={
                      !selectedEmployee ||
                      isUpdatingAssignment ||
                      isDeleting
                    }
                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUpdatingAssignment
                      ? "Assigning..."
                      : "Assign Asset"}
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  Assignment status is unavailable.
                </p>
              )}
            </section>

            <section className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold">
                Delete Asset
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Permanently delete this asset from the
                system. This action cannot be undone.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Assets with active or historical assignments
                cannot be deleted.
              </p>

              <button
                type="button"
                onClick={handleDeleteAsset}
                disabled={
                  isDeleting || isUpdatingAssignment
                }
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Asset"}
              </button>
            </section>
          </div>
        </>
      )}
    </main>
  );
}