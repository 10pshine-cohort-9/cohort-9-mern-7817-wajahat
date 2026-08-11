import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import AuthForm from "../components/common/AuthForm";
import PasswordInput from "../components/common/PasswordInput";
import { loginUser, registerUser } from "../services/authService";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const messages = [
    {
      subtitle: "Save the thoughts that actually matter.",
    },
    {
      subtitle: "Turn rough ideas into something worth keeping.",
    },
    {
      subtitle: "Keep your ideas organized, simple, and close.",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(
        (index) => (index + 1) % messages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const clearLoginFields = () => {
    setLoginData({
      email: "",
      password: "",
    });
  };

  const clearSignupFields = () => {
    setSignupData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  };

  const clearAllFields = () => {
    clearLoginFields();
    clearSignupFields();
    setShowPassword(false);
  };

  const switchMode = (signup) => {
    clearAllFields();
    clearMessages();
    setIsSignup(signup);
  };

  const handleLoginChange = (e) => {
    setLoginData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleSignupChange = (e) => {
    setSignupData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    clearMessages();

    const { email, password } = loginData;

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      const response = await loginUser({
        email,
        password,
      });

      console.log("Login response:", response.data);

      setSuccess(
        response.data?.message || "Login successful"
      );

      // We will navigate to the notes page here later.
    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    clearMessages();

    const {
      firstName,
      lastName,
      email,
      password,
    } = signupData;

    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await registerUser({
        firstName,
        lastName,
        email,
        password,
      });

      console.log(
        "Registration response:",
        response.data
      );

      clearSignupFields();
      clearLoginFields();
      setShowPassword(false);

      setIsSignup(false);

      setSuccess(
        response.data?.message ||
          "Account created successfully. Please login."
      );
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create account"
      );
    }
  };

  const handleCancel = () => {
    clearAllFields();
    clearMessages();
  };

  return (
    <main className="grid min-h-screen grid-cols-1 bg-(--color-background) md:grid-cols-2">
        {/* left section */}
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-90 rounded-[28px] border border-(--color-border) bg-(--color-surface) px-7 py-9 shadow-[0_10px_35px_rgba(0,0,0,0.08)] sm:px-8">
         
          <div className="mb-8 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Noto logo"
                className="h-9 w-9 object-contain"
              />

              <span className="text-2xl font-semibold tracking-[0.18em] text-(--color-text)]">
                NOTO
              </span>
            </div>

            <p className="mt-1 text-[10px] text-(--color-text-secondary)">
              Where thoughts take shape.
            </p>
          </div>

          {/* ================= LOGIN ================= */}
          {!isSignup && (
            <AuthForm
              title={
                <>
                  Welcome to{" "}
                  <span className="text-(--color-primary)">
                    Noto
                  </span>
                </>
              }
              onSubmit={handleLogin}
              error={error}
              success={success}
              submitText="Login"
              onCancel={handleCancel}
              fields={
                <>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="auth-input"
                  />

                  <PasswordInput
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />

                  <label className="flex items-center gap-2 px-1 text-[11px] text-(--color-text-secondary)]">
                    <input
                      type="checkbox"
                      className="accent-(--color-primary)]"/>
                    Remember me
                  </label>
                </>
              }
              footer={
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className="font-semibold text-(--color-primary)] hover:underline"
                  >
                    Sign up
                  </button>
                </>
              }
            />
          )}

          {/* ================= SIGNUP ================= */}
          {isSignup && (
            <AuthForm
              title={
                <>
                  Create your{" "}
                  <span className="text-(--color-primary)]">
                    Noto
                  </span>{" "}
                  account
                </>
              }
              onSubmit={handleSignup}
              error={error}
              success={success}
              submitText="Sign Up"
              onCancel={handleCancel}
              fields={
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First name"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      className="auth-input"
                    />

                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last name"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      className="auth-input"
                    />
                  </div>

                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    className="auth-input"
                  />

                  <PasswordInput
                    name="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                  />
                </>
              }
              footer={
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className="font-semibold text-(--color-primary)] hover:underline"
                  >
                    Login
                  </button>
                </>
              }
            />
          )}
        </div>
      </section>
      {/* right section */}
      <section className="hidden min-h-screen items-center justify-center overflow-hidden bg-(--color-background)] px-10 md:flex lg:px-16">
        <div
          key={messageIndex}
          className="w-full max-w-107.5 animate-[fadeIn_0.7s_ease-in-out]"
        >
          {/* Main heading */}
          <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-(--color-text) lg:text-5xl">
            {messageIndex === 0 && (
              <>
                Use{" "}
                <span className="text-(--color-primary)">
                  Noto.
                </span>
              </>
            )}

            {messageIndex === 1 && (
              <>
                Think it.
                <br />
                Write it.
                <br />
                <span className="text-(--color-primary)">
                  Refine it.
                </span>
              </>
            )}

            {messageIndex === 2 && (
              <>
                Where thoughts
                <br />
                <span className="text-(--color-primary)">
                  take shape.
                </span>
              </>
            )}
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-102.5 text-base leading-7 text-(--color-text-secondary) lg:text-lg">
            {messages[messageIndex].subtitle}
          </p>

          {/* Features */}
          <div className="mt-9 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-(--color-primary)]">
                ✓
              </span>
              <span className="text-sm text-(--color-text)] lg:text-base">
                Keep your thoughts organized
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-(--color-primary)]">
                ✓
              </span>
              <span className="text-sm text-(--color-text)] lg:text-base">
                Write, edit and refine your notes
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-(--color-primary)]">
                ✓
              </span>
              <span className="text-sm text-(--color-text)] lg:text-base">
                Star the thoughts that matter most
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center text-(--color-primary)]">
                ✓
              </span>
              <span className="text-sm text-(--color-text)] lg:text-base">
                Keep everything simple and accessible
              </span>
            </div>
          </div>

          {/* Brand line */}
          <div className="mt-10 flex items-center gap-3">
            <div className="h-px w-10 bg-(--color-border)]" />

            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-(--color-text-secondary)]">
              Think it. Write it. Keep it.
            </span>
          </div>

          {/* Animation indicators */}
          <div className="mt-7 flex gap-2">
            {messages.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === messageIndex
                    ? "w-7 bg-(--color-primary)]"
                    : "w-1.5 bg-(--color-border)]"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;