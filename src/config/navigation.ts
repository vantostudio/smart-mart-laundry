import { Info, Shirt, WashingMachine, type LucideIcon } from "lucide-react";
import type { Route } from "next";

type NavLink = {
  href: Route;
  /** Short label for the desktop header. */
  label: string;
  /** Longer label for the menu and footer. */
  title: string;
  /** One line under the title in the menu. */
  blurb: string;
  icon: LucideIcon;
};

/** Every page, in menu order (header, phone menu, footer and sitemap). */
export const siteNav: NavLink[] = [
  {
    href: "/laundry",
    label: "Laundry",
    title: "Laundry & prices",
    blurb: "Free pickup, ironing and delivery",
    icon: WashingMachine,
  },
  {
    href: "/shop",
    label: "Shop",
    title: "Shop clothes & shoes",
    blurb: "Mtumba and brand new",
    icon: Shirt,
  },
  {
    href: "/about",
    label: "About",
    title: "About us",
    blurb: "Our story and where to find us",
    icon: Info,
  },
];
