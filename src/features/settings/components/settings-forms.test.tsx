import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { defaultShopSettings } from "@/config/shop-settings";
import { errorMessages, settingsMessages } from "@/features/admin/messages";

import { ContactForm } from "./contact-form";
import { DeliveryForm } from "./delivery-form";
import { NameForm } from "./name-form";
import { StaffSection } from "./staff-section";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const sent = () => {
  const [url, init] = fetchMock.mock.calls[0]!;
  return { url, method: init?.method, body: JSON.parse(String(init?.body)) };
};

const refuse = (code: string, message: string, field?: string, status = 400) =>
  fetchMock.mockResolvedValue(
    Response.json({ error: { code, message, field, requestId: "r" } }, { status }),
  );

describe("NameForm", () => {
  it("saves the name and refreshes the page", async () => {
    fetchMock.mockResolvedValue(Response.json({ name: "Victor" }));
    render(<NameForm name={null} />);
    await userEvent.type(screen.getByLabelText("Name"), "Victor");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(settingsMessages.saved)).toBeInTheDocument();
    expect(sent()).toMatchObject({
      url: "/api/admin/me",
      method: "PATCH",
      body: { name: "Victor" },
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("shows a refusal on the field and doesn't claim it saved", async () => {
    refuse("VALIDATION", "Check this and try again.", "name");
    render(<NameForm name="" />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Check this and try again.");
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText(settingsMessages.saved)).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it("gives a way back when the session ended", async () => {
    refuse("UNAUTHENTICATED", "Please sign in", undefined, 401);
    render(<NameForm name="Victor" />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("link", { name: "Sign in again" })).toBeInTheDocument();
  });
});

describe("DeliveryForm", () => {
  it("starts from the saved values and sends numbers", async () => {
    fetchMock.mockResolvedValue(Response.json(defaultShopSettings));
    render(<DeliveryForm settings={defaultShopSettings} />);
    const fee = screen.getByLabelText(settingsMessages.deliveryFee);
    expect(fee).toHaveValue("100");

    await userEvent.clear(fee);
    await userEvent.type(fee, "150");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(settingsMessages.savedForShop)).toBeInTheDocument();
    expect(sent().body).toEqual({ deliveryFee: 150, deliveryFreeFrom: 1500 });
  });

  it("sends an empty box for the API to refuse, not zero", async () => {
    refuse("VALIDATION", "Check this and try again.", "deliveryFee");
    render(<DeliveryForm settings={defaultShopSettings} />);
    await userEvent.clear(screen.getByLabelText(settingsMessages.deliveryFee));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByRole("alert");
    expect(sent().body.deliveryFee).toBeNull();
  });
});

describe("after a save", () => {
  it("stops saying Saved once something changes again", async () => {
    fetchMock.mockResolvedValue(Response.json(defaultShopSettings));
    render(<DeliveryForm settings={defaultShopSettings} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText(settingsMessages.savedForShop);

    await userEvent.type(screen.getByLabelText(settingsMessages.deliveryFee), "5");
    expect(screen.queryByText(settingsMessages.savedForShop)).toBeNull();
  });

  it("moves focus to the field that needs fixing", async () => {
    refuse("VALIDATION", "Check this and try again.", "deliveryFreeFrom");
    render(<DeliveryForm settings={defaultShopSettings} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByRole("alert");
    expect(screen.getByLabelText(settingsMessages.deliveryFreeFrom)).toHaveFocus();
  });
});

describe("ContactForm", () => {
  it("offers midnight only as a closing time", () => {
    render(<ContactForm settings={defaultShopSettings} />);
    const options = (label: string) =>
      within(screen.getByLabelText(label))
        .getAllByRole("option")
        .map((o) => o.textContent);
    expect(options(settingsMessages.weekClose)).toContain("Midnight");
    expect(options(settingsMessages.weekOpen)).not.toContain("Midnight");
    expect(options(settingsMessages.weekOpen)[0]).toBe("12:00 AM");
    expect(options(settingsMessages.weekClose)[0]).toBe("1:00 AM");
  });

  it("shows the number readably and sends hours as numbers", async () => {
    fetchMock.mockResolvedValue(Response.json(defaultShopSettings));
    render(<ContactForm settings={defaultShopSettings} />);
    expect(screen.getByLabelText(settingsMessages.phone)).toHaveValue("+254 113 154 708");

    await userEvent.selectOptions(screen.getByLabelText(settingsMessages.weekOpen), "8");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText(settingsMessages.savedForShop);
    expect(sent().body).toEqual({
      phone: "+254 113 154 708",
      weekOpen: 8,
      weekClose: 20,
      sundayOpen: 9,
      sundayClose: 16,
    });
  });

  it("explains a bad number and a closing time before opening", async () => {
    refuse("VALIDATION", "Check this and try again.", "phone");
    const { unmount } = render(<ContactForm settings={defaultShopSettings} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(settingsMessages.phoneInvalid);
    unmount();

    refuse("VALIDATION", "Check this and try again.", "sundayClose");
    render(<ContactForm settings={defaultShopSettings} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(settingsMessages.closesAfterOpens);
  });
});

describe("StaffSection", () => {
  const staff = [
    { id: "me", name: "Amina", role: "owner" as const },
    { id: "other", name: "Baraka", role: "admin" as const },
    { id: "seeded", name: null, role: "admin" as const },
  ];

  const row = (name: string) => screen.getByText(name).closest("li")!;

  it("lists names and roles, with no controls on your own row", () => {
    const { container } = render(<StaffSection staff={staff} adminId="me" />);
    expect(within(row("Amina")).getByText("You")).toBeInTheDocument();
    expect(within(row("Amina")).queryByRole("button")).toBeNull();
    expect(within(row("Baraka")).getByRole("button", { name: "Make owner" })).toBeInTheDocument();
    expect(screen.getByText("No name yet")).toBeInTheDocument();
    expect(container.textContent).not.toContain("@");
  });

  it("asks before removing, then removes and refreshes", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    render(<StaffSection staff={staff} adminId="me" />);
    await userEvent.click(screen.getByRole("button", { name: "Remove Baraka" }));

    const dialog = await screen.findByRole("alertdialog", { name: "Remove Baraka?" });
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Remove" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/staff/other");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("DELETE");
  });

  it("keeps the dialog open to show why it failed", async () => {
    refuse("LAST_OWNER", errorMessages.LAST_OWNER, undefined, 409);
    render(<StaffSection staff={staff} adminId="me" />);
    await userEvent.click(within(row("Baraka")).getByRole("button", { name: "Make owner" }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Confirm" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(errorMessages.LAST_OWNER);
    expect(refresh).not.toHaveBeenCalled();
  });

  it("adds someone, confirms by name and clears the email", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ id: "new", name: "Wanjiru", role: "admin" }, { status: 201 }),
    );
    render(<StaffSection staff={staff} adminId="me" />);
    const email = screen.getByLabelText(settingsMessages.addEmail);
    await userEvent.type(email, "w@example.com");
    await userEvent.type(screen.getByLabelText(settingsMessages.addName), "Wanjiru");
    await userEvent.click(screen.getByRole("button", { name: settingsMessages.add }));

    expect(await screen.findByText("Wanjiru can now sign in.")).toBeInTheDocument();
    expect(sent().body).toEqual({ email: "w@example.com", name: "Wanjiru", role: "admin" });
    expect(email).toHaveValue("");
  });

  it("says what's wrong with the email", async () => {
    refuse("VALIDATION", "Check this and try again.", "email");
    const { unmount } = render(<StaffSection staff={staff} adminId="me" />);
    await userEvent.click(screen.getByRole("button", { name: settingsMessages.add }));
    expect(await screen.findByRole("alert")).toHaveTextContent(errorMessages.VALIDATION);
    unmount();

    refuse("ALREADY_EXISTS", errorMessages.ALREADY_EXISTS, "email", 409);
    render(<StaffSection staff={staff} adminId="me" />);
    await userEvent.click(screen.getByRole("button", { name: settingsMessages.add }));
    expect(await screen.findByRole("alert")).toHaveTextContent(errorMessages.ALREADY_EXISTS);
  });
});
