type ErrorResponse = {
  meta: {
    status: number;
    message: string;
  };
};
type APIResponse = {
  meta: {
    status: number;
    message: string;
  }
  data: any
}

import "axios";

declare module "axios" {
  interface AxiosError {
    userMessage?: string;
  }
}

export type { ErrorResponse, APIResponse };
