# Issue: Bungkus Item Anggota Kelas dengan Card + Halaman Profil Anggota

## Goal

1. Bungkus item anggota kelas menggunakan `Card` dengan hover pattern yang sama seperti `MaterialItem`, dan buat item tersebut clickable untuk navigasi ke halaman detail anggota.
2. Buat halaman profil anggota kelas yang menampilkan data diri (avatar, nama, NIM, email) dan aksi (Kirim Email, Keluarkan dari Kelas).

---

## Kondisi Saat Ini

| Aspek | Status |
|-------|--------|
| `MemberItem` | Sudah ada — tapi hanya `<div>` biasa dengan Avatar + nama, **tidak ada Card**, **tidak ada hover**, **tidak clickable** |
| `ClassroomMembers` | Sudah ada — server component, fetch data members, render list MemberItem |
| MaterialItem pattern | Sudah ada — `Card` + `cursor-pointer` + `Link` sebagai wrapper |
| Route `mahasiswa/[memberId]` | **Belum ada** — tidak ada halaman detail anggota |
| Backend `GET /members` | Sudah ada — return `ClassroomMembersReponse` dengan data User lengkap (fullname, email, profile, nim) |
| Backend single member endpoint | **Belum ada** — tidak perlu dibuat, data sudah tersedia dari response members |

---

## Tahap 1 — Frontend: Update MemberItem menjadi Card

**File:** `src/components/common/ClassroomMembers/MemberItem/MemberItem.tsx`

Ubah dari `<div>` biasa menjadi `Card` + `Link` mengikuti pola `MaterialItem`:

- Bungkus dengan `Link` yang navigasi ke `/{role}/kelas/{classroomId}/mahasiswa/{userId}`
- Render `Card` dengan `cursor-pointer`
- Di dalam Card: tampilkan Avatar + nama (layout yang sama seperti sekarang)
- Tambahkan props `classroomId` dan `userRole` untuk membangun URL navigasi

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 2 — Frontend: Update ClassroomMembers

**File:** `src/components/common/ClassroomMembers/ClassroomMembers.tsx`

- Teruskan `classroomId` ke `MemberItem` (sudah tersedia sebagai props)
- Untuk dosen: gunakan `user.role` untuk membangun URL yang benar

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 3 — Frontend: Buat Halaman Detail Anggota

**File baru:** `src/app/dosen/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx`

Server component:
- Extract `classroomId` dan `memberId` dari params
- Fetch data members dari `classroomServices.getMembers(classroomId)`
- Cari anggota berdasarkan `memberId` dari response
- Render komponen `MemberProfile`

**File baru:** `src/app/mahasiswa/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx`

Pola sama untuk mahasiswa.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 4 — Frontend: Buat Komponen MemberProfile

**File baru:** `src/components/common/MemberProfile/MemberProfile.tsx`

Server component dengan layout sesuai spesifikasi:

**Header:**
- Judul "Profil Anggota Kelas" (bold, besar, rata kiri)
- Tombol sidebar toggle (ikuti pola dari layout yang sudah ada, atau gunakan icon `PanelLeft` dari lucide-react)
- Garis horizontal pemisah di bawah

**Kartu Konten Utama:**
- `Card` besar dengan border tipis, sudut melengkung
- Di dalam kartu:

**Avatar:**
- Avatar bulat di tengah atas kartu
- Tampilkan foto profil atau fallback initials

**Seksi Informasi:**
- Label "INFORMASI" (kapital, bold) + garis pemisah
- Field bertumpuk vertikal:
  - Nama (label bold) → nilai
  - NIM (label bold) → nilai
  - Email (label bold) → nilai

**Seksi Aksi:**
- Label "AKSI" (kapital, bold) + garis pemisah
- Dua tombol outlined berjajar horizontal:
  - "Kirim Email" — `mailto:` link
  - "Keluarkan dari Kelas" — button (hanya untuk dosen, dengan konfirmasi AlertDialog)

**File baru:** `src/components/common/MemberProfile/index.tsx`

Barrel export.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 5 — Frontend: Handle Role-based Visibility

- Tombol "Kirim Email" ditampilkan untuk semua role (dosen dan mahasiswa)
- Tombol "Keluarkan dari Kelas" **hanya ditampilkan untuk dosen**
- Mahasiswa yang melihat profil anggota lain **tidak melihat** tombol "Keluarkan dari Kelas"

**Checkpoint:** `npx tsc --noEmit && npm run build`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `src/components/common/ClassroomMembers/MemberItem/MemberItem.tsx` | Update — ubah ke Card + Link |
| `src/components/common/ClassroomMembers/ClassroomMembers.tsx` | Update — teruskan `classroomId` ke MemberItem |
| `src/app/dosen/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx` | **Baru** — route halaman detail anggota (dosen) |
| `src/app/mahasiswa/kelas/[classroomId]/(detail-kelas)/mahasiswa/[memberId]/page.tsx` | **Baru** — route halaman detail anggota (mahasiswa) |
| `src/components/common/MemberProfile/MemberProfile.tsx` | **Baru** — komponen profil anggota |
| `src/components/common/MemberProfile/index.tsx` | **Baru** — barrel export |

---

## Referensi

- Pola Card hover (MaterialItem): `src/components/views/Dashboard/DashboardDosen/Classroom/Material/MaterialItem/MaterialItem.tsx`
- MemberItem saat ini: `src/components/common/ClassroomMembers/MemberItem/MemberItem.tsx`
- ClassroomMembers: `src/components/common/ClassroomMembers/ClassroomMembers.tsx`
- Route pattern (detail): `src/app/dosen/kelas/[classroomId]/(detail-kelas)/mahasiswa/page.tsx`
- User model (backend): `lms-usti-be/model/user.go` — field: `userId`, `fullname`, `email`, `profile`, `nim`, `nidn`

---

## Verifikasi

1. **Frontend:** `npx tsc --noEmit && npm run build` tanpa error
2. **Test manual:**
   - Login dosen → buka kelas → tab Mahasiswa → setiap anggota ditampilkan dalam Card
   - Hover pada Card → efek hover muncul (cursor pointer)
   - Klik Card anggota → berpindah ke halaman profil anggota
   - Halaman profil menampilkan: avatar, nama, NIM, email
   - Tombol "Kirim Email" → buka email client
   - Tombol "Keluarkan dari Kelas" → muncul konfirmasi AlertDialog (hanya untuk dosen)
   - Login mahasiswa → buka kelas → tab Mahasiswa → klik anggota → halaman profil muncul
   - Tombol "Keluarkan dari Kelas" **tidak terlihat** untuk mahasiswa
