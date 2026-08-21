import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddNoteButton from "../components/notes/AddNoteButton";

describe("AddNoteButton", () => {
  it("renders the button with its label", () => {
    render(<AddNoteButton onClick={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /add new note/i })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<AddNoteButton onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: /add new note/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not throw when clicked without an onClick handler", async () => {
    const user = userEvent.setup();
    render(<AddNoteButton />);

    await expect(
      user.click(screen.getByRole("button", { name: /add new note/i }))
    ).resolves.not.toThrow();
  });
});