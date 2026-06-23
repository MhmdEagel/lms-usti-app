# Issue: API Update Profile + Edit Mode di Halaman Pengaturan

## Goal

1. Buat API endpoint untuk update profil sendiri (fullname, profile image, email) — berlaku untuk dosen dan mahasiswa
2. Ubah tampilan "Informasi Pribadi" di halaman profil: saat klik Edit, card berubah menjadi form input dengan default value dari data yang ada, lalu submit ke API via server action

---

## Kondisi Saat Ini

| Aspek | Status |
|-------|--------|
| Backend update user | Hanya admin bisa (`PUT /admin/users/:id/update`) — **belum ada endpoint self-service** |
| Frontend Profile | Card "Informasi Pribadi" sudah ada, tapi tombol Edit **disabled** (tidak bisa diklik) |
| Server action update profile | **Belum ada** |
| Zod schema profile | **Belum ada** |

---

## Tahap 1 — Backend: Buat Data Type untuk Update Profile

**File:** `lms-usti-be/data/auth.go`

Tambah struct baru untuk request update profil:

```go
type UpdateProfileRequest struct {
    Fullname *string `json:"fullname"`
    Email    *string `json:"email"`
    Profile  *string `json:"profile"`
}
```

Gunakan pointer (`*string`) supaya field bersifat optional — hanya field yang dikirim yang diupdate.

**Checkpoint:** `go build ./...`

---

## Tahap 2 — Backend: Buat Service & Repository Method

**File:** `lms-usti-be/services/auth_service.go` (atau buat service baru `profile_service.go`)

Tambah method `UpdateProfile`:
- Terima `userId` (dari JWT) + `data.UpdateProfileRequest`
- Ambil user dari database berdasarkan `userId`
- Update field yang tidak nil (pakai pointer check)
- Simpan perubahan ke database
- Return error jika user tidak ditemukan

**File:** `lms-usti-be/repositories/user_repository.go`

Repository sudah punya method `FindById` dan `Update` yang bisa direuse.

**Checkpoint:** `go build ./...`

---

## Tahap 3 — Backend: Buat Controller & Route

**File:** `lms-usti-be/controllers/auth_controller.go`

Tambah method `UpdateProfile`:
- Bind JSON ke `data.UpdateProfileRequest`
- Ambil `userId` dari JWT context (sama seperti `getUserId(ctx)`)
- Panggil service `UpdateProfile`
- Return response sukses

**File:** `lms-usti-be/router/api.go`

Tambah route baru di group `auth`:

```go
auth.Use(authMiddleware.Handle()).PUT("/me/profile", authController.UpdateProfile)
```

Full path: `PUT /lms-usti-api/auth/me/profile` — hanya perlu auth, tanpa ACL role restriction.

**Checkpoint:** `go build ./...`

---

## Tahap 4 — Frontend: Tambah Service & Endpoint

**File:** `lms-usti-fe/src/services/endpoint.constant.ts`

Tambah endpoint:
```ts
PROFILE: "/auth/me/profile"
```

**File baru:** `lms-usti-fe/src/services/profile.service.ts`

Buat service untuk call API update profile:
```ts
updateProfile: (data: IUpdateProfileRequest) =>
    instance.put(endpoint.PROFILE, data)
```

**File:** `lms-usti-fe/src/types/Auth.d.ts` (atau buat `Profile.d.ts`)

Tambah type:
```ts
interface IUpdateProfileRequest {
    fullname?: string;
    email?: string;
    profile?: string;
}
```

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 5 — Frontend: Tambah Zod Schema

**File baru:** `lms-usti-fe/src/schemas/profile.ts`

```ts
export const updateProfileSchema = z.object({
    fullname: z.string().min(1, "Nama wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    profile: z.string().optional(),
});
```

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 6 — Frontend: Tambah Server Action

**File baru:** `lms-usti-fe/src/actions/profile.ts`

```ts
"use server"
// Update profile → call profileService.updateProfile
// Handle AxiosError → throw plain Error
// revalidatePath("/admin/pengaturan", "/dosen/pengaturan", "/mahasiswa/pengaturan")
```

Ikuti pola yang sama seperti `actions/admin.ts`.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 7 — Frontend: Buat Hook useProfileForm

