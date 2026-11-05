import type { AppErrorCode } from "@/lib/errors";

/*
 * Every message the admin area shows, in one place. Client components import it, so it holds copy
 * only: no `server-only`, no server imports. People never see SDK, Google or `error.message` text.
 */

/** Copy per error code. `NOT_FOUND` gets its copy with the team slice. */
export const errorMessages = {
  UNAUTHENTICATED: "Please sign in to continue.",
  FORBIDDEN:
    "This Google account isn't on the Street Mart team. Ask the owner to add your email, then sign in again.",
  ADMIN_DISABLED: "Your access has been turned off. Ask the owner if this is a mistake.",
  AUTH_UNAVAILABLE: "Sign-in isn't available right now. Please try again in a few minutes.",
  VALIDATION: "That email address doesn't look right.",
  ALREADY_EXISTS: "That email is already on the team.",
  LAST_OWNER: "There must always be at least one owner. Make someone else an owner first.",
  CANNOT_CHANGE_SELF: "You can't change your own access. Ask another owner.",
  INTERNAL: (requestId: string) =>
    `That didn't save. Please try again. If it keeps happening, tell the owner and quote code ${requestId}.`,
} as const satisfies Record<
  Exclude<AppErrorCode, "NOT_FOUND">,
  string | ((requestId: string) => string)
>;

/** What `requireAdminForAction` answers. FORBIDDEN also covers owner-only refusals. */
export const actionRefusalMessages = {
  UNAUTHENTICATED: errorMessages.UNAUTHENTICATED,
  FORBIDDEN: "You don't have access to this.",
  AUTH_UNAVAILABLE: errorMessages.AUTH_UNAVAILABLE,
} as const satisfies Record<
  Extract<AppErrorCode, "UNAUTHENTICATED" | "FORBIDDEN" | "AUTH_UNAVAILABLE">,
  string
>;

/** What the admin API answers beyond the refusals above. */
export const apiMessages = {
  invalidInput: "Check this and try again.",
  invalidJson: "That request couldn't be read.",
  productNotFound: "That product doesn't exist.",
  photoInvalid: "That file isn't a photo. Use a JPEG, PNG or WebP.",
  photoTooBig: "That photo is too big. Try a smaller one.",
} as const;

/** Copy for the products screens. */
export const productMessages = {
  heading: "Products",
  add: "Add product",
  addHeading: "Add a product",
  editHeading: "Edit product",
  back: "Back to products",
  empty: "No products yet. Add your first one.",
  noMatches: "Nothing matches those filters.",
  clearFilters: "Clear filters",
  pastTheEnd: "That page is empty.",
  firstPage: "Go to the first page",
  outOfStock: "Out of stock",
  inStock: (stock: number) => `${stock} in stock`,
  noPhoto: "No photo",
  pageOf: (page: number, pages: number, total: number) =>
    `Page ${page} of ${pages} · ${total} ${total === 1 ? "product" : "products"}`,
  previous: "Previous",
  next: "Next",
  allConditions: "All conditions",
  allCategories: "All categories",
  filterCategory: "Filter by category",
  filterCondition: "Filter by condition",
  name: "Name",
  category: "Category",
  condition: "Condition",
  price: "Price (KSh)",
  stock: "Stock",
  sizes: "Sizes",
  sizesHint: "Separate with commas, like S, M, L. Leave empty if there's only one size.",
  note: "Note",
  noteHint: 'Optional. Condition or fit, like "small mark on the sleeve".',
  chooseCategory: "Choose a category.",
  chooseCondition: "Choose a condition.",
  save: "Save product",
  saving: "Saving…",
  offline: "That didn't go through. Check your connection and try again.",
  photos: "Photos",
  photosHint: "The first photo is the one customers see first.",
  addPhotos: "Add photos",
  addingPhotos: (done: number, total: number) => `Adding photo ${done} of ${total}…`,
  cover: "Cover",
  removePhoto: (position: number) => `Remove photo ${position}`,
  photoAlt: (position: number) => `Photo ${position}`,
  photoUnreadable: "That photo couldn't be read. Try a JPEG or PNG.",
  photoLimit: (max: number) => `You can add up to ${max} photos.`,
  delete: "Delete product",
  deleteHeading: (name: string) => `Delete ${name}?`,
  deleteBody: "This removes it for good. It can't be undone.",
  deleteConfirm: "Delete",
  deleting: "Deleting…",
  cancel: "Cancel",
} as const;

export const signInMessages = {
  cancelled: "Sign-in was cancelled. Try again.",
  signOutFailed: "Sign-out didn't work. Please try again.",
} as const;

export const errorBoundaryMessages = {
  heading: "This page didn't load",
  body: "Something went wrong on our end. Try again, or go back to sign-in.",
} as const;

/** The only `?reason=` values the sign-in page reads. */
export const signInReasons = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "AUTH_UNAVAILABLE",
  "SIGN_IN_CANCELLED",
] as const;

export type SignInReason = (typeof signInReasons)[number];

const reasonMessages: Record<SignInReason, string> = {
  UNAUTHENTICATED: errorMessages.UNAUTHENTICATED,
  FORBIDDEN: errorMessages.FORBIDDEN,
  AUTH_UNAVAILABLE: errorMessages.AUTH_UNAVAILABLE,
  SIGN_IN_CANCELLED: signInMessages.cancelled,
};

function isSignInReason(value: string): value is SignInReason {
  return (signInReasons as readonly string[]).includes(value);
}

/** The copy for a `?reason=` param, or `null`. Exact match only; the input is never echoed. */
export function signInReasonMessage(reason: string | string[] | undefined): string | null {
  if (typeof reason !== "string" || !isSignInReason(reason)) return null;
  return reasonMessages[reason];
}
