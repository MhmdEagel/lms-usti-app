import { Card, CardContent } from "@/components/ui/card";
import DeleteClassroomDialog from "./DeleteClassroomDialog";
import ArchiveClassroomDialog from "./ArchiveClassroomDialog";
import UnarchiveClassroomDialog from "./UnarchiveClassroomDialog";
import SettingsHeader from "../SettingsHeader/SettingsHeader";

interface PropTypes {
  classroomId: string;
  classroomName: string;
  isArchived: boolean;
}

export default function DangerZone({ classroomId, classroomName, isArchived }: PropTypes) {
  if (isArchived) {
    return (
      <Card className="border border-destructive">
        <CardContent className="pt-6">
          <SettingsHeader title="Zona Berbahaya" isDanger />
          <div className="flex flex-col items-start gap-4 sm:gap-3 sm:flex-row sm:items-center lg:gap-0">
            <div className="mr-auto">
              <div className="font-bold">Keluarkan dari Arsip</div>
              <div className="text-sm">
                Kelas akan kembali tampil di daftar kelas aktif.
              </div>
            </div>
            <UnarchiveClassroomDialog classroomId={classroomId} />
          </div>
        </CardContent>
        <hr className="mx-6" />
        <CardContent className="pb-6 pt-0">
          <div className="flex flex-col items-start gap-4 sm:gap-3 sm:flex-row sm:items-center lg:gap-0">
            <div className="mr-auto">
              <div className="font-bold">Hapus Kelas</div>
              <div className="text-sm">
                Menghapus kelas akan menghapus seluruh data kelas. Tindakan ini
                tidak dapat dibatalkan.
              </div>
            </div>
            <DeleteClassroomDialog
              classroomId={classroomId}
              classroomName={classroomName}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-destructive">
      <CardContent className="pt-6">
        <SettingsHeader title="Zona Berbahaya" isDanger />
        <div className="flex flex-col items-start gap-4 sm:gap-3 sm:flex-row sm:items-center lg:gap-0">
          <div className="mr-auto">
            <div className="font-bold">Arsipkan Kelas</div>
            <div className="text-sm">
              Kelas yang diarsipkan tidak akan tampil di daftar kelas aktif.
            </div>
          </div>
          <ArchiveClassroomDialog classroomId={classroomId} />
        </div>
        <hr className="my-4" />
        <div className="flex flex-col items-start gap-4 sm:gap-3 sm:flex-row sm:items-center lg:gap-0">
          <div className="mr-auto">
            <div className="font-bold">Hapus Kelas</div>
            <div className="text-sm">
              Menghapus kelas akan menghapus seluruh data kelas. Tindakan ini
              tidak dapat dibatalkan.
            </div>
          </div>
          <DeleteClassroomDialog
            classroomId={classroomId}
            classroomName={classroomName}
          />
        </div>
      </CardContent>
    </Card>
  );
}
