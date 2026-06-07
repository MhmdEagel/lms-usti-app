# Issue: Refactor Material Components — Sync dengan Backend Attachment Model

## Goal

Refactor komponen material (create, edit, display) pada dashboard dosen agar sync dengan backend attachment model yang sudah di-refactor dari `files` + `links` terpisah menjadi unified `attachments` array.

**Fokus:** Frontend only — components, hooks, schemas, actions. Backend diabaikan.

**File yang diubah:**
- `src/schemas/material.ts` — schema validasi
- `src/schemas/schemas.ts` — `newMaterialSchema`
- `src/actions/new-material.ts` — create action
- `src/actions/edit-material.ts` — update action
- `src/actions/delete-material-batch.ts` — batch delete action
- `src/actions/delete-file-material.ts` — single delete action
- `src/components/views/.../CreateMaterialDialog/useCreateMaterialDialog.tsx` — hook create
- `src/components/views/.../CreateMaterialDialog/CreateMaterialDialog.tsx` — form create
- `src/components/views/.../CreateMaterialDialog/FileItem/FileItem.tsx` — file item create
- `src/components/views/.../CreateMaterialDialog/LinkItem/LinkItem.tsx` — link item create
- `src/components/views/.../CreateMaterialDialog/AddLinkDialog/AddLinkDialog.tsx` — add link create
- `src/components/views/.../EditMaterialDialog/useEditMaterialDialog.tsx` — hook edit
- `src/components/views/.../EditMaterialDialog/EditMaterialDialog.tsx` — form edit
- `src/components/views/.../EditMaterialDialog/FileItem/FileItem.tsx` — file item edit
- `src/components/views/.../EditMaterialDialog/LinkItem/LinkItem.tsx` — link item edit
- `src/components/views/.../EditMaterialDialog/AddLinkDialog/AddLinkDialog.tsx` — add link edit
- `src/components/common/MaterialDetail/MaterialDetail.tsx` — detail display
- `src/components/common/MaterialDetail/FileMaterialItem/FileMaterialItem.tsx` — file card
- `src/components/common/MaterialDetail/LinkMaterialItem/LinkMaterialItem.tsx` — link card
- `src/components/views/.../Material/Material.tsx` — material list

**Types yang sudah diupdate (dari issue sebelumnya):**
- `src/types/Classroom.d.ts` — `IMaterial`, `INewMaterial`, `IUpdateMaterial` sudah pakai `attachments: IAttachment[]`
- `src/types/Classroom.d.ts` — `IFileMaterial` dan `ILinkMaterial` sudah dihapus, `IAttachment` sudah ditambah

---

## Perubahan Backend (Referensi)

### Lama (frontend saat ini)
```
IMaterial.files: IFileMaterial[]
IMaterial.links: ILinkMaterial[]
INewMaterial.files: IFileMaterial[]
INewMaterial.links: ILinkMaterial[]
```

### Baru (backend setelah refactor)
```
IMaterial.attachments: IAttachment[]
INewMaterial.attachments: IAttachment[]
IUpdateMaterial.attachments: IAttachment[]
```

### Format IAttachment
```json
{
  "id": "string (optional)",
  "name": "string",
  "type": "FILE | VIDEO | LINK",
  "url": "string",
  "unique_name": "string (wajib untuk FILE/VIDEO)"
}
```

---

## Tahapan

### Tahap 1 — Update Schemas

**Apa:** Update Zod schemas agar pakai field `attachments` bukan `files` + `links`.

**Cara:**
- **`schemas/material.ts`**: Hapus `FileSchema` dan `LinkSchema`. Ganti `files` dan `links` jadi `attachments: z.array(AttachmentSchema).optional()` di `createMaterialSchema`
- **`schemas/schemas.ts`**: Hapus `FileSchema` dan `LinkSchema`. Ganti field `files` dan `links` di `newMaterialSchema` jadi `attachments`
- Tambah `AttachmentSchema` baru: `{ name: z.string(), type: z.enum(["FILE", "VIDEO", "LINK"]), url: z.string(), unique_name: z.string() }`

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 2 — Update Server Actions

**Apa:** Update actions agar pakai type `IAttachment` bukan `IFileMaterial`.

