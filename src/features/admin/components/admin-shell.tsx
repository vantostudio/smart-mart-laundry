import { requireAdmin } from "@/features/admin/lib/auth";

import { AdminHeader } from "./admin-header";

/** The signed-in admin area. `requireAdmin()` sends anyone else to sign-in with the reason. */
export async function AdminShell() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminHeader admin={admin} />
      <div className="container-page py-section">
        <h1 className="display text-display">Admin</h1>
        <section className="mt-6 rounded-3xl bg-card p-6 text-body text-muted-foreground shadow-card">
          Stock and orders will appear here
        </section>
      </div>
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
