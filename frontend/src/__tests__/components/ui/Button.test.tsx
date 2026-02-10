import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../../../components/ui/Button";

describe("Button", () => {
  test("renders children when not loading", () => {
    render(<Button>Click Me</Button>);

    expect(screen.getByText("Click Me")).toBeInTheDocument();
    expect(screen.queryByLabelText("Loading")).not.toBeInTheDocument();
  });

  test("shows spinner when isLoading=true", () => {
    render(<Button isLoading>Submit</Button>);

    expect(screen.getByLabelText("Loading")).toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  test("disables button when isLoading=true", () => {
    render(<Button isLoading>Submit</Button>);

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  test("disables button when disabled=true", () => {
    render(<Button disabled>Disabled</Button>);

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  test("calls onClick when clicked", () => {
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("does not call onClick when disabled", () => {
    const onClick = jest.fn();

    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("applies primary variant classes by default", () => {
    render(<Button>Primary</Button>);

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-blue-600");
    expect(btn.className).toContain("text-white");
  });

  test("applies secondary variant classes", () => {
    render(<Button variant="secondary">Secondary</Button>);

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-slate-800");
    expect(btn.className).toContain("text-white");
  });

  test("applies outline variant classes", () => {
    render(<Button variant="outline">Outline</Button>);

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-2");
    expect(btn.className).toContain("text-slate-600");
  });

  test("adds custom className", () => {
    render(<Button className="w-full">Wide</Button>);

    const btn = screen.getByRole("button");
    expect(btn.className).toContain("w-full");
  });
});
