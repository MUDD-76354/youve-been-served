// TODO: Re-implement proper User/Admin role separation with working login

"use client";

import { useToast } from "@/components/ToastProvider";
import { getErrorMessage } from "@/lib/errors";
import type { CreateUserProfileInput } from "@/lib/profiles";
import { createUserProfile } from "@/lib/users";
import { FormEvent, useState } from "react";

const initialForm: CreateUserProfileInput = {
  email: "",
  password: "",
  serverName: "",
  fullName: "",
};

const inputClassName =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClassName = "block text-sm font-medium text-gray-700";

export default function CreateUserForm() {
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createUserProfile({
        email: form.email,
        password: form.password,
        serverName: form.serverName,
        fullName: form.fullName?.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        showError(result.error, "Could not create user");
        return;
      }

      const message = `Account created for ${result.user.serverName} (${result.user.email}).`;
      setSuccessMessage(message);
      setForm(initialForm);
      showSuccess(message, "User created");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to create user.");
      setError(message);
      showError(message, "Could not create user");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create User</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create a process server (field user) account with login credentials
          and a server name used for job assignment. New accounts are always
          assigned the <span className="font-medium">user</span> role.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <label className={labelClassName}>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className={inputClassName}
              placeholder="server@example.com"
              autoComplete="off"
            />
          </label>

          <label className={labelClassName}>
            Password
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              className={inputClassName}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>

          <label className={labelClassName}>
            Server Name
            <input
              type="text"
              required
              value={form.serverName}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  serverName: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="e.g. Mike Johnson"
            />
          </label>

          <label className={labelClassName}>
            Full Name{" "}
            <span className="font-normal text-gray-500">(optional)</span>
            <input
              type="text"
              value={form.fullName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fullName: event.target.value }))
              }
              className={inputClassName}
              placeholder="Legal or display name"
            />
          </label>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          The server name must match job assignments exactly so the process
          server sees their jobs on Mobile.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating user..." : "Create User"}
        </button>
      </form>
    </section>
  );
}