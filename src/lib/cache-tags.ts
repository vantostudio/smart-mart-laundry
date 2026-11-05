/* The tags on server-cached reads. A write calls `revalidateTag` with the same name. */
export const cacheTags = { products: "products", settings: "settings" } as const;
