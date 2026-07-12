"use client";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { updateProfileSchema } from "@/schemas/profile";

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;

interface ProfileEditProps {
  form: UseFormReturn<UpdateProfileForm>;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (values: UpdateProfileForm) => Promise<void>;
  role: string;
  nim?: string;
  nidn?: string;
}

export default function ProfileEdit({
  form,
  isPending,
  onCancel,
  onSubmit,
  role,
  nim,
  nidn,
}: ProfileEditProps) {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardHeader className="border-b px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base font-bold text-primary">
            Informasi Pribadi
          </h3>
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            <X className="size-4 mr-1" />
            Batal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-5">
              {(role === "MAHASISWA") && (
                <div>
                  <p className="text-xs text-muted-foreground">NIM</p>
                  <p className="text-sm font-semibold">{nim || "-"}</p>
                </div>
              )}
              {(role === "DOSEN") && (
                <div>
                  <p className="text-xs text-muted-foreground">NIDN</p>
                  <p className="text-sm font-semibold">{nidn || "-"}</p>
                </div>
              )}
              <FormField
                control={form.control}
                name="fullname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isPending}>
                <Pencil className="size-4 mr-1" />
                {isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
