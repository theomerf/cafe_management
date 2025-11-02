export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiErrorResponse {
  message?: string;
  errors?: ValidationErrors;
  title?: string;
  status?: number;
}

export type FormError = string | ValidationErrors | ApiErrorResponse;