# Issue: Fitur Edit & Delete User

## Goal

Tambahkan fitur edit dan delete user di halaman Manajemen User. Setiap baris tabel punya kolom "Aksi" dengan tombol tiga titik (Popover) yang berisi tombol Edit dan Hapus.

---

## Naming Convention

> **Semua nama component, folder, file, dan variable harus pakai Bahasa Inggris.**
> - Folder: `EditUserDialog/`, `DeleteUserDialog/`
> - File: `EditUserDialog.tsx`, `useEditUserDialog.ts`, `DeleteUserDialog.tsx`
> - Component: `EditUserDialog`, `DeleteUserDialog`, `UserAction`
> - Sidebar label boleh Indonesia untuk tampilan

---

## Analisis

### Backend Yang Sudah Ada
- `PUT /admin/users/:id/update` — update user (partial update, semua field optional)
- Request body: `{ fullname?: string, email?: string, role?: string }`
- **Catatan:** Tidak ada field `password` di update — hanya profil

### Backend Yang Perlu Ditambahkan
- `DELETE /admin/users/:id` — hapus user (perlu dibuat di backend)
- `GET /admin/users/:id` — detail user (route sudah ada tapi **tanpa handler**)

### Pola Yang Ada (Referensi)
- **MaterialAction** (`src/components/common/MaterialDetail/MaterialAction/MaterialAction.tsx`):
  - `Popover` + `EllipsisVertical` icon
  - State `openEditDialog`, `openDeleteDialog`, `openPopOver`
  - Konten popover: tombol "Edit" dan "Hapus"
- **DeleteMaterialDialog** — `AlertDialog` controlled via `open`/`setOpen`
- **DeleteAction (Announcement)** — `AlertDialog` + `useTransition` + `toast.success`
- **CreateUserDialog** — form dengan `react-hook-form` + `zodResolver`, input Fullname, Email, Password, Select Role

---

## Tahap 1 — Backend: Tambah Endpoint Delete & Get User By ID

> **Catatan:** Tahap ini di backend, tapi perlu diselesaikan dulu sebelum frontend bisa jalan.

**File:** `lms-usti-be/controllers/admin_controller.go`

Tambah 2 method:
- `DeleteUser(ctx *gin.Context)` — ambil `:id` dari param, panggil service, return 200/404/500
- `FindUserById(ctx *gin.Context)` — ambil `:id` dari param, panggil service, return 200 dengan data user

**File:** `lms-usti-be/services/admin_service.go`

Tambah 2 method di `AdminServiceInterface`:
- `DeleteUser(userId string) error` — hapus user berdasarkan ID
- `FindUserById(userId string) (*data.MeResponse, error)` — cari user by ID

**File:** `lms-usti-be/router/api.go`

Update route admin:
```go
admin.GET("/:id", adminController.FindUserById)    // tambah handler
admin.PUT("/:id/update", adminController.UpdateUser)
admin.DELETE("/:id", adminController.DeleteUser)     // tambah route baru
```

**Checkpoint:** `go build ./...`

---

## Tahap 2 — Frontend: Service & Server Action

**File:** `src/services/admin.service.ts`

Tambah 2 method:
```typescript
getUserById: (id: string) =>
  instance.get(`${endpoint.ADMIN}/users/${id}`),

updateUser: (id: string, data: IUpdateUserRequest) =>
  instance.put(`${endpoint.ADMIN}/users/${id}/update`, data),

deleteUser: (id: string) =>
  instance.delete(`${endpoint.ADMIN}/users/${id}`),
```

**File:** `src/actions/admin.ts`

Tambah 3 server action:
```typescript
export async function getUserById(id: string) {
  try {
    const res = await adminServices.getUserById(id);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function updateUser(id: string, data: IUpdateUserRequest) {
  try {
    const res = await adminServices.updateUser(id, data);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}

export async function deleteUser(id: string) {
  try {
    const res = await adminServices.deleteUser(id);
    return res.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(err.response?.data.meta.message);
    }
    throw error;
  }
}
```

> **Pattern:** Error handling di dalam server action (sama seperti `login.ts`), bukan di client.

