import { TrackPage } from "@/features/track/components/track-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Track Your Laundry",
  description:
    "Enter your ticket number to see where your laundry is — booked, collected, washing, out for delivery or delivered.",
  socialDescription:
    "Follow your laundry from pickup to delivery with your Street Mart ticket number.",
  path: "/track",
});

export default function Page() {
  return <TrackPage />;
}
