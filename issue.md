# Issue: Perbaikan Frontend Types & Service Handlers

## Goal

Perbaiki TypeScript types dan service handlers agar sync dengan backend API setelah refactor attachment model dan announcement fixes.

**Fokus:** Frontend only — types, services, dan server actions. Tidak ada perubahan di backend.

**File yang diubah:**
- `lms-usti-fe/src/types/Classroom.d.ts`
- `lms-usti-fe/src/types/Response.d.ts`
- `lms-usti-fe/src/services/material.service.ts`
- `lms-usti-fe/src/services/assignment.service.ts`
- `lms-usti-fe/src/services/media.service.ts`

---

## Bug List

| # | Severity | Lokasi | Deskripsi |
|---|----------|--------|-----------|
| 1 | HIGH | `Classroom.d.ts` | Material types masih pakai model lama `files` + `links`, backend sudah pakai unified `attachments` |
| 2 | HIGH | `Classroom.d.ts` | Assignment types tidak ada field `attachments` |
| 3 | HIGH | `material.service.ts` | Create/update tidak transform ke format `attachments` backend |
| 4 | HIGH | `assignment.service.ts` | Create/update tidak kirim `attachments` |
| 5 | MEDIUM | `Classroom.d.ts` | `IRubrics.score` adalah `string`, backend expect `int` |
| 6 | LOW | `Response.d.ts` | `meta.status` adalah `string`, backend kirim `number` |
| 7 | LOW | `Classroom.d.ts` | `IAnnouncement` tidak ada field `created_at` |
| 8 | LOW | `media.service.ts` | Missing `deleteBatch` untuk assignments |

---

## Backend Reference (untuk sinkronisasi)

### AttachmentRequest (untuk kirim ke backend)
```json
{
  "name": "string (required)",
  "type": "FILE | VIDEO | LINK (required)",
  "url": "string (required)",
  "unique_name": "string (required untuk FILE/VIDEO)"
}
```

### AttachmentResponse (dari backend)
```json
{
  "id": "string",
  "name": "string",
  "type": "FILE | VIDEO | LINK",
  "url": "string",
  "unique_name": "string"
}
```

### MaterialRequest
```json
{
  "title": "string (required)",
  "description": "string",
  "attachments": ["AttachmentRequest"]
}
```

### AssignmentRequest
```json
{
  "title": "string (required)",
  "deadline": "time (required)",
  "instruction": "string",
  "rubrics": [{"name": "string", "score": 0}],
  "attachments": ["AttachmentRequest"]
}
```

---

## Tahapan

### Tahap 1 — Fix types di `Classroom.d.ts`

**Apa:** Update semua TypeScript interface agar sync dengan backend response/request.

**Cara:**
- **Hapus** interface `ILinkMaterial` dan `IFileMaterial`
- **Tambah** interface baru `IAttachment`:
  ```
  id?: string
  name: string
  type: "FILE" | "VIDEO" | "LINK"
  url: string
  unique_name: string
  ```
- **Update `IMaterial`**: Ganti `files` + `links` jadi `attachments: IAttachment[]`
- **Update `INewMaterial`**: Ganti `files` + `links` jadi `attachments: IAttachment[]`
- **Update `IUpdateMaterial`**: Ganti `files` + `links` jadi `attachments: IAttachment[]`
- **Update `IAssignment`**: Tambah field `attachments: IAttachment[]`
- **Update `IUpdateAssignment`**: Tambah field `attachments: IAttachment[]`
- **Update `IRubrics`**: Ganti `score: string` jadi `score: number`
- **Update `IAnnouncement`**: Tambah field `created_at: string`
- **Update exports**: Hapus `IFileMaterial`, `ILinkMaterial`. Tambah `IAttachment`.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 2 — Fix types di `Response.d.ts`

**Apa:** `meta.status` harus `number` (backend kirim integer, bukan string).

**Cara:**
- Ganti `status: string` jadi `status: number` di `ErrorResponse` dan `APIResponse`

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 3 — Update `material.service.ts`

**Apa:** Service harus transform `IFileMaterial[]` + `ILinkMaterial[]` ke format `attachments` sebelum kirim ke backend.

**Cara:**
- Import `IAttachment` dari types
- **`create` method**: Terima payload dengan format baru (`attachments: IAttachment[]`). Tidak perlu transform lagi karena sudah match.
- **`update` method**: Sama — terima payload dengan format baru.
- **Jika ada code lama yang masih transform files/links** di server actions, hapus dan ganti dengan langsung pakai `attachments`.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 4 — Update `assignment.service.ts`

**Apa:** Assignment create/update harus sertakan `attachments` di payload.

**Cara:**
- **`create` method**: Pastikan `IAssignment` sudah punya field `attachments`. Kirim ke backend.
- **`update` method**: Pastikan `IUpdateAssignment` sudah punya field `attachments`. Kirim ke backend.
- Tidak perlu perubahan logic, cukup pastikan types match.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 5 — Tambah `deleteBatch` untuk assignments di `media.service.ts`

**Apa:** `media.service.ts` belum punya batch delete untuk assignment files.

**Cara:**
- Tambah method `deleteAssignmentBatch` yang POST ke `/media/assignments/delete-batch`
- Payload format sama dengan `deleteBatch` materials: `{ files: IFileMaterial[] }`

**Checkpoint:** `npx tsc --noEmit`

---

## File yang Terlibat

| File | Tahap | Aksi |
|------|-------|------|
| `src/types/Classroom.d.ts` | 1 | Hapus IFileMaterial/ILinkMaterial, tambah IAttachment, update IMaterial/INewMaterial/IUpdateMaterial/IAssignment/IUpdateAssignment/IRubrics/IAnnouncement |
| `src/types/Response.d.ts` | 2 | Ganti status: string → number |
| `src/services/material.service.ts` | 3 | Update create/update payload types |
| `src/services/assignment.service.ts` | 4 | Update create/update payload types |
| `src/services/media.service.ts` | 5 | Tambah deleteAssignmentBatch |

---

## Verifikasi

Setelah semua tahap selesai:
1. Run `npx tsc --noEmit` — pasti compile tanpa type error
2. Run `npm run build` — pasti build sukses
3. Test manual:
   - Create material dengan attachment FILE → pasti tersimpan
   - Create material dengan attachment LINK → pasti tersimpan
   - Create assignment dengan rubric + attachment → pasti tersimpan
   - Delete material → pasti berhasil
   - Delete assignment → pasti berhasil
