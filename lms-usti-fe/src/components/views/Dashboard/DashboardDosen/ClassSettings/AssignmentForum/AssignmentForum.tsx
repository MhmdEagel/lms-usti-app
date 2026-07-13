"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { useAssignmentForum } from "./useAssignmentForum";
import type { IClassroomPolicies } from "@/types/Classroom";

interface PropTypes {
  classroomId: string;
  policies: IClassroomPolicies | null;
}

export default function AssignmentForum({ classroomId, policies }: PropTypes) {
  const { form, isPending, onSubmit } = useAssignmentForum(classroomId, policies);
  const { control, handleSubmit } = form;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 pb-6">
        <FormField
          control={control}
          name="lateSubmission"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base">Pengumpulan Setelah Tenggat</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="allow" id="late-allow" />
                      <Label htmlFor="late-allow" className="text-sm sm:text-base leading-relaxed">Izinkan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_allowed" id="late-not-allowed" />
                      <Label htmlFor="late-not-allowed" className="text-sm sm:text-base leading-relaxed">Tidak diizinkan</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="forumPermission"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base">Izin Forum Kelas</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                    <div className="flex items-start space-x-2 py-1">
                      <RadioGroupItem value="full_access" id="forum-full" className="mt-0.5" />
                      <Label htmlFor="forum-full" className="text-sm sm:text-base leading-relaxed">Mahasiswa dapat membuat postingan dan memberikan komentar</Label>
                    </div>
                    <div className="flex items-start space-x-2 py-1">
                      <RadioGroupItem value="comment_only" id="forum-comment" className="mt-0.5" />
                      <Label htmlFor="forum-comment" className="text-sm sm:text-base leading-relaxed">Mahasiswa hanya dapat memberikan komentar</Label>
                    </div>
                    <div className="flex items-start space-x-2 py-1">
                      <RadioGroupItem value="dosen_only" id="forum-dosen" className="mt-0.5" />
                      <Label htmlFor="forum-dosen" className="text-sm sm:text-base leading-relaxed">Hanya dosen yang dapat membuat postingan</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="commentPermission"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-sm sm:text-base">Izin Komentar Materi dan Tugas</CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-2">
                    <div className="flex items-start space-x-2 py-1">
                      <RadioGroupItem value="active" id="comment-active" className="mt-0.5" />
                      <Label htmlFor="comment-active" className="text-sm sm:text-base leading-relaxed">Mahasiswa dapat memberikan komentar pada materi dan tugas</Label>
                    </div>
                    <div className="flex items-start space-x-2 py-1">
                      <RadioGroupItem value="inactive" id="comment-inactive" className="mt-0.5" />
                      <Label htmlFor="comment-inactive" className="text-sm sm:text-base leading-relaxed">Komentar dinonaktifkan</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
