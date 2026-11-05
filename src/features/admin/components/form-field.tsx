import type { ReactNode } from "react";

/** A labelled field with its hint and error. `htmlFor` is left out for groups of controls. */
export function FormField({
  name,
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  name: string;
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div data-field={name}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-body-sm font-semibold">
          {label}
        </label>
      ) : (
        <p className="text-body-sm font-semibold">{label}</p>
      )}
      <div className="mt-1.5">{children}</div>
      <div id={htmlFor && `${htmlFor}-help`}>
        {hint && <p className="mt-1 text-caption text-muted-foreground">{hint}</p>}
        {error && (
          <p role="alert" className="mt-1 text-body-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
