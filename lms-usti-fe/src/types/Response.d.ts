type ErrorResponse = {
  meta: {
    status: string;
    message: string;
  };
};
type APIResponse = {
  meta: {
    status: string;
    message: string;
  }
  data: any
}
export type { ErrorResponse, APIResponse };
