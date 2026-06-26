import type { User } from "./Auth";

interface IJoinClassroom {
  class_code: string;
}
interface ICreateClassroom {
  class_cover: string?;
  class_name: string?;
  term: number?;
  room_number: number?;
  day: number?;
  class_start: string?;
  class_end: string?;
  prodi: string?;
  tahun_ajaran: string?;
}
interface IUpdateClassroom {
  class_cover?: string?;
  class_name?: string?;
  term?: number?;
  room_number?: number?;
  day?: number?;
  class_start?: string?;
  class_end?: string?;
  prodi?: string?;
  tahun_ajaran?: string?;
}

interface ICreateAnnouncement {
  title: string;
  content: string;
}

interface IAnnouncement extends ICreateAnnouncement {
  id: string;
  created_by: string;
  created_at: string;
  is_pinned: boolean;
}

interface IClassroom {
  id: string?;
  class_code: string;
  class_cover: string;
  class_name: string;
  term: number;
  room_number: number;
  day: number;
  class_start: string;
  class_end: string;
  prodi: string;
  tahun_ajaran: string;
  dosen: User;
}

interface IClassroomMembers {
  dosen: User,
  mahasiswa: User[] 
}

interface IAttachment {
  id?: string;
  name: string;
  type: "FILE" | "VIDEO" | "LINK";
  url: string;
  unique_name: string;
  status?: "original" | "new" | "deleted";
}

interface IMaterial {
  id: string
  title: string;
  description: string;
  attachments: IAttachment[];
  created_at: string;
  updated_at: string
}

interface INewMaterial {
  title: string;
  description?: string | null | undefined;
  attachments?: IAttachment[] | undefined;
}

interface IUpdateMaterial {
  title?: string;
  description?: string | null | undefined;
  attachments?: IAttachment[] | undefined;
}

interface IAssignment {
  id?: string?;
  title: string;
  deadline?: string?;
  instruction?: string?;
  rubrics?: IRubrics[];
  attachments?: IAttachment[];
  stats?: SubmissionStats | null;
}

interface SubmissionStats {
  total_students: number;
  total_submitted: number;
  total_graded: number;
}
interface IUpdateAssignment {
  id?: string?;
  title?: string;
  deadline?: string;
  instruction?: string;
  rubrics?: IRubrics[];
  attachments?: IAttachment[];
}

interface IRubrics {
  id?: string?;
  name: string;
  score: number;
}

export type {
  IJoinClassroom,
  ICreateClassroom,
  IUpdateClassroom,
  IClassroom,
  IClassroomMembers,

  ICreateAnnouncement,
  IAnnouncement,

  IMaterial,
  INewMaterial,
  IUpdateMaterial,
  IAttachment,

  IAssignment,
  IUpdateAssignment,
  IRubrics,
  SubmissionStats,
};
