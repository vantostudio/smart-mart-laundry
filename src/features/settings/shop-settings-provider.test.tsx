import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import { defaultShopSettings, phoneDisplay } from "@/config/shop-settings";

import { ShopSettingsProvider, useOpeningHours, useShopSettings } from "./shop-settings-provider";

function Probe() {
  const { phone } = useShopSettings();
  const [weekdays] = useOpeningHours();
  return (
    <p>
      {phoneDisplay(phone)} opens {weekdays?.open}
    </p>
  );
}

describe("ShopSettingsProvider", () => {
  it("serves the settings it is given from the first render, with no request", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    render(
      <ShopSettingsProvider
        settings={{ ...defaultShopSettings, phone: "254700000001", weekOpen: 8 }}
      >
        <Probe />
      </ShopSettingsProvider>,
    );
    expect(screen.getByText("+254 700 000 001 opens 08:00")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("falls back to the defaults outside a provider", () => {
    render(<Probe />);
    expect(screen.getByText("+254 113 154 708 opens 07:00")).toBeTruthy();
  });
});
