import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import Image from "next/image";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/id";
import DOMPurify from "isomorphic-dompurify";
import { getCurrentUser } from "@/lib/auth";
import { ArrowLeft, Book } from "lucide-react";
import { materialServices } from "@/services/material.service";
import { IMaterial } from "@/types/Classroom";
import LinkMaterialItem from "./LinkMaterialItem";
import MaterialAction from "./MaterialAction";
import MaterialBreadcrumb from "./MaterialBreadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FileAttachmentSection from "./FileAttachmentSection/FileAttachmentSection";
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
        href={`/${role.toLowerCase()}/kelas/${classroomId}/materi`}
      >
        <Button className="rounded-full" variant={"ghost"}>
          <ArrowLeft /> Kembali
        </Button>
      </Link>
      <div className="p-4 w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex gap-4 items-center w-full">
              <div className="bg-primary p-4 border rounded-full">
                <Book color="white" />
              </div>
              <div>
                <div className="text-base md:text-xl font-bold">
                  {data.title}
                </div>
                <div className="text-gray-500 text-sm md:text-base">
                  {dayjs(data.created_at).format("lll")}
                </div>
              </div>
              {user?.role === "DOSEN" ? (
                <div className="ml-auto">
                  <CardAction>
                    <MaterialAction material={data} classroomId={classroomId} />
                  </CardAction>
                </div>
              ) : null}
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
        </Card>
      </div>
      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">LAMPIRAN</div>
          </CardHeader>
          <CardContent>
            {data.attachments &&
            data.attachments.filter(
              (a) => a.type === "FILE" || a.type === "VIDEO",
            ).length > 0 ? (
              <FileAttachmentSection
                attachments={data.attachments.filter(
                  (a) => a.type === "FILE" || a.type === "VIDEO",
                )}
              />
            ) : (
              <div className="h-23 flex items-center justify-center">
                Tidak ada lampiran
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="p-4 w-full">
        <Card>
          <CardHeader className="border-b-2 pb-2">
            <div className="text-base md:text-xl font-bold">Link Referensi</div>
          </CardHeader>
          <CardContent>
            {data.attachments &&
            data.attachments.filter((a) => a.type === "LINK").length > 0 ? (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {data.attachments
                    .filter((a) => a.type === "LINK")
                    .map((item) => (
                      <LinkMaterialItem key={item.id} linkMateri={item} />
                    ))}
                </div>
              </div>
            ) : (
              <div className="h-23 flex items-center justify-center">
                Tidak ada link referensi
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
