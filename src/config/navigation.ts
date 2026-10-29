import type { Route } from "next";

type NavLink = { href: Route; label: string };

export const mainNav: NavLink[] = [
  { href: "/laundry", label: "Laundry" },
  { href: "/shop", label: "Shop" },
];

export const footerNav: NavLink[] = [
  { href: "/laundry", label: "Laundry & prices" },
  { href: "/shop", label: "Shop clothes & shoes" },
  { href: "/about", label: "About us" },
];
