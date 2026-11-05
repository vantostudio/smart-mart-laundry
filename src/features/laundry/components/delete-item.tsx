"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ProblemText } from "@/features/admin/components/problem-text";
import { problemFrom, type Problem } from "@/features/admin/lib/api-call";
import { laundryMessages as m } from "@/features/admin/messages";

import { deleteLaundryItem } from "../lib/items-client";

/** Asks first, naming the item. Stays open on failure so the message can be read. */
export function DeleteItem({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState<Problem | null>(null);

  async function confirm() {
    setDeleting(true);
    setFailure(null);
    const result = await deleteLaundryItem(id);
    if (result.ok) {
      router.push("/admin/laundry");
      router.refresh();
      return;
    }
    setDeleting(false);
    setFailure(problemFrom(result.error));
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="mt-4 text-destructive">
          {m.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{m.deleteHeading(name)}</AlertDialogTitle>
        <AlertDialogDescription>{m.deleteBody}</AlertDialogDescription>
        {failure && <ProblemText problem={failure} className="mt-3" />}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={deleting}>
              {m.cancel}
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" disabled={deleting} onClick={confirm}>
            {deleting ? m.deleting : m.deleteConfirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
