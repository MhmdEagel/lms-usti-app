import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const commentServices = {
  getComments: (classroomId: string, materialId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}/comments`),
  createComment: (classroomId: string, materialId: string, payload: { content: string }) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}/comments`, payload),
  deleteComment: (classroomId: string, materialId: string, commentId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}/comments/${commentId}`),
};
