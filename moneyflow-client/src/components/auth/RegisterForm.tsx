import PasswordInput from "@/components/input/PasswordInput";
import TextInput from "@/components/input/TextInput";
import React, { useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface RegisterFormProps {
  onSwitchTab: () => void;
}

const RegisterForm = ({ onSwitchTab }: RegisterFormProps) => {
  const { register } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreeTerms, setAgreeTerms] = React.useState(false);
  const [touched, setTouched] = React.useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState("");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (touched.name && !name.trim()) e.name = "Name is required";

    if (touched.email && !email.trim()) e.email = "Email is required";
    else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Email is not valid";

    if (touched.password && !password) e.password = "Password is required";
    else if (touched.password && password.length < 8)
      e.password = "Password must be at least 8 characters";

    if (touched.confirmPassword && password !== confirmPassword)
      e.confirmPassword = "Passwords do not match";

    return e;
  }, [name, email, password, confirmPassword, touched]);

  const isValid =
    name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8 &&
    password === confirmPassword &&
    agreeTerms;

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    if (!isValid) return;

    try {
      setLoading(true);
      setServerError("");

      await register(name, email, password);

      navigate("/");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-fade-in"
      noValidate
    >
      <TextInput
        id="req-name"
        label="Full Name"
        value={name}
        onChange={(v) => {
          setName(v);
          touch("name");
        }}
        error={errors.name}
        placeholder="John Doe"
        autoComplete="name"
      />
      <TextInput
        id="req-email"
        label="Email"
        value={email}
        onChange={(v) => {
          setEmail(v);
          touch("email");
        }}
        error={errors.email}
        placeholder="name@example.com"
        autoComplete="email"
      />
      <PasswordInput
        id="req-password"
        label="Password"
        value={password}
        onChange={(v) => {
          setPassword(v);
          touch("password");
        }}
        error={errors.password}
      />
      <PasswordInput
        id="req-confirm-password"
        label="Confirm Password"
        value={confirmPassword}
        onChange={(v) => {
          setConfirmPassword(v);
          touch("confirmPassword");
        }}
        error={errors.confirmPassword}
      />
      {serverError && (
        <p className="text-xs text-destructive animate-fade-in">
          {serverError}
        </p>
      )}

      <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none pt-1">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-border text-primary accent-primary focus:ring-primary"
        />
        <span className="text-muted-foreground leading-snug">
          I agree to the{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
          >
            Terms of Service
          </button>{" "}
          and{" "}
          <button
            type="button"
            className="text-primary hover:underline font-medium"
          >
            Privacy Policy
          </button>
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchTab}
          className="font-semibold text-primary hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  );
};

export default RegisterForm;
