export type InitiativeFormValues = {
  title: string;
  description: string;
  submitterClass: string;
  submitterName: string;
  submitterContact: string;
  personalDataConsent: boolean;
};

export type InitiativeFormFieldErrors = Partial<
  Record<"title" | "description" | "submitterClass" | "personalDataConsent", string>
>;

export type InitiativeFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: InitiativeFormFieldErrors;
  values: InitiativeFormValues;
};

export const INITIAL_INITIATIVE_FORM_STATE: InitiativeFormState = {
  status: "idle",
  values: {
    title: "",
    description: "",
    submitterClass: "",
    submitterName: "",
    submitterContact: "",
    personalDataConsent: false,
  },
};
