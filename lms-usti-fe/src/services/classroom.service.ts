import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";
import type {
  ICreateAnnouncement,
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
  findAllDosenClassrooms: (params?: { search?: string; prodi?: string; term?: string; tahun_ajaran?: string; room_number?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/dosen/classrooms`, { params }),
  findAllMahasiswaClassrooms: (params?: { search?: string; prodi?: string; term?: string; tahun_ajaran?: string; room_number?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/mahasiswa/classrooms`, { params }),
  getDetail: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}`),
  createAnnouncement: (payload: ICreateAnnouncement, classroomId: string) =>
    instance.post(
      `${endpoint.CLASSROOM}/${classroomId}/announcements`,
      payload,
    ),
  getAnnouncement: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/announcements`),
  deleteAnnouncement: (classroomId: string, announcementId: string) =>
    instance.delete(
      `${endpoint.CLASSROOM}/${classroomId}/announcements/${announcementId}`,
    ),
  updateAnnouncement: (
    classroomId: string,
    announcementId: string,
    payload: { is_pinned: boolean },
  ) =>
    instance.put(
      `${endpoint.CLASSROOM}/${classroomId}/announcements/${announcementId}`,
      payload,
    ),
  getMembers: (classroomId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/members`),
};
