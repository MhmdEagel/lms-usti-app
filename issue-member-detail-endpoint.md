# Issue: Ubah Fetch Detail Anggota ke Endpoint Dedicated

## Goal

Saat ini halaman detail anggota kelas mengambil **seluruh** daftar anggota (`GET /members`) lalu filter client-side untuk mencari satu anggota tertentu. Ubah agar menghit endpoint dedicated `GET /classroom/:id/members/:memberId` yang sudah tersedia di backend.

---

## Kondisi Saat Ini

**Backend** — sudah lengkap, tidak perlu diubah:
- Route: `GET /:id/members/:memberId` (`router/api.go:103`)
- Controller: `FindClassroomMemberById` — baca param `id` + `member` (`classroom_controller.go:259`)
- Service: `FindClassroomMemberByMemberId` — return `ClassroomMemberDetailResponse` (`classroom_service.go:151`)
- Response struct (`data/classroom.go:99`):
  ```go
  type ClassroomMemberDetailResponse struct {
      ClassName string     `json:"class_name"`
      Member    model.User
  }
  ```

**Frontend** — perlu diubah:
- `classroom.service.ts` — belum ada method untuk hit endpoint ini
- `mahasiswa/[memberId]/page.tsx` — fetch semua anggota via `getMembers()`, filter di client
- Route page `dosen/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx` — **belum ada**
- Type `IClassroomMemberDetail` — belum ada di `types/Classroom.d.ts`
- `MemberProfile.tsx` — prop `classroomName` belum didefinisikan (referensi undefined)

---

## Tahap 1 — Tambah Type Response

**File:** `src/types/Classroom.d.ts`

Tambahkan interface baru untuk response dari endpoint detail anggota:

```ts
interface IClassroomMemberDetail {
  class_name: string;
  member: {
    userId: string;
    fullname: string;
    email: string;
    profile?: string;
    role: string;
    nim?: string;
    nidn?: string;
  };
}
```

Tambahkan `IClassroomMemberDetail` ke dalam `export type { ... }`.

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 2 — Tambah Service Method

**File:** `src/services/classroom.service.ts`

Tambahkan method baru di object `classroomServices`:

```ts
getMemberDetail: (classroomId: string, memberId: string) =>
  instance.get(`${endpoint.CLASSROOM}/${classroomId}/members/${memberId}`),
```

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 3 — Update Route Page Mahasiswa

**File:** `src/app/mahasiswa/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx`

Saat ini: fetch semua anggota → filter client-side.

Ubah menjadi:
- Panggil `classroomServices.getMemberDetail(classroomId, memberId)` langsung
- Response `res.data.data` bertipe `IClassroomMemberDetail`
- Ambil `member` dari `data.member`
- Ambil `class_name` dari `data.class_name`
- Kirim `className` sebagai prop baru ke `<MemberProfile />`

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 4 — Buat Route Page Dosen

**File baru:** `src/app/dosen/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx`

Buat route page baru untuk dosen dengan pola yang sama seperti Tahap 3, bedanya:
- `viewerRole="DOSEN"`
- Ikuti struktur page yang sudah ada di mahasiswa

**Verifikasi:** `npx tsc --noEmit`

---

## Tahap 5 — Update Component MemberProfile

**File:** `src/components/common/MemberProfile/MemberProfile.tsx`

Perubahan yang diperlukan:

1. **Tambah prop `className`** — untuk ditampilkan di breadcrumb
2. **Perbaiki `MemberProfileBreadcrumb`** — ganti `classroomName` (undefined) dengan prop `className` yang baru
3. Pastikan semua data yang ditampilkan sesuai dengan field yang ada di `IClassroomMemberDetail.member` (yang merupakan `model.User`)

Prop interface baru:
```ts
{
  userId: string;
  fullname: string;
  profile?: string;
  email: string;
  nim?: string;
  role?: string;
  classroomId: string;
  className: string;       // ← baru
  viewerRole: "DOSEN" | "MAHASISWA";
}
```

**Verifikasi:** `npx tsc --noEmit && npm run build`

---

## Ringkasan File yang Diubah

| File | Status | Keterangan |
|------|--------|------------|
| `src/types/Classroom.d.ts` | Ubah | Tambah `IClassroomMemberDetail` |
| `src/services/classroom.service.ts` | Ubah | Tambah `getMemberDetail()` |
| `src/app/mahasiswa/.../mahasiswa/[memberId]/page.tsx` | Ubah | Ganti fetch logic |
| `src/app/dosen/.../mahasiswa/[memberId]/page.tsx` | Baru | Route page dosen |
| `src/components/common/MemberProfile/MemberProfile.tsx` | Ubah | Tambah prop `className`, fix breadcrumb |

---

## Referensi

- Backend response struct: `lms-usti-be/data/classroom.go:99-102`
- Backend service: `lms-usti-be/services/classroom_service.go:151-161`
- Backend controller: `lms-usti-be/controllers/classroom_controller.go:259-276`
- Backend route: `lms-usti-be/router/api.go:103`
- Backend User model fields: `userId`, `fullname`, `email`, `profile`, `role`, `nim`, `nidn`
