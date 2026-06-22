import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

const adminServices = {
  getAllUsers: (params?: { page?: number; limit?: number }) =>
    instance.get(`${endpoint.ADMIN}/users`, { params }),
  createUser: (data: ICreateUserRequest) =>
    instance.post(`${endpoint.ADMIN}/users/create`, data),
  getUserById: (userId: string) =>
    instance.get(`${endpoint.ADMIN}/users/${userId}`),
  updateUser: (userId: string, data: IUpdateUserRequest) =>
    instance.put(`${endpoint.ADMIN}/users/${userId}/update`, data),
  deleteUser: (userId: string) =>
    instance.delete(`${endpoint.ADMIN}/users/${userId}`),
  getAuditLogs: (params?: { page?: number; limit?: number }) =>
    instance.get(`${endpoint.ADMIN}/audit-logs`, { params }),
};

export default adminServices;
