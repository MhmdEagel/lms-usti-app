"use client";

import { cn, getTimeString } from "@/lib/utils";
import { useDetail } from "./useDetail";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CLASS_DAYS from "@/constants/ClassDays.constant";
import { Button } from "@/components/ui/button";
import { IClassroom } from "@/types/Classroom";
import CLASS_COVER from "@/constants/classCover.constant";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function Detail({
  classroomId,
  classDetail,
}: {
  classroomId: string;
  classDetail: IClassroom;
}) {
  const { editForm, handleEdit, setCoverPreview, coverPreview, isPending } =
    useDetail();

  useEffect(() => {
    editForm.setValue("class_cover", classDetail.class_cover);
    editForm.setValue("day", classDetail.day.toString());
    setCoverPreview(classDetail.class_cover);
  }, [classDetail, setCoverPreview, editForm]);


  return (
    <Form {...editForm}>
      <form
        onSubmit={editForm.handleSubmit((data) => handleEdit(classroomId, data))}
      >
        <div
          className={cn("flex flex-col gap-4", {
            "gap-2": Object.keys(editForm.formState.errors).length > 0,
          })}
        >
          <Card className="bg-blue-200 min-h-30">
            <CardContent>
              <Image
                className="mx-auto block min-w-55 max-w-55"
                width={500}
                height={500}
                src={`/images/ilustration/classroom/${coverPreview}.svg`}
                alt="cover image"
              />
            </CardContent>
          </Card>
          <FormField
            name="class_cover"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Kelas</FormLabel>
                <Select
                  onValueChange={(value) => {
                    setCoverPreview(value);
                    return field.onChange(value);
                  }}
                  defaultValue={classDetail.class_cover}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih cover kelas" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLASS_COVER.map((item) => (
                      <SelectItem key={item.id} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="class_name"
            defaultValue={classDetail.class_name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kelas</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nama Kelas"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="room_number"
            defaultValue={classDetail.room_number.toString()}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Ruangan</FormLabel>
                <FormControl>
                  <Input
                    min={1}
                    max={16}
                    autoComplete="off"
                    type="number"
                    placeholder="Nomor Ruangan"
                    inputMode="numeric"
                    pattern="[1-9]{1}"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="class_start"
            defaultValue={getTimeString(classDetail.class_start)}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Mulai</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="Waktu Mulai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="class_end"
            defaultValue={getTimeString(classDetail.class_end)}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waktu Selesai</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="Waktu Selesai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl>
                  <Input
                    min={1}
                    autoComplete="off"
                    type="number"
                    placeholder="Semester"
                    inputMode="numeric"
                    pattern="[1-9]{1}"
                    defaultValue={classDetail.term.toString()}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hari Kelas</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={classDetail.day.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Hari" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLASS_DAYS.map((item) => (
                      <SelectItem key={item.id} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isPending} className="ml-auto" type="submit">
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
