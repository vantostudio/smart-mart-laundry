import Link from "next/link";

import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import type { AdminContext } from "@/features/admin/lib/auth";
import {
  laundryMessages,
  productMessages,
  roleLabels,
  settingsMessages,
} from "@/features/admin/messages";

import { SignOutButton } from "./sign-out-button";

/** Who is signed in, by name and role. The email stays on the server. */
export function AdminHeader({ admin }: { admin: AdminContext }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Wordmark />
        <div className="order-last flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2 lg:order-none lg:ml-auto lg:w-auto">
          <p className="mr-auto min-w-0 text-body-sm lg:mr-2">
            {admin.name && <span className="font-semibold wrap-anywhere">{admin.name} · </span>}
            <span className="text-muted-foreground">{roleLabels[admin.role]}</span>
          </p>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/admin/products">{productMessages.heading}</Link>
          </Button>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/admin/laundry">{laundryMessages.nav}</Link>
          </Button>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/admin/settings">{settingsMessages.heading}</Link>
          </Button>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
