import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../theme/ThemeContext";

function TestConsumer() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={() => setTheme("dark")}>Set dark</button>
      <button onClick={() => setTheme("not-a-real-theme")}>Set invalid</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <TestConsumer />
    </ThemeProvider>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("style");
  });

  afterEach(() => {
    console.warn.mockRestore();
  });

  it("defaults to the light theme", () => {
    renderWithProvider();
    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("applies the light theme's CSS variables to the document root", () => {
    renderWithProvider();
    expect(document.documentElement.style.getPropertyValue("--color-primary")).toBe("#B4532A");
  });

  it("changeTheme switches to dark and updates the DOM", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Set dark"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.style.getPropertyValue("--color-primary")).toBe("#D06A3A");
  });

  it("changeTheme ignores an unknown theme name and warns", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Set invalid"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(console.warn).toHaveBeenCalledWith("Invalid theme requested: not-a-real-theme");
  });

  it("toggleTheme flips from light to dark", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Toggle"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
  });

  it("toggleTheme flips back from dark to light", async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByText("Toggle"));
    await user.click(screen.getByText("Toggle"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });

  it("useTheme throws when used outside a ThemeProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    function Orphan() {
      useTheme();
      return null;
    }

    expect(() => render(<Orphan />)).toThrow(
      "useTheme must be used inside ThemeProvider"
    );

    console.error.mockRestore();
  });
});