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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-6">
        <FormField
          control={control}
          name="lateSubmission"
          render={({ field }) => (
            <FormItem>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Pengumpulan Setelah Tenggat</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="allow" id="late-allow" />
                      <Label htmlFor="late-allow">Izinkan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not_allowed" id="late-not-allowed" />
                      <Label htmlFor="late-not-allowed">Tidak diizinkan</Label>
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
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Izin Forum Kelas</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_access" id="forum-full" />
                      <Label htmlFor="forum-full">Mahasiswa dapat membuat postingan dan memberikan komentar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="comment_only" id="forum-comment" />
                      <Label htmlFor="forum-comment">Mahasiswa hanya dapat memberikan komentar</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dosen_only" id="forum-dosen" />
                      <Label htmlFor="forum-dosen">Hanya dosen yang dapat membuat postingan</Label>
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
                <CardHeader>
                  <CardTitle className="text-sm sm:text-base">Izin Komentar Materi dan Tugas</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup onValueChange={field.onChange} value={field.value}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="comment-active" />
                      <Label htmlFor="comment-active">Mahasiswa dapat memberikan komentar pada materi dan tugas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="comment-inactive" />
                      <Label htmlFor="comment-inactive">Komentar dinonaktifkan</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
