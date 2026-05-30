"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useGabungKelas } from "./useGabungKelas";
import { Spinner } from "@/components/ui/spinner";

export default function GabungKelas() {
  const { form, handleJoinClassroomForm, isPending, open, setOpen } =
    useGabungKelas();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Gabung Kelas</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleJoinClassroomForm)}
          >
            <DialogHeader>
              <DialogTitle>Gabung Kelas</DialogTitle>
              <DialogDescription>
                Masukkan kode kelas Anda. Silahkan minta kepada dosen pengajar
                anda.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="classroom_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Kelas</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button onClick={() => form.reset()} variant="outline">
                  Batal
                </Button>
              </DialogClose>
              <Button disabled={isPending} type="submit">
                {isPending ? (
                  <Spinner variant="circle" color="white" />
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
