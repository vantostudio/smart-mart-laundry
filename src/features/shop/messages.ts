/* Every message the public shop shows when something goes wrong or there's nothing to show. */

export type LoadProblem = "offline" | "unavailable" | "not-found";

const offline = {
  title: "You're offline",
  body: "Check your connection, then try again.",
};

export const shopMessages = {
  list: {
    offline,
    unavailable: {
      title: "We couldn't load the shop just now",
      body: "Please try again in a moment. You can also ask us on WhatsApp what's in stock.",
    },
  },
  more: {
    offline: "You're offline. Check your connection, then try again.",
    unavailable: "We couldn't load more items. Please try again.",
  },
  item: {
    offline,
    unavailable: {
      title: "We couldn't load this item",
      body: "Please try again in a moment.",
    },
    "not-found": {
      title: "This item is no longer available",
      body: "It may have just sold. There's plenty more in the shop.",
    },
  },
  empty: {
    title: "New stock is on its way",
    body: "Nothing's listed right now. Ask us on WhatsApp what's just come in.",
  },
  loadingList: "Loading the shop…",
  loadingItem: "Loading this item…",
  retry: "Try again",
  backToShop: "Back to the shop",
  askWhatsApp: "Ask on WhatsApp",
  askWhatsAppMessage: "Hi Street Mart, what's in stock at the shop right now?",
} as const;
