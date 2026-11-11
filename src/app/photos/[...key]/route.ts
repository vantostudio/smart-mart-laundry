import { storageEnv } from "@/config/env";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { servePhoto, type PhotoDeps } from "@/lib/photo-proxy";

/* Photos under `next dev` and `next start`. On Workers the entry answers `/photos/*` first. */

function endpoint(): string | undefined {
  try {
    return storageEnv().AWS_ENDPOINT_URL_S3;
  } catch (error) {
    if (error instanceof AppError) return undefined;
    throw error;
  }
}

function deps(): PhotoDeps {
  return { endpoint: endpoint(), log: (level, msg, fields) => log[level](msg, fields) };
}

export function GET(request: Request) {
  return servePhoto(request, deps());
}

export function HEAD(request: Request) {
  return servePhoto(request, deps());
}
