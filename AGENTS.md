# AGENTS.md

## Project Overview

LMS USTI - Learning Management System for Universitas Sains Dan Teknologi Indonesia. Monorepo with two packages:

- `lms-usti-fe/` — Next.js 15 frontend (App Router, TypeScript, React 19)
- `lms-usti-be/` — Go backend (Gin framework, GORM ORM, MySQL)

## Quick Commands

### Frontend (`lms-usti-fe/`)

```bash
npm run dev      # Start dev server (port 3000, uses Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
```

### Backend (`lms-usti-be/`)

```bash
air              # Start dev server with hot reload (uses .air.toml config)
go build -o ./tmp/main.exe .   # Manual build
go test ./...     # Run all tests (uses SQLite in-memory DB)
```

## Architecture

### Request Flow (Frontend -> Backend)

```
Client Component (React Hook Form)
  -> Server Action ("use server" in src/actions/)
    -> Service (src/services/) with Axios
      -> Go Backend API at localhost:3001/lms-usti-api
```

- Axios instance (`src/lib/axios.ts`) auto-attaches Bearer token from cookies
- Server Actions transform AxiosError into user-friendly Error messages
- After mutations, `revalidatePath()` refreshes server-side data

### Role-Based Routing

Four roles with protected route prefixes:

| Role    | Prefix        | Sidebar Config        |
|---------|---------------|-----------------------|
| MAHASISWA | `/mahasiswa` | `SIDEBAR_MAHASISWA` |
| DOSEN    | `/dosen`     | `SIDEBAR_DOSEN`      |
| ADMIN    | `/admin`     | `SIDEBAR_ADMIN`      |
| PRODI    | `/prodi`     | `SIDEBAR_PRODI`      |

Middleware (`src/middleware.ts`) enforces role access. Each role has its own layout file (`src/app/{role}/layout.tsx`) that fetches user data and wraps children in `DashboardLayout`.

### Frontend Conventions

- **UI Components**: shadcn/ui (New York style) in `src/components/ui/`
- **Forms**: React Hook Form + Zod validation (`src/schemas/`)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4 + `cn()` utility from `src/lib/utils.ts`
- **View Components**: `src/components/views/{Feature}/` — feature-specific components
- **Services**: `src/services/*.service.ts` — thin Axios wrappers
- **Endpoints**: `src/services/endpoint.constant.ts` — API path constants

### Backend Conventions

- **Layered Architecture**: `router/` -> `controllers/` -> `services/` -> `repositories/` -> `model/`
- **Auth Middleware**: JWT verification, sets `user` in gin context (`data.MeResponse`)
- **ACL Middleware**: Role-based access control, e.g. `aclMiddleware.Handle([]string{"DOSEN", "PRODI"})`
- **Database**: MySQL with GORM AutoMigrate on startup
- **Tests**: Go standard testing with SQLite in-memory DB (`go test ./...`)

## Environment Variables

### Frontend (`.env`)

```
API_URL=http://localhost:3001/lms-usti-api
BASE_CLIENT_URL=http://localhost:3000
```

### Backend (`.env`)

See `.env.example` — requires: `SECRET_KEY`, `DB_USERNAME`, `DB_PASSWORD`, `DEFAULT_PORT`, SMTP credentials, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

## Key Files to Know

| File | Purpose |
|------|---------|
| `lms-usti-fe/src/middleware.ts` | Auth + role-based route protection |
| `lms-usti-fe/src/routes.ts` | Public/auth route definitions |
| `lms-usti-fe/src/lib/axios.ts` | Axios instance with auth interceptor |
| `lms-usti-fe/src/lib/auth.ts` | `getCurrentUser()` server helper |
| `lms-usti-fe/src/components/layouts/DashboardLayout/` | Dashboard shell (sidebar + header) |
| `lms-usti-fe/src/components/layouts/DashboardLayout/DashboardLayout.constants.tsx` | Sidebar items per role |
| `lms-usti-be/router/api.go` | All API route definitions + middleware |
| `lms-usti-be/config/database.go` | DB connection + AutoMigrate |
| `lms-usti-be/middleware/auth.go` | JWT verification middleware |
| `lms-usti-be/middleware/acl.go` | Role-based ACL middleware |

## Rules

### Server Component Data Fetching

**Jangan fetch data di Client Component jika parent sudah adalah Server Component.**

Jika halaman (`page.tsx`) adalah Server Component, fetch data di sana, lalu pass sebagai props ke Client Component. Jangan fetch data lagi di Client Component menggunakan `useEffect` — ini menyebabkan double fetch, loading state yang tidak perlu, dan flash of content.

```tsx
// ❌ WRONG - Client Component fetch data sendiri
"use client";
export default function DetailPage({ postId }: { postId: string }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData(postId).then(setData); // fetch lagi di client
  }, [postId]);
}

// ✅ RIGHT - Server Component fetch, pass ke Client Component
// page.tsx (Server Component)
export default async function Page(props) {
  const { id } = await props.params;
  const data = await fetchData(id); // fetch di server
  return <DetailComponent data={data} />;
}

// DetailComponent.tsx (Client Component)
"use client";
export default function DetailComponent({ data }: { data: DataType }) {
  // gunakan data dari props, tidak perlu fetch lagi
}
```

### Component Props Interface

**Gunakan nama `PropTypes` untuk interface props di setiap Client Component.**

Gunakan nama yang konsisten `PropTypes` untuk interface props di semua Client Component. Hindari nama seperti `Props`, `DetailProps`, `PageProps`, atau nama lain yang bervariasi. Ini meningkatkan readability karena developer bisa langsung mengenali bahwa sebuah interface adalah props tanpa perlu membaca konteksnya.

```tsx
// ❌ WRONG - nama interface bervariasi
interface Props {
  title: string;
}

interface DetailPageProps {
  postId: string;
}

interface CommentSectionProps {
  comments: IComment[];
}

// ✅ RIGHT - konsisten pakai "PropTypes"
interface PropTypes {
  title: string;
}

interface PropTypes {
  postId: string;
}

interface PropTypes {
  comments: IComment[];
}
```

**Note:** Karena TypeScript tidak mengizinkan duplicate interface name di file yang sama, gunakan `PropTypes` sebagai nama standar di setiap file komponen. Setiap file komponen hanya punya satu interface `PropTypes`.

## Gotchas

- Backend uses `air` for hot reload — binary output goes to `tmp/main.exe`
- Frontend dev server uses Turbopack (not Webpack)
- `getCurrentUser()` calls `GET /auth/me` on every server render — do not call in loops
- Profile update revalidates paths for all roles (`/admin/pengaturan`, `/dosen/pengaturan`, `/mahasiswa/pengaturan`)
- Backend tests use SQLite in-memory, not MySQL — behavior may differ for DB-specific queries
- No CI/CD pipeline configured — lint and test manually before pushing
