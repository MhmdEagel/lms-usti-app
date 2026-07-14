import instance from "@/lib/axios";
import endpoint from "./endpoint.constant";
import { INewMaterial, IUpdateMaterial } from "@/types/Classroom";

export const materialServices = {
  findAllMaterials: (classroomId: string, params?: { page?: number; limit?: number; search?: string }) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials`, { params }),
  findMaterialById: (classroomId: string, materialId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}`),
  create: (payload: INewMaterial, classroomId: string) =>
    instance.post(`${endpoint.CLASSROOM}/${classroomId}/materials`, payload),
  update: (payload: IUpdateMaterial, classroomId: string, materialId: string) =>
    instance.put(
      `${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}`,
      payload,
    ),
  delete: (classroomId: string, materialId: string) =>
    instance.delete(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}`),
  getViewers: (classroomId: string, materialId: string) =>
    instance.get(`${endpoint.CLASSROOM}/${classroomId}/materials/${materialId}/viewers`),
};
