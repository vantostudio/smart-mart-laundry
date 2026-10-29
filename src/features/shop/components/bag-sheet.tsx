"use client";

import { CheckCircle2, Copy, Phone, ShoppingBag, Store, Truck } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type RefObject,
} from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { FormField } from "@/components/shared/form-field";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { StillNeeded } from "@/components/shared/still-needed";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { phoneHref, site } from "@/config/site";
import { useBag } from "@/features/cart/cart-provider";
import { deliveryFor, fulfilOptions, type FulfilMethod } from "@/features/shop/lib/delivery";
import {
  buildShopMessage,
  productForLine,
  validateShopOrder,
  type ShopField,
} from "@/features/shop/lib/shop-message";
import { ksh } from "@/lib/format";
import { unsplash } from "@/lib/images";
import { clearSavedDetails, readSavedDetails, writeSavedDetails } from "@/lib/saved-details";

type ContactField = Exclude<ShopField, "items">;
type Details = Record<ContactField | "notes", string>;

const emptyDetails: Details = { location: "", name: "", phone: "", notes: "" };
const fulfilIcons = { delivery: Truck, pickup: Store };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The shop bag: lines with size and quantity, delivery or pick up (with the free-delivery
 * nudge), contact details remembered on this phone, a "Still needed" list, and the WhatsApp
 * order. Once WhatsApp has opened it says what's next and offers a copy or a call.
 */
