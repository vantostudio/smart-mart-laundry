type Props = {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
  tone?: "default" | "on-dark";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "default",
  className = "",
}: Props) {
  const onDark = tone === "on-dark";
  return (
    <div
      className={`max-w-xl ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={`display mt-2 text-3xl sm:text-4xl ${onDark ? "text-primary-foreground" : "text-foreground"}`}
      >
        {title}
      </h2>
      {intro && (
        <p className={`mt-3 text-base leading-relaxed ${onDark ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
