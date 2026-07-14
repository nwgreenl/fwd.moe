export interface Fwd {
  id: string;
  url: string;
  createdAt?: number;
  updatedAt?: number;
}

export type FwdMap = Record<string, Fwd>;

export interface FwdValidationResultError {
  property: keyof Fwd;
  message: string;
}
export type FwdValidationResultErrorMap = Record<keyof Fwd, string[]>;
