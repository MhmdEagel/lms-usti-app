import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, Book, Eye } from "lucide-react";
import { materialServices } from "@/services/material.service";
import { IMaterial } from "@/types/Classroom";
import MaterialAction from "./MaterialAction";
import ViewersDialog from "@/components/common/ViewersDialog/ViewersDialog";
import MaterialBreadcrumb from "./MaterialBreadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import MaterialTabNavigation from "./MaterialTabNavigation";
import MaterialAttachmentSection from "./MaterialAttachmentSection";
interface PropTypes {
classroomId: string;
materiId: string;
}

export default async function MaterialDetail(props: PropTypes) {
  const { classroomId, materiId } = props;
  const user = await getCurrentUser();
  const res = await materialServices.findMaterialById(classroomId, materiId);
  const data: IMaterial = res.data?.data;
  dayjs.extend(localizedFormat);
  dayjs.locale("id");
  const role: string = user.role;

  console.log(data)

  if (!data) {
    return (
      <div className="p-4 flex flex-col justify-center items-center h-128">
        <Image
          width={300}
          height={300}
          src={"/images/ilustration/404.svg"}
          alt="Not Found Image"
        />
        <div className="text-2xl md:text-4xl font-bold text-primary mb-1">
          404
          <div className="text-base md:text-2xl">Materi tidak ditemukan</div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4">
      <MaterialBreadcrumb
        classroomId={data.classroom_detail.classroom_id}
        materialId={materiId}
        classroomName={data.classroom_detail.classroom_name}
        materialName={data.title}
        role={user.role}
      />
      <Link
        className="mb-2"
        href={`/${role.toLowerCase()}/kelas/${classroomId}/pertemuan/materi`}
      >
        <Button className="rounded-full" variant={"ghost"}>
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <div className="p-4 w-full">
        <MaterialTabNavigation />
        <Card>
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 min-w-0">
              <CardHeader>
                <div className="flex gap-4 items-center w-full">
                  <div className="bg-primary p-4 border rounded-full shrink-0">
                    <Book color="white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base md:text-xl font-bold">
                      {data.title}
                    </div>
                    <div className="text-gray-500 text-sm md:text-base">
                      {dayjs(data.created_at).format("lll")}
                    </div>
                    {role === "DOSEN" || role === "PRODI" ? (
                      <ViewersDialog
                        viewableType="material"
                        classroomId={classroomId}
                        contentId={materiId}
                        viewCount={data.view_count}
                        trigger={
                          <button
                            type="button"
                            className="flex items-center gap-1 text-sm text-gray-500 mt-1 hover:text-gray-700 transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            {data.view_count} dilihat
                          </button>
                        }
                      />
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Eye className="h-3 w-3" />
                        {data.view_count} dilihat
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {data.description! !== "" ? (
                  <>
                    <div className="font-bold text-gray-500 text-sm">DESKRIPSI</div>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          data.description! !== ""
                            ? data.description!
                            : "Tidak ada materi",
                        ),
                      }}
                    ></div>
                  </>
                ) : null}
              </CardContent>
            </div>
            {user?.role === "DOSEN" && (
              <>
                <div className="hidden lg:block w-px bg-border" />
                <hr className="lg:hidden border-t border-border" />
                <div className="w-full lg:w-72 shrink-0 p-4 space-y-4">
                  <div>
                    <div className="font-bold text-gray-500 text-xs mb-2">AKSI</div>
                    <MaterialAction
                      material={data}
                      classroomId={classroomId}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">LAMPIRAN</div>
          </CardHeader>
          <CardContent>
            <MaterialAttachmentSection
              attachments={data.attachments || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
