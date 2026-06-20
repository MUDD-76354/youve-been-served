"use client";

import { useToast } from "@/components/ToastProvider";
import { getErrorMessage } from "@/lib/errors";
import type { UserProfile } from "@/lib/profiles";
import { fetchAllUserProfiles } from "@/lib/users";
import { useCallback, useEffect, useState } from "react";

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRole(role: string): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "process_server":
      return "Process Server";
    case "user":
      return "User";
    default:
      return role;
  }
}

const roleStyles: Record<string, string> = {
  admin: "bg-gray-900 text-white",
  process_server: "bg-blue-100 text-blue-800",
  user: "bg-green-100 text-green-800",
};

export default function ManageUsersSection() {
  const { showError } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAllUserProfiles();

      if (!result.success) {
        setError(result.error);
        showError(result.error, "Could not load users");
        setUsers([]);
        return;
      }

      setUsers(result.users);
    } catch (err) {
      const message = getErrorMessage(err, "Failed to load users.");
      setError(message);
      showError(message, "Could not load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Manage Users</h2>
          <p className="mt-1 text-sm text-gray-600">
            View all accounts created for the field portal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers()}
          disabled={loading}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-600">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">No users yet</p>
            <p className="mt-1 text-sm text-gray-600">
              Create a user from the Create User tab to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Server Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">
                    Created Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          roleStyles[user.role] ?? "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{user.serverName}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {user.fullName || "—"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-600">
                      {formatCreatedAt(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && users.length > 0 ? (
        <p className="text-sm text-gray-500">
          Showing {users.length} account{users.length === 1 ? "" : "s"}.
        </p>
      ) : null}
    </section>
  );
}