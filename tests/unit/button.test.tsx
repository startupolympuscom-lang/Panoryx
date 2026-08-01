import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders as a link when href is provided", () => {
    render(<Button href="/contact">Demander une démo</Button>);
    const link = screen.getByRole("link", { name: "Demander une démo" });
    expect(link).toHaveAttribute("href", "/contact");
  });

  it("renders as a button and handles clicks when no href is provided", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Enregistrer</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables the button when disabled is passed", () => {
    render(<Button disabled>Envoi…</Button>);
    expect(screen.getByRole("button", { name: "Envoi…" })).toBeDisabled();
  });
});
