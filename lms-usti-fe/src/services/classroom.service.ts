import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";
import type {
  IClassroomPolicies,
  ICreateClassroomForumPost,
  ICreateClassroom,
  IJoinClassroom,
  IUpdateClassroom,
} from "@/types/Classroom";

export const classroomServices = {
  join: (payload: IJoinClassroom) =>
    instance.post(`${endpoint.CLASSROOM}/join`, payload),
  create: (payload: ICreateClassroom) =>
    instance.post(`${endpoint.CLASSROOM}/create`, payload),
  update: (payload: IUpdateClassroom, classroomId: string) =>
    instance.put(`${endpoint.CLASSROOM}/${classroomId}`, payload),
  findAllDosenClassrooms: (params?: { search?: string; prodi?: string; term?: string; tahun_ajaran?: string; room_number?: string; is_archived?: string; page?: number; limit?: number }) =>
    instance.get(`${endpoint.CLASSROOM}/dosen/classrooms`, { params }),
  findAllMahasiswaClassrooms: (params?: { search?: string; prodi?: string; term?: string; tahun_ajaran?: string; room_number?: string; is_archived?: string; page?: number; limit?: number }) =>
    instance.get(`${endpoint.CLASSROOM}/mahasiswa/classrooms`, { params }),
  getDetail: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}`),
  createForumPost: (payload: ICreateClassroomForumPost, classroomId: string) =>
    instance.post(
      `${endpoint.CLASSROOM}/${classroomId}/announcements`,
      payload,
    ),
  getForumPosts: (classroomId: string, params?: { page?: number; limit?: number; search?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/announcements`, { params }),
  getForumPostById: (classroomId: string, forumPostId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}`),
  deleteForumPost: (classroomId: string, forumPostId: string) =>
    instance.delete(
      `${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}`,
    ),
  updateForumPost: (
    classroomId: string,
    forumPostId: string,
    payload: { is_pinned?: boolean; title?: string; content?: string },
  ) =>
    instance.put(
      `${endpoint.CLASSROOM}/${classroomId}/announcements/${forumPostId}`,
      payload,
    ),
  getMembers: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/members`),
  getMemberDetail: (classroomId: string, memberId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/members/${memberId}`),
  removeMember: (classroomId: string, memberId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/members/${memberId}`),
  getDashboardStats: () =>
    instance.get(`${endpoint.CLASSROOM}/dosen/dashboard-stats`),
  getMahasiswaDashboardStats: () =>
    instance.get(`${endpoint.CLASSROOM}/mahasiswa/dashboard-stats`),
  getPolicies: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}${endpoint.POLICIES}`),
  updatePolicies: (classroomId: string, payload: IClassroomPolicies) =>
    instance.put(`${endpoint.CLASSROOM}/${classroomId}${endpoint.POLICIES}`, payload),
  delete: (classroomId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}`),
  archive: (classroomId: string) =>
    instance.patch(`${endpoint.CLASSROOM}/${classroomId}/archive`),
  unarchive: (classroomId: string) =>
    instance.patch(`${endpoint.CLASSROOM}/${classroomId}/unarchive`),
  getGrades: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/grades`),
  getMyGrades: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/my-grades`),
};