**File baru:** `lms-usti-fe/src/components/views/Dashboard/Profile/useProfileForm.ts`

Hook ini mengelola:
- State `isEditing` (boolean) — toggle antara view mode dan edit mode
- `useForm` dari react-hook-form dengan `zodResolver(updateProfileSchema)`
- `handleEdit` function — panggil server action `updateProfile`, tampilkan toast sukses/error
- `isPending` state untuk loading indicator

Default values diisi dari data user yang diterima sebagai props.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 8 — Frontend: Buat Komponen ProfileEdit

**File baru:** `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileEdit/ProfileEdit.tsx`

Client component yang menampilkan form edit:
- Input field untuk Nama Lengkap (default: current fullname)
- Input field untuk Email (default: current email)
- Input field untuk Link Foto Profil (default: current profile URL)
- Tombol "Simpan" (submit) dan "Batal" (cancel, kembali ke view mode)
- Menggunakan komponen `Form`, `FormField`, `Input`, `Button` dari shadcn

**File baru:** `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileEdit/useProfileEdit.ts`

Hook untuk manage edit state + form submission (bisa digabung dengan `useProfileForm` atau terpisah).

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 9 — Frontend: Update Profile.tsx dengan Edit Mode

**File:** `lms-usti-fe/src/components/views/Dashboard/Profile/Profile.tsx`

Update komponen ini:
- Ubah dari server component menjadi **client component** (tambah `"use client"`)
- Terima `isEditing`, `onEdit`, `onCancel` sebagai props (atau manage state sendiri via hook)
- **View mode** (default): tampilkan card seperti sekarang, tombol Edit bisa diklik
- **Edit mode**: render `<ProfileEdit />` sebagai pengganti card "Informasi Pribadi"
- Tombol Edit → set `isEditing = true`
- Tombol Batal di form → set `isEditing = false`
- Submit berhasil → set `isEditing = false` + data refresh

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 10 — Frontend: Update ProfileContent

**File:** `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileContent.tsx`

Pastikan `ProfileContent` meneruskan semua props yang diperlukan ke `Profile`, termasuk callback untuk refresh data setelah update.

**Checkpoint:** `npx tsc --noEmit && npm run build`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `lms-usti-be/data/auth.go` | Update — tambah `UpdateProfileRequest` |
| `lms-usti-be/services/auth_service.go` | Update — tambah method `UpdateProfile` |
| `lms-usti-be/controllers/auth_controller.go` | Update — tambah method `UpdateProfile` |
| `lms-usti-be/router/api.go` | Update — tambah route `PUT /auth/me/profile` |
| `lms-usti-fe/src/services/endpoint.constant.ts` | Update — tambah `PROFILE` endpoint |
| `lms-usti-fe/src/services/profile.service.ts` | **Baru** — service update profile |
| `lms-usti-fe/src/types/Auth.d.ts` | Update — tambah `IUpdateProfileRequest` |
| `lms-usti-fe/src/schemas/profile.ts` | **Baru** — Zod schema |
| `lms-usti-fe/src/actions/profile.ts` | **Baru** — server action |
| `lms-usti-fe/src/components/views/Dashboard/Profile/Profile.tsx` | Update — tambah edit mode |
| `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileEdit/ProfileEdit.tsx` | **Baru** — form edit component |
| `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileEdit/useProfileEdit.ts` | **Baru** — edit hook |
| `lms-usti-fe/src/components/views/Dashboard/Profile/ProfileContent.tsx` | Update — pastikan props tersalurkan |

---

## Verifikasi

1. `go build ./...` — backend build sukses
2. `npx tsc --noEmit` — tanpa type error
3. `npm run build` — build sukses
4. Test manual:
   - Login sebagai dosen/mahasiswa → Pengaturan → Data Diri
   - Klik tombol "Edit" → card berubah menjadi form dengan default value terisi
   - Ubah nama / email / link foto → klik "Simpan"
   - Toast sukses muncul, kembali ke view mode, data terupdate
   - Klik "Batal" → kembali ke view mode tanpa perubahan
   - Validasi error muncul jika format email salah atau nama kosong
