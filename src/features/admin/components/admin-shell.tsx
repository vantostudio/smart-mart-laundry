import type { ReactNode } from "react";

import type { AdminContext } from "@/features/admin/lib/auth";

import { AdminHeader } from "./admin-header";

/** The frame of every signed-in page. The page itself calls `requireAdmin()` first. */
export function AdminShell({ admin, children }: { admin: AdminContext; children: ReactNode }) {
  return (
    <>
      <AdminHeader admin={admin} />
      <div className="container-page py-section">{children}</div>
    </>
  );
}

/** A header bar and the panel, while the session is checked. */
export function AdminShellSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading</span>
      <div aria-hidden className="motion-safe:animate-pulse">
        <div className="border-b border-border bg-card">
          <div className="container-page flex items-center justify-between gap-4 py-3">
            <div className="h-11 w-36 rounded-full bg-secondary" />
            <div className="h-11 w-28 rounded-full bg-secondary" />
          </div>
        </div>
        <div className="container-page py-section">
          <div className="h-10 w-40 rounded-full bg-secondary" />
          <div className="mt-6 h-32 rounded-3xl bg-secondary" />
        </div>
      </div>
    </div>
  );
}
