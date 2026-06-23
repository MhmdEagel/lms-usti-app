import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";
import type { IUpdateProfileRequest } from "@/types/Auth";

const profileServices = {
  updateProfile: (data: IUpdateProfileRequest) =>
    instance.put(endpoint.PROFILE, data),
};

export default profileServices;
