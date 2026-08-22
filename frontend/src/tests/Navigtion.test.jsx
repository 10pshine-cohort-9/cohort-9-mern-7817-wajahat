import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navigation from "../components/layout/Navigation";

describe("Navigation", () => {
  it("renders both nav items in the desktop sidebar", () => {
    render(<Navigation activeItem="notes" onNavigate={jest.fn()} />);

    expect(screen.getAllByText("All Notes").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Starred").length).toBeGreaterThan(0);
  });

  it("renders the Settings button", () => {
    render(<Navigation activeItem="notes" onNavigate={jest.fn()} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("calls onNavigate with the item id when a desktop nav button is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();
    render(<Navigation activeItem="notes" onNavigate={onNavigate} />);

    const starredButtons = screen.getAllByText("Starred");
    await user.click(starredButtons[0]);

    expect(onNavigate).toHaveBeenCalledWith("starred");
  });

  it("calls onNavigate when a mobile nav button is clicked", async () => {
    const user = userEvent.setup();
    const onNavigate = jest.fn();
    render(<Navigation activeItem="notes" onNavigate={onNavigate} />);

    const starredButtons = screen.getAllByText("Starred");
    await user.click(starredButtons[1]);

    expect(onNavigate).toHaveBeenCalledWith("starred");
  });

  it("does not throw when the Settings button is clicked (no-op)", async () => {
    const user = userEvent.setup();
    render(<Navigation activeItem="notes" onNavigate={jest.fn()} />);

    await expect(user.click(screen.getByText("Settings"))).resolves.not.toThrow();
  });
});