"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ContentEditor from "@/components/ui/content-editor";
import { useCreateForumPost } from "./useCreateForumPost";

export default function CreateForumPost() {
  const { form, open, setOpen, isPending, handleSubmit, handleClose } = useCreateForumPost();

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b-2">
        <div className="text-base md:text-xl font-semibold">Forum Publik</div>
        <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(v); }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus /> Buat Postingan
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Buat postingan baru</TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-lg" resetForm={handleClose}>
            <DialogHeader>
              <DialogTitle>Buat Postingan Baru</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul</FormLabel>
                      <FormControl>
                        <Input placeholder="Judul postingan..." {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konten</FormLabel>
                      <FormControl>
                        <ContentEditor
                          onChange={field.onChange}
                          isInvalid={false}
                          placeholder="Tulis postingan..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={handleClose}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Memposting..." : "Posting"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
