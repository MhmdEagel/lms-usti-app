"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { meetingServices } from "@/services/meeting.service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createMeetingSchema } from "@/schemas/meeting";
import type { IMeeting } from "@/types/Classroom";
import { z } from "zod";

interface PropTypes {
  classroomId: string;
  value: string | null;
  onChange: (value: string | null) => void;
}

export default function MeetingSelect({ classroomId, value, onChange }: PropTypes) {
  const router = useRouter();
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    meetingServices.getMeetings(classroomId).then((res) => {
      if (mounted) {
        setMeetings(res.data?.data || []);
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [classroomId]);

  const createForm = useForm<z.infer<typeof createMeetingSchema>>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: { topic: "", description: "" },
  });

  const handleCreateMeeting = async (values: z.infer<typeof createMeetingSchema>) => {
    setIsPending(true);
    try {
      const res = await meetingServices.createMeeting(classroomId, {
        topic: values.topic,
        description: values.description || undefined,
      });
      const newMeeting = res.data?.data;
      toast.success("Meeting created successfully");
      createForm.reset();
      setCreateOpen(false);
      const updatedRes = await meetingServices.getMeetings(classroomId);
      setMeetings(updatedRes.data?.data || []);
      if (newMeeting?.id) {
        onChange(newMeeting.id);
      }
      router.refresh();
    } catch {
      toast.error("Failed to create meeting");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Pertemuan (Opsional)</label>
        <Select
          value={value || ""}
          onValueChange={(v) => {
            if (v === "__create__") {
              setCreateOpen(true);
            } else {
              onChange(v || null);
            }
          }}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Memuat pertemuan..." : "Pilih pertemuan"} />
          </SelectTrigger>
          <SelectContent>
            {meetings.length === 0 && !loading && (
              <SelectItem value="__none__" disabled>
                Belum ada pertemuan
              </SelectItem>
            )}
            {meetings.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                Pertemuan {m.position} — {m.topic}
              </SelectItem>
            ))}
            <SelectItem value="__create__" className="text-primary font-medium">
              <Plus className="h-4 w-4 mr-2 inline" />
              Buat Pertemuan Baru
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Pertemuan</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreateMeeting)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topik</FormLabel>
                    <FormControl>
                      <Input placeholder="Topik pertemuan..." {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi pertemuan..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setCreateOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Buat"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}