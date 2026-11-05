import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { PublicProduct } from "@/features/products/public";

import { emptyFilters, type Filters } from "./filters";
import { useProduct, useProducts } from "./use-products";

const item = (code: string): PublicProduct => ({
  code,
  name: code,
  category: "ladies",
  condition: "new",
  price: 100,
  sizes: [],
  stock: 1,
  photos: [],
  thumbnail: null,
  note: null,
});

const counts = { ladies: 0, men: 0, shoes: 0 };
const page = (codes: string[], total = codes.length, pageNumber = 1) => ({
  items: codes.map(item),
  page: pageNumber,
  limit: 12,
  total,
  counts,
});

const json = (body: unknown, status = 200) => Response.json(body, { status });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const render = (initial: Filters = emptyFilters) =>
  renderHook(({ filters }) => useProducts(filters), { initialProps: { filters: initial } });

describe("useProducts", () => {
  it("loads the first page", async () => {
    fetchMock.mockResolvedValue(json(page(["A", "B"], 5)));
    const { result } = render();
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items.map((p) => p.code)).toEqual(["A", "B"]);
    expect(result.current.total).toBe(5);
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("/api/products?page=1&limit=12");
  });

  it("never lets the browser reuse an old answer", async () => {
    fetchMock.mockResolvedValue(json(page([])));
    render();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0]?.[1]?.cache).toBe("no-cache");
  });

  it("sends the filters under the API's names", async () => {
    fetchMock.mockResolvedValue(json(page([])));
    render({ ...emptyFilters, q: "denim", cat: "men", cond: "new", size: "M", sort: "price-asc" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/products?page=1&limit=12&q=denim&category=men&condition=new&size=M&sort=price-asc",
    );
  });

  it("ignores a slow answer once the filters have moved on", async () => {
    let answerOld = (_: Response) => {};
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => (answerOld = resolve)));
    fetchMock.mockResolvedValueOnce(json(page(["NEW"])));
    const { result, rerender } = render();

    rerender({ filters: { ...emptyFilters, cat: "men" } });
    await waitFor(() => expect(result.current.items.map((p) => p.code)).toEqual(["NEW"]));

    await act(async () => answerOld(json(page(["OLD"]))));
    expect(result.current.items.map((p) => p.code)).toEqual(["NEW"]);
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(true);
  });

  it("waits for typing to stop before searching", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(json(page([])));
    const { rerender } = render();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fetchMock.mockClear();

    for (const q of ["d", "de", "den"]) {
      rerender({ filters: { ...emptyFilters, q } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("q=den");
    vi.useRealTimers();
  });

  it("keeps the last results on screen while new ones load", async () => {
    fetchMock.mockResolvedValueOnce(json(page(["A"])));
    fetchMock.mockImplementationOnce(() => new Promise(() => {}));
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.loading).toBe(false));

    rerender({ filters: { ...emptyFilters, cat: "men" } });
    expect(result.current.loading).toBe(true);
    expect(result.current.items.map((p) => p.code)).toEqual(["A"]);
  });

  it("reports a failure, then recovers on retry", async () => {
    fetchMock.mockResolvedValueOnce(json({ error: { code: "INTERNAL" } }, 503));
    fetchMock.mockResolvedValueOnce(json(page(["A"])));
    const { result } = render();
    await waitFor(() => expect(result.current.problem).toBe("unavailable"));

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.items).toHaveLength(1));
    expect(result.current.problem).toBeNull();
  });

  it("tells offline from a server failure", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = render();
    await waitFor(() => expect(result.current.problem).toBe("offline"));
  });

  it("treats an answer that isn't JSON as a failure", async () => {
    fetchMock.mockResolvedValue(new Response("<html>", { status: 200 }));
    const { result } = render();
    await waitFor(() => expect(result.current.problem).toBe("unavailable"));
  });

  it("adds the next page, skipping anything already shown", async () => {
    fetchMock.mockResolvedValueOnce(json(page(["A", "B"], 3)));
    fetchMock.mockResolvedValueOnce(json(page(["B", "C"], 3, 2)));
    const { result } = render();
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(() => result.current.loadMore());
    expect(result.current.items.map((p) => p.code)).toEqual(["A", "B", "C"]);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("page=2");
  });

  it("keeps what's loaded when the next page fails", async () => {
    fetchMock.mockResolvedValueOnce(json(page(["A"], 3)));
    fetchMock.mockResolvedValueOnce(json({ error: {} }, 500));
    const { result } = render();
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    await act(() => result.current.loadMore());
    expect(result.current.items).toHaveLength(1);
    expect(result.current.moreProblem).toBe("unavailable");
    expect(result.current.problem).toBeNull();
  });

  it("drops a next page that arrives after the filters changed", async () => {
    fetchMock.mockResolvedValueOnce(json(page(["A"], 3)));
    let answerMore = (_: Response) => {};
    fetchMock.mockImplementationOnce(() => new Promise((resolve) => (answerMore = resolve)));
    fetchMock.mockResolvedValueOnce(json(page(["MEN"])));
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => void result.current.loadMore());
    rerender({ filters: { ...emptyFilters, cat: "men" } });
    await waitFor(() => expect(result.current.items.map((p) => p.code)).toEqual(["MEN"]));
    await act(async () => answerMore(json(page(["OLD"], 3, 2))));
    expect(result.current.items.map((p) => p.code)).toEqual(["MEN"]);
  });
});

describe("useProducts, leaving and coming back", () => {
  it("isn't stuck loading after a next page was cancelled", async () => {
    fetchMock.mockImplementation((url, init) => {
      if (String(url).includes("page=2")) {
        return new Promise((_, reject) =>
          init?.signal?.addEventListener("abort", () => reject(new DOMException("", "AbortError"))),
        );
      }
      return Promise.resolve(json(page(["A"], 3)));
    });
    const { result, rerender } = render();
    await waitFor(() => expect(result.current.items).toHaveLength(1));

    act(() => void result.current.loadMore());
    expect(result.current.loadingMore).toBe(true);

    rerender({ filters: { ...emptyFilters, cat: "men" } });
    await waitFor(() => expect(result.current.loading).toBe(false));
    rerender({ filters: emptyFilters });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.loadingMore).toBe(false);
  });
});

describe("useProduct", () => {
  it("uses a listed product without asking the API", () => {
    const { result } = renderHook(() => useProduct("A", item("A")));
    expect(result.current.product?.code).toBe("A");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does nothing when no item is open", () => {
    const { result } = renderHook(() => useProduct(null, undefined));
    expect(result.current).toMatchObject({ product: null, problem: null });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches a product that isn't listed", async () => {
    fetchMock.mockResolvedValue(json(item("SM-1")));
    const { result } = renderHook(() => useProduct("SM-1", undefined));
    await waitFor(() => expect(result.current.product?.code).toBe("SM-1"));
  });

  it("says when a product has gone, and can retry after a failure", async () => {
    fetchMock.mockResolvedValueOnce(json({}, 404));
    const gone = renderHook(() => useProduct("SM-1", undefined));
    await waitFor(() => expect(gone.result.current.problem).toBe("not-found"));

    fetchMock.mockResolvedValueOnce(json({}, 500));
    fetchMock.mockResolvedValueOnce(json(item("SM-2")));
    const flaky = renderHook(() => useProduct("SM-2", undefined));
    await waitFor(() => expect(flaky.result.current.problem).toBe("unavailable"));
    act(() => flaky.result.current.retry());
    await waitFor(() => expect(flaky.result.current.product?.code).toBe("SM-2"));
  });
});
