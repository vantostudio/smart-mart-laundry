type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  chips?: string[];
  image?: { src: string; alt: string };
};

export function PageHero({ eyebrow, title, intro, chips, image }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-16">
      <div className={image ? "grid items-center gap-10 lg:grid-cols-2" : "max-w-2xl"}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            {intro}
          </p>
          {chips && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground/85"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className="hidden aspect-[4/3] w-full rounded-3xl object-cover shadow-lift lg:block"
          />
        )}
      </div>
    </section>
  );
}
