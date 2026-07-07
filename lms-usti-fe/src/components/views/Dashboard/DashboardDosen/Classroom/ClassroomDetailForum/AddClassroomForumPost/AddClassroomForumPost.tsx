"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useAddClassroomForumPost from "./useAddClassroomForumPost";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import ContentEditor from "@/components/ui/content-editor";
export default function AddForumPost({
  id,
  classroomId,
  canCreatePost,
}: {
  id: string | undefined;
  classroomId: string;
  canCreatePost: boolean;
}) {
  const { form, open, handleOpen, handleAddForumPost } =
    useAddClassroomForumPost();



  return (
    <>
      <div className="pb-4 border-b-2 flex items-center">
        <div className="text-base md:text-xl font-semibold">Forum Kelas</div>
        {canCreatePost && !open ? (
          <Tooltip>
            <TooltipTrigger className="ml-auto" asChild>
              <Button onClick={() => handleOpen(true)} size={"icon"}>
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Buat Forum</p>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {open ? (
        <Card className="mt-4">
          <CardContent>
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

                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => {
                      handleOpen(false);
                      form.reset();
                    }}
                    variant={"outline"}
                  >
                    Batal
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
