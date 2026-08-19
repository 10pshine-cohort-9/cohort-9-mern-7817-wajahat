import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PasswordInput from "../components/common/PasswordInput";

describe("PasswordInput", () => {
  const setup = (overrides = {}) => {
    const props = {
      name: "password",
      placeholder: "Enter password",
      value: "",
      onChange: jest.fn(),
      showPassword: false,
      setShowPassword: jest.fn(),
      ...overrides,
    };
    render(<PasswordInput {...props} />);
    return props;
  };

  it("renders as a password field by default", () => {
    setup();
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders as a text field when showPassword is true", () => {
    setup({ showPassword: true });
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "text");
  });

  it("displays the current value", () => {
    setup({ value: "mysecret" });
    expect(screen.getByPlaceholderText("Enter password")).toHaveValue(
      "mysecret"
    );
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    setup({ onChange });

    await user.type(screen.getByPlaceholderText("Enter password"), "a");

    expect(onChange).toHaveBeenCalled();
  });

  it("toggles visibility when the show/hide button is clicked", async () => {
    const user = userEvent.setup();
    const setShowPassword = jest.fn();
    setup({ showPassword: false, setShowPassword });

    await user.click(screen.getByLabelText("Show password"));

    expect(setShowPassword).toHaveBeenCalledTimes(1);
    const updater = setShowPassword.mock.calls[0][0];
    expect(updater(false)).toBe(true);
  });

  it("has an accessible label that reflects the current state", () => {
    setup({ showPassword: true });
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();
  });
});