interface IUser {
  userId: string;
  fullname: string;
  email: string;
  role: string;
}

interface PaginationInfo {
  limit: number;
  total_pages: number;
  total: number;
  current: number;
}

interface ICreateUserRequest {
  fullname: string;
  email: string;
  password: string;
  role: "MAHASISWA" | "DOSEN" | "PRODI" | "ADMIN";
}
