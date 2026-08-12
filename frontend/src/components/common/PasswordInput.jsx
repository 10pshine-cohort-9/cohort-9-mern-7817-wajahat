const PasswordInput = ({
  name,
  placeholder,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) => {
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="auth-input pr-10"
      />

      <button
        type="button"
        onClick={() =>
          setShowPassword((previous) => !previous)
        }
        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-(--color-text-secondary) hover:text-(--color-primary)"
        aria-label={
          showPassword
            ? "Hide password"
            : "Show password"
        }
      >
        {showPassword ? "◉" : "◌"}
      </button>
    </div>
  );
};

export default PasswordInput;