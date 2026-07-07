import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

const adminServices = {
  getAllUsers: (params?: { page?: number; limit?: number }) =>
    instance.get(`${endpoint.ADMIN}/users`, { params }),
  createUser: (data: ICreateUserRequest) =>
    instance.post(`${endpoint.ADMIN}/users/create`, data),
  getUserById: (userID: string) =>
    instance.get(`${endpoint.ADMIN}/users/${userID}`),
  updateUser: (userID: string, data: IUpdateUserRequest) =>
    instance.put(`${endpoint.ADMIN}/users/${userID}/update`, data),
  deleteUser: (userID: string) =>
    instance.delete(`${endpoint.ADMIN}/users/${userID}`),
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    instance.get(`${endpoint.ADMIN}/audit-logs`, { params }),
};

export default adminServices;
