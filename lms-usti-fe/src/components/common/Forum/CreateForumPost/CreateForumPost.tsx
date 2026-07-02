"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createForumPost } from "@/actions/create-forum-post";
import ContentEditor from "@/components/ui/content-editor";

export default function CreateForumPost() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Judul harus diisi");
      return;
    }
    setSubmitting(true);
    const res = await createForumPost({ title, content });
    setSubmitting(false);
    if (res.success) {
      toast.success(res.success);
      setTitle("");
      setContent("");
      setOpen(false);
    } else if (res.error) {
      toast.error(res.error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4 border-b-2">
        <div className="text-base md:text-xl font-semibold">Forum Publik</div>
        {!open && (
          <Button onClick={() => setOpen(true)} size="icon">
            <Plus />
          </Button>
        )}
      </div>
      {open && (
        <Card className="mt-4">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Judul</Label>
              <Input
                placeholder="Judul postingan..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label>Konten</Label>
              <ContentEditor
                onChange={setContent}
                isInvalid={false}
                placeholder="Tulis postingan..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setTitle("");
                  setContent("");
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Memposting..." : "Posting"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
