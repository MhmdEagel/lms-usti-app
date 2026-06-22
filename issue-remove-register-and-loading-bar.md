# Issue: Hapus Register & Tambah Loading Bar

## Goal

1. Hapus fitur register (frontend & backend) — hanya admin yang bisa mendaftarkan akun lewat dashboard
2. Tambah loading bar biru (warna primary) reusable di root layout untuk setiap navigasi halaman dan logout

---

## Bagian 1 — Hapus Fitur Register

### Analisis

**Frontend — file yang perlu dihapus:**
| File | Alasan |
|------|--------|
| `src/components/views/Auth/Register/RegisterMahasiswa/` (folder) | Form register mahasiswa |
| `src/components/views/Auth/Register/RegisterDosen/` (folder) | Form register dosen |
| `src/components/views/Auth/Register/RegisterSuccess/RegisterSuccess.tsx` | Halaman sukses register |
| `src/app/(authentication)/auth/register/` (folder) | 3 halaman route register |
| `src/actions/register.ts` | Server action register |
| `src/actions/activateUser.ts` | Aktivasi email setelah register |

**Frontend — yang perlu di-update:**
| File | Perubahan |
|------|-----------|
| `src/schemas/schemas.ts` | Hapus `registerSchema` |
| `src/types/Auth.d.ts` | Hapus `IRegister` |
| `src/services/auth.service.ts` | Hapus method `register` |
| `src/routes.ts` | Hapus path register dari `authRoutes` |
| `src/components/views/Auth/Login/Login.tsx` | Hapus link "Belum punya akun? register" |

**Backend — yang perlu dihapus:**
| File | Perubahan |
|------|-----------|
| `lms-usti-be/data/auth.go` | Hapus `RegisterRequest` (sudah tidak dipakai frontend) |
| `lms-usti-be/main_auth_test.go` | Hapus fungsi `TestRegister` dan data test-nya |

**Backend — yang perlu di-update:**
- Tidak ada route `POST /auth/register` di backend (tidak perlu dihapus)
- `RegisterRequest` hanya dipakai oleh `AdminController.CreateUser` — pindahkan struct ke `data/admin.go` jika masih diperlukan

**Checkpoint:** `npx tsc --noEmit` + `go build ./...`

---

### Tahap 1.1 — Hapus Register Components & Pages

- Hapus folder: `src/components/views/Auth/Register/` (semua isinya)
- Hapus folder: `src/app/(authentication)/auth/register/` (semua isinya)

### Tahap 1.2 — Hapus Server Action Register

- Hapus file: `src/actions/register.ts`
- Hapus file: `src/actions/activateUser.ts`

### Tahap 1.3 — Update Schema, Types, Service, Routes

- `src/schemas/schemas.ts` — hapus `registerSchema`
- `src/types/Auth.d.ts` — hapus interface `IRegister`
- `src/services/auth.service.ts` — hapus method `register`
- `src/routes.ts` — hapus path:
  - `/auth/register/mahasiswa`
  - `/auth/register/dosen`
  - `/auth/register/success`
  - `/auth/register/activate`

### Tahap 1.4 — Update Login Component

- `Login.tsx` — hapus bagian link register:
  ```tsx
  <div className="text-center">
    Belum punya akun?{" "}
    <Link href={"/auth/register/mahasiswa"}>register</Link>
  </div>
  ```

### Tahap 1.5 — Backend Cleanup

- `lms-usti-be/data/auth.go` — hapus `RegisterRequest` (pindahkan ke `data/admin.go` jika masih dipakai admin controller)
- `lms-usti-be/main_auth_test.go` — hapus `TestRegister`

**Checkpoint:** `npx tsc --noEmit` + `go build ./...`

---

## Bagian 2 — Tambah Loading Bar

### Analisis

- Root layout (`src/app/layout.tsx`) saat ini hanya `<body>{children}</body>` — tidak ada loading indicator global
- Tidak ada `loading.tsx` di app router
- Tidak ada dependensi nprogress atau library loading bar
- Next.js App Router (`next/navigation`) punya `useNavigation()` hook yang memberikan `navigation.state` — bisa digunakan untuk trigger loading bar

Pattern yang akan digunakan:
- **Component** `LoadingBar` — reusable, animated bar biru di bagian paling atas halaman
- **Trigger** — gunakan `useNavigation()` dari `next/navigation` untuk detect route change
- **Tempat** — root layout, di atas semua konten

### Tahap 2.1 — Buat Component LoadingBar

**File:** `src/components/ui/loading-bar.tsx` (baru)

Buat component reusable:
- `"use client"`
- Gunakan `useNavigation()` dari `next/navigation`
- State: `loading` — `true` saat `navigation.state === "loading"`, `false` saat `"idle"`
- Render: bar horizontal tipis (height ~3px) di bagian paling atas viewport
- Warna: `bg-primary` (biru, sesuai tema shadcn)
- Animasi: infinite slide / progress animation saat loading
  - CSS `animate-pulse` atau keyframes custom
- Posisi: `fixed top-0 left-0 z-[9999]`
- Transisi: muncul dengan `opacity` saat loading, hilang setelah selesai

**Checkpoint:** `npx tsc --noEmit`

### Tahap 2.2 — Integrasi ke Root Layout

**File:** `src/app/layout.tsx`

- Import `LoadingBar` dari `@/components/ui/loading-bar`
- Render di dalam `<body>`, sebelum `{children}`:
  ```tsx
  <body>
    <LoadingBar />
    {children}
  </body>
  ```

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `src/components/views/Auth/Register/` (folder) | Hapus seluruh folder |
| `src/app/(authentication)/auth/register/` (folder) | Hapus seluruh folder |
| `src/actions/register.ts` | Hapus |
| `src/actions/activateUser.ts` | Hapus |
| `src/schemas/schemas.ts` | Hapus `registerSchema` |
| `src/types/Auth.d.ts` | Hapus `IRegister` |
| `src/services/auth.service.ts` | Hapus method `register` |
| `src/routes.ts` | Hapus path register |
| `src/components/views/Auth/Login/Login.tsx` | Hapus link register |
| `src/components/ui/loading-bar.tsx` | Buat baru |
| `src/app/layout.tsx` | Tambah `<LoadingBar />` |
| `lms-usti-be/data/auth.go` | Hapus/pindah `RegisterRequest` |
| `lms-usti-be/main_auth_test.go` | Hapus `TestRegister` |

---

## Verifikasi

1. `npx tsc --noEmit` — tanpa type error
2. `npm run build` — build sukses
3. `go build ./...` — backend build sukses
4. Test manual register:
   - Buka `/auth/login` — tidak ada link "register"
   - Buka `/auth/register/mahasiswa` — 404 (route dihapus)
   - Buka `/auth/register/dosen` — 404
5. Test manual loading bar:
   - Login sebagai role apapun
   - Klik navigasi sidebar (Dashboard, Kelas, dll) — loading bar muncul di atas halaman
   - Klik Logout — loading bar muncul, redirect ke login
   - Loading bar hilang setelah halaman selesai load
