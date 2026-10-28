"use client";

import { PackageSearch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/shared/card";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/config/site";
import { findTicket, sampleTickets, type TicketStatus } from "@/features/track/data";
import { waLink } from "@/lib/whatsapp";

import { StatusTimeline } from "./status-timeline";

export function TicketLookup() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<TicketStatus | null | "none">(null);

  const lookup = (input: string) => {
    if (!input.trim()) return;
    setResult(findTicket(input) ?? "none");
  };

  return (
    <Section spacing="bottom" containerClassName="max-w-2xl">
      <form
        className="flex flex-col gap-3 rounded-full sm:flex-row sm:border sm:border-border sm:bg-card sm:p-1.5 sm:shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          lookup(value);
        }}
      >
        <Input
          shape="pill"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ticket number, e.g. SM-48217"
          aria-label="Ticket number"
          className="font-mono sm:border-transparent sm:bg-transparent sm:shadow-none sm:hover:border-transparent sm:focus-visible:ring-0"
        />
        <Button type="submit" variant="gradient-primary" size="lg">
          <PackageSearch /> Track
        </Button>
      </form>

      <div aria-live="polite">
        {result === "none" && (
          <Card className="mt-6 text-body-sm text-muted-foreground">
            <p>
              We couldn&apos;t find that ticket number. Check your collection receipt or{" "}
              <a
                href={waLink(`Hi Street Mart, help me track ticket ${value || "(number)"}`)}
                target="_blank"
                rel="noreferrer"
                className="text-link"
              >
                ask us on WhatsApp
              </a>
              .
            </p>
          </Card>
        )}
        {result && result !== "none" && <StatusTimeline ticket={result} />}
      </div>

      <Card variant="muted" className="mt-8 text-body-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Try a demo ticket</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(sampleTickets).map((k) => (
            <Button
              key={k}
              variant="soft"
              size="sm"
              className="font-mono"
              onClick={() => {
                setValue(k);
                lookup(k);
              }}
            >
              {k}
            </Button>
          ))}
        </div>
        <p className="mt-3">
          This page is a live demo. Real tracking comes with online accounts — until then, every
          order is confirmed and updated by WhatsApp on {site.phoneDisplay}.
        </p>
        <p className="mt-2">
          Ready to book?{" "}
          <Link href="/laundry" className="text-link">
            Order a pickup
          </Link>
          .
        </p>
      </Card>
    </Section>
  );
}
