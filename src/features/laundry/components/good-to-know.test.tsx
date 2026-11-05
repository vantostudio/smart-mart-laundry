import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { laundryItems, type LaundryItem } from "../data";
import { GoodToKnow } from "./good-to-know";

const extra: LaundryItem = {
  ...laundryItems[0]!,
  id: "basket-huge",
  name: "Huge basket",
  price: 1250,
};

describe("GoodToKnow", () => {
  it("shows prices from the items it's given", () => {
    const items = laundryItems.map((i) => (i.id === "mat-door" ? { ...i, price: 77 } : i));
    render(<GoodToKnow items={items} />);
    expect(screen.getByText("Door mat").closest("li")).toHaveTextContent("KSh 77");
  });

  it("keeps the basket ladder for four baskets", () => {
    render(<GoodToKnow items={laundryItems} />);
    expect(screen.getByRole("list", { name: "Basket prices" }).tagName).toBe("OL");
  });

  it("lists baskets by name when there are too many for the ladder", () => {
    render(<GoodToKnow items={[...laundryItems, extra]} />);
    const list = screen.getByRole("list", { name: "Basket prices" });
    expect(list.tagName).toBe("UL");
    expect(within(list).getByText("Huge basket").closest("li")).toHaveTextContent("KSh 1,250");
  });
});
