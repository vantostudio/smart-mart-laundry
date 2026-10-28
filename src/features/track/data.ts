export type TicketStatus = {
  ticket: string;
  service: string;
  items: string;
  pickup: string;
  returnBy: string;
  total: string;
  status: string;
  statusNote: string;
  stage: number; // 0 booked, 1 collected, 2 washing, 3 out for delivery, 4 done
};

export const sampleTickets: Record<string, TicketStatus> = {
  "SM-48217": {
    ticket: "SM-48217",
    service: "Wash, dry & iron",
    items: "1 medium basket, 1 duvet 4×6",
    pickup: "Today, 9:30 AM",
    returnBy: "Tomorrow, 6:00 PM",
    total: "KSh 500",
    status: "Washing",
    statusNote: "Rider on schedule — delivery tomorrow evening.",
    stage: 2,
  },
  "SM-48310": {
    ticket: "SM-48310",
    service: "Wash & dry",
    items: "2 small baskets, 1 door mat",
    pickup: "Today, 11:00 AM",
    returnBy: "Today, 7:00 PM",
    total: "KSh 350",
    status: "Out for delivery",
    statusNote: "Rider left the shop — arriving before 7 PM.",
    stage: 3,
  },
  "SM-48402": {
    ticket: "SM-48402",
    service: "Shoe cleaning",
    items: "2 pairs, plain white",
    pickup: "Tomorrow, 9:00 AM",
    returnBy: "Tomorrow, 5:00 PM",
    total: "KSh 300",
    status: "Booked",
    statusNote: "Rider assigned — collection tomorrow morning.",
    stage: 0,
  },
};

export const trackStages = ["Booked", "Collected", "Washing", "Out for delivery", "Delivered"];

export function findTicket(input: string): TicketStatus | undefined {
  return sampleTickets[input.trim().toUpperCase()];
}
