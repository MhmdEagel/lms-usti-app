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
export type { ErrorResponse, APIResponse };