**Cara:**
- **`delete-material-batch.ts`**: Ganti parameter `files: IFileMaterial[]` jadi `attachments: IAttachment[]`. Update import.
- **`delete-file-material.ts`**: Tidak perlu perubahan (sudah pakai string parameter).
- **`new-material.ts`**: Cek type `INewMaterial` sudah match (sudah diupdate di issue sebelumnya).
- **`edit-material.ts`**: Cek type `IUpdateMaterial` sudah match.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 3 — Refactor Create Material Hook

**Apa:** `useCreateMaterialDialog` harus manage satu array `attachments` bukan dua array `files` + `links`.

**Cara:**
- Ganti `arrayOfFiles: IFileMaterial[]` dan `arrayOfLinks: ILinkMaterial[]` jadi satu `arrayOfAttachments: IAttachment[]`
- **`handleUploadFile`**: Setelah upload, buat `IAttachment` object dengan `type: "FILE"` dan tambah ke `arrayOfAttachments`
- **`handleClose`**: Filter `arrayOfAttachments` yang `type === "FILE"` untuk batch delete (file yang perlu dihapus dari storage)
- **`handleMaterialForm`**: Kirim `arrayOfAttachments` ke action
- **Default form values**: Ganti `files: [], links: []` jadi `attachments: []`
- **`useEffect`**: Sync `arrayOfAttachments` ke form value `attachments`

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 4 — Refactor Create Material Dialog

**Apa:** Update `CreateMaterialDialog.tsx` dan sub-components untuk pakai `attachments`.

**Cara:**
- **`CreateMaterialDialog.tsx`**:
  - Ganti `arrayOfFiles` / `arrayOfLinks` jadi `arrayOfAttachments`
  - Render file items: filter `arrayOfAttachments` where `type === "FILE"`
  - Render link items: filter `arrayOfAttachments` where `type === "LINK"`
- **`FileItem.tsx`**: Ganti type `IFileMaterial` jadi `IAttachment`. Update props (field names: `file_name` → `name`, `unique_file_name` → `unique_name`, `file_url` → `url`). Update `handleDelete` untuk filter berdasarkan `unique_name`.
- **`LinkItem.tsx`**: Ganti type `ILinkMaterial` jadi `IAttachment`. Update props (field names: `link_name` → `name`, `link_url` → `url`). Update `handleDelete` untuk filter berdasarkan index/name.
- **`AddLinkDialog.tsx`**: Ganti type `ILinkMaterial` jadi `IAttachment`. Buat `IAttachment` object dengan `type: "LINK"` saat add link. Update `setValue("links", ...)` jadi `setValue("attachments", ...)`.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 5 — Refactor Edit Material Hook

**Apa:** `useEditMaterialDialog` harus manage satu array `attachments` dengan tracking status.

**Cara:**
- Ganti `TrackedFile` (extends `IFileMaterial`) jadi `TrackedAttachment` (extends `IAttachment`)
- Hapus `TrackedLink` — sudah tidak perlu (gabung ke `TrackedAttachment`)
- Ganti `trackedFiles` dan `trackedLinks` jadi satu `trackedAttachments: TrackedAttachment[]`
- **`initializeFiles`**: Ganti jadi `initializeAttachments(attachments: IAttachment[])` — set semua status ke `"original"`
- **`handleUploadFile`**: Buat `TrackedAttachment` dengan `type: "FILE"` dan `status: "new"`
- **`handleDeleteFile`**: Update untuk cari berdasarkan `unique_name` di `trackedAttachments`
- **`handleClose`**: Filter file yang `status === "new"` untuk cleanup
- **`handleMaterialForm`**: Kirim attachments yang `status !== "deleted"` ke action, lalu batch delete yang `status === "deleted"`

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 6 — Refactor Edit Material Dialog

**Apa:** Update `EditMaterialDialog.tsx` dan sub-components untuk pakai `attachments`.

**Cara:**
- **`EditMaterialDialog.tsx`**:
  - Ganti `material.files` dan `material.links` jadi filter `material.attachments` by type
  - Panggil `initializeAttachments(filteredAttachments)` saat mount
- **`FileItem.tsx` (edit)**: Update props dari `IFileMaterial` ke `IAttachment`. Field names: `file_name` → `name`, `unique_file_name` → `unique_name`.
- **`LinkItem.tsx` (edit)**: Update props dari `ILinkMaterial` ke `IAttachment`. Field names: `link_name` → `name`, `link_url` → `url`.
- **`AddLinkDialog.tsx` (edit)**: Buat `IAttachment` dengan `type: "LINK"` saat add. Update `setValue` ke field `attachments`.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 7 — Refactor Material Detail Display

