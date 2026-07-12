"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import useAddClassroomForumPost from "./useAddClassroomForumPost";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ContentEditor from "@/components/ui/content-editor";

interface PropTypes {
  id: string | undefined;
  classroomId: string;
  canCreatePost: boolean;
}

export default function AddForumPost({ id, classroomId, canCreatePost }: PropTypes) {
  const { form, open, handleOpen, handleClose, handleAddForumPost, isPending } =
    useAddClassroomForumPost();

  return (
    <>
      <div className="pb-4 border-b-2 flex items-center">
        <div className="text-base md:text-xl font-semibold">Forum Kelas</div>
        {canCreatePost && (
          <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else handleOpen(v); }}>
            <DialogTrigger asChild>
              <Button size="icon" className="size-7 md:size-9 ml-auto">
                <Plus />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg" resetForm={handleClose}>
              <DialogHeader>
                <DialogTitle>Buat Postingan Forum</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit((data) =>
                    handleAddForumPost(data, classroomId),
                  )}
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Judul postingan..."
                            {...field}
                            value={field.value ?? ""}
                            autoComplete="off"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="content"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Konten</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ContentEditor
                              value={field.value}
                              onChange={field.onChange}
                              isInvalid={!!fieldState.error}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={handleClose} disabled={isPending}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Mengirim..." : "Submit"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
}
