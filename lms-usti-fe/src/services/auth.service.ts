import instance from "@/lib/axios";
import type {
  IActivation,
  ILogin,
  INewPassword,
  IVerification,
  IVerifyOTPRequest,
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
  sendOTP: (data: { old_password: string }) => instance.post(`${endpoint.OTP}/send-otp`, data),
  verifyOTP: (data: IVerifyOTPRequest) =>
    instance.post(`${endpoint.OTP}/verify-otp`, data),
};

export default authServices;
