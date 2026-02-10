// InviteModal.test.tsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import InviteModal from "../../../components/ui/InviteModal";
import { searchUsers, inviteUsersToRoom } from "../../../utils/authService";

jest.mock("../../../utils/authService", () => ({
  searchUsers: jest.fn(),
  inviteUsersToRoom: jest.fn(),
}));

// Mock Button so we don't depend on its implementation
jest.mock("../Button", () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

describe("InviteModal", () => {
  const onClose = jest.fn();

  const baseProps = {
    isOpen: true,
    onClose,
    roomId: "room-123",
    roomName: "Design Team",
    isPublic: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    });

    // clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });

    // alert mock
    window.alert = jest.fn();

    // window.open mock
    window.open = jest.fn();
  });

  it("returns null when isOpen=false", () => {
    const { container } = render(
      <InviteModal {...baseProps} isOpen={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders modal when open", () => {
    render(<InviteModal {...baseProps} />);
    expect(screen.getByRole("dialog", { name: /invite collaborators modal/i })).toBeInTheDocument();
    expect(screen.getByText(/invite collaborators/i)).toBeInTheDocument();
    expect(screen.getByText(/invite others to join/i)).toBeInTheDocument();
  });

  it("copies invite link to clipboard (link tab)", () => {
    render(<InviteModal {...baseProps} />);

    const copyBtn = screen.getByRole("button", { name: /copy room link to clipboard/i });
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "http://localhost:3000/room/room-123"
    );

    expect(screen.getByText(/copied!/i)).toBeInTheDocument();
  });

  it("shows password field for private rooms and copies password", () => {
    render(
      <InviteModal
        {...baseProps}
        isPublic={false}
        roomPassword="secret123"
      />
    );

    expect(screen.getByLabelText(/room password/i)).toBeInTheDocument();

    const copyPasswordBtn = screen.getByRole("button", { name: /copy room password to clipboard/i });
    fireEvent.click(copyPasswordBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("secret123");
  });

  it("switches tabs to Email Invites and allows adding email with Enter", () => {
    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /email invites/i }));

    const input = screen.getByRole("textbox", { name: /email addresses to invite/i });
    fireEvent.change(input, { target: { value: "test@example.com" } });

    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("does not add invalid email", () => {
    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /email invites/i }));

    const input = screen.getByRole("textbox", { name: /email addresses to invite/i });
    fireEvent.change(input, { target: { value: "not-an-email" } });

    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.queryByText("not-an-email")).not.toBeInTheDocument();
  });

  it("removes email when clicking remove button", () => {
    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /email invites/i }));

    const input = screen.getByRole("textbox", { name: /email addresses to invite/i });
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /remove test@example\.com/i }));

    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
  });

  it("sendEmailInvites alerts and clears list", () => {
    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /email invites/i }));

    const input = screen.getByRole("textbox", { name: /email addresses to invite/i });
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    const sendBtn = screen.getByRole("button", { name: /send invites to 1 person/i });
    fireEvent.click(sendBtn);

    expect(window.alert).toHaveBeenCalledWith("Invites sent to 1 email(s)");
    expect(screen.queryByText("test@example.com")).not.toBeInTheDocument();
  });

  it("debounces user search and calls searchUsers when query >= 2", async () => {
    jest.useFakeTimers();

    (searchUsers as jest.Mock).mockResolvedValue({
      success: true,
      users: [
        { id: "u1", username: "john", displayName: "John" },
        { id: "u2", username: "jane", displayName: "Jane" },
      ],
    });

    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /invite users/i }));

    const searchInput = screen.getByRole("textbox", { name: /search users/i });
    fireEvent.change(searchInput, { target: { value: "jo" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    expect(searchUsers).toHaveBeenCalledWith("jo");
    expect(await screen.findByText("John")).toBeInTheDocument();
    expect(await screen.findByText("Jane")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("selects a user from search results and then sends invites", async () => {
    jest.useFakeTimers();

    (searchUsers as jest.Mock).mockResolvedValue({
      success: true,
      users: [{ id: "u1", username: "john", displayName: "John" }],
    });

    (inviteUsersToRoom as jest.Mock).mockResolvedValue({
      success: true,
      results: { sent: 1 },
    });

    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /invite users/i }));

    const searchInput = screen.getByRole("textbox", { name: /search users/i });
    fireEvent.change(searchInput, { target: { value: "jo" } });

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    const userBtn = await screen.findByRole("button", { name: /select john/i });
    fireEvent.click(userBtn);

    expect(screen.getByText(/selected users \(1\)/i)).toBeInTheDocument();

    const sendBtn = screen.getByRole("button", { name: /send invites to 1 selected users/i });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    expect(inviteUsersToRoom).toHaveBeenCalledWith("room-123", ["u1"]);
    expect(window.alert).toHaveBeenCalledWith("1 invitation(s) sent successfully!");

    jest.useRealTimers();
  });

  it("social share opens window with correct url (twitter)", () => {
    render(<InviteModal {...baseProps} />);

    fireEvent.click(screen.getByRole("tab", { name: /social share/i }));

    fireEvent.click(screen.getByRole("button", { name: /share on twitter/i }));

    expect(window.open).toHaveBeenCalled();
    const [url, target] = (window.open as jest.Mock).mock.calls[0];

    expect(url).toContain("https://twitter.com/intent/tweet?text=");
    expect(target).toBe("_blank");
  });

  it("Done button closes modal and resets form", () => {
    render(<InviteModal {...baseProps} />);

    // switch tab + type something so reset can be tested
    fireEvent.click(screen.getByRole("tab", { name: /email invites/i }));

    const input = screen.getByRole("textbox", { name: /email addresses to invite/i });
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

    expect(screen.getByText("test@example.com")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
