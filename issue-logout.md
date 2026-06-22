# Issue: Logout Functionality via Sidebar

## Goal

Tambahkan fungsi logout yang sudah ada di UI sidebar (tombol Logout di dropdown user nav) dengan server action untuk clear cookie dan redirect ke halaman login.

---

## Analisis

### Kondisi Saat Ini

- **`DashboardUserNav`** (`DashboardSidebar/DashboardUserNav/DashboardUserNav.tsx`):
  - Sudah punya tombol "Logout" dengan icon `LogOut` di dropdown menu (line 89-92)
  - Sudah punya prop `onLogout?: () => void` (line 31)
  - Belum di-pass handler dari parent

- **`DashboardSidebar`** (`DashboardSidebar/DashboardSidebar.tsx`):
  - Render `DashboardUserNav` tanpa pass `onLogout` (line 75-77)

- **`login.ts`** (server action):
  - Login set cookie `access_token` via `cookies().set()`
  - Logout perlu clear cookie yang sama

- **Backend**: Tidak ada endpoint logout — logout hanya clear cookie di client side

---

## Tahap 1 — Buat Server Action Logout

**File:** `src/actions/logout.ts` (baru)

Buat server action untuk logout:
```typescript
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/auth/login");
}
```

**Pattern:** Sama seperti `login.ts` — gunakan `cookies()` dari `next/headers` untuk clear cookie, lalu `redirect()` ke halaman login.

**Checkpoint:** `npx tsc --noEmit`

---

## Tahap 2 — Wire Logout ke Sidebar

**File:** `src/components/layouts/DashboardLayout/DashboardSidebar/DashboardSidebar.tsx`

- Import `logoutUser` dari `@/actions/logout`
- Buat handler `handleLogout` yang panggil `logoutUser()`
- Pass `onLogout={handleLogout}` ke `DashboardUserNav`

```typescript
const handleLogout = async () => {
  await logoutUser();
};
```

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tindakan |
|------|----------|
| `src/actions/logout.ts` | Buat baru (server action) |
| `src/components/layouts/DashboardLayout/DashboardSidebar/DashboardSidebar.tsx` | Update (pass `onLogout` ke `DashboardUserNav`) |

---

## Verifikasi

1. `npx tsc --noEmit` — tanpa type error
2. `npm run build` — build sukses
3. Test manual:
   - Login sebagai role apapun (Mahasiswa/Dosen/Admin)
   - Klik avatar di sidebar → dropdown muncul
   - Klik "Logout" → cookie terhapus → redirect ke `/auth/login`
   - Coba akses `/mahasiswa` atau `/dosen` atau `/admin` → redirect ke login (karena tidak ada cookie)
