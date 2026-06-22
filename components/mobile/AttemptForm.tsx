"use client";

import AttemptConfirmation, {
  type SubmitPhase,
} from "@/components/mobile/AttemptConfirmation";
import AttemptSuccess from "@/components/mobile/AttemptSuccess";
import {
  mobileInputClassName,
  mobileLabelClassName,
} from "@/components/mobile/constants";
import PhotoUploadField from "@/components/mobile/PhotoUploadField";
import SelectedJobCard from "@/components/mobile/SelectedJobCard";
import { Job } from "@/lib/admin";
import {
  type AttemptType,
  saveAttempt,
} from "@/lib/attempts";
import {
  formatFailedAttemptMessage,
  formatSuccessServeMessage,
  openSmsApp,
  PROCESS_SERVERS_GROUP_NUMBERS,
} from "@/lib/sms";
import SelectDifferentJobButton from "@/components/mobile/SelectDifferentJobButton";
import { useToast } from "@/components/ToastProvider";
import {
  type AttemptDraft,
  type AttemptFlowStep,
  createEmptyAttemptDraft,
} from "@/lib/attemptDraft";
import { getErrorMessage } from "@/lib/errors";
import { uploadAttemptPhoto } from "@/lib/storage";
import { FormEvent, useEffect, useState } from "react";

const SERVE_TYPES = [
  "Personal Service",
  "Substituted Service",
  "Posted Service",
  "Corporate/Registered Agent",
] as const;

export type { AttemptFlowStep } from "@/lib/attemptDraft";

type AttemptFormProps = {
  job: Job;
  serverName: string;
  initialDraft?: AttemptDraft | null;
  onBack: () => void;
  onSelectDifferentJob: (draft: AttemptDraft) => void;
  onFlowChange?: (step: AttemptFlowStep) => void;
  onAttemptSaved?: (attemptType: AttemptType) => void;
};

