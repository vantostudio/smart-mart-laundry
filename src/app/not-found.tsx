import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-glow px-gutter">
      <div className="max-w-narrow text-center">
        <p className="text-gradient-sunset font-display text-display-xl font-bold figures">404</p>
        <h1 className="mt-2 display text-display">Page not found</h1>
        <p className="mt-4 text-body-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild variant="gradient-clay" size="lg" className="mt-8">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
