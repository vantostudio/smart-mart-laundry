/** Says the contact fields came from this phone's saved details, with a button to clear them. */
export function RememberedNotice({ onForget }: { onForget: () => void }) {
  return (
    <p className="flex flex-wrap items-center justify-between gap-x-3 rounded-2xl bg-secondary/70 py-1 pr-1 pl-3.5 text-caption text-muted-foreground">
      Filled in from your last order on this phone.
      <button
        type="button"
        onClick={onForget}
        className="min-h-11 rounded-full px-3 font-semibold text-foreground underline-offset-4 hover:underline"
      >
        Not you? Clear
      </button>
    </p>
  );
}
