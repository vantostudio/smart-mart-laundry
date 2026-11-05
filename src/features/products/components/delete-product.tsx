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
import { productMessages } from "@/features/admin/messages";

import { deleteProduct, problemFrom, type Problem } from "../lib/api-client";
import { productsHref } from "../lib/links";
import { ProblemText } from "./problem-text";

/** Asks first, naming the product. Stays open on failure so the message can be read. */
export function DeleteProduct({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [failure, setFailure] = useState<Problem | null>(null);

  async function confirm() {
    setDeleting(true);
    setFailure(null);
    const result = await deleteProduct(id);
    if (result.ok) {
      router.push(productsHref({}));
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
          {productMessages.delete}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{productMessages.deleteHeading(name)}</AlertDialogTitle>
        <AlertDialogDescription>{productMessages.deleteBody}</AlertDialogDescription>
        {failure && <ProblemText problem={failure} className="mt-3" />}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="secondary" disabled={deleting}>
              {productMessages.cancel}
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" disabled={deleting} onClick={confirm}>
            {deleting ? productMessages.deleting : productMessages.deleteConfirm}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
