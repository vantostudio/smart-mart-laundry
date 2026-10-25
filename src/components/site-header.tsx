import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { site } from "@/data/site";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/laundry", label: "Laundry" },
  { to: "/shop", label: "Shop" },
  { to: "/egikomba", label: "E-Gikomba" },
  { to: "/sell", label: "Sell with us" },
  { to: "/track", label: "Track" },
  { to: "/contact", label: "Contact" },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex items-baseline gap-1">
      <span className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        Street&nbsp;Mart
      </span>
      <span className="size-1.5 rounded-full bg-clay" aria-hidden />
    </Link>
  );
}

function CartLink() {
  const { count } = useCart();
  return (
    <Link
      to="/laundry"
      aria-label="Laundry cart"
      className="relative inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary"
    >
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-clay text-[0.65rem] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <CartLink />
          <Button
            asChild
            className="hidden rounded-full px-5 sm:inline-flex"
            onClick={() => navigate({ to: "/laundry" })}
          >
            <Link to="/laundry">Order pickup</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background px-4 pb-6 pt-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="block border-b border-border/70 py-3 font-display text-lg text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button asChild className="mt-4 w-full rounded-full">
            <Link to="/laundry">Order pickup</Link>
          </Button>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {site.location.point} · {site.location.area}
          </p>
        </nav>
      )}
    </header>
  );
}
