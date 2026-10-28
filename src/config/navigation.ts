import type { Route } from "next";

type NavLink = { href: Route; label: string };

export const mainNav: NavLink[] = [
  { href: "/laundry", label: "Laundry" },
  { href: "/shop", label: "Shop" },
  { href: "/egikomba", label: "E-Gikomba" },
  { href: "/track", label: "Track" },
];

export const footerNav: NavLink[] = [
  { href: "/laundry", label: "Laundry & prices" },
  { href: "/shop", label: "Clothing shop" },
  { href: "/egikomba", label: "E-Gikomba marketplace" },
  { href: "/track", label: "Track your order" },
  { href: "/about", label: "About us" },
];
