/**
 * Akun test untuk E2E.
 *
 * Sumber:
 *  - 3 akun demo ditampilkan di halaman login (dosen/prodi/mahasiswa)
 *
 * Bisa di-override lewat environment variable agar tidak hardcode.
 */

type Role = "mahasiswa" | "dosen" | "prodi";

interface Account {
  email: string;
  password: string;
  /** Prefix home setelah login sukses (lihat src/actions/login.ts) */
  home: string;
}

export const BASE_URL = process.env.FE_URL ?? "http://localhost:3000";
export const API_URL =
  process.env.API_URL ?? "http://localhost:3001/lms-usti-api";

export const ACCOUNTS: Record<Role, Account> = {
  mahasiswa: {
    email: process.env.TEST_MAHASISWA_EMAIL ?? "mahasiswausti@yopmail.com",
    password: process.env.TEST_MAHASISWA_PASSWORD ?? "mahasiswausti123",
    home: "/mahasiswa",
  },
  dosen: {
    email: process.env.TEST_DOSEN_EMAIL ?? "dosenusti@yopmail.com",
    password: process.env.TEST_DOSEN_PASSWORD ?? "dosenusti123",
    home: "/dosen",
  },
  prodi: {
    email: process.env.TEST_PRODI_EMAIL ?? "proditi@yopmail.com",
    password: process.env.TEST_PRODI_PASSWORD ?? "prodiusti123",
    home: "/prodi",
  },
};

export const ROLES = Object.keys(ACCOUNTS) as Role[];

/**
 * Pola URL untuk waitForURL / toHaveURL.
 *
 * Catatan: Playwright mencocokkan regex terhadap full URL
 * ("http://localhost:3000/mahasiswa"), bukan path — jadi jangan pakai
 * anchor "^path" karena tidak akan pernah cocok. Pakai pola yang berakhiran
 * path home: "/mahasiswa$" cocok dengan full URL tersebut.
 */
export function homePattern(home: string) {
  return new RegExp(`${home}$`);
}