**File:** `src/types/Admin.d.ts`

Tambah type:
```typescript
interface IUpdateUserRequest {
  fullname?: string;
  email?: string;
  role?: "MAHASISWA" | "DOSEN" | "PRODI" | "ADMIN";
}

interface IUpdateUserRequest {
  fullname?: string;
  email?: string;
  role?: "MAHASISWA" | "DOSEN" | "PRODI" | "ADMIN";
}
```

**File:** `src/schemas/admin.ts`

Tambah schema edit (sama dengan create tapi semua field optional kecuali yang wajib):
```typescript
export const updateUserSchema = z.object({
  fullname: z.string().min(1, "Nama wajib diisi").optional(),
  email: z.string().email("Format email tidak valid").optional(),
  role: z.enum(["MAHASISWA", "DOSEN", "PRODI", "ADMIN"]).optional(),
});
```

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 3 — Buat Hook `useEditUserDialog`

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/EditUserDialog/useEditUserDialog.ts` (baru)

Buat hook mirip `useCreateUserDialog`:
- Props: `user: IUser`, `onSuccess?: () => void`
- `isOpen` / `setIsOpen` — kontrol dialog
- `isPending` — loading state
- `editUserForm` — `useForm` dengan `zodResolver(updateUserSchema)`, **defaultValues** dari props `user`:
  ```typescript
  defaultValues: {
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  }
  ```
- `handleEditUser` — panggil server action `updateUser(user.userId, data)`, handle success (tutup + refresh), handle error (set error di form)
- `handleCloseForm` — tutup + reset form

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 4 — Buat Component `EditUserDialog`

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/EditUserDialog/EditUserDialog.tsx` (baru)

Buat dialog form mirip `CreateUserDialog`:
- `"use client"` directive
- Props: `user: IUser`, `open: boolean`, `setOpen: Dispatch<SetStateAction<boolean>>`, `onSuccess?: () => void`
- Controlled via `open`/`setOpen` (bukan trigger internal)
- Import pattern sama seperti `CreateUserDialog`
- Form fields:
  - `fullname` — `<Input placeholder="Nama Lengkap" />`
  - `email` — `<Input type="email" placeholder="Email" />`
  - `role` — `<Select>` dengan options: MAHASISWA, DOSEN, PRODI, ADMIN
  - **Tidak ada field password** — hanya edit profil
- Buttons: "Batal" (DialogClose) + "Simpan" (submit + Spinner saat loading)
- Root error display jika ada

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 5 — Buat Component `DeleteUserDialog`

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/DeleteUserDialog/DeleteUserDialog.tsx` (baru)

Buat alert dialog mirip `DeleteMaterialDialog`:
- `"use client"` directive
- Props: `user: IUser`, `open: boolean`, `setOpen: Dispatch<SetStateAction<boolean>>`, `onSuccess?: () => void`
- Gunakan `AlertDialog` + `AlertDialogContent` + `AlertDialogHeader` + `AlertDialogFooter`
- Konten:
  - Title: "Hapus User"
  - Description: "Apakah anda yakin ingin menghapus user [nama]? Akun yang dihapus tidak dapat dikembalikan."
- Buttons: "Batal" (AlertDialogCancel) + "Hapus" (AlertDialogAction)
- `useTransition` untuk loading state saat delete
- Panggil server action `deleteUser(user.userId)`
- `toast.success("User berhasil dihapus")` setelah berhasil
- `onSuccess?.()` untuk refresh data parent

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 6 — Buat Component `UserAction` (Three Dots + Popover)

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/UserAction/UserAction.tsx` (baru)

Buat action column mirip `MaterialAction`:
- `"use client"` directive
- Props: `user: IUser`, `onSuccess?: () => void`
- State: `openEditDialog`, `openDeleteDialog`, `openPopOver`
- Render:
  ```tsx
  <Popover open={openPopOver} onOpenChange={setOpenPopOver}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon">
        <EllipsisVertical />
      </Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-fit p-4">
      <div className="flex flex-col gap-1">
        <Button variant="ghost" onClick={...}>Edit</Button>
        <Button variant="ghost" onClick={...}>Hapus</Button>
      </div>
    </PopoverContent>
  </Popover>
  ```
