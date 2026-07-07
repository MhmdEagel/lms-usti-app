import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const commentServices = {
  getComments: (classroomId: string, resourceId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials/${resourceId}/comments`),
  createComment: (classroomId: string, resourceId: string, payload: { content: string }) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/materials/${resourceId}/comments`, payload),
  deleteComment: (classroomId: string, resourceId: string, commentId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/materials/${resourceId}/comments/${commentId}`),

  getAssignmentComments: (classroomId: string, assignmentId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/comments`),
  createAssignmentComment: (classroomId: string, assignmentId: string, payload: { content: string }) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/comments`, payload),
  deleteAssignmentComment: (classroomId: string, assignmentId: string, commentId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/assignments/${assignmentId}/comments/${commentId}`),

  getForumPostComments: (classroomId: string, forumPostId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}/comments`),
  createForumPostComment: (classroomId: string, forumPostId: string, payload: { content: string }) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}/comments`, payload),
  deleteForumPostComment: (classroomId: string, forumPostId: string, commentId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}/comments/${commentId}`),
};
