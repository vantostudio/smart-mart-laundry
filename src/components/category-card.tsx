import { Link } from "@tanstack/react-router";

type Props = {
  image: string;
  name: string;
  caption: string;
  to?: string;
  tall?: boolean;
};

export function CategoryCard({ image, name, caption, to, tall = false }: Props) {
  const body = (
    <figure
      className={`group relative overflow-hidden rounded-2xl shadow-card ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}
    >
      <img
        src={image}
        alt={name}
        loading="lazy"
        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent px-4 pb-3.5 pt-10">
        <p className="font-display text-lg font-semibold text-white">{name}</p>
        <p className="mt-0.5 text-xs leading-snug text-white/80">{caption}</p>
      </figcaption>
    </figure>
  );

  return to ? (
    <Link to={to} className="block transition-transform hover:-translate-y-0.5">
      {body}
    </Link>
  ) : (
    body
  );
}
