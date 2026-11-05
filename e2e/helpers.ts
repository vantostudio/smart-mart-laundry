import { expect, type Locator, type Page } from "@playwright/test";

export type Viewport = { width: number; height: number; mobile: boolean };

/** `test.use()` options for a viewport; phone and tablet widths are touch devices. */
export const device = ({ width, height, mobile }: Viewport) => ({
  viewport: { width, height },
  isMobile: mobile,
  hasTouch: mobile,
});

export const phone = device({ width: 390, height: 844, mobile: true });

/** The message a WhatsApp link would send: its decoded href. */
export async function whatsappMessage(link: Locator) {
  return decodeURIComponent((await link.getAttribute("href")) ?? "");
}

/**
 * Add a laundry item by tapping its card. A tap that lands before the page has hydrated does
 * nothing, so keep tapping until the card turns into a stepper (it can't add twice: the "Add"
 * button is gone once the item is in the cart).
 */
export async function addLaundryItem(page: Page, name: string) {
  await expect(async () => {
    const add = page.getByRole("button", { name: `Add ${name}` });
    if (await add.isVisible()) await add.click();
    await expect(page.getByRole("button", { name: `Add one ${name}` })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();
}

type Product = {
  code: string;
  name: string;
  category: "ladies" | "men" | "shoes";
  condition: "new" | "mtumba";
  price: number;
  sizes: string[];
  stock: number;
  photos: string[];
  note: string | null;
};

const product = (values: Partial<Product> & Pick<Product, "code" | "name">): Product => ({
  category: "ladies",
  condition: "new",
  price: 450,
  sizes: ["M", "L"],
  stock: 5,
  photos: [],
  note: null,
  ...values,
});

/** 21 products, so the shop has a second page. */
export const shopProducts: Product[] = [
  product({
    code: "SM-1002",
    name: "Oversized hoodie",
    price: 1500,
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    photos: ["/apple-icon"],
  }),
  product({
    code: "SM-1204",
    name: "501 jeans",
    category: "men",
    condition: "mtumba",
    price: 900,
    sizes: ["L"],
    stock: 1,
  }),
  product({
    code: "SM-1001",
    name: "Dark denim jacket",
    category: "men",
    condition: "mtumba",
    price: 1200,
    sizes: ["M", "L"],
  }),
  product({
    code: "SM-1300",
    name: "White sneakers",
    category: "shoes",
    price: 2500,
    sizes: ["42", "43"],
  }),
  product({ code: "SM-1301", name: "Canvas tote", price: 700, sizes: [] }),
  ...Array.from({ length: 16 }, (_, i) =>
    product({ code: `SM-14${String(i).padStart(2, "0")}`, name: `Plain tee ${i + 1}` }),
  ),
];

const priceBands: Record<string, [number, number]> = {
  "under-500": [0, 499],
  "500-1000": [500, 1000],
  "1000-2000": [1001, 2000],
  "2000-plus": [2001, Infinity],
};

function answerList(url: URL, products: Product[]) {
  const param = (name: string) => url.searchParams.get(name);
  const words = (param("q") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const [min, max] = priceBands[param("price") ?? ""] ?? [0, Infinity];
  const everyAisle = products.filter(
    (p) =>
      (!param("condition") || p.condition === param("condition")) &&
      (!param("size") || p.sizes.includes(param("size")!)) &&
      p.price >= min &&
      p.price <= max &&
      words.every((w) => `${p.name} ${p.code}`.toLowerCase().includes(w)),
  );
  const count = (id: string) => everyAisle.filter((p) => p.category === id).length;
  const matches = everyAisle.filter((p) => !param("category") || p.category === param("category"));
  const sort = param("sort");
  if (sort) {
    matches.sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
  }
  const page = Number(param("page"));
  const limit = Number(param("limit"));
  return {
    items: matches.slice((page - 1) * limit, page * limit),
    page,
    limit,
    total: matches.length,
    counts: { ladies: count("ladies"), men: count("men"), shoes: count("shoes") },
  };
}

type ShopApi = {
  products?: Product[];
  /** Every product request answers 503. */
  failing?: boolean;
};

/**
 * Answers the public API in the browser, because browser tests run with no database. Calling it
 * again in a test replaces the answers.
 */
export async function mockShopApi(page: Page, api: ShopApi = {}) {
  const products = api.products ?? shopProducts;
  await page.unroute("**/api/products**").catch(() => {});
  await page.route("**/api/products**", async (route) => {
    if (api.failing) return route.fulfill({ status: 503, json: { error: { code: "INTERNAL" } } });
    const url = new URL(route.request().url());
    const code = /\/api\/products\/(.+)$/.exec(url.pathname)?.[1];
    if (!code) return route.fulfill({ json: answerList(url, products) });
    const found = products.find((p) => p.code.toLowerCase() === code.toLowerCase());
    return found
      ? route.fulfill({ json: found })
      : route.fulfill({ status: 404, json: { error: { code: "NOT_FOUND" } } });
  });
}
