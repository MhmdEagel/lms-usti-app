import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

const adminServices = {
  getAllUsers: (params?: { page?: number; limit?: number }) =>
    instance.get(`${endpoint.ADMIN}/users`, { params }),
};

export default adminServices;
