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

interface ICreateClassroomForumPost {
  title: string;
  content: string;
}

interface IClassroomForumPost extends ICreateClassroomForumPost {
  id: string;
  classroom_name: string;
  created_by: string;
  created_at: string;
  is_pinned: boolean;
  comment_count?: number;
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
  is_archived: boolean;
  dosen: User;
}

interface IClassroomMembers {
  dosen: User,
  mahasiswa: User[] 
}

interface IAttachment {
  id?: string;
  name: string;
  type: "FILE" | "LINK";
  url: string;
  unique_name: string;
  status?: "original" | "new" | "deleted";
}

interface IMaterial {
  id: string
  title: string;
  description: string;
  view_count: number;
  attachments: IAttachment[];
  created_at: string;
  updated_at: string
  classroom_detail: {
    classroom_id: string;
    classroom_name: string;
  }
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
  classroom_name: string;
  deadline?: string?;
  instruction?: string?;
  view_count: number;
  attachments?: IAttachment[];
  stats?: SubmissionStats | null;
  my_submission_status?: string;
  my_score?: number | null;
  my_submission_date?: string | null;
}

interface SubmissionStats {
  total_students: number;
  total_submitted: number;
  total_graded: number;
}
interface IUpdateAssignment {
  id?: string?;
  title?: string;
  deadline?: string | null;
  instruction?: string;
  attachments?: IAttachment[];
}
interface IClassroomMemberDetail {
  class_name: string;
  member: {
    id: string;
    fullname: string;
    email: string;
    profile?: string;
    role: string;
    nim?: string;
    nidn?: string;
  };
}

interface ISubmissionDetail {
  mahasiswa: {
    id: string;
    fullname: string;
  };
  attachments: { name: string; type: string; url: string; unique_name: string }[];
  feedback: string | null;
}

interface ISubmission {
  id: string;
  status: string;
  submission_date: string | null;
  score: number | null;
  feedback: string | null;
  mahasiswa: {
    id: string;
    profile: string;
    fullname: string;
  };
}

interface IMySubmission {
  id: string;
  status: string;
  submission_date: string | null;
  score: number | null;
  feedback: string | null;
  attachments?: { name: string; type: string; url: string; unique_name: string }[];
}

interface IMahasiswaAssignmentItem {
  assignment_id: string;
  assignment_title: string;
  classroom_id: string;
  classroom_name: string;
  deadline: string | null;
  days_remaining: number | null;
}

interface IMahasiswaDashboardStats {
  upcoming_assignments: IMahasiswaAssignmentItem[];
}

interface IDashboardStats {
  total_classrooms: number;
  total_students: number;
  total_assignments: number;
}

interface IAssignmentWaitingGrade {
  submission_id: string;
  assignment_id: string;
  classroom_id: string;
  classroom_name: string;
  assignment_title: string;
  mahasiswa_id: string;
  mahasiswa_name: string;
  mahasiswa_profile: string;
  submission_date: string;
}

interface IClassroomPolicies {
  late_submission: string;
  forum_permission: string;
  comment_permission: string;
}

interface IComment {
  id: string;
  content: string;
  created_by: string;
  user: { fullname: string; profile: string };
  created_at: string;
}

export type {
  IJoinClassroom,
  ICreateClassroom,
  IUpdateClassroom,
  IClassroom,
  IClassroomMembers,

  ICreateClassroomForumPost,
  IClassroomForumPost,

  IMaterial,
  INewMaterial,
  IUpdateMaterial,
  IAttachment,

  IAssignment,
  IUpdateAssignment,
  SubmissionStats,
  IClassroomMemberDetail,
  ISubmissionDetail,
  ISubmission,
  IMySubmission,
  IDashboardStats,
  IAssignmentWaitingGrade,
  IComment,
  IMahasiswaAssignmentItem,
  IMahasiswaDashboardStats,
  IClassroomPolicies,
};
