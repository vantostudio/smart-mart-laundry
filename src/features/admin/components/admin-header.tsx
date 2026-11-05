import type { Route } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import type { AdminContext } from "@/features/admin/lib/auth";

import { SignOutButton } from "./sign-out-button";

const roleLabels: Record<AdminContext["role"], string> = { owner: "Owner", admin: "Admin" };

/** Who is signed in, from our `admin_user` row. The Team link is display only. */
export function AdminHeader({ admin }: { admin: AdminContext }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Wordmark />
        <div className="order-last flex w-full min-w-0 flex-wrap items-center gap-x-2 gap-y-2 md:order-none md:ml-auto md:w-auto">
          <p className="mr-auto min-w-0 text-body-sm md:mr-2">
            <span className="font-semibold break-all">{admin.name ?? admin.email}</span>
            <span className="text-muted-foreground"> · {roleLabels[admin.role]}</span>
          </p>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/admin/products">Products</Link>
          </Button>
          {admin.role === "owner" && (
            <Button asChild variant="ghost" className="px-3">
              {/* The page arrives with the team slice. */}
              <Link href={"/admin/team" as Route}>Team</Link>
            </Button>
          )}
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
