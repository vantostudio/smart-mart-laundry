import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";

export const metadata: Metadata = { title: "Admin" };

export default function Page() {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell />
    </Suspense>
  );
}