export default function AttemptForm({
  job,
  serverName,
  initialDraft,
  onBack,
  onSelectDifferentJob,
  onFlowChange,
  onAttemptSaved,
}: AttemptFormProps) {
  const { showSuccess, showError } = useToast();
  const resolvedDraft = initialDraft ?? createEmptyAttemptDraft(job);
  const [step, setStep] = useState<AttemptFlowStep>(resolvedDraft.flowStep);
  const [attemptType, setAttemptType] = useState<AttemptType>(
    resolvedDraft.attemptType,
  );
  const [successForm, setSuccessForm] = useState(resolvedDraft.successForm);
  const [attemptAddress, setAttemptAddress] = useState(
    resolvedDraft.attemptAddress,
  );
  const [failedForm, setFailedForm] = useState(resolvedDraft.failedForm);
  const [photoFile, setPhotoFile] = useState<File | null>(
    resolvedDraft.photoFile,
  );
  const [attemptAddressMatchesJob, setAttemptAddressMatchesJob] = useState(
    resolvedDraft.attemptAddressMatchesJob,
  );
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  function updateStep(nextStep: AttemptFlowStep) {
    setStep(nextStep);
    onFlowChange?.(nextStep);
  }

  function buildDraft(): AttemptDraft {
    return {
      attemptType,
      attemptAddress,
      successForm,
      failedForm,
      photoFile,
      flowStep: step === "success" ? "form" : step,
      sourceJobId: job.id,
      attemptAddressMatchesJob,
    };
  }

  function handleSelectDifferentJob() {
    onSelectDifferentJob(buildDraft());
  }

  function resetForAnotherAttempt() {
    const freshDraft = createEmptyAttemptDraft(job);
    setAttemptType(freshDraft.attemptType);
    setAttemptAddress(freshDraft.attemptAddress);
    setSuccessForm(freshDraft.successForm);
    setFailedForm(freshDraft.failedForm);
    setPhotoFile(freshDraft.photoFile);
    setAttemptAddressMatchesJob(freshDraft.attemptAddressMatchesJob);
    setSubmitPhase("idle");
    setError(null);
    updateStep("form");
  }

  function updateAttemptAddress(value: string) {
    setAttemptAddress(value);
    setAttemptAddressMatchesJob(value === job.address);
  }

  function updateFailedForm(
    updater: (prev: AttemptDraft["failedForm"]) => AttemptDraft["failedForm"],
  ) {
    setFailedForm((prev) => updater(prev));
  }

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [photoFile]);

  function handleAttemptTypeChange(type: AttemptType) {
    setAttemptType(type);
    setError(null);
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    updateStep("confirm");
  }

  async function handleConfirmSend() {
    setError(null);

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        setSubmitPhase("uploading-photo");
        photoUrl = await uploadAttemptPhoto(photoFile, job.id);
      }

      setSubmitPhase("saving");
      await saveAttempt(
        job.id,
        serverName.trim(),
        attemptType,
        attemptType === "success"
          ? { ...successForm, address: attemptAddress }
          : { ...failedForm, address: attemptAddress },
        photoUrl,
      );

      const message =
        attemptType === "success"
          ? formatSuccessServeMessage({ ...successForm, address: attemptAddress })
          : formatFailedAttemptMessage(
              { ...failedForm, address: attemptAddress },
              job.defendantName,
            );

      openSmsApp(PROCESS_SERVERS_GROUP_NUMBERS, message);
      setSubmitPhase("idle");
      onAttemptSaved?.(attemptType);
      updateStep("success");
      showSuccess(
        `${attemptType === "success" ? "Successful serve" : "Failed attempt"} for ${job.defendantName} was saved.`,
        "Attempt logged",
      );
    } catch (err) {
      const message = getErrorMessage(
        err,
        "Failed to save attempt to Supabase.",
      );
      setError(message);
      showError(message, "Could not save attempt");
      setSubmitPhase("idle");
    }
  }

  if (step === "success") {
    return (
      <div className="flex flex-1 flex-col">
        <AttemptSuccess
          job={job}
          attemptType={attemptType}
          onLogAnother={resetForAnotherAttempt}
          onBackToJobs={onBack}
        />
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-1 flex-col">
        <SelectDifferentJobButton
          onClick={handleSelectDifferentJob}
          disabled={submitPhase !== "idle"}
          className="mb-5 self-start"
        />

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <AttemptConfirmation
          job={job}
          serverName={serverName}
          attemptType={attemptType}
          attemptAddress={attemptAddress}
          successForm={successForm}
          failedForm={failedForm}
          photoPreviewUrl={photoPreviewUrl}
          submitPhase={submitPhase}
          onBack={() => updateStep("form")}
          onConfirm={() => void handleConfirmSend()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SelectedJobCard job={job} />

      <SelectDifferentJobButton
        onClick={handleSelectDifferentJob}
        className="mb-5 self-start"
      />

      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-900">Log Attempt</h2>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the attempt details for this job.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1.5">
        <button
          type="button"
          onClick={() => handleAttemptTypeChange("success")}
          className={`rounded-lg px-3 py-4 text-sm font-semibold transition sm:text-base ${
            attemptType === "success"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Successful Serve
        </button>
        <button
          type="button"
          onClick={() => handleAttemptTypeChange("failed")}
          className={`rounded-lg px-3 py-4 text-sm font-semibold transition sm:text-base ${
            attemptType === "failed"
              ? "bg-gray-800 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Failed Attempt
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSend} className="flex flex-1 flex-col gap-5">
        <label className={mobileLabelClassName}>
          Address
          <input
            type="text"
            name="attemptAddress"
            required
            value={attemptAddress}
            onChange={(event) => updateAttemptAddress(event.target.value)}
            className={mobileInputClassName}
            placeholder="Service or attempt address"
          />
        </label>

        {attemptType === "success" ? (
          <div key="success-fields" className="flex flex-col gap-5">
            <label className={mobileLabelClassName}>
              Type of Serve
              <select
                name="serveType"
                required
                value={successForm.serveType}
                onChange={(event) =>
                  setSuccessForm((prev) => ({
                    ...prev,
                    serveType: event.target.value,
                  }))
                }
                className={mobileInputClassName}
              >
                <option value="" disabled>
                  Select type...
                </option>
                {SERVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className={mobileLabelClassName}>
              Name of Person Served
              <input
                type="text"
                name="personServed"
                required
                value={successForm.personServed}
                onChange={(event) =>
                  setSuccessForm((prev) => ({
                    ...prev,
                    personServed: event.target.value,
                  }))
                }
                className={mobileInputClassName}
                placeholder="Full name"
              />
            </label>

            <PhotoUploadField
              file={photoFile}
              onChange={setPhotoFile}
              attemptType="success"
            />

            <label className={mobileLabelClassName}>
              Mileage
              <input
                type="number"
                name="mileage"
                required
                min="0"
                step="0.1"
                inputMode="decimal"
                value={successForm.mileage}
                onChange={(event) =>
                  setSuccessForm((prev) => ({
                    ...prev,
                    mileage: event.target.value,
                  }))
                }
                className={mobileInputClassName}
                placeholder="0.0"
              />
            </label>

            <label className={mobileLabelClassName}>
              Notes
              <span className="ml-1 text-xs font-normal text-gray-500">
                (optional)
              </span>
              <textarea
                name="notes"
                rows={4}
                value={successForm.notes}
                onChange={(event) =>
                  setSuccessForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                className={mobileInputClassName}
                placeholder="Any extra details..."
              />
            </label>
          </div>
        ) : (
          <div key="failed-fields" className="flex flex-col gap-5">
            <label className={mobileLabelClassName}>
              Date &amp; Time
              <input
                type="datetime-local"
                name="dateTime"
                required
                value={failedForm.dateTime}
                onChange={(event) =>
                  updateFailedForm((prev) => ({
                    ...prev,
                    dateTime: event.target.value,
                  }))
                }
                className={mobileInputClassName}
              />
            </label>

            <PhotoUploadField
              file={photoFile}
              onChange={setPhotoFile}
              attemptType="failed"
            />

            <label className={mobileLabelClassName}>
              Mileage
              <input
                type="number"
                name="mileage"
                required
                min="0"
                step="0.1"
                inputMode="decimal"
                value={failedForm.mileage}
                onChange={(event) =>
                  updateFailedForm((prev) => ({
                    ...prev,
                    mileage: event.target.value,
                  }))
                }
                className={mobileInputClassName}
                placeholder="0.0"
              />
            </label>

            <label className={mobileLabelClassName}>
              Notes
              <span className="ml-1 text-xs font-normal text-gray-500">
                (optional)
              </span>
              <textarea
                name="notes"
                rows={4}
                value={failedForm.notes}
                onChange={(event) =>
                  updateFailedForm((prev) => ({
                    ...prev,
                    notes: event.target.value,
                  }))
                }
                className={mobileInputClassName}
                placeholder="What happened?"
              />
            </label>
          </div>
        )}

        <button
          type="submit"
          className="mt-auto w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}