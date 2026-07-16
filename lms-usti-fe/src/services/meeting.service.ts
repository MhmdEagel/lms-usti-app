import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const meetingServices = {
  getMeetings: (classroomId: string, search?: string) =>
    instance.get(`${endpoint.MEETING}/${classroomId}/meetings`, { params: { search } }),

  getMeetingById: (classroomId: string, meetingId: string) =>
    instance.get(`${endpoint.MEETING}/${classroomId}/meetings/${meetingId}`),

  createMeeting: (classroomId: string, data: { topic: string; description?: string }) =>
    instance.post(`${endpoint.MEETING}/${classroomId}/meetings`, data),

  updateMeeting: (classroomId: string, meetingId: string, data: { topic?: string; description?: string }) =>
    instance.put(`${endpoint.MEETING}/${classroomId}/meetings/${meetingId}`, data),

  deleteMeeting: (classroomId: string, meetingId: string) =>
    instance.delete(`${endpoint.MEETING}/${classroomId}/meetings/${meetingId}`),

  reorderMeetings: (classroomId: string, meetingIds: string[]) =>
    instance.put(`${endpoint.MEETING}/${classroomId}/meetings/reorder`, { meeting_ids: meetingIds }),
};
