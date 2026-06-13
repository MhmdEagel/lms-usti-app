import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";

export const mediaServices = {
  uploadMaterial: (payload: FormData) =>
    instance.post(`${endpoint.MEDIA}/materials`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadAssignment: (payload: FormData) =>
    instance.post(`${endpoint.MEDIA}/assignments`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteMaterial: (fileName: string) =>
    instance.delete(`${endpoint.MEDIA}/materials/${fileName}`),
  deleteAssignment: (fileName: string) =>
    instance.delete(`${endpoint.MEDIA}/assignments/${fileName}`),
  deleteBatch: (payload: { files: string[] }) =>
    instance.post(`${endpoint.MEDIA}/materials/delete-batch`, payload),
  deleteAssignmentBatch: (payload: { files: string[] }) =>
    instance.post(`${endpoint.MEDIA}/assignments/delete-batch`, payload),
};
