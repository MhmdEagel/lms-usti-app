import instance from "@/lib/axios";
import type {
  IActivation,
  ILogin,
  INewPassword,
  IVerification,
} from "@/types/Auth";
import endpoint from "./endpoint.constant";

const authServices = {
  login: (payload: ILogin) => instance.post(`${endpoint.AUTH}/login`, payload),
  activate: (payload: IActivation) =>
    instance.post(`${endpoint.AUTH}/activation`, payload),
  me: () => instance.get(`${endpoint.AUTH}/me`),
  resetPassword: (payload: IVerification) =>
    instance.post(`${endpoint.AUTH}/reset-password`, payload),
  newPassword: (payload: INewPassword) =>
    instance.post(`${endpoint.AUTH}/new-password`, payload),
};

export default authServices;
