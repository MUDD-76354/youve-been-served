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
  dateTime: string;
  mileage: string;
  notes: string;
};

export type AttemptDraft = {
  attemptType: AttemptType;
  attemptAddress: string;
  successForm: SuccessFormDraft;
  failedForm: FailedFormDraft;
  photoFile: File | null;
  flowStep: Extract<AttemptFlowStep, "form" | "confirm">;
  sourceJobId: string | null;
  attemptAddressMatchesJob: boolean;
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
    attemptAddress: job?.address ?? "",
    successForm: emptySuccessForm,
    failedForm: {
      dateTime: "",
      mileage: "",
      notes: "",
    },
    photoFile: null,
    flowStep: "form",
    sourceJobId: job?.id ?? null,
    attemptAddressMatchesJob: Boolean(job),
  };
}

export function applyDraftToJob(draft: AttemptDraft, job: Job): AttemptDraft {
  const shouldRefreshAddress =
    draft.attemptAddressMatchesJob && draft.sourceJobId !== job.id;

  return {
    ...draft,
    sourceJobId: job.id,
    attemptAddressMatchesJob: shouldRefreshAddress
      ? true
      : draft.attemptAddressMatchesJob,
    attemptAddress: shouldRefreshAddress ? job.address : draft.attemptAddress,
  };
}

export function draftHasEnteredData(draft: AttemptDraft): boolean {
  const successEntered = Object.values(draft.successForm).some(
    (value) => value.trim().length > 0,
  );
  const failedEntered =
    draft.failedForm.dateTime.trim().length > 0 ||
    draft.failedForm.mileage.trim().length > 0 ||
    draft.failedForm.notes.trim().length > 0;
  const addressChanged =
    draft.attemptAddress.trim().length > 0 && !draft.attemptAddressMatchesJob;
  const hasPhoto = draft.photoFile !== null;

  return (
    successEntered ||
    failedEntered ||
    addressChanged ||
    hasPhoto ||
    draft.flowStep === "confirm"
  );
}