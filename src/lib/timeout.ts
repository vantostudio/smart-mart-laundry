/** `work`, or a rejection after `ms`, so a slow database can't hold a page up. */
export function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timed out")), ms);
  });
  return Promise.race([work, late]).finally(() => clearTimeout(timer));
}
