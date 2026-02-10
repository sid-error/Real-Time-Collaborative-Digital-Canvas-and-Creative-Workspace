// Modal.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../../../components/ui/Modal";

// Mock lucide icon
jest.mock("lucide-react", () => ({
  X: (props: any) => <svg data-testid="x-icon" {...props} />,
}));

describe("Modal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when isOpen=false", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders modal when isOpen=true", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Accessible Modal">
        <p>Body</p>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
    expect(screen.getByText("Accessible Modal")).toHaveAttribute("id", "modal-title");
  });

  it("calls onClose when clicking close button", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Close Test">
        <p>Body</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when clicking overlay (outside modal content)", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Overlay Test">
        <p>Body</p>
      </Modal>
    );

    // overlay is the element with role="dialog"
    const overlay = screen.getByRole("dialog");

    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClose when clicking inside modal content", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Inside Click Test">
        <button>Inside Button</button>
      </Modal>
    );

    fireEvent.click(screen.getByRole("button", { name: /inside button/i }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed on overlay", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Escape Test">
        <p>Body</p>
      </Modal>
    );

    const overlay = screen.getByRole("dialog");

    fireEvent.keyDown(overlay, { key: "Escape", code: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose for other keys", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Other Key Test">
        <p>Body</p>
      </Modal>
    );

    const overlay = screen.getByRole("dialog");

    fireEvent.keyDown(overlay, { key: "Enter", code: "Enter" });
    fireEvent.keyDown(overlay, { key: "a", code: "KeyA" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("autoFocuses the close button when opened", () => {
    render(
      <Modal isOpen={true} onClose={onClose} title="Focus Test">
        <p>Body</p>
      </Modal>
    );

    const closeBtn = screen.getByRole("button", { name: /close modal/i });
    expect(closeBtn).toHaveFocus();
  });
});
