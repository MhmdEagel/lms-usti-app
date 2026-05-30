import type { User } from "./Auth";

interface IJoinClassroom {
  code: string;
}
interface ICreateClassroom {
  class_cover: string?;
  class_name: string?;
  term: number?;
  room_number: number?;
  day: number?;
  class_start: string?;
  class_end: string?;
}
interface IUpdateClassroom {
  class_cover?: string?;
  class_name?: string?;
  term?: number?;
  room_number?: number?;
  day?: number?;
  class_start?: string?;
  class_end?: string?;
}

interface ICreateAnnouncement {
  title: string;
  content: string;
}

interface IAnnouncement extends ICreateAnnouncement {
  id: string;
  created_by: string;
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
  dosen: User;
}

interface IClassroomMembers {
  dosen: User,
  mahasiswa: User[] 
}

interface IMaterial {
  id: string
  title: string;
  description: string;
  files: IFileMaterial[];
  links: ILinkMaterial[];
  created_at: string;
  updated_at: string
}

interface INewMaterial {
  title: string;
  description?: string | null | undefined;
  files?: IFileMaterial[] | undefined;
  links?: ILinkMaterial[] | undefined;
}

interface IUpdateMaterial {
  title?: string;
  description?: string | null | undefined;
  files?: IFileMaterial[] | undefined;
  links?: ILinkMaterial[] | undefined;
}


interface ILinkMaterial {
  id?: string?;
  link_name: string;
  link_url: string;
}

interface IFileMaterial {
  id?: string?;
  file_name: string;
  unique_file_name: string;
  file_url: string;
  status?: "original" | "new" | "deleted";
}

interface IAssignment {
  id?: string?;
  title: string;
  deadline?: string?;
  instruction?: string?;
  rubrics?: IRubrics[]
}
interface IUpdateAssignment {
  id?: string?;
  title?: string;
  deadline?: string;
  instruction?: string;
  rubrics?: IRubrics[]
}

interface IRubrics {
  id?: string?;
  name: string;
  score: string;
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
  IFileMaterial,
  ILinkMaterial,


  IAssignment,
  IUpdateAssignment,
  IRubrics
};