**Apa:** `MaterialDetail.tsx` dan sub-components harus display attachments berdasarkan type.

**Cara:**
- **`MaterialDetail.tsx`**:
  - Ganti `data.files` jadi `data.attachments?.filter(a => a.type === "FILE")`
  - Ganti `data.links` jadi `data.attachments?.filter(a => a.type === "LINK")`
- **`FileMaterialItem.tsx`**: Ganti type `IFileMaterial` ke `IAttachment`. Update field names: `file_name` → `name`, `file_url` → `url`.
- **`LinkMaterialItem.tsx`**: Ganti type `ILinkMaterial` ke `IAttachment`. Update field names: `link_name` → `name`, `link_url` → `url`.

**Checkpoint:** `npx tsc --noEmit`

---

### Tahap 8 — Refactor Material List

**Apa:** `Material.tsx` (material list server component) sudah benar — hanya display `title` dan `created_at`. Tidak perlu perubahan signifikan.

**Cara:**
- Cek type `IMaterial` sudah match (sudah diupdate di issue sebelumnya)
- Tidak ada field `files`/`links` yang diakses di list view

**Checkpoint:** `npm run build`

---

## File yang Terlibat

| File | Tahap | Aksi |
|------|-------|------|
| `src/schemas/material.ts` | 1 | Ganti files/links jadi attachments |
| `src/schemas/schemas.ts` | 1 | Ganti files/links jadi attachments |
| `src/actions/delete-material-batch.ts` | 2 | Ganti IFileMaterial ke IAttachment |
| `src/components/.../CreateMaterialDialog/useCreateMaterialDialog.tsx` | 3 | Refactor ke single attachments array |
| `src/components/.../CreateMaterialDialog/CreateMaterialDialog.tsx` | 4 | Update render logic |
| `src/components/.../CreateMaterialDialog/FileItem/FileItem.tsx` | 4 | Ganti IFileMaterial ke IAttachment |
| `src/components/.../CreateMaterialDialog/LinkItem/LinkItem.tsx` | 4 | Ganti ILinkMaterial ke IAttachment |
| `src/components/.../CreateMaterialDialog/AddLinkDialog/AddLinkDialog.tsx` | 4 | Buat IAttachment dengan type LINK |
| `src/components/.../EditMaterialDialog/useEditMaterialDialog.tsx` | 5 | Refactor ke single attachments array |
| `src/components/.../EditMaterialDialog/EditMaterialDialog.tsx` | 6 | Update render logic |
| `src/components/.../EditMaterialDialog/FileItem/FileItem.tsx` | 6 | Ganti IFileMaterial ke IAttachment |
| `src/components/.../EditMaterialDialog/LinkItem/LinkItem.tsx` | 6 | Ganti ILinkMaterial ke IAttachment |
| `src/components/.../EditMaterialDialog/AddLinkDialog/AddLinkDialog.tsx` | 6 | Buat IAttachment dengan type LINK |
| `src/components/common/MaterialDetail/MaterialDetail.tsx` | 7 | Filter attachments by type |
| `src/components/common/MaterialDetail/FileMaterialItem/FileMaterialItem.tsx` | 7 | Ganti IFileMaterial ke IAttachment |
| `src/components/common/MaterialDetail/LinkMaterialItem/LinkMaterialItem.tsx` | 7 | Ganti ILinkMaterial ke IAttachment |

---

## Verifikasi

Setelah semua tahap selesai:
1. Run `npx tsc --noEmit` — pasti compile tanpa type error
2. Run `npm run build` — pasti build sukses
3. Test manual:
   - Create material tanpa attachment → berhasil
   - Create material dengan upload file PDF → file tersimpan, muncul di detail
   - Create material dengan tambah link → link tersimpan, muncul di detail
   - Create material dengan file + link campuran → keduanya muncul
   - Edit material → bisa ganti title/description
   - Edit material → bisa tambah/hapus file
   - Edit material → bisa tambah/hapus link
   - Delete material → berhasil dan redirect ke list
   - Lihat material detail → file dan link muncul dengan benar
