import { productMessages } from "@/features/admin/messages";
import { cn } from "@/lib/utils";

import type { Problem } from "../lib/api-client";

/** A failure, announced as it appears. Sign-in opens a new tab, so unsaved work stays here. */
export function ProblemText({ problem, className }: { problem: Problem; className?: string }) {
  return (
    <p role="alert" className={cn("text-body-sm text-destructive", className)}>
      {problem.message}
      {problem.signedOut && (
        <>
          {" "}
          <a
            href="/admin/sign-in"
            target="_blank"
            rel="noopener"
            className="font-semibold underline"
          >
            {productMessages.signInAgain}
          </a>
        </>
      )}
    </p>
  );
}
