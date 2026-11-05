import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { RefreshOnReturn } from "./refresh-on-return";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const MINUTE = 60_000;

function setVisible(state: "visible" | "hidden") {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
}

beforeEach(() => {
  vi.useFakeTimers();
  refresh.mockReset();
  setVisible("visible");
  render(<RefreshOnReturn />);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const comeBack = () => act(() => void document.dispatchEvent(new Event("visibilitychange")));

describe("RefreshOnReturn", () => {
  it("doesn't reload for a quick look away", () => {
    act(() => void vi.advanceTimersByTime(MINUTE - 1));
    comeBack();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("reloads the data on return after a minute, once", () => {
    act(() => void vi.advanceTimersByTime(MINUTE));
    comeBack();
    act(() => void window.dispatchEvent(new Event("focus")));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("reloads every 5 minutes while the page is open", () => {
    act(() => void vi.advanceTimersByTime(5 * MINUTE));
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the tab is hidden", () => {
    setVisible("hidden");
    act(() => void vi.advanceTimersByTime(20 * MINUTE));
    expect(refresh).not.toHaveBeenCalled();
  });
});
