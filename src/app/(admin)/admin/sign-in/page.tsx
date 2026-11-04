import type { Metadata } from "next";
import { Suspense } from "react";

import { Wordmark } from "@/components/shared/wordmark";
import { SignInPanel, SignInPanelSkeleton } from "@/features/admin/components/sign-in-panel";

export const metadata: Metadata = { title: "Sign in" };

export default function Page({ searchParams }: PageProps<"/admin/sign-in">) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-glow px-gutter py-section">
      <Wordmark />
      <Suspense fallback={<SignInPanelSkeleton />}>
        <SignInPanel searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