export function BagSheet({ open, onOpenChange }: Props) {
  const { items, count, total, setQty, clear } = useBag();
  const [method, setMethod] = useState<FulfilMethod>("delivery");
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [remembered, setRemembered] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const refs: Record<ContactField, RefObject<HTMLInputElement | null>> = {
    location: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    // Saved details live in localStorage, which only exists after hydration.
    const saved = readSavedDetails();
    if (!saved) return;
    // oxlint-disable-next-line react/set-state-in-effect
    setDetails((d) => ({ ...d, ...saved }));
    setRemembered(true);
  }, []);

  const order = { method, ...details };
  const problems = validateShopOrder(count, order);
  const missing = (Object.entries(problems) as [ShopField, string][]).filter(
    (entry): entry is [ContactField, string] => entry[0] !== "items",
  );
  const errors = attempted ? problems : {};
  const delivery = deliveryFor(total, method);
  const message = buildShopMessage(items, order);
  const sent = sentMessage === message;

  function fix(field: ContactField) {
    const el = refs[field].current;
    el?.scrollIntoView({ block: "center" });
    el?.focus({ preventScroll: true });
  }

  function send(event: MouseEvent<HTMLAnchorElement>) {
    const first = missing[0]?.[0];
    if (first) {
      event.preventDefault();
      setAttempted(true);
      fix(first);
      return;
    }
    writeSavedDetails({ location: details.location, name: details.name, phone: details.phone });
    setSentMessage(message);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function forget() {
    clearSavedDetails();
    setDetails((d) => ({ ...emptyDetails, notes: d.notes }));
    setRemembered(false);
  }

  const input = (name: ContactField) => ({
    ref: refs[name],
    value: details[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) =>
      setDetails((d) => ({ ...d, [name]: e.target.value })),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `bag-${name}-error` : undefined,
  });

  const error = (name: ContactField) =>
    errors[name] && (
      <p id={`bag-${name}-error`} className="text-caption font-semibold text-destructive">
        {errors[name]}
      </p>
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="flex items-center justify-between gap-3">
          <div>
            <SheetTitle>Your bag</SheetTitle>
            <SheetDescription>
              {count === 0
                ? "Nothing here yet."
                : `${count} ${count === 1 ? "item" : "items"} · pay on delivery or in store`}
            </SheetDescription>
          </div>
        </SheetHeader>

        {count === 0 ? (
          <SheetBody className="grid place-items-center pb-10 text-center">
            <div className="grid justify-items-center gap-3 py-8">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                <ShoppingBag aria-hidden className="size-7" />
              </span>
              <p className="text-body-sm text-muted-foreground">
                Tap + on anything you like to add it here.
              </p>
              <Button type="button" variant="primary" size="lg" onClick={() => onOpenChange(false)}>
                Browse the shop
              </Button>
            </div>
          </SheetBody>
        ) : (
          <>
            <SheetBody className="pb-6">
              <ul className="grid gap-3">
                {items.map((line) => {
                  const product = productForLine(line.id);
                  return (
                    <li key={line.id} className="flex items-center gap-3">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                        {product && (
                          <Image
                            src={unsplash(product.images[0]!, 200)}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-semibold">{line.name}</p>
                        <p className="truncate text-caption text-muted-foreground">{line.detail}</p>
                        <Price amount={line.price * line.qty} size="sm" />
                      </div>
                      <QuantityStepper
                        label={line.name}
                        value={line.qty}
                        max={line.max}
                        onChange={(n) => setQty(line.id, n)}
                        className="shrink-0"
                      />
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={clear}
                className="mt-1 min-h-11 text-caption font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Empty bag
              </button>

              <div className="mt-4 grid gap-2">
                <p className="text-body-sm font-semibold">How do you want it?</p>
                <ChoiceChips
                  label="How do you want it?"
                  columns={2}
                  options={fulfilOptions.map((o) => ({
                    value: o.id,
                    label: o.label,
                    sublabel: o.sublabel,
                    icon: fulfilIcons[o.id],
                  }))}
                  value={method}
                  onChange={setMethod}
                />
                {method === "delivery" && (
                  <p aria-live="polite" className="text-caption text-muted-foreground">
                    {delivery.free ? (
                      <span className="font-semibold text-success">Free delivery unlocked.</span>
                    ) : (
                      <>
                        Add{" "}
                        <span className="font-semibold text-foreground">
                          {ksh(delivery.remaining)}
                        </span>{" "}
                        more for free delivery.
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="mt-5 grid gap-3.5">
                {remembered && (
                  <p className="flex flex-wrap items-center justify-between gap-x-3 rounded-2xl bg-secondary/70 py-1 pr-1 pl-3.5 text-caption text-muted-foreground">
                    Filled in from your last order on this phone.
                    <button
                      type="button"
                      onClick={forget}
                      className="min-h-11 rounded-full px-3 font-semibold text-foreground underline-offset-4 hover:underline"
                    >
                      Not you? Clear
                    </button>
                  </p>
                )}
                {method === "delivery" && (
                  <>
                    <FormField label="Delivery location">
                      <Input
                        {...input("location")}
                        autoComplete="street-address"
                        placeholder="Estate, hostel or landmark…"
                      />
                    </FormField>
                    {error("location")}
                  </>
                )}
                <FormField label="Your name">
                  <Input {...input("name")} autoComplete="name" placeholder="e.g. Jane Wanjiru…" />
                </FormField>
                {error("name")}
                <FormField label="Phone number">
                  <Input
                    {...input("phone")}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0712 345 678…"
                    className="figures"
                  />
                </FormField>
                {error("phone")}
                <FormField
                  label="Notes (optional)"
                  hint="Another size or colour if it's gone, or a time."
                >
                  <Textarea
                    value={details.notes}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    rows={2}
                    maxLength={300}
                  />
                </FormField>
              </div>

              <StillNeeded
                missing={missing}
                total={method === "delivery" ? 3 : 2}
                onFix={fix}
                className="mt-5"
              />
            </SheetBody>

            <SheetFooter className="grid gap-2">
              <dl className="grid gap-1 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="figures">{ksh(total)}</dd>
                </div>
                {method === "delivery" && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className={delivery.fee === 0 ? "font-semibold text-success" : "figures"}>
                      {delivery.fee === 0 ? "Free" : ksh(delivery.fee)}
                    </dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 font-semibold">
                  <dt>Total</dt>
                  <dd>
                    <Price amount={total + delivery.fee} size="md" />
                  </dd>
                </div>
              </dl>
              <WhatsAppButton
                message={message}
                variant="clay"
                size="lg"
                block
                onClick={send}
                className="max-xs:px-4!"
              >
                Send order on WhatsApp
              </WhatsAppButton>
              {/* Always mounted, so screen readers announce the message when it appears. */}
              <div aria-live="polite">
                {sent && (
                  <div className="rounded-2xl bg-success-soft p-3">
                    <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
                      <CheckCircle2 aria-hidden className="size-4 shrink-0" />
                      Your order is ready in WhatsApp
                    </p>
                    <p className="mt-0.5 text-caption text-muted-foreground">
                      Tap Send there. We&apos;ll confirm it&apos;s all in stock. Didn&apos;t open?
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <Button type="button" variant="secondary" size="md" onClick={copy}>
                        <Copy aria-hidden /> {copied ? "Copied" : "Copy order"}
                      </Button>
                      <Button asChild variant="secondary" size="md">
                        <a href={phoneHref} aria-label={`Call ${site.phoneDisplay}`}>
                          <Phone aria-hidden /> Call us
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
