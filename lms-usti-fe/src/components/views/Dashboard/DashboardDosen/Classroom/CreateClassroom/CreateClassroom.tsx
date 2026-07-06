"use client";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PROGRAM_STUDI from "@/constants/programStudi.constant";
import { Input } from "@/components/ui/input";
import useCreateClassroom from "./useCreateClassroom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Spinner } from "@/components/ui/spinner";
import { Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import CLASS_COVER from "@/constants/classCover.constant";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CLASS_DAYS from "@/constants/ClassDays.constant";

export default function CreateClassroom() {
  const {
    isPending,
    coverPreview,
    setCoverPreview,
    handleCreateClassroom,
    createClassForm,
    isOpen,
    handleCloseForm,
    setIsOpen,
  } = useCreateClassroom();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size={"icon"} variant="default">
              <Plus />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Buat Kelas</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent
        resetForm={() => createClassForm.reset()}
        className="overflow-y-auto max-h-150"
      >
        <Form {...createClassForm}>
          <form onSubmit={createClassForm.handleSubmit(handleCreateClassroom)}>
            <DialogHeader>
              <DialogTitle>Buat Kelas</DialogTitle>
              <DialogDescription>
                Silahkan masukkan data yang diperlukan untuk membuat kelas anda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <Card className="bg-blue-200 min-h-30 mt-4">
                <CardContent>
                  <Image
                    width={500}
                    height={500}
                    className="mx-auto block min-w-55 max-w-55"
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
                      defaultValue={field.value}
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
                control={createClassForm.control}
                name="class_name"
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
                control={createClassForm.control}
                name="room_number"
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
                control={createClassForm.control}
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
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createClassForm.control}
                name="class_start"
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
                control={createClassForm.control}
                name="class_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu Selesai</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        placeholder="Waktu Selesai"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createClassForm.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari Kelas</FormLabel>
                    <Select onValueChange={field.onChange}>
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
              <FormField
                control={createClassForm.control}
                name="prodi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Program Studi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Program Studi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROGRAM_STUDI.map((item) => (
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
              <FormField
                control={createClassForm.control}
                name="tahun_ajaran"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun Ajaran</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: 2025/2026"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <DialogClose asChild>
                  <Button onClick={handleCloseForm} variant="outline">
                    Batal
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    "Menyimpan..."
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