- Tombol Edit: buka `EditUserDialog`
- Tombol Hapus: buka `DeleteUserDialog`
- Render `EditUserDialog` dan `DeleteUserDialog` di bawah Popover (controlled via state)

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 7 — Integrasi ke UserTable

**File:** `src/components/views/Dashboard/DashboardAdmin/UserManagement/UserTable.tsx`

Update kolom tabel:
- Import `UserAction`
- Tambah kolom baru di posisi paling kanan:
  ```typescript
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <UserAction user={row.original} onSuccess={() => router.refresh()} />
    ),
  }
  ```
- Kolom "No" bisa dipertahankan atau dihapus (terserah, karena sudah ada index)

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `lms-usti-be/controllers/admin_controller.go` | Tambah `DeleteUser`, `FindUserById` |
| `lms-usti-be/services/admin_service.go` | Tambah `DeleteUser`, `FindUserById` |
| `lms-usti-be/router/api.go` | Update route admin |
| `src/services/admin.service.ts` | Tambah `getUserById`, `updateUser`, `deleteUser` |
| `src/actions/admin.ts` | Tambah 3 server action |
| `src/types/Admin.d.ts` | Tambah `IUpdateUserRequest` |
| `src/schemas/admin.ts` | Tambah `updateUserSchema` |
| `src/components/views/Dashboard/DashboardAdmin/UserManagement/EditUserDialog/EditUserDialog.tsx` | Buat baru |
| `src/components/views/Dashboard/DashboardAdmin/UserManagement/EditUserDialog/useEditUserDialog.ts` | Buat baru |
| `src/components/views/Dashboard/DashboardAdmin/UserManagement/DeleteUserDialog/DeleteUserDialog.tsx` | Buat baru |
| `src/components/views/Dashboard/DashboardAdmin/UserManagement/UserAction/UserAction.tsx` | Buat baru |
| `src/components/views/Dashboard/DashboardAdmin/UserManagement/UserTable.tsx` | Update — tambah kolom Aksi |

---

## Type yang Digunakan

```typescript
// Sudah ada di src/types/Admin.d.ts
interface IUser {
  userId: string;
  fullname: string;
  email: string;
  role: string;
}

// Tambah
interface IUpdateUserRequest {
  fullname?: string;
  email?: string;
  role?: "MAHASISWA" | "DOSEN" | "PRODI" | "ADMIN";
}

// Schema tambahan di src/schemas/admin.ts
const updateUserSchema = z.object({
  fullname: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(["MAHASISWA", "DOSEN", "PRODI", "ADMIN"]).optional(),
});
```

---

## Backend Response Format

```json
// GET /admin/users/:id
{
  "meta": { "status": 200, "message": "successfully find user" },
  "data": { "userId": "xxx", "email": "...", "role": "MAHASISWA", "fullname": "..." }
}

// PUT /admin/users/:id/update
{
  "meta": { "status": 200, "message": "user successfully updated" },
  "data": null
}

// DELETE /admin/users/:id
{
  "meta": { "status": 200, "message": "user successfully deleted" },
  "data": null
}
```

---

## Verifikasi

1. `npx tsc --noEmit` — tanpa type error
2. `npm run build` — build sukses
3. `go build ./...` — backend build sukses
4. Test manual:
   - Login sebagai ADMIN → `/admin/users`
   - Klik tiga titik di baris user → Popover muncul dengan tombol Edit dan Hapus
   - Klik Edit → Dialog muncul dengan data user terisi (fullname, email, role)
   - Ubah salah satu field → Simpan → dialog tertutup + tabel refresh + data updated
   - Klik Hapus → AlertDialog muncul dengan konfirmasi nama user
   - Klik "Hapus" di AlertDialog → loading spinner → toast success + tabel refresh
   - Klik "Batal" di AlertDialog → dialog tertutup, data tetap
5. **Pastikan semua nama component dalam Bahasa Inggris** (EditUserDialog, DeleteUserDialog, UserAction)
