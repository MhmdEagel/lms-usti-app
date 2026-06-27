import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";
import { IAssignment, IUpdateAssignment } from "@/types/Classroom";

export const assignmentServices = {
  findAllAssignments: (classroomId: string, params?: { page?: number; limit?: number; search?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments`, { params }),
  findAssignmentById: (classroomId: string, assignmentId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}`),
  create: (payload: IAssignment, classroomId: string) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/assignments`, payload),
  update: (payload: IUpdateAssignment, classroomId: string, assignmentId: string) =>
    instance.put(
      `${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}`,
      payload,
    ),
  delete: (classroomId: string, assignmentId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}`),
};
