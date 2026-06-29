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
  findSubmissions: (classroomId: string, assignmentId: string, params?: { page?: number; limit?: number; search?: string; filter?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions`, { params }),
  findSubmissionDetail: (classroomId: string, assignmentId: string, submissionId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}`),
  findMySubmission: (classroomId: string, assignmentId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/my-submission`),
  createSubmission: (classroomId: string, assignmentId: string, payload: { attachments: { name: string; type: string; url: string; unique_name?: string }[] }) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions`, payload),
  gradeSubmission: (classroomId: string, assignmentId: string, submissionId: string, payload: { score: number | null; feedback: string | null }) =>
    instance.put(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}/grade`, payload),
  findWaitingGrade: () =>
    instance.get(`${endpoint.CLASSROOM}/dosen/waiting-grade`),
};
