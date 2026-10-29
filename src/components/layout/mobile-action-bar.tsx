"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  ACTION_BAR_SCROLL_THRESHOLD,
  HERO_CTA_SELECTOR,
  isTextEntry,
  shouldShowActionBar,
  SITE_FOOTER_ID,
} from "./action-bar-visibility";

/** Tracks whether any `[data-hero-cta]` element is on the page, and whether one is on screen. */
function useHeroCta() {
  const [present, setPresent] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observed = new Set<Element>();
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setInView(visible.size > 0);
    });

    // Pages (and streamed content) can mount after this layout component, and client
    // navigation swaps them without remounting it, so keep watching for hero CTAs.
    let frame = 0;
    const scan = () => {
      frame = 0;
      for (const el of document.querySelectorAll(HERO_CTA_SELECTOR)) {
        if (observed.has(el)) continue;
        observed.add(el);
        io.observe(el);
      }
      for (const el of observed) {
        if (el.isConnected) continue;
        observed.delete(el);
        visible.delete(el);
        io.unobserve(el);
      }
      setPresent(observed.size > 0);
      setInView(visible.size > 0);
    };
    const scheduleScan = () => {
      if (!frame) frame = requestAnimationFrame(scan);
    };

    scheduleScan();
    const mo = new MutationObserver(scheduleScan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      cancelAnimationFrame(frame);
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return { present, inView };
}

function useFooterInView() {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const footer = document.getElementById(SITE_FOOTER_ID);
    if (!footer) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));
    io.observe(footer);
    return () => io.disconnect();
  }, []);
  return inView;
}

/** Only tracks which side of the threshold the page is on, so scrolling doesn't re-render. */
function useScrolledPast(threshold: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(window.scrollY > threshold);
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, [threshold]);
  return past;
}

function useTextEntryFocused() {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => setFocused(isTextEntry(e.target));
    const onFocusOut = (e: FocusEvent) => setFocused(isTextEntry(e.relatedTarget));
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);
  return focused;
}

/**
 * Phone-only bottom bar with the two main actions. It stays out of the way: hidden while the
 * page's own hero CTA (`[data-hero-cta]`) or the footer is on screen, on /laundry and /shop
 * (which have their own bottom bars) and while the keyboard is up. Starts hidden, so server and
 * client agree.
 */
export function MobileActionBar() {
  const pathname = usePathname();
  const hero = useHeroCta();
  const footerInView = useFooterInView();
  const scrolledPastThreshold = useScrolledPast(ACTION_BAR_SCROLL_THRESHOLD);
  const textEntryFocused = useTextEntryFocused();

  const visible = shouldShowActionBar({
    pathname,
    heroCtaPresent: hero.present,
    heroCtaInView: hero.inView,
    scrolledPastThreshold,
    footerInView,
    textEntryFocused,
  });

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      data-visible={visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-(--z-header) border-t border-border/70 bg-background/90 px-gutter pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl backdrop-saturate-150 sm:hidden",
        "motion-safe:transition-[translate,visibility] motion-safe:duration-300 motion-safe:ease-out-expo",
        !visible && "invisible translate-y-full",
      )}
    >
      <div className="flex items-center gap-3">
        <Button asChild variant="gradient-clay" size="lg" className="min-w-0 flex-1">
          <Link href="/laundry">Book pickup</Link>
        </Button>
        <WhatsAppButton variant="primary" size="icon-lg" aria-label="Chat on WhatsApp" />
      </div>
    </div>
  );
}
