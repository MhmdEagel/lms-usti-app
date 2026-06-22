# Issue: Fitur Tambah User — Admin User Management

## Goal

Tambahkan tombol "Tambah User" di halaman Manajemen User yang membuka dialog form untuk membuat user baru. Form submit akan hit API `POST /admin/users/create`.

---

## Referensi Pola

- **Dialog pattern:** Lihat `CreateClassroom.tsx` dan `useCreateClassroom.ts` sebagai template. Pola yang sama akan digunakan.
- **Server action pattern:** Lihat `src/actions/admin.ts` — sudah ada `getAllUsers`. Tambahkan `createUser` di file yang sama.
- **Service pattern:** Lihat `src/services/admin.service.ts` — tambahkan method `createUser`.
- **Schema pattern:** Lihat `src/schemas/schemas.ts` sebagai referensi Zod schema.

---

## Tahap 1 — Backend Service & Server Action

**File:** `src/services/admin.service.ts`

Tambahkan method `createUser` yang POST ke `/admin/users/create` dengan body `{ fullname, email, password, role }`.

**File:** `src/actions/admin.ts`

Tambahkan server action `createUser` yang memanggil `adminServices.createUser(data)`.

**File:** `src/types/Admin.d.ts`

Tambahkan interface `ICreateUserRequest`:
```typescript
interface ICreateUserRequest {
  fullname: string;
  email: string;
  password: string;
  role: "MAHASISWA" | "DOSEN" | "PRODI" | "ADMIN";
}
```

---

## Tahap 2 — Zod Schema

**File:** `src/schemas/admin.ts` (baru)

Buat Zod schema untuk validasi form:
- `fullname`: string, required
- `email`: string, required, email format
- `password`: string, required, min 8 karakter
- `role`: enum `MAHASISWA | DOSEN | PRODI | ADMIN`, required

---

## Tahap 3 — Hook `useCreateUserDialog`

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/CreateUserDialog/useCreateUserDialog.ts` (baru)

Hook yang handle:
- State `isOpen` (kontrol dialog) dan `isPending` (loading)
- `createUserForm` — `useForm` + `zodResolver` dari schema di Tahap 2
- `handleCreateUser` — panggil server action `createUser`, tutup dialog + refresh data jika sukses, tampilkan error di form jika gagal
- `handleCloseForm` — tutup dialog + reset form

Pattern: copy dari `useCreateClassroom.ts`, ganti logic-nya.

---

## Tahap 4 — Component `CreateUserDialog`

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/CreateUserDialog/CreateUserDialog.tsx` (baru)

Dialog form dengan:
- Trigger: tombol icon `+` (pakai `<Plus />` dari lucide-react), label tooltip "Tambah User"
- Form fields:
  - **Nama Lengkap** — `<Input>`
  - **Email** — `<Input type="email">`
  - **Password** — `<Input type="password">`
  - **Role** — `<Select>` dengan 4 options (MAHASISWA, DOSEN, PRODI, ADMIN)
- Footer: tombol "Batal" (DialogClose) + tombol "Simpan" (submit, tampilkan `<Spinner>` saat loading)

Pattern: copy dari `CreateClassroom.tsx`, sesuaikan fields-nya.

---

## Tahap 5 — Integrasi ke Halaman

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/UserManagement.tsx`

Update agar:
- Menampilkan `CreateUserDialog` di area header tabel (ujung kanan)
- Setelah user berhasil dibuat, tabel harus refresh menampilkan data terbaru

---

## Checkpoint

1. `npx tsc —noEmit` — tidak ada type error
2. Test manual: klik tombol + → dialog muncul → isi form → submit → dialog tutup + tabel refresh
3. Test validasi: submit form kosong → error muncul di masing-masing field
4. Test error backend: submit email yang sudah ada → error message muncul

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `src/types/Admin.d.ts` | Tambah `ICreateUserRequest` |
| `src/services/admin.service.ts` | Tambah `createUser` |
| `src/actions/admin.ts` | Tambah `createUser` server action |
| `src/schemas/admin.ts` | Buat baru — Zod schema |
| `src/components/.../CreateUserDialog/useCreateUserDialog.ts` | Buat baru — hook |
| `src/components/.../CreateUserDialog/CreateUserDialog.tsx` | Buat baru — dialog component |
| `src/components/.../UserManagement/UserManagement.tsx` | Update — integrasi dialog |
