import { describe, expect, it } from "vite-plus/test";

import { isTextEntry, shouldShowActionBar, type ActionBarState } from "./action-bar-visibility";

const base: ActionBarState = {
  pathname: "/",
  heroCtaPresent: true,
  heroCtaInView: false,
  scrolledPastThreshold: false,
  footerInView: false,
  textEntryFocused: false,
};
const show = (patch: Partial<ActionBarState>) => shouldShowActionBar({ ...base, ...patch });

describe("shouldShowActionBar", () => {
  it("hides while the hero CTA is in view and shows once it scrolls away", () => {
    expect(show({ heroCtaInView: true })).toBe(false);
    expect(show({ heroCtaInView: false })).toBe(true);
  });

  it("uses the scroll threshold on pages without a hero CTA", () => {
    const page = { pathname: "/about", heroCtaPresent: false };
    expect(show({ ...page, scrolledPastThreshold: false })).toBe(false);
    expect(show({ ...page, scrolledPastThreshold: true })).toBe(true);
  });

  it("ignores scroll position when the page has a hero CTA", () => {
    expect(show({ heroCtaInView: true, scrolledPastThreshold: true })).toBe(false);
  });

  it("hides while the footer is in view", () => {
    expect(show({ footerInView: true })).toBe(false);
    expect(show({ heroCtaPresent: false, scrolledPastThreshold: true, footerInView: true })).toBe(
      false,
    );
  });

  it("hides while a text field has focus", () => {
    expect(show({ textEntryFocused: true })).toBe(false);
  });

  it("never shows on /shop, which has its own bag bar", () => {
    expect(show({ pathname: "/shop", heroCtaPresent: false, scrolledPastThreshold: true })).toBe(
      false,
    );
  });

  it("never shows on the laundry route, which has its own cart bar", () => {
    expect(show({ pathname: "/laundry" })).toBe(false);
    expect(
      show({ pathname: "/laundry/anything", heroCtaPresent: false, scrolledPastThreshold: true }),
    ).toBe(false);
    expect(show({ pathname: "/laundry-tips" })).toBe(true);
  });
});

describe("isTextEntry", () => {
  it("recognises fields that open the keyboard", () => {
    expect(isTextEntry(document.createElement("input"))).toBe(true);
    const tel = document.createElement("input");
    tel.type = "tel";
    expect(isTextEntry(tel)).toBe(true);
    expect(isTextEntry(document.createElement("textarea"))).toBe(true);
    expect(isTextEntry(document.createElement("select"))).toBe(true);
  });

  it("ignores buttons, checkboxes and non-elements", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    expect(isTextEntry(checkbox)).toBe(false);
    expect(isTextEntry(document.createElement("button"))).toBe(false);
    expect(isTextEntry(document.createElement("a"))).toBe(false);
    expect(isTextEntry(null)).toBe(false);
    expect(isTextEntry(window)).toBe(false);
  });
});
