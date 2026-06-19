import { Job } from "@/lib/admin";
import { AttemptType } from "@/lib/attempts";

export type AttemptFlowStep = "form" | "confirm" | "success";

export type SuccessFormDraft = {
  serveType: string;
  personServed: string;
  mileage: string;
  notes: string;
};

export type FailedFormDraft = {
  address: string;
  dateTime: string;
  mileage: string;
  notes: string;
};

export type AttemptDraft = {
  attemptType: AttemptType;
  successForm: SuccessFormDraft;
  failedForm: FailedFormDraft;
  photoFile: File | null;
  flowStep: Extract<AttemptFlowStep, "form" | "confirm">;
  sourceJobId: string | null;
  failedAddressMatchesJob: boolean;
};

const emptySuccessForm: SuccessFormDraft = {
  serveType: "",
  personServed: "",
  mileage: "",
  notes: "",
};

export function createEmptyAttemptDraft(job?: Job): AttemptDraft {
  return {
    attemptType: "success",
    successForm: emptySuccessForm,
    failedForm: {
      address: job?.address ?? "",
      dateTime: "",
      mileage: "",
      notes: "",
    },
    photoFile: null,
    flowStep: "form",
    sourceJobId: job?.id ?? null,
    failedAddressMatchesJob: Boolean(job),
  };
}

export function applyDraftToJob(draft: AttemptDraft, job: Job): AttemptDraft {
  const shouldRefreshAddress =
    draft.attemptType === "failed" &&
    draft.failedAddressMatchesJob &&
    draft.sourceJobId !== job.id;

  return {
    ...draft,
    sourceJobId: job.id,
    failedAddressMatchesJob: shouldRefreshAddress
      ? true
      : draft.failedAddressMatchesJob,
    failedForm: shouldRefreshAddress
      ? { ...draft.failedForm, address: job.address }
      : draft.failedForm,
  };
}

export function draftHasEnteredData(draft: AttemptDraft): boolean {
  const successEntered = Object.values(draft.successForm).some(
    (value) => value.trim().length > 0,
  );
  const failedEntered =
    draft.failedForm.dateTime.trim().length > 0 ||
    draft.failedForm.mileage.trim().length > 0 ||
    draft.failedForm.notes.trim().length > 0 ||
    (draft.failedForm.address.trim().length > 0 &&
      !draft.failedAddressMatchesJob);
  const hasPhoto = draft.photoFile !== null;

  return successEntered || failedEntered || hasPhoto || draft.flowStep === "confirm";
}