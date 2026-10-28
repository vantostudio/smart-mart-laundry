import { PageHero } from "@/components/shared/page-hero";

import { TicketLookup } from "./ticket-lookup";

export function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Track"
        title="Where is my laundry?"
        intro="Every order gets a ticket number when your clothes are collected. Enter it below to see exactly where things stand."
      />
      <TicketLookup />
    </>
  );
}
