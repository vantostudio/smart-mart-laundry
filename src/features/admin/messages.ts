import type { AppErrorCode } from "@/lib/errors";

/*
 * Every message the admin area shows, in one place. Client components import it, so it holds copy
 * only: no `server-only`, no server imports. People never see SDK, Google or `error.message` text.
 */

/** Copy per error code. */
export const errorMessages = {
  UNAUTHENTICATED: "Please sign in to continue.",
  FORBIDDEN:
    "This Google account isn't on the Street Mart team. Ask the owner to add your email, then sign in again.",
  AUTH_UNAVAILABLE: "Sign-in isn't available right now. Please try again in a few minutes.",
  VALIDATION: "That email address doesn't look right.",
  ALREADY_EXISTS: "That email is already on the team.",
  LAST_OWNER: "There must always be at least one owner. Make someone else an owner first.",
  CANNOT_CHANGE_SELF: "You can't change your own access. Ask another owner.",
  RATE_LIMITED: "That was a lot of requests. Please wait a moment and try again.",
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
  staffNotFound: "That person isn't on the team any more.",
  photoInvalid: "That file isn't a photo. Use a JPEG, PNG or WebP.",
  photoTooBig: "That photo is too big. Try a smaller one.",
} as const;

/** Copy for the products screens. */
export const productMessages = {
  heading: "Products",
  stockReminder: "Sold something? Lower its stock or delete it here, so the shop stays correct.",
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
  pages: "Pages",
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
  sizesHint: "Tick every size you have. Leave them all off for a one-size piece.",
  sizesNeedCategory: "Choose a category first to see its sizes.",
  note: "Note",
  noteHint: 'Optional. Condition or fit, like "small mark on the sleeve".',
  chooseCategory: "Choose a category.",
  chooseCondition: "Choose a condition.",
  save: "Save product",
  saving: "Saving…",
  offline: "That didn't go through. Check your connection and try again.",
  notSaved: "That didn't go through. Please try again.",
  signedOut:
    "You've been signed out. Sign in again in a new tab, then come back: nothing here is lost.",
  signInAgain: "Sign in again",
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

export const roleLabels = { owner: "Owner", admin: "Admin" } as const;

/** Copy for the settings page. */
export const settingsMessages = {
  heading: "Settings",
  save: "Save",
  saving: "Saving…",
  saved: "Saved.",
  savedForShop: "Saved. The site updates within about a minute.",
  yourNameHeading: "Your name",
  yourNameBody: "Shown in the admin so the team can tell who's who.",
  yourNameLabel: "Name",
  deliveryHeading: "Delivery",
  deliveryBody: "What customers pay to have an order delivered.",
  deliveryFee: "Delivery fee (KSh)",
  deliveryFreeFrom: "Free delivery from (KSh)",
  deliveryFreeFromHint: "Orders of this much or more are delivered free.",
  contactHeading: "Contact and opening hours",
  contactBody: "Shown across the site, and used for pickup booking.",
  contactSearchNote:
    "Google keeps showing the old number and hours until the site is next published.",
  phone: "Phone and WhatsApp",
  phoneHint: "One Kenyan mobile number, used for both calls and WhatsApp.",
  phoneInvalid: "Use a Kenyan mobile number, like 0712 345 678.",
  weekOpen: "Monday to Saturday, opens",
  weekClose: "Monday to Saturday, closes",
  sundayOpen: "Sunday, opens",
  sundayClose: "Sunday, closes",
  closesAfterOpens: "Closing time must be after opening time.",
  midnight: "Midnight",
  staffHeading: "Staff",
  staffBody: "Who can sign in to the admin. Owners can also change these shop settings and staff.",
  you: "You",
  noName: "No name yet",
  makeOwner: "Make owner",
  makeAdmin: "Make admin",
  roleHeading: (name: string, role: string) => `Make ${name} ${role}?`,
  makeOwnerBody: "They'll be able to change shop settings and staff.",
  makeAdminBody: "They'll keep products but lose shop settings and staff.",
  remove: "Remove",
  removeLabel: (name: string) => `Remove ${name}`,
  removeHeading: (name: string) => `Remove ${name}?`,
  removeBody: "They lose access straight away. You can add them again later.",
  thisPerson: "this person",
  confirm: "Confirm",
  working: "Working…",
  cancel: "Cancel",
  addHeading: "Add someone",
  addEmail: "Google email",
  addEmailHint: "They sign in with this Google account. It isn't shown anywhere after this.",
  addName: "Name",
  addRole: "Role",
  add: "Add to staff",
  adding: "Adding…",
  added: (name: string) => `${name} can now sign in.`,
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

type SignInReason = (typeof signInReasons)[number];

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
